import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addJournal = createAsyncThunk(
  "manualJournals/addJournal",
  async (formData, { rejectWithValue }) => {
    try {
      // Calculate totals for the new journal
      const debits = formData.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
      const credits = formData.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
      
      const response = await mockApi({ 
        id: Date.now().toString(), 
        ...formData, 
        total: debits, 
        status: "Published",
        createdAt: new Date().toISOString()
      });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create journal");
    }
  }
);

export const deleteJournal = createAsyncThunk(
  "manualJournals/deleteJournal",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete journal");
    }
  }
);

// Real Static Data matching the screenshots
const initialState = {
  journals: [
    {
      id: "j1",
      journalNumber: "1",
      date: "2026-10-30",
      reverseDate: "",
      publishReverseOnly: false,
      referenceNumber: "",
      notes: "ewfeff",
      reportingMethod: "Accrual and Cash",
      currency: "INR- Indian Rupee",
      lines: [
        { id: "l1", account: "Employee Advance", description: "reree", contact: "LocalFix", debit: 333, credit: 0 },
        { id: "l2", account: "Employee Advance", description: "fffef", contact: "LocalFix", debit: 0, credit: 333 }
      ],
      total: 333,
      status: "Published"
    }
  ],
  loading: false,
  error: null,
};

const manualJournalsSlice = createSlice({
  name: "manualJournals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addJournal.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addJournal.fulfilled, (state, action) => {
        state.loading = false;
        state.journals.push(action.payload);
      })
      .addCase(addJournal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteJournal.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.loading = false;
        state.journals = state.journals.filter((j) => j.id !== action.payload);
      })
      .addCase(deleteJournal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default manualJournalsSlice.reducer;