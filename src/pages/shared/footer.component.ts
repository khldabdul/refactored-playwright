import { $ } from "playwright-elements";
import { test } from "@playwright/test";

export const FooterComponent = $('.footer, [data-testid="footer"]').with({
  // Footer sections
  companyInfo: $('.company-info, [data-testid="company-info"]').with({
    logo: $('.footer-logo, [data-testid="footer-logo"]'),
    description: $('.company-description, [data-testid="company-description"]'),
    address: $('.company-address, [data-testid="company-address"]'),
    phone: $('.company-phone, [data-testid="company-phone"]'),
    email: $('.company-email, [data-testid="company-email"]'),
  }),

  quickLinks: $('.quick-links, [data-testid="quick-links"]').with({
    homeLink: $('a[href*="home"], a[href="/"]'),
    aboutLink: $('a[href*="about"]'),
    servicesLink: $('a[href*="services"]'),
    contactLink: $('a[href*="contact"]'),
    privacyLink: $('a[href*="privacy"]'),
    termsLink: $('a[href*="terms"]'),

    async navigateToHome() {
      return await test.step("Navigate to home from footer", async () => {
        await this.homeLink.click();
      });
    },

    async navigateToAbout() {
      return await test.step("Navigate to about from footer", async () => {
        await this.aboutLink.click();
      });
    },

    async navigateToServices() {
      return await test.step("Navigate to services from footer", async () => {
        await this.servicesLink.click();
      });
    },

    async navigateToContact() {
      return await test.step("Navigate to contact from footer", async () => {
        await this.contactLink.click();
      });
    },

    async openPrivacyPolicy() {
      return await test.step("Open privacy policy", async () => {
        await this.privacyLink.click();
      });
    },

    async openTermsOfService() {
      return await test.step("Open terms of service", async () => {
        await this.termsLink.click();
      });
    },
  }),

  socialMedia: $('.social-media, [data-testid="social-media"]').with({
    facebookLink: $('a[href*="facebook"], [data-testid="facebook"]'),
    twitterLink: $('a[href*="twitter"], [data-testid="twitter"]'),
    linkedinLink: $('a[href*="linkedin"], [data-testid="linkedin"]'),
    instagramLink: $('a[href*="instagram"], [data-testid="instagram"]'),
    youtubeLink: $('a[href*="youtube"], [data-testid="youtube"]'),

    async openFacebook() {
      return await test.step("Open Facebook page", async () => {
        await this.facebookLink.click();
      });
    },

    async openTwitter() {
      return await test.step("Open Twitter page", async () => {
        await this.twitterLink.click();
      });
    },

    async openLinkedIn() {
      return await test.step("Open LinkedIn page", async () => {
        await this.linkedinLink.click();
      });
    },

    async openInstagram() {
      return await test.step("Open Instagram page", async () => {
        await this.instagramLink.click();
      });
    },

    async openYoutube() {
      return await test.step("Open YouTube channel", async () => {
        await this.youtubeLink.click();
      });
    },
  }),

  newsletter: $('.newsletter, [data-testid="newsletter"]').with({
    emailInput: $('input[type="email"], [data-testid="newsletter-email"]'),
    subscribeButton: $('button[type="submit"], [data-testid="subscribe"]'),
    successMessage: $('.success, [data-testid="newsletter-success"]'),
    errorMessage: $('.error, [data-testid="newsletter-error"]'),

    async subscribe(email: string) {
      return await test.step(`Subscribe to newsletter with email: ${email}`, async () => {
        await this.emailInput.fill(email);
        await this.subscribeButton.click();
      });
    },

    async verifySubscriptionSuccess() {
      return await test.step("Verify newsletter subscription success", async () => {
        await this.successMessage.expect().toBeVisible();
      });
    },

    async verifySubscriptionError(message?: string) {
      return await test.step("Verify newsletter subscription error", async () => {
        await this.errorMessage.expect().toBeVisible();
        if (message) {
          await this.errorMessage.expect().toContainText(message);
        }
      });
    },
  }),

  copyright: $('.copyright, [data-testid="copyright"]'),
  languageSelector: $('.language-selector, [data-testid="language-selector"]').with({
    currentLanguage: $('.current-language, [data-testid="current-language"]'),
    languageDropdown: $('.language-dropdown, [data-testid="language-dropdown"]'),

    async changeLanguage(language: string) {
      return await test.step(`Change language to ${language}`, async () => {
        await this.parent().locator.click();
        await this.languageDropdown.expect().toBeVisible();
        await this.languageDropdown.locator(`[data-value="${language}"]`).click();
      });
    },

    async getCurrentLanguage() {
      return await test.step("Get current language", async () => {
        return await this.currentLanguage.textContent();
      });
    },
  }),

  // Footer verification methods
  async verifyFooterVisible() {
    return await test.step("Verify footer is visible", async () => {
      await this.locator.expect().toBeVisible();
    });
  },

  async verifyCompanyInfo() {
    return await test.step("Verify company information is present", async () => {
      await this.companyInfo.expect().toBeVisible();
      await this.companyInfo.logo.expect().toBeVisible();
    });
  },

  async verifyQuickLinks() {
    return await test.step("Verify quick links are present", async () => {
      await this.quickLinks.expect().toBeVisible();
      await this.quickLinks.homeLink.expect().toBeVisible();
    });
  },

  async verifySocialMedia() {
    return await test.step("Verify social media links are present", async () => {
      await this.socialMedia.expect().toBeVisible();
    });
  },

  async verifyNewsletter() {
    return await test.step("Verify newsletter signup is present", async () => {
      await this.newsletter.expect().toBeVisible();
      await this.newsletter.emailInput.expect().toBeVisible();
      await this.newsletter.subscribeButton.expect().toBeVisible();
    });
  },

  async verifyCopyright() {
    return await test.step("Verify copyright notice is present", async () => {
      await this.copyright.expect().toBeVisible();
      await this.copyright.expect().toContainText(new Date().getFullYear().toString());
    });
  },

  async verifyAllElements() {
    return await test.step("Verify all footer elements are present", async () => {
      await this.verifyFooterVisible();
      await this.verifyCompanyInfo();
      await this.verifyQuickLinks();
      await this.verifySocialMedia();
      await this.verifyNewsletter();
      await this.verifyCopyright();
    });
  },
});
