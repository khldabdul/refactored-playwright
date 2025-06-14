import { buildPageObject, expect, PageObject } from "playwright-elements";
// Import the test object from our data fixture file, which is now based on playwright-elements
import * as pageObjectModule from "@pages/index";
import { test as baseDataTest } from "./testData.fixture";

// Import and re-export types for convenience
import type { PaymentData, ProductData, UserData } from "../types/data.types";
export type { PaymentData, ProductData, UserData };

type PageObjectFixture = {
  pageObject: PageObject<typeof pageObjectModule>;
};

// Fix for Part 1: Export as 'pageObjectTest' to match what your spec files import.
export const pageObjectTest = baseDataTest.extend<PageObjectFixture>({
  pageObject: [
    async ({}, use) => {
      // We can now revert to the original call from your guide. Because the base runner
      // is from playwright-elements, it will handle the page context automatically.
      await use(buildPageObject(pageObjectModule) as any);
    },
    { scope: "test" },
  ],
});

// Re-export 'expect' from playwright-elements
export { expect };
