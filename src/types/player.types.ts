export type PlayerId = string;

export type AvatarMood = 'idle' | 'active' | 'winner' | 'lost';

export interface Player {
  id: PlayerId;
  name: string;
  symbol: string;
  color: string;
  avatar: string;
  score: number;
  isAI: boolean;
}

export interface PlayerDraft {
  name?: string;
  symbol?: string;
  color?: string;
  avatar?: string;
  isAI?: boolean;
}
