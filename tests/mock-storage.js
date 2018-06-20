const localStoragePrefix = 'sneetches.';

const listeners = [];

chrome.storage = {
    sync: {
        get: (keys, callback) => {
            var object = {};
            keys.forEach(key => {
                const enc = localStorage[localStoragePrefix + key];
                if (enc) {
                    object[key] = JSON.parse(enc);
                }
            });
            setTimeout(() => callback(object), 10);
        },
        set: (object, callback) => {
            var changes = {};
            Object.entries(object).forEach(([key, newValue]) => {
                const oldValue = localStorage[localStoragePrefix + key];
                localStorage[localStoragePrefix + key] = JSON.stringify(
                    newValue
                );
                changes[key] = { oldValue, newValue };
            });
            setTimeout(callback, 10);
            setTimeout(
                () =>
                    listeners.forEach(listener => {
                        listener(changes, 'sync');
                    }),
                20
            );
        }
    },
    onChanged: {
        addListener: listener => listeners.push(listener)
    }
};
