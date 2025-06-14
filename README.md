# Refactored Playwright Framework

A comprehensive, multi-project Playwright testing framework with advanced features including dynamic test data, interactive CLI, and sophisticated reporting.

## 🏗️ Architecture

```
refactored-playwright/
├── src/
│   ├── pages/           # Page Object Model classes
│   │   ├── pcf/        # PCF project pages  
│   │   ├── mss/        # MSS project pages
│   │   ├── ilham/      # Ilham project pages
│   │   └── shared/     # Shared components
│   ├── fixtures/        # Custom Playwright fixtures
│   ├── utils/          # Helper functions
│   ├── data/           # Static test data
│   └── runner/         # CLI runner scripts
├── tests/              # Test files organized by project
├── config/             # Environment configurations
├── scripts/            # Setup and utility scripts
└── allure-results/     # Test execution data
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone and setup:**
   ```bash
   cd /Users/khalid/Documents/Personal/refactored-playwright
   pnpm install
   pnpm run setup
   ```

2. **Install Playwright browsers:**
   ```bash
   pnpm playwright install --with-deps
   ```

3. **Verify installation:**
   ```bash
   pnpm run health-check
   ```

## 🎯 Usage

### Interactive CLI (Recommended)

Launch the interactive test runner for guided test execution:

```bash
pnpm run test:interactive
```

This will prompt you to select:
- Project (PCF, MSS, Ilham)
- Environment (dev, staging, uat, jit)
- Browsers (Chromium, Firefox, WebKit, Mobile)
- Test type (smoke, regression, auth, mobile, all, custom)
- Execution options (headed, debug, parallel)

### Direct Commands

```bash
# Run all tests for a specific project/environment
PROJECT=pcf ENV=dev pnpm run test:pcf

# Run smoke tests only
PROJECT=pcf ENV=staging pnpm test -- --grep @smoke

# Run in headed mode
PROJECT=mss ENV=dev pnpm test -- --headed

# Run specific test file
PROJECT=ilham ENV=uat pnpm test tests/ilham/auth/login.spec.ts

# Debug mode
PROJECT=pcf ENV=dev pnpm test -- --debug
```

### Multi-browser Testing

```bash
# Test across multiple browsers
PROJECT=pcf ENV=dev pnpm test -- --project=pcf_dev_chromium,pcf_dev_firefox,pcf_dev_webkit
```

## 📊 Reporting

### Allure Reports

Generate comprehensive Allure reports:

```bash
# Generate and serve report
pnpm run report:serve

# Generate static report
pnpm run report:allure

# Open existing report
pnpm run report:open
```

### Built-in Reports

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`

## 🌍 Environment Management

### Environment Files

Each project/environment combination has its own configuration file:

```
config/
├── .env.pcf.dev        # PCF Development
├── .env.pcf.staging    # PCF Staging  
├── .env.pcf.uat        # PCF UAT
├── .env.mss.dev        # MSS Development
├── .env.mss.staging    # MSS Staging
├── .env.ilham.dev      # Ilham Development
├── .env.ilham.uat      # Ilham UAT
└── .env.ilham.jit      # Ilham JIT
```

### Environment Variables

Key environment variables in each `.env` file:

```bash
BASE_URL=https://app-env.example.com
API_URL=https://api-env.example.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPass123!
ENABLE_TRACE=true
TIMEOUT_NAVIGATION=30000
TIMEOUT_ACTION=15000
TIMEOUT_EXPECT=10000
MAX_RETRIES=2
PARALLEL_WORKERS=4
```

## 🧪 Test Structure

### Test Tags

Tests are organized using a comprehensive tagging system:

| Tag Category | Examples | Purpose |
|--------------|----------|----------|
| Project | `@pcf`, `@mss`, `@ilham` | Project identification |
| Test Type | `@smoke`, `@regression`, `@e2e` | Execution scope |
| Priority | `@p1`, `@p2`, `@p3` | Test importance |
| Feature | `@auth`, `@checkout`, `@search` | Feature grouping |
| Execution | `@mobile`, `@headed`, `@slow` | Execution requirements |

### Test Organization

```typescript
test.describe('PCF - User Authentication', { 
  tag: ['@pcf', '@auth', '@critical'] 
}, () => {
  
  test('Login with valid credentials', { 
    tag: ['@smoke', '@p1'] 
  }, async ({ page, testUser }) => {
    // Test implementation
  });
});
```

## 🎭 Page Object Model

### Shared Components

Reusable components available across all projects:

```typescript
import { HeaderComponent } from '@shared/header.component';
import { FormComponent } from '@shared/form.component';
import { FooterComponent } from '@shared/footer.component';
```

### Project-Specific Pages

```typescript
import { PCFLoginPage } from '@pcf/auth/loginPage';
import { PCFRegistrationPage } from '@pcf/auth/registrationPage';
```

### Creating New Page Objects

```typescript
// src/pages/pcf/dashboard/dashboardPage.ts
import { $, Page } from 'playwright-elements';
import { HeaderComponent } from '@shared/header.component';

export class PCFDashboardPage {
  readonly page: Page;
  readonly header: ReturnType<typeof HeaderComponent>;
  
  constructor(page: Page) {
    this.page = page;
    this.header = HeaderComponent(page);
  }
  
  async navigate() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }
}
```

## 🎲 Dynamic Test Data

### Using Faker.js Fixtures

```typescript
import { test, expect } from '@fixtures/testData.fixture';

test('Register new user', async ({ page, testUser, testProduct, testPayment }) => {
  // testUser, testProduct, testPayment are automatically generated
  console.log(testUser.email); // john.doe@example.com
  console.log(testProduct.name); // Fantastic Wooden Chair
});
```

### Available Test Data

- **`testUser`**: Complete user profile with personal and company details
- **`testProduct`**: Product information with pricing and categorization
- **`testPayment`**: Payment details with billing address
- **`randomSeed`**: Reproducible random seed for consistent test data

## 🔧 Development

### Adding a New Project

1. **Use the setup script:**
   ```bash
   ./scripts/setup-new-project.sh myproject dev,staging,prod
   ```

2. **Manual setup:**
   ```bash
   mkdir -p src/pages/myproject tests/myproject
   cp config/.env.template config/.env.myproject.dev
   # Edit the new environment file
   ```

### Code Quality

```bash
# TypeScript checking
pnpm run typecheck

# ESLint
pnpm run lint
pnpm run lint:fix

# Health check
pnpm run health-check
```

### Path Aliases

The framework uses TypeScript path aliases for clean imports:

```typescript
import { PCFLoginPage } from '@pcf/auth/loginPage';     // src/pages/pcf/auth/loginPage
import { testData } from '@fixtures/testData.fixture';  // src/fixtures/testData.fixture
import { helpers } from '@utils/helpers';               // src/utils/helpers
import config from '@config/.env.pcf.dev';             // config/.env.pcf.dev
```

## 🐛 Debugging

### Common Debug Commands

```bash
# Debug mode with browser visible
PROJECT=pcf ENV=dev pnpm test -- --debug

# Headed mode
PROJECT=pcf ENV=dev pnpm test -- --headed

# Enable Playwright Inspector
PWDEBUG=1 PROJECT=pcf ENV=dev pnpm test

# Verbose logging
DEBUG=pw:api PROJECT=pcf ENV=dev pnpm test

# Single test file
PROJECT=pcf ENV=dev pnpm test tests/pcf/auth/login.spec.ts
```

### Debug Environment Variables

```bash
# In your .env files
ENABLE_TRACE=true          # Enable Playwright tracing
SCREENSHOT_ON_FAILURE=true # Screenshots on failure
VIDEO_ON_FAILURE=true      # Videos on failure
DEBUG=true                 # Enable debug logging
```

## 🔍 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Wrong environment loaded | Incorrect PROJECT/ENV vars | Check `echo $PROJECT $ENV` |
| Path aliases not working | TypeScript config | Verify `tsconfig.json` paths |
| Tests timing out | Slow network/app | Increase timeout in `.env` file |
| Can't find `.env` file | Wrong project/env combo | Check file exists |
| Flaky tests | Poor locators | Use `data-testid` attributes |

### Health Check

Run the health check to diagnose issues:

```bash
pnpm run health-check
```

This will:
- ✅ Check all environment files exist
- ✅ Verify required dependencies
- ✅ Run smoke tests for all project/environment combinations
- ✅ Report any failures with troubleshooting tips

## 📝 Scripts Reference

### Core Scripts

```bash
pnpm install:all           # Install all dependencies
pnpm setup                 # Setup Playwright browsers
pnpm test                  # Run tests (requires PROJECT/ENV)
pnpm test:interactive      # Interactive test runner
pnpm test:pcf             # Run PCF tests
pnpm test:mss             # Run MSS tests
pnpm test:ilham           # Run Ilham tests
```

### Test Execution

```bash
pnpm test:smoke           # Run smoke tests
pnpm test:regression      # Run regression tests
pnpm test:headed          # Run in headed mode
pnpm test:debug           # Run in debug mode
```

### Reporting

```bash
pnpm report:allure        # Generate Allure report
pnpm report:open          # Open existing report
pnpm report:serve         # Generate and serve report
```

### Maintenance

```bash
pnpm health-check         # Framework health check
pnpm setup:project        # Setup new project
pnpm clean                # Clean all reports
pnpm lint                 # Run ESLint
pnpm typecheck            # TypeScript checking
```

## 🚀 CI/CD Integration

### GitLab CI Example

```yaml
# .gitlab-ci.yml
test-pcf-dev:
  script:
    - PROJECT=pcf ENV=dev pnpm run test:pcf -- --grep @smoke
  only:
    - merge_requests

test-pcf-staging:
  script:
    - PROJECT=pcf ENV=staging pnpm run test:pcf
  only:
    - main
```

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
- name: Run PCF Tests
  run: |
    PROJECT=pcf ENV=dev pnpm run test:pcf -- --grep @smoke
```

## 📊 Metrics and Performance

### Test Execution Time

- **Smoke tests**: ~2-5 minutes
- **Regression tests**: ~15-30 minutes  
- **Full suite**: ~45-60 minutes

### Browser Coverage

- **Chromium**: All tests
- **Firefox**: Critical paths
- **WebKit**: Smoke tests
- **Mobile**: Mobile-specific flows

## 🤝 Contributing

### Code Standards

1. **Use TypeScript** for all new code
2. **Follow path aliases** for imports
3. **Tag tests appropriately** for proper organization
4. **Use Page Object Model** for UI interactions
5. **Write descriptive test names** and descriptions

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] Health check passes
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] New tests include appropriate tags
- [ ] Page objects follow established patterns
- [ ] Environment variables documented

## 📚 Resources

### Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Elements](https://github.com/danteukraine/playwright-elements)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Inquirer.js Documentation](https://github.com/SBoudrias/Inquirer.js)
- [Allure Documentation](https://docs.qameta.io/allure/)

### Tools

- **VS Code Extensions**:
  - Playwright Test for VS Code
  - TypeScript Importer
  - Path Intellisense
  - ESLint

### Support

For questions or issues:

1. Check the troubleshooting section
2. Run `pnpm run health-check`
3. Review the logs in `test-results/`
4. Create an issue with reproduction steps

---

## 🎉 Success!

You now have a comprehensive, scalable Playwright testing framework that supports:

✅ **Multi-project architecture** with PCF, MSS, and Ilham support  
✅ **Environment flexibility** across dev, staging, UAT, and JIT  
✅ **Dynamic test data** with Faker.js integration  
✅ **Interactive CLI** for guided test execution  
✅ **Advanced reporting** with Allure integration  
✅ **Page Object Model** with playwright-elements  
✅ **Comprehensive tagging** for organized test execution  
✅ **Health monitoring** and debugging tools  
✅ **CI/CD ready** configuration  

Happy testing! 🚀