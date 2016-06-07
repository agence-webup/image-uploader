
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
