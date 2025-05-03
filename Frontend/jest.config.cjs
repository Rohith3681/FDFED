module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg|mp4)$': '<rootDir>/__mocks__/fileMock.js'
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
};