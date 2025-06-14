import { test } from "@playwright/test";
import { $ } from "playwright-elements";

export class PcfLoginPage {
  // Element definitions using playwright-elements
  readonly emailInput = $('input[name="email"], input[type="email"], [data-testid="email"]');
  readonly passwordInput = $('input[name="password"], input[type="password"], [data-testid="password"]');
  readonly loginButton = $('button[type="submit"], [data-testid="login-button"]');
  readonly rememberMeCheckbox = $('input[name="remember"], [data-testid="remember-me"]');
  readonly forgotPasswordLink = $('a[href*="forgot"], [data-testid="forgot-password"]');
  readonly errorMessage = $('.error, .error-message, [data-testid="error"]');
  readonly loadingSpinner = $('.loading, .spinner, [data-testid="loading"]');

  // Header component
  readonly header = $('.header, .navbar, [data-testid="header"]').with({
    logo: $('.header-logo, .navbar-brand, [data-testid="logo"]'),
    userMenu: $('.user-menu, .user-dropdown, [data-testid="user-menu"]'),
    searchBar: $('input[data-testid="search"], .search-input, input[placeholder*="Search"]'),
    navigationMenu: $('.nav-menu, .navigation, [data-testid="navigation"]'),
    loginButton: $('a[href*="login"], button:has-text("Login"), [data-testid="login-btn"]'),
    logoutButton: $('a[href*="logout"], button:has-text("Logout"), [data-testid="logout-btn"]'),

    async search(term: string) {
      return await test.step(`Search for "${term}"`, async () => {
        await this.searchBar.fill(term);
        await this.searchBar.press("Enter");
      });
    },

    async clickLogin() {
      return await test.step("Click login button in header", async () => {
        await this.loginButton.click();
      });
    },

    async clickLogout() {
      return await test.step("Click logout button", async () => {
        await this.logoutButton.click();
      });
    },

    async verifyLoggedIn(username: string) {
      return await test.step(`Verify user "${username}" is logged in`, async () => {
        await this.userMenu.expect().toContainText(username);
      });
    },

    async verifyLoggedOut() {
      return await test.step("Verify user is logged out", async () => {
        await this.loginButton.expect().toBeVisible();
        await this.userMenu.expect().not.toBeVisible();
      });
    },
  });

  // Login form component
  readonly loginForm = $('form[data-testid="login-form"], .login-form, form:has(input[type="email"])').with({
    submitButton: $('button[type="submit"], input[type="submit"], [data-testid="submit"]'),
    cancelButton: $('button[type="button"]:has-text("Cancel"), [data-testid="cancel"]'),
    errorMessage: $('.error, .error-message, [data-testid="error"]'),
    successMessage: $('.success, .success-message, [data-testid="success"]'),

    async submit() {
      return await test.step("Submit login form", async () => {
        await this.submitButton.click();
      });
    },

    async expectError(message: string) {
      return await test.step(`Expect form error: "${message}"`, async () => {
        await this.errorMessage.expect().toContainText(message);
      });
    },

    async expectSuccess(message: string) {
      return await test.step(`Expect form success: "${message}"`, async () => {
        await this.successMessage.expect().toContainText(message);
      });
    },
  });

  async navigate() {
    return await test.step("Navigate to login page", async () => {
      // We'll use the BrowserInstance from playwright-elements for navigation
      const { BrowserInstance } = await import("playwright-elements");
      await BrowserInstance.currentPage.goto("/login");
      await BrowserInstance.currentPage.waitForLoadState("networkidle");
    });
  }

  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return await test.step("Login with credentials", async () => {
      await test.step("Fill email field", async () => {
        await this.emailInput.fill(credentials.email);
      });

      await test.step("Fill password field", async () => {
        await this.passwordInput.fill(credentials.password);
      });

      if (credentials.rememberMe) {
        await test.step("Check remember me checkbox", async () => {
          await this.rememberMeCheckbox.check();
        });
      }

      await this.loginForm.submit();

      await test.step("Wait for login response", async () => {
        const { BrowserInstance } = await import("playwright-elements");
        await BrowserInstance.currentPage.waitForLoadState("networkidle");
      });
    });
  }

  async loginWithTestUser(user: { email: string; password: string; firstName?: string }, rememberMe: boolean = false) {
    return await test.step("Login with test user", async () => {
      await this.login({
        email: user.email,
        password: user.password,
        rememberMe,
      });
    });
  }

  async quickLogin(email: string, password: string) {
    return await test.step("Quick login", async () => {
      await this.login({ email, password });
    });
  }

  async navigateAndLogin(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return await test.step("Navigate and login", async () => {
      await this.navigate();
      await this.login(credentials);
    });
  }

  async forgotPassword() {
    return await test.step("Click forgot password link", async () => {
      await this.forgotPasswordLink.click();
      const { BrowserInstance } = await import("playwright-elements");
      await BrowserInstance.currentPage.waitForLoadState("networkidle");
    });
  }

  // Verification methods
  async expectLoginError(message: string) {
    return await test.step("Expect login error", async () => {
      await this.loginForm.expectError(message);
    });
  }

  async expectLoginSuccess() {
    return await test.step("Expect login success", async () => {
      // Should redirect away from login page
      const { BrowserInstance } = await import("playwright-elements");
      await BrowserInstance.currentPage.waitForURL(/^(?!.*\/login).*$/);
    });
  }

  async expectInvalidCredentials() {
    return await test.step("Expect invalid credentials error", async () => {
      await this.expectLoginError("Invalid email or password");
    });
  }

  async expectEmptyFields() {
    return await test.step("Expect empty fields error", async () => {
      await this.expectLoginError("Please fill in all required fields");
    });
  }

  async waitForLoading() {
    return await test.step("Wait for loading to complete", async () => {
      await this.loadingSpinner.expect().not.toBeVisible();
    });
  }

  async verifyPageElements() {
    return await test.step("Verify login page elements are visible", async () => {
      await this.emailInput.expect().toBeVisible();
      await this.passwordInput.expect().toBeVisible();
      await this.loginButton.expect().toBeVisible();
      await this.forgotPasswordLink.expect().toBeVisible();
    });
  }
}
