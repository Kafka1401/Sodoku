
import { useState, useEffect, useRef } from 'react';
import './ShapeSudoku.css';
import ShapeRenderer from './ShapeRenderer';
import shapeMap from './shapeMap';

const SHAPES = ['1', '2', '3', '4', '5', '6'];

function generateFullShapeBoard(): string[][] {
  // Backtracking to fill a 6x6 grid with unique shapes per row/col
  const board = Array.from({ length: 6 }, () => Array(6).fill(''));
  function fill(row: number, col: number): boolean {
    if (row === 6) return true;
    if (col === 6) return fill(row + 1, 0);
    const shuffled = SHAPES.slice().sort(() => Math.random() - 0.5);
    for (const shape of shuffled) {
      if (isValidShape(board, row, col, shape)) {
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

function hasUniqueShapeSolution(board: string[][]): boolean {
  let count = 0;
  function solve(bd: string[][]): boolean {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (bd[i][j] === '') {
          for (const shape of SHAPES) {
            if (isValidShape(bd, i, j, shape)) {
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

function generateShapePuzzleBoardFromSolution(solution: string[][]): string[][] {
  let puzzle = solution.map(row => [...row]);
  let cells = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      cells.push([i, j]);
    }
  }
  // Shuffle cells for random removal order
  for (let k = cells.length - 1; k > 0; k--) {
    const l = Math.floor(Math.random() * (k + 1));
    [cells[k], cells[l]] = [cells[l], cells[k]];
  }
  for (const [i, j] of cells) {
    const backup = puzzle[i][j];
    puzzle[i][j] = '';
    // Only keep removal if puzzle still has a unique solution
    if (!hasUniqueShapeSolution(puzzle)) {
      puzzle[i][j] = backup;
    }
  }
  // Final check: if puzzle is not uniquely solvable, regenerate
  if (!hasUniqueShapeSolution(puzzle)) {
    return solution.map(row => [...row]); // fallback to full solution
  }
  return puzzle;
}

function isValidShape(board: string[][], row: number, col: number, value: string): boolean {
  // Only check row and column for shapes (no box constraint)
  for (let j = 0; j < 6; j++) {
    if (j !== col && board[row][j] === value) return false;
  }
  for (let i = 0; i < 6; i++) {
    if (i !== row && board[i][col] === value) return false;
  }
  return true;
}


function ShapeSudoku() {
  // Guarantee a solvable puzzle with a unique solution
  const [solutionBoard, setSolutionBoard] = useState<string[][]>(() => generateFullShapeBoard());
  const [initialBoard, setInitialBoard] = useState<string[][]>(() => {
    let puzzle;
    let attempts = 0;
    do {
      puzzle = generateShapePuzzleBoardFromSolution(solutionBoard);
      attempts++;
      // If puzzle is not solvable, regenerate solution and puzzle
      if (!hasUniqueShapeSolution(puzzle)) {
        const newSolution = generateFullShapeBoard();
        for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) solutionBoard[i][j] = newSolution[i][j];
      }
    } while (!hasUniqueShapeSolution(puzzle) && attempts < 10);
    return puzzle;
  });
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== '') return;
    setSelectedCell({ row, col });
  };

  const handleShapeClick = (shape: string) => {
    setSelectedShape(shape);
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== '') return;
    // Fill the cell but keep it selected
    setBoard(prevBoard => {
      const newBoard = prevBoard.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? shape : cell))
      );
      // Check for completion
      if (isBoardComplete(newBoard)) {
        setCompleted(true);
      }
      return newBoard;
    });
  };

  function isBoardComplete(board: string[][]): boolean {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const value = board[i][j];
        if (value === '' || !isValidShape(board, i, j, value)) return false;
      }
    }
    return true;
  }

  return (
    <div className="shape-sudoku-container">
      <h2>Colored Shapes Sudoku</h2>
      <table className="shape-sudoku-board">
        <tbody>
          {board.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const isPrefilled = initialBoard[i][j] !== '';
                const isIncorrect = !isPrefilled && cell !== '' && !isValidShape(board, i, j, cell);
                let cellClass = isPrefilled ? 'prefilled' : '';
                if (isIncorrect) cellClass += ' invalid';
                if (selectedCell && selectedCell.row === i && selectedCell.col === j) cellClass += ' selected';
                return (
                  <td key={j} className={cellClass.trim()} onClick={() => handleCellClick(i, j)}>
                    {cell ? <ShapeRenderer value={cell} /> : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Shape selection array */}
      <div className="shape-number-array">
        <table>
          <tbody>
            <tr>
              {SHAPES.map((shape) => (
                <td key={shape}>
                  <button
                    className={`shape-number-btn${selectedShape === shape ? ' selected' : ''}`}
                    onClick={e => { handleShapeClick(shape); e.currentTarget.blur(); }}
                  >
                    <ShapeRenderer value={shape} />
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {completed && (
        <div className="newgame-prompt">
          <p>Congratulations! You completed the grid.</p>
        </div>
      )}
    </div>
  );
}

export default ShapeSudoku;
