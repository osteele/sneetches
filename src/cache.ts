const CACHE_DUR_SECONDS = 2 * 3600;

interface Entry<T, V> {
  readonly exp: number;
  readonly pay: T;
  readonly ver: V;
}

/// If there's local storage contains an unexpired cache entry for `key` with
/// the specified version, return a promise with its value. Else call `thunk`,
/// store its value in the cache, and return a promise with that value.
///
/// If there's an error storing the value, it clears the local storage area.
/// This is okay in the context of this extension, since persistent settings are
/// in the sync storage area.
export function locallyCached<T, V>(
  key: string,
  version: V,
  thunk: () => T | PromiseLike<T>,
): Promise<T> {
  return new Promise((resolve, reject) =>
    chrome.storage.local.get([key], (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      const entry: Entry<T, V> = items[key];
      const now = Date.now();
      if (entry && entry.exp > now && entry.ver === version) {
        resolve(entry.pay);
      } else {
        Promise.resolve(thunk()).then((pay) => {
          const exp = Date.now() + CACHE_DUR_SECONDS * 1000;
          chrome.storage.local.set(
            {
              [key]: { exp, pay, ver: version },
            },
            () => chrome.runtime.lastError && chrome.storage.local.clear(),
          );
          resolve(pay);
        }, reject);
      }
    }),
  );
}
