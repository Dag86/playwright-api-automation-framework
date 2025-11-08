/**
 * @fileoverview Tests for API pagination functionality
 * @module tests/api/pagination
 */

import { test, expect } from '@fixtures/apiFixture';

/**
 * Test suite for pagination functionality
 * Verifies that the API correctly handles page-based data retrieval
 */
test.describe('Pagination', () => {
  /**
   * Tests that different page parameters return different sets of results
   * Validates:
   * - Page numbers match request parameters
   * - Data differs between pages
   * - Response structure consistency
   */
  test('page param changes result page', async ({ api }) => {
    const r1 = await api.get('/api/users', { params: { page: 1 } });
    const r2 = await api.get('/api/users', { params: { page: 2 } });
    const b1 = await r1.json();
    const b2 = await r2.json();
    expect(b1.page).toBe(1);
    expect(b2.page).toBe(2);
    expect(b1.data[0].id).not.toBe(b2.data[0].id);
  });
});
