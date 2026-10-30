import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialProfiles = [
  {
    id: "1",
    profileName: "Monthly Office Rent",
    expenseAccount: "Rent Expense",
    amount: 15000,
    paidThrough: "Bank Account",
    repeatEvery: "Month",
    startDate: "2026-11-01",
    endDate: "",
    neverExpires: true,
    vendor: "Property Management LLC",
    notes: "Office rent for the month.",
    customerName: "",
    status: "Active", // Active, Stopped
    currency: "INR",
    childExpenses: [
      { id: "exp-1", date: "2026-11-01", expenseAccount: "Rent Expense", status: "Non-Billable", paidThrough: "Bank Account", amount: 15000 }
    ]
  }
];

const recurringExpensesSlice = createSlice({
  name: "recurringExpenses",
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

export const { addProfile, updateProfile, deleteProfile, updateProfileStatus } = recurringExpensesSlice.actions;
export default recurringExpensesSlice.reducer;