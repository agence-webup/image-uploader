module.exports = (function() {

    var dragSrcEl = null;
    var callback = null;
    const DRAG_CLASS = 'ui-item__sortableDrag';
    const OVER_CLASS = 'ui-item__sortableOver';

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
        el.addEventListener('dragenter', handleDragEnter, false)
        el.addEventListener('dragover', handleDragOver, false);
        el.addEventListener('dragleave', handleDragLeave, false);
        el.addEventListener('drop', handleDrop, false);
        el.addEventListener('dragend', handleDragEnd, false);
    }

    return function(el, cb) {
        callback = cb;
        addDnDHandlers(el);
    };
})();
