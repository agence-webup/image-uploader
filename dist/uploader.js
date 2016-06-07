(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ImageUploader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * get DOMElement from selector
 * @param  {string|DOMElement} el
 * @return {DOMElement}
 */
function querySelector(el) {
    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    return el;
}

/**
 * function to extend defaults with user options
 * @param  {Object} source
 * @param  {Object} properties
 * @return {Object}
 */
function extend(source, properties) {
    for (var property in properties) {
        if (properties.hasOwnProperty(property)) {
            if (isPlainObject(source[property])) {
                source[property] = extend(source[property], properties[property]);
            } else {
                source[property] = properties[property];
            }
        }
    }

    return source;
}

/**
 * Parse HTML string into DOMElement
 * @param  {string} html
 * @return {DOMElement}
 */
function parseHTML(html) {
    var t = document.createElement('div');
    t.innerHTML = html;
    var element;

    if (typeof t.content != 'undefined' || t.content) {
        element = t.content.firstElementChild.cloneNode(true);
    } else {
        element = t.firstElementChild.cloneNode(true);
    }

    return element;
}

/**
 * Check if an object is a plain object
 * @param  {[type]}  o
 * @return {Boolean}
 */
function isPlainObject(o) {
    return o && typeof o == 'object' && o.constructor == Object;
}

module.exports = {
    querySelector: querySelector,
    extend: extend,
    parseHTML: parseHTML,
    isPlainObject: isPlainObject,
};

},{}],2:[function(require,module,exports){
var helper = require('./helper');

// define default options
var defaults = {
    maxItems: null,
    ajax: {
        add: function (file, callback, progress) {

        },
        update: function (picture, file, callback, progress) {

        },
        delete: function (picture, callback) {

        }
    }
};

var ImageUploader = function (el, options) {
    this.el = helper.querySelector(el);
    this.options = helper.extend(defaults, options);

    this.pictures = [];
    this.pictureViews = [];

    this.addView = null;
    this.fileInput = null;

    this.progressView = null;
    this.progressBar = null;

    this.editMode = false;
    this.editIndex = null;

    initView.call(this);
}


/* Private methods
-------------------------------------------------------------- */

function add(picture) {
    this.pictures.push(picture);

    var deletable = true;
    var pictureView = makePictureView.call(this, picture, deletable);
    this.el.insertBefore(pictureView, this.addView);
    this.pictureViews.push(pictureView);

    if (this.options.maxItems) {
        if (this.pictures.length >= this.options.maxItems) {
            this.addView.classList.add('hidden');
        } else {
            this.addView.classList.remove('hidden');
        }
    }
}

function update(index, picture) {
    this.pictures[index] = picture;
    this.pictureViews[index].querySelector('img').setAttribute('src', picture.url);
}

function remove(index) {
    var pictureView = this.pictureViews[index];
    pictureView.parentNode.removeChild(pictureView);

    this.pictures.splice(index, 1);
    this.pictureViews.splice(index, 1);


    if (this.options.maxItems) {
        if (this.pictures.length >= this.options.maxItems) {
            this.addView.classList.add('hidden');
        } else {
            this.addView.classList.remove('hidden');
        }
    }
}

function initView() {
    if (! this.el.classList.contains('uploader')) {
        this.el.classList.add('uploader');
    }

    initAddView.call(this);
    initProgressView.call(this);
}

function initAddView() {
    var template = '<div class="uploader-item">'
        + '<input type="file" class="hidden" data-js="file-input">'
        + '<button class="uploader__btn-add" data-js="openFilePicker">Add</button>'
        + '</div>';

    this.addView = helper.parseHTML(template);
    this.fileInput = this.addView.querySelector('[data-js="file-input"]');

    var that = this;
    this.addView.querySelector('[data-js="openFilePicker"]').addEventListener('click', function(event) {
        event.preventDefault();
        that.editMode = false;
        that.fileInput.click();
    });
    this.fileInput.addEventListener('change', function(event) {
        uploadFile.call(that, this);
    });

    this.el.appendChild(this.addView);
}

function initProgressView() {
    var template = '<div class="uploader-item hidden">'
        + '<div class="uploader__progress">'
        + '<span style="width: 0%" data-js="progress-bar"></span>'
        + '</div>'
        + '<div class="uploader__loading">Envoi en cours...</div>'
        + '</div>';

    this.progressView = helper.parseHTML(template);
    this.progressBar = this.progressView.querySelector('[data-js="progress-bar"]');
};

function makePictureView(picture, deletable) {
    var template = '<div class="uploader-item">';
    if (deletable) {
        template += '<button class="uploader__btn" data-js="delete">Delete</button>';
    }
    template += '<button class="uploader__btn" data-js="edit">Edit</button><img src="' + picture.url + '"></div>';

    var pictureView = helper.parseHTML(template);

    var that = this;

    pictureView.querySelector('[data-js="edit"]').addEventListener('click', function(event) {
        event.preventDefault();

        var index = that.pictureViews.indexOf(pictureView);
        that.editMode = true;
        that.editIndex = index;
        that.fileInput.click();
    });

    var deleteButton = pictureView.querySelector('[data-js="delete"]');
    if (deleteButton) {
        deleteButton.addEventListener('click', function(event) {
            event.preventDefault();

            var index = that.pictureViews.indexOf(pictureView);
            if (index != -1) {
                var picture = that.pictures[index];
                that.options.ajax.delete(picture, function() {
                    remove.call(that, index);
                });
            }
        });
    }

    return pictureView;
};

function displayProgressView() {
    this.progressBar.style.width = '0%';
    this.progressView.classList.remove('hidden');

    if (this.editMode) {
        var pictureView = this.pictureViews[this.editIndex];
        pictureView.classList.add('hidden');
        this.el.insertBefore(this.progressView, pictureView);
    } else {
        this.addView.classList.add('hidden');
        this.el.insertBefore(this.progressView, this.addView);
    }
};

function dismissProgressView() {
    this.progressView.parentNode.removeChild(this.progressView);
}

function updateProgressBar(percent) {
    this.progressBar.style.width = percent.toFixed() + '%';
}

function uploadFile(input) {
    if (input.length == 0) {
        return;
    }

    var file = input.files[0];
    var that = this;

    displayProgressView.call(this);

    if (that.editMode) {
        var picture = that.pictures[that.editIndex];

        this.options.ajax.update(picture, file, function(picture) {
            dismissProgressView.call(that);
            update.call(that, that.editIndex, picture);
            that.pictureViews[that.editIndex].classList.remove('hidden');
        }, function(percent) {
            updateProgressBar.call(that, percent);
        });

    } else {
        this.options.ajax.add(file, function(picture) {
            dismissProgressView.call(that);
            add.call(that, picture);
        }, function(percent) {
            updateProgressBar.call(that, percent);
        });
    }

    this.fileInput.value = null;
};

module.exports = ImageUploader;

},{"./helper":1}]},{},[2])(2)
});