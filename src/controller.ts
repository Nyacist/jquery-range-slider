import {IModel, RangeSliderModel} from './model';
import {ISliderOptions} from "./types/interfaces";
import {LOCATION} from "./types/types";

export interface IController {
  model: IModel;
  setSettings(options?: ISliderOptions): void;
}

export class RangeSliderController implements IController {
  model: RangeSliderModel;

  constructor(options?: ISliderOptions) {
    this.model = new RangeSliderModel(options);
  }

  setSettings(options?: ISliderOptions) {
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
  // checkLimit = (thumb: Thumb, thumbPercentageValue: number) => {
  //   // курсор вышел из слайдера => оставить бегунок в его границах.
  //   if (thumbPercentageValue < 0 || thumbPercentageValue > 100) {
  //     return
  //   }
  //   //бегунки ограничивают друг друга
  //   if (this.settings.qtThumbs === QT_THUMBS.single) {
  //     thumb.setPosition(thumbPercentageValue)
  //     return;
  //   }
  //   if (this.settings.qtThumbs === QT_THUMBS.double) {
  //     let limit = 100 - this.settings.gap   //минимальное ограничение на отступ
  //     //проверка на ограничение по второму ползунку
  //     if (thumb == this._thumbs[0] && this._thumbs[1]) {
  //       limit = limit - this._thumbs[1].getPosition()
  //     } else if (thumb == this._thumbs[1]) {
  //       limit = limit - this._thumbs[0].getPosition()
  //     }
  //     //применить ограничения
  //     if (thumbPercentageValue > limit) {
  //       thumb.setPosition(limit)
  //     } else {
  //       thumb.setPosition(thumbPercentageValue)
  //     }
  //   }
  // }

}
