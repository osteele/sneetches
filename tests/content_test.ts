import { commify, isRepoUrl, settingsP } from '../src/content';

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
