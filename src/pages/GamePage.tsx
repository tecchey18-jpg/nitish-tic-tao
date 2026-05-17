import { Play, RotateCcw, Settings } from 'lucide-react';
import { CameraShake } from '../components/effects/CameraShake';
import { GameBoard } from '../components/board/GameBoard';
import { PlayerCard } from '../components/players/PlayerCard';
import { MatchProgress } from '../components/score/MatchProgress';
import { RoundHistory } from '../components/score/RoundHistory';
import { ScoreBoard } from '../components/score/ScoreBoard';
import { VictoryScene } from '../components/celebration/VictoryScene';
import { NeonButton } from '../components/ui/NeonButton';
import { RoomPanel } from '../components/online/RoomPanel';
import { ArenaControls } from '../features/game/ArenaControls';
import { useGameActions } from '../hooks/useGameLogic';
import { usePlayerTurns } from '../hooks/usePlayerTurns';
import { useGameStore } from '../store/gameStore';
import { useRoomStore } from '../store/roomStore';
import { useUiStore } from '../store/uiStore';

export const GamePage = () => {
  const status = useGameStore((state) => state.status);
  const winnerId = useGameStore((state) => state.winnerId);
  const roomMode = useRoomStore((state) => state.mode);
  const roomRole = useRoomStore((state) => state.role);
  const setPage = useUiStore((state) => state.setPage);
  const { startMatch, resetMatch } = useGameActions();
  const { activePlayers, activePlayerIndex } = usePlayerTurns();
  const onlineGuest = roomMode === 'online' && roomRole === 'guest';

  return (
    <CameraShake>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="grid content-start gap-3">
          {activePlayers.map((player, index) => (
            <PlayerCard key={player.id} player={player} active={index === activePlayerIndex} winner={winnerId === player.id} />
          ))}
        </aside>

        <section className="grid content-start gap-5">
          <MatchProgress />
          <GameBoard />
          <RoundHistory />
        </section>

        <aside className="grid content-start gap-4">
          <div className="grid grid-cols-2 gap-3">
            <NeonButton onClick={() => startMatch()} disabled={status === 'playing' || onlineGuest}>
              <Play size={16} />
              Start
            </NeonButton>
            <NeonButton variant="danger" onClick={resetMatch} disabled={onlineGuest}>
              <RotateCcw size={16} />
              Reset
            </NeonButton>
          </div>
          <NeonButton variant="ghost" onClick={() => setPage('settings')}>
            <Settings size={16} />
            Settings
          </NeonButton>
          <RoomPanel compact />
          <ArenaControls compact />
          <ScoreBoard />
        </aside>
      </div>
      <VictoryScene />
    </CameraShake>
  );
};
