import { commafy, humanize } from '../src/utils';

test('commify', () => {
  expect(commafy(123)).toBe('123');
  expect(commafy(1234)).toBe('1,234');
  expect(commafy(-123)).toBe('-123');
  expect(commafy(-1234)).toBe('-1,234');
  expect(commafy(0)).toBe('0');
});

test('humanize', () => {
  expect(humanize(123)).toBe('123');
  expect(humanize(1000)).toBe('1.0K');
  expect(humanize(1234)).toBe('1.2K');
  expect(humanize(1255)).toBe('1.3K');
  expect(humanize(-123)).toBe('-123');
  expect(humanize(-1000)).toBe('-1.0K');
  expect(humanize(-1234)).toBe('-1.2K');
  expect(humanize(-1255)).toBe('-1.3K');
  expect(humanize(0)).toBe('0');
});
