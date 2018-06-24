'use strict';

const ACCESS_TOKEN_KEY = 'access_token';
const ENABLED_KEY = 'enabled';
const SHOW_KEY = 'show';

const CACHE_DUR_SECONDS = 2 * 3600;

const accessTokenP = () => settingsP().then(object => object.accessToken);

const settingsP = () =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(
            [ACCESS_TOKEN_KEY, ENABLED_KEY, SHOW_KEY],
            object =>
                chrome.runtime.lastError
                    ? reject(chrome.runtime.lastError)
                    : resolve({
                          accessToken: object[ACCESS_TOKEN_KEY],
                          enabled:
                              object[ENABLED_KEY] === undefined ||
                              object[ENABLED_KEY],
                          show: object[SHOW_KEY] || { stars: true }
                      })
        )
    );

const locallyCached = (key, version, thunk) =>
    new Promise((resolve, reject) =>
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
                    const object = {};
                    const exp = Date.now() + CACHE_DUR_SECONDS * 1000;
                    object[key] = { exp, pay, ver: version };
                    chrome.storage.local.set(
                        object,
                        () =>
                            chrome.runtime.lastError &&
                            chrome.storage.local.clear()
                    );
                    resolve(pay);
                });
            }
        })
    );

const ghLinks = Array.prototype.slice
    .call(document.querySelectorAll('a[href^="https://github.com/"]'))
    .concat(
        Array.prototype.slice.call(
            document.querySelectorAll('a[href^="http://github.com/"]')
        )
    );

const repoLinks = ghLinks.filter(elt => {
    const href = elt.attributes['href'].value;
    return (
        href &&
        href.match('^https?://github.com/[^/]+/[^/]+/?$') &&
        !href.match('^https?://github.com/(site|topics)') &&
        elt.childElementCount == 0
    );
});

const removeLinkAnnotations = () =>
    Array.prototype.forEach.call(
        document.querySelectorAll('.data-sneetch-extension'),
        node => node.parentNode.removeChild(node)
    );

const marshallableResponse = res => {
    const status = res.status;
    if (res.ok) return res.json().then(json => ({ ok: true, json, status }));
    if (res.status == 404) {
        return { ok: false, status };
    }
    return Promise.error(res);
};

const getRepoData = nwo =>
    locallyCached(nwo, 1, () =>
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

const updateLinks = () =>
    settingsP().then(({ accessToken, show }) =>
        repoLinks.forEach(function(elt) {
            const href = elt.attributes['href'].value;
            const nwo = href.match('^https?://github.com/(.+?)(?:.git)?/?$')[1];
            getRepoData(nwo)
                .catch(err => {
                    addErrorAnnotation(elt, res, accessToken);
                })
                .then(res => {
                    if (res.ok) {
                        addAnnotation(elt, res.json, show);
                    } else {
                        addErrorAnnotation(elt, res);
                    }
                });
        })
    );

function addErrorAnnotation(elt, res, accessToken) {
    if (res.status == 403) {
        const an = createAnnotation(elt, ' (⏳)');
        const when = new Date(
            Number(res.headers.get('X-RateLimit-Reset')) * 1000
        );
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

function addAnnotation(elt, data, show) {
    const text = [];
    if (show.update) {
        const when = new Date(data.pushed_at);
        var whenStr = when.toLocaleDateString();
        if (when.getFullYear() === new Date().getFullYear()) {
            whenStr = whenStr.replace(
                RegExp('/' + when.getFullYear() + '$'),
                ''
            );
        }
        text.push('➡' + whenStr);
    }
    if (show.stars) {
        text.push(commify(data.stargazers_count) + '⭐)');
    }
    createAnnotation(elt, ' (' + text.join('; '));
}

const commify = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function createAnnotation(elt, str, extraCssClasses) {
    var cssClass = 'data-sneetch-extension';
    if (extraCssClasses) {
        cssClass += ' ' + extraCssClasses;
    }
    const info = document.createElement('small');
    info.setAttribute('class', cssClass);
    info.setAttribute('data-sneetch-extension', 'true');
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
        if (accessTokenChange.oldValue !== accessTokenChange.newValue) {
            chrome.storage.local.clear();
        }
        removeLinkAnnotations();
        updateAnnotationsFromSettings();
    }
});
