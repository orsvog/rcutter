'use strict';

$(document).ready(() => {
    const options = {
        canvas: document.getElementById('js-editorcanvas'),
        preview: document.getElementById('js-previewcanvas'),
        sizeRule: 'contain',
        cropShape: 'circle',
        cropWindow: {
            shape: 'circle',
            pos: {x: 10, y: 10},
            size: {x: 100, y: 100},
            color: 'red',
            allowResize: true
        }
    }
    $.rcutter = new RabbiCutter(options);

    //_loadImage('https://s24.postimg.org/g3ftkgjtx/pic.jpg');
});

$('#js-fileinput').change(e => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = event => {
        _loadImage(event.target.result);
    };
    img.onload = () => {
        $.rcutter.loadImage(img);
    };

    reader.readAsDataURL(e.target.files[0]);
});

function downloadImage() {
    $.rcutter.downloadImage();
}

function updateShape (shape) {
    $.rcutter.updateCropShape(shape);
    $.rcutter.render();
}

function updateStyles (type) {
    $.rcutter.updateStyles(type);
    $.rcutter.render();
}

function _loadImage(src) {
    const img = new Image();
    img.onload = () => {
        $.rcutter.loadImage(img);
    };
    img.src = src;
}
