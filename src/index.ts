import $ from 'jquery';
import './style.css';
import {RangeSliderView} from "./view";
import {SLIDER_PROPS_OPTIONS} from "./types/types";

(function ($) {
  // $.fn.mySlider = function (options?: ISliderOptions) {
  //   const rangeSlider = new Slider(this, options);
  //   rangeSlider.mount();
  // }
  $.fn.myPlugin = function (options?: SLIDER_PROPS_OPTIONS) {
    const rangeSlider = new RangeSliderView(this, options);
    rangeSlider.mount();
  }
})($);

// $('#root').mySlider()
// $('#root2').mySlider({
//   direction: "horizontal",
//   qtThumbs: "double",
//   gap: 5
// })

$('#root').myPlugin()
$('#root2').myPlugin({
  direction: "horizontal",
  qtThumbs: "double",
  gap: 5,
  min: 100,
  max: 1100,
})
$('#root3').myPlugin({
  direction: "vertical"
})
$('#root4').myPlugin({
  direction: "vertical",
  qtThumbs: "double",
  gap: 5
})

