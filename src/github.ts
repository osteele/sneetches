import { locallyCached } from './cache';
import { getAccessToken } from './settings';

const CACHE_VERSION = 1;
const GITHUB_API_URL = 'https://api.github.com/repos/';

type RepoInfo = {
  readonly forks_count: number;
  readonly pushed_at: string;
  readonly stargazers_count: number;
};
type RepoResponse = {
  readonly ok: boolean;
  readonly status?: number;
  readonly json?: RepoInfo;
};

/// Transform a fetch Response into something more minimal, that can be stored
/// in a LocalStorageArea.
function marshallableResponse(res: Response): PromiseLike<RepoResponse> {
  return new Promise((resolve, reject) => {
    const { ok, status } = res;
    if (ok) {
      res.json().then(json => resolve({ ok: true, json }));
    } else if (status === 404) {
      resolve({ ok: false, status });
    } else reject({ ok: false, status });
  });
}

/// Retrieve the repo info from GitHub or from the cache. Successful responses
/// and 404's are cached. TODO: Other errors such as 403 are considered
/// transient, and are not cached.
export function getRepoData(nwo: string): Promise<RepoResponse> {
  return locallyCached(nwo, CACHE_VERSION, () =>
    getAccessToken().then(accessToken => {
      const headers = accessToken
        ? new Headers({ Authorization: 'Bearer ' + accessToken })
        : null;
      const options = headers ? { headers } : {};
      return fetch(GITHUB_API_URL + nwo, options).then(marshallableResponse);
    })
  );
}
