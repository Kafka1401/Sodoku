import { useState } from 'react';
import './Sudoku.css';

const SHAPES = [
  'triangle',    // red
  'cross',       // orange
  'square',      // blue
  'circle',      // yellow
  'pentagon',    // purple
  'hexagon'      // green
];

const SHAPE_COLORS: Record<string, string> = {
  triangle: '#d32f2f',   // red
  cross: '#ff9800',      // orange
  square: '#1976d2',     // blue
  circle: '#ffd600',     // yellow
  pentagon: '#8e24aa',   // purple
  hexagon: '#388e3c'     // green
};

function renderShape(shape: string) {
  switch (shape) {
    case 'triangle':
      return <svg width="28" height="28"><polygon points="14,4 24,24 4,24" fill={SHAPE_COLORS.triangle} /></svg>;
    case 'cross':
      return <svg width="28" height="28"><rect x="12" y="4" width="4" height="20" fill={SHAPE_COLORS.cross} /><rect x="4" y="12" width="20" height="4" fill={SHAPE_COLORS.cross} /></svg>;
    case 'square':
      return <svg width="28" height="28"><rect x="6" y="6" width="16" height="16" fill={SHAPE_COLORS.square} /></svg>;
    case 'circle':
      return <svg width="28" height="28"><circle cx="14" cy="14" r="10" fill={SHAPE_COLORS.circle} /></svg>;
    case 'pentagon':
      return <svg width="28" height="28"><polygon points="14,4 24,12 19,24 9,24 4,12" fill={SHAPE_COLORS.pentagon} /></svg>;
    case 'hexagon':
      return <svg width="28" height="28"><polygon points="14,4 24,10 24,20 14,26 4,20 4,10" fill={SHAPE_COLORS.hexagon} /></svg>;
    default:
      return null;
  }
}

function generateFullBoard(): string[][] {
  const board = Array.from({ length: 6 }, () => Array(6).fill(''));
  function fill(row: number, col: number): boolean {
    if (row === 6) return true;
    if (col === 6) return fill(row + 1, 0);
    const shuffled = SHAPES.slice().sort(() => Math.random() - 0.5);
    for (const shape of shuffled) {
      if (isValid(board, row, col, shape)) {
        board[row][col] = shape;
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
  if (!value) return false;
  for (let j = 0; j < 6; j++) {
    if (j !== col && board[row][j] === value) return false;
  }
  for (let i = 0; i < 6; i++) {
    if (i !== row && board[i][col] === value) return false;
  }
  // Check 2x3 box
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
          for (const shape of SHAPES) {
            if (isValid(bd, i, j, shape)) {
              bd[i][j] = shape;
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

const ShapeSudoku = () => {
  const [solutionBoard] = useState<string[][]>(() => generateFullBoard());
  const [initialBoard] = useState<string[][]>(() => generatePuzzleBoardFromSolution(solutionBoard));
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== '') return;
    setSelectedCell({ row, col });
  };

  const handleShapeClick = (shape: string) => {
    setSelectedShape(shape);
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== '') return;
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? shape : cell))
    );
    setBoard(newBoard);
  };

  return (
    <div className="sudoku-container">
      <h2>6x6 Shapes Sudoku</h2>
      <table className="sudoku-board">
        <tbody>
          {board.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const isPrefilled = initialBoard[i][j] !== '';
                const isIncorrect = !isPrefilled && cell !== '' && (cell !== solutionBoard[i][j] || !isValid(board, i, j, cell));
                let cellClass = '';
                if (i % 2 === 1 && i !== 5) cellClass += ' bold-bottom';
                if (j % 3 === 2 && j !== 5) cellClass += ' bold-right';
                if (i === 0) cellClass += ' bold-top';
                if (i === 5) cellClass += ' bold-bottom';
                if (j === 0) cellClass += ' bold-left';
                if (j === 5) cellClass += ' bold-right';
                if (isPrefilled) cellClass += ' prefilled';
                if (isIncorrect) cellClass += ' invalid';
                if (selectedCell && selectedCell.row === i && selectedCell.col === j) cellClass += ' selected';
                const displayValue = isPrefilled ? initialBoard[i][j] : cell;
                return (
                  <td key={j} className={cellClass.trim()} onClick={() => handleCellClick(i, j)}>
                    {displayValue ? renderShape(displayValue) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="number-array-2x3">
        <table>
          <tbody>
            <tr>
              {SHAPES.slice(0, 3).map((shape) => (
                <td key={shape}>
                  <button
                    className={`number-btn${selectedShape === shape ? ' selected' : ''}`}
                    onClick={e => { handleShapeClick(shape); e.currentTarget.blur(); }}
                  >
                    {renderShape(shape)}
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              {SHAPES.slice(3).map((shape) => (
                <td key={shape}>
                  <button
                    className={`number-btn${selectedShape === shape ? ' selected' : ''}`}
                    onClick={e => { handleShapeClick(shape); e.currentTarget.blur(); }}
                  >
                    {renderShape(shape)}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShapeSudoku;
