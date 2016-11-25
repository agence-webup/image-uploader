"use strict";

class ServiceMock {
    constructor() {
        this._pictures = [
            {
                id: 1,
                url: "http://lorempixel.com/100/100/",
            },
            {
                id: 2,
                url: "http://lorempixel.com/100/100/"
            }
        ];
    }

    all(callback) {
        callback(this._pictures);
    }

    add(pictureDto, callback) {
        var fileReader = new FileReader();
        fileReader.addEventListener('load', (event) => {
            const picture = {
                id: this._pictures.length + 1,
                url: event.target.result
            }

            this._pictures.push(picture);
            callback(picture);
        });
        fileReader.readAsDataURL(pictureDto.file);
    }

    update(id, callback) {
        callback();
    }

    delete(id, callback) {
        this._pictures = this._pictures.filter(function(picture) {
            return picture.id != id;
        });
        callback();
    }
}

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

class ImageUploader {

    constructor(el, options = {}) {
        this.el = el;
        const defaults = {
            cropper: false,
        };
        this.options= Object.assign({}, defaults, options);
        this._pictures = [];
        this._service = new ServiceMock();

        this._service.all((pictures) => {
            this._pictures = pictures;
            this.reloadView();
        })
    }

    uploadFile(event) {
        const fileInput = event.target;
        if (fileInput.files.length == 0) {
            return;
        }
        const file = fileInput.files[0];

        if (this.options.cropper) {
            this.modal = new CropperModal(file, (data) => {
                this.addPicture(file);
            });
        } else {
            this.addPicture(file);
        }
    }

    addPicture(file) {
        var pictureDto = {
            file: file
        }
        this._service.add(pictureDto, (picture) => {
            // this._pictures.push(picture);
            this.reloadView();
        });
    }

    /* view
    -------------------------------------------------------------- */

    reloadView() {
        while (this.el.firstChild) {
            this.el.removeChild(this.el.firstChild);
        }

        this._pictures.forEach((picture) => {
            let div = document.createElement('div');
            let img = createElement('img', {
                src: picture.url
            });

            let span = createElement('span', {
                class: 'dropmic',
                'data-dropmic': picture.id,
                'data-dropmic-direction': 'bottom-right'
            });

            let button = createElement('button', {
                'data-dropmic-btn': null
            });
            button.innerHTML = 'Actions';
            span.appendChild(button);
            div.appendChild(span);

            let dropmic = new Dropmic(span);
            dropmic.addBtn('Modifier', () => {
                var id = dropmic.target.getAttribute('data-dropmic');
            })

            dropmic.addBtn('Supprimer', () => {
                var id = dropmic.target.getAttribute('data-dropmic');
                this._service.delete(id, () => {
                    this._service.all((pictures) => {
                        this._pictures = pictures;
                        this.reloadView();
                    })
                });
            })

            div.appendChild(img);

            this.el.appendChild(div);
        });

        this.initAddView();
    }

    initAddView() {
        this._fileInput = createElement('input', {
            type: 'file',
        });
        this._fileInput.addEventListener('change', (event) => {
            this.uploadFile(event);
        });

        let div = document.createElement('div');
        div.addEventListener('click', (event) => {
            this._fileInput.click();
        });

        div.appendChild(this._fileInput);

        let icon = document.createElement('i');
        icon.innerHTML = 'add icon';
        div.appendChild(icon);

        this.el.appendChild(div);
    }
}

/* helpers
-------------------------------------------------------------- */

function createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    return element;
}
