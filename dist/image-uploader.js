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

        this.modal.addFooterBtn('↺', 'tingle-btn tingle-btn--default', function () {
            _this.rotate(-90);
        });

        this.modal.addFooterBtn('↻', 'tingle-btn tingle-btn--default', function () {
            _this.rotate(90);
        });

        this.modal.addFooterBtn('+', 'tingle-btn tingle-btn--default', function () {
            _this.cropper.zoom(0.1);
        });

        this.modal.addFooterBtn('-', 'tingle-btn tingle-btn--default', function () {
            _this.cropper.zoom(-0.1);
        });

        this.modal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary tingle-btn--pull-right', function () {
            callback(_this.cropper.getData());
            _this.modal.close();
        });

        var content = document.createElement('div');
        content.classList.add('iu-cropper-wrapper');

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

var FileUploader =
/**
 * Create a new instance
 * @param  {Element} el
 * @param  {Object} options
 */
function FileUploader(el) {
    var _this2 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, FileUploader);

    var defaults = {
        cropper: false,
        cropperOptions: {
            zoomOnTouch: false,
            zoomOnWheel: false
        },
        maxItems: 0,
        sortable: false,
        deletable: false,
        strings: {
            selectFile: "Choisir un fichier",
            actions: "Actions",
            update: "Modifier",
            delete: "Supprimer"
        }
    };

    this._el = el;
    this._items = {};
    this._itemViews = {};
    this._options = Object.assign({}, defaults, options);
    this._editId = null;

    _initAddView.bind(this)();

    if (typeof this._options.data === "function") {
        this._options.data(function (items) {
            items.forEach(function (item) {
                _addItem.bind(_this2)(item);
            });
        });
    }
};

/* Actions
-------------------------------------------------------------- */

/**
 * Add an item
 * @param {Object} item
 */


function _addItem(item) {
    var itemView = _makeItemView.bind(this)(item);
    this._el.insertBefore(itemView, this._addView);

    this._items[item.id] = item;
    this._itemViews[item.id] = itemView;

    if (this._options.maxItems && Object.keys(this._items).length >= this._options.maxItems) {
        this._addView.classList.add('ui-hidden');
    }
}

/**
 * Update an item
 * @param  {Object} item
 */
function _updateItem(item) {
    this._items[item.id] = item;
    this._itemViews[item.id].style['background-image'] = 'url("' + item.url + '")';
}

/**
 * Remove an item
 * @param  {Object} item
 */
function _removeItem(item) {
    this._el.removeChild(this._itemViews[item.id]);

    delete this._items[item.id];
    delete this._itemViews[item.id];

    if (this._options.maxItems && Object.keys(this._items).length < this._options.maxItems) {
        this._addView.classList.remove('ui-hidden');
    }
}

/* Event handlers
-------------------------------------------------------------- */

/**
 * Select file handler
 * @param  {Event} event
 */
function _selectFile(event) {
    var _this3 = this;

    var fileInput = event.target;
    if (fileInput.files.length == 0) {
        return;
    }
    var file = fileInput.files[0];

    if (this._options.cropper) {
        this.modal = new CropperModal(file, this._options.cropperOptions, function (data) {
            _uploadFile.bind(_this3)(_this3._editId, file, data);
            _this3._editId = null;
        });
    } else {
        _uploadFile.bind(this)(this._editId, file);
        this._editId = null;
    }

    fileInput.value = null;
}

/**
 * Sort handler
 */
function _sortItems() {
    var items = [];
    var els = this._el.querySelectorAll('[data-item-id]');
    [].forEach.call(els, function (el) {
        items.push(el.getAttribute('data-item-id'));
    });

    if (typeof this._options.onSort === "function") {
        this._options.onSort(items);
    }
}

/**
 * Add or update picture
 * @param  {?mixed} id if null add else update
 * @param  {File} file
 * @param  {?Object} crop
 */
function _uploadFile(id, file, crop) {
    var _this4 = this;

    if (id === null) {
        var itemDto = {
            file: file,
            crop: crop
        };

        if (typeof this._options.onAdd === "function") {
            this._options.onAdd(itemDto, function (item) {
                _addItem.bind(_this4)(item);
            }, function (rate) {
                _updateProgressBar.bind(this)(rate);
            });
        } else {
            _loadFile.bind(this)(itemDto, function (item) {
                _addItem.bind(_this4)(item);
            });
        }
    } else {
        var itemDto = {
            id: id,
            file: file,
            crop: crop
        };

        if (typeof this._options.onUpdate === "function") {
            this._options.onUpdate(itemDto, function (item) {
                _updateItem.bind(_this4)(item);
            }, function (rate) {
                _updateProgressBar.bind(this)(rate);
            });
        } else {
            _loadFile.bind(this)(itemDto, function (item) {
                _updateItem.bind(_this4)(item);
            });
        }
    }
}

/**
 * Load file
 * @param  {Object}   itemDto
 * @param  {Function} callback
 */
function _loadFile(itemDto, callback) {
    var fileReader = new FileReader();
    fileReader.addEventListener('load', function (event) {
        callback({
            id: itemDto.id ? itemDto.id : new Date().getTime(),
            url: event.target.result
        });
    });
    fileReader.readAsDataURL(itemDto.file);
}

/* View
-------------------------------------------------------------- */

/**
 * Init add View
 */
function _initAddView() {
    // file input
    var fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.classList.add('iu-item__inputFile');
    fileInput.addEventListener('change', _selectFile.bind(this));
    this._fileInput = fileInput;

    // label
    var label = document.createElement('label');
    label.classList.add('iu-item__inputLabel');
    label.innerHTML = this._options.strings.selectFile;

    // label wrapper
    var labelWrapper = document.createElement('span');
    labelWrapper.classList.add('iu-item__inputWrapper');
    labelWrapper.appendChild(label);

    // add view
    var addView = document.createElement('div');
    addView.classList.add('iu-item');
    addView.classList.add('iu-item--input');
    addView.classList.add('ui-item__sortable');
    addView.appendChild(fileInput);
    addView.appendChild(labelWrapper);
    addView.addEventListener('click', function (event) {
        fileInput.click();
    });
    if (this._options.sortable) {
        sortable(addView, _sortItems.bind(this));
    }
    this._addView = addView;

    this._el.appendChild(addView);
}

/**
 * Create a item element
 * @param  {Object} item
 * @return {Element}
 */
function _makeItemView(item) {
    var itemView = document.createElement('div');
    itemView.classList.add('iu-item');
    itemView.classList.add('ui-item__sortable');
    itemView.setAttribute('draggable', true);
    itemView.setAttribute('data-item-id', item.id);
    itemView.style['background-image'] = 'url("' + item.url + '")';

    var span = document.createElement('span');
    span.classList.add('iu-item__action');
    span.classList.add('dropmic');
    span.setAttribute('data-dropmic', item.id);
    span.setAttribute('data-dropmic-direction', 'bottom-middle');
    span.setAttribute('role', 'navigation');

    var button = document.createElement('button');
    button.setAttribute('data-dropmic-btn', null);
    button.innerHTML = this._options.strings.actions;

    span.appendChild(button);
    itemView.appendChild(span);

    _initDopmic.bind(this)(span, item);

    if (this._options.sortable) {
        sortable(itemView, _sortItems.bind(this));
    }

    return itemView;
}

/**
 * Init dropmic for actions on picture element
 * @param  {Element} el Item element
 * @param  {object}  item Item
 */
function _initDopmic(el, item) {
    var _this5 = this;

    var dropmic = new Dropmic(el);

    dropmic.addBtn(this._options.strings.update, function (event) {
        event.preventDefault();
        _this5._editId = item.id;
        _this5._fileInput.click();
    });

    if (this._options.deletable) {
        dropmic.addBtn(this._options.strings.delete, function (event) {
            event.preventDefault();
            if (typeof _this5._options.onDelete === "function") {
                _this5._options.onDelete(item, function () {
                    _removeItem.bind(_this5)(item);
                });
            } else {
                _removeItem.bind(_this5)(item);
            }
        });
    }
}

/**
 * Update the progress bar
 * @param  {[type]} rate
 */
function _updateProgressBar(rate) {
    console.log('progress', rate);
}

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
        var _this6 = this;

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
                _this6[_pictures][picture.id] = picture;
            });
            initView.bind(_this6)();
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
        var _this7 = this;

        var pictureDto = {
            file: file,
            crop: crop
        };
        this[_service].add(pictureDto).then(function (picture) {
            var length = _this7[_pictureViews].length;
            var view = makePictureView.bind(_this7)(picture);

            _this7.el.insertBefore(view, _this7[_addView]);

            _this7[_pictures][picture.id] = picture;
            _this7[_pictureViews][picture.id] = view;

            if (_this7[_options].max && Object.keys(_this7[_pictures]).length >= _this7[_options].max) {
                _this7[_addView].classList.add('ui-hidden');
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
        var _this8 = this;

        var pictureDto = {
            id: id,
            file: file,
            crop: crop
        };
        this[_service].update(pictureDto).then(function (picture) {
            _this8[_pictureViews][picture.id].style['background-image'] = 'url("' + picture.url + '")';
            _this8[_pictures][picture.id] = picture;
        });
    }

    /**
     * Remove the picture with ID
     * @param  {mixed} id
     */
    function removePicture(id) {
        var _this9 = this;

        this[_service].delete(id).then(function () {
            _this9.el.removeChild(_this9[_pictureViews][id]);
            delete _this9[_pictures][id];
            delete _this9[_pictureViews][id];

            if (_this9[_options].max && Object.keys(_this9[_pictures]).length < _this9[_options].max) {
                _this9[_addView].classList.remove('ui-hidden');
            }
        });
    }

    /**
     * Select file Handler
     * @param  Event event
     */
    function selectFile(event) {
        var _this10 = this;

        var fileInput = event.target;
        if (fileInput.files.length == 0) {
            return;
        }
        var file = fileInput.files[0];

        if (this[_options].cropper) {
            this.modal = new CropperModal(file, this[_options].cropperOptions, function (data) {
                uploadFile.bind(_this10)(_this10[_editId], file, data);
                _this10[_editId] = null;
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
        var _this11 = this;

        var dropmic = new Dropmic(el);

        dropmic.addBtn('Modifier', function (event) {
            event.preventDefault();
            _this11[_editId] = id;
            _this11._fileInput.click();
        });

        if (this[_options].deletable) {
            dropmic.addBtn('Supprimer', function (event) {
                event.preventDefault();
                removePicture.bind(_this11)(id);
            });
        }
    }

    /**
     * Init add View
     */
    function initAddView() {
        var _this12 = this;

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
            _this12._fileInput.click();
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
            var _this13 = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', _this13.url, true);
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
            var _this14 = this;

            return new Promise(function (resolve, reject) {
                var formdata = new FormData();
                formdata.append('file', pictureDto.file);
                formdata.append('crop', JSON.stringify(pictureDto.crop));

                var xhr = new XMLHttpRequest();
                xhr.open('POST', _this14.url, true);

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
            var _this15 = this;

            return new Promise(function (resolve, reject) {
                var formdata = new FormData();
                formdata.append('file', pictureDto.file);
                formdata.append('crop', JSON.stringify(pictureDto.crop));

                var xhr = new XMLHttpRequest();
                xhr.open('POST', _this15.url + '/' + pictureDto.id, true);

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
            var _this16 = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('DELETE', _this16.url + '/' + id, true);
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
            var _this17 = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', _this17.url + '/sort', true);
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
            var _this18 = this;

            return new Promise(function (resolve, reject) {
                resolve(_this18._pictures);
            });
        }
    }, {
        key: 'add',
        value: function add(pictureDto) {
            var _this19 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    var picture = {
                        id: _this19._pictures.length + 1,
                        url: event.target.result
                    };

                    _this19._pictures.push(picture);
                    resolve(picture);
                });
                fileReader.readAsDataURL(pictureDto.file);
            });
        }
    }, {
        key: 'update',
        value: function update(pictureDto) {
            var _this20 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    for (var i = 0; i < _this20._pictures.length; i++) {
                        var picture = _this20._pictures[i];
                        if (picture.id == pictureDto.id) {
                            _this20._pictures[i].url = event.target.result;
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
            var _this21 = this;

            return new Promise(function (resolve, reject) {
                _this21._pictures = _this21._pictures.filter(function (_picture) {
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