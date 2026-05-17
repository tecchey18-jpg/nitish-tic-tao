import { randomInt } from 'node:crypto';

const ROOM_TTL_MS = 12 * 60 * 60 * 1000;
const PLAYER_IDS = ['p1', 'p2'];
const memoryRooms = globalThis.__ticTaoRooms ?? new Map();
globalThis.__ticTaoRooms = memoryRooms;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedis = Boolean(redisUrl && redisToken);
const requiresRedis = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const missingRedisMessage =
  'Reliable room storage is not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel, then redeploy.';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  if (payload[0]?.error) throw new Error(payload[0].error);

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
  response.setHeader('Cache-Control', 'no-store, max-age=0, s-maxage=0, must-revalidate');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  response.status(statusCode).json(payload);
};

const buildRoomId = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
};

const createUniqueRoomId = async () => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const roomId = buildRoomId();
    const existingRoom = hasRedis ? await getRoom(roomId) : memoryRooms.get(roomId);
    if (!existingRoom) return roomId;
  }

  throw new Error('Could not allocate room code');
};

const pruneMemoryRooms = () => {
  if (hasRedis) return;

  const now = Date.now();
  for (const [roomId, room] of memoryRooms) {
    if (now - room.updatedAt > ROOM_TTL_MS) memoryRooms.delete(roomId);
  }
};

const getPathParts = (request) => {
  const queryRoomId = Array.isArray(request.query.roomId) ? request.query.roomId[0] : request.query.roomId;
  const queryAction = Array.isArray(request.query.action) ? request.query.action[0] : request.query.action;

  if (queryRoomId) return [String(queryRoomId).toUpperCase(), queryAction ? String(queryAction) : undefined];

  const rawPath = request.query.path;
  if (!rawPath) return [];
  return Array.isArray(rawPath) ? rawPath : [rawPath];
};

const getSinceVersion = (request) => {
  const rawSince = Array.isArray(request.query.since) ? request.query.since[0] : request.query.since;
  if (rawSince === undefined) return null;

  const since = Number(rawSince);
  return Number.isFinite(since) ? since : null;
};

const getBody = (request) => {
  if (!request.body) return {};
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body;
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
    const sinceVersion = getSinceVersion(request);
    const body = getBody(request);

    if (request.method === 'GET' && !roomId) {
      json(response, hasRedis || !requiresRedis ? 200 : 503, {
        ok: hasRedis || !requiresRedis,
        store: hasRedis ? 'redis' : 'memory',
        rooms: hasRedis ? 'redis' : memoryRooms.size,
        message: hasRedis || !requiresRedis ? 'Room API ready' : missingRedisMessage
      });
      return;
    }

    if (requiresRedis && !hasRedis) {
      json(response, 503, { message: missingRedisMessage });
      return;
    }

    if (request.method === 'POST' && !roomId) {
      if (!body.snapshot) {
        json(response, 400, { message: 'Missing game snapshot' });
        return;
      }

      const nextRoomId = await createUniqueRoomId();
      const room = {
        roomId: nextRoomId,
        version: 1,
        snapshot: body.snapshot,
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

    let room = await getRoom(roomId);
    if (!room) {
      json(response, 404, { message: 'Room not found' });
      return;
    }

    if (request.method === 'GET' && !action) {
      if (sinceVersion !== null && room.version <= sinceVersion) {
        for (let attempt = 0; attempt < 120; attempt += 1) {
          await sleep(50);
          const latestRoom = await getRoom(roomId);
          if (!latestRoom) {
            json(response, 404, { message: 'Room not found' });
            return;
          }

          room = latestRoom;
          if (room.version > sinceVersion) break;
        }
      }

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
      if (!room.players.includes(body.playerId)) {
        json(response, 403, { message: 'Player is not in this room' });
        return;
      }
      if (!body.snapshot) {
        json(response, 400, { message: 'Missing game snapshot' });
        return;
      }

      room.snapshot = body.snapshot;
      room.version += 1;
      await saveRoom(room);
      json(response, 200, room);
      return;
    }

    if (request.method === 'POST' && action === 'leave') {
      room.players = room.players.filter((playerId) => playerId !== body.playerId);
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
