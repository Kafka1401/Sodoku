
import React from 'react';
import './Sudoku.css';

interface CoverPageProps {
	onSelect: (variant: 'numbers' | 'shapes') => void;
}

const CoverPage: React.FC<CoverPageProps> = ({ onSelect }) => {
	return (
		<div className="cover-page" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', minWidth: '100vw', position: 'fixed', top: 0, left: 0}}>
			<h1 style={{marginBottom: '2rem', color: '#1A2A80'}}>Welcome to Sudoku</h1>
			<div style={{display: 'flex', gap: '2rem'}}>
				<button className="cover-option-btn" style={{padding: '1rem 2rem', fontSize: '1.2rem'}} onClick={() => onSelect('numbers')}>
					6x6 Number
				</button>
				<button className="cover-option-btn" style={{padding: '1rem 2rem', fontSize: '1.2rem'}} onClick={() => onSelect('shapes')}>
					6x6 Shapes
				</button>
			</div>
		</div>
	);
};

export default CoverPage;
