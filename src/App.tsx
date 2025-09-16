import { useState } from 'react';
import Sudoku from './Sudoku';
import ShapeSudoku from './ShapeSudoku';
import CoverPage from './CoverPage';
import './App.css';

function App() {
  const [variant, setVariant] = useState<'numbers' | 'shapes' | null>(null);

  const handleSelect = (selectedVariant: 'numbers' | 'shapes') => {
    setVariant(selectedVariant);
  };

  return (
    <>
      {variant === null ? (
        <CoverPage onSelect={handleSelect} />
      ) : variant === 'numbers' ? (
        <Sudoku />
      ) : (
        <ShapeSudoku />
      )}
    </>
  );
}

export default App;
