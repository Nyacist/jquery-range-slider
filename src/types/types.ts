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


export type THUMBS_ARRAY = {
  [key: string]: IThumb
}
//   {
//   [key in LOCATION]?: IThumb
// }

export type THUMBS_VIEW = {
  [key: string]: JQuery<HTMLElement>
}
//   {
//   [key in LOCATION]?: JQuery<HTMLElement>
// }


export type SLIDER_SETTINGS = {
  direction: DIRECTION;
  qtThumbs: QT_THUMBS;
  gap: number;
}

type Concrete<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

export type SLIDER_PROPS_OPTIONS = Concrete<SLIDER_SETTINGS>
