class FileUploader {
    /**
     * Create a new instance
     * @param  {Element} el
     * @param  {Object} options
     */
    constructor(el, options = {}) {
        const defaults = {
            cropper: false,
            cropperOptions: {
                zoomOnTouch: false,
                zoomOnWheel: false,
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
            this._options.data((items) => {
                items.forEach((item) => {
                    _addItem.bind(this)(item);
                });
            });
        }
    }
}

/* Actions
-------------------------------------------------------------- */

/**
 * Add an item
 * @param {Object} item
 */
function _addItem(item) {
    const itemView = _makeItemView.bind(this)(item);
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
    const fileInput = event.target;
    if (fileInput.files.length == 0) {
        return;
    }
    const file = fileInput.files[0];

    if (this._options.cropper) {
        this.modal = new CropperModal(file, this._options.cropperOptions, (data) => {
            _uploadFile.bind(this)(this._editId, file, data);
            this._editId = null;
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
    const items = [];
    const els = this._el.querySelectorAll('[data-item-id]');
    [].forEach.call(els, function(el) {
        items.push(el.getAttribute('data-item-id'));
    })

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
    if (id === null) {
        var itemDto = {
            file: file,
            crop: crop,
        }

        if (typeof this._options.onAdd === "function") {
            this._options.onAdd(itemDto, (item) => {
                _addItem.bind(this)(item);
            }, function(rate) {
                _updateProgressBar.bind(this)(rate);
            });
        } else {
            _loadFile.bind(this)(itemDto, (item) => {
                _addItem.bind(this)(item);
            });
        }
    } else {
        var itemDto = {
            id: id,
            file: file,
            crop: crop,
        }

        if (typeof this._options.onUpdate === "function") {
            this._options.onUpdate(itemDto, (item) => {
                _updateItem.bind(this)(item);
            }, function(rate) {
                _updateProgressBar.bind(this)(rate);
            });
        } else {
            _loadFile.bind(this)(itemDto, (item) => {
                _updateItem.bind(this)(item);
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
    fileReader.addEventListener('load', (event) => {
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
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.classList.add('iu-item__inputFile');
    fileInput.addEventListener('change', _selectFile.bind(this));
    this._fileInput = fileInput;

    // label
    const label = document.createElement('label');
    label.classList.add('iu-item__inputLabel');
    label.innerHTML = this._options.strings.selectFile;

    // label wrapper
    const labelWrapper = document.createElement('span');
    labelWrapper.classList.add('iu-item__inputWrapper');
    labelWrapper.appendChild(label);

    // add view
    const addView = document.createElement('div');
    addView.classList.add('iu-item');
    addView.classList.add('iu-item--input');
    addView.classList.add('ui-item__sortable');
    addView.appendChild(fileInput);
    addView.appendChild(labelWrapper);
    addView.addEventListener('click', (event) => {
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
    const itemView = document.createElement('div');
    itemView.classList.add('iu-item');
    itemView.classList.add('ui-item__sortable');
    itemView.setAttribute('draggable', true);
    itemView.setAttribute('data-item-id', item.id);
    itemView.style['background-image'] = 'url("' + item.url + '")';

    const span = document.createElement('span');
    span.classList.add('iu-item__action');
    span.classList.add('dropmic');
    span.setAttribute('data-dropmic', item.id);
    span.setAttribute('data-dropmic-direction', 'bottom-middle');
    span.setAttribute('role', 'navigation');

    const button = document.createElement('button');
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
    let dropmic = new Dropmic(el);

    dropmic.addBtn(this._options.strings.update, (event) => {
        event.preventDefault();
        this._editId = item.id;
        this._fileInput.click();
    });

    if (this._options.deletable) {
        dropmic.addBtn(this._options.strings.delete, (event) => {
            event.preventDefault();
            if (typeof this._options.onDelete === "function") {
                this._options.onDelete(item, () => {
                    _removeItem.bind(this)(item);
                });
            } else {
                _removeItem.bind(this)(item);
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
