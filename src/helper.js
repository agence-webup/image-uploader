
module.exports = {
    /**
     * get DOMElement from selector
     * @param  {string|DOMElement} el
     * @return {DOMElement}
     */
    querySelector: function (el) {
        if (typeof el === 'string') {
            el = document.querySelector(el)
        }

        return el
    },

    /**
     * function to extend defaults with user options
     * @param  {Object} source
     * @param  {Object} properties
     * @return {Object}
     */
    extend: function (source, properties) {
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    },

    /**
     * Parse HTML string into DOMElement
     * @param  {string} html
     * @return {DOMElement}
     */
    parseHTML: function (html) {
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
};
