import type { Player } from '../types/player.types';

export const getLeader = (players: Player[]) =>
  players.reduce<Player | null>((leader, player) => {
    if (!leader || player.score > leader.score) return player;
    return leader;
  }, null);

export const hasReachedTarget = (players: Player[], targetScore: number) =>
  players.some((player) => player.score >= targetScore);
