import $ from "jquery";
import styles from "./style.module.scss";
import {
  DIRECTION,
  LOCATION,
  THUMBS_VIEW,
  SLIDER_PROPS_OPTIONS,
  SIDE,
  SLIDER_PARAMS,
  UPDATE_DATA,
  INPUTS
} from "./types/types";
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import {IController, RangeSliderController} from "./controller";
import ChangeEvent = JQuery.ChangeEvent;


export interface IView {
  controller: IController;
  root: JQuery<HTMLElement>;

  mount(): void;
}

export class RangeSliderView implements IView {
  controller: RangeSliderController
  root: JQuery<HTMLElement>
  slider: JQuery<HTMLElement>
  progress: JQuery<HTMLElement>
  thumbs: THUMBS_VIEW
  horizontal: boolean
  inputs: INPUTS

  constructor(root: JQuery<HTMLElement>, options?: SLIDER_PROPS_OPTIONS) {
    this.controller = new RangeSliderController(options);
    this.root = root
    this.slider = $(`<div class='${styles.slider}'></div>`)
    this.progress = $(`<div class='${styles.progress}'></div>`)
    this.thumbs = this._createThumbs(this.onMouseDown)
    this.horizontal = (this.controller.getDirection() === DIRECTION.horizontal)

    this.inputs = this._createInputs(this.onChangeInput)

    this.slider.on('mousedown', this.onClickProgressBar)
  }

  private _createThumbs(onMouseDown: (e: MouseDownEvent) => void): THUMBS_VIEW {
    const thumbs = this.controller.getThumbs()
    let result: THUMBS_VIEW = {}
    for (let key in thumbs) {
      let locationStyle
      key === LOCATION.end
        ? locationStyle = styles.thumb_end
        : locationStyle = styles.thumb_begin
      if (key === LOCATION.begin || key === LOCATION.end) {
        result[key] = $(`<div class='${styles.thumb} ${locationStyle}'></div>`)
        result[key].on('mousedown', {location: thumbs[key].location}, onMouseDown)
      }
    }
    return result
  }

  private _createInputs(onChangeInput: (e: ChangeEvent) => void): INPUTS {
    const thumbs = this.controller.getThumbs()
    let result: INPUTS = {}

    for (let key in thumbs) {
      if (key === LOCATION.begin || key === LOCATION.end) {
        result[key] = $(`<input type="number" 
            class='${styles.input_value} '
            value=${thumbs[key].value}
        >`)
        result[key].on('change',{location: thumbs[key].location}, onChangeInput)
      }
    }
    return result
  }

  onChangeInput = (e: ChangeEvent) => {
    const location = e.data.location
    const val = $(e.currentTarget).val()

    const params: UPDATE_DATA = this.controller.newValue(location, val)
    //console.log(params)
    this._updateProgressBar(params.side, params.position)
    this._updateInput(location, params.value)
  }

  onMouseDown = (e: MouseDownEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const location = e.data.location

    const onMouseMove = (e: MouseMoveEvent) => {
      const thumbPosition = this._getClickPosition(e)
      const sliderParams = this._getSliderParams()

      const params: UPDATE_DATA = this.controller.newThumbPosition(location, sliderParams, thumbPosition)
      console.log(params)
      this._updateProgressBar(params.side, params.position)
      this._updateInput(location, params.value)
    }

    const onMouseUp = () => {
      $(document).off('mousemove', onMouseMove)
      $(document).off('mouseup', onMouseUp)
    }

    $(document).on('mousemove', onMouseMove)
    $(document).on('mouseup', onMouseUp)
  }

  onClickProgressBar = (e: MouseDownEvent) => {
    const clickPosition = this._getClickPosition(e)
    const sliderParams = this._getSliderParams()

    const params: UPDATE_DATA = this.controller.checkClickProgressBar(sliderParams, clickPosition)
    this._updateProgressBar(params.side, params.position)
    if (params.side === 'left' || params.side === 'bottom') {
      this._updateInput(LOCATION.begin, params.value)
    } else {
      this._updateInput(LOCATION.end, params.value)
    }
  }

  private _getClickPosition(e: MouseDownEvent | MouseMoveEvent): number {
    let position
    if (this.horizontal) {
      position = e.clientX - ($('.' + styles.slider, this.root).offset()?.left || 0)
    } else {
      position = e.clientY - ($('.' + styles.slider, this.root).offset()?.top || 0)
    }
    return position
  }

  private _getSliderParams(): SLIDER_PARAMS {
    return {
      width: $('.' + styles.slider, this.root).width() || 1,
      height: $('.' + styles.slider, this.root).height() || 1,
    }
  }

  private _updateProgressBar(side:SIDE, value: number){
    this.progress.css(side, value + '%')
  }

  private _updateInput(location: LOCATION, value: number) {
    this.inputs[location].val(value)
  }

  mount() {
    const inputs = $(`<div class='${styles.wrapper_inputs}'></div>`)
    for (let key in this.inputs) {
      if (key === LOCATION.begin || key === LOCATION.end) {
        inputs.append(this.inputs[key])
      }
    }

    for (let key in this.thumbs) {
      if (key === LOCATION.begin || key === LOCATION.end) {
        this.progress.append(this.thumbs[key])
      }
    }
    const slider = this.slider.append(this.progress)
    let direction
    this.horizontal
      ? direction = styles.wrapper_horizontal
      : direction = styles.wrapper_vertical

    const wrapper = $(`<div class='${styles.wrapper} ${direction}'></div>`).append(inputs).append(slider)
    $(this.root).append(wrapper)
  }
}



