import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addVendorCredit = createAsyncThunk(
  "vendorCredits/addVendorCredit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id: Date.now().toString(), ...formData, status: "Draft" });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create vendor credit");
    }
  }
);

export const updateVendorCredit = createAsyncThunk(
  "vendorCredits/updateVendorCredit",
  async ({ id, ...formData }, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id, ...formData });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update vendor credit");
    }
  }
);

export const deleteVendorCredit = createAsyncThunk(
  "vendorCredits/deleteVendorCredit",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete vendor credit");
    }
  }
);

const initialState = {
  vendorCredits: [
    // Seed data for testing (remove in production)
    {
      id: "1",
      creditNoteNumber: "ddddddd",
      vendor: "LocalFix",
      date: "2026-10-30",
      orderNumber: "",
      subject: "",
      accountsPayable: "Accounts Payable",
      items: [
        { id: "i1", name: "wrww", description: "fvfdv", account: "Repairs", quantity: 1, rate: 3334, amount: 3334 }
      ],
      subTotal: 3334,
      total: 3334,
      status: "Draft",
      notes: ""
    }
  ],
  loading: false,
  error: null,
};

const vendorCreditsSlice = createSlice({
  name: "vendorCredits",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addVendorCredit.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addVendorCredit.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorCredits.push(action.payload);
      })
      .addCase(addVendorCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVendorCredit.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateVendorCredit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendorCredits.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.vendorCredits[index] = action.payload;
      })
      .addCase(updateVendorCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteVendorCredit.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteVendorCredit.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorCredits = state.vendorCredits.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteVendorCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vendorCreditsSlice.reducer;