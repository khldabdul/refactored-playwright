import { $ } from 'playwright-elements';
import { test } from '@playwright/test';

export class IlhamIntegrationPage {
  // Page header elements
  readonly pageTitle = $('h1, [data-testid="page-title"]');
  readonly breadcrumb = $('.breadcrumb, [data-testid="breadcrumb"]');
  readonly helpButton = $('button:has-text("Help"), [data-testid="help"]');

  // Integration form
  readonly integrationForm = $('form[data-testid="integration-form"], .integration-form')
    .with({
      // API Configuration section
      apiSection: $('.api-section, [data-testid="api-section"]')
        .with({
          apiUrlInput: $('input[name="apiUrl"], [data-testid="api-url"]'),
          apiKeyInput: $('input[name="apiKey"], [data-testid="api-key"]'),
          apiSecretInput: $('input[name="apiSecret"], [data-testid="api-secret"]'),
          timeoutInput: $('input[name="timeout"], [data-testid="timeout"]'),
          
          async fillApiConfiguration(config: {
            url: string;
            apiKey: string;
            apiSecret: string;
            timeout?: string;
          }) {
            return await test.step('Fill API configuration', async () => {
              await this.apiUrlInput.fill(config.url);
              await this.apiKeyInput.fill(config.apiKey);
              await this.apiSecretInput.fill(config.apiSecret);
              if (config.timeout) {
                await this.timeoutInput.fill(config.timeout);
              }
            });
          }
        }),

      // Authentication section
      authSection: $('.auth-section, [data-testid="auth-section"]')
        .with({
          authTypeSelect: $('select[name="authType"], [data-testid="auth-type"]'),
          usernameInput: $('input[name="username"], [data-testid="username"]'),
          passwordInput: $('input[name="password"], [data-testid="password"]'),
          tokenInput: $('input[name="token"], [data-testid="token"]'),
          
          async selectAuthType(type: 'basic' | 'token' | 'oauth') {
            return await test.step(`Select authentication type: ${type}`, async () => {
              await this.authTypeSelect.selectOption(type);
            });
          },
          
          async fillBasicAuth(credentials: { username: string; password: string }) {
            return await test.step('Fill basic authentication', async () => {
              await this.usernameInput.fill(credentials.username);
              await this.passwordInput.fill(credentials.password);
            });
          },
          
          async fillTokenAuth(token: string) {
            return await test.step('Fill token authentication', async () => {
              await this.tokenInput.fill(token);
            });
          }
        }),

      // Settings section
      settingsSection: $('.settings-section, [data-testid="settings-section"]')
        .with({
          enabledCheckbox: $('input[name="enabled"], [data-testid="enabled"]'),
          syncIntervalSelect: $('select[name="syncInterval"], [data-testid="sync-interval"]'),
          retryCountInput: $('input[name="retryCount"], [data-testid="retry-count"]'),
          
          async enableIntegration(enabled: boolean = true) {
            return await test.step(`${enabled ? 'Enable' : 'Disable'} integration`, async () => {
              await this.enabledCheckbox.setChecked(enabled);
            });
          },
          
          async setSyncInterval(interval: string) {
            return await test.step(`Set sync interval to ${interval}`, async () => {
              await this.syncIntervalSelect.selectOption(interval);
            });
          },
          
          async setRetryCount(count: string) {
            return await test.step(`Set retry count to ${count}`, async () => {
              await this.retryCountInput.fill(count);
            });
          }
        }),

      // Form actions
      testConnectionButton: $('button:has-text("Test Connection"), [data-testid="test-connection"]'),
      saveButton: $('button[type="submit"], [data-testid="save"]'),
      cancelButton: $('button:has-text("Cancel"), [data-testid="cancel"]'),
      resetButton: $('button:has-text("Reset"), [data-testid="reset"]'),
      
      // Status messages
      successMessage: $('.success, .success-message, [data-testid="success"]'),
      errorMessage: $('.error, .error-message, [data-testid="error"]'),
      warningMessage: $('.warning, .warning-message, [data-testid="warning"]'),
      
      async testConnection() {
        return await test.step('Test API connection', async () => {
          await this.testConnectionButton.click();
          // Wait for response
          const { BrowserInstance } = await import('playwright-elements');
          await BrowserInstance.currentPage.waitForTimeout(2000);
        });
      },
      
      async save() {
        return await test.step('Save integration configuration', async () => {
          await this.saveButton.click();
        });
      },
      
      async cancel() {
        return await test.step('Cancel integration setup', async () => {
          await this.cancelButton.click();
        });
      },
      
      async reset() {
        return await test.step('Reset form to defaults', async () => {
          await this.resetButton.click();
        });
      },
      
      async expectSuccess(message?: string) {
        return await test.step('Expect success message', async () => {
          await this.successMessage.expect().toBeVisible();
          if (message) {
            await this.successMessage.expect().toContainText(message);
          }
        });
      },
      
      async expectError(message?: string) {
        return await test.step('Expect error message', async () => {
          await this.errorMessage.expect().toBeVisible();
          if (message) {
            await this.errorMessage.expect().toContainText(message);
          }
        });
      }
    });

  // Integration status panel
  readonly statusPanel = $('.status-panel, [data-testid="status-panel"]')
    .with({
      statusIndicator: $('.status-indicator, [data-testid="status"]'),
      lastSyncTime: $('.last-sync, [data-testid="last-sync"]'),
      syncButton: $('button:has-text("Sync Now"), [data-testid="sync-now"]'),
      
      async getStatus() {
        return await test.step('Get integration status', async () => {
          return await this.statusIndicator.textContent();
        });
      },
      
      async getLastSyncTime() {
        return await test.step('Get last sync time', async () => {
          return await this.lastSyncTime.textContent();
        });
      },
      
      async triggerSync() {
        return await test.step('Trigger manual sync', async () => {
          await this.syncButton.click();
        });
      }
    });

  async navigate() {
    return await test.step('Navigate to integration page', async () => {
      const { BrowserInstance } = await import('playwright-elements');
      await BrowserInstance.currentPage.goto('/integrations');
      await BrowserInstance.currentPage.waitForLoadState('networkidle');
    });
  }

  async setupIntegration(config: {
    api: {
      url: string;
      apiKey: string;
      apiSecret: string;
      timeout?: string;
    };
    auth: {
      type: 'basic' | 'token' | 'oauth';
      username?: string;
      password?: string;
      token?: string;
    };
    settings: {
      enabled?: boolean;
      syncInterval?: string;
      retryCount?: string;
    };
  }) {
    return await test.step('Setup complete integration configuration', async () => {
      // Fill API configuration
      await this.integrationForm.apiSection.fillApiConfiguration(config.api);
      
      // Setup authentication
      await this.integrationForm.authSection.selectAuthType(config.auth.type);
      
      if (config.auth.type === 'basic' && config.auth.username && config.auth.password) {
        await this.integrationForm.authSection.fillBasicAuth({
          username: config.auth.username,
          password: config.auth.password
        });
      } else if (config.auth.type === 'token' && config.auth.token) {
        await this.integrationForm.authSection.fillTokenAuth(config.auth.token);
      }
      
      // Configure settings
      if (config.settings.enabled !== undefined) {
        await this.integrationForm.settingsSection.enableIntegration(config.settings.enabled);
      }
      
      if (config.settings.syncInterval) {
        await this.integrationForm.settingsSection.setSyncInterval(config.settings.syncInterval);
      }
      
      if (config.settings.retryCount) {
        await this.integrationForm.settingsSection.setRetryCount(config.settings.retryCount);
      }
    });
  }

  async testAndSaveIntegration() {
    return await test.step('Test and save integration', async () => {
      await this.integrationForm.testConnection();
      await this.integrationForm.expectSuccess('Connection successful');
      await this.integrationForm.save();
      await this.integrationForm.expectSuccess('Integration saved successfully');
    });
  }

  async verifyPageElements() {
    return await test.step('Verify integration page elements', async () => {
      await this.pageTitle.expect().toBeVisible();
      await this.integrationForm.expect().toBeVisible();
      await this.statusPanel.expect().toBeVisible();
    });
  }

  async verifyIntegrationActive() {
    return await test.step('Verify integration is active', async () => {
      const status = await this.statusPanel.getStatus();
      if (!status?.includes('Active')) {
        throw new Error(`Expected integration to be active, but status is: ${status}`);
      }
    });
  }

  async verifyConnectionTest(expectedResult: 'success' | 'failure', message?: string) {
    return await test.step('Verify connection test results', async () => {
      if (expectedResult === 'success') {
        await this.integrationForm.expectSuccess(message);
      } else {
        await this.integrationForm.expectError(message);
      }
    });
  }
}
