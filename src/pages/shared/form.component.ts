import { $ } from 'playwright-elements';
import { step } from 'allure-js-commons';

export const FormComponent = (formSelector: string) => {
  return $(formSelector).with({
    // Form field helpers
    textField: (name: string) => $(`input[name="${name}"], textarea[name="${name}"]`),
    selectField: (name: string) => $(`select[name="${name}"]`),
    checkboxField: (name: string) => $(`input[name="${name}"][type="checkbox"]`),
    radioField: (name: string, value?: string) => {
      const selector = value 
        ? `input[name="${name}"][value="${value}"]`
        : `input[name="${name}"][type="radio"]`;
      return $(selector);
    },
    
    // Form action buttons
    submitButton: $('button[type="submit"], input[type="submit"], [data-testid="submit"]'),
    cancelButton: $('button[type="button"]:has-text("Cancel"), [data-testid="cancel"]'),
    resetButton: $('button[type="reset"], [data-testid="reset"]'),
    saveButton: $('button:has-text("Save"), [data-testid="save"]'),
    
    // Form state indicators
    errorMessage: $('.error, .error-message, [data-testid="error"]'),
    successMessage: $('.success, .success-message, [data-testid="success"]'),
    warningMessage: $('.warning, .warning-message, [data-testid="warning"]'),
    loadingSpinner: $('.loading, .spinner, [data-testid="loading"]'),
    
    // Field validation errors
    fieldErrors: $('.field-error, .invalid-feedback, [data-testid="field-error"]'),
    
    // Form actions
    async submit() {
      return await step('Submit form', async () => {
        await this.submitButton.click();
      });
    },
    
    async cancel() {
      return await step('Cancel form', async () => {
        await this.cancelButton.click();
      });
    },
    
    async reset() {
      return await step('Reset form', async () => {
        await this.resetButton.click();
      });
    },
    
    async save() {
      return await step('Save form', async () => {
        await this.saveButton.click();
      });
    },
    
    // Field manipulation methods
    async fillField(fieldName: string, value: string) {
      return await step(`Fill field "${fieldName}" with "${value}"`, async () => {
        const field = this.textField(fieldName);
        await field.fill(value);
      });
    },
    
    async selectOption(fieldName: string, value: string) {
      return await step(`Select "${value}" in field "${fieldName}"`, async () => {
        const select = this.selectField(fieldName);
        await select.selectOption(value);
      });
    },
    
    async checkBox(fieldName: string, checked: boolean = true) {
      return await step(`${checked ? 'Check' : 'Uncheck'} checkbox "${fieldName}"`, async () => {
        const checkbox = this.checkboxField(fieldName);
        await checkbox.setChecked(checked);
      });
    },
    
    async selectRadio(fieldName: string, value: string) {
      return await step(`Select radio option "${value}" for "${fieldName}"`, async () => {
        const radio = this.radioField(fieldName, value);
        await radio.check();
      });
    },
    
    async uploadFile(fieldName: string, filePath: string) {
      return await step(`Upload file "${filePath}" to field "${fieldName}"`, async () => {
        const fileInput = $(`input[name="${fieldName}"][type="file"]`);
        await fileInput.setInputFiles(filePath);
      });
    },
    
    // Bulk form filling
    async fillForm(data: Record<string, any>) {
      return await step('Fill form with provided data', async () => {
        for (const [fieldName, value] of Object.entries(data)) {
          if (value !== undefined && value !== null) {
            // Determine field type and fill accordingly
            const textField = this.textField(fieldName);
            const selectField = this.selectField(fieldName);
            const checkboxField = this.checkboxField(fieldName);
            
            // Check if it's a text field or textarea
            const textFieldCount = await textField.locator.count();
            if (textFieldCount > 0) {
              await this.fillField(fieldName, String(value));
              continue;
            }
            
            // Check if it's a select field
            const selectFieldCount = await selectField.locator.count();
            if (selectFieldCount > 0) {
              await this.selectOption(fieldName, String(value));
              continue;
            }
            
            // Check if it's a checkbox
            const checkboxFieldCount = await checkboxField.locator.count();
            if (checkboxFieldCount > 0) {
              await this.checkBox(fieldName, Boolean(value));
              continue;
            }
          }
        }
      });
    },
    
    // Validation and state methods
    async expectError(message?: string) {
      return await step('Expect form error', async () => {
        await this.errorMessage.expect().toBeVisible();
        if (message) {
          await this.errorMessage.expect().toContainText(message);
        }
      });
    },
    
    async expectSuccess(message?: string) {
      return await step('Expect form success', async () => {
        await this.successMessage.expect().toBeVisible();
        if (message) {
          await this.successMessage.expect().toContainText(message);
        }
      });
    },
    
    async expectWarning(message?: string) {
      return await step('Expect form warning', async () => {
        await this.warningMessage.expect().toBeVisible();
        if (message) {
          await this.warningMessage.expect().toContainText(message);
        }
      });
    },
    
    async expectFieldError(fieldName: string, message?: string) {
      return await step(`Expect field error for "${fieldName}"`, async () => {
        const fieldError = $(`[data-field="${fieldName}"] .field-error, .field-error[data-field="${fieldName}"], #${fieldName}-error`);
        await fieldError.expect().toBeVisible();
        if (message) {
          await fieldError.expect().toContainText(message);
        }
      });
    },
    
    async expectSubmitted() {
      return await step('Expect form is being submitted', async () => {
        await this.loadingSpinner.expect().toBeVisible();
      });
    },
    
    async waitForSubmission() {
      return await step('Wait for form submission to complete', async () => {
        await this.loadingSpinner.expect().not.toBeVisible();
      });
    },
    
    async verifyFormElements() {
      return await step('Verify form elements are present', async () => {
        await this.locator.expect().toBeVisible();
        await this.submitButton.expect().toBeVisible();
      });
    },
    
    async getFieldValue(fieldName: string) {
      return await step(`Get value of field "${fieldName}"`, async () => {
        const field = this.textField(fieldName);
        return await field.inputValue();
      });
    },
    
    async isFieldRequired(fieldName: string) {
      return await step(`Check if field "${fieldName}" is required`, async () => {
        const field = this.textField(fieldName);
        const required = await field.getAttribute('required');
        return required !== null;
      });
    },
    
    async isFieldDisabled(fieldName: string) {
      return await step(`Check if field "${fieldName}" is disabled`, async () => {
        const field = this.textField(fieldName);
        return await field.isDisabled();
      });
    },
    
    async clearField(fieldName: string) {
      return await step(`Clear field "${fieldName}"`, async () => {
        const field = this.textField(fieldName);
        await field.clear();
      });
    },
    
    async focusField(fieldName: string) {
      return await step(`Focus on field "${fieldName}"`, async () => {
        const field = this.textField(fieldName);
        await field.focus();
      });
    },
    
    // Form validation helper
    async validateRequiredFields(requiredFields: string[]) {
      return await step('Validate required fields', async () => {
        for (const fieldName of requiredFields) {
          const field = this.textField(fieldName);
          await field.expect().toBeVisible();
          
          const isRequired = await this.isFieldRequired(fieldName);
          if (!isRequired) {
            throw new Error(`Field "${fieldName}" is not marked as required`);
          }
        }
      });
    },
    
    // Submit form with validation
    async submitAndValidate(expectedResult: 'success' | 'error' | 'warning', message?: string) {
      return await step(`Submit form and expect ${expectedResult}`, async () => {
        await this.submit();
        await this.waitForSubmission();
        
        switch (expectedResult) {
          case 'success':
            await this.expectSuccess(message);
            break;
          case 'error':
            await this.expectError(message);
            break;
          case 'warning':
            await this.expectWarning(message);
            break;
        }
      });
    }
  });
};
