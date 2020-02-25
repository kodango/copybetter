/*
 * Background.js
 *
 */

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/*
 * Set option to value
 */
function setOption(key, val)
{
    val = JSON.stringify(val);
    localStorage.setItem(key, val);

    return val;
}

/*
 * Get option value
 */
function getOption(key, def)
{
    if (key in localStorage)
        return JSON.parse(localStorage.getItem(key));
    else
        return def;
}

/*
 * Load configuration from localStorage
 */
function loadConfig(reset)
{
    if (reset) {
        localStorage.clear();
    }

    var config = {
        'enableAutoCopy': getOption('enableAutoCopy', true),
        'enableRichCopy': getOption('enableRichCopy', true),
        'alwaysAllowCopy': getOption('alwaysAllowCopy', false),
        'removeHiddenElements': getOption('removeHiddenElements', true),
        'cacheSize': getOption('cacheSize', 5),
        'copyOnSelectInBox': getOption('copyOnSelectInBox', false),
        'copyTitleRawFmt': getOption('copyTitleRawFmt', '%TITLE% - %URL%'),
        'copyTitleFmt': getOption('copyTitleFmt', '<a href="%URL%" title="%TITLE%" target="_blank">%TITLE%</a>'),
        'enableDebug': getOption('enableDebug', false),
        'storeCacheOnExit': getOption('storeCacheOnExit', true),
        'cache': getOption('cache', []),
        'showCopyNotification': getOption('showCopyNotification', true)
    };

    return config;
}

/* Config object in memory */
var config = loadConfig();
debug('Load the configuration from localStorage: ' + JSON.stringify(config));

/*
 * Sync the configuration to all open tabs
 */
function syncConfig()
{
    // Save the configuration to localStorage
    for (var key in config) {
        if (key == 'cache') // Do not save cache when running
            continue;

        setOption(key, config[key]);
    }

    chrome.tabs.query({}, function(tabs) {
        var min_config = {};

        for (var key in config) {
            if (key == 'cache')
                continue
            else if (config.hasOwnProperty(key))
                min_config[key] = config[key];
        }

        debug('Sync the new configuration to all tabs: ' + JSON.stringify(min_config));

        for (var i = 0, len = tabs.length; i < len; i++) {
            chrome.tabs.sendMessage(tabs[i].id, {command: 'update', data: min_config});
        }
    });
}

/*
 * Debug function
 */
function debug(msg)
{
    if (config.enableDebug)
        this.console.log('[DEBUG] ' + msg);
}

/*
 * Show the notification
 */
function showNotify(str)
{
    if (!config.showCopyNotification)
        return;

    var options = {
        type: 'basic',
        iconUrl: 'img/icon-32.png',
        //title: chrome.i18n.getMessage("notification_title"),
        title: "",
        message: ""
    };

    str = str.replace('\n', ' ');

    if (str.length > 35) {
        options.message = str.substr(0, 35) + "...";
    } else {
        options.message = str;
    }

    chrome.notifications.create('copy-notify', options, function () {});
    debug('Show the notification: ' + options.message);

    setTimeout(function() {
        chrome.notifications.clear('copy-notify', function () {});
    }, 3000);
}

/*
 * Do real copy work
 */
function doCopy(str, noCache)
{
    var sandbox = document.getElementById('sandbox');

    noCache = noCache || false;

    debug('Copy string: ' + str + ', no cache: ' + noCache);

    sandbox.value = str;
    sandbox.select();
    document.execCommand('copy');
    sandbox.value = '';

    /* Show copy notification */
    showNotify(str);

    if (!noCache) {
        var cache = config.cache;

        /* Re-allocate cache space */
        if (cache.length == 2*config.cacheSize) {
            debug('Cache space is full, re-allocate it');
            cache = cache.slice(config.cacheSize, 2*config.cacheSize);
        }

        /* Push current copied string to cache */
        if (cache[cache.length - 1] != str) {
            cache.push(str);
        }
    }

    return str;
}

/* Copy string to clipboard */
function copy(str, mode)
{
    if (str.match(/^(\s|\n)*$/) != null)
        return "";

    if (mode == 'cur-tau') {
        str = (str == 'text') ? config.copyTitleRawFmt : config.copyTitleFmt

        chrome.tabs.query(
            {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function (tabs) {
                var url = tabs[0].url;
                var title = tabs[0].title;

                str = str.replace(/%TITLE%/g, title).replace(/%URL%/g, url);
                doCopy(str);
            }
        );
    } else if (mode == 'all-tau') {
        str = (str == 'text') ? config.copyTitleRawFmt : config.copyTitleFmt

        chrome.tabs.query(
            {'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function (tabs) {
                var url, title, value = "";

                for (var i = 0, len = tabs.length; i < len; i++) {
                    url = tabs[i].url;
                    title = tabs[i].title;

                    value += str.replace(/%TITLE%/g, title)
                            .replace(/%URL%/g, url) + '\n';
                }

                doCopy(value);
            }
        );
    } else {
        /* Trim leading and trailing newlines */
        str = str.replace(/^\n+|\n+$/, '');
        str = str.replace(/\xa0/g, ' ');

        doCopy(str, mode == 'no-cache');
    }
}

/*
 * Paste string to content scripts
 */
function paste(str)
{
    debug('Paste from string: ' + str);
    copy(str, 'no-cache');

    chrome.tabs.query(
        {
            'active': true,
            'windowId': chrome.windows.WINDOW_ID_CURRENT
        },

        function(tabs) {
            debug('Send paste string to [' + tabs[0].title + ']');

            chrome.tabs.sendMessage(tabs[0].id, {
                command: 'paste', data: str
            });
        }
    );

    return str;
}

/*
 * Toggle the auto-copy function
 */
function toggleAutoCopy(silent)
{
    config.enableAutoCopy = !config.enableAutoCopy;
    debug('Toggle auto-copy switch: ' + config.enableAutoCopy);

    syncConfig();

    if (config.enableAutoCopy) {
        chrome.browserAction.setBadgeText({'text': ''});
    } else {
        chrome.browserAction.setBadgeText({'text': 'OFF'});
        chrome.browserAction.setBadgeBackgroundColor({'color': '#FF0000'});
    }

    if (!silent) {
        showNotify(chrome.i18n.getMessage(
            config.enableAutoCopy ? 'enable_autocopy' : 'disable_autocopy'
        ));
    }

    return config.enableAutoCopy;
}

/*
 * Allow copy in current active tab
 */
function allowCopy()
{
    if (config.alwaysAllowCopy)
        return;

    chrome.tabs.query(
        {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function (tabs) {
            var id = tabs[0].id;
            var url = tabs[0].url;

            debug('Allow copy in current tab: ' + url);
            chrome.tabs.executeScript(id, {file:"/js/allowcopy.js"});
            showNotify(chrome.i18n.getMessage('allowcopy'));
        }
    );
}

/*
 * Store the cache when the window close
 */
chrome.windows.onRemoved.addListener(function(windowId) {
    if (config.storeCacheOnExit) {
        debug('Store the cache when exit: ' + JSON.stringify(config.cache));
        setOption('cache', config.cache);
    }
});

/*
 * Allow copy by default if set
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        if (config.alwaysAllowCopy && tab.url.startsWith("http")) {
            debug('Allow copy in current tab: ' + tab.url);
            chrome.tabs.executeScript(tab.id, {file:"/js/allowcopy.js"});
        }
    }
});

/*
 * Command passing between content script and background page
 */
chrome.commands.onCommand.addListener(function(command) {
    debug('Receive command' + command);

    switch (command) {
        case "cmd_copy_curtab_in_html":
            copy('html', "cur-tau");
            break;
        case "cmd_copy_curtab_in_text":
            copy('text', "cur-tau");
            break;
        case "cmd_copy_alltabs_in_html":
            copy('html', "all-tau");
            break;
        case "cmd_copy_alltabs_in_text":
            copy('text', "all-tau");
            break;
//        case "cmd_toggle_autocopy":
//            toggleAutoCopy();
//            break;
//        case "cmd_allow_copy":
//            allowCopy();
//            break;
        default:
            break;
    }
});

/*
 * Message passing between content script and background page
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.command) {
            case 'copy':
                debug('Request to copy string from content script');
                copy(request.data);
                break;
            case 'load':
                debug('Request to load config from content script');
                sendResponse(config);
                break;
            default:
                break;
        }

        return true;
    }
);
