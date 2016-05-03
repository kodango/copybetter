/*
 * Popup.js
 */

/* Window object of background page */
var bgWindow = chrome.extension.getBackgroundPage();

/*
 * Shortchut for document.getElementById
 */
function $(id) { return document.getElementById(id); }

/*
 * Debug function
 */
function debug(msg) { bgWindow.debug.call(this, msg); }

/*
 * Generate the copy cache list
 */
function generateCacheList()
{
    var hints = $('hints');
    var cacheList = $('recent-cache');

    var config = bgWindow.config;

    $('clear').innerHTML = chrome.i18n.getMessage('clear_cache');
    $('option').innerHTML = chrome.i18n.getMessage('option');
    $('toggle').innerHTML = chrome.i18n.getMessage(config.enableAutoCopy ? 'disable' : 'enable');

    if (!config.alwaysAllowCopy)
        $('allowcopy').innerHTML = chrome.i18n.getMessage('allowcopy');

    var cacheAll = config.cache, cacheSize = cacheAll.length;

    if (cacheAll.length == 0) {
        cacheList.innerHTML = chrome.i18n.getMessage('empty_copy_cache_hint');
        return;
    }

    /*
     * Only show recent cacheSize items
     */
     var cacheRecent, ol, li, span, idx;

    if (cacheSize> config.cacheSize) {
        cacheRecent = cacheAll.slice(cacheSize - config.cacheSize, cacheSize);
        idx = cacheSize - config.cacheSize;
    } else {
        cacheRecent = cacheAll;
        idx = 0;
    }

    cacheList.innerHTML = "";
    ol = document.createElement('ol');

    for (item in cacheRecent) {
        li = document.createElement('li');
        li.className = "cache-item";

        li.textContent = cacheRecent[item];
        li.setAttribute('data-idx', idx++);

        ol.appendChild(li);
    }

    cacheList.appendChild(ol);
}

/*
 * Highlight select cache item
 */
function highlightSelected(elem)
{
    var hl = document.getElementsByClassName('selected');

    if (hl.length != 0) {
        hl[0].className = hl[0].className.replace(' selected', '');
    }

    elem.className = elem.className + ' selected';
}

/*
 * Listen click events
 */
document.addEventListener('click', function(event) {
    if (event.target.id == 'clear') {
        bgWindow.config.cache.length = 0;
        generateCacheList();
        debug('Clear the cache...');
    } else if (event.target.className == 'cache-item') {
        highlightSelected(event.target);
        bgWindow.paste(bgCache[event.target.dataset.idx]);
        debug('Paste cache text to content script');
    } else if (event.target.id == "option") {
        chrome.tabs.create({'active':true, 'url': 'options.html'});
        debug('Open the option page...');
    } else if (event.target.id == "toggle") {
        var enableAutoCopy = bgWindow.toggleAutoCopy(true);

        $('toggle').innerHTML = chrome.i18n.getMessage(
            enableAutoCopy ? "disable" : "enable"
        );

        debug('Toggle the disable option: ' + enableAutoCopy);
    } else if (event.target.id == 'allowcopy') {
        bgWindow.allowCopy();
    }
}, false);

document.addEventListener('DOMContentLoaded', function(event) {
    generateCacheList();
}, false);
