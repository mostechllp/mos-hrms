import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock API call - replace with your actual API endpoint
const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addRecurringBill = createAsyncThunk(
  "recurringBills/addRecurringBill",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id: Date.now().toString(), ...formData });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create recurring bill");
    }
  }
);

export const updateRecurringBill = createAsyncThunk(
  "recurringBills/updateRecurringBill",
  async ({ id, ...formData }, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id, ...formData });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update recurring bill");
    }
  }
);

export const deleteRecurringBill = createAsyncThunk(
  "recurringBills/deleteRecurringBill",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete recurring bill");
    }
  }
);

const initialState = {
  recurringBills: [
    // Example seed data for testing (remove in production)
    {
      id: "1",
      profileName: "Sss",
      vendor: "LocalFix",
      repeatEvery: "Week",
      startOn: "2026-10-30",
      endsOn: "",
      neverExpires: true,
      accountsPayable: "Accounts Payable",
      paymentTerms: "Due on Receipt",
      items: [
        { id: "i1", name: "Service Fee", account: "Repairs", quantity: 1, rate: 3334, amount: 3334 }
      ],
      subTotal: 3334,
      total: 3334,
      notes: "",
      status: "Active",
      nextBillDate: "2026-11-06"
    }
  ],
  loading: false,
  error: null,
};

const recurringBillsSlice = createSlice({
  name: "recurringBills",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addRecurringBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addRecurringBill.fulfilled, (state, action) => {
        state.loading = false;
        state.recurringBills.push({ ...action.payload, status: "Active" });
      })
      .addCase(addRecurringBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateRecurringBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateRecurringBill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.recurringBills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.recurringBills[index] = action.payload;
      })
      .addCase(updateRecurringBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteRecurringBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteRecurringBill.fulfilled, (state, action) => {
        state.loading = false;
        state.recurringBills = state.recurringBills.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteRecurringBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recurringBillsSlice.reducer;