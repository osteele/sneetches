export const ACCESS_TOKEN_KEY = 'access_token';
export const SHOW_KEY = 'show';

type Settings = { accessToken: string; show: ShowSettings };
export type ShowSettings = { forks: boolean; stars: boolean; update: boolean };

export const DefaultShowSettings: ShowSettings = {
  forks: false,
  stars: true,
  update: false
};

export function getSettings(): Promise<Settings> {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(
      [ACCESS_TOKEN_KEY, SHOW_KEY],
      object =>
        chrome.runtime.lastError
          ? reject(chrome.runtime.lastError)
          : resolve({
              accessToken: object[ACCESS_TOKEN_KEY],
              show: { ...DefaultShowSettings, ...object[SHOW_KEY] }
            })
    )
  );
}

export const getAccessToken: () => Promise<string> = () =>
  getSettings().then(object => object.accessToken);
