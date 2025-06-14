// Change this line to import from 'playwright-elements'
import { test as baseTest } from "playwright-elements";

import { faker } from "@faker-js/faker";

// Assuming you have moved types to src/types/data.types.ts
import type { PaymentData, ProductData, UserData } from "../types/data.types";

// The rest of the file remains the same...
type TestFixtures = {
  testUser: UserData;
  testProduct: ProductData;
  testPayment: PaymentData;
  randomSeed: number;
};

// This now extends the test from playwright-elements
export const test = baseTest.extend<TestFixtures>({
  randomSeed: async ({}, use) => {
    const seed = Date.now();
    faker.seed(seed);
    await use(seed);
  },
  //... other data fixtures
});
