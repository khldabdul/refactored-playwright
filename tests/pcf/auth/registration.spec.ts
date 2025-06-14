import { expect, pageObjectTest as test } from "@fixtures/pageObject.fixture";

test.describe(
  "PCF - User Registration",
  {
    tag: ["@pcf", "@auth", "@registration"],
  },
  () => {
    test(
      "Register with valid user data",
      {
        tag: ["@smoke", "@p1"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.registerWithTestUser(testUser);

        // Verify successful registration
        await pageObject.pCFRegistration.expectRegistrationSuccess();
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(/\/dashboard|\/home|\/login/);
      }
    );

    test(
      "Register with complete user data including optional fields",
      {
        tag: ["@regression", "@p1"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.registerWithTestUser(testUser, {
          acceptTerms: true,
          subscribeNewsletter: true,
        });

        // Verify successful registration
        await pageObject.pCFRegistration.expectRegistrationSuccess();
      }
    );

    test(
      "Register with missing required fields",
      {
        tag: ["@smoke", "@p2", "@negative"],
      },
      async ({ pageObject }) => {
        await pageObject.pCFRegistration.navigate();

        // Try to submit form without filling required fields
        await pageObject.pCFRegistration.registrationForm.submit();

        // Should show validation errors
        await pageObject.pCFRegistration.expectRequiredFieldsError();
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(/\/register/);
      }
    );

    test(
      "Register with mismatched passwords",
      {
        tag: ["@smoke", "@p2", "@negative"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();

        // Fill form with mismatched passwords
        await pageObject.pCFRegistration.fillRegistrationForm({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          password: testUser.password,
        });

        // Fill different password in confirm field
        await pageObject.pCFRegistration.confirmPasswordInput.fill("different-password");
        await pageObject.pCFRegistration.registrationForm.submit();

        // Should show password mismatch error
        await pageObject.pCFRegistration.expectPasswordMismatchError();
      }
    );

    test(
      "Register without accepting terms",
      {
        tag: ["@regression", "@p2", "@negative"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.fillRegistrationForm({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          password: testUser.password,
          acceptTerms: false, // Explicitly don't accept terms
        });

        await pageObject.pCFRegistration.registrationForm.submit();

        // Should show terms acceptance error
        await pageObject.pCFRegistration.expectTermsError();
      }
    );

    test(
      "Register with existing email",
      {
        tag: ["@regression", "@p2", "@negative"],
      },
      async ({ pageObject, testUser }) => {
        // First registration
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.registerWithTestUser(testUser);
        await pageObject.pCFRegistration.expectRegistrationSuccess();

        // Try to register again with same email
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.registerWithTestUser({
          ...testUser,
          firstName: "Different",
          lastName: "User",
        });

        // Should show email exists error
        await pageObject.pCFRegistration.expectEmailExistsError();
      }
    );

    test(
      "Verify registration page elements",
      {
        tag: ["@smoke", "@p2"],
      },
      async ({ pageObject }) => {
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.verifyPageElements();
      }
    );

    test(
      "Navigate to login from registration page",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject }) => {
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.header.navigateToLogin();

        // Should navigate to login page
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(/\/login/);
      }
    );

    test(
      "Registration form validation - email format",
      {
        tag: ["@regression", "@p2", "@validation"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();

        // Fill form with invalid email format
        await pageObject.pCFRegistration.fillRegistrationForm({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: "invalid-email-format",
          password: testUser.password,
        });

        await pageObject.pCFRegistration.registrationForm.submit();

        // Should show email format error
        await pageObject.pCFRegistration.expectRegistrationError("Please enter a valid email address");
      }
    );

    test(
      "Registration form validation - password strength",
      {
        tag: ["@regression", "@p2", "@validation"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();

        // Fill form with weak password
        await pageObject.pCFRegistration.fillRegistrationForm({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          password: "123", // Weak password
        });

        await pageObject.pCFRegistration.registrationForm.submit();

        // Should show password strength error
        await pageObject.pCFRegistration.expectRegistrationError("Password must be at least 8 characters long");
      }
    );

    test(
      "Newsletter subscription during registration",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pCFRegistration.navigate();
        await pageObject.pCFRegistration.registerWithTestUser(testUser, {
          subscribeNewsletter: true,
        });

        await pageObject.pCFRegistration.expectRegistrationSuccess();

        // Could verify newsletter subscription confirmation if implemented
        // await pageObject.pCFRegistration.expectNewsletterConfirmation();
      }
    );
  }
);
