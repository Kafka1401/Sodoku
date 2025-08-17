
import { RedTriangle, BlueSquare, YellowCircle, PurplePentagon, GreenHexagon, OrangeCross } from './shapes';

export const shapeMap: { [key: string]: React.FC } = {
  '1': RedTriangle,
  '2': BlueSquare,
  '3': YellowCircle,
  '4': PurplePentagon,
  '5': GreenHexagon,
  '6': OrangeCross,
};
