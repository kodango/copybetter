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
 * Restore the option settings saved at the last time
 */
function restoreOptions()
{
    var config = bgWindow.loadConfig();

    $('copyOnSelect').checked = config.copyOnSelect;
    $('copyOnShiftSelect').checked = config.copyOnShiftSelect;
    $('copyOnShiftSelect').disabled = config.copyOnSelect;
    $('copyOnSelectInBox').checked = config.copyOnSelect && config.copyOnSelectInBox;
    $('copyOnSelectInBox').disabled = !config.copyOnSelect;
    $('copyTitleRawFmt').value = config.copyTitleRawFmt;
    $('copyTitleFmt').value = config.copyTitleFmt;
    $('enableDebug').checked = config.enableDebug;
    $('cacheSize').value = config.cacheSize;
    $('cacheSizeValue').value = config.cacheSize;
    $('storeCacheOnExit').checked = config.storeCacheOnExit;
    $('showCopyNotification').checked = config.showCopyNotification;
}

/*
 * Reset the option settings to default
 */
function resetOptions()
{
    $('copyOnSelect').checked = true;
    $('copyOnShiftSelect').checked = true;
    $('copyOnSelectInBox').checked = false;
    $('copyTitleRawFmt').value = '%TITLE% - %URL%';
    $('copyTitleFmt').value = '<a href="%URL%" target="_blank">%TITLE%</a>';
    $('enableDebug').checked = true;
    $('cacheSizeValue').value = 10;
    $('storeCacheOnExit').checked = true;
    $('showCopyNotification').checked = true;

    saveOptions();
}

/*
 * Save the option value
 */
function save_config(key, id)
{
    var elem;

    id = id || key;
    elem = $(id);

    if (elem.disabled)
        return;

    if (elem.tagName == 'TEXTAREA') {
        bgWindow.set(key, elem.value);
        debug('Save option, key: ' + key + ', value: ' + elem.value);
    } else if (elem.tagName == 'INPUT') {
        switch (elem.type) {
            case 'checkbox':
                bgWindow.set(key, elem.checked);
                debug('Save option, key: ' + key + ', value: ' + elem.checked);
                break;
            default:
                bgWindow.set(key, elem.value);
                debug('Save option, key: ' + key + ', value: ' + elem.value);
                break;
        }
    } else {
        debug('Unknown tag ' + elem.tagName + ', id is ' + id);
    }
}

/*
 * Save current option settings
 */
function saveOptions()
{
    save_config('copyOnSelect');
    save_config('copyOnShiftSelect');
    save_config('copyOnSelectInBox');
    save_config('copyTitleRawFmt');
    save_config('copyTitleFmt');
    save_config('enableDebug');
    save_config('storeCacheOnExit');
    save_config('cacheSize');
    save_config('showCopyNotification');

    bgWindow.config = bgWindow.loadConfig();
    bgWindow.updateConfig();
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
    } else if (target.id == 'copyOnSelect') {
        $('copyOnSelectInBox').disabled = !target.checked;
        $('copyOnShiftSelect').disabled = target.checked;
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
    $('help').innerHTML = chrome.i18n.getMessage('help');
    $('save').innerHTML = chrome.i18n.getMessage('save');
    $('reset').innerHTML = chrome.i18n.getMessage('reset');
    $('restore').innerHTML = chrome.i18n.getMessage('restore');

    $('copyOnSelect-text').innerHTML = chrome.i18n.getMessage('opt_copy_on_select');
    $('copyOnShiftSelect-text').innerHTML = chrome.i18n.getMessage('opt_copy_on_shift_select');
    $('copyOnSelectInBox-text').innerHTML = chrome.i18n.getMessage('opt_copy_on_select_in_box');
    $('copyTitleRawFmt-text').innerHTML = chrome.i18n.getMessage('opt_copy_title_raw_fmt');
    $('copyTitleFmt-text').innerHTML = chrome.i18n.getMessage('opt_copy_title_fmt');
    $('enableDebug-text').innerHTML = chrome.i18n.getMessage('opt_enable_debug');
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
    restoreOptions();
}

document.addEventListener('DOMContentLoaded', onload, false);
