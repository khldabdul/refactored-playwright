import { $ } from "playwright-elements";
import { step } from "allure-js-commons";

export const HeaderComponent = $('.header, .navbar, [data-testid="header"]').with({
  logo: $('.header-logo, .navbar-brand, [data-testid="logo"]'),
  userMenu: $('.user-menu, .user-dropdown, [data-testid="user-menu"]').with({
    userAvatar: $('.user-avatar, [data-testid="user-avatar"]'),
    userName: $('.user-name, [data-testid="user-name"]'),
    profileLink: $('a[href*="profile"], [data-testid="profile-link"]'),
    settingsLink: $('a[href*="settings"], [data-testid="settings-link"]'),
    logoutButton: $('button:has-text("Logout"), [data-testid="logout-btn"]'),

    async openProfile() {
      return await step("Open user profile", async () => {
        await this.profileLink.click();
      });
    },

    async openSettings() {
      return await step("Open user settings", async () => {
        await this.settingsLink.click();
      });
    },

    async logout() {
      return await step("Logout user", async () => {
        await this.logoutButton.click();
      });
    },
  }),

  searchBar: $('input[data-testid="search"], .search-input, input[placeholder*="Search"]').with({
    searchButton: $('button[data-testid="search-btn"], .search-button'),
    clearButton: $('button[data-testid="clear-search"], .clear-search'),

    async search(term: string) {
      return await step(`Search for "${term}"`, async () => {
        await this.locator.fill(term);
        await this.locator.press("Enter");
      });
    },

    async clearSearch() {
      return await step("Clear search", async () => {
        await this.clearButton.click();
      });
    },
  }),

  navigationMenu: $('.nav-menu, .navigation, [data-testid="navigation"]').with({
    homeLink: $('a[href*="home"], a[href="/"], [data-testid="home-link"]'),
    dashboardLink: $('a[href*="dashboard"], [data-testid="dashboard-link"]'),
    reportsLink: $('a[href*="reports"], [data-testid="reports-link"]'),
    settingsLink: $('a[href*="settings"], [data-testid="settings-link"]'),

    async navigateToHome() {
      return await step("Navigate to home", async () => {
        await this.homeLink.click();
      });
    },

    async navigateToDashboard() {
      return await step("Navigate to dashboard", async () => {
        await this.dashboardLink.click();
      });
    },

    async navigateToReports() {
      return await step("Navigate to reports", async () => {
        await this.reportsLink.click();
      });
    },

    async navigateToSettings() {
      return await step("Navigate to settings", async () => {
        await this.settingsLink.click();
      });
    },
  }),

  loginButton: $('a[href*="login"], button:has-text("Login"), [data-testid="login-btn"]'),
  registerButton: $('a[href*="register"], button:has-text("Register"), [data-testid="register-btn"]'),

  notificationBell: $('.notification-bell, [data-testid="notifications"]').with({
    badge: $('.notification-badge, [data-testid="notification-badge"]'),
    dropdown: $('.notification-dropdown, [data-testid="notification-dropdown"]'),
    notificationItems: $('.notification-item, [data-testid="notification-item"]'),

    async getNotificationCount() {
      return await step("Get notification count", async () => {
        const badgeText = await this.badge.textContent();
        return badgeText ? parseInt(badgeText) : 0;
      });
    },

    async openNotifications() {
      return await step("Open notifications", async () => {
        await this.parent().locator.click();
        await this.dropdown.expect().toBeVisible();
      });
    },

    async markAllAsRead() {
      return await step("Mark all notifications as read", async () => {
        await this.openNotifications();
        const markAllButton = this.dropdown.locator('button:has-text("Mark all as read")');
        await markAllButton.click();
      });
    },
  }),

  // Header action methods
  async login() {
    return await step("Click login button in header", async () => {
      await this.loginButton.click();
    });
  },

  async register() {
    return await step("Click register button in header", async () => {
      await this.registerButton.click();
    });
  },

  // Verification methods
  async verifyLoggedIn(username: string) {
    return await step(`Verify user "${username}" is logged in`, async () => {
      await this.userMenu.expect().toBeVisible();
      await this.userMenu.userName.expect().toContainText(username);
    });
  },

  async verifyLoggedOut() {
    return await step("Verify user is logged out", async () => {
      await this.loginButton.expect().toBeVisible();
      await this.userMenu.expect().not.toBeVisible();
    });
  },

  async verifyLogoVisible() {
    return await step("Verify logo is visible", async () => {
      await this.logo.expect().toBeVisible();
    });
  },

  async verifyNavigationVisible() {
    return await step("Verify navigation menu is visible", async () => {
      await this.navigationMenu.expect().toBeVisible();
    });
  },

  async verifySearchBarVisible() {
    return await step("Verify search bar is visible", async () => {
      await this.searchBar.expect().toBeVisible();
    });
  },
});
