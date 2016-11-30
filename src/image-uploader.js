"use strict";

class ImageUploader {

    constructor(el, options = {}) {
        this.el = el;
        const defaults = {
            cropper: false,
        };
        this.options = Object.assign({}, defaults, options);
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
