import { useState, useEffect } from 'react';
import './Sudoku.css';

const SHAPES = [
  'triangle',    // maroon
  'cross',       // orange
  'square',      // blue
  'pentagon',    // purple
  'hexagon',     // green
  'circle'       // yellow
];

const SHAPE_COLORS: Record<string, string> = {
  triangle: '#800000',   // maroon
  cross: '#FF9800',      // orange
  square: '#2196F3',     // blue
  pentagon: '#8E24AA',   // purple
  hexagon: '#43A047',    // green
  circle: '#FFD600'      // yellow
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
  // Handler for clearing a cell
  const handleClearCell = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== '') return;
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? '' : cell))
    );
    setBoard(newBoard);
    setSelectedShape(null);
  };
  // Handler for Back button
  const handleBack = () => {
  window.location.href = '/Sodoku/'; // For GitHub Pages deployment
  };
  const [solutionBoard, setSolutionBoard] = useState<string[][]>(() => generateFullBoard());
  const [initialBoard, setInitialBoard] = useState<string[][]>(() => generatePuzzleBoardFromSolution(solutionBoard));
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (startTime && !completed) {
      const interval = setInterval(() => {
        setTimer(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, completed]);

  // Check for completion
  function isBoardComplete(board: string[][]) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (board[i][j] !== solutionBoard[i][j]) return false;
      }
    }
    return true;
  }

  // Update handleShapeClick to start timer and check completion
  const handleShapeClick = (shape: string) => {
    setSelectedShape(shape);
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== '') return;
    if (!startTime) setStartTime(Date.now());
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? shape : cell))
    );
    setBoard(newBoard);
    if (isBoardComplete(newBoard)) {
      setCompleted(true);
      setEndTime(Date.now());
    }
  };

  // Update the formatTime function to display minutes:seconds format
  function formatTime(ms: number) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== '') return;
    setSelectedCell({ row, col });
  };

  const handleNewGame = () => {
  const newSolution = generateFullBoard();
  const newInitial = generatePuzzleBoardFromSolution(newSolution);
  setSolutionBoard(newSolution);
  setInitialBoard(newInitial);
  setBoard(newInitial);
  setSelectedCell(null);
  setSelectedShape(null);
  setCompleted(false);
  setStartTime(null);
  setEndTime(null);
  setTimer(0); // Reset timer when starting a new game
  };

  return (
    <>
      <button
        className="back-btn"
        style={{
          position: 'fixed',
          top: 20,
          left: 'calc(50% - 20em)', // Move 20 paces (em) to the left
          transform: 'translateX(-50%)',
          zIndex: 1000,
          fontSize: '1.1rem',
          background: '#5D2F77',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background 0.2s',
        }}
        onClick={handleBack}
        onMouseOver={e => (e.currentTarget.style.background = '#43205a')}
        onMouseOut={e => (e.currentTarget.style.background = '#5D2F77')}
      >
  <span role="img" aria-label="Home">🏠</span>
      </button>
      <button
        className="newgame-btn"
        style={{position: 'fixed', top: 20, left: 20, zIndex: 1000}}
        onClick={e => { handleNewGame(); e.currentTarget.blur(); }}
      >
        New Game
      </button>
      <div className="timer-top-right" style={{position: 'fixed', top: 20, right: 40, fontSize: '1.2rem', fontWeight: 'bold', color: '#333', background: '#f5f5fa', padding: '8px 16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', zIndex: 10}}>
        Time: {formatTime(completed && endTime ? endTime - (startTime ?? 0) : timer)}
      </div>
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
                {/* Cross button for clearing cell */}
                <td>
                  <button
                    className="number-btn clear-btn"
                    title="Clear cell"
                    onClick={e => { handleClearCell(); e.currentTarget.blur(); }}
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c00', background: '#fff', border: '2px solid #c00', borderRadius: '6px', padding: '0 10px', marginLeft: '8px' }}
                  >
                    &#10006;
                  </button>
                </td>
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
        {completed && endTime && (
          <div className="newgame-prompt">
            <p>Congratulations! You completed the grid.</p>
            <p>Time taken: {formatTime(endTime - (startTime ?? 0))}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ShapeSudoku;
