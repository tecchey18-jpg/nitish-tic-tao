import { memo } from 'react';
import { motion } from 'framer-motion';
import { useBoardEffects } from '../../hooks/useBoardEffects';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { BoardCell } from './BoardCell';
import { BoardGlow } from './BoardGlow';

export const GameBoard = memo(() => {
  const board = useGameStore((state) => state.board);
  const status = useGameStore((state) => state.status);
  const boardSize = useSettingsStore((state) => state.boardSize);
  const { makeMove } = useGameLogic();
  const { activeColor, lastMove, winningSet } = useBoardEffects();
  const disabled = status !== 'playing';

  return (
    <section className="relative mx-auto w-full max-w-[min(86vw,620px)]">
      <BoardGlow color={activeColor} />
      <motion.div
        className="relative z-10 grid gap-2 rounded-xl border border-cyan/25 bg-black/26 p-3 shadow-neon backdrop-blur-md sm:gap-3 sm:p-4"
        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        layout
      >
        {board.map((value, index) => (
          <BoardCell
            key={index}
            index={index}
            value={value}
            disabled={disabled}
            isLastMove={lastMove === index}
            isWinning={winningSet.has(index)}
            activeColor={activeColor}
            onMove={makeMove}
          />
        ))}
      </motion.div>
    </section>
  );
});

GameBoard.displayName = 'GameBoard';
