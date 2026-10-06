// src/admin/store/slices/leadSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallback enums (used only if form-options hasn't loaded yet) ──
export const FALLBACK_OPTIONS = {
  lead_types: ["Company", "Individual", "Enterprise", "SMB"],
  lead_sources: [
    "Website",
    "Referral",
    "Cold Call",
    "LinkedIn",
    "Campaign",
    "Social Media",
    "Event",
    "Other",
  ],
  lead_statuses: [
    "New",
    "Contacted",
    "Working",
    "Qualified",
    "Unqualified",
    "Converted",
    "Lost",
  ],
  priorities: ["Low", "Medium", "High", "Urgent"],
  industries: [
    "IT Services & Software",
    "Healthcare & Medical",
    "Manufacturing",
    "Financial Services",
    "Retail & E-commerce",
    "Education",
    "Real Estate & Construction",
    "Logistics & Supply Chain",
    "Services",
    "Other",
  ],
  interested_products: [
    "HRMS",
    "ERP",
    "CRM",
    "Payroll",
    "Attendance System",
    "Custom Development",
  ],
  follow_up_types: ["Call", "Meeting", "Email", "Demo", "Task"],
  salespersons: [],
  sales_teams: [],
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

// API → Form (for edit / detail views)
export const fromLeadApi = (api = {}) => ({
  // identity
  id: api.id,
  leadId: api.lead_id || "",
  // basic
  leadType: api.lead_type || "Company",
  leadName: api.lead_name || "",
  companyName: api.company_name || "",
  designation: api.designation || "",
  industry: api.industry || "",
  website: api.website || "",
  leadSource: api.lead_source || "",
  leadStatus: api.lead_status || "New",
  priority: api.priority || "Medium",
  // contact
  email: api.email || "",
  primaryPhone: api.primary_phone || "",
  alternatePhone: api.alternate_phone || "",
  address: api.address || "",
  city: api.city || "",
  state: api.state || "",
  country: api.country || "",
  postalCode: api.postal_code || "",
  // assignment
  assignedSalespersonId: api.assigned_salesperson_id ?? "",
  salesTeam: api.sales_team || "",
  expectedValue: api.expected_value ?? "",
  expectedClosingDate: api.expected_closing_date?.split("T")[0] || "",
  interestedProducts: Array.isArray(api.interested_products)
    ? api.interested_products
    : [],
  notes: api.notes || "",
  // follow-up
  nextFollowUpAt: api.next_follow_up_at || "",
  followUpType: api.follow_up_type || "Call",
  followUpNotes: api.follow_up_notes || "",
  // read-only extras
  createdAt: api.created_at || "",
  updatedAt: api.updated_at || "",
  assignedSalesperson: api.assigned_salesperson || null,
});

// Form → API
export const toLeadApi = (form = {}) => ({
  lead_type: form.leadType || "Company",
  lead_name: (form.leadName || "").trim(),
  company_name: form.companyName || "",
  designation: form.designation || "",
  industry: form.industry || "",
  website: form.website || "",
  lead_source: form.leadSource || "",
  lead_status: form.leadStatus || "New",
  priority: form.priority || "Medium",

  email: form.email || "",
  primary_phone: form.primaryPhone || "",
  alternate_phone: form.alternatePhone || "",
  postal_code: form.postalCode || "",
  address: form.address || "",
  city: form.city || "",
  state: form.state || "",
  country: form.country || "",

  assigned_salesperson_id: form.assignedSalespersonId
    ? Number(form.assignedSalespersonId)
    : null,
  sales_team: form.salesTeam || "",
  expected_value:
  form.expectedValue === "" || form.expectedValue === null || form.expectedValue === undefined
    ? 0
    : Number(form.expectedValue),
  expected_closing_date: form.expectedClosingDate || "",
  interested_products: Array.isArray(form.interestedProducts)
    ? form.interestedProducts
    : [],
  notes: form.notes || "",

  next_follow_up_at: form.nextFollowUpAt || "",
  follow_up_type: form.followUpType || "",
  follow_up_notes: form.followUpNotes || "",
});

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------

// GET /admin/crm/leads/form-options
export const fetchLeadFormOptions = createAsyncThunk(
  "leads/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/crm/leads/form-options");
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to load form options",
      );
    } catch (error) {
      console.error("Fetch form options error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load form options",
      );
    }
  },
);

// GET /admin/crm/leads
export const fetchLeads = createAsyncThunk(
  "leads/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        perPage = 15,
        search = "",
        lead_status = "",
        priority = "",
        lead_source = "",
        lead_type = "",
        assigned_salesperson_id = "",
        sales_team = "",
        industry = "",
        date_from = "",
        date_to = "",
        sort_by = "",
        sort_order = "",
      } = params;

      const qs = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(lead_status && { lead_status }),
        ...(priority && { priority }),
        ...(lead_source && { lead_source }),
        ...(lead_type && { lead_type }),
        ...(assigned_salesperson_id && { assigned_salesperson_id }),
        ...(sales_team && { sales_team }),
        ...(industry && { industry }),
        ...(date_from && { date_from }),
        ...(date_to && { date_to }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order }),
      });

      const response = await apiClient.get(`/admin/crm/leads?${qs}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(response.data?.message || "Failed to fetch leads");
    } catch (error) {
      console.error("Fetch leads error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leads",
      );
    }
  },
);

// GET /admin/crm/leads/{id}
export const fetchLeadById = createAsyncThunk(
  "leads/fetchById",
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/crm/leads/${leadId}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch lead",
      );
    } catch (error) {
      console.error("Fetch lead error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lead",
      );
    }
  },
);

// POST /admin/crm/leads
export const createLead = createAsyncThunk(
  "leads/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toLeadApi(form);
      const response = await apiClient.post("/admin/crm/leads", payload);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to create lead",
      );
    } catch (error) {
      console.error("Create lead error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lead",
      );
    }
  },
);

// PUT /admin/crm/leads/{id}
export const updateLead = createAsyncThunk(
  "leads/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = toLeadApi(data);
      const response = await apiClient.put(`/admin/crm/leads/${id}`, payload);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update lead",
      );
    } catch (error) {
      console.error("Update lead error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lead",
      );
    }
  },
);

// POST /admin/crm/leads/{id}/update-status
export const updateLeadStatusApi = createAsyncThunk(
  "leads/updateStatus",
  async ({ id, lead_status, note = "" }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/crm/leads/${id}/update-status`,
        { lead_status, note },
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, lead_status, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update lead status",
      );
    } catch (error) {
      console.error("Update lead status error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lead status",
      );
    }
  },
);

// POST /admin/crm/leads/{id}/convert
export const convertLeadApi = createAsyncThunk(
  "leads/convert",
  async ({ id, converted_value = null, conversion_note = "" }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/crm/leads/${id}/convert`,
        { converted_value, conversion_note },
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to convert lead",
      );
    } catch (error) {
      console.error("Convert lead error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to convert lead",
      );
    }
  },
);

// DELETE /admin/crm/leads/{id}
export const deleteLeadApi = createAsyncThunk(
  "leads/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/crm/leads/${id}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id };
      }
      return rejectWithValue(
        response.data?.message || "Failed to delete lead",
      );
    } catch (error) {
      console.error("Delete lead error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete lead",
      );
    }
  },
);

// GET /admin/crm/leads/stats
export const fetchLeadStats = createAsyncThunk(
  "leads/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/crm/leads/stats");
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch lead stats",
      );
    } catch (error) {
      console.error("Fetch lead stats error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lead stats",
      );
    }
  },
);

// GET /admin/crm/leads/{id}/follow-ups
export const fetchLeadFollowUps = createAsyncThunk(
  "leads/fetchFollowUps",
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/crm/leads/${leadId}/follow-ups`,
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch follow-ups",
      );
    } catch (error) {
      console.error("Fetch follow-ups error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follow-ups",
      );
    }
  },
);

// GET /admin/crm/follow-ups/pending
export const fetchPendingFollowUps = createAsyncThunk(
  "leads/fetchPendingFollowUps",
  async (
    { date = "", assigned_salesperson_id = "", perPage = 15 } = {},
    { rejectWithValue },
  ) => {
    try {
      const qs = new URLSearchParams({
        per_page: perPage,
        ...(date && { date }),
        ...(assigned_salesperson_id && { assigned_salesperson_id }),
      });
      const response = await apiClient.get(
        `/admin/crm/follow-ups/pending?${qs}`,
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch pending follow-ups",
      );
    } catch (error) {
      console.error("Fetch pending follow-ups error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending follow-ups",
      );
    }
  },
);

// POST /admin/crm/leads/{id}/follow-ups
export const createLeadFollowUp = createAsyncThunk(
  "leads/createFollowUp",
  async ({ leadId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/crm/leads/${leadId}/follow-ups`,
        data,
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to schedule follow-up",
      );
    } catch (error) {
      console.error("Create follow-up error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to schedule follow-up",
      );
    }
  },
);

// PUT /admin/crm/leads/follow-ups/{followUpId}
export const updateLeadFollowUp = createAsyncThunk(
  "leads/updateFollowUp",
  async ({ followUpId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/admin/crm/leads/follow-ups/${followUpId}`,
        data,
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id: followUpId, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update follow-up",
      );
    } catch (error) {
      console.error("Update follow-up error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update follow-up",
      );
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  // lists
  leads: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    lead_status: "",
    priority: "",
    lead_source: "",
    lead_type: "",
    assigned_salesperson_id: "",
    sales_team: "",
    industry: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
  },

    // pending follow-ups (across all leads)
  pendingFollowUps: [],
  pendingFollowUpsLoading: false,
  pendingFollowUpsError: null,
  pendingFollowUpsTotal: 0,
  pendingFollowUpsFilters: {
    date: "",
    assigned_salesperson_id: "",
  },

  // single
  currentLead: null,
  currentLeadLoading: false,
  currentLeadError: null,

  // stats
  stats: {
    total_leads: 0,
    new_leads: 0,
    qualified_leads: 0,
    converted_leads: 0,
    total_expected_value: 0,
    pending_follow_ups_count: 0,
    leads_by_status: {},
    leads_by_source: {},
  },
  statsLoading: false,
  statsError: null,

  // follow-ups
  followUps: [],
  followUpsLoading: false,
  followUpsError: null,

  // form options
  options: FALLBACK_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

  // write ops
  submitting: false,
  submittingError: null,
  convertingId: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const leadSlice = createSlice({
  name: "leads",
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
    clearCurrentLead: (state) => {
      state.currentLead = null;
      state.currentLeadError = null;
      state.followUps = [];
    },
    clearError: (state) => {
      state.error = null;
      state.submittingError = null;
    },

        setPendingFollowUpFilters: (state, action) => {
      state.pendingFollowUpsFilters = {
        ...state.pendingFollowUpsFilters,
        ...action.payload,
      };
    },
    resetPendingFollowUpFilters: (state) => {
      state.pendingFollowUpsFilters = {
        date: "",
        assigned_salesperson_id: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchLeadFormOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(fetchLeadFormOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.optionsLoaded = true;
        state.options = { ...FALLBACK_OPTIONS, ...(action.payload || {}) };
      })
      .addCase(fetchLeadFormOptions.rejected, (state, action) => {
        state.optionsLoading = false;
        state.optionsError = action.payload;
      })

      // ── List ──
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        const d = action.payload || {};
        // Support both shapes: { data: [...], total } and [...]
        state.leads = Array.isArray(d) ? d : d.data || [];
        state.totalCount = d.total ?? state.leads.length;
        state.currentPage = d.current_page ?? state.currentPage;
        state.perPage = d.per_page ?? state.perPage;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Single ──
      .addCase(fetchLeadById.pending, (state) => {
        state.currentLeadLoading = true;
        state.currentLeadError = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.currentLeadLoading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.currentLeadLoading = false;
        state.currentLeadError = action.payload;
      })

      // ── Create ──
      .addCase(createLead.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.leads.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(createLead.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Update ──
      .addCase(updateLead.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.leads.findIndex((l) => l.id === updated.id);
        if (idx !== -1) state.leads[idx] = { ...state.leads[idx], ...updated };
        if (state.currentLead?.id === updated.id) {
          state.currentLead = { ...state.currentLead, ...updated };
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Quick status ──
      .addCase(updateLeadStatusApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateLeadStatusApi.fulfilled, (state, action) => {
        state.submitting = false;
        const { id, lead_status } = action.payload;
        const idx = state.leads.findIndex((l) => l.id === id);
        if (idx !== -1) state.leads[idx].lead_status = lead_status;
        if (state.currentLead?.id === id) {
          state.currentLead.lead_status = lead_status;
        }
      })
      .addCase(updateLeadStatusApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Convert ──
      .addCase(convertLeadApi.pending, (state, action) => {
        state.convertingId = action.meta.arg.id;
      })
      .addCase(convertLeadApi.fulfilled, (state, action) => {
        state.convertingId = null;
        const { id } = action.payload;
        const idx = state.leads.findIndex((l) => l.id === id);
        if (idx !== -1) state.leads[idx].lead_status = "Converted";
        if (state.currentLead?.id === id) {
          state.currentLead.lead_status = "Converted";
        }
      })
      .addCase(convertLeadApi.rejected, (state) => {
        state.convertingId = null;
      })

      // ── Delete ──
      .addCase(deleteLeadApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(deleteLeadApi.fulfilled, (state, action) => {
        state.submitting = false;
        state.leads = state.leads.filter((l) => l.id !== action.payload.id);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = null;
        }
      })
      .addCase(deleteLeadApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Stats ──
      .addCase(fetchLeadStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = { ...initialState.stats, ...(action.payload || {}) };
      })
      .addCase(fetchLeadStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })

      // ── Follow-ups ──
      .addCase(fetchLeadFollowUps.pending, (state) => {
        state.followUpsLoading = true;
        state.followUpsError = null;
      })
      .addCase(fetchLeadFollowUps.fulfilled, (state, action) => {
        state.followUpsLoading = false;
        state.followUps = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchLeadFollowUps.rejected, (state, action) => {
        state.followUpsLoading = false;
        state.followUpsError = action.payload;
      })
      .addCase(createLeadFollowUp.fulfilled, (state, action) => {
        if (action.payload) state.followUps.unshift(action.payload);
      })
      .addCase(updateLeadFollowUp.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.followUps.findIndex((f) => f.id === updated.id);
        if (idx !== -1) {
          state.followUps[idx] = { ...state.followUps[idx], ...updated };
        }
      })
            // ── Pending follow-ups (across all leads) ──
      .addCase(fetchPendingFollowUps.pending, (state) => {
        state.pendingFollowUpsLoading = true;
        state.pendingFollowUpsError = null;
      })
      .addCase(fetchPendingFollowUps.fulfilled, (state, action) => {
        state.pendingFollowUpsLoading = false;
        const d = action.payload || {};
        state.pendingFollowUps = Array.isArray(d)
          ? d
          : d.data || d.follow_ups || [];
        state.pendingFollowUpsTotal =
          d.total ?? state.pendingFollowUps.length;
      })
      .addCase(fetchPendingFollowUps.rejected, (state, action) => {
        state.pendingFollowUpsLoading = false;
        state.pendingFollowUpsError = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentLead,
  clearError,
  setPendingFollowUpFilters,
  resetPendingFollowUpFilters,
} = leadSlice.actions;

export default leadSlice.reducer;