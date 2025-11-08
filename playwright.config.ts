import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  timeout: 30_000,
  workers: process.env.CI ? 4 : undefined,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['junit', { outputFile: 'reports/junit/playwright-results.xml' }],
    ['allure-playwright']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://reqres.in',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  }
});
