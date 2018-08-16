const CACHE_DUR_SECONDS = 2 * 3600;

// function locallyCached<T>: (string,any,()=>T)=>Promise<T> = (key:string, version:any, thunk) =>
export function locallyCached<T>(
  key: string,
  version: any,
  thunk: () => T
): Promise<T> {
  return new Promise((resolve, reject) =>
    chrome.storage.local.get([key], object => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      const entry = object[key];
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
