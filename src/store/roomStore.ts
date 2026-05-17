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
const fallbackEndpoint = `${protocol}://${window.location.hostname}:8787`;
const roomEndpoint = import.meta.env.VITE_ROOM_SERVER_URL ?? fallbackEndpoint;

let pollTimer: number | null = null;

const normalizeRoomId = (roomId: string) => roomId.trim().toUpperCase();

const samePlayers = (left: PlayerId[], right: PlayerId[]) =>
  left.length === right.length && left.every((playerId, index) => playerId === right[index]);

const stopPolling = () => {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });
  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? 'Room server request failed');
  }

  return payload;
};

const startPolling = (get: () => RoomState, set: (state: Partial<RoomState>) => void) => {
  stopPolling();

  pollTimer = window.setInterval(async () => {
    const { endpoint, roomId, version } = get();
    if (!roomId) return;

    try {
      const state = await requestJson<RoomServerState>(`${endpoint}/rooms/${roomId}?since=${version}`);

      const current = get();
      const snapshotChanged = state.version > current.version;
      const playersChanged = !samePlayers(state.players, current.connectedPlayers);

      if (snapshotChanged) {
        applyRoomSnapshot(state.snapshot);
      }

      if (snapshotChanged || playersChanged || current.connectionState !== 'connected' || current.errorMessage) {
        set({
          connectedPlayers: playersChanged ? state.players : current.connectedPlayers,
          connectionState: 'connected',
          version: state.version,
          errorMessage: null
        });
      }
    } catch (error) {
      set({
        connectionState: 'error',
        errorMessage: error instanceof Error ? error.message : 'Room sync failed'
      });
    }
  }, 850);
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
      const state = await requestJson<RoomServerState>(`${get().endpoint}/rooms`, {
        method: 'POST',
        body: JSON.stringify({ snapshot })
      });

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
      set({
        mode: 'local',
        connectionState: 'error',
        errorMessage: error instanceof Error ? error.message : 'Could not create room'
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
      const state = await requestJson<RoomServerState>(`${get().endpoint}/rooms/${normalizedRoomId}/join`, {
        method: 'POST'
      });

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
      set({
        mode: 'local',
        connectionState: 'error',
        errorMessage: error instanceof Error ? error.message : 'Could not join room'
      });
      return false;
    }
  },
  leaveRoom: () => {
    const { endpoint, roomId, seatPlayerId } = get();
    stopPolling();

    if (roomId && seatPlayerId) {
      void fetch(`${endpoint}/rooms/${roomId}/leave`, {
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
      const state = await requestJson<RoomServerState>(`${endpoint}/rooms/${roomId}/snapshot`, {
        method: 'POST',
        body: JSON.stringify({ playerId: seatPlayerId, snapshot })
      });

      set({
        connectedPlayers: state.players,
        version: state.version,
        connectionState: 'connected',
        errorMessage: null
      });
    } catch (error) {
      set({
        connectionState: 'error',
        errorMessage: error instanceof Error ? error.message : 'Could not send move'
      });
    }
  }
}));
