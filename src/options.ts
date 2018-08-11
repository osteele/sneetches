import { ACCESS_TOKEN_KEY, SHOW_KEY } from './constants';

export function inputElement(id: string): HTMLInputElement {
  return document.querySelector('#' + id) as HTMLInputElement;
}

function saveOptions() {
  chrome.storage.sync.set({
    access_token: inputElement('access-token').value,
    show: {
      forks: inputElement('show-forks').checked,
      stars: inputElement('show-stars').checked,
      update: inputElement('show-update').checked
    }
  });
}

function restoreOptions() {
  chrome.storage.sync.get([ACCESS_TOKEN_KEY, SHOW_KEY], object => {
    const accessToken = object[ACCESS_TOKEN_KEY];
    const show = object[SHOW_KEY] || { stars: true };
    if (accessToken) {
      inputElement('access-token').value = accessToken;
    }
    inputElement('show-forks').checked = show.forks;
    inputElement('show-stars').checked = show.stars;
    inputElement('show-update').checked = show.update;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);

export function addInputEventListeners() {
  Array.prototype.forEach.call(
    document.getElementsByTagName('input'),
    (elt: HTMLElement) => addEventListener('change', saveOptions)
  );
}

addInputEventListeners();
