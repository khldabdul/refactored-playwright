import { expect, pageObjectTest as test } from "@fixtures/pageObject.fixture";

test.describe("PCF - User Authentication", { tag: ["@pcf", "@auth", "@critical"] }, () => {
  test("Login with valid credentials", { tag: ["@smoke", "@p1"] }, async ({ pageObject: page, testUser }) => {
    await page.pcfLogin.navigate();
    await page.pcfLogin.login({
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });

    // Verify successful login
    const { BrowserInstance } = await import("playwright-elements");
    await expect(BrowserInstance.currentPage).toHaveURL("/enrolment-dashboard");
  });
});
