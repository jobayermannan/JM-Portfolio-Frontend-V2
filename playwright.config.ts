import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --port 3100 --host 127.0.0.1',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
  },
});
