/**
 * @fileoverview API testing fixture setup for Playwright tests
 * @module fixtures/apiFixture
 */

import { test as base, APIRequestContext, request } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['BASE_URL', 'API_KEY', 'TEST_USER_EMAIL', 'TEST_USER_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/**
 * Custom fixtures for API testing
 */
type ApiFixtures = {
  /** Pre-configured API request context */
  api: APIRequestContext;
};

/**
 * Extended test fixture with API support
 */
export const test = base.extend<ApiFixtures>({
  /**
   * API fixture providing configured request context
   * @param {Object} param - Fixture parameters
   * @param {string} param.baseURL - Base URL for API requests (defaults to process.env.BASE_URL)
   * @param {Function} use - Fixture use callback
   */
  api: async ({ baseURL = process.env.BASE_URL }, use) => {
    await use(await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      }
    }));
  }
});

export const expect = test.expect;