import { getRepoData } from '../src/github';

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

declare var global: any;

function mockFetch({
  json = null,
  ok = true,
  status = 200,
}: {
  ok?: boolean;
  json?: any;
  status?: number;
}) {
  global.fetch = jest.fn(async () => ({
    json: async () => json,
    ok,
    status,
  }));
}
