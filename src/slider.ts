import $ from 'jquery';
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

function pixelsToPercentInSlider(root: JQuery<HTMLElement>, elementPixels: string | number): number {
  const sliderWidth = $('.slider', root).width() || 1
  //позиция нажатия в пикселях или в строке(из строки обрежутся только цифры и преобразуются в число)
  const countPixels = (typeof elementPixels === 'number') ? elementPixels : +elementPixels.replace(/[^0-9,.]/g, '')

  return Math.round(countPixels / sliderWidth * 100)  //целочисленые проценты
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
    } /*else if (this.orientation === ORIENTATION.vertical) {
      if (this.location === LOCATION.begin) {
        this.side = SIDE.bottom
      }
      if (this.location === LOCATION.end) {
        this.side = SIDE.top
      }
    }*/
  }

  setPosition(value: number) {
    if (this.orientation === ORIENTATION.horizontal) {
      if (this.location === LOCATION.begin) {
        this._positionInPercentage = value
        $(this.thumb).parent().css('left', this._positionInPercentage + '%')
        //console.log('left ' + value)
      }
      if (this.location === LOCATION.end) {
        this._positionInPercentage = 100 - value
        $(this.thumb).parent().css('right', this._positionInPercentage + '%')
        //console.log('right ' + value)
      }
    }
    //дописать на вертикалность
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
    //console.log(thumbPercentageValue)
    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
      return
    }
    //бегунки ограничивают друг друга
    if (this.settings.qtThumbs === QT_THUMBS.double && this._thumbs[1]) {
      if (thumb == this._thumbs[0]) {
        const limit = 100 - this._thumbs[1].getPosition() - this.settings.gap
        if (thumbPercentageValue > limit) {
          thumb.setPosition(limit)
        } else {
          thumb.setPosition(thumbPercentageValue)
        }
      }
      if (thumb == this._thumbs[1]) {
        const limit = this._thumbs[0].getPosition() + this.settings.gap
        if (thumbPercentageValue < limit) {
          thumb.setPosition(limit)
        } else {
          thumb.setPosition(thumbPercentageValue)
        }
      }
    } else {
      thumb.setPosition(thumbPercentageValue)
    }
  }

  onMouseDown = (e: MouseDownEvent) => {
    e.preventDefault()

    const root = this._root
    const thumb = e.data.thumb

    const onMouseMove = (e: MouseMoveEvent) => {
      this._root.off('mousedown', this.onClickProgressBar)

      let thumbPosition = e.clientX - ($('.slider', root).offset()?.left || 0)
      const thumbPercentageValue = pixelsToPercentInSlider(root, thumbPosition)

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

    const clickPosition = e.clientX - ($('.slider', this._root).offset()?.left || 0)
    const clickValue = pixelsToPercentInSlider(this._root, clickPosition)

    //если два бегунка, проверяем к какому клик был ближе, его и двигаем
    if (this._thumbs[1]) {
      const distanceLeft = Math.abs(thumbsPosition[0] - clickValue)
      const distanceRight = Math.abs(100 - thumbsPosition[1] - clickValue)

      if (distanceLeft < distanceRight) {
        this.checkLimit(this._thumbs[0], clickValue)
      } else {
        this.checkLimit(this._thumbs[1], clickValue)
      }
      return
    }
    //если один бегунок
    this._thumbs[0].setPosition(clickValue)
  }

  mount() {
    let progress = $('<div class="progress"></div>')
    this._thumbs.forEach((element) => {
      progress.append(element.thumb)
    })
    const slider = $('<div class="slider"></div>').append(progress)
    $(this._root).append(slider)
  }
}
