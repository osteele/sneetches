import { commify, settingsP } from '../src/content';

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

describe('repoLinks', () => {
  test.skip('returns GitHub repo links', () => {});
});

test('commify', () => {
  expect(commify(123)).toBe('123');
  expect(commify(1234)).toBe('1,234');
});
