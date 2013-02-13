/*
 * Content script for Copy Better Extension
 */

(function() {
    var config = {};
    var debug = function(msg) {};

    /*
     * Get selected html content.
     */
    function html(sel) {
        var div = document.createElement('div');
        var range = sel.getRangeAt(0);

        while(range.startContainer.nodeType == document.TEXT_NODE
              || range.startContainer.childNodes.length == 1)
            range.setStartBefore(range.startContainer);

        while(range.endContainer.nodeType == document.TEXT_NODE
              || range.endContainer.childNodes.length == 1)
            range.setEndAfter(range.endContainer);

        div.appendChild(range.cloneContents());

        return div.innerHTML;
    }

    /* 
     * Get selected text content
     */
    function text(sel) { return sel.toString(); }

    /*
     * Check whether any text is selected
     */
    function isSelected(sel) { return !sel.isCollapsed; }

    /*
     * Copy non-empty value to clipboard
     */
    function copy(value, mode) {
        if (value.match(/^(\s|\n)*$/) != null)
            return;

        mode = mode || 'normal';

        chrome.extension.sendMessage({
            command: 'copy',
            data: value,
            mode: mode
        });
        
        debug('Copyied string: ' + value + ', copy mode: ' + mode);
    }

    /*
     * Click event handler
     */
    function onclick(event) {
        if ((event.target.tagName == 'INPUT' && event.target.type == 'text')
                || event.target.tagName == 'TEXTAREA')
            return;

        var raw = true;

        if (event.shiftKey && event.keyCode == 67) /* Shift + c */
            raw = false;
        else if (event.ctrlKey && event.keyCode == 67) /* Ctrl + c */
            raw = true;
        else
            return;

        var value = "";
        var sel = window.getSelection();

        if (!isSelected(sel)) {
            if (raw) {
                value = config.copyTitleRawFmt.replace('%TITLE%', document.title)
                    .replace('%URL%', location.href);
            } else {
                value = config.copyTitleFmt.replace('%TITLE%', document.title)
                    .replace('%URL%', location.href);
            }

            copy(value);
        } else {
            value = raw ? text(sel) : html(sel);
            copy(value, config.copyOnSelect === true ? 'override' : 'normal');
            sel.removeAllRanges();
        }
    }

    /*
     * Mouseup event handler
     */
    function onmouseup(event) {
        if (!config.copyOnSelect)
            return;

        var target = event.target;
        var sel = window.getSelection();
        var value = "";

        if (target.tagName == 'INPUT' || target.tagName == 'TEXTAREA')
            value = target.value.substring(target.selectionStart,
                    target.selectionEnd);
        else if (isSelected(sel))
            value = text(sel);

        copy(value);
    }

    /*
     * Load configure from background page
     */
    chrome.extension.sendMessage({command: 'load'}, function(response) {
        config = response; 

        if (config.enableDebug) {
            debug = function(msg) { console.log(msg); };
        }
    });

    /*
     * Proceess paste message from extension
     */
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.command != 'paste')
                return;

            var target = document.activeElement;
            debug('Active element is ' + target.tagName);

            if ((target.tagName == 'INPUT' && target.type == "text") ||
                target.tagName == 'TEXTAREA') {
                target.value = target.value.substring(0, target.selectionStart) + 
                    request.data + target.value.substring(target.selectionEnd);
                debug('Paste string: ' + request.data);
            } else {
                debug('Copy string: ' + request.data);
            }
       }
    );

    window.addEventListener('keydown', onclick, false);
    window.addEventListener('mouseup', onmouseup, false);
})();
