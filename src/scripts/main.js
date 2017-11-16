'use strict';

var rcutter;
document.addEventListener('DOMContentLoaded', () => {
    const options = {
        canvas: document.getElementById('js-editorcanvas'),
        preview: document.getElementById('js-previewcanvas'),
        sizeRule: 'contain',
        cropWindow: {
            shape: 'rectangle',
            pos: {
                x: 800,
                y: 450
            },
            size: {
                x: 500,
                y: 300
            },
            color: 'white',
            allowResize: true
        }
    }
    rcutter = new RabbiCutter(options);
    _loadImage(myImage); // myImage --->  image.js  default image
}, false);

function toggleMenu(display) {
    document.getElementById('menu').style.display = display;
}

document.getElementById('js-fileinput').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = event => {
        _loadImage(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);
}, false);

document.getElementById('js-allow-resize').addEventListener('change', (e) => {
    rcutter.allowCropResize(document.getElementById('js-allow-resize').checked);
    rcutter.render();
}, false);

function downloadImage() {
    rcutter.downloadImage();
}

function updateShape(shape) {
    rcutter.updateCropShape(shape);
    rcutter.render();
}

function updateStyles(type) {
    rcutter.updateStyles(type);
    rcutter.render();
}

function updateCropSize() {
    rcutter.updateCropSize(document.getElementById('js-crop-x').value, document.getElementById('js-crop-y').value);
    rcutter.render();
    getCropSize();
}

function getCropSize() {
    const size = rcutter.getCropSize();
    if (size) {
        document.getElementById('js-crop-x').value = size.x;
        document.getElementById('js-crop-x').value = size.y;
    }
}

function _loadImage(src) {
    rcutter.loadImage(src)
        .then(msg => {
            document.getElementById('js-message').innerText = msg;
            document.getElementById('js-message').classList.remove("alert-warning");
            document.getElementById('js-message').classList.add("alert-success");
            let inputs = document.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].disabled = false;
            }
        })
        .catch(msg => {
            document.getElementById('js-message').innerText = msg;
            document.getElementById('js-message').classList.remove("alert-success");
            document.getElementById('js-message').classList.add("alert-warning");
            let inputs = document.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
        });

}
