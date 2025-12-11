/**
 * E2E Test Initialization
 *
 * Global setup for Detox E2E tests.
 */

const detox = require('detox');
const config = require('../.detoxrc');

beforeAll(async () => {
  await detox.init(config);
  await device.launchApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await detox.cleanup();
});
