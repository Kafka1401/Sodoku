import React from 'react';
import { RedTriangle, BlueSquare, YellowCircle, PurplePentagon, GreenHexagon, OrangeCross } from './shapes';

interface ShapeRendererProps {
  value: string;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({ value }) => {
  switch (value) {
    case '1':
      return <RedTriangle />;
    case '2':
      return <BlueSquare />;
    case '3':
      return <YellowCircle />;
    case '4':
      return <PurplePentagon />;
    case '5':
      return <GreenHexagon />;
    case '6':
      return <OrangeCross />;
    default:
      return null;
  }
};

export default ShapeRenderer;
