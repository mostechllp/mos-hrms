// src/admin/store/slices/proposalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Allowed statuses ──
export const PROPOSAL_STATUSES = [
  "Preparing",
  "Pending",
  "Sent",
  "Approved",
  "Reject",
];

// ── THUNKS ──

// GET /admin/crm/proposals
export const fetchProposals = createAsyncThunk(
  "proposals/fetchAll",
  async (
    { page = 1, perPage = 10, search = "", status = "" } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(status && { status }),
      });
      const response = await apiClient.get(`/admin/crm/proposals?${params}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch proposals",
      );
    } catch (error) {
      console.error("Fetch proposals error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch proposals",
      );
    }
  },
);

// POST /admin/crm/proposals
export const createProposal = createAsyncThunk(
  "proposals/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/crm/proposals", payload);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to create proposal",
      );
    } catch (error) {
      console.error("Create proposal error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create proposal",
      );
    }
  },
);

// PUT /admin/crm/proposals/{id}
export const updateProposal = createAsyncThunk(
  "proposals/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/crm/proposals/${id}`, data);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update proposal",
      );
    } catch (error) {
      console.error("Update proposal error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update proposal",
      );
    }
  },
);

// DELETE /admin/crm/proposals/{id}
export const deleteProposal = createAsyncThunk(
  "proposals/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/crm/proposals/${id}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id };
      }
      return rejectWithValue(
        response.data?.message || "Failed to delete proposal",
      );
    } catch (error) {
      console.error("Delete proposal error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete proposal",
      );
    }
  },
);

// ── INITIAL STATE ──
const initialState = {
  proposals: [],
  loading: false,
  submitting: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 10,
  filters: {
    search: "",
    status: "",
  },
};

// ── SLICE ──
const proposalSlice = createSlice({
  name: "proposals",
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false;
        const apiData = action.payload || {};
        state.proposals = apiData.data || [];
        state.totalCount = apiData.total || 0;
        state.currentPage = apiData.current_page || 1;
        state.perPage = apiData.per_page || 10;
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createProposal.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.proposals.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateProposal.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.proposals.findIndex((p) => p.id === updated.id);
        if (idx !== -1) {
          state.proposals[idx] = { ...state.proposals[idx], ...updated };
        }
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteProposal.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteProposal.fulfilled, (state, action) => {
        state.submitting = false;
        state.proposals = state.proposals.filter(
          (p) => p.id !== action.payload.id,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
      })
      .addCase(deleteProposal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearError,
} = proposalSlice.actions;

export default proposalSlice.reducer;