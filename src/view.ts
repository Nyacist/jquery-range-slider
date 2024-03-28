import $ from "jquery";
import styles from "./style.module.scss";
import {DIRECTION, LOCATION, THUMBS_VIEW, SLIDER_PROPS_OPTIONS} from "./types/types";
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
    this.thumbs = this.createThumbs(this.onMouseDown)
    this.horizontal = (this.controller.getDirection() === DIRECTION.horizontal)
  }

  createThumbs(onMouseDown: (e: MouseDownEvent) => void): THUMBS_VIEW {
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

    const root = this.root
    const location = e.data.location

    const onMouseMove = (e: MouseMoveEvent) => {
      let thumbPosition
      if (this.horizontal) {
        thumbPosition = e.clientX - ($('.' + styles.slider, root).offset()?.left || 0)
      } else {
        thumbPosition = e.clientY - ($('.' + styles.slider, root).offset()?.top || 0)
      }

      let sliderParams = {
        width: $('.' + styles.slider, root).width() || 1,
        height: $('.' + styles.slider, root).height() || 1,
      }

      this.controller.setThumbPosition(location, sliderParams, thumbPosition)
      const position = this.controller.getThumbPosition(location)
      const side = this.controller.getThumbSide(location) || 'right'
      $(this.thumbs[location]).parent().css(side, position + '%')
    }

    const onMouseUp = () => {
      $(document).off('mousemove', onMouseMove)
      $(document).off('mouseup', onMouseUp)
    }

    $(document).on('mousemove', onMouseMove)
    $(document).on('mouseup', onMouseUp)
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



