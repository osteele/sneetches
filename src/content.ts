import { getRepoData } from './github';
import { ACCESS_TOKEN_KEY, getSettings, ShowSettings } from './settings';
import { humanize } from './utils';

const ANNOTATION_CLASS = 'data-sneetch-extension';

const ColoredSymbols = {
  forks: '➡',
  missing: 'missing⚰️',
  pushedAt: '🗓',
  stars: '⭐',
};

const Symbols = {
  forks: '⑃',
  missing: 'missingⓍ',
  pushedAt: '➲', // Alternatives: ⧗➟➠
  stars: '★',
};

export const isRepoUrl: (_: string) => boolean = (href: string) =>
  Boolean(
    href &&
      href.match('^https?://github.com/[^/]+/[^/]+/?$') &&
      !href.match('^https?://github.com/(site|topics)'),
  );

export const isRepoLink: (elt: HTMLAnchorElement) => boolean = (
  elt: HTMLAnchorElement,
) => isRepoUrl(elt.href) && elt.childElementCount === 0;

const repoLinks = ([
  ...document.querySelectorAll('a[href^="https://github.com/"]'),
  ...document.querySelectorAll('a[href^="http://github.com/"]'),
] as HTMLAnchorElement[]).filter(isRepoLink);

// Remove sneetch annotations from the document.
const removeLinkAnnotations = () =>
  Array.prototype.forEach.call(
    document.querySelectorAll('.' + ANNOTATION_CLASS),
    (node: HTMLElement) => node.parentNode && node.parentNode.removeChild(node),
  );

async function updateLinks() {
  const { accessToken, show } = await getSettings();
  repoLinks.forEach((elt) => {
    const href = elt.href;
    const m = href.match('^https?://github.com/(.+?)(?:.git)?/?$');
    if (m) {
      getRepoData(m[1])
        .then((res) => {
          if (res.ok) {
            elt.appendChild(createAnnotation(res.json!, show));
          } else {
            elt.appendChild(createErrorAnnotation(res, accessToken));
          }
        })
        .catch((err) => {
          elt.appendChild(createErrorAnnotation(err, accessToken));
        });
    }
  });
}

export function createErrorAnnotation(
  res: { status?: number; headers?: { get: (_: string) => string } },
  accessToken: string,
  reportError: (_: string, ..._2: any[]) => void = console.error,
) {
  if (res.status === 403) {
    const an = _createAnnotation(' (⏳)');
    const when = new Date(Number(res.headers!.get('X-RateLimit-Reset')) * 1000);
    const title = accessToken
      ? 'The GitHub API rate limit has been exceeded.' +
        `No API calls are available until ${when}.`
      : 'Please set up your Github Personal Access Token';
    an.setAttribute('title', title);
    return an;
  } else if (res.status === 404) {
    return _createAnnotation(' (' + Symbols.missing + ')', 'missing');
  } else {
    reportError('sneetches: request status =', res.status);
    return _createAnnotation('');
  }
}

export function createAnnotation(
  data: { forks_count: number; stargazers_count: number; pushed_at: string },
  show: ShowSettings,
) {
  const text = [];
  if (show.forks) {
    text.push(humanize(data.forks_count) + Symbols.forks);
  }
  if (show.update) {
    const when = new Date(data.pushed_at);
    let whenStr = when.toLocaleDateString();
    if (when.getFullYear() === new Date().getFullYear()) {
      whenStr = whenStr.replace(RegExp('/' + when.getFullYear() + '$'), '');
    }
    text.push(Symbols.pushedAt + whenStr);
  }
  if (show.stars) {
    text.push(humanize(data.stargazers_count) + Symbols.stars);
  }
  return _createAnnotation(' (' + text.join('; ') + ')');
}

function _createAnnotation(str: string, extraCssClasses: string | null = null) {
  let cssClass = ANNOTATION_CLASS;
  if (extraCssClasses) {
    cssClass += ' ' + extraCssClasses;
  }
  const elt = document.createElement('small');
  elt.setAttribute('class', cssClass);
  elt.innerText = str;
  return elt;
}

async function updateAnnotationsFromSettings() {
  const { show } = await getSettings();
  if (Object.values(show).some(Boolean)) {
    updateLinks();
  }
}

updateAnnotationsFromSettings();

chrome.storage.onChanged.addListener((object, namespace) => {
  if (namespace === 'sync') {
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
