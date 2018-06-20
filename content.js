'use strict';

const ACCESS_TOKEN_KEY = 'access_token';
const ENABLED_KEY = 'enabled';

const accessTokenP = new Promise((resolve, reject) =>
    chrome.storage.sync.get([ACCESS_TOKEN_KEY], items => {
        resolve(items[ACCESS_TOKEN_KEY]);
    })
);
const settingsP = () =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get([ACCESS_TOKEN_KEY, ENABLED_KEY], resolve)
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

function removeLinkAnnotations() {
    Array.prototype.forEach.call(
        document.querySelectorAll('.data-sneetch-extension'),
        node => node.parentNode.removeChild(node)
    );
}

function updateLinks(accessToken) {
    const options = {};
    if (accessToken) {
        options['headers'] = new Headers({
            Authorization: 'Bearer ' + accessToken
        });
    }
    repoLinks.forEach(function(elt) {
        const href = elt.attributes['href'].value;
        const nwo = href.match('^https?://github.com/(.+?)/?$')[1];
        fetch('https://api.github.com/repos/' + nwo, options)
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    if (res.status == 404) {
                        annotate(elt, ' (missing⚰️)', 'missing');
                    }
                }
            })
            .then(data => {
                if (data) {
                    annotate(elt, ' (' + data.stargazers_count + '⭐)');
                }
            });
    });
}

function annotate(elt, str, extraCssClasses) {
    var cssClass = 'data-sneetch-extension';
    if (extraCssClasses) {
        cssClass += ' ' + extraCssClasses;
    }
    const info = document.createElement('small');
    info.setAttribute('class', cssClass);
    info.setAttribute('data-sneetch-extension', 'true');
    info.innerText = str;
    elt.appendChild(info);
}

function updateAnnotationsFromSettings() {
    settingsP().then(({ access_token: accessToken, enabled }) => {
        if (enabled === undefined) {
            enabled = true;
        }
        if (enabled) {
            updateLinks(accessToken);
        }
    });
}

// accessTokenP.then(updateLinks);
updateAnnotationsFromSettings();

chrome.storage.onChanged.addListener(() => {
    removeLinkAnnotations();
    updateAnnotationsFromSettings();
});
