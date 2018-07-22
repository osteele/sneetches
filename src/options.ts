import { ACCESS_TOKEN_KEY, ENABLED_KEY, SHOW_KEY } from './constants';

function inputElement(id: string): HTMLInputElement {
    return document.querySelector('#' + id) as HTMLInputElement;
}

function saveOptions() {
    chrome.storage.sync.set({
        access_token: inputElement('access-token').value,
        enabled: inputElement('enabled').checked,
        show: {
            forks: inputElement('show-forks').checked,
            stars: inputElement('show-stars').checked,
            update: inputElement('show-update').checked
        }
    });
}

function restoreOptions() {
    chrome.storage.sync.get(
        [ACCESS_TOKEN_KEY, ENABLED_KEY, SHOW_KEY],
        object => {
            const accessToken = object[ACCESS_TOKEN_KEY];
            var enabled = object[ENABLED_KEY];
            const show = object[SHOW_KEY] || { stars: true };
            if (enabled === undefined) {
                enabled = true;
            }
            if (accessToken) {
                inputElement('access-token').value = accessToken;
            }
            inputElement('enabled').checked = enabled;
            inputElement('show-forks').checked = show.forks;
            inputElement('show-stars').checked = show.stars;
            inputElement('show-update').checked = show.update;
        }
    );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
Array.prototype.forEach.call(
    document.getElementsByTagName('input'),
    (elt: HTMLElement) => addEventListener('change', saveOptions)
);
