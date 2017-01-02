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
 * Display extension menu
 */
function displayExtMenu()
{
    var hints = $('extension-menu');
    var config = bgWindow.config;

    $('toggle-autocopy').innerHTML = chrome.i18n.getMessage(config.enableAutoCopy ? 'disable' : 'enable');
    $('clear-cache').innerHTML = chrome.i18n.getMessage('clear_cache');

    if (!config.alwaysAllowCopy)
        $('allow-copy').innerHTML = chrome.i18n.getMessage('allowcopy');

    $('copy-cur-tau-in-html').innerHTML = chrome.i18n.getMessage('copy_curtab_in_html')
    $('copy-all-tau-in-html').innerHTML = chrome.i18n.getMessage('copy_alltabs_in_html')
    $('copy-cur-tau-in-text').innerHTML = chrome.i18n.getMessage('copy_curtab_in_text')
    $('copy-all-tau-in-text').innerHTML = chrome.i18n.getMessage('copy_alltabs_in_text')

    $('extension-settings').innerHTML = chrome.i18n.getMessage('settings');

    return;
}

/*
 * Display the copy cache list
 */
function displayCacheList()
{
    var cacheList = $('recent-cache');
    var config = bgWindow.config;

    var cacheAll = config.cache, cacheSize = cacheAll.length;
    var ol = document.createElement('ol'), li;

    cacheList.innerHTML = "";

    if (cacheAll.length == 0) { // Show empty list
        li = document.createElement('li');
        li.className = "cache-item empty"
        li.textContent = chrome.i18n.getMessage('empty_copy_cache_hint');
        ol.appendChild(li);
    } else {
        var start, i;
        /*
         * Only show recent cacheSize items
         */
        if (cacheSize> config.cacheSize) {
            start = cacheSize - config.cacheSize;
        } else {
            start = 0;
        }

        for (i = cacheSize - 1; i >= start; i--) {
            li = document.createElement('li');
            li.className = "cache-item";

            li.textContent = cacheAll[i];
            li.setAttribute('data-idx', i);

            ol.appendChild(li);
        }
    }

    cacheList.appendChild(ol);
}

/*
 * Highlight select cache item
 */
function highlightSelected(elem)
{
    var hl = document.getElementsByClassName('highlight');

    if (hl.length != 0) {
        hl[0].className = hl[0].className.replace(' highlight', '');
    }

    elem.className = elem.className + ' highlight';
}

/*
 * Listen click events
 */
document.addEventListener('click', function(event) {
    var target = event.target;

    if (target.id == "toggle-autocopy") {
        var enableAutoCopy = bgWindow.toggleAutoCopy(true);

        $('toggle-autocopy').innerHTML = chrome.i18n.getMessage(
            enableAutoCopy ? "disable" : "enable"
        );

        debug('Toggle the disable option: ' + enableAutoCopy);
    } else if (target.id == 'clear-cache') {
        var cache = bgWindow.config.cache;

        cache.length = 0;
        displayCacheList();

        debug('Clear the cache...');
    } else if (target.id == 'allow-copy') {
        bgWindow.allowCopy();
    } else if (target.id == 'copy-cur-tau-in-html') {
        bgWindow.copy('html', "cur-tau");
    } else if (target.id == 'copy-all-tau-in-html') {
        bgWindow.copy('html', "all-tau");
    } else if (target.id == 'copy-cur-tau-in-text') {
        bgWindow.copy('text', "cur-tau");
    } else if (target.id == 'copy-all-tau-in-text') {
        bgWindow.copy('text', "all-tau");
    } else if (target.id == "extension-settings") {
        chrome.tabs.create({'active':true, 'url': 'options.html'});
        debug('Open the option page...');
    } else if (target.className == 'cache-item') {
        var cache = bgWindow.config.cache;
        var idx = parseInt(target.dataset.idx);

        if (event.altKey) {
            debug('Remove item #' + idx + 'cache text to content script');
            cache.remove(idx);
            displayCacheList();
        } else {
            highlightSelected(target);
            bgWindow.paste(cache[idx]);

            debug('Paste cache text to content script');
        }
    }
}, false);

document.addEventListener('DOMContentLoaded', function(event) {
    displayExtMenu();
    displayCacheList();
}, false);
