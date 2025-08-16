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

function generatePuzzleBoard(): string[][] {
  let board = generateFullBoard();
  let puzzle = board.map(row => [...row]);
  // Try to remove as many cells as possible while keeping a unique solution
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

function Sudoku() {
  const [initialBoard, setInitialBoard] = useState<string[][]>(generatePuzzleBoard());
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleNewGame = () => {
  // ...existing code...
  const newInitialBoard = generatePuzzleBoard();
  setInitialBoard(newInitialBoard);
  setBoard(newInitialBoard);
  setCompleted(false);
  setStartTime(null);
  setEndTime(null);
  setElapsed(0);
  setTimerActive(false);
  if (timerRef.current) window.clearInterval(timerRef.current);
  };

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

  const handleChange = (row: number, col: number, value: string) => {
    if (initialBoard[row][col] !== '') return;
    if (value === '' || /^[1-6]$/.test(value)) {
      // Start timer on first move
      if (!timerActive) {
        setStartTime(Date.now());
        setTimerActive(true);
      }
      const newBoard = board.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? value : cell))
      );
      setBoard(newBoard);
      // Check for completion
      if (isBoardComplete(newBoard)) {
        setCompleted(true);
      }
    }
  };

  function isBoardComplete(board: string[][]): boolean {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const value = board[i][j];
        if (value === '' || !isValid(board, i, j, value)) return false;
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
    <div className="sudoku-container">
      <h2>6x6 Sudoku</h2>
      <div className="timer-top-right">Time: {formatTime(completed && endTime ? endTime - (startTime ?? 0) : elapsed)}</div>
        <button
          className="newgame-btn"
          onClick={e => { handleNewGame(); e.currentTarget.blur(); }}
        >New Game</button>
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
                const isInvalid = !isPrefilled && cell !== '' && !isValid(board, i, j, cell);
                let inputClass = isPrefilled ? 'prefilled' : '';
                if (isInvalid) inputClass += ' invalid';
                if (selectedCell && selectedCell.row === i && selectedCell.col === j) inputClass += ' selected';
                return (
                  <td key={j} className={cellClass.trim()} onClick={() => handleCellClick(i, j)}>
                    <input
                      value={isPrefilled ? initialBoard[i][j] : cell}
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
              <td><button className={`number-btn${selectedNumber === '1' ? ' selected' : ''}`} onClick={() => handleNumberClick('1')}>1</button></td>
              <td><button className={`number-btn${selectedNumber === '2' ? ' selected' : ''}`} onClick={() => handleNumberClick('2')}>2</button></td>
              <td><button className={`number-btn${selectedNumber === '3' ? ' selected' : ''}`} onClick={() => handleNumberClick('3')}>3</button></td>
              <td><button className={`number-btn${selectedNumber === 'X' ? ' selected' : ''}`} onClick={() => handleNumberClick('X')}>&#10006;</button></td>
            </tr>
            <tr>
              <td><button className={`number-btn${selectedNumber === '4' ? ' selected' : ''}`} onClick={() => handleNumberClick('4')}>4</button></td>
              <td><button className={`number-btn${selectedNumber === '5' ? ' selected' : ''}`} onClick={() => handleNumberClick('5')}>5</button></td>
              <td><button className={`number-btn${selectedNumber === '6' ? ' selected' : ''}`} onClick={() => handleNumberClick('6')}>6</button></td>
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
  );
}

export default Sudoku;
