import $ from "jquery";
import styles from "./style.module.scss";
import {DIRECTION, LOCATION, THUMBS_VIEW, SLIDER_PROPS_OPTIONS, SIDE} from "./types/types";
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import {IController, RangeSliderController} from "./controller";


export interface IView {
  controller: IController;
  root: JQuery<HTMLElement>;

  mount(): void;
}

export class RangeSliderView implements IView {
  controller: RangeSliderController
  root: JQuery<HTMLElement>
  slider: JQuery<HTMLElement>
  thumbs: THUMBS_VIEW
  horizontal: boolean

  constructor(root: JQuery<HTMLElement>, options?: SLIDER_PROPS_OPTIONS) {
    this.controller = new RangeSliderController(options);
    this.root = root
    this.slider = $(`<div class='${styles.slider}'></div>`)
    this.thumbs = this._createThumbs(this.onMouseDown)
    this.horizontal = (this.controller.getDirection() === DIRECTION.horizontal)

    this.slider.on('mousedown', this.onClickProgressBar)
  }

  private _createThumbs(onMouseDown: (e: MouseDownEvent) => void): THUMBS_VIEW {
    const thumbs = this.controller.getThumbs()
    const result: THUMBS_VIEW = {
      end: $(''),
    }
    for (let key in thumbs) {
      let locationStyle
      key === LOCATION.end
        ? locationStyle = styles.thumb_end
        : locationStyle = styles.thumb_begin

      result[key] = $(`<div class='${styles.thumb} ${locationStyle}'></div>`)
      result[key].on('mousedown', {
        location: thumbs[key].location
      }, onMouseDown)
    }
    return result
  }

  onMouseDown = (e: MouseDownEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const location = e.data.location

    const onMouseMove = (e: MouseMoveEvent) => {
      this.root.off('mousedown', this.onClickProgressBar)
      let thumbPosition
      if (this.horizontal) {
        thumbPosition = e.clientX - ($('.' + styles.slider, this.root).offset()?.left || 0)
      } else {
        thumbPosition = e.clientY - ($('.' + styles.slider, this.root).offset()?.top || 0)
      }

      let sliderParams = {
        width: $('.' + styles.slider, this.root).width() || 1,
        height: $('.' + styles.slider, this.root).height() || 1,
      }

      let params:{side: SIDE, value: number} = this.controller.newThumbPosition(location, sliderParams, thumbPosition)
      $(this.thumbs[location]).parent().css(params.side, params.value + '%')
    }

    const onMouseUp = () => {
      $(document).off('mousemove', onMouseMove)
      $(document).off('mouseup', onMouseUp)
      //this.root.on('mousedown', this.onClickProgressBar)
    }

    $(document).on('mousemove', onMouseMove)
    $(document).on('mouseup', onMouseUp)
  }

  onClickProgressBar = (e: MouseDownEvent) => {

    let clickPosition
    if (this.horizontal) {
      clickPosition = e.clientX - ($('.' + styles.slider, this.root).offset()?.left || 0)
    } else {
      clickPosition = e.clientY - ($('.' + styles.slider, this.root).offset()?.top || 0)
    }

    let sliderParams = {
      width: $('.' + styles.slider, this.root).width() || 1,
      height: $('.' + styles.slider, this.root).height() || 1,
    }

    const params = this.controller.checkClickProgressBar(sliderParams, clickPosition)
    $(this.thumbs[params.location]).parent().css(params.side, params.value + '%')
  }

  mount() {
    const progress = $(`<div class='${styles.progress}'></div>`)
    for (let key in this.thumbs) {
      progress.append(this.thumbs[key])
    }
    const slider = this.slider.append(progress)
    let direction
    this.horizontal
      ? direction = styles.wrapper_horizontal
      : direction = styles.wrapper_vertical

    const wrapper = $(`<div class='${styles.wrapper} ${direction}'></div>`).append(slider)
    $(this.root).append(wrapper)
  }
}



