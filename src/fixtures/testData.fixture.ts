import { faker } from "@faker-js/faker";
import { test as baseTest } from "@playwright/test";
import { PaymentData, ProductData, UserData } from "../types/data.types";

// Import your new generator functions
import {
  generateTestPayment,
  generateTestProduct,
  generateTestUser,
} from "../data/testData.generator";

type TestFixtures = {
  testUser: UserData;
  testProduct: ProductData;
  testPayment: PaymentData;
  randomSeed: number;
};

export const test = baseTest.extend<TestFixtures>({
  randomSeed: async ({}, use) => {
    const seed = Date.now();
    faker.seed(seed);
    await use(seed);
  },

  testUser: async ({ randomSeed }, use) => {
    const user = generateTestUser();
    console.log(`Generated test user: ${user.email} (seed: ${randomSeed})`);
    await use(user);
  },

  testProduct: async ({ randomSeed }, use) => {
    const product = generateTestProduct();
    console.log(
      `Generated test product: ${product.name} (seed: ${randomSeed})`
    );
    await use(product);
  },

  testPayment: async ({ randomSeed }, use) => {
    const payment = generateTestPayment();
    console.log(`Generated test payment card (seed: ${randomSeed})`);
    await use(payment);
  },
});
