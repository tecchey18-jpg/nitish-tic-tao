import { calculateWinner, isDraw } from './calculateWinner';
import type { AiDifficulty, Board } from '../types/game.types';

export const availableMoves = (board: Board) =>
  board.reduce<number[]>((moves, cell, index) => (cell ? moves : [...moves, index]), []);

const randomMove = (board: Board) => {
  const moves = availableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)] ?? null;
};

const findWinningMove = (board: Board, playerId: string, size: number, winCondition: number) => {
  for (const index of availableMoves(board)) {
    const trial = [...board];
    trial[index] = playerId;
    if (calculateWinner(trial, size, winCondition)?.winnerId === playerId) return index;
  }

  return null;
};

const tacticalMove = (board: Board, aiId: string, opponentIds: string[], size: number, winCondition: number) => {
  const winNow = findWinningMove(board, aiId, size, winCondition);
  if (winNow !== null) return winNow;

  for (const opponentId of opponentIds) {
    const block = findWinningMove(board, opponentId, size, winCondition);
    if (block !== null) return block;
  }

  return null;
};

const positionalScore = (index: number, size: number) => {
  const row = Math.floor(index / size);
  const col = index % size;
  const center = (size - 1) / 2;
  const distance = Math.abs(row - center) + Math.abs(col - center);
  const corner = (row === 0 || row === size - 1) && (col === 0 || col === size - 1);
  return (size - distance) * 3 + (corner ? 4 : 0);
};

const windowScore = (board: Board, aiId: string, opponentIds: string[], size: number, winCondition: number) => {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ] as const;
  let score = 0;

  for (let index = 0; index < board.length; index += 1) {
    const row = Math.floor(index / size);
    const col = index % size;

    for (const [rowStep, colStep] of directions) {
      const cells: Board[number][] = [];

      for (let step = 0; step < winCondition; step += 1) {
        const nextRow = row + rowStep * step;
        const nextCol = col + colStep * step;
        if (nextRow < 0 || nextCol < 0 || nextRow >= size || nextCol >= size) break;
        cells.push(board[nextRow * size + nextCol]);
      }

      if (cells.length !== winCondition) continue;
      const aiCount = cells.filter((cell) => cell === aiId).length;
      const opponentCount = cells.filter((cell) => cell && opponentIds.includes(cell)).length;
      if (aiCount && opponentCount) continue;
      score += aiCount ? 10 ** aiCount : 0;
      score -= opponentCount ? 8 ** opponentCount : 0;
    }
  }

  return score;
};

const heuristicMove = (board: Board, aiId: string, opponentIds: string[], size: number, winCondition: number) => {
  const moves = availableMoves(board);
  let bestMove = moves[0] ?? null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const move of moves) {
    const trial = [...board];
    trial[move] = aiId;
    const score = windowScore(trial, aiId, opponentIds, size, winCondition) + positionalScore(move, size);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const minimaxMove = (board: Board, aiId: string, opponentId: string, size: number, winCondition: number) => {
  const scoreBoard = (state: Board, depth: number): number | null => {
    const winner = calculateWinner(state, size, winCondition)?.winnerId;
    if (winner === aiId) return 10 - depth;
    if (winner === opponentId) return depth - 10;
    if (isDraw(state)) return 0;
    return null;
  };

  const minimax = (state: Board, maximizing: boolean, depth: number): number => {
    const terminalScore = scoreBoard(state, depth);
    if (terminalScore !== null) return terminalScore;

    const moves = availableMoves(state);
    let best = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

    for (const move of moves) {
      const trial = [...state];
      trial[move] = maximizing ? aiId : opponentId;
      const score = minimax(trial, !maximizing, depth + 1);
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
    }

    return best;
  };

  let bestMove = randomMove(board);
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const move of availableMoves(board)) {
    const trial = [...board];
    trial[move] = aiId;
    const score = minimax(trial, false, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

export const chooseAiMove = (
  board: Board,
  aiId: string,
  opponentIds: string[],
  size: number,
  winCondition: number,
  difficulty: AiDifficulty
) => {
  if (difficulty === 'easy') return Math.random() < 0.75 ? randomMove(board) : tacticalMove(board, aiId, opponentIds, size, winCondition);

  const tactical = tacticalMove(board, aiId, opponentIds, size, winCondition);
  if (tactical !== null) return tactical;

  if (difficulty === 'normal') {
    const center = Math.floor((size * size) / 2);
    return availableMoves(board).includes(center) ? center : randomMove(board);
  }

  if (difficulty === 'nexus' && size === 3 && opponentIds.length === 1) {
    return minimaxMove(board, aiId, opponentIds[0], size, winCondition);
  }

  return heuristicMove(board, aiId, opponentIds, size, winCondition);
};
