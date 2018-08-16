import { locallyCached } from '../src/cache';

describe('locallyCached', () => {
  let thunk: jest.Mock<string>;
  let r1: Promise<string>;
  beforeEach(async () => {
    chrome.storage.local.clear();
    thunk = jest.fn(() => 'x');
    r1 = await locallyCached('k', 1, thunk);
  });

  test('calls the thunk once', async () => {
    expect(r1).toBe('x');
    expect(thunk.mock.calls.length).toBe(1);
  });

  test('uses the cached value', async () => {
    const r2 = await locallyCached('k', 1, thunk);
    expect(thunk.mock.calls.length).toBe(1);
    expect(r2).toBe('x');
  });

  test('calls the thunk when the key has changed', async () => {
    const thunk2 = jest.fn(() => 'y');

    const r2 = await locallyCached('k2', 1, thunk2);
    expect(thunk2.mock.calls.length).toBe(1);
    expect(r2).toBe('y');
  });

  test('calls the thunk when the version has changed', async () => {
    const thunk2 = jest.fn(() => 'y');
    const r2 = await locallyCached('k', 2, thunk2);
    expect(thunk2.mock.calls.length).toBe(1);
    expect(r2).toBe('y');
  });

  test.skip('calls the thunk when the cache has expired', async () => {
    const thunk2 = jest.fn(() => 'y');
    const r2 = await locallyCached('k', 1, thunk);
    expect(thunk2.mock.calls.length).toBe(1);
    expect(r2).toBe('y');
  });
});
