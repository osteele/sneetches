const ACCESS_TOKEN_KEY = 'sneetches.access_token';
var accessToken = localStorage[ACCESS_TOKEN_KEY];

chrome.storage.sync.get([ACCESS_TOKEN_KEY], function(items) {
    localStorage[ACCESS_TOKEN_KEY] = accessToken = items[ACCESS_TOKEN_KEY];
});

const ghLinks = document.querySelectorAll('a[href^="https://github.com/"]');
const repoLinks = [].filter.call(ghLinks, function(elt) {
    const href = elt.attributes['href'].value;
    return (
        href &&
        href.match('^https://github.com/[^/]+/[^/]+/?$') &&
        !href.match('^https://github.com/(site|topics)') &&
        elt.childElementCount == 0
    );
});

repoLinks.forEach(function(elt) {
    const href = elt.attributes['href'].value;
    const nwo = href.match('^https://github.com/(.+)')[1];
    fetch('https://api.github.com/repos/' + nwo, {
        headers: new Headers({
            Authorization: 'Bearer ' + accessToken
        })
    })
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            var info = document.createElement('small');
            info.setAttribute('data-sneetch-extension', 'true');
            info.innerText = ' (' + data.stargazers_count + ' stars)';
            elt.appendChild(info);
        });
});
