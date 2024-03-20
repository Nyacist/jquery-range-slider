

export interface IOptions {

}

export interface IModel {
    options: IOptions;
}

export class RangeSliderModel implements IModel{
    options: IOptions;
    defaultOptions: IOptions = {

    }
    constructor() {
        this.options = {...this.defaultOptions}
    }
}
