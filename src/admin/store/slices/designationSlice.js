import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

export const fetchDesignations = createAsyncThunk(
  "designations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/designations");

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch designations",
      );
    }
  },
);

export const addDesignation = createAsyncThunk(
  "designations/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/designations", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add designation",
      );
    }
  },
);

export const updateDesignation = createAsyncThunk(
  "designations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/designations/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const deleteDesignation = createAsyncThunk(
  "designations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/designations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

const designationSlice = createSlice({
  name: "designations",
  initialState: {
    designations: [],
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Designations
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;

        const apiData = action.payload || [];

        state.designations = apiData.map((des) => ({
          id: des.id,
          name: des.name,
          defaultPunchAccess: des.default_punch_access === 1,
          raw: des,
        }));

        state.totalCount = apiData.length;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Designation
      .addCase(addDesignation.fulfilled, (state, action) => {
        const des = action.payload;

        state.designations.push({
          id: des.id,
          name: des.name,
          defaultPunchAccess: des.default_punch_access === 1,
          raw: des,
        });

        state.totalCount += 1;
      })
      // Update Designation
      .addCase(updateDesignation.fulfilled, (state, action) => {
        const index = state.designations.findIndex(
          (d) => d.id === action.payload.id,
        );

        if (index !== -1) {
          state.designations[index] = {
            ...state.designations[index],
            name: action.payload.name,
            defaultPunchAccess: action.payload.default_punch_access === 1,
            raw: action.payload,
          };
        }
      })
      // Delete Designation
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        state.designations = state.designations.filter(
          (d) => d.id !== action.payload,
        );
        state.totalCount -= 1;
      });
  },
});

export default designationSlice.reducer;
