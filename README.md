# Rabbi Cutter

Natural image cropper...

## Demo

[http://codepen.io/Guelderman/pen/VPyZOQ(http://codepen.io/Guelderman/pen/VPyZOQ).

## Basic setup

Include files:

```html
<script src="/path/to/jquery.js"></script><!-- jQuery is required -->
<script src="/path/to/rcutter.js"></script>
```

## Usage

#### simple

```html
<canvas id="js-editorcanvas"></canvas>
```

```js
const options = {
    canvas: document.getElementById('js-editorcanvas')
}
const rcutter = new RabbiCutter(options);
```

#### advanced

```html
<canvas id="js-editorcanvas"></canvas>
<canvas id="js-previewcanvas"></canvas> <!-- Cropper window area preview -->
```

```js
const options = {
    canvas: document.getElementById('js-editorcanvas'),
    preview: document.getElementById('js-previewcanvas'),
    sizeRule: 'contain',
    cropWindow: {
        shape: 'rectangle',
        pos: {x: 10, y: 10},
        size: {x: 200, y: 300},
        color: 'white',
        allowResize: true
    }
}
const rcutter = new RabbiCutter(options);
```

## Options

### canvas

- Require: Required

canvas element <canvas></canvas>
This is the only option that is required.

### preview

canvas element <canvas></canvas>
Cropper window area preview.

### sizeRule

- Default: `'contain'`
- Options:
  - `'contain'`: image will stay in parent area (no overflow) 
  - `'realsize'`: image will display on it natural size
  - `'stretchByWidth'`: image will stretch by width of his parent element
  - `'stretchByHeight'`: image will stretch by height of his parent element
  
### cropWindow

Contains parameters of crop area

### cropWindow.pos

- Default: '{x: 10, y: 10}'

Sets position of cropper window

### cropWindow.size

- Default: '{x: 150, y: 150}'

Sets size of cropper window.
If size is larger then image => { x: 50%, y: 50% }

### cropWindow.shape

- Default: `'rectangle'`
- Options:
  - `'rectangle'`
  - `'circle'`

### cropWindow.color

- Default: `'white'`

### cropWindow.allowResize

- Default: `true`

Allows or disallows resize of cropper window

## Methods

there are few
to be done..  I'm tired
