'use strict';

class RabbiCutter {

    constructor (options) {

        if(!options.canvas || options.canvas.tagName !== 'CANVAS') {
            return { msg: 'invalid options' };
        }

        if(!options.preview || options.preview.tagName !== 'CANVAS') {
            options.preview = document.createElement('canvas');
        }

        options = Object.assign({}, this._getDefaultOptions(), options);


        this.canvas = options.canvas;
        this.canvasParent = this.canvas.parentElement;
        this.context = options.canvas.getContext('2d');
        this.canvasScale = 1;
        this.resizeRect = 9;
        this._updateResizeRect();

        this.preview = options.preview;
        this.sizeRule = options.sizeRule;
        this.cropWindow = options.cropWindow;

        this.updateStyles(this.sizeRule);

        this.eventMouseMove = this._onmousemove.bind(this);
        this.eventMouseUp = this._onmouseup.bind(this);
    }

    render() {
        if(!this._imageIsLoaded()) {
            return;
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._displayImage();
        this.updateStyles(this.sizeRule);
        this._updateScale();
        this._updateResizeRect();
        this._fillPreview();
        if(this.isLoading) {
            this._validateCropWindowParameters();
        }
        this._drawCropWindow();

        return true;
    }

    loadImage (src) {
        this.isLoading = true;

        this.crop = JSON.parse(JSON.stringify(this.cropWindow));
        this.img = new Image();

        return new Promise(function(resolve, reject) {
            this.img.onload = () => {
                this.render();
                this.canvas.addEventListener('mousedown', this._onmousedown.bind(this));
                this.canvas.addEventListener('touchstart', this._onmousedown.bind(this));
                window.addEventListener('resize', this._onresize.bind(this));

                resolve('Image has been successfully loaded');
            };

            this.img.onerror = () => {
                reject('Image couldn\'t be loaded');
            };

            this.img.src = src;
        }.bind(this));
    }

    // events
    _onresize(e) {
        this._updateScale();
        this._updateResizeRect();
    }

    _onmousedown(e) {
        //e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const position = {
            x: e.pageX || e.touches[0].pageX,
            y: e.pageY || e.touches[0].pageY
        };

        let cropAction;
        if (this.crop.allowResize && this._inDragBounds((position.x - rect.left) * this.canvasScale, (position.y - rect.top) * this.canvasScale)) {
            cropAction = 'resize';
        } else if (this._inCropBounds((position.x - rect.left) * this.canvasScale, (position.y - rect.top) * this.canvasScale)) {
            cropAction = 'drag';
        }

        this.lastEvent = {
            position,
            cropAction
        };

        if (cropAction) {
            window.addEventListener('mousemove', this.eventMouseMove);
            window.addEventListener('mouseup', this.eventMouseUp);
            this.canvas.addEventListener('touchmove', this.eventMouseMove);
            this.canvas.addEventListener('touchend', this.eventMouseUp);
        }
    }

    _onmousemove (e) {
        e.preventDefault();
        const position = {
            x: e.pageX || e.touches[0].pageX,
            y: e.pageY || e.touches[0].pageY
        };
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
        e.preventDefault();
        window.removeEventListener('mousemove', this.eventMouseMove);
        window.removeEventListener('mouseup', this.eventMouseUp);
        this.canvas.addEventListener('touchmove', this.eventMouseMove);
        this.canvas.addEventListener('touchend', this.eventMouseUp);
    }
    //end events



    getCroppedImage () {
        if(!this._imageIsLoaded()) {
            return;
        }
        return this.preview.toDataURL();
    }

    downloadImage(imageName = this._randomString() + '.png') {
        if(!this._imageIsLoaded()) {
            return;
        }
        const link = document.createElement('a');
        link.href = this.getCroppedImage();
        link.download = imageName;
        link.click();

        return true;
    }

    updateCropShape(cropShape) {
        if(!this._imageIsLoaded()) {
            return;
        }
        this.crop.shape = cropShape;
        this.cropWindow.shape = cropShape;

        if (this.crop.shape === 'circle') {
            this.crop.size.y = this.crop.size.x < this.crop.size.y ? this.crop.size.x : this.crop.size.y;
            this.crop.size.x = this.crop.size.y;
        }

        return true;
    }

    updateCropSize(x, y) {
        if(!this._imageIsLoaded()) {
            return;
        }
        if (x > this.canvas.width - this.crop.pos.x) {
            x = this.canvas.width - this.crop.pos.x;
        }
        if (y > this.canvas.height - this.crop.pos.y) {
            y = this.canvas.height - this.crop.pos.y;
        }
        this.crop.size = { x: x*1, y: y*1 };
        this.cropWindow.size = this.crop.size;

        if (this.crop.shape === 'circle') {
            this.crop.size.y = this.crop.size.x < this.crop.size.y ? this.crop.size.x : this.crop.size.y;
            this.crop.size.x = this.crop.size.y;
        }

        return true;
    }

    getCropSize() {
        if(!this._imageIsLoaded()) {
            return;
        }
        return {
            x: this.crop.size.x,
            y: this.crop.size.y
        }
    }

    allowCropResize(isAllowed) {
        if(!this._imageIsLoaded()) {
            return;
        }
        this.cropWindow.allowResize = isAllowed;
        this.crop.allowResize = isAllowed;

        return true;
    }

    updateStyles (sizeRule) {
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

        this.canvas.style.width = styles.width;
        this.canvas.style.height = styles.height;
        this.canvas.style.margin = styles.margin;
    }

    _displayImage () {
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.context.drawImage(this.img,0,0);
    }

    _validateCropWindowParameters () {
        const canvasRect = {
            pos: { x: 0 - 10, y: 0 - 10 },
            size: { x: this.canvas.width + 10, y: this.canvas.height + 10 }
        };
        if (!this._inBounds({ x: this.crop.pos.x, y: this.crop.pos.y }, canvasRect)
        || !this._inBounds({ x: this.crop.pos.x + this.crop.size.x, y: this.crop.pos.y + this.crop.size.y }, canvasRect)) {
            this.cropWindow = Object.assign({}, this.cropWindow, {
                pos: { x: canvasRect.size.x / 4, y: canvasRect.size.y / 4 },
                size: { x: canvasRect.size.x / 2, y: canvasRect.size.y / 2 },
            });
            this.crop = JSON.parse(JSON.stringify(this.cropWindow));
        }
        this.isLoading = false;
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

    _updateResizeRect () {
        if(window.innerWidth < 500) {
            this.resizeRect = 20;
        } else if (window.innerWidth < 1000) {
            this.resizeRect = 16;
        } else {
            this.resizeRect = 9;
        }
    }

    _fillPreview () {
        if(!this.crop.size || this.crop.size.x === 0 || this.crop.size.y === 0) {
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

        switch(this.crop.shape) {
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
        this.context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.context.lineWidth = 2 * this.canvasScale;
        this.context.setLineDash([6 * this.canvasScale]);

        let resizeRect;

        switch(this.crop.shape) {
            default:
            case 'rectangle': {
                this.context.rect(this.crop.pos.x, this.crop.pos.y, this.crop.size.x, this.crop.size.y);

                resizeRect = {
                    x1: this.crop.pos.x + this.crop.size.x - this.resizeRect / 2 * this.canvasScale,
                    y1: this.crop.pos.y + this.crop.size.y - this.resizeRect / 2 * this.canvasScale,
                    x2: this.resizeRect * this.canvasScale,
                    y2: this.resizeRect * this.canvasScale
                };

                break;
            }
            case 'circle': {
                this.context.beginPath();
                this.context.arc(this.crop.pos.x + this.crop.size.x / 2, this.crop.pos.y + this.crop.size.y / 2, this.crop.size.x / 2, 0, 2 * Math.PI);

                resizeRect = {
                    x1: this.crop.pos.x + this.crop.size.x - this.resizeRect / 2 * this.canvasScale,
                    y1: this.crop.pos.y + this.crop.size.y / 2 - this.resizeRect / 2 * this.canvasScale,
                    x2: this.resizeRect * this.canvasScale,
                    y2: this.resizeRect * this.canvasScale
                };

                break;
            }
        }

        this.context.stroke();
        this.context.setLineDash([]);
        this.context.rect(this.canvas.width, 0, -this.canvas.width, this.canvas.height);
        this.context.fill();

        if(this.crop.allowResize) {
            this.context.fillStyle = this.crop.color;
            this.context.fillRect(resizeRect.x1, resizeRect.y1, resizeRect.x2, resizeRect.y2);
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

        if (this.crop.size.x < 20 * this.canvasScale) {
            this.crop.size.x = 20 * this.canvasScale;
        }
        if (this.crop.size.y < 20 * this.canvasScale) {
            this.crop.size.y = 20 * this.canvasScale;
        }

        if(this.crop.shape === 'circle') {
            this.crop.size.y = this.crop.size.x;
        }
    }

    _inBounds(point, rect) {
        return point.x >= rect.pos.x
            && point.x <= rect.pos.x + rect.size.x
            && point.y >= rect.pos.y
            && point.y <= rect.pos.y + rect.size.y;
    }

    _inCropBounds(x, y) {
        return this._inBounds({ x, y }, { pos: this.crop.pos, size: this.crop.size });
    }

    _inDragBounds(x, y) {
        let pos;
        const size = {
            x: this.resizeRect * this.canvasScale,
            y: this.resizeRect * this.canvasScale
        };

        switch(this.crop.shape) {
            case 'rectangle': {
                pos = {
                    x: this.crop.pos.x + this.crop.size.x - this.resizeRect/2 * this.canvasScale,
                    y: this.crop.pos.y + this.crop.size.y
                };

                break;
            }
            case 'circle': {
                pos = {
                    x: this.crop.pos.x + this.crop.size.x - this.resizeRect/2 * this.canvasScale,
                    y: this.crop.pos.y + this.crop.size.y / 2 - this.resizeRect/2 * this.canvasScale
                };

                break;
            }
            default: {
                break;
            }
        }

        return this._inBounds({ x, y }, { pos, size });
    }

    _randomString(length = 5) {
        let result = "";
        const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( let i = 0; i < length; i++ ) {
            result += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
        return result;
    }

    _imageIsLoaded() {
        return this.img && this.img.complete;
    }

    _getDefaultOptions() {
        return {
            sizeRule: 'contain',
            cropWindow: {
                pos: {x: 10, y: 10},
                size: {x: 150, y: 150},
                shape: 'rectangle',
                color: 'white',
                allowResize: true
            }
        };
    }
}
