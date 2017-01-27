'use strict';

class RabbiCutter {

    constructor (options) {
        this.canvas = options.canvas;
        this.canvasParent = $(this.canvas).parent();
        this.context = options.canvas.getContext('2d');
        this.canvasScale = 1;

        this.preview = options.preview;

        this.sizeRule = options.sizeRule;

        this.crop = {
            pos: {x:10, y:10},
            size: {x:100, y:100},
            dragSize: 8
        };

        this._initStyles();

        this.eventMouseMove = this._onmousemove.bind(this);
        this.eventMouseUp = this._onmouseup.bind(this);
        this.eventMouseLeave = this._onmouseleave.bind(this);

        window.onresize = this._onresize.bind(this);
    }

    loadImage (img) {
        this.crop = {
            pos: {x:10, y:10},
            size: {x:100, y:100},
            dragSize: 8
        };
        this.img = img;
        this.render();
        this.canvas.addEventListener('mousedown', this._onmousedown.bind(this));
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._displayImage();
        this._updateScale();
        this._drawCropWindow();
        this._fillPreview();
        this._updateStyles();
    }

    _onresize() {
        this._updateScale();
    }

    _onmousedown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        this.lastEvent = {
            position
        };

        if (this._inCropBounds(position.x * this.canvasScale, position.y * this.canvasScale)) {
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

    _updateScale () {
        this.canvasScale = this.canvas.width / this.canvasParent.width();
        console.log(this.canvasScale);
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
            this.crop.pos.x += dx * this.canvasScale;
            this.crop.pos.y += dy * this.canvasScale;
        }
    }

    _inCanvasBounds(x, y) {
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

    _updateStyles () {
        if (this.sizeRule === 'contain') {
            let styles;

            if(this.canvas.width / this.canvas.height > this.canvasParent.width() / this.canvasParent.height()) {
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
            $(this.canvas).css(styles);
        }

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
                if(this.canvas.width / this.canvas.height > this.canvasParent.width() / this.canvasParent.height()) {
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
