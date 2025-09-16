// Helper to generate a puzzle from a solution board, ensuring unique solution
function generatePuzzleBoardFromSolution(solution: string[][]): string[][] {
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
    if (!hasUniqueSolution(puzzle)) {
      puzzle[i][j] = backup;
    }
  }
  return puzzle;
}
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
  // Check row
  for (let j = 0; j < 6; j++) {
    if (j !== col && board[row][j] === value) return false;
  }
  // Check column
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

function Sudoku() {
  // Handler for Back button
  const handleBack = () => {
  window.location.href = '/Sodoku/'; // For GitHub Pages deployment
  };
  const [solutionBoard, setSolutionBoard] = useState<string[][]>(() => generateFullBoard());
  const [initialBoard, setInitialBoard] = useState<string[][]>(() => generatePuzzleBoardFromSolution(solutionBoard));
  const [board, setBoard] = useState<string[][]>(initialBoard);
  // When variant changes, start a new puzzle
  // New game handler: always generate a new solution and puzzle
  const handleNewGame = () => {
    const newSolution = generateFullBoard();
    setSolutionBoard(newSolution);
    const newInitialBoard = generatePuzzleBoardFromSolution(newSolution);
    setInitialBoard(newInitialBoard);
    setBoard(newInitialBoard);
    setCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setElapsed(0);
    setTimerActive(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);


  useEffect(() => {
    if (timerActive && startTime !== null) {
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [timerActive, startTime]);

  useEffect(() => {
    if (completed && endTime === null) {
      setEndTime(Date.now());
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  }, [completed, endTime]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== '') return;
    setSelectedCell({ row, col });
  };

  const handleNumberClick = (num: string) => {
    setSelectedNumber(num);
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== '') return;
    // Start timer on first move
    if (!timerActive) {
      setStartTime(Date.now());
      setTimerActive(true);
    }
    // If cross is clicked, clear the cell and deselect
    if (num === 'X') {
      const newBoard = board.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? '' : cell))
      );
      setBoard(newBoard);
      setSelectedCell(null);
      return;
    }
    // Fill the cell but keep it selected
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? num : cell))
    );
    setBoard(newBoard);
    // Do NOT deselect the cell here
    // Check for completion
    if (isBoardComplete(newBoard)) {
      setCompleted(true);
    }
  };

  // Only highlight cell red if it violates Sudoku rules
  function isCellInvalid(board: string[][], row: number, col: number, value: string): boolean {
    if (value === '') return false;
    // Check row
    for (let j = 0; j < 6; j++) {
      if (j !== col && board[row][j] === value) return true;
    }
    // Check column
    for (let i = 0; i < 6; i++) {
      if (i !== row && board[i][col] === value) return true;
    }
    // Check 2x3 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 2; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (i === row && j === col) continue;
        if (board[i][j] === value) return true;
      }
    }
    return false;
  }

  function isBoardComplete(board: string[][]): boolean {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const value = board[i][j];
        if (value === '' || isCellInvalid(board, i, j, value)) return false;
      }
    }
    return true;
  }

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <button
        className="newgame-btn"
        style={{position: 'fixed', top: 20, left: 20, zIndex: 1000}}
        onClick={e => { handleNewGame(); e.currentTarget.blur(); }}
      >New Game</button>
      <button
        className="back-btn"
        style={{
          position: 'fixed',
          top: 20,
          left: 'calc(50% - 20em)',
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
      {/* Responsive style for mobile screens: home button below new game */}
      <style>
        {`
          @media (max-width: 600px) {
            .newgame-btn {
              position: fixed !important;
              top: 10px !important;
              left: 10px !important;
              font-size: 1.2rem !important;
              padding: 10px 18px !important;
              border-radius: 8px !important;
            }
            .back-btn {
              position: fixed !important;
              top: 60px !important;
              left: 10px !important;
              font-size: 1.5rem !important;
              padding: 12px 22px !important;
              border-radius: 10px !important;
              min-width: 48px !important;
              min-height: 48px !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
              transform: none !important;
            }
          }
        `}
      </style>
      <div className="sudoku-container">
      <h2>6x6 Sudoku</h2>
      <div className="timer-top-right">Time: {formatTime(completed && endTime ? endTime - (startTime ?? 0) : elapsed)}</div>
      <table className="sudoku-board">
        <tbody>
          {board.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                let cellClass = '';
                if (i % 2 === 1 && i !== 5) cellClass += ' bold-bottom';
                if (j % 3 === 2 && j !== 5) cellClass += ' bold-right';
                if (i === 0) cellClass += ' bold-top';
                if (i === 5) cellClass += ' bold-bottom';
                if (j === 0) cellClass += ' bold-left';
                if (j === 5) cellClass += ' bold-right';
                const isPrefilled = initialBoard[i][j] !== '';
                // Mark cell red if it is not prefilled, not empty, and does not match the solution
                const isIncorrect = !isPrefilled && cell !== '' && cell !== solutionBoard[i][j];
                let inputClass = isPrefilled ? 'prefilled' : '';
                if (isIncorrect) inputClass += ' invalid';
                if (selectedCell && selectedCell.row === i && selectedCell.col === j) inputClass += ' selected';
                const displayValue = isPrefilled ? initialBoard[i][j] : cell;
                return (
                  <td key={j} className={cellClass.trim()} onClick={() => handleCellClick(i, j)}>
                    <input
                      value={displayValue}
                      readOnly
                      disabled={isPrefilled}
                      className={inputClass.trim()}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* 2x3 number array for selection */}
      <div className="number-array-2x3">
        <table>
          <tbody>
            <tr>
              {["1","2","3","X"].map((num) => (
                <td key={num}>
                  <button
                    className={`number-btn${selectedNumber === num ? ' selected' : ''}`}
                    onClick={e => { handleNumberClick(num); e.currentTarget.blur(); }}
                  >
                    {num === 'X' ? <span>&#10006;</span> : num}
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              {["4","5","6"].map((num) => (
                <td key={num}>
                  <button
                    className={`number-btn${selectedNumber === num ? ' selected' : ''}`}
                    onClick={e => { handleNumberClick(num); e.currentTarget.blur(); }}
                  >
                    {num}
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
}

export default Sudoku;
