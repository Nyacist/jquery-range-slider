import {
  DIRECTION,
  LOCATION,
  QT_THUMBS,
  SIDE,
  THUMBS_ARRAY,
  SLIDER_PROPS_OPTIONS,
  SLIDER_SETTINGS,
  THUMB_OPTIONS, UPDATE_DATA,
} from "./types/types";
import {IThumb} from "./types/interfaces";


class Thumb implements IThumb {
  location: LOCATION
  direction: DIRECTION
  side: SIDE
  min: number
  max: number
  positionInPercentage: number
  valueInPercentage: number
  value: number

  constructor(options: THUMB_OPTIONS) {
    this.location = options.location || LOCATION.end
    this.direction = options.direction || DIRECTION.horizontal

    this.min = options.min || 0
    this.max = options.max || 100

    this.positionInPercentage = 0
    this.valueInPercentage = 100
    this.value = 100

    this.side = SIDE.right
    this._setThumbSide()

    this.setPosition(0)
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
    this.setValueInPercentage()
  }

  getPosition(): number {
    return this.positionInPercentage
  }

  setValueInPercentage () {
    //общий прогресс шкалы
    if (this.side === SIDE.right || this.side === SIDE.bottom) {
      this.valueInPercentage = 100 - this.positionInPercentage
    } else {
      this.valueInPercentage = this.positionInPercentage
    }
    this.setValue()
  }

  setValue() {
    let val = this.min + ((this.max - this.min) / 100 * this.valueInPercentage)
    val = Math.round(val)
    this.value = val
  }

  getValue() {
    return this.value
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
      min: 0,
      max: 100,
    }
    this.setSettings(options)

    this.thumbs = {
      [LOCATION.end]: new Thumb({
        location: LOCATION.end,
        direction: this.settings.direction,
        min: this.settings.min,
        max: this.settings.max,
      }),
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      this.thumbs[LOCATION.begin] = new Thumb({
        location: LOCATION.begin,
        direction: this.settings.direction,
        min: this.settings.min,
        max: this.settings.max,
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
    positionInPixels: number): UPDATE_DATA {
    let thumbPercentageValue = RangeSliderModel._pixelsToPercentInSlider(this.settings.direction, sliderParams, positionInPixels)

    const HORIZONTAL_END = (this.settings.direction === DIRECTION.horizontal) && (thumbLocation === LOCATION.end)
    const VERTICAL_BEGIN = (this.settings.direction === DIRECTION.vertical) && (thumbLocation === LOCATION.begin)

    if (HORIZONTAL_END || VERTICAL_BEGIN) {
      thumbPercentageValue = 100 - thumbPercentageValue
    }
    this._checkLimit(thumbLocation, thumbPercentageValue)
    return {
      side: this.thumbs[thumbLocation].getSide(),
      position: this.thumbs[thumbLocation].getPosition(),
      value: this.thumbs[thumbLocation].getValue(),
    }
  }

  newThumbValue(location: LOCATION, value: number):  UPDATE_DATA {
    let valToPercent = (value - this.settings.min) * 100 / (this.settings.max - this.settings.min)

    const HORIZONTAL_END = (this.settings.direction === DIRECTION.horizontal) && (location === LOCATION.end)
    const VERTICAL_BEGIN = (this.settings.direction === DIRECTION.vertical) && (location === LOCATION.begin)

    if (HORIZONTAL_END || VERTICAL_BEGIN) {
      valToPercent = 100 - valToPercent
    }
    this._checkLimit(location, valToPercent)
    return {
      side: this.thumbs[location].getSide(),
      position: this.thumbs[location].getPosition(),
      value: this.thumbs[location].getValue(),
    }
  }

  checkClickProgressBar(
    sliderParams: { [key: string]: number },
    clickPosition: number): UPDATE_DATA {
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

    const thumbsPosition: { [key: string]: number } = {}
    for (let key in this.thumbs) {
      thumbsPosition[key] = this.thumbs[key].getPosition()
    }

    if (this.settings.qtThumbs === QT_THUMBS.double) {
      //для горизонтальных
      if (this.settings.direction === DIRECTION.horizontal) {
        dBegin = Math.abs(thumbsPosition[LOCATION.begin] - clickPercentValue)
        dEnd = Math.abs(reverseClickPercentValue - thumbsPosition[LOCATION.end])

        if (dBegin < dEnd) {
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

        if (dBegin < dEnd) {
          thumbLocation = LOCATION.begin
          value = reverseClickPercentValue
        } else {
          value = clickPercentValue
        }
        this._checkLimit(thumbLocation, value)
      }
    }
    return {
      side: this.thumbs[thumbLocation].getSide(),
      position: this.thumbs[thumbLocation].getPosition(),
      value: this.thumbs[thumbLocation].getValue(),
    }
  }

  getDirection(): DIRECTION {
    return this.settings.direction
  }

  private _checkLimit = (thumbLocation: LOCATION, thumbPercentageValue: number) => {

    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
      return
    }
    //бегунки ограничивают друг друга
    if (this.settings.qtThumbs === QT_THUMBS.single) {
      this.thumbs[thumbLocation].setPosition(thumbPercentageValue)
      return;
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      let limit = 100 - this.settings.gap   //минимальное ограничение на отступ
      //проверка на ограничение по второму ползунку
      if (thumbLocation === LOCATION.begin) {
        limit = limit - this.thumbs[LOCATION.end].getPosition()
      } else if (thumbLocation === LOCATION.end) {
        limit = limit - this.thumbs[LOCATION.begin].getPosition()
      }
      //применить ограничения
      if (thumbPercentageValue > limit) {
        this.thumbs[thumbLocation].setPosition(limit)
      } else {
        this.thumbs[thumbLocation].setPosition(thumbPercentageValue)
      }
    }
  }

  private static _pixelsToPercentInSlider(direction: DIRECTION, sliderProps: { [key: string]: number }, positionInPixels: number): number {
    let sliderParams = 1
    if (direction === DIRECTION.horizontal) {
      sliderParams = sliderProps.width
    } else if (direction === DIRECTION.vertical) {
      sliderParams = sliderProps.height
    }

    //позиция нажатия в пикселях или в строке(из строки обрежутся только цифры и преобразуются в число)
    //const countPixels = (typeof positionInPixels === 'number') ? positionInPixels : +positionInPixels.replace(/[^0-9,.]/g, '')
    return Math.round(positionInPixels / sliderParams * 100)  //целочисленые проценты
  }
}

