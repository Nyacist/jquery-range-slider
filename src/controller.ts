import {IModel, RangeSliderModel} from './model'

export interface IController {
    model: IModel;
}

export class RangeSliderController implements IController{
    model: RangeSliderModel;

    constructor() {
        this.model = new RangeSliderModel();
    }
}
