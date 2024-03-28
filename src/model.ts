import {DIRECTION, LOCATION, QT_THUMBS, SIDE , THUMBS_ARRAY, SLIDER_PROPS_OPTIONS, SLIDER_SETTINGS,} from "./types/types";
import { IThumb, IThumbOptions} from "./types/interfaces";


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

  getPosition(): number {
    return this.positionInPercentage
  }

  getSide(): SIDE {
    return this.side
  }
}


export interface IModel {
  settings: SLIDER_SETTINGS;
  thumbs: THUMBS_ARRAY;

  setSettings(options?: SLIDER_PROPS_OPTIONS): void;
  getSettings(): SLIDER_SETTINGS;

  getThumbs(): THUMBS_ARRAY;
  setThumbPosition(
    thumbsPosition: LOCATION,
    sliderParams: { [key: string]: number },
    elementPixels: string | number
  ): void;
  getThumbPosition(thumbsLocation: LOCATION): number;
  getThumbSide(thumbsLocation: LOCATION): SIDE;

  getDirection(): DIRECTION;
}

export class RangeSliderModel implements IModel {
  settings: SLIDER_SETTINGS;
  thumbs: THUMBS_ARRAY;

  constructor(options?: SLIDER_PROPS_OPTIONS) {
    this.settings = {
      direction: DIRECTION.horizontal,
      qtThumbs: QT_THUMBS.single,
      gap: 10,
    }
    this.setSettings(options)

    this.thumbs = {
      [LOCATION.end]: new Thumb({
        location: LOCATION.end,
        direction: this.settings.direction,
      }),
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      this.thumbs[LOCATION.begin] = new Thumb({
        location: LOCATION.begin,
        direction: this.settings.direction,
      })
    }
  }

  setSettings(options ?: SLIDER_PROPS_OPTIONS) {
    this.settings = {...this.settings, ...options}
    // 0 < gap < 100, иначе 10
    if (this.settings.gap < 0 || this.settings.gap > 100) {
      this.settings.gap = 10
    }
  }

  getSettings(): SLIDER_SETTINGS {
    return this.settings
  }

  getThumbs(): THUMBS_ARRAY {
    return this.thumbs
  }

  setThumbPosition(thumbsPosition: LOCATION, sliderParams: { [key: string]: number }, elementPixels: string | number) {
    let thumbPercentageValue = RangeSliderModel._pixelsToPercentInSlider(this.settings.direction, sliderParams, elementPixels)

    const HORIZONTAL_END = (this.settings.direction === DIRECTION.horizontal) && (thumbsPosition === LOCATION.end)
    const VERTICAL_BEGIN = (this.settings.direction === DIRECTION.vertical) && (thumbsPosition === LOCATION.begin)

    if (HORIZONTAL_END || VERTICAL_BEGIN) {
      thumbPercentageValue = 100 - thumbPercentageValue
    }
    this._checkLimit(thumbsPosition, thumbPercentageValue)
  }

  getThumbPosition(thumbsLocation: LOCATION): number {
    return this.thumbs[thumbsLocation]?.getPosition()
  }

  getThumbSide(thumbsLocation: LOCATION): SIDE {
    return this.thumbs[thumbsLocation].getSide()
  }

  getDirection(): DIRECTION {
    return this.settings.direction
  }

  private _checkLimit = (thumbsPosition: LOCATION, thumbPercentageValue: number) => {
    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
      return
    }
    //бегунки ограничивают друг друга
    if (this.settings.qtThumbs === QT_THUMBS.single) {
      this.thumbs[thumbsPosition]?.setPosition(thumbPercentageValue)
      return;
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      let limit = 100 - this.settings.gap   //минимальное ограничение на отступ
      //проверка на ограничение по второму ползунку
      if (thumbsPosition === LOCATION.begin) {
        limit = limit - this.thumbs[LOCATION.end]!.getPosition()
      } else if (thumbsPosition === LOCATION.end) {
        limit = limit - this.thumbs[LOCATION.begin]!.getPosition()
      }
      //применить ограничения
      if (thumbPercentageValue > limit) {
        this.thumbs[thumbsPosition]?.setPosition(limit)
      } else {
        this.thumbs[thumbsPosition]?.setPosition(thumbPercentageValue)
      }
    }
  }

  private static _pixelsToPercentInSlider(direction: DIRECTION, sliderProps: { [key: string]: number }, elementPixels: string | number): number {
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
}

