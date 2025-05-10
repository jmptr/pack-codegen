export default {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  preset: 'ts-jest',
  roots: ['<rootDir>/src/'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        diagnostics: {
          exclude: ['**'],
        },
      },
    ],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  verbose: true,
};
