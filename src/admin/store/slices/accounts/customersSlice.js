import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialCustomers = [
  {
    id: "1",
    type: "Business",
    salutation: "Mr.",
    firstName: "John",
    lastName: "Doe",
    companyName: "Acme Corp",
    displayName: "Acme Corp",
    email: "john@acmecorp.com",
    workPhone: "+1 555-0100",
    mobile: "",
    language: "English",
    pan: "",
    currency: "USD",
    receivableAccount: "Accounts Receivable",
    openingBalance: 0,
    paymentTerms: "Due on Receipt",
    portalAccess: false,
    billingAddress: {
      attention: "John Doe",
      country: "United States",
      street1: "123 Main St",
      street2: "Suite 100",
      city: "New York",
      state: "NY",
      pinCode: "10001",
      phone: "+1 555-0100",
      fax: ""
    },
    shippingAddress: {
      attention: "John Doe",
      country: "United States",
      street1: "123 Main St",
      street2: "Suite 100",
      city: "New York",
      state: "NY",
      pinCode: "10001",
      phone: "+1 555-0100",
      fax: ""
    },
    contactPersons: []
  },
  {
    id: "2",
    type: "Individual",
    salutation: "Ms.",
    firstName: "Jane",
    lastName: "Smith",
    companyName: "",
    displayName: "Jane Smith",
    email: "jane.smith@example.com",
    workPhone: "",
    mobile: "+1 555-0200",
    language: "English",
    pan: "",
    currency: "USD",
    receivableAccount: "Accounts Receivable",
    openingBalance: 0,
    paymentTerms: "Net 30",
    portalAccess: true,
    billingAddress: {
      attention: "Jane Smith",
      country: "United States",
      street1: "456 Oak Ave",
      street2: "",
      city: "Los Angeles",
      state: "CA",
      pinCode: "90001",
      phone: "+1 555-0200",
      fax: ""
    },
    shippingAddress: {
      attention: "Jane Smith",
      country: "United States",
      street1: "456 Oak Ave",
      street2: "",
      city: "Los Angeles",
      state: "CA",
      pinCode: "90001",
      phone: "+1 555-0200",
      fax: ""
    },
    contactPersons: []
  }
];

const customersSlice = createSlice({
  name: "customers",
  initialState: {
    customers: initialCustomers,
    loading: false,
    error: null,
  },
  reducers: {
    addCustomer: {
      reducer: (state, action) => {
        state.customers.unshift(action.payload);
      },
      prepare: (customerData) => ({
        payload: { ...customerData, id: nanoid() },
      }),
    },
    updateCustomer: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.customers.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...updatedData };
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCustomer, updateCustomer, deleteCustomer } = customersSlice.actions;
export default customersSlice.reducer;