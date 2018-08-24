import { createAnnotation, createErrorAnnotation } from '../src/content';

describe('createAnnotation', () => {
  const data = {
    forks_count: 10,
    pushed_at: '2018-09-10',
    stargazers_count: 10,
  };
  // const show = {forks:false, stars:false, update:false};
  test('with forks', () => {
    const elt = createAnnotation(data, {
      forks: false,
      stars: true,
      update: false,
    });
    expect(elt.outerHTML).toMatch('class="data-sneetch-extension"');
    expect(elt.innerText).toBe(' (10★)');
  });
});

describe('createErrorAnnotation', () => {
  const headers = { get: (s: string) => '' };
  test('with a 403 and no an access token', () => {
    const elt = createErrorAnnotation({ status: 403, headers }, '');
    expect(elt.outerHTML).toMatch('class="data-sneetch-extension"');
    expect(elt.outerHTML).toMatch(
      'title="Please set up your Github Personal Access Token"',
    );
    expect(elt.innerText).toBe(' (⏳)');
  });
  test.skip('with an access token', () => {
    const elt = createErrorAnnotation({ status: 403, headers }, 'access token');
    expect(elt.outerHTML).not.toMatch(
      'title="Please set up your Github Personal Access Token"',
    );
  });
  test('for a missing repo', () => {
    const elt = createErrorAnnotation({ status: 404, headers }, '');
    expect(elt.outerHTML).toMatch(/class="[^"]* missing"/);
    expect(elt.innerText).toBe(' (missingⓍ)');
  });
  test('with a unknown error', () => {
    const elt = createErrorAnnotation(
      { status: 410, headers },
      '',
      (..._: any[]) => null,
    );
    expect(elt.outerHTML).toMatch(/></);
    expect(elt.innerText).toBe('');
  });
});
