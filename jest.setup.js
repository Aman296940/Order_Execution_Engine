import {
  jest,
  describe,
  test,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from '@jest/globals';

// Make jest globals available globally for ESM
global.jest = jest;
global.describe = describe;
global.test = test;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;

