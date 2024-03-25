import $ from 'jquery';
import './style.css';
import {Slider, ISliderOptions} from "./slider";
import {RangeSliderController} from "./controller";

(function ($) {
  $.fn.mySlider = function (options?: ISliderOptions) {
    const rangeSlider = new Slider(this, options);
    rangeSlider.mount();
  }
  $.fn.myPlugin = function (options?: ISliderOptions) {
    const rangeSlider = new RangeSliderController(this, options);
    rangeSlider.mount();
  }
})($);

$('#root').mySlider()
$('#root2').mySlider({
  direction: "horizontal",
  qtThumbs: "double",
  gap: 5
})

$('#root3').myPlugin()
$('#root4').myPlugin({
  direction: "horizontal",
  qtThumbs: "double",
  gap: 5
})

