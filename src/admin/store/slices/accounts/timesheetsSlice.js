import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addTimesheet = createAsyncThunk(
  "timesheets/addTimesheet",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id: Date.now().toString(), ...formData, status: "Unbilled" });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create log entry");
    }
  }
);

export const deleteTimesheet = createAsyncThunk(
  "timesheets/deleteTimesheet",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete log entry");
    }
  }
);

// Real Static Data
const initialState = {
  timesheets: [
    {
      id: "ts1",
      date: "2026-10-30",
      projectName: "ss",
      customerName: "Mrs. sss www",
      taskName: "ss",
      userName: "Fidha Fathima",
      hours: "02:00",
      billable: false,
      status: "Unbilled",
      notes: "Worked on initial layout setup."
    }
  ],
  loading: false,
  error: null,
};

const timesheetsSlice = createSlice({
  name: "timesheets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addTimesheet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets.push(action.payload);
      })
      .addCase(addTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTimesheet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets = state.timesheets.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default timesheetsSlice.reducer;