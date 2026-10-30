import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialVendors = [
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
    msmeRegistered: false,
    currency: "INR- Indian Rupee",
    payableAccount: "Accounts Payable",
    openingBalance: 0,
    paymentTerms: "Due on Receipt",
    tds: "",
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
    contactPersons: [],
    bankDetails: [],
    remarks: "",
    status: "Active"
  }
];

const vendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: initialVendors,
    loading: false,
    error: null,
  },
  reducers: {
    addVendor: {
      reducer: (state, action) => {
        state.vendors.unshift(action.payload);
      },
      prepare: (vendorData) => ({
        payload: { ...vendorData, id: nanoid() },
      }),
    },
    updateVendor: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.vendors.findIndex((v) => v.id === id);
      if (index !== -1) {
        state.vendors[index] = { ...state.vendors[index], ...updatedData };
      }
    },
    deleteVendor: (state, action) => {
      state.vendors = state.vendors.filter((v) => v.id !== action.payload);
    },
  },
});

export const { addVendor, updateVendor, deleteVendor } = vendorsSlice.actions;
export default vendorsSlice.reducer;