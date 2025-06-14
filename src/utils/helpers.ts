import { Page } from '@playwright/test';

/**
 * Wait for page to be fully loaded including all network requests
 */
export async function waitForPageLoad(page: Page, timeout: number = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Scroll element into view if needed
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForElementStable(page: Page, selector: string, timeout: number = 5000) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });
  
  // Wait for element to stop moving
  let previousBox = await locator.boundingBox();
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    const currentBox = await locator.boundingBox();
    
    if (previousBox && currentBox && 
        previousBox.x === currentBox.x && 
        previousBox.y === currentBox.y) {
      return;
    }
    previousBox = currentBox;
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string = 'screenshot') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date for form inputs
 */
export function formatDate(date: Date, format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'YYYY-MM-DD'): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>, 
  maxAttempts: number = 3, 
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Environment-specific utilities
 */
export const env = {
  isDev: () => process.env.ENV === 'dev',
  isStaging: () => process.env.ENV === 'staging',
  isUAT: () => process.env.ENV === 'uat',
  isJIT: () => process.env.ENV === 'jit',
  
  getProject: () => process.env.PROJECT || 'pcf',
  getEnvironment: () => process.env.ENV || 'dev',
  getBaseUrl: () => process.env.BASE_URL || 'http://localhost:3000',
  getApiUrl: () => process.env.API_URL || 'http://localhost:3001/api',
  
  getTimeout: (type: 'navigation' | 'action' | 'expect') => {
    const timeouts = {
      navigation: parseInt(process.env.TIMEOUT_NAVIGATION || '30000'),
      action: parseInt(process.env.TIMEOUT_ACTION || '15000'),
      expect: parseInt(process.env.TIMEOUT_EXPECT || '10000')
    };
    return timeouts[type];
  }
};

/**
 * Console logging with colors and timestamps
 */
export const logger = {
  info: (message: string) => console.log(`ℹ️  [${new Date().toISOString()}] ${message}`),
  success: (message: string) => console.log(`✅ [${new Date().toISOString()}] ${message}`),
  warning: (message: string) => console.log(`⚠️  [${new Date().toISOString()}] ${message}`),
  error: (message: string) => console.log(`❌ [${new Date().toISOString()}] ${message}`),
  debug: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.log(`🐛 [${new Date().toISOString()}] ${message}`);
    }
  }
};