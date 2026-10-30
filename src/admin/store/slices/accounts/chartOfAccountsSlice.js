import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addAccount = createAsyncThunk(
  "chartOfAccounts/addAccount",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ 
        id: Date.now().toString(), 
        ...formData, 
        balance: 0, 
        transactions: [] 
      });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create account");
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "chartOfAccounts/deleteAccount",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete account");
    }
  }
);

// Real Static Data matching Image 1
const initialState = {
  accounts: [
    { id: "a1", name: "TDS Receivable", type: "Other Current Asset", code: "", parent: "", description: "", balance: 0 },
    { id: "a2", name: "Advance Tax", type: "Other Current Asset", code: "", parent: "", description: "", balance: 0 },
    { id: "a3", name: "Prepaid Expenses", type: "Other Current Asset", code: "", parent: "", description: "", balance: 0 },
    { id: "a4", name: "Employee Advance", type: "Other Current Asset", code: "", parent: "", description: "", balance: 0 },
    { id: "a5", name: "Petty Cash", type: "Cash", code: "", parent: "", description: "", balance: 0 },
    { id: "a6", name: "Undeposited Funds", type: "Cash", code: "", parent: "", description: "", balance: 0 },
    { id: "a7", name: "xdfsf", type: "Bank", code: "", parent: "", description: "", balance: 0 },
    { id: "a8", name: "Accounts Receivable", type: "Accounts Receivable", code: "", parent: "", description: "", balance: 0 },
    { id: "a9", name: "Furniture and Equipment", type: "Fixed Asset", code: "", parent: "", description: "", balance: 0 },
    { id: "a10", name: "TDS Payable", type: "Other Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a11", name: "Tax Payable", type: "Other Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a12", name: "Employee Reimbursements", type: "Other Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a13", name: "Opening Balance Adjustments", type: "Other Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a14", name: "Unearned Revenue", type: "Other Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a15", name: "Accounts Payable", type: "Accounts Payable", code: "", parent: "", description: "", balance: 0 },
    { id: "a16", name: "Mortgages", type: "Non Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a17", name: "Construction Loans", type: "Non Current Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a18", name: "Dimension Adjustments", type: "Other Liability", code: "", parent: "", description: "", balance: 0 },
    { id: "a19", name: "Owner's Equity", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a20", name: "Investments", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a21", name: "Distributions", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a22", name: "Capital Stock", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a23", name: "Dividends Paid", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a24", name: "Drawings", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a25", name: "Retained Earnings", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a26", name: "Opening Balance Offset", type: "Equity", code: "", parent: "", description: "", balance: 0 },
    { id: "a27", name: "Other Charges", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a28", name: "Shipping Charge", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a29", name: "Discount", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a30", name: "Late Fee Income", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a31", name: "Interest Income", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a32", name: "General Income", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a33", name: "Sales", type: "Income", code: "", parent: "", description: "", balance: 0 },
    { id: "a34", name: "Raw Materials And Consumables", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a35", name: "Merchandise", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a36", name: "Transportation Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a37", name: "Depreciation And Amortisation", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a38", name: "Office Supplies", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a39", name: "Advertising And Marketing", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a40", name: "Contract Assets", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a41", name: "Bank Fees and Charges", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a42", name: "Purchase Discounts", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a43", name: "Fuel/Mileage Expenses", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a44", name: "Janitorial Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a45", name: "IT and Internet Expenses", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a46", name: "Depreciation Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a47", name: "Consultant Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a48", name: "Repairs and Maintenance", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a49", name: "Meals and Entertainment", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a50", name: "Salaries and Employee Wages", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a51", name: "Credit Card Charges", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a52", name: "Printing and Stationery", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a53", name: "Other Expenses", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a54", name: "Lodging", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a55", name: "Bad Debt", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a56", name: "Automobile Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a57", name: "Telephone Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a58", name: "Uncategorized", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a59", name: "Travel Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a60", name: "Postage", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a61", name: "Rent Expense", type: "Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a62", name: "Materials", type: "Cost Of Goods Sold", code: "", parent: "", description: "", balance: 0 },
    { id: "a63", name: "Job Costing", type: "Cost Of Goods Sold", code: "", parent: "", description: "", balance: 0 },
    { id: "a64", name: "Subcontractor", type: "Cost Of Goods Sold", code: "", parent: "", description: "", balance: 0 },
    { id: "a65", name: "Labor", type: "Cost Of Goods Sold", code: "", parent: "", description: "", balance: 0 },
    { id: "a66", name: "Cost of Goods Sold", type: "Cost Of Goods Sold", code: "", parent: "", description: "", balance: 0 },
    { id: "a67", name: "Exchange Gain or Loss", type: "Other Expense", code: "", parent: "", description: "", balance: 0 },
    { id: "a68", name: "Inventory Asset", type: "Stock", code: "", parent: "", description: "", balance: 0 },
  ],
  loading: false,
  error: null,
};

const chartOfAccountsSlice = createSlice({
  name: "chartOfAccounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addAccount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
      })
      .addCase(addAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAccount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default chartOfAccountsSlice.reducer;