/*
 * Options.js
 */

/*
 * Window object of background page
 */
var bgWindow = chrome.extension.getBackgroundPage();

function debug(msg)
{
    bgWindow.debug.call(this, msg);
}

/*
 * Shortchut for document.getElementById
 */
function $(id)
{
    return document.getElementById(id);
}

/*
 * Save the option value
 */
function saveOption(id)
{
    var elem = $(id);

    if (elem.disabled)
        return;

    if (elem.tagName == 'TEXTAREA') {
        bgWindow.config[id] = elem.value;
        debug('Save option, id: ' + id + ', value: ' + elem.value);
    } else if (elem.tagName == 'INPUT') {
        switch (elem.type) {
            case 'checkbox':
                bgWindow.config[id] = elem.checked;
                debug('Save option, id: ' + id + ', value: ' + elem.checked);
                break;
            default:
                bgWindow.config[id] = elem.value;
                debug('Save option, id: ' + id + ', value: ' + elem.value);
                break;
        }
    } else {
        debug('Unknown tag ' + elem.tagName + ', id is ' + id);
    }
}

/*
 * Intialize the option settings
 */
function initOptions()
{
    var config = bgWindow.config;

    $('copyOnSelectInBox').checked = config.copyOnSelectInBox;
    $('copyTitleRawFmt').value = config.copyTitleRawFmt;
    $('copyTitleFmt').value = config.copyTitleFmt;
    $('enableDebug').checked = config.enableDebug;
    $('alwaysAllowCopy').checked = config.alwaysAllowCopy;
    $('enableRichCopy').checked = config.enableRichCopy;
    $('removeHiddenElements').checked = config.removeHiddenElements;
    $('cacheSize').value = config.cacheSize;
    $('cacheSizeValue').value = config.cacheSize;
    $('storeCacheOnExit').checked = config.storeCacheOnExit;
    $('showCopyNotification').checked = config.showCopyNotification;
}

/*
 * Save current option settings
 */
function saveOptions()
{
    saveOption('copyOnSelectInBox');
    saveOption('copyTitleRawFmt');
    saveOption('copyTitleFmt');
    saveOption('enableDebug');
    saveOption('alwaysAllowCopy');
    saveOption('enableRichCopy');
    saveOption('removeHiddenElements');
    saveOption('cacheSize');
    saveOption('storeCacheOnExit');
    saveOption('showCopyNotification');

    bgWindow.syncConfig();
}

/*
 * Reset the option settings to default
 */
function resetOptions()
{
    bgWindow.config = bgWindow.loadConfig(true);
    initOptions();
    saveOptions();
}

/*
 * Show status notify
 */
function showNotify(txt)
{
    var status = $("status");

    status.innerHTML = txt;
    setTimeout(function() { status.innerHTML = ""; }, 3000);
}

/*
 * Display i18n messages
 */
function displayI18N()
{
    document.title = chrome.i18n.getMessage('opt_title_name');
    $('header-text').innerHTML = document.title;

    $('feedback').innerHTML = chrome.i18n.getMessage('feedback');
    $('help').innerHTML = chrome.i18n.getMessage('help');
    $('reset').innerHTML = chrome.i18n.getMessage('reset');
    $('shortcuts').innerHTML = chrome.i18n.getMessage('shortcuts');

    $('copyOnSelectInBox-text').innerHTML = chrome.i18n.getMessage('opt_copy_on_select_in_box');
    $('copyTitleRawFmt-text').innerHTML = chrome.i18n.getMessage('opt_copy_title_raw_fmt');
    $('copyTitleFmt-text').innerHTML = chrome.i18n.getMessage('opt_copy_title_fmt');
    $('enableDebug-text').innerHTML = chrome.i18n.getMessage('opt_enable_debug');
    $('alwaysAllowCopy-text').innerHTML = chrome.i18n.getMessage('opt_always_allow_copy');
    $('enableRichCopy-text').innerHTML = chrome.i18n.getMessage('opt_enable_rich_copy');
    $('removeHiddenElements-text').innerHTML = chrome.i18n.getMessage('opt_remove_hidden_elements');
    $('storeCacheOnExit-text').innerHTML = chrome.i18n.getMessage('opt_store_cache_on_exit');
    $('cacheSize-text').innerHTML = chrome.i18n.getMessage('opt_cache_size');
    $('showCopyNotification-text').innerHTML = chrome.i18n.getMessage('opt_show_copy_notification');
}

/*
 * Run when the options.html is loaded
 */
function onload()
{
    displayI18N()
    initOptions();
}

document.addEventListener('DOMContentLoaded', onload, false);

/*
 * Listen the change event
 */
document.addEventListener('change', function(event) {
    var target = event.target;

    if (target.id == 'cacheSize') {
        $('cacheSizeValue').value = target.value;
    } else if (target.id == 'cacheSizeValue') {
        $('cacheSize').value = target.value;
    }

    // Auto-save the settings when change
    saveOptions();
    showNotify(chrome.i18n.getMessage('autosave_notify'));
}, false);

/*
 * Listen click events
 */
document.addEventListener('click', function(event) {
    var target = event.target;

    switch (target.id) {
        case 'reset':
            resetOptions();
            showNotify(chrome.i18n.getMessage('reset_notify'));
            break;
        case "shortcuts":
            chrome.tabs.create({url:'chrome://extensions/configureCommands'});
            break;
        default:
            break;
    }
}, false);
