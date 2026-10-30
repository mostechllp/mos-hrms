import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addBankAccount = createAsyncThunk(
  "banking/addBankAccount",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id: Date.now().toString(), ...formData, balance: 0 });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to add account");
    }
  }
);

// Add Delete Thunk
export const deleteBankAccount = createAsyncThunk(
  "banking/deleteBankAccount",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete account");
    }
  }
);

// Real Static Data for the Dashboard view
const initialState = {
  accounts: [
    { id: "acc1", name: "Petty Cash", type: "Cash", accountCode: "PC-001", amountInBank: 0, amountInBooks: 0 },
    { id: "acc2", name: "Undeposited Funds", type: "Other Current Asset", accountCode: "UF-001", amountInBank: 0, amountInBooks: -888 },
    { id: "acc3", name: "xdfsf", type: "Bank", accountCode: "B-001", amountInBank: 0, amountInBooks: 0 }
  ],
  loading: false,
  error: null,
};

const bankingSlice = createSlice({
  name: "banking",
  initialState,
  reducers: {
    clearAccounts: (state) => {
      state.accounts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addBankAccount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteBankAccount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
      })
      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAccounts } = bankingSlice.actions;
export default bankingSlice.reducer;