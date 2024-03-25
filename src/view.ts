import $ from "jquery";
import styles from "./style.module.scss";
import {LOCATION, Thumbs, ViewThumbs} from "./types/types";



export interface IView {
  root: JQuery<HTMLElement>;
  thumbs: ViewThumbs;
  mount(): void;
}

export class RangeSliderView implements IView {
  root: JQuery<HTMLElement>
  thumbs: ViewThumbs

  constructor(root: JQuery<HTMLElement>, thumbs: Thumbs) {
    this.root = root
    this.thumbs = this.createThumbs(thumbs)
  }

  createThumbs(thumbs: Thumbs): ViewThumbs {
    const result: ViewThumbs = [$('')]
    thumbs.forEach((element, index) => {
      let location
      element.location === LOCATION.end
        ? location = styles.thumb_end
        : location = styles.thumb_begin

      result[index] = $(`<div class='${styles.thumb} ${location}'></div>`)
    })
    return result
  }

  updateThumbs(thumb: Thumbs) {

  }

  mount()
  {
    let progress = $(`<div class='${styles.progress}'></div>`)
    this.thumbs.forEach(element => progress.append(element))
    const slider = $(`<div class='${styles.slider}'></div>`).append(progress)
    let direction = styles.wrapper_horizontal
    // this.HORIZONTAL
    //   ? direction = styles.wrapper_horizontal
    //   : direction = styles.wrapper_vertical

    const wrapper = $(`<div class='${styles.wrapper} ${direction}'></div>`).append(slider)
    $(this.root).append(wrapper)
  }
}



