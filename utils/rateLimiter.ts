/**
 * @fileoverview Rate limiting utilities for API request handling
 * @module utils/rateLimiter
 */

import { expect, APIResponse, APIRequestContext } from '@playwright/test';

/**
 * Configuration options for rate limiting behavior
 */
export interface RateLimitConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Base delay between retries in milliseconds */
  baseDelay?: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay?: number;
}

/**
 * Validates that a response indicates rate limiting
 * @param resp - The API response to validate
 * @returns The retry-after value in seconds
 */
export async function expectRateLimited(resp: APIResponse) {
  expect(resp.status(), 'HTTP 429 expected when rate limited').toBe(429);
  const retryAfter = resp.headers()['retry-after'];
  expect(retryAfter, 'Retry-After header should be present').toBeTruthy();
  return parseInt(retryAfter, 10);
}

/**
 * Wraps a request with rate limiting logic
 * @template T - The type of the response
 * @param request - The request function to execute
 * @param config - Rate limiting configuration options
 * @returns Promise resolving to the request response
 * @throws Error if max retries are exceeded
 */
export async function withRateLimit<T>(
  request: () => Promise<T>,
  config: RateLimitConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000
  } = config;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error as Error;
      const resp = error instanceof Error && 'response' in error 
        ? ((error as { response?: APIResponse }).response as APIResponse) 
        : null;
      
      if (resp?.status() === 429) {
        const retryAfter = resp.headers()['retry-after'];
        const delay = Math.min(
          retryAfter ? parseInt(retryAfter, 10) * 1000 : baseDelay * Math.pow(2, attempt),
          maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Helper function to make a rate-limited GET request
 * @param api - Playwright API request context
 * @param path - The request path
 * @param options - Request options
 * @returns Promise resolving to the API response
 */
export async function rateLimit(
  api: APIRequestContext,
  path: string,
  options?: Parameters<APIRequestContext['get']>[1]
): Promise<APIResponse> {
  return withRateLimit(() => api.get(path, options));
}
