
import React, { useState } from 'react';
import Sudoku from './Sudoku';
import CoverPage from './CoverPage';
import './App.css';

function App() {
  const [showGame, setShowGame] = useState(false);

  const handleSelect = () => {
    setShowGame(true);
  };

  return (
    <>
      {showGame ? <Sudoku /> : <CoverPage onSelect={handleSelect} />}
    </>
  );
}

export default App;
