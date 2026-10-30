import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial State with static data to match Image 5
const initialState = {
  folders: [
    { id: "f1", name: "ss" }
  ],
  documents: [
    {
      id: "d1",
      name: "registrations (2).pdf",
      type: "pdf",
      uploadedBy: "Me",
      uploadedAt: "30/10/2026 03:27 PM",
      associatedTo: "",
      folder: "",
      status: "Scan in progress",
    }
  ],
  loading: false,
  error: null,
};

export const addFolder = createAsyncThunk(
  "documents/addFolder",
  async (name, { rejectWithValue }) => {
    try {
      return { id: Date.now().toString(), name };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addFolder.fulfilled, (state, action) => {
      state.folders.push(action.payload);
    });
  },
});

export default documentsSlice.reducer;