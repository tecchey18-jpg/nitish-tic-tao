import type { Player } from '../types/player.types';

export const gameConfig = {
  minPlayers: 2,
  maxPlayers: 4,
  minBoardSize: 3,
  maxBoardSize: 7,
  defaultBoardSizeByPlayers: {
    2: 3,
    3: 4,
    4: 5
  },
  symbols: ['X', 'O', '△', '◇'],
  targetScores: [3, 5, 7, 10],
  aiDifficulties: ['easy', 'normal', 'hard', 'nexus'],
  avatars: ['VX', 'OR', 'NOVA', 'KAI']
} as const;

export const defaultPlayers: Player[] = [
  { id: 'p1', name: 'Vex', symbol: 'X', color: '#00f5ff', avatar: 'VX', score: 0, isAI: false },
  { id: 'p2', name: 'Orion', symbol: 'O', color: '#ff2bd6', avatar: 'OR', score: 0, isAI: false },
  { id: 'p3', name: 'Nova', symbol: '△', color: '#9cff2e', avatar: 'NOVA', score: 0, isAI: false },
  { id: 'p4', name: 'Kai', symbol: '◇', color: '#ffbd3d', avatar: 'KAI', score: 0, isAI: false }
];
