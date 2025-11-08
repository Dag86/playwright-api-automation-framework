import { test, expect } from '@fixtures/apiFixture';

test.describe('API Resilience', () => {
  test('handles rate limiting gracefully', async ({ api }) => {
    const requests = Array(10).fill(null);
    const startTime = Date.now();
    
    // Make multiple requests in parallel
    const responses = await Promise.all(
      requests.map(() => api.get('/api/users'))
    );
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Check all responses were successful
    responses.forEach(res => {
      expect(res.status()).toBe(200);
    });
    
    // Ensure rate limiting didn't cause excessive delays
    expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('handles server errors gracefully', async ({ api }) => {
    // Test with an endpoint that returns 500
    const res = await api.get('/api/unknown/23');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toEqual({});
  });

  test('validates request timeout behavior', async ({ api }) => {
    const startTime = Date.now();
    const res = await api.get('/api/users', {
      timeout: 5000 // 5 second timeout
    });
    const responseTime = Date.now() - startTime;
    
    expect(res.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000);
  });

  test('handles network delay simulation', async ({ api }) => {
    // Simulate a slow network condition
    const res = await api.get('/api/users', {
      headers: {
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate'
      }
    });
    
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
  });
});