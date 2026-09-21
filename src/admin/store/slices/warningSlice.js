// src/admin/store/slices/warningSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------

// GET /admin/warnings
export const fetchWarnings = createAsyncThunk(
  "warnings/fetchAll",
  async (
    { page = 1, perPage = 10, search = "", employeeId = null } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(employeeId && { employee_id: employeeId }),
      });

      const response = await apiClient.get(`/admin/warnings?${params}`);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch warnings",
      );
    } catch (error) {
      console.error("Fetch warnings error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warnings",
      );
    }
  },
);

// GET /admin/warnings/{id}
export const fetchWarningById = createAsyncThunk(
  "warnings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/warnings/${id}`);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch warning",
      );
    } catch (error) {
      console.error("Fetch warning error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warning",
      );
    }
  },
);

// POST /admin/warnings
// POST /admin/warnings
export const createWarning = createAsyncThunk(
  "warnings/create",
  async (payload, { rejectWithValue }) => {
    try {
      const isFormData = payload instanceof FormData;
      const response = await apiClient.post("/admin/warnings", payload, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to create warning",
      );
    } catch (error) {
      console.error("Create warning error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create warning",
      );
    }
  },
);

// PUT /admin/warnings/{id}
export const updateWarning = createAsyncThunk(
  "warnings/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await apiClient.post(`/admin/warnings/${id}`, data, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
        // Laravel method spoofing for FormData (since we use POST)
        params: isFormData ? { _method: "PUT" } : undefined,
      });

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update warning",
      );
    } catch (error) {
      console.error("Update warning error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update warning",
      );
    }
  },
);

// DELETE /admin/warnings/{id}
export const deleteWarning = createAsyncThunk(
  "warnings/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/warnings/${id}`);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, message: response.data.message };
      }
      return rejectWithValue(
        response.data?.message || "Failed to delete warning",
      );
    } catch (error) {
      console.error("Delete warning error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete warning",
      );
    }
  },
);

// POST /admin/warnings/{id}/send-email
export const sendWarningEmail = createAsyncThunk(
  "warnings/sendEmail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/warnings/${id}/send-email`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to send warning email",
      );
    } catch (error) {
      console.error("Send warning email error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send warning email",
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
  submitting: false,
  sendingEmailId: null,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 10,
  filters: {
    search: "",
    employeeId: null,
  },
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const warningSlice = createSlice({
  name: "warnings",
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
      .addCase(fetchWarnings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarnings.fulfilled, (state, action) => {
        state.loading = false;
        const apiData = action.payload || {};
        state.warnings = apiData.data || [];
        state.totalCount = apiData.total || 0;
        state.currentPage = apiData.current_page || 1;
        state.perPage = apiData.per_page || 10;
      })
      .addCase(fetchWarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by id
      .addCase(fetchWarningById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarningById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWarning = action.payload;
      })
      .addCase(fetchWarningById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createWarning.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createWarning.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.warnings.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(createWarning.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateWarning.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateWarning.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.warnings.findIndex((w) => w.id === updated.id);
        if (idx !== -1) state.warnings[idx] = { ...state.warnings[idx], ...updated };
        if (state.currentWarning?.id === updated.id) {
          state.currentWarning = { ...state.currentWarning, ...updated };
        }
      })
      .addCase(updateWarning.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteWarning.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteWarning.fulfilled, (state, action) => {
        state.submitting = false;
        state.warnings = state.warnings.filter(
          (w) => w.id !== action.payload.id,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentWarning?.id === action.payload.id) {
          state.currentWarning = null;
        }
      })
      .addCase(deleteWarning.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Send email
      .addCase(sendWarningEmail.pending, (state, action) => {
        state.sendingEmailId = action.meta.arg;
      })
      .addCase(sendWarningEmail.fulfilled, (state, action) => {
        state.sendingEmailId = null;
        const idx = state.warnings.findIndex(
          (w) => w.id === action.payload.id,
        );
        if (idx !== -1) {
          state.warnings[idx] = {
            ...state.warnings[idx],
            email_sent: true,
            email_sent_at:
              action.payload.email_sent_at || new Date().toISOString(),
          };
        }
        if (state.currentWarning?.id === action.payload.id) {
          state.currentWarning = {
            ...state.currentWarning,
            email_sent: true,
            email_sent_at:
              action.payload.email_sent_at || new Date().toISOString(),
          };
        }
      })
      .addCase(sendWarningEmail.rejected, (state, action) => {
        state.sendingEmailId = null;
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
} = warningSlice.actions;

export default warningSlice.reducer;