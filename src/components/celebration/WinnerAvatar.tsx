import type { Player } from '../../types/player.types';
import { AvatarDisplay } from '../players/AvatarDisplay';

interface WinnerAvatarProps {
  winner: Player;
}

export const WinnerAvatar = ({ winner }: WinnerAvatarProps) => (
  <div className="flex flex-col items-center gap-4">
    <AvatarDisplay label={winner.avatar} color={winner.color} mood="winner" />
    <div className="text-center">
      <p className="text-xs font-bold uppercase text-slate-300">Winner</p>
      <h2 className="font-display text-4xl font-black text-white" style={{ textShadow: `0 0 28px ${winner.color}` }}>
        {winner.name}
      </h2>
    </div>
  </div>
);
