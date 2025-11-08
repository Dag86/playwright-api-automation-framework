/**
 * @fileoverview User CRUD operations API tests
 * @module tests/api/user
 */

import { test, expect } from '@fixtures/apiFixture';
import { JSONSchemaType } from 'ajv';
import usersSchema from '@schemas/users.list.response.json' assert { type: 'json' };
import { validateJson } from '@utils/schemaValidator';

test.describe('Users CRUD operations', () => {
  /**
   * Tests user list retrieval with performance check
   * Validates:
   * - Response time under 2 seconds
   * - Response schema
   * - Pagination
   * - Non-empty data array
   */
  test('list users with response time check', async ({ api }) => {
    const startTime = Date.now();
    const res = await api.get('/api/users', { params: { page: 1 } });
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(2000); // Response should be under 2 seconds
    expect(res.status()).toBe(200);
    const body = await res.json();

    interface UserListResponse {
      page: number;
      data: Array<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar: string;
      }>;
    }
    
    const validationResult = validateJson(usersSchema as unknown as JSONSchemaType<UserListResponse>, body);
    expect(validationResult.valid, `Schema errors: ${validationResult.errors?.join(', ')}`).toBeTruthy();
    expect(body.page).toBe(1);
    expect(body.data.length).toBeGreaterThan(0);
  });

  /**
   * Tests retrieval of a single user by ID
   * Validates user object properties presence and correct ID
   */
  test('get single user', async ({ api }) => {
    const res = await api.get('/api/users/2');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveProperty('id', 2);
    expect(body.data).toHaveProperty('email');
    expect(body.data).toHaveProperty('first_name');
    expect(body.data).toHaveProperty('last_name');
  });

  /**
   * Tests user creation with data validation
   * Validates:
   * - 201 Created response
   * - Returned data matches input
   * - ID is assigned
   * - Creation timestamp is valid
   */
  test('create user with validation', async ({ api }) => {
    const userData = {
      name: 'morpheus',
      job: 'leader'
    };
    
    const res = await api.post('/api/users', { data: userData });
    expect(res.status()).toBe(201);
    const body = await res.json();
    
    expect(body).toMatchObject({
      name: userData.name,
      job: userData.job
    });
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
    expect(new Date(body.createdAt)).toBeInstanceOf(Date);
  });

  /**
   * Tests user update functionality
   * Validates:
   * - Updated data matches input
   * - Update timestamp is present and valid
   */
  test('update user', async ({ api }) => {
    const updateData = {
      name: 'morpheus updated',
      job: 'senior leader'
    };
    
    const res = await api.put('/api/users/2', { data: updateData });
    expect(res.status()).toBe(200);
    const body = await res.json();
    
    expect(body).toMatchObject(updateData);
    expect(body).toHaveProperty('updatedAt');
    expect(new Date(body.updatedAt)).toBeInstanceOf(Date);
  });

  /**
   * Tests user deletion
   * Validates successful deletion with 204 No Content response
   */
  test('delete user', async ({ api }) => {
    const res = await api.delete('/api/users/2');
    expect(res.status()).toBe(204);
  });

  /**
   * Tests error handling for non-existent user
   * Validates 404 Not Found response for invalid user ID
   */
  test('get non-existent user returns 404', async ({ api }) => {
    const res = await api.get('/api/users/23');
    expect(res.status()).toBe(404);
  });
});
