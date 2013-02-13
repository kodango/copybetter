/*
 * Options.js
 */

/*
 * Window object of background page
 */
var bgWindow = chrome.extension.getBackgroundPage();

/*
 * Shortchut for document.getElementById
 */
function $(id)
{
    return document.getElementById(id);
}

/*
 * Restore the option settings saved at the last time
 */
function restoreOptions()
{
    var config = bgWindow.loadConfig();

    $('copyOnSelect').checked = config.copyOnSelect;
    $('copyTitleRawFmt').value = config.copyTitleRawFmt;
    $('copyTitleFmt').value = config.copyTitleFmt;
    $('enableDebug').checked = config.enableDebug;
    $('cacheSize').value = config.cacheSize;
    $('cacheSizeValue').value = config.cacheSize;
    $('storeCacheOnExit').checked = config.storeCacheOnExit;
    $('maxLineCharsOnPopup').value = config.maxLineCharsOnPopup;
}

/*
 * Reset the option settings to default
 */
function resetOptions()
{
    $('copyOnSelect').checked = true;
    $('copyTitleRawFmt').value = '%TITLE%\n%URL%';
    $('copyTitleFmt').value = '<a href="%URL%" target="_blank">%TITLE%</a>';
    $('enableDebug').checked = true;
    $('cacheSizeValue').value = 10;
    $('storeCacheOnExit').checked = true;
    $('maxLineCharsOnPopup').value = 40;

    saveOptions();
}

/*
 * Save current option settings
 */
function saveOptions()
{
    var copyOnSelect = $('copyOnSelect').checked;
    bgWindow.set('copyOnSelect', copyOnSelect);

    var copyTitleRawFmt = $('copyTitleRawFmt').value;
    bgWindow.set('copyTitleRawFmt', copyTitleRawFmt);

    var copyTitleFmt = $('copyTitleFmt').value;
    bgWindow.set('copyTitleFmt', copyTitleFmt);

    var enableDebug = $('enableDebug').checked;
    bgWindow.set('enableDebug', enableDebug);

    var storeCacheOnExit = $('storeCacheOnExit').checked;
    bgWindow.set('storeCacheOnExit', storeCacheOnExit);

    var cacheSize = $('cacheSize').value;
    bgWindow.set('cacheSize', cacheSize);

    var maxChars = $('maxLineCharsOnPopup').value;
    bgWindow.set('maxLineCharsOnPopup', maxChars);

    bgWindow.config = bgWindow.loadConfig();
}

/*
 * Show status notify
 */
function showNotify(txt)
{
    var status = $("status");

    status.innerHTML = txt;
    setTimeout(function() { status.innerHTML = ""; }, 2000);
}

/*
 * Listen the change event
 */
document.addEventListener('change', function(event) {
    var target = event.target;

    if (target.id == 'cacheSize') {
        $('cacheSizeValue').value = target.value;
    }
}, false);

/*
 * Listen click events
 */
document.addEventListener('click', function(event) {
    var target = event.target;

    switch (target.id) {
        case 'save':
            saveOptions();
            showNotify(chrome.i18n.getMessage('save_notify'));
            break;
        case 'restore':
            restoreOptions();
            showNotify(chrome.i18n.getMessage('restore_notify'));
            break;
        case 'reset':
            resetOptions();
            showNotify(chrome.i18n.getMessage('reset_notify'));
            break;
        default:
            break;
    }
}, false);

/*
 * Display i18n messages
 */
function displayI18N()
{
    document.title = chrome.i18n.getMessage('opt_title_name');
    $('header-text').innerHTML = document.title;

    $('feedback').innerHTML = chrome.i18n.getMessage('feedback');
    $('save').innerHTML = chrome.i18n.getMessage('save');
    $('reset').innerHTML = chrome.i18n.getMessage('reset');
    $('restore').innerHTML = chrome.i18n.getMessage('restore');

    $('copyOnSelect-text').innerHTML = chrome.i18n.getMessage('opt_copy_on_select');
    $('copyTitleRawFmt-text').innerHTML = chrome.i18n.getMessage('opt_copy_title_raw_fmt');
    $('copyTitleFmt-text').innerHTML = chrome.i18n.getMessage('opt_copy_title_fmt');
    $('enableDebug-text').innerHTML = chrome.i18n.getMessage('opt_enable_debug');
    $('storeCacheOnExit-text').innerHTML = chrome.i18n.getMessage('opt_store_cache_on_exit');
    $('cacheSize-text').innerHTML = chrome.i18n.getMessage('opt_cache_size');
    $('maxLineCharsOnPopup-text').innerHTML = chrome.i18n.getMessage('opt_max_chars');
}

/*
 * Run when the options.html is loaded
 */
function onload()
{
    displayI18N()
    restoreOptions();
}

document.addEventListener('DOMContentLoaded', onload, false);
