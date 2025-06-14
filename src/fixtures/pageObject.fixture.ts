import { test as baseTest, buildPageObject, PageObject } from 'playwright-elements';
import { test as dataTest } from './testData.fixture';
import * as pageObjectModule from '@pages/index';

// Merge the data fixtures with playwright-elements base test
const test = baseTest.extend(dataTest.fixtures);

// Define the page object fixture type
type PageObjectFixtures = {
  pageObject: PageObject<typeof pageObjectModule>;
};

// Extend test with page object fixture
export const pageObjectTest = test.extend<PageObjectFixtures>({
  pageObject: [async ({}, use) => {
    await use(buildPageObject(pageObjectModule));
  }, { scope: 'test' }],
});

export { expect } from '@playwright/test';
export type { UserData, ProductData, PaymentData } from './testData.fixture';
