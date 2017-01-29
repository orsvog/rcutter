'use strict';

class RabbiCutter {

    constructor (options) {
        this.canvas = options.canvas;
        this.canvasParent = this.canvas.parentElement;
        this.context = options.canvas.getContext('2d');
        this.canvasScale = 1;

        this.preview = options.preview;
        this.sizeRule = options.sizeRule;
        this.cropShape = options.cropShape || 'rectangle';
        this.cropWindow = options.cropWindow;

        this.updateStyles(this.sizeRule);

        this.eventMouseMove = this._onmousemove.bind(this);
        this.eventMouseUp = this._onmouseup.bind(this);
        window.onresize = this._onresize.bind(this);
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._displayImage();
        this.updateStyles(this.sizeRule);
        this._updateScale();
        this._fillPreview();
        this._drawCropWindow();
    }

    loadImage (img) {
        //this.crop = $.extend(true, {}, this.cropWindow);
        this.crop = JSON.parse(JSON.stringify(this.cropWindow));
        this.img = img;
        this.render();
        this.canvas.addEventListener('mousedown', this._onmousedown.bind(this));
    }

    // events
    _onresize() {
        this._updateScale();
    }

    _onmousedown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        let cropAction;
        if (this._inDragBounds(position.x * this.canvasScale, position.y * this.canvasScale)) {
            cropAction = 'resize';
        } else if (this._inCropBounds(position.x * this.canvasScale, position.y * this.canvasScale)) {
            cropAction = 'drag';
        }

        this.lastEvent = {
            position,
            cropAction
        };

        this.canvas.addEventListener('mousemove', this.eventMouseMove);
        this.canvas.addEventListener('mouseup', this.eventMouseUp);
    }

    _onmousemove (e) {
        const position = { x: e.offsetX, y: e.offsetY };
        const dx = position.x - this.lastEvent.position.x;
        const dy = position.y - this.lastEvent.position.y;

        switch(this.lastEvent.cropAction) {
            case 'drag': {
                this._moveCropWindow(dx, dy);
                break;
            }
            case 'resize': {
                this._resizeCropWindow(dx, dy);
                break;
            }
            default:
                break;
        }

        this.lastEvent.position = position;
        this.render();
    }

    _onmouseup (e) {
        this.canvas.removeEventListener('mousemove', this.eventMouseMove);
        this.canvas.removeEventListener('mouseup', this.eventMouseUp);
    }
    //end events



    getCroppedImage () {
        return this.preview.toDataURL();
    }

    downloadImage(imageName = this._randomString() + '.png') {
        const link = document.createElement('a');
        link.href = this.getCroppedImage();
        link.download = imageName;
        link.click();
    }

    updateCropShape(cropShape) {
        this.cropShape = cropShape;

        if (this.cropShape === 'circle') {
            this.crop.size.y = this.crop.size.x < this.crop.size.y ? this.crop.size.x : this.crop.size.y;
            this.crop.size.x = this.crop.size.y;
        }
    }

    updateStyles (sizeRule) {
        // this.canvas.width  = this.canvas.offsetWidth;
        // this.canvas.height = this.canvas.offsetHeight;

        this.sizeRule = sizeRule;

        let styles;

        switch (this.sizeRule) {
            case 'realsize': {
                styles = {
                    width: 'auto',
                    height: 'auto'
                };
                break;
            }
            case 'stretchByWidth': {
                styles = {
                    width: '100%',
                    height: 'auto'
                };
                break;
            }
            case 'stretchByHeight': {
                styles = {
                    width: 'auto',
                    height: '100%'
                };
                break;
            }
            default:
            case 'contain': {
                if (this.canvas.width / this.canvas.height > this.canvasParent.offsetWidth / this.canvasParent.offsetHeight) {
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
        }

        $(this.canvas).css(styles);
    }

    _displayImage () {
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.context.drawImage(this.img,0,0);
    }

    _updateScale () {
        if(this.canvas.style.width === 'auto' && this.canvas.style.height === 'auto') {
            this.canvasScale = 1
        }
        else if (this.canvas.style.width === 'auto') {
            this.canvasScale = this.canvas.height / this.canvasParent.offsetHeight;
        } else {
            this.canvasScale = this.canvas.width / this.canvasParent.offsetWidth;
        }
    }

    _fillPreview () {
        if(this.crop.size.x === 0 || this.crop.size.y === 0) {
            return false;
        }
        const image = this.context.getImageData(this.crop.pos.x, this.crop.pos.y, this.crop.size.x, this.crop.size.y);
        if (!image) {
            return false;
        }

        const context = this.preview.getContext('2d');
        context.clearRect(0, 0, this.preview.width, this.preview.height);

        this.preview.width = image.width;
        this.preview.height = image.height;

        switch(this.cropShape) {
            default:
            case 'rectangle': {
                context.drawImage(this.canvas,
                    this.crop.pos.x, this.crop.pos.y,
                    this.crop.size.x, this.crop.size.y,
                    0, 0,
                    this.preview.width, this.preview.height);

                break;
            }
            case 'circle': {
                context.save();
                context.beginPath();
                context.arc(this.crop.size.x / 2, this.crop.size.y / 2, this.crop.size.x / 2, 0, Math.PI * 2, true);
                context.closePath();
                context.clip();

                context.drawImage(this.canvas,
                    this.crop.pos.x, this.crop.pos.y,
                    this.crop.size.x, this.crop.size.y,
                    0, 0,
                    this.preview.width, this.preview.height);

                context.beginPath();
                context.arc(0, 0, this.crop.size.x / 2, 0, Math.PI * 2, true);
                context.clip();
                context.closePath();
                context.restore();

                break;
            }
        }
    }

    _drawCropWindow () {
        this.context.strokeStyle = this.crop.color;
        this.context.lineWidth = 2;

        switch(this.cropShape) {
            default:
            case 'rectangle': {
                this.context.strokeRect(this.crop.pos.x, this.crop.pos.y, this.crop.size.x, this.crop.size.y);

                if(this.crop.allowResize) {
                    this.context.strokeRect(this.crop.pos.x + this.crop.size.x - 4 * this.canvasScale,
                        this.crop.pos.y + this.crop.size.y - 4 * this.canvasScale,
                        8 * this.canvasScale, 8 * this.canvasScale);
                }

                break;
            }
            case 'circle': {
                this.context.beginPath();
                this.context.arc(this.crop.pos.x + this.crop.size.x / 2, this.crop.pos.y + this.crop.size.y / 2, this.crop.size.x / 2, 0, 2 * Math.PI);
                this.context.stroke();

                if(this.crop.allowResize) {
                    this.context.strokeRect(this.crop.pos.x + this.crop.size.x - 4 * this.canvasScale,
                        this.crop.pos.y + this.crop.size.y / 2 - 4 * this.canvasScale,
                        8 * this.canvasScale, 8 * this.canvasScale);
                }

                break;
            }
        }
    }

    _moveCropWindow(dx, dy) {
        //top left point
        const tl = {
            x: this.crop.pos.x,
            y: this.crop.pos.y
        };
        //bottom right point
        const br = {
            x: this.crop.pos.x + this.crop.size.x,
            y: this.crop.pos.y + this.crop.size.y
        };

        let x, y;
        if ((tl.x + dx) < 0) {
            x = 0;
        } else if ((br.x + dx) > this.canvas.width) {
            x = this.canvas.width - this.crop.size.x;
        } else {
            x = this.crop.pos.x + dx * this.canvasScale;
        }

        if ((tl.y + dy) < 0) {
            y = 0;
        } else if ((br.y + dy) > this.canvas.height) {
            y = this.canvas.height - this.crop.size.y;
        } else {
            y = this.crop.pos.y + dy * this.canvasScale;
        }

        this.crop.pos.x = x;
        this.crop.pos.y = y;
    }

    _resizeCropWindow(dx, dy) {
        this.crop.size.x += dx * this.canvasScale;
        this.crop.size.y += dy * this.canvasScale;

        if(this.cropShape === 'circle') {
            this.crop.size.y = this.crop.size.x;
        }
    }

    _inCropBounds(x, y) {
        return x >= this.crop.pos.x
            && x <= this.crop.pos.x + this.crop.size.x
            && y >= this.crop.pos.y
            && y <= this.crop.pos.y + this.crop.size.y;
    }

    _inDragBounds(x, y) {
        switch(this.cropShape) {
            case 'rectangle': {
                return x >= this.crop.pos.x + this.crop.size.x - 4 * this.canvasScale
                    && x <= this.crop.pos.x + this.crop.size.x + 4 * this.canvasScale
                    && y >= this.crop.pos.y + this.crop.size.y - 4 * this.canvasScale
                    && y <= this.crop.pos.y + this.crop.size.y + 4 * this.canvasScale;

                break;
            }
            case 'circle': {
                return x >= this.crop.pos.x + this.crop.size.x - 4 * this.canvasScale
                    && x <= this.crop.pos.x + this.crop.size.x + 4 * this.canvasScale
                    && y >= this.crop.pos.y + this.crop.size.y / 2 - 4 * this.canvasScale
                    && y <= this.crop.pos.y + this.crop.size.y / 2 + 4 * this.canvasScale;

                break;
            }
            default:
        }
    }

    _randomString(length = 5) {
        let result = "";
        const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( let i = 0; i < length; i++ ) {
            result += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
        return result;
    }
}
