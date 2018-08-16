import { commify } from '../src/utils';

test('commify', () => {
  expect(commify(123)).toBe('123');
  expect(commify(1234)).toBe('1,234');
});
