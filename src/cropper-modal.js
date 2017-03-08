"use strict";

import tingle from 'tingle.js';
import Cropper from 'cropperjs';

class CropperModal {
    constructor(file, options, callback) {
        this.modal = new tingle.modal({
            footer: true,
            onOpen: () => {
                this.cropper = new Cropper(this.cropperEl, options);
                this.cropper.replace(URL.createObjectURL(file));
            }
        });

        this.modal.addFooterBtn('↺', 'tingle-btn tingle-btn--default', () => {
            this.rotate(-90);
        });

        this.modal.addFooterBtn('↻', 'tingle-btn tingle-btn--default', () => {
            this.rotate(90);
        });

        this.modal.addFooterBtn('+', 'tingle-btn tingle-btn--default', () => {
            this.cropper.zoom(0.1);
        });

        this.modal.addFooterBtn('-', 'tingle-btn tingle-btn--default', () => {
            this.cropper.zoom(-0.1);
        });

        this.modal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary tingle-btn--pull-right', () => {
            callback(this.cropper.getData());
            this.modal.close();
        });

        const content = document.createElement('div');
        content.classList.add('iu-cropper-wrapper');

        this.cropperEl = document.createElement('img');
        content.appendChild(this.cropperEl);

        this.modal.setContent(content);

        this.modal.open();
    }

    rotate(angle) {
        this.cropper.rotate(angle);
    }
}

module.exports = CropperModal;
