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
 * Load configuration from local
 */
function loadConfig()
{
    return {
        'cacheSize': get('cacheSize', 10),
        'copyOnSelect': get('copyOnSelect', true),
        'copyTitleRawFmt': get('copyTitleRawFmt', '%TITLE%\n%URL%'),
        'copyTitleFmt': get('copyTitleFmt', '<a href="%URL%" target="_blank">%TITLE%</a>'),
        'enableDebug': get('enableDebug', false),
        'storeCacheOnExit': get('storeCacheOnExit', true),
        'cache': get('cache', []),
        'maxLineCharsOnPopup': get('maxLineCharsOnPopup', 40)
    };
}

/*
 * Debug function
 */
function debug(msg)
{
    if (config.enableDebug)
        this.console.log('[DEBUG] ' + msg);
}

/* Config object */
var config = loadConfig();
/* Copy cache */
var cache = config.cache;

/*
 * Do real copy work
 */
function doCopy(str, mode)
{
    if (str.match(/^(\s|\n)*$/) != null)
        return;

    var sandbox = document.getElementById('sandbox');

    debug('Copy string: ' + str + ', copy mode: ' + mode);

    if (cache.length == 2*config.cacheSize) {
        debug('Cache space is full, re-allocate it');
        cache = cache.slice(config.cacheSize, 2*config.cacheSize);
    }

    if (mode == 'override')
        cache[cache.length - 1] = str;
    else if (mode == 'normal' && cache[cache.length - 1] != str)
        cache.push(str);
    else
        debug('Skip the other modes, do not add to cache');

    sandbox.value = str;
    sandbox.select();
    document.execCommand('copy');
    sandbox.value = '';
}

/*
 * Do real past work
 */
function doPaste(str)
{   
    if (str == undefined || str.match(/^(\s|\n)*$/) != null) {
        var sandbox = document.getElementById('sandbox');

        sandbox.value = '';
        sandbox.select();
        document.execCommand('paste');
        str = sandbox.value;
        sandbox.value = '';

        debug('Paste from clipboard: ' + str);
    } else {
        doCopy(str, 'skip');
        debug('Paste from string: ' + str);
    }

    chrome.tabs.query(
        {
            'active':true,
            'windowId':chrome.windows.WINDOW_ID_CURRENT
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
 * Message passing between content script and backgroud page
 */
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.command) {
            case 'copy':
                debug('Request to copy string from content script');
                doCopy(request.data, request.mode);
                sendResponse({'clipboard': request.data});
                break;
            case 'load':
                debug('Request to load config from content script');
                config = loadConfig();
                sendResponse(config);
            default:
                break;
        }
    }
);

/*
 * Store the cache when the window close
 */
if (config.storeCacheOnExit) {
    chrome.windows.onRemoved.addListener(function(windowId) {
        debug('Store the cache when exit');
        set('cache', cache);
    });
}
