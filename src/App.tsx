
import React, { useState } from 'react';
import Sudoku from './Sudoku';
import CoverPage from './CoverPage';
import './App.css';

function App() {
  const [showCover, setShowCover] = useState(true);
  const [variant, setVariant] = useState<'classic' | 'shapes'>('classic');

  const handleStart = (selectedVariant?: 'shapes') => {
    setVariant(selectedVariant === 'shapes' ? 'shapes' : 'classic');
    setShowCover(false);
  };

  return (
    <>
      {showCover ? (
        <CoverPage onStart={handleStart} />
      ) : (
        <Sudoku variant={variant} />
      )}
    </>
  );
}

export default App;
