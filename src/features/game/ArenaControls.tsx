import type { ReactNode } from 'react';
import { Bot, Grid3X3, Target, Users } from 'lucide-react';
import { gameConfig } from '../../config/gameConfig';
import { useSettingsStore } from '../../store/settingsStore';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { cx } from '../../utils/animationHelpers';
import type { AiDifficulty } from '../../types/game.types';

interface ArenaControlsProps {
  compact?: boolean;
}

const ControlRow = ({
  icon,
  label,
  children
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[86px_minmax(0,1fr)] items-center gap-3 border-b border-white/8 py-3 last:border-b-0">
    <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-300">
      {icon}
      {label}
    </span>
    {children}
  </div>
);

const Stepper = ({
  value,
  min,
  max,
  onChange
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <div className="grid grid-cols-[36px_1fr_36px] overflow-hidden rounded-md border border-white/10 bg-white/5">
    <button className="text-lg font-black text-cyan disabled:opacity-35" disabled={value <= min} onClick={() => onChange(value - 1)}>
      -
    </button>
    <span className="grid place-items-center border-x border-white/10 font-display text-sm font-black text-white">{value}</span>
    <button className="text-lg font-black text-cyan disabled:opacity-35" disabled={value >= max} onClick={() => onChange(value + 1)}>
      +
    </button>
  </div>
);

const DifficultySelector = ({
  value,
  disabled,
  onChange
}: {
  value: AiDifficulty;
  disabled: boolean;
  onChange: (value: AiDifficulty) => void;
}) => (
  <div className={cx('grid grid-cols-2 gap-2 sm:grid-cols-4', disabled && 'opacity-45')}>
    {gameConfig.aiDifficulties.map((difficulty) => (
      <button
        key={difficulty}
        className={cx(
          'rounded-md border px-2 py-2 font-display text-[10px] font-black uppercase transition-colors',
          value === difficulty
            ? 'border-cyan bg-cyan/16 text-cyan shadow-[0_0_18px_rgba(0,245,255,.24)]'
            : 'border-white/10 bg-white/5 text-slate-300'
        )}
        disabled={disabled}
        onClick={() => onChange(difficulty)}
      >
        {difficulty}
      </button>
    ))}
  </div>
);

export const ArenaControls = ({ compact = false }: ArenaControlsProps) => {
  const playerCount = useSettingsStore((state) => state.playerCount);
  const boardSize = useSettingsStore((state) => state.boardSize);
  const winCondition = useSettingsStore((state) => state.winCondition);
  const targetScore = useSettingsStore((state) => state.targetScore);
  const aiMode = useSettingsStore((state) => state.aiMode);
  const aiDifficulty = useSettingsStore((state) => state.aiDifficulty);
  const setPlayerCount = useSettingsStore((state) => state.setPlayerCount);
  const setBoardSize = useSettingsStore((state) => state.setBoardSize);
  const setWinCondition = useSettingsStore((state) => state.setWinCondition);
  const setTargetScore = useSettingsStore((state) => state.setTargetScore);
  const setAiMode = useSettingsStore((state) => state.setAiMode);
  const setAiDifficulty = useSettingsStore((state) => state.setAiDifficulty);

  return (
    <GlassPanel className={compact ? 'p-4' : 'p-5'}>
      <div className="relative z-10 mb-2 flex items-center gap-2">
        <Grid3X3 size={18} className="text-cyan" />
        <h2 className="font-display text-lg font-black text-white">Arena Controls</h2>
      </div>
      <div className="relative z-10">
        <ControlRow icon={<Users size={16} className="text-fuchsia" />} label="Players">
          <Stepper
            value={playerCount}
            min={gameConfig.minPlayers}
            max={gameConfig.maxPlayers}
            onChange={setPlayerCount}
          />
        </ControlRow>
        <ControlRow icon={<Grid3X3 size={16} className="text-cyan" />} label="Board">
          <Stepper
            value={boardSize}
            min={gameConfig.minBoardSize}
            max={gameConfig.maxBoardSize}
            onChange={setBoardSize}
          />
        </ControlRow>
        <ControlRow icon={<Target size={16} className="text-limepulse" />} label="Win">
          <Stepper value={winCondition} min={3} max={boardSize} onChange={setWinCondition} />
        </ControlRow>
        <ControlRow icon={<Target size={16} className="text-solar" />} label="Target">
          <Stepper value={targetScore} min={1} max={20} onChange={setTargetScore} />
        </ControlRow>
        <ControlRow icon={<Bot size={16} className="text-fuchsia" />} label="AI">
          <button
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-display text-xs font-black uppercase text-cyan"
            onClick={() => setAiMode(!aiMode)}
          >
            {aiMode ? 'Enabled' : 'Disabled'}
          </button>
        </ControlRow>
        <ControlRow icon={<Bot size={16} className="text-cyan" />} label="Level">
          <DifficultySelector value={aiDifficulty} disabled={!aiMode} onChange={setAiDifficulty} />
        </ControlRow>
      </div>
    </GlassPanel>
  );
};
