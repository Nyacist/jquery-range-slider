import {DIRECTION, QT_THUMBS, LOCATION, SIDE} from "./types/types";
import {ISliderOptions, ISliderSettings, IThumb, IThumbOptions, IThumbs} from "./types/interfaces";


class Thumb implements IThumb {
  location: LOCATION
  direction: DIRECTION
  side: SIDE
  positionInPercentage: number

  constructor(options: IThumbOptions) {
    this.location = options.location || LOCATION.end
    this.direction = options.direction || DIRECTION.horizontal

    this.positionInPercentage = 0

    this.side = SIDE.right
    this._setThumbSide()
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
  }

  getPosition() {
    return this.positionInPercentage
  }

  getSide() {
    return this.side
  }
}


export interface IModel {
  settings: ISliderSettings;
  thumbs: IThumbs;

  setSettings(options?: ISliderOptions): void;
  getSettings(): void;

  getThumbs(): IThumbs;
}

export class RangeSliderModel implements IModel {
  settings: ISliderSettings;
  thumbs: IThumbs;

  constructor(options?: ISliderOptions) {
    this.settings = {
      direction: DIRECTION.horizontal,
      qtThumbs: QT_THUMBS.single,
      gap: 10,
    }
    this.setSettings(options)

    // this.thumbs = [new Thumb({
    //   location: LOCATION.end,
    //   direction: this.settings.direction,
    // })]
    //
    // if (this.settings.qtThumbs === QT_THUMBS.double) {
    //   this.thumbs = [new Thumb({
    //     location: LOCATION.begin,
    //     direction: this.settings.direction,
    //   }),
    //     new Thumb({
    //       location: LOCATION.end,
    //       direction: this.settings.direction,
    //     })]
    // }
    this.thumbs = {
      [LOCATION.end]: new Thumb({
        location: LOCATION.end,
        direction: this.settings.direction,
      })
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      this.thumbs[LOCATION.begin] = new Thumb({
        location: LOCATION.begin,
        direction: this.settings.direction,
      })
    }
  }

  setSettings(options ?: ISliderOptions) {
    this.settings = {...this.settings, ...options}
    // 0 < gap < 100, иначе 10
    if (this.settings.gap < 0 || this.settings.gap > 100) {
      this.settings.gap = 10
    }
  }

  getSettings(): ISliderSettings {
    return this.settings
  }

  getThumbs(): IThumbs {
    return this.thumbs
  }

  setThumbPosition(thumbsPosition: LOCATION, sliderParams: { [key: string]: number }, elementPixels: string | number) {
    let thumbPercentageValue = pixelsToPercentInSlider(this.settings.direction, sliderParams, elementPixels)

    const HORIZONTAL_END = (this.settings.direction === DIRECTION.horizontal) && (thumbsPosition === LOCATION.end)
    const VERTICAL_BEGIN = (this.settings.direction === DIRECTION.vertical) && (thumbsPosition === LOCATION.begin)

    if (HORIZONTAL_END || VERTICAL_BEGIN) {
      thumbPercentageValue = 100 - thumbPercentageValue
    }
    this._checkLimit(thumbsPosition, thumbPercentageValue)
  }

  private _checkLimit = (thumbsPosition: LOCATION, thumbPercentageValue: number) => {
    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
      return
    }
    //бегунки ограничивают друг друга
    if (this.settings.qtThumbs === QT_THUMBS.single) {
      this.thumbs[thumbsPosition].setPosition(thumbPercentageValue)
      return;
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      let limit = 100 - this.settings.gap   //минимальное ограничение на отступ
      //проверка на ограничение по второму ползунку
      if (thumbsPosition === LOCATION.begin) {
        limit = limit - this.thumbs[LOCATION.end].getPosition()
      } else if (thumbsPosition === LOCATION.end) {
        limit = limit - this.thumbs[LOCATION.begin].getPosition()
      }
      //применить ограничения
      if (thumbPercentageValue > limit) {
        this.thumbs[thumbsPosition].setPosition(limit)
      } else {
        this.thumbs[thumbsPosition].setPosition(thumbPercentageValue)
      }
    }
  }

  getThumbPosition(thumbsLocation: LOCATION) {
    return this.thumbs[thumbsLocation].getPosition()
  }

  getThumbSide(thumbsLocation: LOCATION) {
    return this.thumbs[thumbsLocation].getSide()
  }
}

function pixelsToPercentInSlider(direction: DIRECTION, sliderProps: { [key: string]: number }, elementPixels: string | number): number {
  let sliderParams = 1
  if (direction === DIRECTION.horizontal) {
    sliderParams = sliderProps.width
  } else if (direction === DIRECTION.vertical) {
    sliderParams = sliderProps.height
  }

  //позиция нажатия в пикселях или в строке(из строки обрежутся только цифры и преобразуются в число)
  const countPixels = (typeof elementPixels === 'number') ? elementPixels : +elementPixels.replace(/[^0-9,.]/g, '')
  return Math.round(countPixels / sliderParams * 100)  //целочисленые проценты
}

