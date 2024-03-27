import $ from "jquery";
import styles from "./style.module.scss";
import {LOCATION} from "./types/types";
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import {IController, RangeSliderController} from "./controller";
import {ISliderOptions, IViewThumbs} from "./types/interfaces";


export interface IView {
  controller: IController;
  root: JQuery<HTMLElement>;

  mount(): void;
}

export class RangeSliderView implements IView {
  controller: RangeSliderController
  root: JQuery<HTMLElement>
  slider: JQuery<HTMLElement>
  thumbs: IViewThumbs

  constructor(root: JQuery<HTMLElement>, options?: ISliderOptions) {
    this.controller = new RangeSliderController(options);
    this.root = root
    this.slider = $(`<div class='${styles.slider}'></div>`)
    this.thumbs = this.createThumbs(this.onMouseDown)
  }

  createThumbs(onMouseDown: (e: MouseDownEvent) => void): IViewThumbs {
    const thumbs = this.controller.getThumbs()
    const result: IViewThumbs = {
      end: $(''),
    }
    for (let key in thumbs) {
      let location
      key === LOCATION.end
        ? location = styles.thumb_end
        : location = styles.thumb_begin

      result[key] = $(`<div class='${styles.thumb} ${location}'></div>`)
      result[key].on('mousedown', {
        thumb: result[key],
        location: thumbs[key].location
      }, onMouseDown)
    }
    // thumbs.forEach((element) => {
    //   let location
    //   element.location === LOCATION.end
    //     ? location = styles.thumb_end
    //     : location = styles.thumb_begin
    //
    //   result[element.location] = $(`<div class='${styles.thumb} ${location}'></div>`)
    //   result[element.location].on('mousedown', {
    //     thumb: result[element.location],
    //     location: element.location
    //   }, onMouseDown)
    // })
    return result
  }

  onMouseDown = (e: MouseDownEvent) => {
    e.preventDefault()

    const root = this.root
    const thumb = e.data.thumb
    const location = e.data.location

    const onMouseMove = (e: MouseMoveEvent) => {
      let thumbPosition = 0
      //if (this.HORIZONTAL) {
      thumbPosition = e.clientX - ($('.' + styles.slider, root).offset()?.left || 0)
      // } else if (this.VERTICAL) {
      //   thumbPosition = e.clientY - ($('.' + styles.slider, root).offset()?.top || 0)
      // }

      let sliderParams = {
        width: $('.' + styles.slider, root).width() || 1,
        height: $('.' + styles.slider, root).height() || 1,
      }

// thumbsPosition: LOCATION,sliderParams: {[key: string]: number}, elementPixels: string | number
      this.controller.setThumbPosition(location, sliderParams, thumbPosition)
      const position = this.controller.getThumbPosition(location)
      const side = this.controller.getThumbSide(location)
      $(this.thumbs[location]).parent().css(side, position + '%')
      //let thumbPercentageValue = this.controller.getThumbPercentageValue(this.root, thumb,  thumbPosition)
      //
      // const HORIZONTAL_END = (this.HORIZONTAL) && (thumb.location === LOCATION.end)
      // const VERTICAL_BEGIN = (this.VERTICAL) && (thumb.location === LOCATION.begin)
      //
      // if (HORIZONTAL_END || VERTICAL_BEGIN) {
      //   thumbPercentageValue = 100 - thumbPercentageValue
      // }
      //
      // this.checkLimit(thumb, thumbPercentageValue)
    }

    const onMouseUp = () => {
      $(document).off('mousemove', onMouseMove)
      $(document).off('mouseup', onMouseUp)
    }

    $(document).on('mousemove', onMouseMove)
    $(document).on('mouseup', onMouseUp)
  }

  mount() {
    let progress = $(`<div class='${styles.progress}'></div>`)
    for (let key in this.thumbs) {
      progress.append(this.thumbs[key])
    }
    //this.thumbs.forEach(element => progress.append(element))
    const slider = this.slider.append(progress)
    let direction = styles.wrapper_horizontal
    // this.HORIZONTAL
    //   ? direction = styles.wrapper_horizontal
    //   : direction = styles.wrapper_vertical

    const wrapper = $(`<div class='${styles.wrapper} ${direction}'></div>`).append(slider)
    $(this.root).append(wrapper)
  }
}



