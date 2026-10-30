import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialProfiles = [
  {
    id: "1",
    profileName: "Monthly Web Maintenance",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    orderNumber: "SO-1001",
    repeatEvery: "Month",
    startDate: "2026-11-01",
    endDate: "",
    neverExpires: true,
    paymentTerms: "Net 30",
    salesperson: "Fidha",
    subject: "Monthly Website Maintenance",
    status: "Active", // Active, Stopped, Expired
    currency: "INR",
    items: [
      { id: "i1", name: "Website Maintenance", description: "Monthly upkeep", qty: 1, rate: 1500, tax: 18 },
    ],
    notes: "Thanks for your business.",
    terms: "Payment due within 30 days.",
    discount: 0,
    discountType: "percentage",
    adjustment: 0,
    subtotal: 1500,
    taxTotal: 270,
    total: 1770,
    childInvoices: [
      { id: "inv-1", invoiceNumber: "INV-000002", date: "2026-11-01", amount: 1770, status: "Draft" }
    ]
  }
];

const recurringInvoicesSlice = createSlice({
  name: "recurringInvoices",
  initialState: {
    profiles: initialProfiles,
    loading: false,
    error: null,
  },
  reducers: {
    addProfile: {
      reducer: (state, action) => {
        state.profiles.unshift(action.payload);
      },
      prepare: (profileData) => ({
        payload: { ...profileData, id: nanoid() },
      }),
    },
    updateProfile: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.profiles.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.profiles[index] = { ...state.profiles[index], ...updatedData };
      }
    },
    deleteProfile: (state, action) => {
      state.profiles = state.profiles.filter((p) => p.id !== action.payload);
    },
    updateProfileStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.profiles.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.profiles[index].status = status;
      }
    }
  },
});

export const { addProfile, updateProfile, deleteProfile, updateProfileStatus } = recurringInvoicesSlice.actions;
export default recurringInvoicesSlice.reducer;