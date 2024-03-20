import $ from 'jquery';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

function pixelsToPercentInSlider(root: JQuery<HTMLElement>, orient: ORIENTATION, elementPixels: string | number): number {
  let sliderParams = 1
  if (orient === ORIENTATION.horizontal) {
    sliderParams = $('.slider', root).width() || 1
  } else if (orient === ORIENTATION.vertical) {
    sliderParams = $('.slider', root).height() || 1
  }

  //позиция нажатия в пикселях или в строке(из строки обрежутся только цифры и преобразуются в число)
  const countPixels = (typeof elementPixels === 'number') ? elementPixels : +elementPixels.replace(/[^0-9,.]/g, '')

  return Math.round(countPixels / sliderParams * 100)  //целочисленые проценты
}

const LOCATION = {
  begin: 'begin',
  end: 'end',
} as const
type LOCATION = keyof typeof LOCATION

const SIDE = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
} as const
type SIDE = keyof typeof SIDE

const ORIENTATION = {
  vertical: 'vertical',
  horizontal: 'horizontal',
} as const
type ORIENTATION = keyof typeof ORIENTATION

const QT_THUMBS = {
  single: 'single',
  double: 'double',
} as const
type QT_THUMBS = keyof typeof QT_THUMBS

export interface ISliderOptions {
  orientation?: ORIENTATION,
  qtThumbs?: QT_THUMBS,
  gap?: number,
}

interface ISliderSettings {
  orientation: ORIENTATION,
  qtThumbs: QT_THUMBS,
  gap: number,          // 0 < gap < 100, иначе 10
}

interface IThumbOptions {
  location: LOCATION,
  orientation: ORIENTATION,
  onMouseDown: (e: MouseDownEvent) => void
}

class Thumb {
  thumb: JQuery<HTMLElement>
  orientation: ORIENTATION
  location: LOCATION
  side: SIDE
  _positionInPercentage: number

  constructor(options: IThumbOptions) {
    this.thumb = $(`<div class='thumb thumb_${options.location}'></div>`)
    this.location = options.location || LOCATION.end
    this.orientation = options.orientation || ORIENTATION.horizontal

    this._positionInPercentage = 0
    this.side = SIDE.right
    this._setSide()

    $(this.thumb).on('mousedown', {thumb: this}, options.onMouseDown)
  }

  _setSide() {
    if (this.orientation === ORIENTATION.horizontal) {
      if (this.location === LOCATION.begin) {
        this.side = SIDE.left
      }
      if (this.location === LOCATION.end) {
        this.side = SIDE.right
      }
    } else if (this.orientation === ORIENTATION.vertical) {
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

  constructor(root: JQuery<HTMLElement>, options?: ISliderOptions) {
    this._root = root
    this.settings = {
      orientation: ORIENTATION.horizontal,
      qtThumbs: QT_THUMBS.single,
      gap: 10,
    }
    this.settings = {...this.settings, ...options}
    // 0 < gap < 100, иначе 10
    if (this.settings.gap < 0 || this.settings.gap > 100) {
      this.settings.gap = 10
    }

    this._thumbs = [new Thumb({
      location: LOCATION.end,
      orientation: this.settings.orientation,
      onMouseDown: this.onMouseDown,
    })]

    if (this.settings.qtThumbs === QT_THUMBS.double) {
      this._thumbs = [new Thumb({
        location: LOCATION.begin,
        orientation: this.settings.orientation,
        onMouseDown: this.onMouseDown,
      }),
        new Thumb({
          location: LOCATION.end,
          orientation: this.settings.orientation,
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
      if (this.settings.orientation === ORIENTATION.horizontal) {
        thumbPosition = e.clientX - ($('.slider', root).offset()?.left || 0)
      } else if (this.settings.orientation === ORIENTATION.vertical) {
        thumbPosition = e.clientY - ($('.slider', root).offset()?.top || 0)
      }

      let thumbPercentageValue = pixelsToPercentInSlider(root, this.settings.orientation, thumbPosition)

      const HORIZONTAL_END = (this.settings.orientation === ORIENTATION.horizontal) && (thumb.location === LOCATION.end)
      const VERTICAL_BEGIN = (this.settings.orientation === ORIENTATION.vertical) && (thumb.location === LOCATION.begin)

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
    if (this.settings.orientation === ORIENTATION.horizontal) {
      clickPosition = e.clientX - ($('.slider', this._root).offset()?.left || 0)
    } else if (this.settings.orientation === ORIENTATION.vertical) {
      clickPosition = e.clientY - ($('.slider', this._root).offset()?.top || 0)
    }

    const clickPercentValue = pixelsToPercentInSlider(this._root, this.settings.orientation, clickPosition)
    console.log(clickPercentValue)

    //если два бегунка, проверяем к какому клик был ближе, его и двигаем
    let dBegin = 0
    let dEnd = 0
    let reverseClickPercentValue = 100 - clickPercentValue
    if ((this.settings.qtThumbs === QT_THUMBS.double) && this._thumbs[1]) {
      if (this.settings.orientation === ORIENTATION.horizontal) {
        dBegin = Math.abs(thumbsPosition[0] - clickPercentValue)
        dEnd = Math.abs(reverseClickPercentValue - thumbsPosition[1])

        dBegin < dEnd ?
          this.checkLimit(this._thumbs[0], clickPercentValue)
          :
          this.checkLimit(this._thumbs[1], reverseClickPercentValue)
      }
      if (this.settings.orientation === ORIENTATION.vertical) {
        dBegin = Math.abs(reverseClickPercentValue - thumbsPosition[0])
        dEnd = Math.abs(thumbsPosition[1] - clickPercentValue)

        dBegin < dEnd ?
          this.checkLimit(this._thumbs[0], reverseClickPercentValue)
          :
          this.checkLimit(this._thumbs[1], clickPercentValue)
      }
      return
    }

    //если один бегунок
    this._thumbs[0].setPosition(clickPercentValue)
  }

  mount() {
    let progress = $('<div class="progress"></div>')
    this._thumbs.forEach((element) => {
      progress.append(element.thumb)
    })
    const slider = $(`<div class='slider slider_${this.settings.orientation}'></div>`).append(progress)
    $(this._root).append(slider)
  }
}
