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
 * Prepend text node into target element
 */
function prependText(elem_id, msg_name)
{
    var str = chrome.i18n.getMessage(msg_name);
    var elem = $(elem_id), textNode;

    if (!elem)
        return;

    // Note: text node do not accept tags
    //textNode = document.createTextNode(str);
    //elem.insertBefore(textNode, elem.firstChild);
    elem.innerHTML = str + elem.innerHTML;

    return elem;
}

/*
 * Display i18n messages
 */
function displayI18N()
{
    document.title = chrome.i18n.getMessage('opt_title_name');

    prependText('extension-name', 'ext_name');
    prependText('extension-settings-title', 'opt_extension_settings');

    prependText('feedback', 'feedback');
    prependText('reset', 'reset');
    prependText('shortcuts', 'shortcuts');

    prependText('copyOnSelectInBox-text', 'opt_copy_on_select_in_box');
    prependText('copyTitleFmt-text', 'opt_copy_title_fmt');
    prependText('copyTitleRawFmt-text', 'opt_copy_title_raw_fmt');

    prependText('alwaysAllowCopy-text', 'opt_always_allow_copy');
    prependText('enableRichCopy-text', 'opt_enable_rich_copy');
    prependText('removeHiddenElements-text', 'opt_remove_hidden_elements');
    prependText('storeCacheOnExit-text', 'opt_store_cache_on_exit');
    prependText('showCopyNotification-text', 'opt_show_copy_notification');
    prependText('enableDebug-text', 'opt_enable_debug');

    prependText('cacheSize-text', 'opt_cache_size');
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
