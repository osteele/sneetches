/* Emulate Google extensions storage, for testing web extensions.
*/

'use strict';

const storageListeners = [];

function StorageArea(areaName) {
    const localStoragePrefix = `sneetches:${areaName}:`;
    return {
        clear: () => {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(localStoragePrefix)) {
                    localStorage.removeItem(key);
                }
            });
        },
        get: (keys, callback) => {
            const object = {};
            keys.forEach(key => {
                const localStorageKey = localStoragePrefix + key;
                const json = localStorage[localStorageKey];
                if (json) {
                    object[key] = JSON.parse(json);
                }
            });
            callback(object);
            setTimeout(() => {
                chrome.runtime.lastError = null;
                callback(object);
            }, 10);
        },
        set: (object, callback) => {
            var changes = {};
            Object.entries(object).forEach(([key, newValue]) => {
                const localStorageKey = localStoragePrefix + key;
                const oldValue = localStorage[localStorageKey];
                localStorage[localStorageKey] = JSON.stringify(newValue);
                changes[key] = { oldValue, newValue };
            });
            callback();
            setTimeout(() => {
                chrome.runtime.lastError = null;
                callback();
            }, 10);
            setTimeout(
                () =>
                    storageListeners.forEach(listener => {
                        // chrome.runtime.lastError = null;
                        listener(changes, areaName);
                    }),
                20
            );
        }
    };
}

if (!chrome.runtime) {
    chrome.runtime = { lastError: null };
}
if (!chrome.storage) {
    chrome.storage = {
        local: StorageArea('local'),
        sync: StorageArea('sync'),
        onChanged: {
            addListener: listener => storageListeners.push(listener)
        }
    };
}
