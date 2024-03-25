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

export type Thumbs = [IThumb] | [IThumb, IThumb]
export type ViewThumbs = [JQuery<HTMLElement>] | [JQuery<HTMLElement>, JQuery<HTMLElement>]
