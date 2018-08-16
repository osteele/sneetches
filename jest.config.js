module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/).+[_.]test)\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testURL: 'http://localhost/',
  setupFiles: ['jest-webextension-mock']
};
