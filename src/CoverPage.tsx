import React from 'react';

interface CoverPageProps {
  onStart: () => void;
}

const CoverPage: React.FC<CoverPageProps> = ({ onStart }) => {
  return (
    <div className="cover-page">
      <div className="cover-content">
        <h1 className="cover-title">Sudoku</h1>
        <div className="cover-options">
          <button className="cover-option-btn" onClick={() => onStart?.()}>6x6</button>
          <button className="cover-option-btn" onClick={() => onStart?.('shapes')}>Colored Shapes</button>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;
