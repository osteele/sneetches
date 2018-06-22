'use strict';

const ACCESS_TOKEN_KEY = 'access_token';
const ENABLED_KEY = 'enabled';

function saveOptions(e) {
    e.preventDefault();
    chrome.storage.sync.set({
        access_token: document.querySelector('#access-token').value,
        enabled: document.querySelector('#enabled').checked,
        show: {
            update: document.querySelector('#show-update').checked,
            stars: document.querySelector('#show-stars').checked
        }
    });
}

function restoreOptions() {
    chrome.storage.sync.get([ACCESS_TOKEN_KEY, ENABLED_KEY], object => {
        const accessToken = object[ACCESS_TOKEN_KEY];
        var { enabled, show } = object[ENABLED_KEY];
        if (enabled === undefined) {
            enabled = true;
        }
        show = show || { stars: true };
        if (accessToken) {
            document.querySelector('#access-token').value = accessToken;
        }
        document.querySelector('#enabled').checked = enabled;
        document.querySelector('#show-stars').checked = show.stars;
        document.querySelector('#show-update').checked = show.update;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document
    .querySelector('form')
    .addEventListener('submit', () => console.info('submit'));
