"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CropperModal = function () {
    function CropperModal(file, callback) {
        var _this = this;

        _classCallCheck(this, CropperModal);

        this.modal = new tingle.modal({
            footer: true
        });

        this.modal.addFooterBtn('Turn left', 'tingle-btn tingle-btn--primary', function () {
            _this.rotate(-90);
        });

        this.modal.addFooterBtn('Turn right', 'tingle-btn tingle-btn--primary', function () {
            _this.rotate(90);
        });

        this.modal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary', function () {
            callback(_this.cropper.getData());
            _this.modal.close();
        });

        this.cropperEl = document.createElement('div');
        this.modal.setContent(this.cropperEl);

        this.modal.open();

        this.cropper = new Cropper(this.cropperEl, {
            // cropBoxResizable: false,
            autoCropArea: 1,
            // zoomable: false,
            aspectRatio: 1
        });

        this.cropper.replace(URL.createObjectURL(file));

        this.modal.resize();
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
     * @type {Array}
     */
    var _pictures = Symbol();

    /**
     * picture view list
     * @type {Array}
     */
    var _pictureViews = Symbol();

    /**
     * index of current edited picture
     * @type {?int}
     */
    var _editIndex = Symbol();

    /**
     * options
     * @type {Object}
     */
    var _options = Symbol();

    /**
     * ImageUploader
     */

    var ImageUploader = function ImageUploader(el) {
        var _this2 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ImageUploader);

        this.el = el;
        var defaults = {
            cropper: false,
            service: null
        };
        this[_options] = Object.assign({}, defaults, options);
        this[_pictures] = [];
        this[_pictureViews] = [];
        this[_service] = this[_options].service == null ? new ServiceMock() : this[_options].service;
        this[_editIndex] = null;

        this[_service].all().then(function (pictures) {
            _this2[_pictures] = pictures;
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
            var view = makePictureView.bind(_this3)(picture, length);

            _this3.el.insertBefore(view, _this3[_pictureViews][length - 1].nextSibling);

            _this3[_pictures].push(picture);
            _this3[_pictureViews].push(view);
        });
    }

    /**
     * Update the picture at index
     * @param  {int} index
     * @param  {File} file
     * @param  {?Object} crop
     */
    function updatePicture(index, file, crop) {
        var _this4 = this;

        var pictureDto = {
            id: this[_pictures][index].id,
            file: file,
            crop: crop
        };
        this[_service].update(pictureDto).then(function (picture) {
            _this4[_pictureViews][index].querySelector('img').setAttribute('src', picture.url);
            _this4[_pictures][index] = picture;
        });
    }

    /**
     * Remove the picture at index
     * @param  {int} index
     */
    function removePicture(index) {
        var _this5 = this;

        var picture = this[_pictures][index];
        this[_service].delete(picture.id).then(function () {
            _this5.el.removeChild(_this5[_pictureViews][index]);
            _this5[_pictures].splice(index, 1);
            _this5[_pictureViews].splice(index, 1);
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
            this.modal = new CropperModal(file, function (data) {
                uploadFile.bind(_this6)(_this6[_editIndex], file, data);
                _this6[_editIndex] = null;
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

    /**
     * Init view
     */
    function initView() {
        var _this7 = this;

        this[_pictures].forEach(function (picture, index) {
            var view = makePictureView.bind(_this7)(picture, index);
            _this7.el.appendChild(view);
            _this7[_pictureViews].push(view);
        });

        initAddView.bind(this)();
    }

    function makePictureView(picture, index) {
        var div = document.createElement('div');
        var img = createElement('img', {
            src: picture.url
        });

        var span = createElement('span', {
            class: 'dropmic',
            'data-dropmic': picture.id,
            'data-dropmic-direction': 'bottom-right'
        });

        var button = createElement('button', {
            'data-dropmic-btn': null
        });
        button.innerHTML = 'Actions';
        span.appendChild(button);
        div.appendChild(span);

        initDopmic.bind(this)(span, index);

        div.appendChild(img);

        return div;
    }

    function initDopmic(el, index) {
        var _this8 = this;

        var dropmic = new Dropmic(el);

        dropmic.addBtn('Modifier', function () {
            _this8[_editIndex] = index;
            _this8._fileInput.click();
        });

        dropmic.addBtn('Supprimer', function () {
            removePicture.bind(_this8)(index);
        });
    }

    /**
     * Init add View
     */
    function initAddView() {
        var _this9 = this;

        this._fileInput = createElement('input', {
            type: 'file'
        });
        this._fileInput.addEventListener('change', selectFile.bind(this));

        var div = document.createElement('div');
        div.addEventListener('click', function (event) {
            _this9._fileInput.click();
        });

        div.appendChild(this._fileInput);

        var icon = document.createElement('i');
        icon.innerHTML = 'add icon';
        div.appendChild(icon);

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

var ServiceMock = function () {
    function ServiceMock() {
        _classCallCheck(this, ServiceMock);

        this._pictures = [{
            id: 1,
            url: "http://lorempixel.com/100/100/"
        }, {
            id: 2,
            url: "http://lorempixel.com/100/100/"
        }];
    }

    _createClass(ServiceMock, [{
        key: 'all',
        value: function all() {
            var _this10 = this;

            return new Promise(function (resolve, reject) {
                resolve(_this10._pictures);
            });
        }
    }, {
        key: 'add',
        value: function add(pictureDto) {
            var _this11 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    var picture = {
                        id: _this11._pictures.length + 1,
                        url: event.target.result
                    };

                    _this11._pictures.push(picture);
                    resolve(picture);
                });
                fileReader.readAsDataURL(pictureDto.file);
            });
        }
    }, {
        key: 'update',
        value: function update(pictureDto) {
            var _this12 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    for (var i = 0; i < _this12._pictures.length; i++) {
                        var picture = _this12._pictures[i];
                        if (picture.id == pictureDto.id) {
                            _this12._pictures[i].url = event.target.result;
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
        value: function _delete(id, callback) {
            var _this13 = this;

            return new Promise(function (resolve, reject) {
                _this13._pictures = _this13._pictures.filter(function (picture) {
                    return picture.id != id;
                });
                resolve();
            });
        }
    }]);

    return ServiceMock;
}();