import $ from 'jquery';
import jQuery from 'jquery';
import './style.scss';
import {Slider, ISliderOptions} from "./slider";

declare global {
    interface JQuery {
        mySlider(options?: ISliderOptions): void
    }
}

(function ( $ ) {
    $.fn.mySlider = function(options?: ISliderOptions) {
        const rangeSlider = new Slider(this, options);
        rangeSlider.mount();
    }
})( jQuery );

$('#root').mySlider()
$('#root2').mySlider({
    orientation: "horizontal",
    qtThumbs: "double",
    gap: 5
})


