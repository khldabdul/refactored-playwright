import { faker } from "@faker-js/faker";
import { PaymentData, ProductData, UserData } from "../types/data.types";

export function generateTestUser(): UserData {
  const sex = faker.person.sexType();
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: faker.internet.password({
      length: 12,
      pattern: /[A-Za-z0-9!@#$%^&*]/,
    }),
    phone: faker.phone.number(),
    dateOfBirth: faker.date
      .birthdate({ min: 18, max: 65, mode: "age" })
      .toISOString()
      .split("T")[0],
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    },
    company: {
      name: faker.company.name(),
      department: faker.commerce.department(),
      jobTitle: faker.person.jobTitle(),
    },
  };
}

export function generateTestProduct(): ProductData {
  // ... all the faker logic for product
  return {
    /* ... product data ... */
  };
}

export function generateTestPayment(): PaymentData {
  // ... all the faker logic for payment
  return {
    /* ... payment data ... */
  };
}
