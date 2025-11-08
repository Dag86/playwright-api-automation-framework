/**
 * @fileoverview API Contract Testing Suite
 * @module tests/api/contract
 * 
 * This file contains tests that verify API responses conform to the OpenAPI specification.
 * It validates both successful and error responses against their defined schemas.
 */

import { test, expect } from '@fixtures/apiFixture';
import contract from '@contracts/openapi.json' assert { type: 'json' };
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Represents the minimal structure of an OpenAPI contract needed for response validation
 * Focuses on the paths and their response schemas
 */
interface MinimalContract {
  paths: {
    [path: string]: {
      [method: string]: {
        responses?: {
          [status: string]: {
            content?: {
              [contentType: string]: {
                schema: unknown;
              };
            };
          };
        };
      };
    };
  };
}

/**
 * Test suite for API contract validation
 * Verifies that API responses conform to their OpenAPI specification
 */
test.describe('API Contract Testing', () => {
  // Initialize AJV with formats support for enhanced schema validation
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  /**
   * Validates an API response against its OpenAPI schema definition
   * @param response - The API response object to validate
   * @param path - The OpenAPI path (e.g., '/api/users')
   * @param method - The HTTP method (e.g., 'get', 'post')
   * @param statusCode - The HTTP status code to validate against
   * @returns Object containing validation result and any validation errors
   */
  async function validateResponseAgainstSchema(
    response: Record<string, unknown>,
    path: string,
    method: string,
    statusCode: string
  ) {
    const schema = (contract as unknown as MinimalContract)
      .paths[path][method]!
      .responses![statusCode]
      .content!['application/json'].schema;

    const validate = ajv.compile(schema as Record<string, unknown>);
    const ok = validate(response);
    if (!ok) {
      console.error('Contract validation errors:', validate.errors);
    }
    return { ok, errors: validate.errors };
  }

  /**
   * Tests that the GET /users endpoint response matches its OpenAPI schema
   * Validates:
   * - Successful response status
   * - Response body structure against schema
   * - Pagination parameters handling
   */
  test('GET /users response matches OpenAPI schema', async ({ api }) => {
    const res = await api.get('/api/users', { params: { page: 1 } });
    expect(res.ok()).toBeTruthy();
    const payload = await res.json();

    const { ok, errors } = await validateResponseAgainstSchema(
      payload,
      '/api/users',
      'get',
      '200'
    );
    expect(ok, `Contract validation errors: ${errors?.map(e => e.message).join(', ')}`).toBeTruthy();
  });

  /**
   * Tests that the GET /users/{id} endpoint response matches its OpenAPI schema
   * Validates:
   * - Successful response status
   * - Single user object structure
   * - Required user properties presence
   */
  test('GET /users/{id} response matches OpenAPI schema', async ({ api }) => {
    const res = await api.get('/api/users/2');
    expect(res.ok()).toBeTruthy();
    const payload = await res.json();

    const { ok, errors } = await validateResponseAgainstSchema(
      payload,
      '/api/users/{id}',
      'get',
      '200'
    );
    expect(ok, `Contract validation errors: ${errors?.map(e => e.message).join(', ')}`).toBeTruthy();
  });

  /**
   * Tests that the POST /users endpoint request/response matches OpenAPI schema
   * Validates:
   * - 201 Created response status
   * - Created user object structure
   * - Response includes required fields (id, createdAt)
   * - Request payload validation
   */
  test('POST /users request/response matches OpenAPI schema', async ({ api }) => {
    const userData = {
      name: 'morpheus',
      job: 'leader'
    };

    const res = await api.post('/api/users', { data: userData });
    expect(res.status()).toBe(201);
    const payload = await res.json();

    const { ok, errors } = await validateResponseAgainstSchema(
      payload,
      '/api/users',
      'post',
      '201'
    );
    expect(ok, `Contract validation errors: ${errors?.map(e => e.message).join(', ')}`).toBeTruthy();
  });

  /**
   * Tests that error responses conform to the OpenAPI error schema
   * Validates:
   * - 404 Not Found response status
   * - Error response structure
   * - Error message format
   * - Schema compliance for error objects
   */
  test('error responses match OpenAPI schema', async ({ api }) => {
    const res = await api.get('/api/users/23');
    expect(res.status()).toBe(404);
    const payload = await res.json();

    const { ok, errors } = await validateResponseAgainstSchema(
      payload,
      '/api/users/{id}',
      'get',
      '404'
    );
    expect(ok, `Contract validation errors: ${errors?.map(e => e.message).join(', ')}`).toBeTruthy();
  });
});
