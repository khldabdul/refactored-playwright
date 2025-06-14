import { test } from "@playwright/test";
import { $ } from "playwright-elements";

export class PcfLoginPage {
  // Element definitions using playwright-elements
  readonly emailInput = $('input[placeholder="Email"]');
  readonly passwordInput = $('input[placeholder="Password"]');
  readonly loginButton = $("button").hasText("Sign in");

  async navigate() {
    return await test.step("Navigate to login page", async () => {
      // We'll use the BrowserInstance from playwright-elements for navigation
      const { BrowserInstance } = await import("playwright-elements");
      await BrowserInstance.currentPage.goto("/login");
      await BrowserInstance.currentPage.waitForLoadState("networkidle");
    });
  }

  async login(credentials: { email: string; password: string }) {
    return await test.step("Login with credentials", async () => {
      await test.step("Fill email field", async () => {
        await this.emailInput.fill(credentials.email);
      });

      await test.step("Fill password field", async () => {
        await this.passwordInput.fill(credentials.password);
      });

      await this.loginButton.click();

      await test.step("Wait for login response", async () => {
        const { BrowserInstance } = await import("playwright-elements");
        await BrowserInstance.currentPage.waitForLoadState("networkidle");
      });
    });
  }
}
