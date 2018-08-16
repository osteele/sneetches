import { getRepoData } from '../src/github';

describe('getRepoData', () => {
  beforeEach(() => {
    chrome.storage.local.clear();
  });
  test('returns repo info', async () => {
    const data = { forks_count: 1, pushed_at: 2, stargazers_count: 3 };
    mockFetch({ json: data });
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: true, json: data });
  });
  test('returns 404', async () => {
    mockFetch({ ok: false, status: 404 });
    const info = await getRepoData('owner/repo');
    expect(info).toEqual({ ok: false, status: 404 });
  });
  test.skip('throws 403', async () => {
    mockFetch({ ok: false, status: 403 });
    expect(async () => await getRepoData('owner/repo')).toThrowError();
  });
});

declare var global: any;

function mockFetch({
  ok = true,
  status = 200,
  json = null
}: {
  ok?: boolean;
  json?: any;
  status?: number;
}) {
  global.fetch = jest.fn(async () => ({
    ok,
    status,
    json: async () => json
  }));
}
