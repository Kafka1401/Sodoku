import React, { useState } from 'react';
import Sudoku from './Sudoku';
import CoverPage from './CoverPage';
import './App.css';

function App() {
  const [showCover, setShowCover] = useState(true);
  const [variant, setVariant] = useState<'classic' | 'shapes'>('classic');

  const handleStart = (selectedVariant: 'classic' | 'shapes') => {
    setVariant(selectedVariant);
    setShowCover(false);
  };

  return (
    <>
      {showCover ? (
        <CoverPage onStart={handleStart} />
      ) : (
        <Sudoku />
      )}
    </>
  );
}

export default App;
