# range-slider-jquery-plugin
 
## Slider settings

Передаются как объект при создании слайдера

``` JS
$('#root').mySlider({
    //Settings
})
```

### direction

Ориентация слайдера. По умолчанию горизонтальная.

Для горизонтального (default):
``` JS 
direction: 'horizontal'
```
Для вертикального:
``` JS 
direction: 'vertical'
```

### qtThumbs

Количество ползунков слайдера. По умолчанию одинарный.

Для одинарного (default):
``` JS 
qtThumbs: 'single'
```
Для двойного:
``` JS 
qtThumbs: 'double'
```

### gap

Расстояние в % при котором ползунки не сближаются дальше.  
По умолчанию (default) = 10.  
```0 < gap < 100```
```JS
gap: 20
```
