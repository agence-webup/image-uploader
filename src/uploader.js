var helper = require('./helper');

// define default options
var defaults = {
    maxItems: null,
};

var ImageUploader = function (el, options) {
    this.el = helper.querySelector(el);
    this.options = helper.extend(defaults, options);

    this.editMode = false;
    this.editIndex = null;

    this.pictures = [];
    this.pictureViews = [];

    initView.call(this);
}

ImageUploader.prototype.add = function (picture) {
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
};

ImageUploader.prototype.update = function (index, picture) {
    this.pictures[index] = picture;
    this.pictureViews[index].querySelector('img').setAttribute('src', picture.url);
};

ImageUploader.prototype.delete = function (index) {
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
};

/* Private methods
-------------------------------------------------------------- */

function initView() {
    if (! this.el.classList.contains('uploader')) {
        this.el.classList.add('uploader');
    }

    initAddView.call(this);
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
                that.delete(index);
            }
        });
    }

    return pictureView;
};

function uploadFile(input) {
    if (input.length == 0) {
        return;
    }

    var file = input.files[0];

    var that = this;
    var reader = new FileReader();
    reader.onload = function (event) {
        var picture = {
            url: event.target.result
        };

        if (that.editMode) {
            that.update(that.editIndex, picture);
        } else {
            that.add(picture);
        }
    }
    reader.readAsDataURL(file);


    this.fileInput.value = null;
};

module.exports = ImageUploader;
