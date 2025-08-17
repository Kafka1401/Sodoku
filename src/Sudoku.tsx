import { useState, useEffect, useRef } from 'react';
import './Sudoku.css';


function generateFullBoard(): string[][] {
  // Create a simple valid board for testing
  const board = [
    ['1', '2', '3', '4', '5', '6'],
    ['4', '5', '6', '1', '2', '3'],
    ['2', '3', '1', '5', '6', '4'],
    ['5', '6', '4', '2', '3', '1'],
    ['3', '1', '2', '6', '4', '5'],
    ['6', '4', '5', '3', '1', '2']
  ];
  console.log('Generated board:', board);
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

// Helper to generate a puzzle from a solution board, ensuring unique solution
function generatePuzzleBoardFromSolution(solution: string[][]): string[][] {
  // Create a simple puzzle by removing some numbers
  const puzzle = solution.map(row => [...row]);
  // Remove some cells for the puzzle
  puzzle[0][0] = '';
  puzzle[0][2] = '';
  puzzle[1][1] = '';
  puzzle[1][3] = '';
  puzzle[2][0] = '';
  puzzle[2][4] = '';
  puzzle[3][1] = '';
  puzzle[3][5] = '';
  puzzle[4][2] = '';
  puzzle[4][4] = '';
  puzzle[5][0] = '';
  puzzle[5][3] = '';
  console.log('Generated puzzle:', puzzle);
  return puzzle;
}



function Sudoku() {
  // Simple test to see if component renders
  console.log('Sudoku component is rendering');
  
  const [solutionBoard, setSolutionBoard] = useState<string[][]>(() => {
    console.log('Generating solution board');
    return generateFullBoard();
  });
  const [initialBoard, setInitialBoard] = useState<string[][]>(() => {
    console.log('Generating initial board');
    return generatePuzzleBoardFromSolution(solutionBoard);
  });
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
    <div className="sudoku-container">
      <h2>6x6 Sudoku - Debug Mode</h2>
      <p>Board state: {board ? 'Loaded' : 'Not loaded'}</p>
      <p>Solution board: {solutionBoard ? 'Loaded' : 'Not loaded'}</p>
      <button
        className="newgame-btn"
        onClick={e => { handleNewGame(); e.currentTarget.blur(); }}
      >New Game</button>
      <div className="timer-top-right">Time: {formatTime(completed && endTime ? endTime - (startTime ?? 0) : elapsed)}</div>
      <table className="sudoku-board">
        <tbody>
          {board && board.map((row, i) => (
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
          )) || <tr><td colSpan={6}>Loading...</td></tr>}
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
  );
}

export default Sudoku;
