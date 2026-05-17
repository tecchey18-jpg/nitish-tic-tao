import { useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useRoomStore } from '../store/roomStore';
import { useSettingsStore } from '../store/settingsStore';
import type { GameSettings } from '../types/game.types';
import { calculateWinner, isDraw } from '../utils/calculateWinner';
import { chooseAiMove } from '../utils/aiStrategy';
import { buildRoomSnapshot } from '../utils/roomSnapshot';
import { hasReachedTarget } from '../utils/scoreHelpers';

const syncOnlineSnapshot = () => {
  const room = useRoomStore.getState();
  if (room.mode === 'online') {
    void room.sendSnapshot(buildRoomSnapshot());
  }
};

export const useGameLogic = () => {
  const { makeMove } = useGameActions();
  const board = useGameStore((state) => state.board);
  const status = useGameStore((state) => state.status);
  const activePlayerIndex = useGameStore((state) => state.activePlayerIndex);
  const boardSize = useSettingsStore((state) => state.boardSize);
  const playerCount = useSettingsStore((state) => state.playerCount);
  const winCondition = useSettingsStore((state) => state.winCondition);
  const aiDifficulty = useSettingsStore((state) => state.aiDifficulty);
  const players = usePlayerStore((state) => state.players);

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

  return { makeMove };
};

export const useGameActions = () => {
  const startMatch = useCallback((override: Partial<GameSettings> = {}) => {
    const room = useRoomStore.getState();
    if (room.mode === 'online' && room.role === 'guest') return;

    if (override.playerCount !== undefined) useSettingsStore.getState().setPlayerCount(override.playerCount);
    if (override.boardSize !== undefined) useSettingsStore.getState().setBoardSize(override.boardSize);
    if (override.winCondition !== undefined) useSettingsStore.getState().setWinCondition(override.winCondition);
    if (override.targetScore !== undefined) useSettingsStore.getState().setTargetScore(override.targetScore);
    if (override.aiMode !== undefined) useSettingsStore.getState().setAiMode(override.aiMode);
    if (override.aiDifficulty !== undefined) useSettingsStore.getState().setAiDifficulty(override.aiDifficulty);
    if (override.reducedMotion !== undefined) useSettingsStore.getState().setReducedMotion(override.reducedMotion);

    const settings = useSettingsStore.getState();
    usePlayerStore.getState().configurePlayers(settings.playerCount, settings.aiMode);
    usePlayerStore.getState().resetScores();
    useGameStore.getState().resetMatch(settings.boardSize);
    useGameStore.getState().startRound(settings.boardSize);
    syncOnlineSnapshot();
  }, []);

  const resetMatch = useCallback(() => {
    const room = useRoomStore.getState();
    if (room.mode === 'online' && room.role === 'guest') return;
    const { boardSize } = useSettingsStore.getState();

    usePlayerStore.getState().resetScores();
    useGameStore.getState().resetMatch(boardSize);
    syncOnlineSnapshot();
  }, []);

  const nextRound = useCallback(() => {
    const room = useRoomStore.getState();
    if (room.mode === 'online' && room.role === 'guest') return;
    const { boardSize } = useSettingsStore.getState();

    useGameStore.getState().startRound(boardSize, true);
    syncOnlineSnapshot();
  }, []);

  const makeMove = useCallback(
    (index: number) => {
      const { boardSize, playerCount, targetScore, winCondition } = useSettingsStore.getState();
      const activePlayers = usePlayerStore.getState().players.slice(0, playerCount);
      const game = useGameStore.getState();
      const currentPlayer = activePlayers[game.activePlayerIndex];
      const room = useRoomStore.getState();

      if (!currentPlayer || game.status !== 'playing' || game.board[index]) return;
      if (room.mode === 'online' && room.seatPlayerId !== currentPlayer.id) return;

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
        syncOnlineSnapshot();
        return;
      }

      if (isDraw(nextBoard)) {
        useGameStore.getState().finishRound('draw', null);
        syncOnlineSnapshot();
        return;
      }

      useGameStore.getState().setActivePlayerIndex((game.activePlayerIndex + 1) % activePlayers.length);
      syncOnlineSnapshot();
    },
    []
  );

  return { makeMove, startMatch, nextRound, resetMatch };
};
