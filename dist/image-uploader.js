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

var ImageUploader = function () {
    function ImageUploader(el) {
        var _this2 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ImageUploader);

        this.el = el;
        var defaults = {
            cropper: false
        };
        this.options = Object.assign({}, defaults, options);
        this._pictures = [];
        this._service = new ServiceMock();

        this._service.all().then(function (pictures) {
            _this2._pictures = pictures;
            _this2.reloadView();
        });
    }

    _createClass(ImageUploader, [{
        key: 'uploadFile',
        value: function uploadFile(event) {
            var _this3 = this;

            var fileInput = event.target;
            if (fileInput.files.length == 0) {
                return;
            }
            var file = fileInput.files[0];

            if (this.options.cropper) {
                this.modal = new CropperModal(file, function (data) {
                    _this3.addPicture(file, data);
                });
            } else {
                this.addPicture(file);
            }
        }
    }, {
        key: 'addPicture',
        value: function addPicture(file, crop) {
            var _this4 = this;

            var pictureDto = {
                file: file,
                crop: crop
            };
            this._service.add(pictureDto).then(function (picture) {
                _this4._pictures.push(picture);
                _this4.reloadView();
            });
        }

        /* view
        -------------------------------------------------------------- */

    }, {
        key: 'reloadView',
        value: function reloadView() {
            var _this5 = this;

            while (this.el.firstChild) {
                this.el.removeChild(this.el.firstChild);
            }

            this._pictures.forEach(function (picture) {
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

                var dropmic = new Dropmic(span);
                dropmic.addBtn('Modifier', function () {
                    var id = dropmic.target.getAttribute('data-dropmic');
                });

                dropmic.addBtn('Supprimer', function () {
                    var id = dropmic.target.getAttribute('data-dropmic');
                    _this5._service.delete(id).then(function () {
                        _this5._service.all().then(function (pictures) {
                            _this5._pictures = pictures;
                            _this5.reloadView();
                        });
                    });
                });

                div.appendChild(img);

                _this5.el.appendChild(div);
            });

            this.initAddView();
        }
    }, {
        key: 'initAddView',
        value: function initAddView() {
            var _this6 = this;

            this._fileInput = createElement('input', {
                type: 'file'
            });
            this._fileInput.addEventListener('change', function (event) {
                _this6.uploadFile(event);
            });

            var div = document.createElement('div');
            div.addEventListener('click', function (event) {
                _this6._fileInput.click();
            });

            div.appendChild(this._fileInput);

            var icon = document.createElement('i');
            icon.innerHTML = 'add icon';
            div.appendChild(icon);

            this.el.appendChild(div);
        }
    }]);

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
            var _this7 = this;

            return new Promise(function (resolve, reject) {
                resolve(_this7._pictures);
            });
        }
    }, {
        key: 'add',
        value: function add(pictureDto) {
            var _this8 = this;

            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.addEventListener('load', function (event) {
                    var picture = {
                        id: _this8._pictures.length + 1,
                        url: event.target.result
                    };

                    _this8._pictures.push(picture);
                    resolve(picture);
                });
                fileReader.readAsDataURL(pictureDto.file);
            });
        }
    }, {
        key: 'update',
        value: function update(id) {
            return new Promise(function (resolve, reject) {
                resolve();
            });
        }
    }, {
        key: 'delete',
        value: function _delete(id, callback) {
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                _this9._pictures = _this9._pictures.filter(function (picture) {
                    return picture.id != id;
                });
                resolve();
            });
        }
    }]);

    return ServiceMock;
}();