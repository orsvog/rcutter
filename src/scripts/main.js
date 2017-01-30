'use strict';

$(document).ready(() => {
    const options = {
        canvas: document.getElementById('js-editorcanvas'),
        preview: document.getElementById('js-previewcanvas'),
        sizeRule: 'contain',
        cropShape: 'rectangle',
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

    reader.onload = event => {
        _loadImage(event.target.result);
    };

    reader.readAsDataURL(e.target.files[0]);
});

$('#js-allow-resize').change(e => {
    $.rcutter.allowCropResize($('#js-allow-resize').is(":checked"));
    $.rcutter.render();
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

function updateCropSize () {
    $.rcutter.updateCropSize($('#js-crop-x').val(), $('#js-crop-y').val());
    $.rcutter.render();
}

function getCropSize() {
    $('#js-crop-x').val($.rcutter.crop.size.x);
    $('#js-crop-y').val($.rcutter.crop.size.y);
}

function _loadImage(src) {
    const img = new Image();
    img.onload = () => {
        $.rcutter.loadImage(img);
    };
    img.src = src;
}
