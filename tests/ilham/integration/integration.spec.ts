import { pageObjectTest as test, expect } from "@fixtures/pageObject.fixture";

test.describe(
  "Ilham - Integration Configuration",
  {
    tag: ["@ilham", "@integration", "@configuration"],
  },
  () => {
    test(
      "Setup basic API integration",
      {
        tag: ["@smoke", "@p1"],
      },
      async ({ pageObject, testUser }) => {
        await pageObject.IlhamIntegrationPage.navigate();
        await pageObject.IlhamIntegrationPage.verifyPageElements();

        // Setup integration configuration
        await pageObject.IlhamIntegrationPage.setupIntegration({
          api: {
            url: "https://api.example.com/v1",
            apiKey: "test-api-key-12345",
            apiSecret: "test-api-secret-67890",
            timeout: "30000",
          },
          auth: {
            type: "token",
            token: "bearer-token-abc123",
          },
          settings: {
            enabled: true,
            syncInterval: "1h",
            retryCount: "3",
          },
        });

        // Test and save
        await pageObject.IlhamIntegrationPage.testAndSaveIntegration();
        await pageObject.IlhamIntegrationPage.verifyIntegrationActive();
      }
    );

    test(
      "Setup basic auth integration",
      {
        tag: ["@regression", "@p2"],
      },
      async ({ pageObject }) => {
        await pageObject.IlhamIntegrationPage.navigate();

        // Setup with basic authentication
        await pageObject.IlhamIntegrationPage.setupIntegration({
          api: {
            url: "https://api.example.com/v2",
            apiKey: "basic-api-key",
            apiSecret: "basic-api-secret",
          },
          auth: {
            type: "basic",
            username: "testuser",
            password: "testpassword",
          },
          settings: {
            enabled: true,
            syncInterval: "30m",
            retryCount: "5",
          },
        });

        await pageObject.IlhamIntegrationPage.integrationForm.testConnection();
        await pageObject.IlhamIntegrationPage.verifyConnectionTest("success", "Connection successful");
      }
    );

    test(
      "Test invalid API configuration",
      {
        tag: ["@regression", "@p2", "@negative"],
      },
      async ({ pageObject }) => {
        await pageObject.IlhamIntegrationPage.navigate();

        // Setup invalid configuration
        await pageObject.IlhamIntegrationPage.setupIntegration({
          api: {
            url: "invalid-url",
            apiKey: "",
            apiSecret: "",
          },
          auth: {
            type: "token",
            token: "",
          },
          settings: {
            enabled: false,
          },
        });

        await pageObject.IlhamIntegrationPage.integrationForm.testConnection();
        await pageObject.IlhamIntegrationPage.verifyConnectionTest("failure", "Connection failed");
      }
    );

    test(
      "Manual sync integration",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject }) => {
        await pageObject.IlhamIntegrationPage.navigate();

        // Verify integration status
        const status = await pageObject.IlhamIntegrationPage.statusPanel.getStatus();
        console.log("Current integration status:", status);

        // Get last sync time
        const lastSync = await pageObject.IlhamIntegrationPage.statusPanel.getLastSyncTime();
        console.log("Last sync time:", lastSync);

        // Trigger manual sync
        await pageObject.IlhamIntegrationPage.statusPanel.triggerSync();
      }
    );

    test(
      "Reset integration configuration",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject }) => {
        await pageObject.IlhamIntegrationPage.navigate();

        // Fill some configuration
        await pageObject.IlhamIntegrationPage.integrationForm.apiSection.fillApiConfiguration({
          url: "https://api.test.com",
          apiKey: "test-key",
          apiSecret: "test-secret",
        });

        // Reset form
        await pageObject.IlhamIntegrationPage.integrationForm.reset();

        // Verify form is cleared (you'd need to add verification methods)
        // await pageObject.IlhamIntegrationPage.verifyFormCleared();
      }
    );

    test(
      "Cancel integration setup",
      {
        tag: ["@regression", "@p3"],
      },
      async ({ pageObject }) => {
        await pageObject.IlhamIntegrationPage.navigate();

        // Start filling form
        await pageObject.IlhamIntegrationPage.integrationForm.apiSection.fillApiConfiguration({
          url: "https://api.test.com",
          apiKey: "test-key",
          apiSecret: "test-secret",
        });

        // Cancel
        await pageObject.IlhamIntegrationPage.integrationForm.cancel();

        // Should navigate away or show confirmation
        const { BrowserInstance } = await import("playwright-elements");
        // Verify expected behavior after cancel
      }
    );
  }
);
