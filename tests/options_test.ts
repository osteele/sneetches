import { addInputEventListeners, inputElement } from '../src/options';

// FIXME: this is a workaround for a deficiency(?) in @typing's
// chrome.storage.sync.get
function syncStorageGet(
  keys: string | string[] | Object | null
): Promise<{ [key: string]: any }> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, obj => resolve(obj));
  });
}

describe('restoreOptions', () => {
  document.body.innerHTML = `<div>
    <input id='show-stars' type="checkbox" checked>
    <input id='show-forks' type="checkbox">
    <input id='show-update' type="checkbox">
    <input id='access-token' type="text">
  </div>`;
  addInputEventListeners();

  test.skip('called on change', async () => {
    {
      // var object = await chrome.storage.sync.get(['enabled']);
      const object = await syncStorageGet(['enabled']);
      expect(object.enabled).toBeFalsy();
    }

    inputElement('enabled').dispatchEvent(new Event('change'));
    {
      const object = await syncStorageGet(['enabled']);
      expect(object.enabled).toBeTruthy();
    }
  });
});

describe('restoreOptions', () => {
  document.body.innerHTML = `<div>
    <input id='show-stars' type="checkbox">
    <input id='show-forks' type="checkbox">
    <input id='show-update' type="checkbox">
    <input id='access-token' type="text">
  </div>`;

  test('initial', () => {
    document.dispatchEvent(
      new Event('DOMContentLoaded', { bubbles: true, cancelable: true })
    );
    expect(inputElement('access-token').value).toBe('');
    expect(inputElement('show-forks').checked).toBe(false);
    expect(inputElement('show-stars').checked).toBe(true);
    expect(inputElement('show-update').checked).toBe(false);
  });

  test('from storage', () => {
    chrome.storage.sync.set({
      access_token: '<<access token>>',
      show: { forks: true, stars: false, update: true }
    });
    document.dispatchEvent(
      new Event('DOMContentLoaded', { bubbles: true, cancelable: true })
    );
    expect(inputElement('access-token').value).toBe('<<access token>>');
    expect(inputElement('show-forks').checked).toBe(true);
    expect(inputElement('show-stars').checked).toBe(false);
    expect(inputElement('show-update').checked).toBe(true);
  });
});
