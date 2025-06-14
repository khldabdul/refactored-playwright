import { $ } from "playwright-elements";
import { test } from "@playwright/test";

export class PCFRegistrationPage {
  // Form fields
  readonly firstNameInput = $('input[name="firstName"], input[name="first_name"], [data-testid="first-name"]');
  readonly lastNameInput = $('input[name="lastName"], input[name="last_name"], [data-testid="last-name"]');
  readonly emailInput = $('input[name="email"], input[type="email"], [data-testid="email"]');
  readonly passwordInput = $('input[name="password"], input[type="password"], [data-testid="password"]');
  readonly confirmPasswordInput = $(
    'input[name="confirmPassword"], input[name="password_confirmation"], [data-testid="confirm-password"]'
  );
  readonly phoneInput = $('input[name="phone"], input[type="tel"], [data-testid="phone"]');
  readonly dateOfBirthInput = $('input[name="dateOfBirth"], input[type="date"], [data-testid="date-of-birth"]');
  readonly termsCheckbox = $('input[name="terms"], input[name="agree_to_terms"], [data-testid="terms"]');
  readonly newsletterCheckbox = $('input[name="newsletter"], [data-testid="newsletter"]');
  readonly submitButton = $('button[type="submit"], [data-testid="register-button"]');

  // Header component
  readonly header = $('.header, .navbar, [data-testid="header"]').with({
    logo: $('.header-logo, .navbar-brand, [data-testid="logo"]'),
    loginLink: $('a[href*="login"], [data-testid="login-link"]'),

    async navigateToLogin() {
      return await test.step("Navigate to login from header", async () => {
        await this.loginLink.click();
      });
    },
  });

  // Registration form component
  readonly registrationForm = $(
    'form[data-testid="registration-form"], .registration-form, form:has(input[name="firstName"])'
  ).with({
    errorMessage: $('.error, .error-message, [data-testid="error"]'),
    successMessage: $('.success, .success-message, [data-testid="success"]'),
    loadingSpinner: $('.loading, .spinner, [data-testid="loading"]'),

    async submit() {
      return await test.step("Submit registration form", async () => {
        await this.parent().submitButton.click();
      });
    },

    async expectError(message: string) {
      return await test.step(`Expect registration error: "${message}"`, async () => {
        await this.errorMessage.expect().toContainText(message);
      });
    },

    async expectSuccess(message: string) {
      return await test.step(`Expect registration success: "${message}"`, async () => {
        await this.successMessage.expect().toContainText(message);
      });
    },

    async waitForSubmission() {
      return await test.step("Wait for form submission to complete", async () => {
        await this.loadingSpinner.expect().not.toBeVisible();
      });
    },
  });

  async navigate() {
    return await test.step("Navigate to registration page", async () => {
      const { BrowserInstance } = await import("playwright-elements");
      await BrowserInstance.currentPage.goto("/register");
      await BrowserInstance.currentPage.waitForLoadState("networkidle");
    });
  }

  async fillRegistrationForm(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    acceptTerms?: boolean;
    subscribeNewsletter?: boolean;
  }) {
    return await test.step("Fill registration form with user data", async () => {
      await test.step("Fill first name", async () => {
        await this.firstNameInput.fill(userData.firstName);
      });

      await test.step("Fill last name", async () => {
        await this.lastNameInput.fill(userData.lastName);
      });

      await test.step("Fill email", async () => {
        await this.emailInput.fill(userData.email);
      });

      await test.step("Fill password", async () => {
        await this.passwordInput.fill(userData.password);
      });

      await test.step("Fill confirm password", async () => {
        await this.confirmPasswordInput.fill(userData.password);
      });

      if (userData.phone) {
        await test.step("Fill phone number", async () => {
          await this.phoneInput.fill(userData.phone!);
        });
      }

      if (userData.dateOfBirth) {
        await test.step("Fill date of birth", async () => {
          await this.dateOfBirthInput.fill(userData.dateOfBirth!);
        });
      }

      if (userData.acceptTerms !== false) {
        await test.step("Accept terms and conditions", async () => {
          await this.termsCheckbox.check();
        });
      }

      if (userData.subscribeNewsletter) {
        await test.step("Subscribe to newsletter", async () => {
          await this.newsletterCheckbox.check();
        });
      }
    });
  }

  async completeRegistration(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    acceptTerms?: boolean;
    subscribeNewsletter?: boolean;
  }) {
    return await test.step("Complete registration process", async () => {
      await this.fillRegistrationForm(userData);
      await this.registrationForm.submit();
      await this.registrationForm.waitForSubmission();
    });
  }

  async registerWithTestUser(
    user: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone?: string;
      dateOfBirth?: string;
    },
    options: { acceptTerms?: boolean; subscribeNewsletter?: boolean } = {}
  ) {
    return await test.step("Register with test user data", async () => {
      await this.completeRegistration({
        ...user,
        acceptTerms: options.acceptTerms !== false,
        subscribeNewsletter: options.subscribeNewsletter || false,
      });
    });
  }

  async navigateAndRegister(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    acceptTerms?: boolean;
    subscribeNewsletter?: boolean;
  }) {
    return await test.step("Navigate and register", async () => {
      await this.navigate();
      await this.completeRegistration(userData);
    });
  }

  // Verification methods
  async verifyPageElements() {
    return await test.step("Verify registration page elements", async () => {
      await this.firstNameInput.expect().toBeVisible();
      await this.lastNameInput.expect().toBeVisible();
      await this.emailInput.expect().toBeVisible();
      await this.passwordInput.expect().toBeVisible();
      await this.confirmPasswordInput.expect().toBeVisible();
      await this.termsCheckbox.expect().toBeVisible();
      await this.submitButton.expect().toBeVisible();
    });
  }

  async expectRegistrationSuccess() {
    return await test.step("Expect registration success", async () => {
      const { BrowserInstance } = await import("playwright-elements");
      await BrowserInstance.currentPage.waitForURL(/^(?!.*\/register).*$/);
    });
  }

  async expectRequiredFieldsError() {
    return await test.step("Expect validation error for required fields", async () => {
      await this.registrationForm.expectError("Please fill in all required fields");
    });
  }

  async expectPasswordMismatchError() {
    return await test.step("Expect password mismatch error", async () => {
      await this.registrationForm.expectError("Passwords do not match");
    });
  }

  async expectEmailExistsError() {
    return await test.step("Expect email already exists error", async () => {
      await this.registrationForm.expectError("Email already exists");
    });
  }

  async expectTermsError() {
    return await test.step("Expect terms acceptance error", async () => {
      await this.registrationForm.expectError("You must accept the terms and conditions");
    });
  }

  async expectRegistrationError(message: string) {
    return await test.step("Expect registration error", async () => {
      await this.registrationForm.expectError(message);
    });
  }
}
