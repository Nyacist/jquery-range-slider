import {IThumb} from "./interfaces";


export const DIRECTION = {
  vertical: 'vertical',
  horizontal: 'horizontal',
} as const
export type DIRECTION = keyof typeof DIRECTION

export const QT_THUMBS = {
  single: 'single',
  double: 'double',
} as const
export type QT_THUMBS = keyof typeof QT_THUMBS

export const LOCATION = {
  begin: 'begin',
  end: 'end',
} as const
export type LOCATION = keyof typeof LOCATION

export const SIDE = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
} as const
export type SIDE = keyof typeof SIDE

export type SLIDER_PARAMS = {
  width: number;
  height: number;
}

export type UPDATE_DATA = {
  side: SIDE,
  value: number,
}

export type SLIDER_SETTINGS = {
  direction: DIRECTION;
  qtThumbs: QT_THUMBS;
  gap: number;
}

export type THUMBS_ARRAY = {
  [key: string]: IThumb
  //[key in LOCATION]: IThumb
}

export type THUMBS_VIEW = {
  [key in LOCATION]: JQuery<HTMLElement>
}

type Concrete<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

export type SLIDER_PROPS_OPTIONS = Concrete<SLIDER_SETTINGS>
