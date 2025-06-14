import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

async function globalSetup(config: FullConfig) {
  // Load environment variables
  const project = process.env.PROJECT || 'pcf';
  const environment = process.env.ENV || 'dev';
  
  dotenv.config({ 
    path: path.join(__dirname, '..', 'config', `.env.${project}.${environment}`) 
  });

  console.log(`🚀 Global Setup - Project: ${project.toUpperCase()}, Environment: ${environment.toUpperCase()}`);
  
  // Create results directories
  const fs = require('fs');
  const dirs = ['allure-results', 'test-results', 'playwright-report'];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Optional: Pre-authenticate and save auth state
  if (process.env.PRE_AUTHENTICATE === 'true') {
    console.log('🔐 Pre-authenticating for faster test execution...');
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      // Navigate to login page
      await page.goto(process.env.BASE_URL + '/login');
      
      // Perform login with test credentials
      await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || '');
      await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || '');
      await page.click('button[type="submit"]');
      
      // Wait for successful login
      await page.waitForURL(/dashboard|home/);
      
      // Save authentication state
      await page.context().storageState({ path: 'auth-state.json' });
      
      console.log('✅ Authentication state saved');
    } catch (error) {
      console.warn('⚠️  Pre-authentication failed:', error);
    } finally {
      await browser.close();
    }
  }
  
  console.log('✅ Global setup completed');
}

export default globalSetup;