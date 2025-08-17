import { useState, useEffect, useRef } from 'react';
import './Sudoku.css';

function generateFullBoard(): string[][] {
  const board = Array.from({ length: 6 }, () => Array(6).fill(''));
  const nums = ['1', '2', '3', '4', '5', '6'];
  function fill(row: number, col: number): boolean {
    if (row === 6) return true;
    if (col === 6) return fill(row + 1, 0);
    const shuffled = nums.slice().sort(() => Math.random() - 0.5);
    for (const num of shuffled) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (fill(row, col + 1)) return true;
        board[row][col] = '';
      }
    }
    return false;
  }
  fill(0, 0);
  return board;
}

function isValid(board: string[][], row: number, col: number, value: string): boolean {
  if (typeof value !== 'string') return false;
  for (let j = 0; j < 6; j++) {
    if (j !== col && board[row][j] === value) return false;
  }
  for (let i = 0; i < 6; i++) {
    if (i !== row && board[i][col] === value) return false;
  }
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 2; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (i === row && j === col) continue;
      if (board[i][j] === value) return false;
    }
  }
  return true;
}

function hasUniqueSolution(board: string[][]): boolean {
  let count = 0;
  function solve(bd: string[][]): boolean {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (bd[i][j] === '') {
          for (let num = 1; num <= 6; num++) {
            const value = String(num);
            if (isValid(bd, i, j, value)) {
              bd[i][j] = value;
              if (solve(bd)) {
                count++;
                if (count > 1) return false;
              }
              bd[i][j] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  const copy = board.map(row => [...row]);
  solve(copy);
  return count === 1;
}

function generatePuzzleBoardFromSolution(solution: string[][]): string[][] {
  let puzzle = solution.map(row => [...row]);
  let cells = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      cells.push([i, j]);
    }
  }
  for (let k = cells.length - 1; k > 0; k--) {
    const l = Math.floor(Math.random() * (k + 1));
    [cells[k], cells[l]] = [cells[l], cells[k]];
  }
  for (const [i, j] of cells) {
    const backup = puzzle[i][j];
    puzzle[i][j] = '';
    if (!hasUniqueSolution(puzzle)) {
      puzzle[i][j] = backup;
    }
  }
  return puzzle;
}

function NumberSudoku() {
  const [solutionBoard, setSolutionBoard] = useState<string[][]>(() => generateFullBoard());
  const [initialBoard, setInitialBoard] = useState<string[][]>(() => generatePuzzleBoardFromSolution(solutionBoard));
  const [board, setBoard] = useState<string[][]>(initialBoard);
  // ...existing timer and state logic...
  // ...cell click, number click, and rendering logic (same as classic)...
  // Only highlight cell red if it does not match the solution
  // ...existing code...
  return (
    // ...existing JSX for number sudoku...
  );
}

export default NumberSudoku;
