import {ISliderOptions} from "./src/slider";

declare global {
  interface JQuery {
    mySlider(options?: ISliderOptions): void
    myPlugin(options?: ISliderOptions): void
  }
}

