import { useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useSettingsStore } from '../store/settingsStore';
import { calculateWinner, isDraw } from '../utils/calculateWinner';
import { chooseAiMove } from '../utils/aiStrategy';
import { hasReachedTarget } from '../utils/scoreHelpers';

export const useGameLogic = () => {
  const board = useGameStore((state) => state.board);
  const status = useGameStore((state) => state.status);
  const activePlayerIndex = useGameStore((state) => state.activePlayerIndex);
  const boardSize = useSettingsStore((state) => state.boardSize);
  const playerCount = useSettingsStore((state) => state.playerCount);
  const winCondition = useSettingsStore((state) => state.winCondition);
  const targetScore = useSettingsStore((state) => state.targetScore);
  const aiMode = useSettingsStore((state) => state.aiMode);
  const aiDifficulty = useSettingsStore((state) => state.aiDifficulty);
  const players = usePlayerStore((state) => state.players);

  const startMatch = useCallback(() => {
    usePlayerStore.getState().configurePlayers(playerCount, aiMode);
    usePlayerStore.getState().resetScores();
    useGameStore.getState().resetMatch(boardSize);
    useGameStore.getState().startRound(boardSize);
  }, [aiMode, boardSize, playerCount]);

  const resetMatch = useCallback(() => {
    usePlayerStore.getState().resetScores();
    useGameStore.getState().resetMatch(boardSize);
  }, [boardSize]);

  const nextRound = useCallback(() => {
    useGameStore.getState().startRound(boardSize, true);
  }, [boardSize]);

  const makeMove = useCallback(
    (index: number) => {
      const activePlayers = usePlayerStore.getState().players.slice(0, playerCount);
      const game = useGameStore.getState();
      const currentPlayer = activePlayers[game.activePlayerIndex];

      if (!currentPlayer || game.status !== 'playing' || game.board[index]) return;

      const nextBoard = [...game.board];
      nextBoard[index] = currentPlayer.id;
      useGameStore.getState().setBoard(nextBoard);
      useGameStore.getState().setLastMove(index);

      const result = calculateWinner(nextBoard, boardSize, winCondition);
      if (result) {
        usePlayerStore.getState().awardPoint(result.winnerId);
        const nextPlayers = usePlayerStore.getState().players.slice(0, playerCount);
        useGameStore.getState().finishRound('won', result.winnerId, result.line);
        if (hasReachedTarget(nextPlayers, targetScore)) useGameStore.getState().completeMatch();
        return;
      }

      if (isDraw(nextBoard)) {
        useGameStore.getState().finishRound('draw', null);
        return;
      }

      useGameStore.getState().setActivePlayerIndex((game.activePlayerIndex + 1) % activePlayers.length);
    },
    [boardSize, playerCount, targetScore, winCondition]
  );

  useEffect(() => {
    const activePlayers = players.slice(0, playerCount);
    const currentPlayer = activePlayers[activePlayerIndex];
    if (status !== 'playing' || !currentPlayer?.isAI) return;

    const opponentIds = activePlayers.filter((player) => player.id !== currentPlayer.id).map((player) => player.id);
    const timeout = window.setTimeout(() => {
      const move = chooseAiMove(board, currentPlayer.id, opponentIds, boardSize, winCondition, aiDifficulty);
      if (move !== null) makeMove(move);
    }, 420);

    return () => window.clearTimeout(timeout);
  }, [activePlayerIndex, aiDifficulty, board, boardSize, makeMove, playerCount, players, status, winCondition]);

  return { makeMove, startMatch, nextRound, resetMatch };
};
