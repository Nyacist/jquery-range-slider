import {DIRECTION, LOCATION, SIDE} from "./types";

export interface IThumb {
  location: LOCATION;
  direction: DIRECTION;
  side: SIDE;
  positionInPercentage: number;
  valueInPercentage: number;
  value: number;
  setPosition(value: number): void;
  getPosition(): number;
  getValue(): number;
  getSide(): SIDE;
}


