/*
 * Content script for Copy Better Extension
 */

(function() {
    /* Local configuration */
    var config = {};

    var TRANSPARENT_COLOR = 'rgba(0, 0, 0, 0)';
    var DELTA = 15;

    /*
     * Update config to new one
     */
    function updateConfig(newConfig)
    {
        config = newConfig;
        debug('Update config successfully: ' + JSON.stringify(newConfig));
    }

    /*
     * Debug function
     */
    function debug(msg)
    {
        if (config.enableDebug)
            console.log('[DEBUG] ' + msg);
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

            // Consider the frames, do not use document.body
            if (node == node.ownerDocument.body)
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
        var m = c.match(/rgba?\(([.0-9]+),\s*([.0-9]+),\s*([.0-9]+)(?:,\s*([.0-9]+))?\)/);

        if (m) {
            if (m[4] === undefined)
                m[4] = 1;

            return [m[1], m[2], m[3], m[4]];
        } else {
            return ["0", "0", "0", "0"];
        }
    }

    /*
     * Check whether two value are approximately equal
     */
    function approxColor(lhs, rhs)
    {
        var l_c = colorValue(lhs), r_c = colorValue(rhs);
        var i;

        for (i = 0; i < 4; i++) {
            if (l_c[i] != r_c[i])
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
        if (css(node, 'font-size') == 0 || css(node, 'font-size') == '0px')
            return true;

        // Empty node, do not remove
        if (node.textContent.match(/^(\s|\n)*$/) != null)
            return false;

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
        if (config.removeHiddenElements) {
            removeHidden(range.commonAncestorContainer);
        } else {
            debug('Do not try to remove hidden elements');
        }

        if (textOnly) {
            return sel.toString();
        } else {
            //range = sel.getRangeAt(0);
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
        return elem && ((elem.tagName == 'INPUT' && elem.type == "text")
            || elem.contentEditable == 'true' // contenteditable is true && tag name limit??
            || elem.tagName == 'TEXTAREA');
    }

    /*
     * Copy non-empty value to clipboard
     */
    function copy(value)
    {
        if (value.match(/^(\s|\n)*$/) != null)
            return;

        debug('Copy string: ' + value);

        chrome.runtime.sendMessage({
            command: 'copy',
            data: value,
        }, function (response) {});
     }

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
            debug('Paste string from cache: ' + str);
        } else {
            debug('Copy string from cache: ' + str);
        }
    }

    /*
     * Copy from the selected text or html in page
     */
    function copyFromSelection(fmt)
    {
        var sel = window.getSelection();

        if (!isSelected(sel))
            return;

        copy(fmt == "html" ? html(sel) : text(sel));
    }

    /*
     * Mouseup event handler
     */
    function onmouseup(event)
    {
        var tg = event.target;

        if (!config.enableAutoCopy)
            return;

        if (isEditBox(tg)) {
            // if in a editor, just copy selection text
            if (!config.copyOnSelectInBox)
                return;

            copy(tg.value.substring(tg.selectionStart, tg.selectionEnd));
        } else {
            // If shiftKey is pressed, copy as html format, otherwise use text
            if (config.enableRichCopy && event.altKey) {
                copyFromSelection("html");
            } else {
                copyFromSelection("text");
            }
        }
    }

    /*
     * Keydown event handler
     */
    function onkeydown(event)
    {
        if (!config.enableAutoCopy || !config.enableRichCopy)
            return;

        // Do not take affect in edit box
        if (isEditBox(event.target))
            return;

        if (event.altKey && event.keyCode == 18) {
            copyFromSelection("html");
        }
    }

    /*
     * Proceess paste message from extension
     */
    chrome.runtime.onMessage.addListener(
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

            return true;
       }
    );

    /*
    * Load configure from background page
    */
    chrome.runtime.sendMessage({command: 'load'}, function(response) {
        updateConfig(response);
    });

    document.addEventListener('keydown', onkeydown, false);
    document.addEventListener('mouseup', onmouseup, false);
    document.addEventListener('DOMContentLoaded', function(e) {
        document.body.addEventListener('mouseup', onmouseup, false);
    }, false);
})();
