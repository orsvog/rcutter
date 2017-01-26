'use strict';

$(document).ready(() => {
    const options = {
        canvas: document.getElementById('js-editorcanvas'),
        preview: document.getElementById('js-previewcanvas'),
        sizeRule: 'contain'
    }
    $.rcutter = new RabbiCutter(options);
});

$('#js-fileinput').change(e => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = event => {
        img.src = event.target.result;
    };
    img.onload = () => {
        $.rcutter.loadImage(img);
    };

    reader.readAsDataURL(e.target.files[0]);
});
