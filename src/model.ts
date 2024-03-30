import {
  DIRECTION,
  LOCATION,
  QT_THUMBS,
  SIDE,
  THUMBS_ARRAY,
  SLIDER_PROPS_OPTIONS,
  SLIDER_SETTINGS,
} from "./types/types";
import {IThumb, IThumbOptions} from "./types/interfaces";


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

  newThumbPosition(
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

  newThumbPosition(
    thumbLocation: LOCATION,
    sliderParams: { [key: string]: number },
    elementPixels: string | number): {side: SIDE, value: number} {
    let thumbPercentageValue = RangeSliderModel._pixelsToPercentInSlider(this.settings.direction, sliderParams, elementPixels)

    const HORIZONTAL_END = (this.settings.direction === DIRECTION.horizontal) && (thumbLocation === LOCATION.end)
    const VERTICAL_BEGIN = (this.settings.direction === DIRECTION.vertical) && (thumbLocation === LOCATION.begin)

    if (HORIZONTAL_END || VERTICAL_BEGIN) {
      thumbPercentageValue = 100 - thumbPercentageValue
    }
    this._checkLimit(thumbLocation, thumbPercentageValue)
    return {
      side: this.thumbs[thumbLocation].getSide(),
      value: this.thumbs[thumbLocation].getPosition()
    }
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

  checkClickProgressBar(
    sliderParams: { [key: string]: number },
    clickPosition: number): {location: LOCATION, side: SIDE, value: number}  {
    const clickPercentValue = RangeSliderModel._pixelsToPercentInSlider(this.settings.direction, sliderParams, clickPosition)
    const reverseClickPercentValue = 100 - clickPercentValue

    let thumbLocation: LOCATION = LOCATION.end

    //если один бегунок
    if (this.settings.qtThumbs === QT_THUMBS.single) {
      if (this.settings.direction === DIRECTION.horizontal) {
        this.thumbs[thumbLocation].setPosition(reverseClickPercentValue)
      }
      if (this.settings.direction === DIRECTION.vertical) {
        this.thumbs[thumbLocation].setPosition(clickPercentValue)
      }
    }

    //если два бегунка, проверяем к какому клик был ближе, его и двигаем
    let dBegin = 0
    let dEnd = 0
    let value: number

    const thumbsPosition: {[key: string]: number} = {}
    for (let key in this.thumbs) {
      thumbsPosition[key] = this.thumbs[key].getPosition()
    }

    if (this.settings.qtThumbs === QT_THUMBS.double) {

      //для горизонтальных
      if (this.settings.direction === DIRECTION.horizontal) {
        dBegin = Math.abs(thumbsPosition[LOCATION.begin] - clickPercentValue)
        dEnd = Math.abs(reverseClickPercentValue - thumbsPosition[LOCATION.end])

        if(dBegin < dEnd) {
          thumbLocation = LOCATION.begin
          value = clickPercentValue
        } else {
          value = reverseClickPercentValue
        }
        this._checkLimit(thumbLocation, value)
      }
      //для вертикальных
      if (this.settings.direction === DIRECTION.vertical) {
        dBegin = Math.abs(reverseClickPercentValue - thumbsPosition[LOCATION.begin])
        dEnd = Math.abs(thumbsPosition[LOCATION.end] - clickPercentValue)

        if(dBegin < dEnd) {
          thumbLocation = LOCATION.begin
          value = reverseClickPercentValue
        } else {
          value = clickPercentValue
        }
        this._checkLimit(thumbLocation, value)
      }
    }
    return {
      location: thumbLocation,
      side: this.thumbs[thumbLocation].getSide(),
      value: this.thumbs[thumbLocation].getPosition()
    }
  }

  private _checkLimit = (thumbLocation: LOCATION, thumbPercentageValue: number) => {

    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
      return
    }
    //бегунки ограничивают друг друга
    if (this.settings.qtThumbs === QT_THUMBS.single) {
      this.thumbs[thumbLocation]?.setPosition(thumbPercentageValue)
      return;
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      let limit = 100 - this.settings.gap   //минимальное ограничение на отступ
      //проверка на ограничение по второму ползунку
      if (thumbLocation === LOCATION.begin) {
        limit = limit - this.thumbs[LOCATION.end]!.getPosition()
      } else if (thumbLocation === LOCATION.end) {
        limit = limit - this.thumbs[LOCATION.begin]!.getPosition()
      }
      //применить ограничения
      if (thumbPercentageValue > limit) {
        this.thumbs[thumbLocation]?.setPosition(limit)
      } else {
        this.thumbs[thumbLocation]?.setPosition(thumbPercentageValue)
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

