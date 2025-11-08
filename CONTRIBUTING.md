# Contributing to API Test Automation Framework

Thank you for your interest in contributing to our API test automation framework! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Prerequisites**
   - Node.js 16.x or higher
   - npm 7.x or higher
   - Git
   - VS Code (recommended)

2. **Recommended VS Code Extensions**
   - Playwright Test for VS Code
   - ESLint
   - Prettier
   - TypeScript IDE Support

3. **Initial Setup**
   ```bash
   git clone <repository-url>
   cd playwright-api-automation-framework
   npm install
   cp .env.example .env
   ```

## Coding Standards

### TypeScript Guidelines

1. **Types and Interfaces**
   ```typescript
   // Prefer interfaces for public APIs
   interface TestConfig {
     retries: number;
     timeout: number;
   }

   // Use type for unions/intersections
   type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
   ```

2. **Async/Await**
   ```typescript
   // Always use async/await over .then()
   async function makeRequest() {
     try {
       const response = await api.get('/endpoint');
       return response.json();
     } catch (error) {
       handleError(error);
     }
   }
   ```

3. **Error Handling**
   ```typescript
   // Use specific error types
   class APIError extends Error {
     constructor(
       message: string,
       public statusCode: number
     ) {
       super(message);
     }
   }
   ```

### Test Structure

1. **Test Organization**
   ```typescript
   test.describe('Feature Group', () => {
     test.beforeEach(async ({ api }) => {
       // Setup
     });

     test('should perform specific action', async ({ api }) => {
       // Arrange
       const data = {...};

       // Act
       const response = await api.post('/endpoint', { data });

       // Assert
       expect(response.ok()).toBeTruthy();
     });
   });
   ```

2. **Test Naming**
   - Use descriptive names
   - Follow the pattern: `should [expected behavior] when [condition]`
   - Group related tests together

## Adding New Features

### 1. Test Cases
- Place in appropriate file under `tests/api/`
- Include both positive and negative cases
- Add contract tests if applicable
- Include response time assertions

### 2. Utilities
- Place reusable code in `utils/`
- Add proper TypeScript types
- Include unit tests
- Document public APIs

### 3. Fixtures
- Add to `fixtures/` directory
- Keep fixtures focused and minimal
- Document configuration options

## Pull Request Process

1. **Branch Naming**
   ```
   feature/description
   fix/issue-description
   docs/documentation-update
   ```

2. **Commit Messages**
   ```
   feat: add new API endpoint tests
   fix: resolve rate limiting issue
   docs: update setup instructions
   ```

3. **PR Description**
   - Describe the change
   - Link related issues
   - List testing steps
   - Include screenshots if relevant

4. **Checklist**
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Lint passes
   - [ ] All tests pass
   - [ ] Contract tests updated if needed

## Testing Guidelines

### 1. Test Coverage
- Aim for high coverage of API endpoints
- Include edge cases
- Test error conditions
- Verify response times

### 2. Performance Testing
- Include response time assertions
- Test rate limiting behavior
- Verify parallel execution

### 3. Contract Testing
- Update OpenAPI specs
- Verify response schemas
- Check for contract drift

## Documentation

### 1. Code Documentation
```typescript
/**
 * Validates API response against JSON schema
 * @param schema - JSON schema to validate against
 * @param payload - Response payload to validate
 * @returns Validation result with errors if any
 */
function validateResponse(schema: Schema, payload: unknown): ValidationResult
```

### 2. Test Documentation
```typescript
test('should return 429 when rate limit exceeded', async ({ api }) => {
  // Given: A series of rapid requests
  const requests = Array(10).fill(null);
  
  // When: Making concurrent requests
  const responses = await Promise.all(
    requests.map(() => api.get('/endpoint'))
  );
  
  // Then: Last request should be rate limited
  expect(responses[9].status()).toBe(429);
});
```

## Release Process

1. **Version Update**
   ```bash
   npm version patch|minor|major
   ```

2. **Pre-release Checks**
   - Run full test suite
   - Check documentation
   - Verify CI pipeline
   - Test in staging environment

3. **Release Steps**
   - Update CHANGELOG.md
   - Create release tag
   - Update documentation
   - Deploy to production

## Questions & Support

- Create an issue for bugs
- Use discussions for questions
- Tag maintainers for urgent issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.