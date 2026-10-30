import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addAdjustment = createAsyncThunk(
  "currencyAdjustments/addAdjustment",
  async (formData, { rejectWithValue }) => {
    try {
      // Mock calculation for gain/loss based on exchange rate
      const gainLoss = (Number(formData.exchangeRate) - 25.870544) * 1000; // Mock math
      
      const response = await mockApi({ 
        id: Date.now().toString(), 
        ...formData, 
        gainLoss: gainLoss,
        createdAt: new Date().toISOString()
      });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create adjustment");
    }
  }
);

export const deleteAdjustment = createAsyncThunk(
  "currencyAdjustments/deleteAdjustment",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete adjustment");
    }
  }
);

// Real Static Data
const initialState = {
  adjustments: [
    {
      id: "ca1",
      date: "2026-10-15",
      currency: "AED- UAE Dirham",
      exchangeRate: "25.870544",
      gainLoss: 1250.00,
      notes: "Quarterly revaluation of UAE Dirham holdings."
    },
    {
      id: "ca2",
      date: "2026-10-28",
      currency: "USD- US Dollar",
      exchangeRate: "83.250000",
      gainLoss: -450.50,
      notes: "Adjustment due to USD fluctuation against INR."
    }
  ],
  loading: false,
  error: null,
};

const currencyAdjustmentsSlice = createSlice({
  name: "currencyAdjustments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addAdjustment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addAdjustment.fulfilled, (state, action) => {
        state.loading = false;
        state.adjustments.push(action.payload);
      })
      .addCase(addAdjustment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAdjustment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteAdjustment.fulfilled, (state, action) => {
        state.loading = false;
        state.adjustments = state.adjustments.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAdjustment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default currencyAdjustmentsSlice.reducer;