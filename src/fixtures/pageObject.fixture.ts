// src/fixtures/pageObject.fixture.ts

// 1. Import the test object from `testData.fixture`. It already contains your data fixtures.
import { test as baseDataTest } from "./testData.fixture";

// 2. Import helpers from playwright-elements
import { buildPageObject, PageObject } from "playwright-elements";

// 3. Import all your page object classes
import * as pageObjectModule from "@pages/index";

// 4. Define the type for the new fixture you are adding
type PageObjectFixtures = {
  pageObject: PageObject<typeof pageObjectModule>;
};

// 5. Extend the test runner that already has data fixtures with your new pageObject fixture
export const pageObjectTest = baseDataTest.extend<PageObjectFixtures>({
  pageObject: [
    async ({}, use) => {
      // buildPageObject from playwright-elements automatically handles the page instance
      await use(buildPageObject(pageObjectModule));
    },
    { scope: "test" },
  ],
});

// 6. Re-export 'expect' and your data types for convenience in test files
export { expect } from "@playwright/test";
export type { PaymentData, ProductData, UserData } from "./testData.fixture";
