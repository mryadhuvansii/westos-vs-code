module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@westos/shared$': '<rootDir>/../../packages/shared/src',
    '^@westos/config$': '<rootDir>/../../packages/config/src',
  },
  testTimeout: 30000,
  transformIgnorePatterns: [
    'node_modules/(?!(supertest|@nestjs|rxjs|uuid|class-transformer|class-validator)/)',
  ],
  roots: ['<rootDir>', '<rootDir>/../..'],
  moduleDirectories: ['node_modules', '../../node_modules'],
};