import { test as baseTest } from '@playwright/test';
import { faker } from '@faker-js/faker';

export interface UserData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company: {
    name: string;
    department: string;
    jobTitle: string;
  };
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  brand: string;
  rating: number;
  inStock: boolean;
  tags: string[];
}

export interface PaymentData {
  cardNumber: string;
  cardType: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

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
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName();
    
    const user: UserData = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: faker.internet.password({ 
        length: 12, 
        memorable: true, 
        pattern: /[A-Za-z0-9!@#$%^&*]/ 
      }),
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      company: {
        name: faker.company.name(),
        department: faker.commerce.department(),
        jobTitle: faker.person.jobTitle()
      }
    };
    
    console.log(`Generated test user: ${user.email} (seed: ${randomSeed})`);
    await use(user);
  },
  
  testProduct: async ({ randomSeed }, use) => {
    const product: ProductData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      brand: faker.company.name(),
      rating: parseFloat(faker.number.float({ min: 1, max: 5, fractionDigits: 1 }).toFixed(1)),
      inStock: faker.datatype.boolean(),
      tags: faker.helpers.arrayElements([
        'bestseller', 'new', 'sale', 'premium', 'eco-friendly', 
        'limited-edition', 'trending', 'featured'
      ], { min: 1, max: 3 })
    };
    
    console.log(`Generated test product: ${product.name} - ${product.sku} (seed: ${randomSeed})`);
    await use(product);
  },

  testPayment: async ({ randomSeed }, use) => {
    const cardTypes = ['Visa', 'Mastercard', 'American Express'];
    const cardType = faker.helpers.arrayElement(cardTypes);
    
    const payment: PaymentData = {
      cardNumber: faker.finance.creditCardNumber(),
      cardType,
      expiryMonth: faker.date.future().getMonth().toString().padStart(2, '0'),
      expiryYear: faker.date.future().getFullYear().toString(),
      cvv: faker.finance.creditCardCVV(),
      cardHolderName: faker.person.fullName(),
      billingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      }
    };
    
    console.log(`Generated test payment: ${cardType} ending in ${payment.cardNumber.slice(-4)} (seed: ${randomSeed})`);
    await use(payment);
  }
});

export { expect } from '@playwright/test';