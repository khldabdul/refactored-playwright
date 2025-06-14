# Playwright Elements Integration Guide

## Overview

This project has been updated to use `playwright-elements` for better page object model structure and enhanced test maintainability. The integration includes comprehensive Allure step annotations for detailed reporting.

## Key Features

### 🎯 **Playwright Elements Benefits**
- **Component-based architecture** with `.with()` method for nested elements
- **Type-safe page objects** with full TypeScript support
- **Automatic element management** without manual Page instance passing
- **Built-in fixture integration** with `buildPageObject`
- **Enhanced selector patterns** with robust fallback strategies

### 📊 **Allure Integration**
- **Step annotations** using `@step()` decorator on all page object methods
- **Nested step reporting** with `step()` function for detailed action tracking
- **Rich test metadata** with tags, priorities, and descriptions
- **Visual test reports** with screenshots and traces

## Architecture Overview

```
src/
├── fixtures/
│   ├── testData.fixture.ts          # Faker.js data generation
│   └── pageObject.fixture.ts        # Playwright-elements integration
├── pages/
│   ├── index.ts                     # Centralized page object exports
│   ├── shared/                      # Reusable components
│   │   ├── header.component.ts
│   │   ├── footer.component.ts
│   │   └── form.component.ts
│   ├── pcf/auth/                    # PCF project pages
│   ├── mss/dashboard/               # MSS project pages
│   └── ilham/integration/           # Ilham project pages
tests/
├── pcf/auth/                        # PCF test files
├── mss/dashboard/                   # MSS test files
└── ilham/integration/               # Ilham test files
```

## Usage Examples

### Basic Test Structure

```typescript
import { pageObjectTest as test, expect } from '@fixtures/pageObject.fixture';

test.describe('Feature Name', { tag: ['@project', '@feature'] }, () => {
  
  test('Test scenario', { tag: ['@smoke', '@p1'] }, async ({ pageObject, testUser }) => {
    // Access any page object directly
    await pageObject.PCFLoginPage.navigate();
    await pageObject.PCFLoginPage.loginWithTestUser(testUser);
    
    // Verify results
    await pageObject.PCFLoginPage.expectLoginSuccess();
  });
});
```

### Page Object Definition Pattern

```typescript
import { $ } from 'playwright-elements';
import { step } from 'allure-js-commons';

export class ExamplePage {
  // Define elements with robust selectors
  readonly emailInput = $('input[name="email"], input[type="email"], [data-testid="email"]');
  
  // Component with nested elements and methods
  readonly loginForm = $('form[data-testid="login-form"]')
    .with({
      submitButton: $('button[type="submit"]'),
      errorMessage: $('.error, .error-message'),
      
      async submit() {
        return await step('Submit form', async () => {
          await this.submitButton.click();
        });
      },
      
      async expectError(message: string) {
        return await step(`Expect error: "${message}"`, async () => {
          await this.errorMessage.expect().toContainText(message);
        });
      }
    });

  @step('Navigate to page')
  async navigate() {
    const { BrowserInstance } = await import('playwright-elements');
    await BrowserInstance.currentPage.goto('/login');
    await BrowserInstance.currentPage.waitForLoadState('networkidle');
  }

  @step('Perform login action')
  async login(credentials: { email: string; password: string }) {
    await step('Fill email', async () => {
      await this.emailInput.fill(credentials.email);
    });
    
    await this.loginForm.submit();
  }
}
```

## Component Architecture

### Shared Components

Components are defined as standalone objects that can be reused across pages:

```typescript
// header.component.ts
export const HeaderComponent = $('.header, .navbar')
  .with({
    logo: $('.header-logo'),
    userMenu: $('.user-menu')
      .with({
        profileLink: $('a[href*="profile"]'),
        async openProfile() {
          return await step('Open user profile', async () => {
            await this.profileLink.click();
          });
        }
      }),
    
    async verifyLoggedIn(username: string) {
      return await step(`Verify user "${username}" is logged in`, async () => {
        await this.userMenu.expect().toContainText(username);
      });
    }
  });
```

### Form Components

```typescript
// form.component.ts
export const FormComponent = (formSelector: string) => {
  return $(formSelector).with({
    submitButton: $('button[type="submit"]'),
    errorMessage: $('.error, .error-message'),
    
    async fillField(fieldName: string, value: string) {
      return await step(`Fill field "${fieldName}"`, async () => {
        const field = $(`input[name="${fieldName}"]`);
        await field.fill(value);
      });
    },
    
    async submit() {
      return await step('Submit form', async () => {
        await this.submitButton.click();
      });
    }
  });
};
```

## Test Data Integration

### Faker.js Integration

```typescript
// testData.fixture.ts
export const test = baseTest.extend<TestFixtures>({
  testUser: async ({ randomSeed }, use) => {
    const user: UserData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
      // ... more fields
    };
    await use(user);
  }
});
```

### Using Test Data

```typescript
test('Login with generated user', async ({ pageObject, testUser }) => {
  await pageObject.PCFLoginPage.navigate();
  await pageObject.PCFLoginPage.loginWithTestUser(testUser);
  await pageObject.PCFLoginPage.header.verifyLoggedIn(testUser.firstName);
});
```

## Selector Strategies

### Robust Selector Patterns

All page objects use robust selector patterns with multiple fallbacks:

```typescript
// Multiple selector fallbacks for reliability
readonly emailInput = $('input[name="email"], input[type="email"], [data-testid="email"]');
readonly submitButton = $('button[type="submit"], input[type="submit"], [data-testid="submit"]');

// Semantic selectors with fallbacks
readonly errorMessage = $('.error, .error-message, [data-testid="error"], .alert-danger');
```

## Navigation and Page Management

### BrowserInstance Usage

```typescript
@step('Navigate to login page')
async navigate() {
  const { BrowserInstance } = await import('playwright-elements');
  await BrowserInstance.currentPage.goto('/login');
  await BrowserInstance.currentPage.waitForLoadState('networkidle');
}

@step('Verify URL after action')
async verifyURL(pattern: RegExp) {
  const { BrowserInstance } = await import('playwright-elements');
  await expect(BrowserInstance.currentPage).toHaveURL(pattern);
}
```

## Testing Patterns

### Smoke Tests

```typescript
test('Critical user journey', { tag: ['@smoke', '@p1'] }, async ({ pageObject, testUser }) => {
  await pageObject.PCFLoginPage.navigate();
  await pageObject.PCFLoginPage.loginWithTestUser(testUser);
  await pageObject.MSSdashboardPage.navigate();
  await pageObject.MSSdashboardPage.verifyWidgetsLoaded();
});
```

### Regression Tests

```typescript
test('Form validation edge cases', { tag: ['@regression', '@validation'] }, async ({ pageObject }) => {
  await pageObject.PCFRegistrationPage.navigate();
  await pageObject.PCFRegistrationPage.fillRegistrationForm({
    email: 'invalid-email-format',
    // ... other fields
  });
  await pageObject.PCFRegistrationPage.expectRegistrationError('Please enter a valid email address');
});
```

### Cross-Project Integration

```typescript
test('Multi-project workflow', async ({ pageObject, testUser }) => {
  // Start in PCF
  await pageObject.PCFLoginPage.navigate();
  await pageObject.PCFLoginPage.loginWithTestUser(testUser);
  
  // Move to MSS
  await pageObject.MSSdashboardPage.navigate();
  await pageObject.MSSdashboardPage.verifyUserLoggedIn(testUser.firstName);
  
  // Configure Ilham
  await pageObject.IlhamIntegrationPage.navigate();
  await pageObject.IlhamIntegrationPage.setupIntegration(/* config */);
});
```

## Running Tests

### Individual Project Tests
```bash
# PCF tests
npm run test:pcf

# MSS tests  
npm run test:mss

# Ilham tests
npm run test:ilham
```

### Tag-based Execution
```bash
# Smoke tests only
npm run test:smoke

# Regression tests
npm run test:regression

# Priority 1 tests
npx playwright test --grep "@p1"
```

### Debug Mode
```bash
# Debug with UI
npm run test:debug

# Headed mode
npm run test:headed
```

## Allure Reporting

### Generate Reports
```bash
# Generate and view Allure report
npm run report:allure
npm run report:open
```

### Step Hierarchy

The integration provides detailed step hierarchy in Allure reports:

```
✅ Test: Login with valid credentials
  📋 Navigate to login page
  📋 Login with credentials
    📝 Fill email field
    📝 Fill password field  
    📝 Submit login form
    📝 Wait for login response
  📋 Verify user "John" is logged in
  📋 Expect login success
```

## Best Practices

### 1. Element Definitions
- Use robust selectors with multiple fallbacks
- Prefer semantic selectors (`getByRole`, `getByLabel`) when available
- Include `data-testid` attributes as primary selectors

### 2. Step Annotations
- Use `@step()` decorator for all public page object methods
- Use `step()` function for granular actions within methods
- Provide descriptive step names with dynamic values

### 3. Component Reusability
- Define shared components in `/shared/` directory
- Use `.with()` method for component composition
- Keep components focused and single-purpose

### 4. Test Organization
- Group related tests in `describe` blocks with appropriate tags
- Use meaningful test names that describe the scenario
- Include priority and category tags for test filtering

### 5. Error Handling
- Implement comprehensive error assertions
- Use meaningful error messages in validations
- Handle loading states and async operations properly

## Migration Notes

If you're migrating from the old page object pattern:

1. **Remove Page constructor dependencies** - playwright-elements handles page management
2. **Update element definitions** - use `$()` syntax instead of `page.locator()`
3. **Add step annotations** - use `@step()` and `step()` for Allure integration
4. **Update test imports** - use `pageObjectTest` instead of base `test`
5. **Access BrowserInstance** - for page navigation and assertions

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all path aliases are correctly configured in `tsconfig.json`
2. **Page Navigation**: Use `BrowserInstance.currentPage` for page operations
3. **Element Not Found**: Check selector robustness and timing
4. **Step Annotations**: Ensure `experimentalDecorators` is enabled in TypeScript config

### Debug Tips

1. Use `headed: true` mode to see browser interactions
2. Enable `trace: 'on'` for detailed execution traces  
3. Check Allure reports for step-by-step execution details
4. Use `console.log()` in step functions for debugging

This integration provides a robust, maintainable, and well-documented foundation for your Playwright automation framework with excellent reporting capabilities.
