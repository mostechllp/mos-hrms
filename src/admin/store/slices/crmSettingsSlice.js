// src/admin/store/slices/admin/crmSettingsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

export const fromLeadStatusApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.status_name || "",
  color: api.color || "#6b7280",
  isDefault: !!api.is_default,
  sortOrder: Number(api.sort_order) || 0,
});

export const fromLeadSourceApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.source_name || "",
  order: Number(api.order) || 0,
});

export const fromLeadPriorityApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.priority_name || "",
  color: api.color || "#6b7280",
  sortOrder: Number(api.sort_order ?? api.order) || 0,
});

export const fromQualificationRuleApi = (api = {}) => ({
  id: api.id,
  rule: api.rule || api.name || api.rule_text || "",
  enabled: api.enabled ?? api.is_enabled ?? true,
  order: Number(api.order) || 0,
});

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

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

// Given a possibly-paginated or plain array body, return just the array.
const extractList = (d) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  // Object containing named keys — merge everything that's an array
  if (typeof d === "object") {
    const merged = [];
    Object.values(d).forEach((v) => {
      if (Array.isArray(v)) merged.push(...v);
    });
    if (merged.length) return merged;
  }
  return [];
};

// ----------------------------------------------------
// GENERIC CRUD THUNK FACTORY
// ----------------------------------------------------
/**
 * Build a standard set of CRUD thunks for a "simple list" resource.
 * Pass in:
 *   - prefix        : Redux action prefix (e.g. "crmSettings")
 *   - name          : display name for error messages (e.g. "lead status")
 *   - path          : API path under /admin/crm/lead-settings (e.g. "statuses")
 *   - normalize     : api → ui converter
 */
const makeListThunks = (prefix, name, path, normalize) => {
  const apiBase = `/admin/crm/lead-settings/${path}`;

  const fetch = createAsyncThunk(
    `${prefix}/fetch${path}`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const qs = new URLSearchParams();
        if (params.search) qs.set("search", params.search);
        const url = qs.toString() ? `${apiBase}?${qs}` : apiBase;
        const res = await apiClient.get(url);
        const { ok, data, message } = unwrap(res.data);
        if (!ok) return rejectWithValue(message || `Failed to load ${name}s`);
        return extractList(data).map(normalize);
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to load ${name}s`);
      }
    },
  );

  const create = createAsyncThunk(
    `${prefix}/create${path}`,
    async (payload, { rejectWithValue }) => {
      try {
        const res = await apiClient.post(apiBase, payload);
        const { ok, data, message } = unwrap(res.data);
        if (!ok) return rejectWithValue(message || `Failed to create ${name}`);
        return normalize(data?.item ?? data);
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to create ${name}`);
      }
    },
  );

  const update = createAsyncThunk(
    `${prefix}/update${path}`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const res = await apiClient.put(`${apiBase}/${id}`, data);
        const { ok, data: body, message } = unwrap(res.data);
        if (!ok) return rejectWithValue(message || `Failed to update ${name}`);
        return { id, ...normalize(body?.item ?? body ?? {}) };
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to update ${name}`);
      }
    },
  );

  const remove = createAsyncThunk(
    `${prefix}/delete${path}`,
    async (id, { rejectWithValue }) => {
      try {
        const res = await apiClient.delete(`${apiBase}/${id}`);
        const { ok, message } = unwrap(res.data);
        if (ok) return { id };
        return rejectWithValue(message || `Failed to delete ${name}`);
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to delete ${name}`);
      }
    },
  );

  return { fetch, create, update, remove };
};

// ----------------------------------------------------
// LEAD SETTINGS — specific thunks
// ----------------------------------------------------

// Statuses
const statusThunks = makeListThunks(
  "crmSettings",
  "lead status",
  "statuses",
  fromLeadStatusApi,
);
export const fetchLeadStatuses = statusThunks.fetch;
export const createLeadStatus = statusThunks.create;
export const updateLeadStatus = statusThunks.update;
export const deleteLeadStatusApi = statusThunks.remove;

// Sources
const sourceThunks = makeListThunks(
  "crmSettings",
  "lead source",
  "sources",
  fromLeadSourceApi,
);
export const fetchLeadSources = sourceThunks.fetch;
export const createLeadSource = sourceThunks.create;
export const updateLeadSource = sourceThunks.update;
export const deleteLeadSourceApi = sourceThunks.remove;

// Priorities
const priorityThunks = makeListThunks(
  "crmSettings",
  "lead priority",
  "priorities",
  fromLeadPriorityApi,
);
export const fetchLeadPriorities = priorityThunks.fetch;
export const createLeadPriority = priorityThunks.create;
export const updateLeadPriority = priorityThunks.update;
export const deleteLeadPriorityApi = priorityThunks.remove;

// Qualification rules — GET/POST/PUT/DELETE + PATCH toggle
const ruleThunks = makeListThunks(
  "crmSettings",
  "qualification rule",
  "qualification-rules",
  fromQualificationRuleApi,
);
export const fetchQualificationRules = ruleThunks.fetch;
export const createQualificationRule = ruleThunks.create;
export const updateQualificationRule = ruleThunks.update;
export const deleteQualificationRuleApi = ruleThunks.remove;

// PATCH /admin/crm/lead-settings/qualification-rules/{id}/toggle
export const toggleQualificationRuleApi = createAsyncThunk(
  "crmSettings/toggleQualificationRule",
  async ({ id, enabled }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(
        `/admin/crm/lead-settings/qualification-rules/${id}/toggle`,
        { enabled },
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return { id, enabled, ...(data || {}) };
      return rejectWithValue(message || "Failed to toggle rule");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to toggle rule");
    }
  },
);

// GET /admin/crm/lead-settings — everything in one call
export const fetchAllLeadSettings = createAsyncThunk(
  "crmSettings/fetchAllLeadSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/lead-settings");
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to load CRM settings");
      return {
        statuses: (data?.statuses || []).map(fromLeadStatusApi),
        sources: (data?.sources || []).map(fromLeadSourceApi),
        priorities: (data?.priorities || []).map(fromLeadPriorityApi),
        qualificationRules: (
          data?.qualification_rules ||
          data?.rules ||
          []
        ).map(fromQualificationRuleApi),
      };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load CRM settings");
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const emptyBucket = () => ({
  data: [],
  loading: false,
  error: null,
  submitting: false,
  submittingError: null,
});

const initialState = {
  // ── Lead Settings buckets ──
  leadStatuses: emptyBucket(),
  leadSources: emptyBucket(),
  leadPriorities: emptyBucket(),
  qualificationRules: emptyBucket(),

  // ── Placeholders for future sections ──
  opportunity: null,
  customer: null,
  activity: null,
  product: null,
  permissions: null,
  notifications: null,

  savingAll: false,
  savingAllError: null,
};

// ----------------------------------------------------
// Generic reducer wiring helper
// ----------------------------------------------------
const wireBucket = (builder, thunks, bucketKey, options = {}) => {
  const { sortBy } = options;
  builder;
  builder
    .addCase(thunks.fetch.pending, (s) => {
      s[bucketKey].loading = true;
      s[bucketKey].error = null;
    })
    .addCase(thunks.fetch.fulfilled, (s, a) => {
      s[bucketKey].loading = false;
      s[bucketKey].data = sortBy
        ? [...a.payload].sort((x, y) => (x[sortBy] || 0) - (y[sortBy] || 0))
        : a.payload;
    })
    .addCase(thunks.fetch.rejected, (s, a) => {
      s[bucketKey].loading = false;
      s[bucketKey].error = a.payload;
    })

    .addCase(thunks.create.pending, (s) => {
      s[bucketKey].submitting = true;
      s[bucketKey].submittingError = null;
    })
    .addCase(thunks.create.fulfilled, (s, a) => {
      s[bucketKey].submitting = false;
      if (a.payload) s[bucketKey].data.push(a.payload);
    })
    .addCase(thunks.create.rejected, (s, a) => {
      s[bucketKey].submitting = false;
      s[bucketKey].submittingError = a.payload;
    })

    .addCase(thunks.update.pending, (s) => {
      s[bucketKey].submitting = true;
      s[bucketKey].submittingError = null;
    })
    .addCase(thunks.update.fulfilled, (s, a) => {
      s[bucketKey].submitting = false;
      const u = a.payload;
      const idx = s[bucketKey].data.findIndex((x) => x.id === u.id);
      if (idx !== -1)
        s[bucketKey].data[idx] = { ...s[bucketKey].data[idx], ...u };
    })
    .addCase(thunks.update.rejected, (s, a) => {
      s[bucketKey].submitting = false;
      s[bucketKey].submittingError = a.payload;
    })

    .addCase(thunks.remove.pending, (s) => {
      s[bucketKey].submitting = true;
      s[bucketKey].submittingError = null;
    })
    .addCase(thunks.remove.fulfilled, (s, a) => {
      s[bucketKey].submitting = false;
      s[bucketKey].data = s[bucketKey].data.filter(
        (x) => x.id !== a.payload.id,
      );
    })
    .addCase(thunks.remove.rejected, (s, a) => {
      s[bucketKey].submitting = false;
      s[bucketKey].submittingError = a.payload;
    });
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const crmSettingsSlice = createSlice({
  name: "crmSettings",
  initialState,
  reducers: {
    clearLeadSettings: (s) => {
      s.leadStatuses = emptyBucket();
      s.leadSources = emptyBucket();
      s.leadPriorities = emptyBucket();
      s.qualificationRules = emptyBucket();
    },
  },
  extraReducers: (builder) => {
    wireBucket(
      builder,
      {
        fetch: fetchLeadStatuses,
        create: createLeadStatus,
        update: updateLeadStatus,
        remove: deleteLeadStatusApi,
      },
      "leadStatuses",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchLeadSources,
        create: createLeadSource,
        update: updateLeadSource,
        remove: deleteLeadSourceApi,
      },
      "leadSources",
    );
    wireBucket(
      builder,
      {
        fetch: fetchLeadPriorities,
        create: createLeadPriority,
        update: updateLeadPriority,
        remove: deleteLeadPriorityApi,
      },
      "leadPriorities",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchQualificationRules,
        create: createQualificationRule,
        update: updateQualificationRule,
        remove: deleteQualificationRuleApi,
      },
      "qualificationRules",
    );

    // Fetch-all lead settings
    builder
      .addCase(fetchAllLeadSettings.pending, (s) => {
        s.leadStatuses.loading = true;
        s.leadSources.loading = true;
        s.leadPriorities.loading = true;
        s.qualificationRules.loading = true;
      })
      .addCase(fetchAllLeadSettings.fulfilled, (s, a) => {
        s.leadStatuses.loading = false;
        s.leadStatuses.data = a.payload.statuses;
        s.leadSources.loading = false;
        s.leadSources.data = a.payload.sources;
        s.leadPriorities.loading = false;
        s.leadPriorities.data = a.payload.priorities;
        s.qualificationRules.loading = false;
        s.qualificationRules.data = a.payload.qualificationRules;
      })
      .addCase(fetchAllLeadSettings.rejected, (s, a) => {
        s.leadStatuses.loading = false;
        s.leadStatuses.error = a.payload;
        s.leadSources.loading = false;
        s.leadPriorities.loading = false;
        s.qualificationRules.loading = false;
      });

    // Toggle qualification rule — optimistically flip, then confirm
    builder
      .addCase(toggleQualificationRuleApi.pending, (s, a) => {
        const { id, enabled } = a.meta.arg;
        const idx = s.qualificationRules.data.findIndex((r) => r.id === id);
        if (idx !== -1) s.qualificationRules.data[idx].enabled = enabled;
      })
      .addCase(toggleQualificationRuleApi.fulfilled, (s, a) => {
        const { id, enabled } = a.payload;
        const idx = s.qualificationRules.data.findIndex((r) => r.id === id);
        if (idx !== -1) s.qualificationRules.data[idx].enabled = enabled;
      })
      .addCase(toggleQualificationRuleApi.rejected, (s, a) => {
        // rollback
        const { id, enabled } = a.meta.arg;
        const idx = s.qualificationRules.data.findIndex((r) => r.id === id);
        if (idx !== -1) s.qualificationRules.data[idx].enabled = !enabled;
        s.qualificationRules.error = a.payload;
      });
  },
});

export const { clearLeadSettings } = crmSettingsSlice.actions;
export default crmSettingsSlice.reducer;
