# API Test Automation Framework with Playwright

A robust API testing framework built with Playwright, TypeScript, and best practices for API automation.

## Features

- ✅ Full API test automation with Playwright
- 🔄 Automatic retries and rate limiting
- 📊 Comprehensive reporting (Allure, JUnit)
- 🔍 Contract testing with OpenAPI/Swagger
- 🚦 Request/Response validation
- ⚡ Parallel test execution
- 🔒 Authentication handling
- 📈 Response time monitoring
- 🔄 Dual runners: Playwright API + Postman/Newman
- 📋 Contract drift detection in CI

## Quickstart
```bash
# Clone & install
pnpm i || npm i

# Copy envs
cp .env.example .env

# Run tests
npm run test
npm run postman:run

# Allure
npm run allure:generate && npx serve reports/allure-report
```

## Scripts
- `npm run contracts:validate` – sanity check OpenAPI file
- `npm run contracts:drift` – fail CI if contract changed vs HEAD
- `npm run test:ci` – Playwright with JUnit + Allure
- `npm run postman:run` – Newman run with JUnit export

## Structure
```
project-root/
├── tests/api/              # Playwright API suites
├── fixtures/               # api fixture (APIRequestContext + auth)
├── utils/                  # auth token handler, schema validator, rate limiter
├── contracts/              # OpenAPI source of truth
├── schemas/                # JSON Schemas for direct Ajv validation
├── postman/                # Collections & environments
├── CI/                     # Azure DevOps sample
├── .github/workflows/      # GitHub Actions pipeline
├── reports/                # Allure/JUnit outputs
└── scripts/                # Contract tools
```

## Notes
- Demo targets https://reqres.in — replace with your API when ready.
- OAuth token flow is stubbed; wire `utils/authHandler.ts` to your issuer.
- Set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` in CI for API-only speed.
