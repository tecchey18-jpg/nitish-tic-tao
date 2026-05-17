import { createServer } from 'node:http';
import { randomInt } from 'node:crypto';

const PORT = Number(process.env.ROOM_PORT ?? 8787);
const ROOM_TTL_MS = 12 * 60 * 60 * 1000;
const PLAYER_IDS = ['p1', 'p2'];
const rooms = new Map();

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(payload));
};

const readBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const createRoomId = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let roomId = '';

  do {
    roomId = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
  } while (rooms.has(roomId));

  return roomId;
};

const pruneRooms = () => {
  const now = Date.now();
  for (const [roomId, room] of rooms) {
    if (now - room.updatedAt > ROOM_TTL_MS) rooms.delete(roomId);
  }
};

const getRoomFromPath = (pathname) => {
  const match = pathname.match(/^\/rooms\/([A-Z0-9]{6})(?:\/(join|snapshot|leave))?$/);
  if (!match) return null;
  return { roomId: match[1], action: match[2] ?? null };
};

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    pruneRooms();

    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/health') {
      json(response, 200, { ok: true, rooms: rooms.size });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/rooms') {
      const body = await readBody(request);
      if (!body.snapshot) {
        json(response, 400, { message: 'Missing game snapshot' });
        return;
      }

      const roomId = createRoomId();
      const room = {
        roomId,
        version: 1,
        snapshot: body.snapshot,
        players: ['p1'],
        updatedAt: Date.now()
      };
      rooms.set(roomId, room);
      json(response, 201, { ...room, playerId: 'p1' });
      return;
    }

    const roomPath = getRoomFromPath(url.pathname);
    if (!roomPath) {
      json(response, 404, { message: 'Route not found' });
      return;
    }

    const room = rooms.get(roomPath.roomId);
    if (!room) {
      json(response, 404, { message: 'Room not found' });
      return;
    }

    if (request.method === 'GET' && !roomPath.action) {
      room.updatedAt = Date.now();
      json(response, 200, room);
      return;
    }

    if (request.method === 'POST' && roomPath.action === 'join') {
      const playerId = PLAYER_IDS.find((id) => !room.players.includes(id));
      if (!playerId) {
        json(response, 409, { message: 'Room is full' });
        return;
      }

      room.players.push(playerId);
      room.version += 1;
      room.updatedAt = Date.now();
      json(response, 200, { ...room, playerId });
      return;
    }

    if (request.method === 'POST' && roomPath.action === 'snapshot') {
      const body = await readBody(request);
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
      room.updatedAt = Date.now();
      json(response, 200, room);
      return;
    }

    if (request.method === 'POST' && roomPath.action === 'leave') {
      const body = await readBody(request);
      room.players = room.players.filter((playerId) => playerId !== body.playerId);
      room.version += 1;
      room.updatedAt = Date.now();
      if (room.players.length === 0) rooms.delete(room.roomId);
      json(response, 200, { ok: true });
      return;
    }

    json(response, 405, { message: 'Method not allowed' });
  } catch (error) {
    json(response, 500, { message: error instanceof Error ? error.message : 'Room server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Room server listening on http://0.0.0.0:${PORT}`);
});
