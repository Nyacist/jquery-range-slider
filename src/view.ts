
import {IController, RangeSliderController} from './controller'

export interface View {
    controller: IController;
    mount: () => void;
}

export class RangeSliderView implements View {
    controller: RangeSliderController;
    root: JQuery<HTMLElement>;

    constructor(root: JQuery<HTMLElement>) {
        this.controller = new RangeSliderController()
        this.root = root
    }

    mount(): void {
    }
}

