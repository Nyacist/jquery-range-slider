import $ from "jquery";
import styles from "./style.module.scss";
import {DIRECTION, QT_THUMBS, LOCATION, SIDE, Thumbs} from "./types/types";
import {ISliderOptions, ISliderSettings, IThumb, IThumbOptions} from "./types/interfaces";


class Thumb implements IThumb{
  //thumb: JQuery<HTMLElement>
  location: LOCATION
  direction: DIRECTION
  side: SIDE
  positionInPercentage: number

  constructor(options: IThumbOptions) {
    //this.thumb = $(`<div class='${styles.thumb} ${location}'></div>`)
    this.location = options.location || LOCATION.end
    this.direction = options.direction || DIRECTION.horizontal

    this.positionInPercentage = 0

    this.side = SIDE.right
    this._setThumbSide()

    //$(this.thumb).on('mousedown', {thumb: this}, options.onMouseDown)
  }

  private _setThumbSide() {
    if (this.direction === DIRECTION.horizontal) {
      if (this.location === LOCATION.begin) {
        this.side = SIDE.left
      }
      if (this.location === LOCATION.end) {
        this.side = SIDE.right
      }
    } else if (this.direction === DIRECTION.vertical) {
      if (this.location === LOCATION.begin) {
        this.side = SIDE.bottom
      }
      if (this.location === LOCATION.end) {
        this.side = SIDE.top
      }
    }
  }

  setPosition(value: number) {
    //проценты отступов со всех сторон, НЕ общий прогресс шкалы
    this.positionInPercentage = value
    //$(this.thumb).parent().css(this.side, this.positionInPercentage + '%')
  }

  getPosition() {
    return this.positionInPercentage
  }
}



export interface IModel {
  settings: ISliderSettings;
  thumbs: Thumbs;
  setSettings(options?: ISliderOptions): void;
  getSettings(): void;
  getThumbs(): Thumbs;
}

export class RangeSliderModel implements IModel{
  settings: ISliderSettings;
  thumbs: Thumbs;

  constructor(options?: ISliderOptions) {
    this.settings = {
      direction: DIRECTION.horizontal,
      qtThumbs: QT_THUMBS.single,
      gap: 10,
    }
    this.setSettings(options)

    this.thumbs = [new Thumb({
      location: LOCATION.end,
      direction: this.settings.direction,
    })]

    if (this.settings.qtThumbs === QT_THUMBS.double) {
      this.thumbs = [new Thumb({
        location: LOCATION.begin,
        direction: this.settings.direction,
      }),
        new Thumb({
          location: LOCATION.end,
          direction: this.settings.direction,
        })]
    }
  }

  setSettings(options?: ISliderOptions) {
    this.settings = {...this.settings, ...options}
    // 0 < gap < 100, иначе 10
    if (this.settings.gap < 0 || this.settings.gap > 100) {
      this.settings.gap = 10
    }
  }
  getSettings() {
    return this.settings
  }

  getThumbs() {
    return this.thumbs
  }
}

function pixelsToPercentInSlider(root: JQuery<HTMLElement>, direction: DIRECTION, elementPixels: string | number): number {
  let sliderParams = 1
  if (direction === DIRECTION.horizontal) {
    sliderParams = $('.' + styles.slider, root).width() || 1
  } else if (direction === DIRECTION.vertical) {
    sliderParams = $('.' + styles.slider, root).height() || 1
  }

  //позиция нажатия в пикселях или в строке(из строки обрежутся только цифры и преобразуются в число)
  const countPixels = (typeof elementPixels === 'number') ? elementPixels : +elementPixels.replace(/[^0-9,.]/g, '')
  return Math.round(countPixels / sliderParams * 100)  //целочисленые проценты
}

