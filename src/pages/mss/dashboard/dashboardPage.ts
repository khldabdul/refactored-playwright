import { $ } from 'playwright-elements';
import { test } from '@playwright/test';

export class MSSdashboardPage {
  // Main dashboard elements
  readonly pageTitle = $('h1, [data-testid="page-title"]');
  readonly welcomeMessage = $('.welcome-message, [data-testid="welcome"]');
  readonly loadingSpinner = $('.loading, .spinner, [data-testid="loading"]');

  // Navigation sidebar
  readonly sidebar = $('.sidebar, .nav-sidebar, [data-testid="sidebar"]')
    .with({
      dashboardLink: $('a[href*="dashboard"], [data-testid="dashboard-link"]'),
      reportsLink: $('a[href*="reports"], [data-testid="reports-link"]'),
      settingsLink: $('a[href*="settings"], [data-testid="settings-link"]'),
      usersLink: $('a[href*="users"], [data-testid="users-link"]'),
      
      async navigateToDashboard() {
        return await test.step('Navigate to dashboard', async () => {
          await this.dashboardLink.click();
        });
      },
      
      async navigateToReports() {
        return await test.step('Navigate to reports', async () => {
          await this.reportsLink.click();
        });
      },
      
      async navigateToSettings() {
        return await test.step('Navigate to settings', async () => {
          await this.settingsLink.click();
        });
      },
      
      async navigateToUsers() {
        return await test.step('Navigate to users', async () => {
          await this.usersLink.click();
        });
      }
    });

  // Dashboard widgets
  readonly widgets = $('.dashboard-widgets, [data-testid="widgets"]')
    .with({
      statsWidget: $('.stats-widget, [data-testid="stats-widget"]')
        .with({
          totalUsers: $('[data-testid="total-users"], .total-users'),
          totalRevenue: $('[data-testid="total-revenue"], .total-revenue'),
          activeProjects: $('[data-testid="active-projects"], .active-projects'),
          
          async getTotalUsers() {
            return await test.step('Get total users count', async () => {
              return await this.totalUsers.textContent();
            });
          },
          
          async getTotalRevenue() {
            return await test.step('Get total revenue', async () => {
              return await this.totalRevenue.textContent();
            });
          },
          
          async getActiveProjects() {
            return await test.step('Get active projects count', async () => {
              return await this.activeProjects.textContent();
            });
          }
        }),
      
      chartWidget: $('.chart-widget, [data-testid="chart-widget"]')
        .with({
          chartContainer: $('.chart-container, [data-testid="chart"]'),
          chartTitle: $('.chart-title, [data-testid="chart-title"]'),
          
          async verifyChartVisible() {
            return await test.step('Verify chart is visible', async () => {
              await this.chartContainer.expect().toBeVisible();
            });
          }
        }),
      
      recentActivityWidget: $('.activity-widget, [data-testid="recent-activity"]')
        .with({
          activityList: $('.activity-list, [data-testid="activity-list"]'),
          activityItems: $('.activity-item, [data-testid="activity-item"]'),
          
          async getActivityCount() {
            return await test.step('Get recent activity count', async () => {
              const items = await this.activityItems.getAll();
              return items.length;
            });
          },
          
          async getLatestActivity() {
            return await test.step('Get latest activity', async () => {
              return await this.activityItems.first().textContent();
            });
          }
        })
    });

  // Header component
  readonly header = $('.header, .navbar, [data-testid="header"]')
    .with({
      logo: $('.header-logo, .navbar-brand, [data-testid="logo"]'),
      userMenu: $('.user-menu, .user-dropdown, [data-testid="user-menu"]')
        .with({
          profileLink: $('a[href*="profile"], [data-testid="profile-link"]'),
          logoutButton: $('button:has-text("Logout"), [data-testid="logout"]'),
          
          async openProfile() {
            return await test.step('Open user profile', async () => {
              await this.profileLink.click();
            });
          },
          
          async logout() {
            return await test.step('Logout user', async () => {
              await this.logoutButton.click();
            });
          }
        }),
      
      notificationBell: $('.notification-bell, [data-testid="notifications"]')
        .with({
          badge: $('.notification-badge, [data-testid="notification-badge"]'),
          dropdown: $('.notification-dropdown, [data-testid="notification-dropdown"]'),
          
          async getNotificationCount() {
            return await test.step('Get notification count', async () => {
              return await this.badge.textContent();
            });
          },
          
          async openNotifications() {
            return await test.step('Open notifications', async () => {
              await this.locator.click();
              await this.dropdown.expect().toBeVisible();
            });
          }
        })
    });

  async navigate() {
    return await test.step('Navigate to MSS dashboard', async () => {
      const { BrowserInstance } = await import('playwright-elements');
      await BrowserInstance.currentPage.goto('/dashboard');
      await BrowserInstance.currentPage.waitForLoadState('networkidle');
    });
  }

  async waitForLoad() {
    return await test.step('Wait for dashboard to load', async () => {
      await this.loadingSpinner.expect().not.toBeVisible();
      await this.pageTitle.expect().toBeVisible();
    });
  }

  async verifyPageElements() {
    return await test.step('Verify dashboard page elements', async () => {
      await this.pageTitle.expect().toBeVisible();
      await this.sidebar.expect().toBeVisible();
      await this.widgets.expect().toBeVisible();
      await this.header.expect().toBeVisible();
    });
  }

  async verifyWelcomeMessage(userName: string) {
    return await test.step('Verify welcome message for user', async () => {
      await this.welcomeMessage.expect().toContainText(`Welcome, ${userName}`);
    });
  }

  async verifyUserLoggedIn(userName: string) {
    return await test.step('Verify user is logged in', async () => {
      await this.header.userMenu.expect().toContainText(userName);
    });
  }

  async getDashboardStats() {
    return await test.step('Get dashboard statistics', async () => {
      const stats = await test.step('Collect dashboard statistics', async () => {
        const totalUsers = await this.widgets.statsWidget.getTotalUsers();
        const totalRevenue = await this.widgets.statsWidget.getTotalRevenue();
        const activeProjects = await this.widgets.statsWidget.getActiveProjects();
        
        return {
          totalUsers,
          totalRevenue,
          activeProjects
        };
      });
      
      return stats;
    });
  }

  async verifyWidgetsLoaded() {
    return await test.step('Verify all widgets are loaded', async () => {
      await this.widgets.statsWidget.expect().toBeVisible();
      await this.widgets.chartWidget.expect().toBeVisible();
      await this.widgets.recentActivityWidget.expect().toBeVisible();
    });
  }

  async refreshDashboard() {
    return await test.step('Refresh dashboard data', async () => {
      const { BrowserInstance } = await import('playwright-elements');
      await BrowserInstance.currentPage.reload();
      await this.waitForLoad();
    });
  }
}
