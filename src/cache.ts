const CACHE_DUR_SECONDS = 2 * 3600;

type Entry<T, V> = { readonly exp: number; readonly ver: V; readonly pay: T };

/// If there's local storage contains an unexpired cache entry for `key` with
/// the specified version, return a promise with its value. Else call `thunk`,
/// store its value in the cache, and return a promise with that value.
export function locallyCached<T, V>(
  key: string,
  version: V,
  thunk: () => T | PromiseLike<T>
): Promise<T> {
  return new Promise((resolve, reject) =>
    chrome.storage.local.get([key], object => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      const entry: Entry<T, V> = object[key];
      const now = Date.now();
      if (entry && entry.exp > now && entry.ver === version) {
        resolve(entry.pay);
      } else {
        Promise.resolve(thunk()).then(pay => {
          const exp = Date.now() + CACHE_DUR_SECONDS * 1000;
          const object = {
            [key]: { exp, pay, ver: version }
          };
          chrome.storage.local.set(
            object,
            () => chrome.runtime.lastError && chrome.storage.local.clear()
          );
          resolve(pay);
        });
      }
    })
  );
}
