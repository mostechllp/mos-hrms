// src/admin/store/slices/proposalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallback options (used until form-options loads) ──
export const FALLBACK_PROPOSAL_OPTIONS = {
  statuses: ["Preparing", "Pending", "Sent", "Approved", "Reject"],
  next_serial_no: 1,
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

// API → UI
export const fromProposalApi = (api = {}) => ({
  id: api.id,
  sno: Number(api.serial_no ?? api.sno) || 0,
  date: api.date?.split("T")[0] || "",
  customer: api.customer || api.customer_name || "",
  customerId: api.customer_id ?? "",
  proposal_reference:
    api.proposal_reference_no ||
    api.proposal_reference ||
    api.proposal_number ||
    "",
  drive_link: api.drive_link || api.drive_url || "",
  status: api.status || "Preparing",
  createdAt: api.created_at || "",
  updatedAt: api.updated_at || "",
});

// UI → API
export const toProposalApi = (form = {}) => ({
  serial_no: form.sno !== "" && form.sno != null ? Number(form.sno) : null,
  date: form.date || "",
  customer: form.customer || "",
  customer_id: form.customerId ? Number(form.customerId) : null,
  proposal_reference_no: form.proposal_reference || "",
  drive_link: form.drive_link || "",
  status: form.status || "Preparing",
});

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildProposalQuery = (params = {}) => {
  const {
    search = "",
    status = "",
    from_date = "",
    to_date = "",
    sort_by = "",
    sort_order = "",
  } = params;
  return new URLSearchParams({
    ...(search && { search }),
    ...(status && { status }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
  });
};

const unwrap = (body) => {
  if (!body) return { ok: true, data: null, message: "" };
  const hasFlag = body.status !== undefined || body.success !== undefined;
  const ok = !hasFlag || body.status === "success" || body.success === true;
  return { ok, data: body.data ?? body, message: body.message };
};

const flattenErrors = (e) => {
  const errs = e.response?.data?.errors;
  if (errs) return Object.values(errs).flat().join(", ");
  return e.response?.data?.message || null;
};

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------

// GET /admin/crm/proposals/form-options
export const fetchProposalFormOptions = createAsyncThunk(
  "proposals/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/proposals/form-options");
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load form options");
    } catch (e) {
      return rejectWithValue(
        flattenErrors(e) || "Failed to load form options",
      );
    }
  },
);

// GET /admin/crm/proposals
export const fetchProposals = createAsyncThunk(
  "proposals/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 15 } = params;
      const qs = buildProposalQuery(params);
      qs.set("page", page);
      qs.set("per_page", perPage);
      const res = await apiClient.get(`/admin/crm/proposals?${qs}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch proposals");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to fetch proposals");
    }
  },
);

// GET /admin/crm/proposals/{id}
export const fetchProposalById = createAsyncThunk(
  "proposals/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/crm/proposals/${id}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch proposal");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to fetch proposal");
    }
  },
);

// POST /admin/crm/proposals
export const createProposal = createAsyncThunk(
  "proposals/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toProposalApi(form);
      const res = await apiClient.post("/admin/crm/proposals", payload);
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to create proposal");
      // Some backends wrap: { data: { proposal: {...} } }
      return data?.proposal ?? data;
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to create proposal");
    }
  },
);

// PUT /admin/crm/proposals/{id}
export const updateProposal = createAsyncThunk(
  "proposals/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = toProposalApi(data);
      const res = await apiClient.put(`/admin/crm/proposals/${id}`, payload);
      const { ok, data: body, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update proposal");
      return { id, ...(body?.proposal ?? body ?? {}) };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update proposal");
    }
  },
);

// DELETE /admin/crm/proposals/{id}
export const deleteProposalApi = createAsyncThunk(
  "proposals/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/admin/crm/proposals/${id}`);
      const { ok, message } = unwrap(res.data);
      if (ok) return { id };
      return rejectWithValue(message || "Failed to delete proposal");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to delete proposal");
    }
  },
);

// POST /admin/crm/proposals/{id}/update-status
export const updateProposalStatusApi = createAsyncThunk(
  "proposals/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/admin/crm/proposals/${id}/update-status`,
        { status },
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return { id, status, ...(data || {}) };
      return rejectWithValue(message || "Failed to update status");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update status");
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  proposals: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    status: "",
    from_date: "",
    to_date: "",
    sort_by: "serial_no",
    sort_order: "asc",
  },

  currentProposal: null,
  currentProposalLoading: false,
  currentProposalError: null,

  options: FALLBACK_PROPOSAL_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

  submitting: false,
  submittingError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const proposalSlice = createSlice({
  name: "proposals",
  initialState,
  reducers: {
    setCurrentPage: (s, a) => { s.currentPage = a.payload; },
    setPerPage: (s, a) => { s.perPage = a.payload; s.currentPage = 1; },
    setFilters: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
      s.currentPage = 1;
    },
    resetFilters: (s) => {
      s.filters = initialState.filters;
      s.currentPage = 1;
    },
    clearCurrentProposal: (s) => {
      s.currentProposal = null;
      s.currentProposalError = null;
    },
    clearError: (s) => {
      s.error = null;
      s.submittingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchProposalFormOptions.pending, (s) => {
        s.optionsLoading = true;
        s.optionsError = null;
      })
      .addCase(fetchProposalFormOptions.fulfilled, (s, a) => {
        s.optionsLoading = false;
        s.optionsLoaded = true;
        s.options = { ...FALLBACK_PROPOSAL_OPTIONS, ...(a.payload || {}) };
      })
      .addCase(fetchProposalFormOptions.rejected, (s, a) => {
        s.optionsLoading = false;
        s.optionsError = a.payload;
      })

      // ── List ──
      .addCase(fetchProposals.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProposals.fulfilled, (s, a) => {
        s.loading = false;
        const d = a.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        const list = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
        s.proposals = list;
        s.totalCount = paginated?.total ?? list.length;
        s.currentPage = paginated?.current_page ?? s.currentPage;
        s.perPage = paginated?.per_page ?? s.perPage;
      })
      .addCase(fetchProposals.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ── Single ──
      .addCase(fetchProposalById.pending, (s) => {
        s.currentProposalLoading = true;
        s.currentProposalError = null;
      })
      .addCase(fetchProposalById.fulfilled, (s, a) => {
        s.currentProposalLoading = false;
        s.currentProposal = a.payload;
      })
      .addCase(fetchProposalById.rejected, (s, a) => {
        s.currentProposalLoading = false;
        s.currentProposalError = a.payload;
      })

      // ── Create ──
      .addCase(createProposal.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(createProposal.fulfilled, (s, a) => {
        s.submitting = false;
        if (a.payload) {
          s.proposals.unshift(a.payload);
          s.totalCount += 1;
        }
      })
      .addCase(createProposal.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Update ──
      .addCase(updateProposal.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateProposal.fulfilled, (s, a) => {
        s.submitting = false;
        const u = a.payload;
        const idx = s.proposals.findIndex((p) => p.id === u.id);
        if (idx !== -1) s.proposals[idx] = { ...s.proposals[idx], ...u };
        if (s.currentProposal?.id === u.id) {
          s.currentProposal = { ...s.currentProposal, ...u };
        }
      })
      .addCase(updateProposal.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Status only ──
      .addCase(updateProposalStatusApi.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateProposalStatusApi.fulfilled, (s, a) => {
        s.submitting = false;
        const { id, status } = a.payload;
        const idx = s.proposals.findIndex((p) => p.id === id);
        if (idx !== -1) s.proposals[idx].status = status;
        if (s.currentProposal?.id === id) {
          s.currentProposal.status = status;
        }
      })
      .addCase(updateProposalStatusApi.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Delete ──
      .addCase(deleteProposalApi.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(deleteProposalApi.fulfilled, (s, a) => {
        s.submitting = false;
        s.proposals = s.proposals.filter((p) => p.id !== a.payload.id);
        s.totalCount = Math.max(0, s.totalCount - 1);
        if (s.currentProposal?.id === a.payload.id) {
          s.currentProposal = null;
        }
      })
      .addCase(deleteProposalApi.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentProposal,
  clearError,
} = proposalSlice.actions;

export default proposalSlice.reducer;