'use strict';

const ACCESS_TOKEN_KEY = 'access_token';
const ENABLED_KEY = 'enabled';
const SHOW_KEY = 'show';

const saveOptions = () =>
    chrome.storage.sync.set({
        access_token: document.querySelector('#access-token').value,
        enabled: document.querySelector('#enabled').checked,
        show: {
            forks: document.querySelector('#show-forks').checked,
            stars: document.querySelector('#show-stars').checked,
            update: document.querySelector('#show-update').checked
        }
    });

const restoreOptions = chrome.storage.sync.get(
    [ACCESS_TOKEN_KEY, ENABLED_KEY, SHOW_KEY],
    object => {
        const accessToken = object[ACCESS_TOKEN_KEY];
        var enabled = object[ENABLED_KEY];
        const show = object[SHOW_KEY] || { stars: true };
        if (enabled === undefined) {
            enabled = true;
        }
        if (accessToken) {
            document.querySelector('#access-token').value = accessToken;
        }
        document.querySelector('#enabled').checked = enabled;
        document.querySelector('#show-forks').checked = show.forks;
        document.querySelector('#show-stars').checked = show.stars;
        document.querySelector('#show-update').checked = show.update;
    }
);

document.addEventListener('DOMContentLoaded', restoreOptions);
Array.prototype.forEach.call(document.getElementsByTagName('input'), elt =>
    addEventListener('change', saveOptions)
);
