import {IModel, RangeSliderModel} from './model'
import {IView, RangeSliderView} from "./view";
import {Thumbs} from "./types/types";
import {ISliderOptions} from "./types/interfaces";

export interface IController {
  model: IModel;
  view: IView;
  mount(): void;
  setSettings(options?: ISliderOptions): void;
}

export class RangeSliderController implements IController {
  model: RangeSliderModel;
  view: RangeSliderView;

  constructor(root: JQuery<HTMLElement>, options?: ISliderOptions) {
    this.model = new RangeSliderModel(options);
    const thumbs: Thumbs = this.model.getThumbs()
    this.view = new RangeSliderView(root, thumbs)
  }

  setSettings(options?: ISliderOptions) {
    this.model.setSettings(options)
  }

  createThumbs() {

    //this.view.createThumbs(thumbs)
  }

  mount() {
    this.view.mount()
    console.log(this.model)
  }
}
