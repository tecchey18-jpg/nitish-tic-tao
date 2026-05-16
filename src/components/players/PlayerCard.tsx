import { memo } from 'react';
import { Bot } from 'lucide-react';
import type { Player } from '../../types/player.types';
import { AvatarDisplay } from './AvatarDisplay';
import { TurnIndicator } from './TurnIndicator';
import { GlassPanel } from '../ui/GlassPanel';

interface PlayerCardProps {
  player: Player;
  active: boolean;
  winner: boolean;
}

export const PlayerCard = memo(({ player, active, winner }: PlayerCardProps) => (
  <GlassPanel className="p-3">
    <div className="relative z-10 flex items-center gap-3">
      <AvatarDisplay label={player.avatar} color={player.color} mood={winner ? 'winner' : active ? 'active' : 'idle'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-base font-black text-white">{player.name}</h3>
          {player.isAI && <Bot size={15} className="text-cyan" aria-label="AI player" />}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-display text-xl font-black" style={{ color: player.color }}>
            {player.symbol}
          </span>
          <TurnIndicator active={active} color={player.color} />
        </div>
      </div>
      <div className="text-right">
        <div className="font-display text-2xl font-black text-white">{player.score}</div>
        <div className="text-[10px] font-bold uppercase text-slate-400">Score</div>
      </div>
    </div>
  </GlassPanel>
));

PlayerCard.displayName = 'PlayerCard';
