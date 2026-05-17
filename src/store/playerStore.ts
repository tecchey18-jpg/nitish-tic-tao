import { create } from 'zustand';
import { defaultPlayers } from '../config/gameConfig';
import type { Player, PlayerDraft, PlayerId } from '../types/player.types';

interface PlayerState {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  configurePlayers: (count: number, aiMode: boolean) => void;
  updatePlayer: (id: PlayerId, draft: PlayerDraft) => void;
  awardPoint: (id: PlayerId) => void;
  resetScores: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: defaultPlayers,
  setPlayers: (players) => set({ players }),
  configurePlayers: (count, aiMode) =>
    set((state) => ({
      players: state.players.map((player, index) => ({
        ...player,
        isAI: aiMode && index === Math.min(count - 1, 1),
        score: index < count ? player.score : 0
      }))
    })),
  updatePlayer: (id, draft) =>
    set((state) => ({
      players: state.players.map((player) => (player.id === id ? { ...player, ...draft } : player))
    })),
  awardPoint: (id) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, score: player.score + 1 } : player
      )
    })),
  resetScores: () =>
    set((state) => ({
      players: state.players.map((player) => ({ ...player, score: 0 }))
    }))
}));
