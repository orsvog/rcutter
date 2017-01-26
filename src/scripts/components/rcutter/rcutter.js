'use strict';

class RabbiCutter {

    constructor (options) {
        this.canvas = options.canvas;
        this.context = options.canvas.getContext('2d');

        this.preview = options.preview;

        this.sizeRule = options.sizeRule;

        this.crop = {
            pos: {x:10, y:10},
            size: {x:100, y:100},
            dragSize: 8
        }

        this._initStyles();

        this.eventMouseMove = this._onmousemove.bind(this);
        this.eventMouseUp = this._onmouseup.bind(this);
        this.eventMouseLeave = this._onmouseleave.bind(this);
    }

    loadImage (img) {
        this.img = img;
        this.render();
        this.canvas.addEventListener('mousedown', this._onmousedown.bind(this));

    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._displayImage();
        this._fillPreview();
        this._drawCropWindow();
    }

    _onmousedown(e) {
        const position = { x: e.offsetX, y: e.offsetY };

        this.lastEvent = {
            position
        };

        if (this._inCropBounds(position.x, position.y)) {
            this.canvas.addEventListener('mousemove', this.eventMouseMove);
            this.canvas.addEventListener('mouseup', this.eventMouseUp);
            this.canvas.addEventListener('mouseleave', this.eventMouseLeave);
        }
    }

    _onmousemove (e) {
        const position = { x: e.offsetX, y: e.offsetY };
        const dx = position.x - this.lastEvent.position.x;
        const dy = position.y - this.lastEvent.position.y;

        this._moveCropWindow(dx, dy);

        this.lastEvent.position = position;
        this.render();
    }

    _onmouseup (e) {
        this.canvas.removeEventListener('mousemove', this.eventMouseMove);
        this.canvas.removeEventListener('mouseup', this.eventMouseUp);
        this.canvas.removeEventListener('mouseleave', this.eventMouseLeave);
    }

    _onmouseleave (e) {
        this.canvas.removeEventListener('mousemove', this.eventMouseMove);
        this.canvas.removeEventListener('mouseup', this.eventMouseUp);
        this.canvas.removeEventListener('mouseleave', this.eventMouseLeave);
    }

    _displayImage () {
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.context.drawImage(this.img,0,0);

    }

    _fillPreview () {
        const image = this.context.getImageData(this.crop.pos.x, this.crop.pos.y, this.crop.size.x, this.crop.size.y);
        if (!image) {
            return false;
        }

        const context = this.preview.getContext('2d');
        context.clearRect(0, 0, this.preview.width, this.preview.height);

        this.preview.width = image.width;
        this.preview.height = image.height;

        context.drawImage(this.canvas,
            this.crop.pos.x, this.crop.pos.y,
            this.crop.size.x, this.crop.size.y,
            0, 0,
            this.preview.width, this.preview.height);
    }

    _drawCropWindow () {
        this.context.strokeStyle = 'black';
        this.context.fillStyle = 'red';
        this.context.strokeRect(this.crop.pos.x, this.crop.pos.y, this.crop.size.x, this.crop.size.y);

        this.context.fillRect(this.crop.pos.x + this.crop.size.x - this.crop.dragSize / 2,
            this.crop.pos.y + this.crop.size.y - this.crop.dragSize / 2,
            this.crop.dragSize, this.crop.dragSize);
    }

    _moveCropWindow(dx, dy) {
        //top left
        const tl = {
            x: this.crop.pos.x,
            y: this.crop.pos.y
        };
        //bottom right
        const br = {
            x: this.crop.pos.x + this.crop.size.x,
            y: this.crop.pos.y + this.crop.size.y
        };

        if (this._inCanvasBounds(tl.x + dx, tl.y + dy) &&
            this._inCanvasBounds(br.x + dx, tl.y + dy) &&
            this._inCanvasBounds(br.x + dx, br.y + dy) &&
            this._inCanvasBounds(tl.x + dx, br.y + dy))
        {
            this.crop.pos.x += dx;
            this.crop.pos.y += dy;
        }
    }

    _inCanvasBounds(x, y) {
        console.log(x + ' - ' + this.canvas.width);
        return x >= 0
            && x <= this.canvas.width
            && y >= 0
            && y <= this.canvas.height;
    }

    _inCropBounds(x, y) {
        return x >= this.crop.pos.x
            && x <= this.crop.pos.x + this.crop.size.x
            && y >= this.crop.pos.y
            && y <= this.crop.pos.y + this.crop.size.y;
    }

    _initStyles () {
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        let styles;

        switch (this.sizeRule) {
            case 'stretchByWidth':
                styles = {
                    width: '100%',
                    height: 'auto'
                };
                break;
            case 'stretchByHeight':
                styles = {
                    width: 'auto',
                    height: '100%'
                };
                break;
            case 'stretch':
                styles = {
                    width: '100%',
                    height: '100%'
                };
                break;
            default:
            case 'contain':
                const parent = $(this.canvas).parent();

                if(this.canvas.width / this.canvas.height > parent.width() / parent.height()) {
                    styles = {
                        width: '100%',
                        height: 'auto',
                        margin: 'auto'
                    };
                } else {
                    styles = {
                        width: 'auto',
                        height: '100%',
                        margin: 'auto'
                    };
                }
                break;

        }

        $(this.canvas).css(styles);
    }
}
