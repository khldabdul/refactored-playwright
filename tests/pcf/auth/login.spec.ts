import { expect, pageObjectTest as test } from "@fixtures/pageObject.fixture";

test.describe(
  "PCF - User Authentication",
  {
    tag: ["@pcf", "@auth", "@critical"],
  },
  () => {
    test(
      "Login with valid credentials",
      {
        tag: ["@smoke", "@p1"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pcfLogin.navigate();
        await pageObject.pcfLogin.login({
          email: testUser.email,
          password: testUser.password,
        });

        // Verify successful login
        await pageObject.pcfLogin.expectLoginSuccess();
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(
          /\/dashboard|\/home/
        );

        // Verify header shows user is logged in
        await pageObject.pcfLogin.header.verifyLoggedIn(testUser.firstName);
      }
    );

    test(
      "Login with invalid credentials",
      {
        tag: ["@smoke", "@p1", "@negative"],
      },
      async ({ pageObject }) => {
        await pageObject.pcfLogin.navigate();
        await pageObject.pcfLogin.quickLogin(
          "invalid@email.com",
          "wrongpassword"
        );

        // Should remain on login page with error
        await pageObject.pcfLogin.expectInvalidCredentials();
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(/\/login/);
      }
    );

    test(
      "Login with empty fields",
      {
        tag: ["@smoke", "@p2", "@negative"],
      },
      async ({ pageObject }) => {
        await pageObject.pcfLogin.navigate();
        await pageObject.pcfLogin.loginForm.submit();

        // Should show validation errors
        await pageObject.pcfLogin.expectEmptyFields();
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(/\/login/);
      }
    );

    test(
      "Remember me functionality",
      {
        tag: ["@regression", "@p2"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.pcfLogin.navigate();
        await pageObject.pcfLogin.loginWithTestUser(testUser, true); // rememberMe = true

        // Verify successful login
        await pageObject.pcfLogin.expectLoginSuccess();

        // Navigate away and come back
        const { BrowserInstance } = await import("playwright-elements");
        await BrowserInstance.currentPage.goto("/");
        await BrowserInstance.currentPage.reload();

        // Should still be logged in
        await pageObject.pcfLogin.header.verifyLoggedIn(testUser.firstName);
      }
    );

    test(
      "Forgot password flow",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject }) => {
        await pageObject.pcfLogin.navigate();
        await pageObject.pcfLogin.forgotPassword();

        // Should navigate to forgot password page
        const { BrowserInstance } = await import("playwright-elements");
        await expect(BrowserInstance.currentPage).toHaveURL(
          /\/forgot-password|\/reset/
        );
      }
    );

    test(
      "Verify login page elements",
      {
        tag: ["@smoke", "@p2"],
      },
      async ({ pageObject }) => {
        await pageObject.pcfLogin.navigate();
        await pageObject.pcfLogin.verifyPageElements();
      }
    );

    test(
      "Login form validation",
      {
        tag: ["@regression", "@p2", "@validation"],
      },
      async ({ pageObject }) => {
        await pageObject.pcfLogin.navigate();

        // Test email validation
        await pageObject.pcfLogin.emailInput.fill("invalid-email");
        await pageObject.pcfLogin.passwordInput.fill("password123");
        await pageObject.pcfLogin.loginForm.submit();

        await pageObject.pcfLogin.expectLoginError(
          "Please enter a valid email address"
        );
      }
    );

    test(
      "Header navigation from login page",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject }) => {
        await pageObject.pcfLogin.navigate();

        // Verify header elements are visible
        // await pageObject.pcfLogin.header.verifyLogoVisible();

        // Test search functionality if available
        await pageObject.pcfLogin.header.search("test");
      }
    );
  }
);
