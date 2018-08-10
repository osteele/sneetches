import {
  commify,
  createAnnotation,
  createErrorAnnotation,
  isRepoUrl,
  settingsP
} from '../src/content';

describe('settingsP', () => {
  test('uses default', async () => {
    const settings = await settingsP();
    expect(settings).toEqual({
      enabled: true,
      accessToken: undefined,
      show: { stars: true }
    });
  });

  test('honors storage settings', async () => {
    await chrome.storage.sync.set({
      enabled: false,
      access_token: '<<token value>>',
      show: { stars: false, forks: true }
    });
    const settings = await settingsP();
    expect(settings).toEqual({
      enabled: false,
      accessToken: '<<token value>>',
      show: { stars: false, forks: true }
    });
  });
});

describe('isRepoUrl', () => {
  test('recognizes GitHub repo urls', () => {
    expect(isRepoUrl('https://github.com/owner/name')).toBe(true);
    expect(isRepoUrl('http://github.com/owner/name')).toBe(true);
    expect(isRepoUrl('http://github.com/owner/name/')).toBe(true);
  });
  test('rejects non-GitHub urls', () => {
    expect(isRepoUrl('http://example.com/owner/name')).toBe(false);
  });
  test('rejects GitHub non-repo urls', () => {
    expect(isRepoUrl('https://github.com/site/something')).toBe(false);
    expect(isRepoUrl('https://github.com/topics/something')).toBe(false);
  });
});

test('commify', () => {
  expect(commify(123)).toBe('123');
  expect(commify(1234)).toBe('1,234');
});

describe('createAnnotation', () => {
  const data = {
    forks_count: 10,
    stargazers_count: 10,
    pushed_at: '2018-09-10'
  };
  // const show = {forks:false, stars:false, update:false};
  test('with forks', () => {
    const elt = createAnnotation(data, {
      forks: false,
      stars: true,
      update: false
    });
    expect(elt.outerHTML).toMatch('class="data-sneetch-extension"');
    expect(elt.innerText).toBe(' (10⭐)');
  });
});

describe('createErrorAnnotation', () => {
  const headers = { get: (s: string) => '' };
  test('with a 403 and no an access token', () => {
    const elt = createErrorAnnotation({ status: 403, headers }, '');
    expect(elt.outerHTML).toMatch('class="data-sneetch-extension"');
    expect(elt.outerHTML).toMatch(
      'title="Please set up your Github Personal Access Token"'
    );
    expect(elt.innerText).toBe(' (⏳)');
  });
  test.skip('with an access token', () => {
    const elt = createErrorAnnotation({ status: 403, headers }, 'access token');
    expect(elt.outerHTML).not.toMatch(
      'title="Please set up your Github Personal Access Token"'
    );
  });
  test('for a missing repo', () => {
    const elt = createErrorAnnotation({ status: 404, headers }, '');
    expect(elt.outerHTML).toMatch(/class="[^"]* missing"/);
    expect(elt.innerText).toBe(' (missing⚰️)');
  });
  test('with a unknown error', () => {
    const elt = createErrorAnnotation(
      { status: 410, headers },
      '',
      (..._: any[]) => null
    );
    expect(elt.outerHTML).toMatch(/></);
    expect(elt.innerText).toBe('');
  });
});
