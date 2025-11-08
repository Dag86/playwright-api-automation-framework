/**
 * @fileoverview Authentication API tests for reqres demo
 * @module tests/api/auth
 */

import { test, expect } from '@fixtures/apiFixture';
import { JSONSchemaType } from 'ajv';
import loginSchema from '@schemas/login.response.json' assert { type: 'json' };
import { validateJson } from '@utils/schemaValidator';

test.describe('Auth - reqres demo', () => {
  /**
   * Tests successful login scenario with valid credentials
   * Validates response schema and token presence
   */
  test('should login successfully and return token', async ({ api }) => {
    const res = await api.post('/api/login', {
      data: { 
        email: 'eve.holt@reqres.in', 
        password: 'cityslicka'
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const validationResult = validateJson(loginSchema as unknown as JSONSchemaType<{ token: string }>, body);
    expect(validationResult.valid, `Schema errors: ${validationResult.errors?.join(', ')}`).toBeTruthy();
    expect(typeof body.token).toBe('string');
    expect(body.token).toBeTruthy();
  });

  /**
   * Tests successful user registration
   * Validates id and token are returned
   */
  test('should register new user successfully', async ({ api }) => {
    const res = await api.post('/api/register', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'pistol'
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('token');
  });

  /**
   * Tests login failure with invalid credentials
   * Validates 400 status and error message
   */
  test('login fails with invalid credentials', async ({ api }) => {
    const res = await api.post('/api/login', { 
      data: { 
        email: 'invalid@email.com',
        password: 'wrongpass'
      } 
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'user not found');
  });

  /**
   * Tests login failure when password is missing
   * Validates 400 status and specific error message
   */
  test('login fails with missing password', async ({ api }) => {
    const res = await api.post('/api/login', {
      data: { email: 'eve.holt@reqres.in' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'Missing password');
  });
});
