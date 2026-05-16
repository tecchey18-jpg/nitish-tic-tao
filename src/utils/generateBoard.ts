import type { Board, BoardPosition } from '../types/game.types';

export const generateBoard = (size: number): Board => Array<CellValue>(size * size).fill(null);

type CellValue = Board[number];

export const toIndex = ({ row, col }: BoardPosition, size: number) => row * size + col;

export const toPosition = (index: number, size: number): BoardPosition => ({
  row: Math.floor(index / size),
  col: index % size
});
