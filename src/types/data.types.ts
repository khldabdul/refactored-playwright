// This file is the single source of truth for your data structures.

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
