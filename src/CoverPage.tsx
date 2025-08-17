import React from 'react';

interface CoverPageProps {
	onStart: (variant: 'classic' | 'shapes') => void;
}

const CoverPage: React.FC<CoverPageProps> = ({ onStart }) => {
	return (
		<div className="cover-page">
			<div className="cover-content">
				<h1 className="cover-title">New Game</h1>
				<div className="cover-options">
					<button className="cover-option-btn" onClick={() => onStart('classic')}>Number Sudoku</button>
					<button className="cover-option-btn" onClick={() => onStart('shapes')}>Colored Shapes Sudoku</button>
				</div>
			</div>
		</div>
	);
};

export default CoverPage;
