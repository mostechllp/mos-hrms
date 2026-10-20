// src/employee/store/slices/employeeWarningSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------

// GET /employee/warnings  (or /admin/warnings if employees call the same endpoint)
export const fetchMyWarnings = createAsyncThunk(
  "employeeWarnings/fetchAll",
  async ({ page = 1, perPage = 10, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search && { search }),
      });

      const response = await apiClient.get(`/employee/warnings?${params}`);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch warnings",
      );
    } catch (error) {
      console.error("Fetch my warnings error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warnings",
      );
    }
  },
);

// GET /employee/warnings/{id}
export const fetchMyWarningById = createAsyncThunk(
  "employeeWarnings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/employee/warnings/${id}`);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch warning",
      );
    } catch (error) {
      console.error("Fetch my warning error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warning",
      );
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  warnings: [],
  currentWarning: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 10,
  filters: {
    search: "",
  },
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const employeeWarningSlice = createSlice({
  name: "employeeWarnings",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPerPage: (state, action) => {
      state.perPage = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    clearCurrentWarning: (state) => {
      state.currentWarning = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchMyWarnings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWarnings.fulfilled, (state, action) => {
        state.loading = false;
        const apiData = action.payload || {};
        state.warnings = apiData.data || [];
        state.totalCount = apiData.total || 0;
        state.currentPage = apiData.current_page || 1;
        state.perPage = apiData.per_page || 10;
      })
      .addCase(fetchMyWarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by id
      .addCase(fetchMyWarningById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWarningById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWarning = action.payload;
      })
      .addCase(fetchMyWarningById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentWarning,
  clearError,
} = employeeWarningSlice.actions;

export default employeeWarningSlice.reducer;