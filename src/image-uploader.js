"use strict";

/*
 * ImageUploader class
 */
const ImageUploader = (function() {

    /* private properties
    -------------------------------------------------------------- */

    /**
     * service adapter
     * @type {Service}
     */
    let _service = Symbol();

    /**
     * picture list
     * @type {Array}
     */
    let _pictures = Symbol();

    /**
     * picture view list
     * @type {Array}
     */
    let _pictureViews = Symbol();

    /**
     * index of current edited picture
     * @type {?int}
     */
    let _editIndex = Symbol();

    /**
     * options
     * @type {Object}
     */
    let _options = Symbol();

    /**
     * add view
     * @type {Element}
     */
    let _addView = Symbol();

    /**
     * ImageUploader
     */
    class ImageUploader {
        constructor(el, options = {}) {
            this.el = el;
            this.label = el.dataset.label;

            const defaults = {
                cropper: false,
                service: null,
            };
            this[_options] = Object.assign({}, defaults, options);
            this[_pictures] = [];
            this[_pictureViews] = [];
            this[_service] = this[_options].service == null ? new MockService() : this[_options].service;
            this[_editIndex] = null;

            this[_service].all().then((pictures) => {
                this[_pictures] = pictures;
                initView.bind(this)();
            });
        }
    }

    /* private methods
    -------------------------------------------------------------- */

    /**
     * Add a picture
     * @param {File} file
     * @param {?Object} crop
     */
    function addPicture(file, crop) {
        var pictureDto = {
            file: file,
            crop: crop,
        }
        this[_service].add(pictureDto).then((picture) => {
            const length = this[_pictureViews].length;
            const view = makePictureView.bind(this)(picture, length);

            this.el.insertBefore(view, this[_addView]);

            this[_pictures].push(picture);
            this[_pictureViews].push(view);
        });
    }

    /**
     * Update the picture at index
     * @param  {int} index
     * @param  {File} file
     * @param  {?Object} crop
     */
    function updatePicture(index, file, crop) {
        var pictureDto = {
            picture: this[_pictures][index],
            file: file,
            crop: crop,
        }
        this[_service].update(pictureDto).then((picture) => {
            this[_pictureViews][index].style['background-image'] = 'url("' + picture.url + '")';
            this[_pictures][index] = picture;
        });
    }

    /**
     * Remove the picture at index
     * @param  {int} index
     */
    function removePicture(index) {
        const picture = this[_pictures][index];
        this[_service].delete(picture).then(() => {
            this.el.removeChild(this[_pictureViews][index]);
            this[_pictures].splice(index, 1);
            this[_pictureViews].splice(index, 1);
        });
    }

    /**
     * Select file Handler
     * @param  Event event
     */
    function selectFile(event) {
        const fileInput = event.target;
        if (fileInput.files.length == 0) {
            return;
        }
        const file = fileInput.files[0];

        if (this[_options].cropper) {
            this.modal = new CropperModal(file, (data) => {
                uploadFile.bind(this)(this[_editIndex], file, data);
                this[_editIndex] = null;
            });
        } else {
            uploadFile.bind(this)(this[_editIndex], file);
            this[_editIndex] = null;
        }
    }

    /**
     * Add or update picture
     * @param  {?int} index if null add else update
     * @param  {File} file
     * @param  {?Object} crop
     */
    function uploadFile(index, file, crop) {
        if (index === null) {
            addPicture.bind(this)(file, crop);
        } else {
            updatePicture.bind(this)(index, file, crop);
        }
    }

    function sortPicture() {
        const pictures = [];
        const els = this.el.querySelectorAll('[data-picture-id]');
        [].forEach.call(els, function(el) {
            pictures.push(el.getAttribute('data-picture-id'));
        })
        this[_service].sort(pictures);
    }

    /**
     * Init view
     */
    function initView() {
        this[_pictures].forEach((picture, index) => {
            const view = makePictureView.bind(this)(picture, index);
            this.el.appendChild(view);
            this[_pictureViews].push(view);
        });

        initAddView.bind(this)();
    }

    function makePictureView(picture, index) {
        let div = createElement('div', {
            class: 'iu-item ui-item__sortable',
            draggable: 'true',
            'data-picture-id': picture.id,
        });

        div.style['background-image'] = 'url("' + picture.url + '")';

        let span = createElement('span', {
            class: 'dropmic iu-item__action',
            'data-dropmic': index,
            'data-dropmic-direction': 'bottom-middle'
        });

        let button = createElement('button', {
            'data-dropmic-btn': null
        });

        button.innerHTML = 'Actions';
        span.appendChild(button);
        div.appendChild(span);

        initDopmic.bind(this)(span, index);

        sortable(div, sortPicture.bind(this));

        return div;
    }

    function initDopmic(el, index) {
        let dropmic = new Dropmic(el);

        dropmic.addBtn('Modifier', () => {
            this[_editIndex] = index;
            this._fileInput.click();
        });

        dropmic.addBtn('Supprimer', () => {
            removePicture.bind(this)(index);
        });
    }

    /**
     * Init add View
     */
    function initAddView() {
        this._fileInput = createElement('input', {
            type: 'file',
            class: 'iu-item__inputFile'
        });

        this._label = createElement('label', {
            class: 'iu-item__inputLabel'
        });

        this._fileInputWrapper = createElement('span', {
            class: 'iu-item__inputWrapper'
        });

        this._label.innerHTML = this.label;

        this._fileInput.addEventListener('change', selectFile.bind(this));

        let div = createElement('div', {
            class: 'iu-item iu-item--input ui-item__sortable'
        });

        div.addEventListener('click', (event) => {
            this._fileInput.click();
        });

        div.appendChild(this._fileInput);
        div.appendChild(this._fileInputWrapper)
        this._fileInputWrapper.appendChild(this._label);

        this[_addView] = div;

        sortable(div, sortPicture.bind(this));

        this.el.appendChild(div);
    }

    return ImageUploader;
})();

/* helpers
-------------------------------------------------------------- */

function createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    return element;
}
