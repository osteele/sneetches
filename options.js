'use strict';

const ACCESS_TOKEN_KEY = 'access_token';
const ENABLED_KEY = 'enabled';

function saveOptions(e) {
    e.preventDefault();
    const accessToken = document.querySelector('#access-token').value;
    const enabled = document.querySelector('#enabled').checked;
    chrome.storage.sync.set({ access_token: accessToken, enabled });
}

function restoreOptions() {
    chrome.storage.sync.get([ACCESS_TOKEN_KEY, ENABLED_KEY], object => {
        const accessToken = object[ACCESS_TOKEN_KEY];
        if (accessToken) {
            document.querySelector('#access-token').value = accessToken;
        }
        var enabled = object[ENABLED_KEY];
        if (enabled === undefined) {
            enabled = true;
        }
        document.querySelector('#enabled').checked = enabled;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document
    .querySelector('form')
    .addEventListener('submit', () => console.info('submit'));
