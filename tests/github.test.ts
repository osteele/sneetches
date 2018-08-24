import { getRepoData, isRepoUrl } from '../src/github';
import { mockFetch } from './fetch.mock';

describe('getRepoData', () => {
  const repoInfo = { forks_count: 1, pushed_at: 2, stargazers_count: 3 };
  const repoInfo2 = { forks_count: 11, pushed_at: 12, stargazers_count: 13 };

  beforeEach(() => {
    chrome.storage.local.clear();
  });

  test('resolves repo info', async () => {
    const data = { forks_count: 1, pushed_at: 2, stargazers_count: 3 };
    mockFetch({ json: data });
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: true, json: data });
  });
  test('caches repo info', async () => {
    mockFetch({ json: repoInfo });
    await getRepoData('owner/repo');
    mockFetch({ json: repoInfo2 });
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: true, json: repoInfo });
  });
  test('distinguishes repos', async () => {
    mockFetch({ json: repoInfo });
    const info1 = await getRepoData('owner/repo');
    mockFetch({ json: repoInfo2 });
    const info2 = await getRepoData('owner/repo2');
    expect(info1).toEqual({ ok: true, json: repoInfo });
    expect(info2).toEqual({ ok: true, json: repoInfo2 });
  });
  test("rejects 403's", async () => {
    mockFetch({ ok: false, status: 403 });
    await expect(getRepoData('owner/repo')).rejects.toEqual({
      ok: false,
      status: 403,
    });
  });
  test("resolves 404's", async () => {
    mockFetch({ ok: false, status: 404 });
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: false, status: 404 });
  });
  test("doesn't cache 403's", async () => {
    mockFetch({ ok: false, status: 403 });
    await expect(getRepoData('owner/repo')).rejects;
    mockFetch({ json: repoInfo });
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: true, json: repoInfo });
  });
  test("caches 404's", async () => {
    mockFetch({ ok: false, status: 404 });
    await getRepoData('owner/repo');
    mockFetch({ ok: false, status: 403 });
    await getRepoData('owner/repo');
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: false, status: 404 });
  });
});

describe('isRepoUrl', () => {
  test('accepts GitHub repo urls', () => {
    expect(isRepoUrl('http://github.com/owner/name')).toBe(true);
    expect(isRepoUrl('https://github.com/owner/name')).toBe(true);
    expect(isRepoUrl('https://github.com/owner/name/')).toBe(true);
    expect(isRepoUrl('https://github.com/owner/name.git')).toBe(true);
    expect(isRepoUrl('https://github.com/owner/name.git/')).toBe(true);
  });
  test('rejects non-GitHub urls', () => {
    expect(isRepoUrl('https://example.com/owner/name')).toBe(false);
  });
  test("rejects URLs that aren't on the main site", () => {
    expect(isRepoUrl('https://diversity.github.com/')).toBe(false);
    expect(isRepoUrl('https://gist.github.com/')).toBe(false);
    expect(
      isRepoUrl(' https://help.github.com/articles/github-terms-of-service/'),
    ).toBe(false);
    expect(isRepoUrl('https://developer.github.com/v4/guides/')).toBe(false);
  });
  test('rejects URLs without a name and repo', () => {
    expect(isRepoUrl('https://github.com/')).toBe(false);
    expect(isRepoUrl('https://github.com/owner')).toBe(false);
    expect(isRepoUrl('https://github.com/owner/')).toBe(false);
  });
  test('rejects GitHub special pages', () => {
    expect(isRepoUrl('https://github.com/contact/report-abuse')).toBe(false);
    expect(isRepoUrl('https://github.com/marketplace/travis-ci')).toBe(false);
    expect(isRepoUrl('https://github.com/notifications/participating')).toBe(
      false,
    );
    expect(isRepoUrl('https://github.com/organizations/new')).toBe(false);
    expect(isRepoUrl('https://github.com/pricing/team')).toBe(false);
    expect(isRepoUrl('https://github.com/settings/profile')).toBe(false);
    expect(isRepoUrl('https://github.com/site/something')).toBe(false);
    expect(isRepoUrl('https://github.com/topics/something')).toBe(false);
  });
});
