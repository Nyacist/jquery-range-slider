import $ from 'jquery';
import './style.css';
import {Slider, ISliderOptions} from "./slider";

(function ($) {
  $.fn.mySlider = function (options?: ISliderOptions) {
    const rangeSlider = new Slider(this, options);
    rangeSlider.mount();
  }
})($);

$('#root').mySlider()
$('#root2').mySlider({
  direction: "horizontal",
  qtThumbs: "double",
  gap: 5
})

$('#root3').mySlider({
  direction: "vertical",
  qtThumbs: "single",
  gap: 5
})

$('#root4').mySlider({
  direction: "vertical",
  qtThumbs: "double",
})
