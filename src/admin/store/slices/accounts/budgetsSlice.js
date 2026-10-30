import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addBudget = createAsyncThunk(
  "budgets/addBudget",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ 
        id: Date.now().toString(), 
        ...formData, 
        createdAt: new Date().toISOString()
      });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create budget");
    }
  }
);

export const deleteBudget = createAsyncThunk(
  "budgets/deleteBudget",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete budget");
    }
  }
);

// Seed data to match Image 4
const months = [
  "APR 2026", "MAY 2026", "JUN 2026", "JUL 2026", "AUG 2026", "SEP 2026", 
  "OCT 2026", "NOV 2026", "DEC 2026", "JAN 2027", "FEB 2027", "MAR 2027"
];

const generateZeroMonthData = () => {
  const data = {};
  months.forEach(m => data[m] = 0);
  return data;
};

const initialState = {
  budgets: [
    {
      id: "b1",
      name: "SSSS",
      fiscalYear: "Apr 2026 - Mar 2027",
      period: "Monthly",
      incomeAccounts: ["Discount"],
      expenseAccounts: ["Cost Of Goods Sold", "Expense", "Other Expense"],
      includeBalanceSheet: false,
      budgetData: {
        income: {
          "Discount": generateZeroMonthData()
        },
        otherIncome: {},
        cogs: {
          "Cost Of Goods Sold": generateZeroMonthData()
        },
        expense: {
          "Expense": generateZeroMonthData()
        },
        otherExpense: {
          "Other Expense": generateZeroMonthData()
        }
      }
    }
  ],
  loading: false,
  error: null,
};

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addBudget.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.push(action.payload);
      })
      .addCase(addBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBudget.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default budgetsSlice.reducer;