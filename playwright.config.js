import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.js', fullyParallel: true,
  timeout: 20000, retries: 0, workers: 3,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:43917', headless: true, viewport: { width: 1366, height: 1000 },
    launchOptions: process.env.VIN_CHROMIUM_PATH ? { executablePath: process.env.VIN_CHROMIUM_PATH } : {} },
  webServer: { command: 'npm start', url: 'http://127.0.0.1:43917', reuseExistingServer: false }
});
