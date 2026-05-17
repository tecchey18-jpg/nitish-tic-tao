import { create } from 'zustand';
import { applyRoomSnapshot } from '../utils/roomSnapshot';
import type { PlayerId } from '../types/player.types';
import type {
  RoomConnectionState,
  RoomGameSnapshot,
  RoomMode,
  RoomRole,
  RoomServerState
} from '../types/room.types';

interface RoomState {
  endpoint: string;
  mode: RoomMode;
  connectionState: RoomConnectionState;
  roomId: string | null;
  role: RoomRole | null;
  seatPlayerId: PlayerId | null;
  connectedPlayers: PlayerId[];
  version: number;
  errorMessage: string | null;
  createRoom: (snapshot: RoomGameSnapshot) => Promise<boolean>;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendSnapshot: (snapshot: RoomGameSnapshot) => Promise<void>;
}

const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
const localRoomEndpoint = `${protocol}://${hostname}:8787`;
const deployedRoomEndpoint = `${window.location.origin}/api/rooms`;
const fallbackEndpoint = import.meta.env.DEV ? localRoomEndpoint : deployedRoomEndpoint;
const configuredRoomEndpoint = (import.meta.env.VITE_ROOM_SERVER_URL ?? fallbackEndpoint).replace(/\/$/, '');
const roomEndpoint = configuredRoomEndpoint.endsWith('/api')
  ? `${configuredRoomEndpoint}/rooms`
  : configuredRoomEndpoint;

let pollTimer: number | null = null;
let polling = false;

const normalizeRoomId = (roomId: string) => roomId.trim().toUpperCase();

const samePlayers = (left: PlayerId[] = [], right: PlayerId[] = []) =>
  left.length === right.length && left.every((playerId, index) => playerId === right[index]);

const usesQueryApi = (endpoint: string) => endpoint.includes('/api/rooms');

const roomUrl = (endpoint: string, roomId?: string, action?: string, since?: number) => {
  if (usesQueryApi(endpoint)) {
    const url = new URL(endpoint, window.location.origin);
    if (roomId) url.searchParams.set('roomId', roomId);
    if (action) url.searchParams.set('action', action);
    if (since !== undefined) url.searchParams.set('since', String(since));
    return url.toString();
  }

  const baseUrl = endpoint.endsWith('/rooms') ? endpoint : `${endpoint}/rooms`;
  const pathUrl = `${baseUrl}${roomId ? `/${roomId}` : ''}${action ? `/${action}` : ''}`;
  return since !== undefined ? `${pathUrl}?since=${since}` : pathUrl;
};

const stopPolling = () => {
  polling = false;
  if (pollTimer !== null) {
    window.clearTimeout(pollTimer);
    pollTimer = null;
  }
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...init?.headers
    }
  });
  const text = await response.text();
  const payload = (text ? JSON.parse(text) : {}) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? 'Room server request failed');
  }

  return payload;
};

const normalizeRoomState = (state: RoomServerState): RoomServerState => {
  if (!state?.roomId || !state?.snapshot) {
    throw new Error('Room response is incomplete. Redeploy the latest room API and try again.');
  }

  return {
    ...state,
    players: Array.isArray(state.players) ? state.players : [],
    version: Number.isFinite(state.version) ? state.version : 0
  };
};

const roomServerError = (endpoint: string, fallback: string, error: unknown) => {
  const detail = error instanceof Error ? error.message : fallback;
  if (detail === 'Failed to fetch' || detail.includes('fetch')) {
    return import.meta.env.DEV
      ? `Room server not reachable at ${endpoint}. Run npm run dev and use the Vite URL from that terminal.`
      : `Room server not reachable at ${endpoint}. Redeploy the latest code so Vercel includes the /api/rooms function.`;
  }

  return detail || fallback;
};

const startPolling = (get: () => RoomState, set: (state: Partial<RoomState>) => void) => {
  stopPolling();
  polling = true;

  const poll = async () => {
    if (!polling) return;
    const { endpoint, roomId, version } = get();
    if (!roomId) {
      stopPolling();
      return;
    }

    try {
      const state = normalizeRoomState(
        await requestJson<RoomServerState>(roomUrl(endpoint, roomId, undefined, version))
      );

      const current = get();
      const snapshotChanged = state.version > current.version;
      const playersChanged = !samePlayers(state.players, current.connectedPlayers);

      if (snapshotChanged) {
        applyRoomSnapshot(state.snapshot);
      }

      if (snapshotChanged || playersChanged || current.connectionState !== 'connected' || current.errorMessage) {
        set({
          connectedPlayers: playersChanged ? state.players : current.connectedPlayers ?? [],
          connectionState: 'connected',
          version: state.version,
          errorMessage: null
        });
      }

      if (polling) pollTimer = window.setTimeout(poll, 120);
    } catch (error) {
      const { endpoint } = get();
      set({
        connectionState: 'error',
        errorMessage: roomServerError(endpoint, 'Room sync failed', error)
      });
      if (polling) pollTimer = window.setTimeout(poll, 1200);
    }
  };

  pollTimer = window.setTimeout(poll, 80);
};

export const useRoomStore = create<RoomState>((set, get) => ({
  endpoint: roomEndpoint,
  mode: 'local',
  connectionState: 'idle',
  roomId: null,
  role: null,
  seatPlayerId: null,
  connectedPlayers: [],
  version: 0,
  errorMessage: null,
  createRoom: async (snapshot) => {
    stopPolling();
    set({ connectionState: 'connecting', errorMessage: null });

    try {
      const state = normalizeRoomState(
        await requestJson<RoomServerState>(roomUrl(get().endpoint), {
          method: 'POST',
          body: JSON.stringify({ snapshot })
        })
      );

      set({
        mode: 'online',
        connectionState: 'connected',
        roomId: state.roomId,
        role: 'host',
        seatPlayerId: state.playerId,
        connectedPlayers: state.players,
        version: state.version,
        errorMessage: null
      });
      startPolling(get, set);
      return true;
    } catch (error) {
      const { endpoint } = get();
      set({
        mode: 'local',
        connectionState: 'error',
        errorMessage: roomServerError(endpoint, 'Could not create room', error)
      });
      return false;
    }
  },
  joinRoom: async (roomId) => {
    const normalizedRoomId = normalizeRoomId(roomId);
    if (!normalizedRoomId) {
      set({ connectionState: 'error', errorMessage: 'Enter a room code first' });
      return false;
    }

    stopPolling();
    set({ connectionState: 'connecting', errorMessage: null });

    try {
      const state = normalizeRoomState(
        await requestJson<RoomServerState>(roomUrl(get().endpoint, normalizedRoomId, 'join'), {
          method: 'POST'
        })
      );

      applyRoomSnapshot(state.snapshot);
      set({
        mode: 'online',
        connectionState: 'connected',
        roomId: state.roomId,
        role: 'guest',
        seatPlayerId: state.playerId,
        connectedPlayers: state.players,
        version: state.version,
        errorMessage: null
      });
      startPolling(get, set);
      return true;
    } catch (error) {
      const { endpoint } = get();
      set({
        mode: 'local',
        connectionState: 'error',
        errorMessage: roomServerError(endpoint, 'Could not join room', error)
      });
      return false;
    }
  },
  leaveRoom: () => {
    const { endpoint, roomId, seatPlayerId } = get();
    stopPolling();

    if (roomId && seatPlayerId) {
      void fetch(roomUrl(endpoint, roomId, 'leave'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: seatPlayerId })
      });
    }

    set({
      mode: 'local',
      connectionState: 'idle',
      roomId: null,
      role: null,
      seatPlayerId: null,
      connectedPlayers: [],
      version: 0,
      errorMessage: null
    });
  },
  sendSnapshot: async (snapshot) => {
    const { endpoint, roomId, seatPlayerId, mode } = get();
    if (mode !== 'online' || !roomId || !seatPlayerId) return;

    try {
      const state = normalizeRoomState(
        await requestJson<RoomServerState>(roomUrl(endpoint, roomId, 'snapshot'), {
          method: 'POST',
          body: JSON.stringify({ playerId: seatPlayerId, snapshot })
        })
      );

      set({
        connectedPlayers: state.players,
        version: state.version,
        connectionState: 'connected',
        errorMessage: null
      });
    } catch (error) {
      const { endpoint } = get();
      set({
        connectionState: 'error',
        errorMessage: roomServerError(endpoint, 'Could not send move', error)
      });
    }
  }
}));
