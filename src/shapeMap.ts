
import { RedTriangle, BlueSquare, YellowCircle, PurplePentagon, GreenHexagon, OrangeCross } from './shapes';

export const shapeMap: Record<string, () => JSX.Element> = {
  '1': () => <RedTriangle />,
  '2': () => <BlueSquare />,
  '3': () => <YellowCircle />,
  '4': () => <PurplePentagon />,
  '5': () => <GreenHexagon />,
  '6': () => <OrangeCross />,
};
