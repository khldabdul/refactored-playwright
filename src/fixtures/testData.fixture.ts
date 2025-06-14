import { generateTestPayment, generateTestProduct, generateTestUser } from "@data/testData.generator";
import { faker } from "@faker-js/faker";
import { test as baseTest } from "playwright-elements";
import type { PaymentData, ProductData, UserData } from "../types/data.types";

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
  testUser: async ({}, use) => {
    await use(generateTestUser());
  },
  testProduct: async ({}, use) => {
    await use(generateTestProduct());
  },
  testPayment: async ({}, use) => {
    await use(generateTestPayment());
  },
});
