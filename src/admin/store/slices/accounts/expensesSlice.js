import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialExpenses = [
  {
    id: "1",
    date: "2026-10-29",
    expenseAccount: "Job Costing",
    amount: 666,
    paidThrough: "Undeposited Funds",
    vendor: "",
    invoiceNumber: "",
    notes: "",
    customerName: "",
    isBillable: false,
    currency: "INR",
    status: "Paid" // Draft, Paid
  }
];

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: initialExpenses,
    loading: false,
    error: null,
  },
  reducers: {
    addExpense: {
      reducer: (state, action) => {
        state.expenses.unshift(action.payload);
      },
      prepare: (expenseData) => ({
        payload: { ...expenseData, id: nanoid() },
      }),
    },
    updateExpense: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.expenses.findIndex((e) => e.id === id);
      if (index !== -1) {
        state.expenses[index] = { ...state.expenses[index], ...updatedData };
      }
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
  },
});

export const { addExpense, updateExpense, deleteExpense } = expensesSlice.actions;
export default expensesSlice.reducer;