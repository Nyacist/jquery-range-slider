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
  location: LOCATION;
  direction: DIRECTION;
  side: SIDE;
  positionInPercentage: number;
  setPosition(value: number): void;
  getPosition(): number;
  getSide(): string;
}

export interface IThumbs {
  [key: string]: IThumb
}

export interface IViewThumbs {
  [key: string]: JQuery<HTMLElement>
}
