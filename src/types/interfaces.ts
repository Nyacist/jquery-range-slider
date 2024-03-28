import {DIRECTION, LOCATION, SIDE} from "./types";
import MouseDownEvent = JQuery.MouseDownEvent;


export interface IThumbOptions {
  location: LOCATION;
  direction: DIRECTION;
  onMouseDown?: (e: MouseDownEvent) => void;
}

export interface IThumb {
  location: LOCATION;
  direction: DIRECTION;
  side: SIDE;
  positionInPercentage: number;
  setPosition(value: number): void;
  getPosition(): number;
  getSide(): SIDE;
}


