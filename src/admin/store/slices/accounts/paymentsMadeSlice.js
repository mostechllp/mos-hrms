import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock API call - replace with your actual API endpoint
const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addPayment = createAsyncThunk(
  "paymentsMade/addPayment",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id: Date.now().toString(), ...formData, status: "Draft" });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create payment");
    }
  }
);

export const updatePayment = createAsyncThunk(
  "paymentsMade/updatePayment",
  async ({ id, ...formData }, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id, ...formData });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update payment");
    }
  }
);

export const deletePayment = createAsyncThunk(
  "paymentsMade/deletePayment",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete payment");
    }
  }
);

export const markPaymentAsPaid = createAsyncThunk(
  "paymentsMade/markPaymentAsPaid",
  async (id, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id, status: "Paid" });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to mark as paid");
    }
  }
);

const initialState = {
  payments: [
    // Seed data for preview/testing
    {
      id: "1",
      paymentNumber: "1",
      vendor: "LocalFix",
      amount: 3334,
      date: "2026-10-30",
      paymentMode: "Cash",
      paidThrough: "Petty Cash",
      reference: "",
      notes: "",
      status: "Draft",
      type: "Bill Payment",
      appliedBills: [
        { billNumber: "sss(30 Oct 2026)", billDate: "2026-10-30", billAmount: 3334, paymentAmount: 3334 }
      ]
    }
  ],
  loading: false,
  error: null,
};

const paymentsMadeSlice = createSlice({
  name: "paymentsMade",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addPayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updatePayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.payments[index] = action.payload;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deletePayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Paid
      .addCase(markPaymentAsPaid.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index].status = "Paid";
        }
      })
      .addCase(markPaymentAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paymentsMadeSlice.reducer;