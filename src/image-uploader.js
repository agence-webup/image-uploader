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
     * @type {Object}
     */
    let _pictures = Symbol();

    /**
     * picture view list
     * @type {Object}
     */
    let _pictureViews = Symbol();

    /**
     * ID of current edited picture
     * @type {?mixed}
     */
    let _editId = Symbol();

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
                cropperOptions: {},
                max: 0,
                service: null,
                sortable: false,
            };
            this[_options] = Object.assign({}, defaults, options);
            this[_pictures] = {};
            this[_pictureViews] = {};
            this[_service] = this[_options].service == null ? new MockService() : this[_options].service;
            this[_editId] = null;

            this[_service].all().then((pictures) => {
                pictures.forEach((picture) => {
                    this[_pictures][picture.id] = picture;
                });
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
            const view = makePictureView.bind(this)(picture);

            this.el.insertBefore(view, this[_addView]);

            this[_pictures][picture.id] = picture;
            this[_pictureViews][picture.id] = view;

            if (this[_options].max && Object.keys(this[_pictures]).length >= this[_options].max) {
                this[_addView].classList.add('ui-hidden');
            }
        });
    }

    /**
     * Update the picture with ID
     * @param  {mixed} id
     * @param  {File} file
     * @param  {?Object} crop
     */
    function updatePicture(id, file, crop) {
        var pictureDto = {
            id: id,
            file: file,
            crop: crop,
        }
        this[_service].update(pictureDto).then((picture) => {
            this[_pictureViews][picture.id].style['background-image'] = 'url("' + picture.url + '")';
            this[_pictures][picture.id] = picture;
        });
    }

    /**
     * Remove the picture with ID
     * @param  {mixed} id
     */
    function removePicture(id) {
        this[_service].delete(id).then(() => {
            this.el.removeChild(this[_pictureViews][id]);
            delete this[_pictures][id];
            delete this[_pictureViews][id];

            if (this[_options].max && Object.keys(this[_pictures]).length < this[_options].max) {
                this[_addView].classList.remove('ui-hidden');
            }
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
            this.modal = new CropperModal(file, this[_options].cropperOptions, (data) => {
                uploadFile.bind(this)(this[_editId], file, data);
                this[_editId] = null;
            });
        } else {
            uploadFile.bind(this)(this[_editId], file);
            this[_editId] = null;
        }
    }

    /**
     * Add or update picture
     * @param  {?mixed} id if null add else update
     * @param  {File} file
     * @param  {?Object} crop
     */
    function uploadFile(id, file, crop) {
        if (id === null) {
            addPicture.bind(this)(file, crop);
        } else {
            updatePicture.bind(this)(id, file, crop);
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
        for (let key in this[_pictures]) {
            let picture = this[_pictures][key];
            let view = makePictureView.bind(this)(picture);
            this.el.appendChild(view);
            this[_pictureViews][picture.id] = view;
        }

        initAddView.bind(this)();
    }

    function makePictureView(picture) {
        let div = createElement('div', {
            class: 'iu-item ui-item__sortable',
            draggable: 'true',
            'data-picture-id': picture.id,
        });

        div.style['background-image'] = 'url("' + picture.url + '")';

        let span = createElement('span', {
            class: 'dropmic iu-item__action',
            'data-dropmic': picture.id,
            'data-dropmic-direction': 'bottom-middle',
        });

        let button = createElement('button', {
            'data-dropmic-btn': null
        });

        button.innerHTML = 'Actions';
        span.appendChild(button);
        div.appendChild(span);

        initDopmic.bind(this)(span, picture.id);

        if (this[_options].sortable) {
            sortable(div, sortPicture.bind(this));
        }

        return div;
    }

    /**
     * Init dropmic for actions on picture element
     * @param  {Element} el Picture element
     * @param  {mixed} id Picture ID
     */
    function initDopmic(el, id) {
        let dropmic = new Dropmic(el);

        dropmic.addBtn('Modifier', (event) => {
            event.preventDefault();
            this[_editId] = id;
            this._fileInput.click();
        });

        dropmic.addBtn('Supprimer', (event) => {
            event.preventDefault();
            removePicture.bind(this)(id);
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

        if (this[_options].max && Object.keys(this[_pictures]).length >= this[_options].max) {
            this[_addView].classList.add('hidden');
        }

        if (this[_options].sortable) {
            sortable(div, sortPicture.bind(this));
        }

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
