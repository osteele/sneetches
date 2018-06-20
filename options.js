'use strict';

const ACCESS_TOKEN_KEY = 'sneetches.access_token';

function saveOptions(e) {
    e.preventDefault();
    const accessToken = document.querySelector('#access-token').value;
    chrome.storage.sync.set({ 'sneetches.access_token': accessToken });
}

function restoreOptions() {
    const accessToken = localStorage[ACCESS_TOKEN_KEY];
    chrome.storage.sync.get([ACCESS_TOKEN_KEY], function(items) {
        const accessToken = items[ACCESS_TOKEN_KEY];
        if (accessToken) {
            document.querySelector('#access-token').value = accessToken;
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
