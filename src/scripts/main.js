'use strict';

$(document).ready(() => {
    const options = {
        canvas: document.getElementById('js-editorcanvas'),
        preview: document.getElementById('js-previewcanvas'),
        sizeRule: 'contain'
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

function _loadImage(src) {
    const img = new Image();
    img.onload = () => {
        $.rcutter.loadImage(img);
    };
    img.src = src;
}
