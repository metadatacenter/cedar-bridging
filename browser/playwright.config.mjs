import { defineConfig } from '@playwright/test';
const port = Number(process.env.PORT || 4798);
// The suite is hermetic. It serves the built application, signs in against a stand-in Keycloak and
// answers the bridge and the terminology server from fixtures.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: { command: 'node serve.mjs', url: `http://127.0.0.1:${port}`, reuseExistingServer: false },
});
