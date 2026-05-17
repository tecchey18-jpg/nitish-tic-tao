import { memo } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { ExplosionEffect } from '../effects/ExplosionEffect';
import { RippleEffect } from '../effects/RippleEffect';
import { WinLineEffect } from './WinLineEffect';
import { glowStyle } from '../../utils/animationHelpers';

interface BoardCellProps {
  index: number;
  value: string | null;
  disabled: boolean;
  isLastMove: boolean;
  isWinning: boolean;
  activeColor: string;
  onMove: (index: number) => void;
}

const BoardCellComponent = ({
  index,
  value,
  disabled,
  isLastMove,
  isWinning,
  activeColor,
  onMove
}: BoardCellProps) => {
  const player = usePlayerStore((state) => state.players.find((item) => item.id === value));
  const color = player?.color ?? activeColor;

  return (
    <motion.button
      className="group relative aspect-square rounded-lg border border-white/12 bg-white/[0.045] p-1 text-center backdrop-blur-sm will-change-transform"
      onClick={() => onMove(index)}
      disabled={disabled || Boolean(value)}
      whileHover={!disabled && !value ? { scale: 1.035, y: -2 } : undefined}
      whileTap={!disabled && !value ? { scale: 0.96 } : undefined}
      style={value ? glowStyle(color, 0.34) : undefined}
      aria-label={`Cell ${index + 1}${player ? ` occupied by ${player.name}` : ''}`}
    >
      <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-70" />
      <RippleEffect color={color} active={isLastMove} />
      <ExplosionEffect color={color} active={isLastMove} />
      <WinLineEffect active={isWinning} color={color} />
      {player && (
        <motion.span
          className="relative z-10 grid h-full place-items-center font-display text-3xl font-black sm:text-5xl"
          style={{ color, textShadow: `0 0 22px ${color}` }}
          initial={{ scale: 0, rotate: -18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 20 }}
        >
          {player.symbol}
        </motion.span>
      )}
      {!value && (
        <span className="absolute inset-2 rounded-md opacity-0 ring-1 ring-cyan/50 transition-opacity group-hover:opacity-100" />
      )}
    </motion.button>
  );
};

const propsAreEqual = (prev: BoardCellProps, next: BoardCellProps) => {
  const sameOccupant = prev.value === next.value;
  const sameState =
    prev.disabled === next.disabled &&
    prev.isLastMove === next.isLastMove &&
    prev.isWinning === next.isWinning &&
    prev.onMove === next.onMove;

  if (!sameOccupant || !sameState) return false;

  return true;
};

export const BoardCell = memo(BoardCellComponent, propsAreEqual);

BoardCell.displayName = 'BoardCell';
