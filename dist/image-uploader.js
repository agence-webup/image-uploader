"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CropperModal = function () {
    function CropperModal(file, options, callback) {
        var _this = this;

        _classCallCheck(this, CropperModal);

        this.modal = new tingle.modal({
            footer: true,
            onOpen: function onOpen() {
                _this.cropper = new Cropper(_this.cropperEl, options);
                _this.cropper.replace(URL.createObjectURL(file));
            }
        });

        this.modal.addFooterBtn('Turn left', 'tingle-btn tingle-btn--primary', function () {
            _this.rotate(-90);
        });

        this.modal.addFooterBtn('Turn right', 'tingle-btn tingle-btn--primary', function () {
            _this.rotate(90);
        });

        this.modal.addFooterBtn('Zoom in', 'tingle-btn tingle-btn--primary', function () {
            _this.cropper.zoom(0.1);
        });

        this.modal.addFooterBtn('Zoom out', 'tingle-btn tingle-btn--primary', function () {
            _this.cropper.zoom(-0.1);
        });

        this.modal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary', function () {
            callback(_this.cropper.getData());
            _this.modal.close();
        });

        var content = document.createElement('div');

        this.cropperEl = document.createElement('img');
        content.appendChild(this.cropperEl);

        this.modal.setContent(content);

        this.modal.open();
    }

    _createClass(CropperModal, [{
        key: 'rotate',
        value: function rotate(angle) {
            this.cropper.rotate(angle);
        }
    }]);

    return CropperModal;
}();

"use strict";

/*
 * ImageUploader class
 */
var ImageUploader = function () {

    /* private properties
    -------------------------------------------------------------- */

    /**
     * service adapter
     * @type {Service}
     */
    var _service = Symbol();

    /**
     * picture list
     * @type {Object}
     */
    var _pictures = Symbol();

    /**
     * picture view list
     * @type {Object}
     */
    var _pictureViews = Symbol();

    /**
     * ID of current edited picture
     * @type {?mixed}
     */
    var _editId = Symbol();

    /**
     * options
     * @type {Object}
     */
    var _options = Symbol();

    /**
     * add view
     * @type {Element}
     */
    var _addView = Symbol();

    /**
     * ImageUploader
     */

    var ImageUploader = function ImageUploader(el) {
        var _this2 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ImageUploader);

        this.el = el;
        this.label = el.dataset.label;

        var defaults = {
            cropper: false,
            cropperOptions: {
                zoomOnTouch: false,
                zoomOnWheel: false
            },
            max: 0,
            service: null,
            sortable: false,
            deletable: true
        };
        this[_options] = Object.assign({}, defaults, options);
        this[_pictures] = {};
        this[_pictureViews] = {};
        this[_service] = this[_options].service == null ? new MockService() : this[_options].service;
        this[_editId] = null;

        this[_service].all().then(function (pictures) {
            pictures.forEach(function (picture) {
                _this2[_pictures][picture.id] = picture;
            });
            initView.bind(_this2)();
        });
    };

    /* private methods
    -------------------------------------------------------------- */

    /**
     * Add a picture
     * @param {File} file
     * @param {?Object} crop
     */


    function addPicture(file, crop) {
        var _this3 = this;

        var pictureDto = {
            file: file,
            crop: crop
        };
        this[_service].add(pictureDto).then(function (picture) {
            var length = _this3[_pictureViews].length;
            var view = makePictureView.bind(_this3)(picture);

            _this3.el.insertBefore(view, _this3[_addView]);

            _this3[_pictures][picture.id] = picture;
            _this3[_pictureViews][picture.id] = view;

            if (_this3[_options].max && Object.keys(_this3[_pictures]).length >= _this3[_options].max) {
                _this3[_addView].classList.add('ui-hidden');
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
        var _this4 = this;

        var pictureDto = {
            id: id,
            file: file,
            crop: crop
        };
        this[_service].update(pictureDto).then(function (picture) {
            _this4[_pictureViews][picture.id].style['background-image'] = 'url("' + picture.url + '")';
            _this4[_pictures][picture.id] = picture;
        });
    }

    /**
     * Remove the picture with ID
     * @param  {mixed} id
     */
    function removePicture(id) {
        var _this5 = this;

        this[_service].delete(id).then(function () {
            _this5.el.removeChild(_this5[_pictureViews][id]);
            delete _this5[_pictures][id];
            delete _this5[_pictureViews][id];

            if (_this5[_options].max && Object.keys(_this5[_pictures]).length < _this5[_options].max) {
                _this5[_addView].classList.remove('ui-hidden');
            }
        });
    }

    /**
     * Select file Handler
     * @param  Event event
     */
    function selectFile(event) {
        var _this6 = this;

        var fileInput = event.target;
        if (fileInput.files.length == 0) {
            return;
        }
        var file = fileInput.files[0];

        if (this[_options].cropper) {
            this.modal = new CropperModal(file, this[_options].cropperOptions, function (data) {
                uploadFile.bind(_this6)(_this6[_editId], file, data);
                _this6[_editId] = null;
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
        var pictures = [];
        var els = this.el.querySelectorAll('[data-picture-id]');
        [].forEach.call(els, function (el) {
            pictures.push(el.getAttribute('data-picture-id'));
        });
        this[_service].sort(pictures);
    }

    /**
     * Init view
     */
    function initView() {
        for (var key in this[_pictures]) {
            var picture = this[_pictures][key];
            var view = makePictureView.bind(this)(picture);
            this.el.appendChild(view);
            this[_pictureViews][picture.id] = view;
        }

        initAddView.bind(this)();
    }

    function makePictureView(picture) {
        var div = createElement('div', {
            class: 'iu-item ui-item__sortable',
            draggable: 'true',
            'data-picture-id': picture.id
        });

        div.style['background-image'] = 'url("' + picture.url + '")';

        var span = createElement('span', {
            class: 'dropmic iu-item__action',
            'data-dropmic': picture.id,
            'data-dropmic-direction': 'bottom-middle'
        });

        var button = createElement('button', {
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
        var _this7 = this;

        var dropmic = new Dropmic(el);

        dropmic.addBtn('Modifier', function (event) {
            event.preventDefault();
            _this7[_editId] = id;
            _this7._fileInput.click();
        });

        if (this[_options].deletable) {
            dropmic.addBtn('Supprimer', function (event) {
                event.preventDefault();
                removePicture.bind(_this7)(id);
            });
        }
    }

    /**
     * Init add View
     */
    function initAddView() {
        var _this8 = this;

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

        var div = createElement('div', {
            class: 'iu-item iu-item--input ui-item__sortable'
        });

        div.addEventListener('click', function (event) {
            _this8._fileInput.click();
        });

        div.appendChild(this._fileInput);
        div.appendChild(this._fileInputWrapper);
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
}();

/* helpers
-------------------------------------------------------------- */

function createElement(tagName) {
    var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var element = document.createElement(tagName);
    for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    return element;
}

"use strict";

var AjaxService = function () {
    function AjaxService(url) {
        _classCallCheck(this, AjaxService);

        this.url = url;
    }

    _createClass(AjaxService, [{
        key: 'all',
        value: function all() {
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', _this9.url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var data = JSON.parse(xhr.response);
                        resolve(data);
                    } else if (xhr.readyState == 4) {
                        reject();
                    }
                };
                xhr.send();
            });
        }
    }, {
        key: 'add',
        value: function add(pictureDto) {
            var _this10 = this;

            return new Promise(function (resolve, reject) {
                var formdata = new FormData();
                formdata.append('file', pictureDto.file);
                formdata.append('crop', JSON.stringify(pictureDto.crop));

                var xhr = new XMLHttpRequest();
                xhr.open('POST', _this10.url, true);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var data = JSON.parse(xhr.response);
                        resolve(data);
                    } else if (xhr.readyState == 4) {
                        reject();
                    }
                };
                xhr.send(formdata);
            });
        }
    }, {
        key: 'update',
        value: function update(pictureDto) {
            var _this11 = this;

            return new Promise(function (resolve, reject) {
                var formdata = new FormData();
                formdata.append('file', pictureDto.file);
                formdata.append('crop', JSON.stringify(pictureDto.crop));

                var xhr = new XMLHttpRequest();
                xhr.open('POST', _this11.url + '/' + pictureDto.id, true);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var data = JSON.parse(xhr.response);
                        resolve(data);
                    } else if (xhr.readyState == 4) {
                        reject();
                    }
                };
                xhr.send(formdata);
            });
        }
    }, {
        key: 'delete',
        value: function _delete(id) {
            var _this12 = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('DELETE', _this12.url + '/' + id, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        resolve();
                    } else if (xhr.readyState == 4) {
                        reject();
                    }
                };
                xhr.send();
            });
        }
    }, {
        key: 'sort',
        value: function sort(pictures) {
            var _this13 = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', _this13.url + '/sort', true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        resolve();
                    } else if (xhr.readyState == 4) {
                        reject();
                    }
                };
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(pictures));
            });
        }
    }]);

    return AjaxService;
}();

var MockService = function () {
    function MockService() {
        _classCallCheck(this, MockService);

        this._pictures = [];
    }

    _createClass(MockService, [{
        key: 'all',
        value: function all() {
            var _this14 = this;

            return new Promise(function (resolve, reject) {
                resolve(_this14._pictures);
            });
        }
    }, {
        key: 'add',
        value: function add(pictureDto) {
            var _this15 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    var picture = {
                        id: _this15._pictures.length + 1,
                        url: event.target.result
                    };

                    _this15._pictures.push(picture);
                    resolve(picture);
                });
                fileReader.readAsDataURL(pictureDto.file);
            });
        }
    }, {
        key: 'update',
        value: function update(pictureDto) {
            var _this16 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    for (var i = 0; i < _this16._pictures.length; i++) {
                        var picture = _this16._pictures[i];
                        if (picture.id == pictureDto.id) {
                            _this16._pictures[i].url = event.target.result;
                            resolve(picture);
                            return;
                        }
                    }

                    reject();
                });
                fileReader.readAsDataURL(pictureDto.file);
            });
        }
    }, {
        key: 'delete',
        value: function _delete(picture) {
            var _this17 = this;

            return new Promise(function (resolve, reject) {
                _this17._pictures = _this17._pictures.filter(function (_picture) {
                    return _picture.id != picture.id;
                });
                resolve();
            });
        }
    }, {
        key: 'sort',
        value: function sort(pictures) {
            return new Promise(function (resolve, reject) {
                resolve();
            });
        }
    }]);

    return MockService;
}();

var sortable = function () {

    var dragSrcEl = null;
    var callback = null;
    var DRAG_CLASS = 'ui-item__sortableDrag';
    var OVER_CLASS = 'ui-item__sortableOver';

    function handleDragStart(e) {
        dragSrcEl = this;

        e.dataTransfer.effectAllowed = 'move';

        this.classList.add(DRAG_CLASS);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        this.classList.add(OVER_CLASS);

        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    function handleDragEnter(e) {}

    function handleDragLeave(e) {
        this.classList.remove(OVER_CLASS);
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation(); // Stops some browsers from redirecting.
        }

        // Don't do anything if dropping the same column we're dragging.
        if (dragSrcEl != this) {
            this.parentNode.insertBefore(dragSrcEl, this);
            callback();
        }
        this.classList.remove(OVER_CLASS);

        return false;
    }

    function handleDragEnd(e) {
        this.classList.remove(DRAG_CLASS);
    }

    function addDnDHandlers(el) {
        el.addEventListener('dragstart', handleDragStart, false);
        el.addEventListener('dragenter', handleDragEnter, false);
        el.addEventListener('dragover', handleDragOver, false);
        el.addEventListener('dragleave', handleDragLeave, false);
        el.addEventListener('drop', handleDrop, false);
        el.addEventListener('dragend', handleDragEnd, false);
    }

    return function (el, cb) {
        callback = cb;
        addDnDHandlers(el);
    };
}();