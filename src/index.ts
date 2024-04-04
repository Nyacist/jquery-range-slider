import $ from 'jquery';
import './style.css';
import {ISliderOptions} from "./slider";
import {RangeSliderView} from "./view";

(function ($) {
  // $.fn.mySlider = function (options?: ISliderOptions) {
  //   const rangeSlider = new Slider(this, options);
  //   rangeSlider.mount();
  // }
  $.fn.myPlugin = function (options?: ISliderOptions) {
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
  gap: 5
})
$('#root3').myPlugin({
  direction: "vertical"
})
$('#root4').myPlugin({
  direction: "vertical",
  qtThumbs: "double",
  gap: 5
})

