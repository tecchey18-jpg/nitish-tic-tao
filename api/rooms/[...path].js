import { randomInt } from 'node:crypto';

const ROOM_TTL_MS = 12 * 60 * 60 * 1000;
const PLAYER_IDS = ['p1', 'p2'];
const memoryRooms = globalThis.__ticTaoRooms ?? new Map();
globalThis.__ticTaoRooms = memoryRooms;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedis = Boolean(redisUrl && redisToken);

const redisRequest = async (command) => {
  if (!redisUrl || !redisToken) return null;

  const response = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command])
  });

  const payload = await response.json();
  if (!response.ok) throw new Error('Redis room store failed');

  return payload[0]?.result ?? null;
};

const getRoom = async (roomId) => {
  if (!hasRedis) return memoryRooms.get(roomId) ?? null;

  const value = await redisRequest(['GET', `room:${roomId}`]);
  return value ? JSON.parse(value) : null;
};

const saveRoom = async (room) => {
  room.updatedAt = Date.now();

  if (!hasRedis) {
    memoryRooms.set(room.roomId, room);
    return;
  }

  await redisRequest(['SET', `room:${room.roomId}`, JSON.stringify(room), 'PX', ROOM_TTL_MS]);
};

const deleteRoom = async (roomId) => {
  if (!hasRedis) {
    memoryRooms.delete(roomId);
    return;
  }

  await redisRequest(['DEL', `room:${roomId}`]);
};

const json = (response, statusCode, payload) => {
  response.status(statusCode).json(payload);
};

const createRoomId = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let roomId = '';

  do {
    roomId = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
  } while (!hasRedis && memoryRooms.has(roomId));

  return roomId;
};

const pruneMemoryRooms = () => {
  if (hasRedis) return;

  const now = Date.now();
  for (const [roomId, room] of memoryRooms) {
    if (now - room.updatedAt > ROOM_TTL_MS) memoryRooms.delete(roomId);
  }
};

const getPathParts = (request) => {
  const rawPath = request.query.path;
  if (!rawPath) return [];
  return Array.isArray(rawPath) ? rawPath : [rawPath];
};

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  try {
    pruneMemoryRooms();

    const [roomId, action] = getPathParts(request);

    if (request.method === 'GET' && !roomId) {
      json(response, 200, { ok: true, rooms: hasRedis ? 'redis' : memoryRooms.size });
      return;
    }

    if (request.method === 'POST' && !roomId) {
      if (!request.body?.snapshot) {
        json(response, 400, { message: 'Missing game snapshot' });
        return;
      }

      const nextRoomId = createRoomId();
      const room = {
        roomId: nextRoomId,
        version: 1,
        snapshot: request.body.snapshot,
        players: ['p1'],
        updatedAt: Date.now()
      };

      await saveRoom(room);
      json(response, 201, { ...room, playerId: 'p1' });
      return;
    }

    if (!roomId) {
      json(response, 404, { message: 'Route not found' });
      return;
    }

    const room = await getRoom(roomId);
    if (!room) {
      json(response, 404, { message: 'Room not found' });
      return;
    }

    if (request.method === 'GET' && !action) {
      await saveRoom(room);
      json(response, 200, room);
      return;
    }

    if (request.method === 'POST' && action === 'join') {
      const playerId = PLAYER_IDS.find((id) => !room.players.includes(id));
      if (!playerId) {
        json(response, 409, { message: 'Room is full' });
        return;
      }

      room.players.push(playerId);
      room.version += 1;
      await saveRoom(room);
      json(response, 200, { ...room, playerId });
      return;
    }

    if (request.method === 'POST' && action === 'snapshot') {
      if (!room.players.includes(request.body?.playerId)) {
        json(response, 403, { message: 'Player is not in this room' });
        return;
      }
      if (!request.body?.snapshot) {
        json(response, 400, { message: 'Missing game snapshot' });
        return;
      }

      room.snapshot = request.body.snapshot;
      room.version += 1;
      await saveRoom(room);
      json(response, 200, room);
      return;
    }

    if (request.method === 'POST' && action === 'leave') {
      room.players = room.players.filter((playerId) => playerId !== request.body?.playerId);
      room.version += 1;

      if (room.players.length === 0) {
        await deleteRoom(room.roomId);
      } else {
        await saveRoom(room);
      }

      json(response, 200, { ok: true });
      return;
    }

    json(response, 405, { message: 'Method not allowed' });
  } catch (error) {
    json(response, 500, { message: error instanceof Error ? error.message : 'Room API error' });
  }
}
