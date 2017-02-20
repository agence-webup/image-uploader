"use strict";

class CropperModal {
    constructor(file, options, callback) {
        this.modal = new tingle.modal({
            footer: true,
            onOpen: () => {
                this.cropper = new Cropper(this.cropperEl, options);
                this.cropper.replace(URL.createObjectURL(file));
            }
        });

        this.modal.addFooterBtn('Turn left', 'tingle-btn tingle-btn--primary', () => {
            this.rotate(-90);
        });

        this.modal.addFooterBtn('Turn right', 'tingle-btn tingle-btn--primary', () => {
            this.rotate(90);
        });

        this.modal.addFooterBtn('Zoom in', 'tingle-btn tingle-btn--primary', () => {
            this.cropper.zoom(0.1);
        });

        this.modal.addFooterBtn('Zoom out', 'tingle-btn tingle-btn--primary', () => {
            this.cropper.zoom(-0.1);
        });

        this.modal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary', () => {
            callback(this.cropper.getData());
            this.modal.close();
        });

        const content = document.createElement('div');

        this.cropperEl = document.createElement('img');
        content.appendChild(this.cropperEl);

        this.modal.setContent(content);

        this.modal.open();
    }

    rotate(angle) {
        this.cropper.rotate(angle);
    }
}
