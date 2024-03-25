import $ from 'jquery';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import styles from './style.module.scss'
import {DIRECTION, QT_THUMBS, LOCATION, SIDE} from "./types/types";

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

export interface ISliderOptions {
  direction?: DIRECTION,
  qtThumbs?: QT_THUMBS,
  gap?: number,
}

interface ISliderSettings {
  direction: DIRECTION,
  qtThumbs: QT_THUMBS,
  gap: number,          // 0 < gap < 100, иначе 10
}

interface IThumbOptions {
  location: LOCATION,
  direction: DIRECTION,
  onMouseDown: (e: MouseDownEvent) => void
}

class Thumb {
  thumb: JQuery<HTMLElement>
  direction: DIRECTION
  location: LOCATION
  side: SIDE
  _positionInPercentage: number

  constructor(options: IThumbOptions) {
    let location
    options.location === LOCATION.end
      ? location = styles.thumb_end
      : location = styles.thumb_begin
    this.thumb = $(`<div class='${styles.thumb} ${location}'></div>`)
    this.location = options.location || LOCATION.end
    this.direction = options.direction || DIRECTION.horizontal

    this._positionInPercentage = 0
    this.side = SIDE.right
    this._setSide()

    $(this.thumb).on('mousedown', {thumb: this}, options.onMouseDown)
  }

  _setSide() {
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
    this._positionInPercentage = value
    $(this.thumb).parent().css(this.side, this._positionInPercentage + '%')
  }

  getPosition() {
    return this._positionInPercentage
  }
}

export class Slider {
  _root: JQuery<HTMLElement>;
  _thumbs: [Thumb] | [Thumb, Thumb];
  settings: ISliderSettings;
  HORIZONTAL: boolean;
  VERTICAL: boolean;

  constructor(root: JQuery<HTMLElement>, options?: ISliderOptions) {
    this._root = root
    //настройки по умолчанию
    this.HORIZONTAL = true
    this.VERTICAL = false
    this.settings = {
      direction: DIRECTION.horizontal,
      qtThumbs: QT_THUMBS.single,
      gap: 10,
    }

    this.settings = {...this.settings, ...options}
    // 0 < gap < 100, иначе 10
    if (this.settings.gap < 0 || this.settings.gap > 100) {
      this.settings.gap = 10
    }
    if(this.settings.direction === DIRECTION.vertical) {
      this.HORIZONTAL = false
      this.VERTICAL = true
    }

    this._thumbs = [new Thumb({
      location: LOCATION.end,
      direction: this.settings.direction,
      onMouseDown: this.onMouseDown,
    })]

    if (this.settings.qtThumbs === QT_THUMBS.double) {
      this._thumbs = [new Thumb({
        location: LOCATION.begin,
        direction: this.settings.direction,
        onMouseDown: this.onMouseDown,
      }),
        new Thumb({
          location: LOCATION.end,
          direction: this.settings.direction,
          onMouseDown: this.onMouseDown,
        })]
    }

    this._root.on('mousedown', this.onClickProgressBar)
  }

  checkLimit = (thumb: Thumb, thumbPercentageValue: number) => {
    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
      return
    }
    //бегунки ограничивают друг друга
    if (this.settings.qtThumbs === QT_THUMBS.single) {
      thumb.setPosition(thumbPercentageValue)
      return;
    }
    if (this.settings.qtThumbs === QT_THUMBS.double) {
      let limit = 100 - this.settings.gap   //минимальное ограничение на отступ
      //проверка на ограничение по второму ползунку
      if (thumb == this._thumbs[0] && this._thumbs[1]) {
        limit = limit - this._thumbs[1].getPosition()
      } else if (thumb == this._thumbs[1]) {
        limit = limit - this._thumbs[0].getPosition()
      }
      //применить ограничения
      if (thumbPercentageValue > limit) {
        thumb.setPosition(limit)
      } else {
        thumb.setPosition(thumbPercentageValue)
      }
    }
  }

  onMouseDown = (e: MouseDownEvent) => {
    e.preventDefault()

    const root = this._root
    const thumb = e.data.thumb

    const onMouseMove = (e: MouseMoveEvent) => {
      root.off('mousedown', this.onClickProgressBar)
      let thumbPosition = 0
      if (this.HORIZONTAL) {
        thumbPosition = e.clientX - ($('.' + styles.slider, root).offset()?.left || 0)
      } else if (this.VERTICAL) {
        thumbPosition = e.clientY - ($('.' + styles.slider, root).offset()?.top || 0)
      }

      let thumbPercentageValue = pixelsToPercentInSlider(root, this.settings.direction, thumbPosition)

      const HORIZONTAL_END = (this.HORIZONTAL) && (thumb.location === LOCATION.end)
      const VERTICAL_BEGIN = (this.VERTICAL) && (thumb.location === LOCATION.begin)

      if (HORIZONTAL_END || VERTICAL_BEGIN) {
        thumbPercentageValue = 100 - thumbPercentageValue
      }

      this.checkLimit(thumb, thumbPercentageValue)
    }

    const onMouseUp = () => {
      $(document).off('mousemove', onMouseMove)
      $(document).off('mouseup', onMouseUp)
      this._root.on('mousedown', this.onClickProgressBar)
    }

    $(document).on('mousemove', onMouseMove)
    $(document).on('mouseup', onMouseUp)
  }

  onClickProgressBar = (e: MouseDownEvent) => {
    const thumbsPosition = this._thumbs.map(thumb => thumb.getPosition())

    let clickPosition = 0
    if (this.HORIZONTAL) {
      clickPosition = e.clientX - ($('.' + styles.slider, this._root).offset()?.left || 0)
    } else if (this.VERTICAL) {
      clickPosition = e.clientY - ($('.' + styles.slider, this._root).offset()?.top || 0)
    }

    const clickPercentValue = pixelsToPercentInSlider(this._root, this.settings.direction, clickPosition)

    //если два бегунка, проверяем к какому клик был ближе, его и двигаем
    let dBegin = 0
    let dEnd = 0
    let reverseClickPercentValue = 100 - clickPercentValue
    if ((this.settings.qtThumbs === QT_THUMBS.double) && this._thumbs[1]) {
      //для горизонтальных
      if (this.HORIZONTAL) {
        dBegin = Math.abs(thumbsPosition[0] - clickPercentValue)
        dEnd = Math.abs(reverseClickPercentValue - thumbsPosition[1])

        dBegin < dEnd ?
          this.checkLimit(this._thumbs[0], clickPercentValue)
          :
          this.checkLimit(this._thumbs[1], reverseClickPercentValue)
        return;
      }
      //для вертикальных
      if (this.VERTICAL) {
        dBegin = Math.abs(reverseClickPercentValue - thumbsPosition[0])
        dEnd = Math.abs(thumbsPosition[1] - clickPercentValue)

        dBegin < dEnd ?
          this.checkLimit(this._thumbs[0], reverseClickPercentValue)
          :
          this.checkLimit(this._thumbs[1], clickPercentValue)
        return;
      }
    }

    //если один бегунок
    if (this.HORIZONTAL) {
      this._thumbs[0].setPosition(reverseClickPercentValue)
      return;
    }
    if (this.VERTICAL) {
      this._thumbs[0].setPosition(clickPercentValue)
      return;
    }
  }

  mount() {
    let progress = $(`<div class='${styles.progress}'></div>`)
    this._thumbs.forEach((element) => {
      progress.append(element.thumb)
    })
    const slider = $(`<div class='${styles.slider}'></div>`).append(progress)
    let direction
    this.HORIZONTAL
      ? direction = styles.wrapper_horizontal
      : direction = styles.wrapper_vertical

    const wrapper = $(`<div class='${styles.wrapper} ${direction}'></div>`).append(slider)
    $(this._root).append(wrapper)
  }
}
