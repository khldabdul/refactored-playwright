import { pageObjectTest as test, expect } from '@fixtures/pageObject.fixture';

test.describe('MSS - Dashboard Functionality', { 
  tag: ['@mss', '@dashboard', '@critical'] 
}, () => {
  
  test('View dashboard with all widgets', { 
    tag: ['@smoke', '@p1'] 
  }, async ({ pageObject, testUser }) => {
    // Login first (assuming we have authentication)
    await pageObject.PCFLoginPage.navigate();
    await pageObject.PCFLoginPage.loginWithTestUser(testUser);
    
    // Navigate to MSS dashboard
    await pageObject.MSSdashboardPage.navigate();
    await pageObject.MSSdashboardPage.waitForLoad();
    
    // Verify all elements are present
    await pageObject.MSSdashboardPage.verifyPageElements();
    await pageObject.MSSdashboardPage.verifyUserLoggedIn(testUser.firstName);
    await pageObject.MSSdashboardPage.verifyWidgetsLoaded();
  });
  
  test('Navigate between dashboard sections', { 
    tag: ['@regression', '@p2'] 
  }, async ({ pageObject, testUser }) => {
    await pageObject.MSSdashboardPage.navigate();
    await pageObject.MSSdashboardPage.waitForLoad();
    
    // Test sidebar navigation
    await pageObject.MSSdashboardPage.sidebar.navigateToReports();
    const { BrowserInstance } = await import('playwright-elements');
    await expect(BrowserInstance.currentPage).toHaveURL(/\/reports/);
    
    await pageObject.MSSdashboardPage.sidebar.navigateToSettings();
    await expect(BrowserInstance.currentPage).toHaveURL(/\/settings/);
    
    await pageObject.MSSdashboardPage.sidebar.navigateToDashboard();
    await expect(BrowserInstance.currentPage).toHaveURL(/\/dashboard/);
  });
  
  test('Collect dashboard statistics', { 
    tag: ['@regression', '@p2'] 
  }, async ({ pageObject }) => {
    await pageObject.MSSdashboardPage.navigate();
    await pageObject.MSSdashboardPage.waitForLoad();
    
    // Get dashboard stats
    const stats = await pageObject.MSSdashboardPage.getDashboardStats();
    
    // Verify stats are present and valid
    expect(stats.totalUsers).toBeDefined();
    expect(stats.totalRevenue).toBeDefined();
    expect(stats.activeProjects).toBeDefined();
    
    console.log('Dashboard Stats:', stats);
  });
  
  test('Interact with notifications', { 
    tag: ['@regression', '@p3'] 
  }, async ({ pageObject }) => {
    await pageObject.MSSdashboardPage.navigate();
    await pageObject.MSSdashboardPage.waitForLoad();
    
    // Check notification count
    const notificationCount = await pageObject.MSSdashboardPage.header.notificationBell.getNotificationCount();
    console.log('Notification count:', notificationCount);
    
    // Open notifications if there are any
    if (notificationCount > 0) {
      await pageObject.MSSdashboardPage.header.notificationBell.openNotifications();
    }
  });
});