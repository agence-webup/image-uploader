"use strict";

class CropperModal {
    constructor(file, callback) {
        this.modal = new tingle.modal({
            footer: true,
        });

        this.modal.addFooterBtn('Turn left', 'tingle-btn tingle-btn--primary', () => {
            this.rotate(-90);
        });

        this.modal.addFooterBtn('Turn right', 'tingle-btn tingle-btn--primary', () => {
            this.rotate(90);
        });

        this.modal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary', () => {
            callback(this.cropper.getData());
            this.modal.close();
        });

        this.cropperEl = document.createElement('div');
        this.modal.setContent(this.cropperEl);

        this.modal.open();

        this.cropper = new Cropper(this.cropperEl, {
            // cropBoxResizable: false,
            autoCropArea: 1,
            // zoomable: false,
            aspectRatio: 1,
        });

        this.cropper.replace(URL.createObjectURL(file));

        this.modal.resize();
    }

    rotate(angle) {
        this.cropper.rotate(angle);
    }
}
