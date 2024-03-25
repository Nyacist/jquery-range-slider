import {DIRECTION, LOCATION, QT_THUMBS, SIDE} from "./types";
import MouseDownEvent = JQuery.MouseDownEvent;

export interface ISliderOptions {
  direction?: DIRECTION;
  qtThumbs?: QT_THUMBS;
  gap?: number;
}

export interface ISliderSettings {
  direction: DIRECTION;
  qtThumbs: QT_THUMBS;
  gap: number;
}

export interface IThumbOptions {
  location: LOCATION;
  direction: DIRECTION;
  onMouseDown?: (e: MouseDownEvent) => void;
}

export interface IThumb {
  //thumb: JQuery<HTMLElement>;
  location: LOCATION;
  direction: DIRECTION;
  side: SIDE;
  positionInPercentage: number;
  setPosition(value: number): void;
  getPosition(): number;
}
