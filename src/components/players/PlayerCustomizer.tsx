import { UserRoundCog } from 'lucide-react';
import { gameConfig } from '../../config/gameConfig';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { GlassPanel } from '../ui/GlassPanel';

export const PlayerCustomizer = () => {
  const playerCount = useSettingsStore((state) => state.playerCount);
  const players = usePlayerStore((state) => state.players);
  const updatePlayer = usePlayerStore((state) => state.updatePlayer);

  return (
    <GlassPanel className="p-4">
      <div className="relative z-10 mb-4 flex items-center gap-2">
        <UserRoundCog size={18} className="text-fuchsia" />
        <h2 className="font-display text-lg font-black text-white">Players</h2>
      </div>
      <div className="relative z-10 space-y-3">
        {players.slice(0, playerCount).map((player, index) => (
          <div key={player.id} className="grid grid-cols-[1fr_64px_52px] gap-2">
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan"
              value={player.name}
              onChange={(event) => updatePlayer(player.id, { name: event.target.value })}
              aria-label={`${player.name} name`}
            />
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-center font-display text-sm font-black text-white outline-none focus:border-cyan"
              value={player.symbol}
              maxLength={2}
              onChange={(event) => updatePlayer(player.id, { symbol: event.target.value || gameConfig.symbols[index] })}
              aria-label={`${player.name} symbol`}
            />
            <input
              className="h-10 rounded-md border border-white/10 bg-white/5 p-1"
              type="color"
              value={player.color}
              onChange={(event) => updatePlayer(player.id, { color: event.target.value })}
              aria-label={`${player.name} color`}
            />
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};
