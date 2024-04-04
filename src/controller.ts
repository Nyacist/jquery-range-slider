import {IModel, RangeSliderModel} from './model';
import {SLIDER_PROPS_OPTIONS, LOCATION, SLIDER_PARAMS, UPDATE_DATA} from "./types/types";

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

  newThumbPosition(
    thumbsPosition: LOCATION,
    sliderParams: SLIDER_PARAMS,
    positionInPixels: number):  UPDATE_DATA {
    return this.model.newThumbPosition(thumbsPosition, sliderParams, positionInPixels)
  }

  newValue(location: LOCATION, value: number): UPDATE_DATA {
    return this.model.newThumbValue(location, value)
  }

  getDirection() {
    return this.model.getDirection()
  }

  checkClickProgressBar(
    sliderParams: SLIDER_PARAMS,
    clickPosition: number): UPDATE_DATA {
    return this.model.checkClickProgressBar(sliderParams, clickPosition)
  }

}
