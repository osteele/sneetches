import { locallyCached } from './cache';
import { getAccessToken } from './settings';

const CACHE_VERSION = 1;
const GITHUB_API_URL = 'https://api.github.com/repos/';

interface RepoInfo {
  readonly forks_count: number;
  readonly pushed_at: string;
  readonly stargazers_count: number;
}

interface RepoResponse {
  readonly ok: boolean;
  readonly status?: number;
  readonly json?: RepoInfo;
}

/// Transform a fetch Response into something more minimal, that can be stored
/// in a LocalStorageArea.
function marshallableResponse(res: Response): PromiseLike<RepoResponse> {
  return new Promise((resolve, reject) => {
    const { ok, status } = res;
    if (ok) {
      res.json().then((json) => resolve({ ok: true, json }));
    } else if (status === 404) {
      resolve({ ok: false, status });
    } else {
      reject({ ok: false, status });
    }
  });
}

/// Retrieve the repo info from GitHub or from the cache. Successful responses
/// and 404's are cached. Other errors such as 403 are considered transient, and
/// are not cached.
export function getRepoData(nwo: string): Promise<RepoResponse> {
  return locallyCached(nwo, CACHE_VERSION, () =>
    getAccessToken().then((accessToken) => {
      const headers = accessToken
        ? new Headers({ Authorization: 'Bearer ' + accessToken })
        : null;
      const options = headers ? { headers } : {};
      return fetch(GITHUB_API_URL + nwo, options).then(marshallableResponse);
    }),
  );
}

// Paths that start with one of these components aren't repo URLs.
// For example, `https://github.com/about/careers` isn't a repo.
const gitHubSpecialPages = new Set([
  'about',
  'blog',
  'collections',
  'contact',
  'marketplace',
  'new',
  'login',
  'logout',
  'join',
  'notifications',
  'organizations',
  'pricing',
  'settings',
  'site',
  'trending',
  'topics',
]);

export function isRepoUrl(href: string): boolean {
  const match = href && href.match('^https?://github.com/([^/]+)/[^/]+/?$');
  return Boolean(match && !gitHubSpecialPages.has(match[1]));
}
