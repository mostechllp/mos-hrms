// src/admin/crm/store/slices/activitySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallback enums (used until form-options loads) ──
export const FALLBACK_ACTIVITY_OPTIONS = {
  types: ["Call", "Email", "Meeting", "Task", "Site Visit"],
  related_types: ["Lead", "Customer", "Opportunity", "Internal"],
  priorities: ["Low", "Medium", "High"],
  reminders: ["None", "15 min", "1 hour", "1 day"],
  statuses: ["Planned", "In Progress", "Completed", "Overdue", "Cancelled"],
  assignees: [], // [{id, name, designation}]
  related_records: {
    Lead: [],
    Customer: [],
    Opportunity: [],
    Internal: [{ value: "—", label: "Internal" }],
  },
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

// API → Form
export const fromActivityApi = (api = {}) => ({
  id: api.id,
  activityId: api.activity_id || api.id,
  title: api.title || api.subject || "",
  type: api.type || api.activity_type || "Call",
 relatedToType:
  api.related_record_type ||
  api.related_to_type ||
  api.relatedToType ||
  api.relation_type ||
  "Lead",
relatedToId:
  api.related_record_id ??
  api.related_to_id ??
  api.relatedToId ??
  api.relation_id ??
  "",
relatedToLabel:
  api.related_to_label ||
  api.relatedToLabel ||
  api.related_name ||
  api.relation_name ||
  api.related_record_label ||
  "",
   assignedTo:
  api.assigned_employee_name ||
  api.assigned_employee?.name ||
  (api.assigned_employee?.first_name || api.assigned_employee?.last_name
    ? `${api.assigned_employee.first_name || ""} ${api.assigned_employee.last_name || ""}`.trim()
    : "") ||
  api.assigned_employee?.username ||
  api.assigned_employee?.email ||
  api.assigned_to_name ||
  api.assignedTo ||
  "",
  assignedToId:
    api.assigned_employee_id ??
    api.assigned_employee?.id ??
    api.assigned_to ??
    api.assigned_to_id ??
    "",
  startAt:
    api.start_date_time ||
    api.start_at ||
    api.startAt ||
    api.starts_at ||
    "",
  endAt:
    api.end_date_time ||
    api.end_at ||
    api.endAt ||
    api.ends_at ||
    "",
  priority: api.priority || "Medium",
  status: api.status || "Planned",
  reminder: api.reminder || "None",
  description: api.description || api.notes || "",
  createdAt: api.created_at || "",
  updatedAt: api.updated_at || "",
  creator: api.creator || null,
  assignedUser: api.assigned_user || null,
});


// Form → API
export const toActivityApi = (form = {}) => ({
  title: (form.title || "").trim(),
  activity_type: form.type || "Call",             // server stores "activity_type"
  related_record_type: form.relatedToType || "",  // server stores "related_record_type"
  related_record_id: form.relatedToId || null,    // server stores "related_record_id"
  assigned_employee_id: (() => {
  const v = form.assignedTo ?? form.assignedToId;
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
})(),
  start_date_time: form.startAt || "",
  end_date_time: form.endAt || "",
  priority: form.priority || "Medium",
  status: form.status || "Planned",
  reminder: form.reminder || "None",
  description: form.description || "",
});

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildActivityFilterQuery = (params = {}) => {
  const {
    search = "",
    type = "",
    status = "",
    priority = "",
    assigned_to = "",
    related_type = "",
    date_from = "",
    date_to = "",
    sort_by = "",
    sort_order = "",
  } = params;

  return new URLSearchParams({
    ...(search && { search }),
    ...(type && { type }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigned_to && { assigned_employee_id: assigned_to }),
    ...(related_type && { related_type }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
  });
};

const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const buildFilename = (base, ext) => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${base}_${yyyy}-${mm}-${dd}.${ext}`;
};

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------

// GET /activities/form-options  (optional — falls back if 404)
export const fetchActivityFormOptions = createAsyncThunk(
  "activities/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/crm/activities/form-options");
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
      console.error("Fetch activity form options error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load form options",
      );
    }
  },
);

// GET /activities
// GET /activities
export const fetchActivities = createAsyncThunk(
  "activities/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 15 } = params;
      const qs = buildActivityFilterQuery(params);
      qs.set("page", page);
      qs.set("per_page", perPage);

      const response = await apiClient.get(`/admin/crm/activities?${qs}`);

      const body = response.data;
      const hasFlag =
        body && (body.status !== undefined || body.success !== undefined);
      const isFailure =
        hasFlag && body.status !== "success" && body.success !== true;

      if (body && !isFailure) {
        // Unwrap either { data: [...] } or the array directly
        return body.data ?? body;
      }
      return rejectWithValue(body?.message || "Failed to fetch activities");
    } catch (error) {
      console.error("Fetch activities error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activities",
      );
    }
  },
);

// GET /activities/{id}
export const fetchActivityById = createAsyncThunk(
  "activities/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/crm/activities/${id}`);
      const body = response.data;
      const hasFlag =
        body && (body.status !== undefined || body.success !== undefined);
      const isFailure =
        hasFlag && body.status !== "success" && body.success !== true;

      if (body && !isFailure) return body.data ?? body;
      return rejectWithValue(body?.message || "Failed to fetch activity");
    } catch (error) {
      console.error("Fetch activity error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activity",
      );
    }
  },
);

// ----------------------------------------------------
// LOOKUPS FOR MODAL DROPDOWNS
// ----------------------------------------------------

// GET /admin/crm/activities/employees
export const fetchActivityEmployees = createAsyncThunk(
  "activities/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/crm/activities/employees",
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to load employees",
      );
    } catch (error) {
      console.error("Fetch activity employees error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load employees",
      );
    }
  },
);

// GET /admin/crm/leads  (trimmed for a dropdown)
export const fetchLeadLookup = createAsyncThunk(
  "activities/fetchLeadLookup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/crm/leads?per_page=100&sort_by=created_at&sort_order=desc",
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to load leads",
      );
    } catch (error) {
      console.error("Fetch lead lookup error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load leads",
      );
    }
  },
);

// GET /admin/crm/customers  (trimmed for a dropdown)
export const fetchCustomerLookup = createAsyncThunk(
  "activities/fetchCustomerLookup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/crm/customers?per_page=100&sort_by=created_at&sort_order=desc",
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to load customers",
      );
    } catch (error) {
      console.error("Fetch customer lookup error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load customers",
      );
    }
  },
);

// GET /admin/crm/opportunities  (trimmed for a dropdown)
export const fetchOpportunityLookup = createAsyncThunk(
  "activities/fetchOpportunityLookup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/crm/opportunities?per_page=100&sort_by=created_at&sort_order=desc",
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to load opportunities",
      );
    } catch (error) {
      console.error("Fetch opportunity lookup error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load opportunities",
      );
    }
  },
);

// POST /activities
// POST /activities
export const createActivity = createAsyncThunk(
  "activities/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toActivityApi(form);
      const response = await apiClient.post("/admin/crm/activities", payload);

      const body = response.data;
      const hasStatus = body && (body.status !== undefined || body.success !== undefined);
      const isFailure = hasStatus && body.status !== "success" && body.success !== true;

      if (body && !isFailure) {
        // Unwrap both possible shapes: { data: {...} } or { ... }
        return body.data ?? body;
      }
      return rejectWithValue(body?.message || "Failed to create activity");
    } catch (error) {
      console.error("Create activity error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create activity",
      );
    }
  },
);

// PUT /activities/{id}
export const updateActivity = createAsyncThunk(
  "activities/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = toActivityApi(data);
      const response = await apiClient.put(`/admin/crm/activities/${id}`, payload);

      const body = response.data;
      const hasStatus = body && (body.status !== undefined || body.success !== undefined);
      const isFailure = hasStatus && body.status !== "success" && body.success !== true;

      if (body && !isFailure) {
        return { id, ...(body.data ?? body) };
      }
      return rejectWithValue(body?.message || "Failed to update activity");
    } catch (error) {
      console.error("Update activity error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update activity",
      );
    }
  },
);

// DELETE /activities/{id}
export const deleteActivityApi = createAsyncThunk(
  "activities/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/crm/activities/${id}`);
      const body = response.data;
      const hasStatus = body && (body.status !== undefined || body.success !== undefined);
      const isFailure = hasStatus && body.status !== "success" && body.success !== true;

      if (!body || !isFailure) return { id };
      return rejectWithValue(body?.message || "Failed to delete activity");
    } catch (error) {
      console.error("Delete activity error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete activity",
      );
    }
  },
);

// GET /activities/export?format=xlsx|csv|pdf
export const exportActivities = createAsyncThunk(
  "activities/export",
  async ({ format = "xlsx", filters = {} } = {}, { rejectWithValue }) => {
    try {
      const qs = buildActivityFilterQuery(filters);
      qs.set("format", format);

      const response = await apiClient.get(`/admin/crm/activities/export?${qs}`, {
        responseType: "blob",
      });

      const ext = format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xlsx";
      triggerBlobDownload(response.data, buildFilename("activities", ext));
      return { format };
    } catch (error) {
      console.error("Export activities error:", error);
      let msg = "Failed to export activities";
      const data = error.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          msg = parsed?.message || msg;
        } catch {
          /* ignore */
        }
      } else if (data?.message) {
        msg = data.message;
      }
      return rejectWithValue(msg);
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  activities: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    type: "",
    status: "",
    priority: "",
    assigned_to: "",
    related_type: "",
    date_from: "",
    date_to: "",
    sort_by: "start_at",
    sort_order: "desc",
  },

  currentActivity: null,
  currentActivityLoading: false,
  currentActivityError: null,

  options: FALLBACK_ACTIVITY_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

    // Lookups for modal dropdowns
  employeesLookup: [],
  employeesLookupLoading: false,
  employeesLookupError: null,

  leadsLookup: [],
  leadsLookupLoading: false,
  leadsLookupError: null,

  customersLookup: [],
  customersLookupLoading: false,
  customersLookupError: null,

  opportunitiesLookup: [],
  opportunitiesLookupLoading: false,
  opportunitiesLookupError: null,

  submitting: false,
  submittingError: null,
  exporting: false,
  exportError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const activitySlice = createSlice({
  name: "activities",
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
    clearCurrentActivity: (state) => {
      state.currentActivity = null;
      state.currentActivityError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.submittingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchActivityFormOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(fetchActivityFormOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.optionsLoaded = true;
        state.options = {
          ...FALLBACK_ACTIVITY_OPTIONS,
          ...(action.payload || {}),
        };
      })
      .addCase(fetchActivityFormOptions.rejected, (state, action) => {
        state.optionsLoading = false;
        state.optionsError = action.payload;
      })

      // ── List ──
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        const d = action.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        const list = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
        state.activities = list;
        state.totalCount = paginated?.total ?? list.length;
        state.currentPage = paginated?.current_page ?? state.currentPage;
        state.perPage = paginated?.per_page ?? state.perPage;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Single ──
      .addCase(fetchActivityById.pending, (state) => {
        state.currentActivityLoading = true;
        state.currentActivityError = null;
      })
      .addCase(fetchActivityById.fulfilled, (state, action) => {
        state.currentActivityLoading = false;
        state.currentActivity = action.payload;
      })
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.currentActivityLoading = false;
        state.currentActivityError = action.payload;
      })

            // ── Employees lookup ──
      .addCase(fetchActivityEmployees.pending, (state) => {
        state.employeesLookupLoading = true;
        state.employeesLookupError = null;
      })
      .addCase(fetchActivityEmployees.fulfilled, (state, action) => {
        state.employeesLookupLoading = false;
        const d = action.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        state.employeesLookup = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
      })
      .addCase(fetchActivityEmployees.rejected, (state, action) => {
        state.employeesLookupLoading = false;
        state.employeesLookupError = action.payload;
      })

      // ── Leads lookup ──
      .addCase(fetchLeadLookup.pending, (state) => {
        state.leadsLookupLoading = true;
        state.leadsLookupError = null;
      })
      .addCase(fetchLeadLookup.fulfilled, (state, action) => {
        state.leadsLookupLoading = false;
        const d = action.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        state.leadsLookup = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
      })
      .addCase(fetchLeadLookup.rejected, (state, action) => {
        state.leadsLookupLoading = false;
        state.leadsLookupError = action.payload;
      })

      // ── Customers lookup ──
      .addCase(fetchCustomerLookup.pending, (state) => {
        state.customersLookupLoading = true;
        state.customersLookupError = null;
      })
      .addCase(fetchCustomerLookup.fulfilled, (state, action) => {
        state.customersLookupLoading = false;
        const d = action.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        state.customersLookup = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
      })
      .addCase(fetchCustomerLookup.rejected, (state, action) => {
        state.customersLookupLoading = false;
        state.customersLookupError = action.payload;
      })

      // ── Opportunities lookup ──
      .addCase(fetchOpportunityLookup.pending, (state) => {
        state.opportunitiesLookupLoading = true;
        state.opportunitiesLookupError = null;
      })
      .addCase(fetchOpportunityLookup.fulfilled, (state, action) => {
        state.opportunitiesLookupLoading = false;
        const d = action.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        state.opportunitiesLookup = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
      })
      .addCase(fetchOpportunityLookup.rejected, (state, action) => {
        state.opportunitiesLookupLoading = false;
        state.opportunitiesLookupError = action.payload;
      })

      // ── Create ──
      .addCase(createActivity.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.activities.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Update ──
      .addCase(updateActivity.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.activities.findIndex((a) => a.id === updated.id);
        if (idx !== -1)
          state.activities[idx] = { ...state.activities[idx], ...updated };
        if (state.currentActivity?.id === updated.id) {
          state.currentActivity = { ...state.currentActivity, ...updated };
        }
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Delete ──
      .addCase(deleteActivityApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(deleteActivityApi.fulfilled, (state, action) => {
        state.submitting = false;
        state.activities = state.activities.filter(
          (a) => a.id !== action.payload.id,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentActivity?.id === action.payload.id) {
          state.currentActivity = null;
        }
      })
      .addCase(deleteActivityApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Export ──
      .addCase(exportActivities.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportActivities.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportActivities.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentActivity,
  clearError,
} = activitySlice.actions;

export default activitySlice.reducer;