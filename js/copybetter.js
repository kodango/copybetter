/*
 * Content script for Copy Better Extension
 */

(function() {
    /* Local configuration */
    var config = {};

    /* An empty debug function */
    var _emptyFunc = function(msg) {};
    /* A simple debug function */
    var _debugFunc = function(msg) { console.log(msg); };
    /* Real debug function */
    var debug = _emptyFunc;

    var TRANSPARENT_COLOR = 'rgba(0, 0, 0, 0)';
    var DELTA = 15;

    /*
     * Update config to new one
     */
    function updateConfig(newConfig)
    {
        config = newConfig;

        if (config.enableDebug) {
            debug = _debugFunc;
        } else {
            debug = _emptyFunc;
        }

        debug('Update config successfully');
    }

    /*
     * Get the value of css attribute
     */
    function css(node, name)
    {
        var style = window.getComputedStyle(node, null);

        return style.getPropertyValue(name);
    }

    /*
     * Get the actual background color value
     */
    function getActualBackgroundColor(node)
    {
        var bg = TRANSPARENT_COLOR;

        while (node) {
            bg = css(node, 'background-color');

            if (bg != TRANSPARENT_COLOR)
                break;

            if (node == document.body)
                break;

            node = node.parentNode;
        }

        return bg;
    }

    /*
     * Get the color value
     */
    function colorValue(c)
    {
        var regex=/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d)+)?\)/;
        var m = c.match(regex);

        if (m) {
            if (m[4] === undefined)
                m[4] = 1;

            return [m[1], m[2], m[3], m[4]]
        } else {
            return [0, 0, 0, 0]
        }
    }

    /*
     * Check whether two value are approximately equal
     */
    function approxColor(lhs, rhs)
    {
        var l_c = colorValue(lhs), r_c = colorValue(rhs);
        var i;

        for (i = 0; i < 3; i++) {
            if (Math.abs(l_c[i] - r_c[i]) > DELTA)
                return false;
        }

        return true;
    }

    /*
     * Check whether the node is hidden
     */
    function isHidden(node)
    {
        /* display:none or visibility:hidden */
        if (css(node, 'display') == 'none' || css(node, 'visibility') == 'hidden')
            return true;

        /* font size is zero, so we can't see it */
        if (css(node, 'fontSize') == 0 || css(node, 'fontSize') == '0px')
            return true;

        var bg = getActualBackgroundColor(node);
        var color = css(node, 'color');

        if (bg == TRANSPARENT_COLOR) { // Actual bg color is transparent (default)
            /* but node color is white */
            if (approxColor(color, 'rgb(255, 255, 255)'))
                return true;
        } else {
            /* Bg color and color are the same */
            if (approxColor(color, bg))
                return true;
        }

        return false;
    }

    /*
     * Remove the hidden childrens of root element
     */
    function removeHidden(rootElement)
    {
        if (rootElement.nodeType == document.TEXT_NODE)
            return;

        var nodes = rootElement.querySelectorAll('div,p,span,font');
        var i, node, style, len = nodes.length;

        for (i = 0; i < len; i++) {
            node = nodes[i];

            if (isHidden(node)) {
                debug('Remove hidden node ' + node);
                node.parentNode.removeChild(node);
            }
        }
    }

    /*
     * Get the selected content
     */
    function getSelectedContent(sel, textOnly)
    {
        var div = document.createElement('div');
        var range = sel.getRangeAt(0);

        if (!textOnly) { // Expand the selection if want to copy html code
            while(range.startContainer.nodeType == document.TEXT_NODE
                  || range.startContainer.childNodes.length == 1)
                range.setStartBefore(range.startContainer);

            while(range.endContainer.nodeType == document.TEXT_NODE
                  || range.endContainer.childNodes.length == 1)
                range.setEndAfter(range.endContainer);
        }

        /* Remove hidden text in the selection content */
        removeHidden(range.commonAncestorContainer);

        if (textOnly) {
            return sel.toString();
        } else {
            range = sel.getRangeAt(0);
            div.appendChild(range.cloneContents());

            return div.innerHTML;
        }
    }

    /*
     * Get selected html content.
     */
    function html(sel) { return getSelectedContent(sel, false); }

    /* 
     * Get selected text content
     */
    function text(sel) { return getSelectedContent(sel, true); }

    /*
     * Check whether any text is selected
     */
    function isSelected(sel) { return !sel.isCollapsed; }

    /*
     * Check whether the element is a edit box, like textarea or text input
     */
    function isEditBox(elem) 
    {
        return (elem.tagName == 'INPUT' && elem.type == "text")
            || elem.contentEditable == 'true' // contenteditable is true && tag name limit??
            || elem.tagName == 'TEXTAREA' ;
    }

    /*
     * Show notification when copied
     */
    function showCopyNotification(txt)
    {
        var container = document.getElementById('copybetter-status');

        if (container == null) {
            container = document.createElement('div');
            container.id = 'copybetter-status';
            document.body.appendChild(container);
        }

        container.textContent = txt;
        container.style.display = 'block';

        setTimeout(hideCopyNotification, 5000);
    }

    /*
     * Hide notification box
     */
    function hideCopyNotification()
    {
        var container = document.getElementById('copybetter-status');

        if (container == null)
            return;

        container.style.display = 'none';
    }

    /*
     * Copy non-empty value to clipboard
     */
    function copy(value, mode)
    {
        if (value.match(/^(\s|\n)*$/) != null)
            return;

        mode = mode || 'normal';

        chrome.extension.sendMessage({
            command: 'copy',
            data: value,
            mode: mode
        }, function (response) {
            if (config.showCopyNotification) {
                showCopyNotification(response.clipboard);
            }
        });
        
        debug('Copyied string: ' + value + ', copy mode: ' + mode);
    }

    /*
     * Click event handler
     */
    function onclick(event)
    {
        if (isEditBox(event.target))
            return;

        var raw = true;
        var value = "";
        var sel = window.getSelection();

        if (event.shiftKey && event.keyCode == 67) /* Shift + c */
            raw = false;
        else if (event.ctrlKey && event.keyCode == 67) /* Ctrl + c */
            raw = true;
        else
            return;

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
    function onmouseup(event)
    {
        if (!config.copyOnSelect && !(config.copyOnShiftSelect&&event.shiftKey))
            return;

        var value = "";
        var sel = window.getSelection();

        if (isEditBox(event.target)) {  // if in edit box
            if (!config.copyOnSelectInBox)
                return;

            value = event.target.value;
            value = value.substring(event.target.selectionStart,
                    event.target.selectionEnd);
            copy(value);
        } else {
            if (!isSelected(sel))
                return;

            value = text(sel);
            copy(value);
        }
    }

    /*
     * Load configure from background page
     */
    chrome.extension.sendMessage({command: 'load'}, function(response) {
        updateConfig(response);
    });

    /*
     * Copy from cache list
     */
    function copyFromCache(str)
    {
        var target = document.activeElement;

        debug('Active element is ' + target.tagName);

        if (isEditBox(target)) {
            target.value = target.value.substring(0, target.selectionStart) + 
                str + target.value.substring(target.selectionEnd);
            debug('Paste string: ' + str);
        } else {
            debug('Copy string: ' + str);
        }
    }

    /*
     * Proceess paste message from extension
     */
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) 
        {
            switch (request.command) {
                case 'paste':
                    copyFromCache(request.data);
                    break;
                case 'update':
                    updateConfig(request.data);
                    break;
                default:
                    break;
            }
       }
    );

    window.addEventListener('keydown', onclick, false);
    window.addEventListener('mouseup', onmouseup, false);
})();
