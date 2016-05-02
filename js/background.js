/*
 * Background.js
 *
 */

/*
 * Set option to value
 */
function set(key, val)
{
    val = JSON.stringify(val);
    localStorage.setItem(key, val);

    return val;
}

/*
 * Get option value
 */
function get(key, def)
{
    if (key in localStorage)
        return JSON.parse(localStorage.getItem(key));
    else
        return def;
}

/*
 * Clean options
 */
function clearConfig()
{
    localStorage.clear();
}

/*
 * Load configuration from local
 */
function loadConfig()
{
    var cfg = {
        'enableAutocopy': get('enableAutocopy', true),
        'alwaysAllowCopy': get('alwaysAllowCopy', false),
        'cacheSize': get('cacheSize', 5),
        'copyOnSelectInBox': get('copyOnSelectInBox', false),
        'copyTitleRawFmt': get('copyTitleRawFmt', '%TITLE% - %URL%'),
        'copyTitleFmt': get('copyTitleFmt', '<a href="%URL%" title="%TITLE%" target="_blank">%TITLE%</a>'),
        'enableDebug': get('enableDebug', false),
        'storeCacheOnExit': get('storeCacheOnExit', true),
        'cache': get('cache', []),
        'showCopyNotification': get('showCopyNotification', true)
    };

    return cfg;
}

/*
 * Update configuration
 */
function updateConfig()
{
    config = loadConfig();

    chrome.tabs.query({}, function(tabs) {
        debug('Send update config message to all tabs');

        for (var i in tabs) {
            chrome.tabs.sendMessage(tabs[i].id, {
                command: 'update', data: config
            });
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
        chrome.tabs.query(
            {'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function (tabs) {
                var url, title, value = "";

                for (var i in tabs) {
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
function toggleAutocopy(silent)
{
    config.enableAutocopy = !config.enableAutocopy;
    debug('Toggle auto-copy switch: ' + config.enableAutocopy);
    updateConfig();

    if (!silent) {
        showNotify(chrome.i18n.getMessage(
            config.enableAutocopy ? 'enable_autocopy' : 'disable_autocopy'
        ));
    }
}

/*
 * Allow copy in current active tab
 */
function allowCopy()
{
    if (config.alwaysAllowCopy)
        return;

    debug('Allow copy in current tab');

    chrome.tabs.query(
        {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function (tabs) {
            var id = tabs[0].id;
            chrome.tabs.executeScript(id, {file:"/js/allowcopy.js"});
            showNotify(chrome.i18n.getMessage('allowcopy'));
        }
    );
}

/* Config object */
var config = loadConfig();
/* Copy cache */
var cache = config.cache;

/*
 * Store the cache when the window close
 */
chrome.windows.onRemoved.addListener(function(windowId) {
    if (config.storeCacheOnExit) {
        debug('Store the cache when exit');
        set('cache', cache);
    }
});

/*
 * Allow copy by default if set
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        if (config.alwaysAllowCopy && tab.url.startsWith("http")) {
            debug('Allow copy in current tab: ' + tab.url);
            console.log(changeInfo);
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
            copy(config.copyTitleFmt, "cur-tau");
            break;
        case "cmd_copy_curtab_in_text":
            copy(config.copyTitleRawFmt, "cur-tau");
            break;
        case "cmd_copy_alltabs_in_html":
            copy(config.copyTitleFmt, "all-tau");
            break;
        case "cmd_copy_alltabs_in_text":
            copy(config.copyTitleRawFmt, "all-tau");
            break;
        case "cmd_toggle_autocopy":
            toggleAutocopy();
            break;
        case "cmd_allow_copy":
            allowCopy();
            break;
        default:
            break;
    }
});

/*
 * Message passing between content script and background page
 */
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.command) {
            case 'copy':
                debug('Request to copy string from content script');
                copy(request.data, request.mode);
                break;
            case 'load':
                debug('Request to load config from content script');
                sendResponse(config);
                break;
            default:
                break;
        }
    }
);
