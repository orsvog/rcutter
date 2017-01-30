'use strict';

$(document).ready(() => {
    const options = {
        canvas: document.getElementById('js-editorcanvas'),
        preview: document.getElementById('js-previewcanvas'),
        sizeRule: 'contain',
        cropShape: 'rectangle',
        cropWindow: {
            shape: 'circle',
            pos: {x: 800, y: 450},
            size: {x: 500, y: 300},
            color: 'white',
            allowResize: true
        }
    }
    $.rcutter = new RabbiCutter(options);

    _loadImage($.myImage);  // $.myImage --->  image.js
});

function showMenu() {
    $('.menu').show();
    console.log(123);
}
function closeMenu() {
    $('.menu').hide();
}

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
    getCropSize();
}

function getCropSize() {
    const size = $.rcutter.getCropSize();
    if (size) {
        $('#js-crop-x').val(size.x);
        $('#js-crop-y').val(size.y);
    }
}

function _loadImage(src) {
    $.rcutter.loadImage(src)
        .then(msg => {
            $('#js-message').text(msg);
            $('#js-message').removeClass('alert-warning').addClass('alert-success');
            $("input").prop('disabled', false);
        })
        .catch(msg => {
            $('#js-message').text(msg);
            $('#js-message').removeClass('alert-success').addClass('alert-warning');
            $("input").prop('disabled', true);
        });

}
