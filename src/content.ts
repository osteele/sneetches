import { ACCESS_TOKEN_KEY, ENABLED_KEY, SHOW_KEY } from './constants';

const ANNOTATION_CLASS = 'data-sneetch-extension';
const CACHE_DUR_SECONDS = 2 * 3600;

type ShowType = { forks: boolean; stars: boolean; update: boolean };

const accessTokenP = () => settingsP().then(object => object.accessToken);

export const settingsP: () => Promise<{
  accessToken: string;
  enabled: boolean;
  show: ShowType;
}> = () =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(
      [ACCESS_TOKEN_KEY, ENABLED_KEY, SHOW_KEY],
      object =>
        chrome.runtime.lastError
          ? reject(chrome.runtime.lastError)
          : resolve({
              accessToken: object[ACCESS_TOKEN_KEY],
              enabled: object[ENABLED_KEY] === undefined || object[ENABLED_KEY],
              show: object[SHOW_KEY] || { stars: true }
            })
    )
  );

// function locallyCached<T>: (string,any,()=>T)=>Promise<T> = (key:string, version:any, thunk) =>
function locallyCached<T>(
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

export const isRepoUrl: (_: string) => boolean = (href: string) =>
  Boolean(
    href &&
      href.match('^https?://github.com/[^/]+/[^/]+/?$') &&
      !href.match('^https?://github.com/(site|topics)')
  );

export const isRepoLink: (elt: HTMLAnchorElement) => boolean = (
  elt: HTMLAnchorElement
) => isRepoUrl(elt.href) && elt.childElementCount == 0;

const ghLinks: HTMLAnchorElement[] = Array.prototype.slice
  .call(document.querySelectorAll('a[href^="https://github.com/"]'))
  .concat(
    Array.prototype.slice.call(
      document.querySelectorAll('a[href^="http://github.com/"]')
    )
  );

const repoLinks = ghLinks.filter(isRepoLink);

// Remove sneetch annotations from the document.
const removeLinkAnnotations = () =>
  Array.prototype.forEach.call(
    document.querySelectorAll('.' + ANNOTATION_CLASS),
    (node: HTMLElement) => node.parentNode && node.parentNode.removeChild(node)
  );

function marshallableResponse(
  res: Response
): PromiseLike<{ ok: boolean; status?: number; json?: {} }> {
  return new Promise((resolve, reject) => {
    const { ok, status } = res;
    if (ok) {
      res.json().then(json => resolve({ ok: true, json }));
    } else if (status === 404) {
      resolve({ ok: false, status });
    } else reject({ ok: false, status });
  });
}

function getRepoData(nwo: string): Promise<any> {
  return locallyCached(nwo, 1, () =>
    accessTokenP().then(accessToken => {
      const headers = accessToken
        ? new Headers({
            Authorization: 'Bearer ' + accessToken
          })
        : null;
      const options = headers ? { headers } : {};
      return fetch('https://api.github.com/repos/' + nwo, options).then(
        marshallableResponse
      );
    })
  );
}

const updateLinks = () =>
  settingsP().then(({ accessToken, show }) =>
    repoLinks.forEach(function(elt) {
      const href = elt.href;
      const m = href.match('^https?://github.com/(.+?)(?:.git)?/?$');
      m &&
        getRepoData(m[1])
          .then(res => {
            if (res.ok) {
              addAnnotation(elt, res.json, show);
            } else {
              addErrorAnnotation(elt, res, accessToken);
            }
          })
          .catch(err => {
            addErrorAnnotation(elt, err, accessToken);
          });
    })
  );

function addErrorAnnotation(
  elt: HTMLElement,
  res: { status: number; headers: { get: (_: string) => string } },
  accessToken: string
) {
  if (res.status == 403) {
    const an = createAnnotation(elt, ' (⏳)');
    const when = new Date(Number(res.headers.get('X-RateLimit-Reset')) * 1000);
    const title = accessToken
      ? 'The GitHub API rate limit has been exceeded.' +
        `No API calls are available until {when}.`
      : 'Please set up your Github Personal Access Token';
    an.setAttribute('title', title);
  } else if (res.status == 404) {
    createAnnotation(elt, ' (missing⚰️)', 'missing');
  } else {
    console.error('sneetches: request status =', res.status);
  }
}

function addAnnotation(
  elt: HTMLElement,
  data: { forks_count: number; stargazers_count: number; pushed_at: string },
  show: ShowType
) {
  const text = [];
  if (show.forks) {
    text.push(commify(data.forks_count) + '🍴');
  }
  if (show.update) {
    const when = new Date(data.pushed_at);
    var whenStr = when.toLocaleDateString();
    if (when.getFullYear() === new Date().getFullYear()) {
      whenStr = whenStr.replace(RegExp('/' + when.getFullYear() + '$'), '');
    }
    text.push('➡' + whenStr);
  }
  if (show.stars) {
    text.push(commify(data.stargazers_count) + '⭐');
  }
  createAnnotation(elt, ' (' + text.join('; ') + ')');
}

export function commify(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function createAnnotation(
  elt: HTMLElement,
  str: string,
  extraCssClasses: string | null = null
) {
  var cssClass = ANNOTATION_CLASS;
  if (extraCssClasses) {
    cssClass += ' ' + extraCssClasses;
  }
  const info = document.createElement('small');
  info.setAttribute('class', cssClass);
  info.setAttribute(ANNOTATION_CLASS, 'true');
  info.innerText = str;
  elt.appendChild(info);
  return info;
}

function updateAnnotationsFromSettings() {
  settingsP().then(({ enabled }) => {
    if (enabled || enabled === undefined) {
      updateLinks();
    }
  });
}

updateAnnotationsFromSettings();

chrome.storage.onChanged.addListener((object, namespace) => {
  if (namespace == 'sync') {
    const accessTokenChange = object[ACCESS_TOKEN_KEY];
    if (
      accessTokenChange &&
      accessTokenChange.oldValue !== accessTokenChange.newValue
    ) {
      chrome.storage.local.clear();
    }
    removeLinkAnnotations();
    updateAnnotationsFromSettings();
  }
});
