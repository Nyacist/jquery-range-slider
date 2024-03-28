import {IModel, RangeSliderModel} from './model';
import {SLIDER_PROPS_OPTIONS, LOCATION} from "./types/types";

export interface IController {
  model: IModel;
  setSettings(options?: SLIDER_PROPS_OPTIONS): void;
}

export class RangeSliderController implements IController {
  model: RangeSliderModel;

  constructor(options?: SLIDER_PROPS_OPTIONS) {
    this.model = new RangeSliderModel(options);
  }

  setSettings(options?: SLIDER_PROPS_OPTIONS) {
    this.model.setSettings(options)
  }

  getThumbs() {
    return this.model.getThumbs()
  }

  setThumbPosition(thumbsPosition: LOCATION, sliderParams: {[key: string]: number}, elementPixels: string | number) {
    this.model.setThumbPosition(thumbsPosition, sliderParams, elementPixels)
  }

  getThumbPosition(thumbsLocation: LOCATION) {
    return this.model.getThumbPosition(thumbsLocation)
  }

  getThumbSide(thumbsLocation: LOCATION) {
    return this.model.getThumbSide(thumbsLocation)
  }

  getDirection() {
    return this.model.getDirection()
  }

}
