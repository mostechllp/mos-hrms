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
  order: Number(api.sort_order ?? api.order) || 0,
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
// SHAPE CONVERTERS — Customer
// ----------------------------------------------------
export const fromCustomerCategoryApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromCustomerIndustryApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromCustomerStatusApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  color: api.color || "#6b7280",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromCustomerTypeApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
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
// SHAPE CONVERTERS — Opportunity
// ----------------------------------------------------

export const fromOpportunityStageApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.stage_name || "",
  color: api.color || "#6b7280",
  defaultProbability: Number(
    api.default_probability ?? api.defaultProbability ?? 0,
  ),
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromLostReasonApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.reason || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromWinReasonApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.reason || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromOpportunityTypeApi = (api = {}) => ({
  id: api.id,
  name: api.name || api.type_name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

// ----------------------------------------------------
// OPPORTUNITY SETTINGS — thunks
// ----------------------------------------------------
// NOTE: these hit /admin/crm/opportunity-settings/... (different base
// than lead-settings). We reuse a small wrapper so `makeListThunks`
// stays untouched.

const makeOpportunityListThunks = (prefix, name, path, normalize) => {
  const apiBase = `/admin/crm/opportunity-settings/${path}`;

  const fetch = createAsyncThunk(
    `${prefix}/fetchOpportunity_${path}`,
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
    `${prefix}/createOpportunity_${path}`,
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
    `${prefix}/updateOpportunity_${path}`,
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
    `${prefix}/deleteOpportunity_${path}`,
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

// Stages
const stageThunks = makeOpportunityListThunks(
  "crmSettings",
  "opportunity stage",
  "stages",
  fromOpportunityStageApi,
);
export const fetchOpportunityStages = stageThunks.fetch;
export const createOpportunityStage = stageThunks.create;
export const updateOpportunityStage = stageThunks.update;
export const deleteOpportunityStageApi = stageThunks.remove;

// Lost reasons
const lostReasonThunks = makeOpportunityListThunks(
  "crmSettings",
  "lost reason",
  "lost-reasons",
  fromLostReasonApi,
);
export const fetchLostReasons = lostReasonThunks.fetch;
export const createLostReason = lostReasonThunks.create;
export const updateLostReason = lostReasonThunks.update;
export const deleteLostReasonApi = lostReasonThunks.remove;

// Win reasons
const winReasonThunks = makeOpportunityListThunks(
  "crmSettings",
  "win reason",
  "win-reasons",
  fromWinReasonApi,
);
export const fetchWinReasons = winReasonThunks.fetch;
export const createWinReason = winReasonThunks.create;
export const updateWinReason = winReasonThunks.update;
export const deleteWinReasonApi = winReasonThunks.remove;

// Types
const oppTypeThunks = makeOpportunityListThunks(
  "crmSettings",
  "opportunity type",
  "types",
  fromOpportunityTypeApi,
);
export const fetchOpportunityTypes = oppTypeThunks.fetch;
export const createOpportunityType = oppTypeThunks.create;
export const updateOpportunityType = oppTypeThunks.update;
export const deleteOpportunityTypeApi = oppTypeThunks.remove;

// ----------------------------------------------------
// CUSTOMER SETTINGS — thunks
// ----------------------------------------------------
const makeCustomerListThunks = (prefix, name, path, normalize) => {
  const apiBase = `/admin/crm/customer-settings/${path}`;

  const fetch = createAsyncThunk(
    `${prefix}/fetchCustomer_${path}`,
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
    `${prefix}/createCustomer_${path}`,
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
    `${prefix}/updateCustomer_${path}`,
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
    `${prefix}/deleteCustomer_${path}`,
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

// Categories
const customerCategoryThunks = makeCustomerListThunks(
  "crmSettings",
  "customer category",
  "categories",
  fromCustomerCategoryApi,
);
export const fetchCustomerCategories = customerCategoryThunks.fetch;
export const createCustomerCategory = customerCategoryThunks.create;
export const updateCustomerCategory = customerCategoryThunks.update;
export const deleteCustomerCategoryApi = customerCategoryThunks.remove;

// Industries
const customerIndustryThunks = makeCustomerListThunks(
  "crmSettings",
  "customer industry",
  "industries",
  fromCustomerIndustryApi,
);
export const fetchCustomerIndustries = customerIndustryThunks.fetch;
export const createCustomerIndustry = customerIndustryThunks.create;
export const updateCustomerIndustry = customerIndustryThunks.update;
export const deleteCustomerIndustryApi = customerIndustryThunks.remove;

// Statuses
const customerStatusThunks = makeCustomerListThunks(
  "crmSettings",
  "customer status",
  "statuses",
  fromCustomerStatusApi,
);
export const fetchCustomerStatuses = customerStatusThunks.fetch;
export const createCustomerStatus = customerStatusThunks.create;
export const updateCustomerStatus = customerStatusThunks.update;
export const deleteCustomerStatusApi = customerStatusThunks.remove;

// Types
const customerTypeThunks = makeCustomerListThunks(
  "crmSettings",
  "customer type",
  "types",
  fromCustomerTypeApi,
);
export const fetchCustomerTypes = customerTypeThunks.fetch;
export const createCustomerType = customerTypeThunks.create;
export const updateCustomerType = customerTypeThunks.update;
export const deleteCustomerTypeApi = customerTypeThunks.remove;

// ----------------------------------------------------
// SHAPE CONVERTERS — Activity
// ----------------------------------------------------
export const fromActivityTypeApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromReminderOptionApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  minutes: Number(api.minutes ?? api.duration_minutes ?? 0),
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromActivityPriorityApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  color: api.color || "#6b7280",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

// ----------------------------------------------------
// ACTIVITY SETTINGS — thunks
// ----------------------------------------------------
const makeActivityListThunks = (prefix, name, path, normalize) => {
  const apiBase = `/admin/crm/activity-settings/${path}`;

  const fetch = createAsyncThunk(
    `${prefix}/fetchActivity_${path}`,
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
    `${prefix}/createActivity_${path}`,
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
    `${prefix}/updateActivity_${path}`,
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
    `${prefix}/deleteActivity_${path}`,
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

// Types
const activityTypeThunks = makeActivityListThunks(
  "crmSettings",
  "activity type",
  "types",
  fromActivityTypeApi,
);
export const fetchActivityTypes = activityTypeThunks.fetch;
export const createActivityType = activityTypeThunks.create;
export const updateActivityType = activityTypeThunks.update;
export const deleteActivityTypeApi = activityTypeThunks.remove;

// Reminders
const reminderOptionThunks = makeActivityListThunks(
  "crmSettings",
  "reminder option",
  "reminders",
  fromReminderOptionApi,
);
export const fetchReminderOptions = reminderOptionThunks.fetch;
export const createReminderOption = reminderOptionThunks.create;
export const updateReminderOption = reminderOptionThunks.update;
export const deleteReminderOptionApi = reminderOptionThunks.remove;

// Priorities
const activityPriorityThunks = makeActivityListThunks(
  "crmSettings",
  "activity priority",
  "priorities",
  fromActivityPriorityApi,
);
export const fetchActivityPriorities = activityPriorityThunks.fetch;
export const createActivityPriority = activityPriorityThunks.create;
export const updateActivityPriority = activityPriorityThunks.update;
export const deleteActivityPriorityApi = activityPriorityThunks.remove;

// Default Duration — specific thunk
// Default Duration — specific thunk
export const fetchActivityDuration = createAsyncThunk(
  "crmSettings/fetchActivityDuration",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/activity-settings/duration");
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to load duration");

      // 👈 Read default_duration_minutes, fallback to other keys just in case
      return Number(
        data?.default_duration_minutes ??
          data?.duration ??
          data?.value ??
          data ??
          60,
      );
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load duration");
    }
  },
);

export const updateActivityDuration = createAsyncThunk(
  "crmSettings/updateActivityDuration",
  async (minutes, { rejectWithValue }) => {
    try {
      // 👈 Send the correct key the backend expects
      const res = await apiClient.put("/admin/crm/activity-settings/duration", {
        default_duration_minutes: minutes,
      });
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update duration");

      // 👈 Read the correct key from the response
      return Number(
        data?.default_duration_minutes ?? data?.duration ?? minutes,
      );
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update duration");
    }
  },
);

// ----------------------------------------------------
// SHAPE CONVERTERS — Product
// ----------------------------------------------------
export const fromProductCategoryApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromProductUnitApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromProductCurrencyApi = (api = {}) => ({
  id: api.id,
  code: api.code || "",
  symbol: api.symbol || "",
  isDefault: !!api.is_default,
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromProductTaxApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  rate: Number(api.rate ?? api.tax_rate ?? 0),
  isDefault: !!api.is_default,
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

// ----------------------------------------------------
// PRODUCT SETTINGS — thunks
// ----------------------------------------------------
const makeProductListThunks = (prefix, name, path, normalize) => {
  const apiBase = `/admin/crm/product-settings/${path}`;

  const fetch = createAsyncThunk(
    `${prefix}/fetchProduct_${path}`,
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
    `${prefix}/createProduct_${path}`,
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
    `${prefix}/updateProduct_${path}`,
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
    `${prefix}/deleteProduct_${path}`,
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

// Categories
const productCategoryThunks = makeProductListThunks(
  "crmSettings",
  "product category",
  "categories",
  fromProductCategoryApi,
);
export const fetchProductCategories = productCategoryThunks.fetch;
export const createProductCategory = productCategoryThunks.create;
export const updateProductCategory = productCategoryThunks.update;
export const deleteProductCategoryApi = productCategoryThunks.remove;

// Units
const productUnitThunks = makeProductListThunks(
  "crmSettings",
  "product unit",
  "units",
  fromProductUnitApi,
);
export const fetchProductUnits = productUnitThunks.fetch;
export const createProductUnit = productUnitThunks.create;
export const updateProductUnit = productUnitThunks.update;
export const deleteProductUnitApi = productUnitThunks.remove;

// Currencies
const productCurrencyThunks = makeProductListThunks(
  "crmSettings",
  "product currency",
  "currencies",
  fromProductCurrencyApi,
);
export const fetchProductCurrencies = productCurrencyThunks.fetch;
export const createProductCurrency = productCurrencyThunks.create;
export const updateProductCurrency = productCurrencyThunks.update;
export const deleteProductCurrencyApi = productCurrencyThunks.remove;

// Taxes
const productTaxThunks = makeProductListThunks(
  "crmSettings",
  "product tax",
  "taxes",
  fromProductTaxApi,
);
export const fetchProductTaxes = productTaxThunks.fetch;
export const createProductTax = productTaxThunks.create;
export const updateProductTax = productTaxThunks.update;
export const deleteProductTaxApi = productTaxThunks.remove;

// Set Default Currency
export const setDefaultCurrencyApi = createAsyncThunk(
  "crmSettings/setDefaultCurrency",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(
        `/admin/crm/product-settings/currencies/${id}/set-default`,
      );
      const { ok, data, message } = unwrap(res.data);
      if (!ok)
        return rejectWithValue(message || "Failed to set default currency");
      return { id, ...data };
    } catch (e) {
      return rejectWithValue(
        flattenErrors(e) || "Failed to set default currency",
      );
    }
  },
);

// Set Default Tax
export const setDefaultTaxApi = createAsyncThunk(
  "crmSettings/setDefaultTax",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(
        `/admin/crm/product-settings/taxes/${id}/set-default`,
      );
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to set default tax");
      return { id, ...data };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to set default tax");
    }
  },
);

// ----------------------------------------------------
// SHAPE CONVERTERS — Permissions
// ----------------------------------------------------
export const fromCrmPermissionsApi = (api = {}) => {
  const roles = api.roles || [];
  const permissions = api.permissions || {};

  // UI shape: { view_all_customers: ["Super Admin", ...], ... }
  const uiPermissions = {};
  Object.keys(permissions).forEach((key) => {
    const entries = permissions[key] || [];
    uiPermissions[key] = entries
      .filter((e) => e.is_allowed)
      .map((e) => {
        const role = roles.find((r) => r.id === e.role_id);
        return role ? role.name : `Role #${e.role_id}`;
      });
  });

  return {
    roles,
    permissionKeys: api.permission_keys || Object.keys(permissions),
    data: uiPermissions,
  };
};

// Payload for the "all" endpoint — flat array of entries
const toCrmPermissionsAllPayload = (uiPermissions, roles, permissionKeys) => {
  const flat = [];
  permissionKeys.forEach((key) => {
    roles.forEach((role) => {
      flat.push({
        role_id: role.id,
        permission_key: key,
        is_allowed: (uiPermissions[key] || []).includes(role.name),
      });
    });
  });
  return { permissions: flat };
};

// Payload for the "single role" endpoint — { permission_key: boolean }
const toCrmPermissionsRolePayload = (uiPermissions, role, permissionKeys) => {
  const map = {};
  permissionKeys.forEach((key) => {
    map[key] = (uiPermissions[key] || []).includes(role.name);
  });
  return { permissions: map };
};

// ----------------------------------------------------
// PERMISSIONS — thunks
// ----------------------------------------------------
export const fetchCrmPermissions = createAsyncThunk(
  "crmSettings/fetchCrmPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/crm-permissions");
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to load permissions");
      return fromCrmPermissionsApi(data);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load permissions");
    }
  },
);

// PUT all permissions at once
export const updateCrmPermissionsAll = createAsyncThunk(
  "crmSettings/updateCrmPermissionsAll",
  async ({ uiPermissions, roles, permissionKeys }, { rejectWithValue }) => {
    try {
      const payload = toCrmPermissionsAllPayload(
        uiPermissions,
        roles,
        permissionKeys,
      );
      const res = await apiClient.put("/admin/crm/crm-permissions", payload);
      const { ok, data, message } = unwrap(res.data);
      if (!ok)
        return rejectWithValue(message || "Failed to update permissions");
      return fromCrmPermissionsApi(data);
    } catch (e) {
      return rejectWithValue(
        flattenErrors(e) || "Failed to update permissions",
      );
    }
  },
);

// PUT for a single role
export const updateCrmPermissionsForRole = createAsyncThunk(
  "crmSettings/updateCrmPermissionsForRole",
  async ({ uiPermissions, role, permissionKeys }, { rejectWithValue }) => {
    try {
      const payload = toCrmPermissionsRolePayload(
        uiPermissions,
        role,
        permissionKeys,
      );
      const res = await apiClient.put(
        `/admin/crm/crm-permissions/roles/${role.id}`,
        payload,
      );
      const { ok, data, message } = unwrap(res.data);
      if (!ok)
        return rejectWithValue(message || "Failed to update role permissions");
      return fromCrmPermissionsApi(data);
    } catch (e) {
      return rejectWithValue(
        flattenErrors(e) || "Failed to update role permissions",
      );
    }
  },
);

// ----------------------------------------------------
// SHAPE CONVERTERS — Quotation
// ----------------------------------------------------
export const fromQuotationCurrencyApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromQuotationPaymentTermApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

export const fromQuotationTaxApi = (api = {}) => ({
  id: api.id,
  name: api.name || "",
  rate: Number(api.rate ?? 0),
  isDefault: !!api.is_default,
  sortOrder: Number(api.sort_order ?? api.order ?? 0),
});

// ----------------------------------------------------
// QUOTATION SETTINGS — thunks
// ----------------------------------------------------
const makeQuotationListThunks = (prefix, name, path, normalize) => {
  const apiBase = `/admin/crm/quotation-settings/${path}`;

  const fetch = createAsyncThunk(
    `${prefix}/fetchQuotation_${path}`,
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
    }
  );

  const create = createAsyncThunk(
    `${prefix}/createQuotation_${path}`,
    async (payload, { rejectWithValue }) => {
      try {
        const res = await apiClient.post(apiBase, payload);
        const { ok, data, message } = unwrap(res.data);
        if (!ok) return rejectWithValue(message || `Failed to create ${name}`);
        return normalize(data?.item ?? data);
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to create ${name}`);
      }
    }
  );

  const update = createAsyncThunk(
    `${prefix}/updateQuotation_${path}`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const res = await apiClient.put(`${apiBase}/${id}`, data);
        const { ok, data: body, message } = unwrap(res.data);
        if (!ok) return rejectWithValue(message || `Failed to update ${name}`);
        return { id, ...normalize(body?.item ?? body ?? {}) };
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to update ${name}`);
      }
    }
  );

  const remove = createAsyncThunk(
    `${prefix}/deleteQuotation_${path}`,
    async (id, { rejectWithValue }) => {
      try {
        const res = await apiClient.delete(`${apiBase}/${id}`);
        const { ok, message } = unwrap(res.data);
        if (ok) return { id };
        return rejectWithValue(message || `Failed to delete ${name}`);
      } catch (e) {
        return rejectWithValue(flattenErrors(e) || `Failed to delete ${name}`);
      }
    }
  );

  return { fetch, create, update, remove };
};

// Currencies
const quotationCurrencyThunks = makeQuotationListThunks("crmSettings", "quotation currency", "currencies", fromQuotationCurrencyApi);
export const fetchQuotationCurrencies = quotationCurrencyThunks.fetch;
export const createQuotationCurrency = quotationCurrencyThunks.create;
export const updateQuotationCurrency = quotationCurrencyThunks.update;
export const deleteQuotationCurrencyApi = quotationCurrencyThunks.remove;

// Payment Terms
const quotationPaymentTermThunks = makeQuotationListThunks("crmSettings", "payment term", "payment-terms", fromQuotationPaymentTermApi);
export const fetchQuotationPaymentTerms = quotationPaymentTermThunks.fetch;
export const createQuotationPaymentTerm = quotationPaymentTermThunks.create;
export const updateQuotationPaymentTerm = quotationPaymentTermThunks.update;
export const deleteQuotationPaymentTermApi = quotationPaymentTermThunks.remove;

// Taxes
const quotationTaxThunks = makeQuotationListThunks("crmSettings", "quotation tax", "taxes", fromQuotationTaxApi);
export const fetchQuotationTaxes = quotationTaxThunks.fetch;
export const createQuotationTax = quotationTaxThunks.create;
export const updateQuotationTax = quotationTaxThunks.update;
export const deleteQuotationTaxApi = quotationTaxThunks.remove;

// Set Default Tax
export const setDefaultQuotationTaxApi = createAsyncThunk(
  "crmSettings/setDefaultQuotationTax",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/admin/crm/quotation-settings/taxes/${id}/set-default`);
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to set default tax");
      return { id, ...data };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to set default tax");
    }
  }
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

  // ── Opportunity Settings buckets ──
  opportunityStages: emptyBucket(),
  lostReasons: emptyBucket(),
  winReasons: emptyBucket(),
  opportunityTypes: emptyBucket(),

  // ── Customer Settings buckets ──
  customerCategories: emptyBucket(),
  customerIndustries: emptyBucket(),
  customerStatuses: emptyBucket(),
  customerTypes: emptyBucket(),

  // ── Activity Settings buckets ──
  activityTypes: emptyBucket(),
  reminderOptions: emptyBucket(),
  activityPriorities: emptyBucket(),

  // ── Product Settings buckets ──
  productCategories: emptyBucket(),
  productUnits: emptyBucket(),
  productCurrencies: emptyBucket(),
  productTaxes: emptyBucket(),

   // ── Quotation Settings buckets ──
  quotationCurrencies: emptyBucket(),
  quotationPaymentTerms: emptyBucket(),
  quotationTaxes: emptyBucket(),

  // Special state for the single duration value
  activityDuration: {
    value: 60,
    loading: false,
    submitting: false,
    error: null,
  },

  // ── Permissions & Notifications ──
  permissions: {
    // Reshaped to include roles + permissionKeys
    // { roles: [], permissionKeys: [], data: { ... } }
    roles: [],
    permissionKeys: [],
    data: null,
    loading: false,
    error: null,
    submitting: false,
    submittingError: null,
  },
  // ── Placeholders for future sections ──
  customer: null,
  activity: null,
  product: null,

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
    clearOpportunitySettings: (s) => {
      s.opportunityStages = emptyBucket();
      s.lostReasons = emptyBucket();
      s.winReasons = emptyBucket();
      s.opportunityTypes = emptyBucket();
    },

    clearCustomerSettings: (s) => {
      s.customerCategories = emptyBucket();
      s.customerIndustries = emptyBucket();
      s.customerStatuses = emptyBucket();
      s.customerTypes = emptyBucket();
    },
    clearActivitySettings: (s) => {
      s.activityTypes = emptyBucket();
      s.reminderOptions = emptyBucket();
      s.activityPriorities = emptyBucket();
      s.activityDuration = {
        value: 60,
        loading: false,
        submitting: false,
        error: null,
      };
    },
    clearProductSettings: (s) => {
      s.productCategories = emptyBucket();
      s.productUnits = emptyBucket();
      s.productCurrencies = emptyBucket();
      s.productTaxes = emptyBucket();
    },
    clearPermissionsAndNotifications: (s) => {
      s.permissions = {
        data: null,
        loading: false,
        error: null,
        submitting: false,
        submittingError: null,
      };
    },
    clearQuotationSettings: (s) => {
      s.quotationCurrencies = emptyBucket();
      s.quotationPaymentTerms = emptyBucket();
      s.quotationTaxes = emptyBucket();
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

    // ── Opportunity Settings buckets ──
    wireBucket(
      builder,
      {
        fetch: fetchOpportunityStages,
        create: createOpportunityStage,
        update: updateOpportunityStage,
        remove: deleteOpportunityStageApi,
      },
      "opportunityStages",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchLostReasons,
        create: createLostReason,
        update: updateLostReason,
        remove: deleteLostReasonApi,
      },
      "lostReasons",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchWinReasons,
        create: createWinReason,
        update: updateWinReason,
        remove: deleteWinReasonApi,
      },
      "winReasons",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchOpportunityTypes,
        create: createOpportunityType,
        update: updateOpportunityType,
        remove: deleteOpportunityTypeApi,
      },
      "opportunityTypes",
      { sortBy: "sortOrder" },
    );

    // ── Customer Settings buckets ──
    wireBucket(
      builder,
      {
        fetch: fetchCustomerCategories,
        create: createCustomerCategory,
        update: updateCustomerCategory,
        remove: deleteCustomerCategoryApi,
      },
      "customerCategories",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchCustomerIndustries,
        create: createCustomerIndustry,
        update: updateCustomerIndustry,
        remove: deleteCustomerIndustryApi,
      },
      "customerIndustries",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchCustomerStatuses,
        create: createCustomerStatus,
        update: updateCustomerStatus,
        remove: deleteCustomerStatusApi,
      },
      "customerStatuses",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchCustomerTypes,
        create: createCustomerType,
        update: updateCustomerType,
        remove: deleteCustomerTypeApi,
      },
      "customerTypes",
      { sortBy: "sortOrder" },
    );

    // ── Activity Settings buckets ──
    wireBucket(
      builder,
      {
        fetch: fetchActivityTypes,
        create: createActivityType,
        update: updateActivityType,
        remove: deleteActivityTypeApi,
      },
      "activityTypes",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchReminderOptions,
        create: createReminderOption,
        update: updateReminderOption,
        remove: deleteReminderOptionApi,
      },
      "reminderOptions",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchActivityPriorities,
        create: createActivityPriority,
        update: updateActivityPriority,
        remove: deleteActivityPriorityApi,
      },
      "activityPriorities",
      { sortBy: "sortOrder" },
    );

    // ── Product Settings buckets ──
    wireBucket(
      builder,
      {
        fetch: fetchProductCategories,
        create: createProductCategory,
        update: updateProductCategory,
        remove: deleteProductCategoryApi,
      },
      "productCategories",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchProductUnits,
        create: createProductUnit,
        update: updateProductUnit,
        remove: deleteProductUnitApi,
      },
      "productUnits",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchProductCurrencies,
        create: createProductCurrency,
        update: updateProductCurrency,
        remove: deleteProductCurrencyApi,
      },
      "productCurrencies",
      { sortBy: "sortOrder" },
    );
    wireBucket(
      builder,
      {
        fetch: fetchProductTaxes,
        create: createProductTax,
        update: updateProductTax,
        remove: deleteProductTaxApi,
      },
      "productTaxes",
      { sortBy: "sortOrder" },
    );

    // ── Quotation Settings buckets ──
    wireBucket(builder, { fetch: fetchQuotationCurrencies, create: createQuotationCurrency, update: updateQuotationCurrency, remove: deleteQuotationCurrencyApi }, "quotationCurrencies", { sortBy: "sortOrder" });
    wireBucket(builder, { fetch: fetchQuotationPaymentTerms, create: createQuotationPaymentTerm, update: updateQuotationPaymentTerm, remove: deleteQuotationPaymentTermApi }, "quotationPaymentTerms", { sortBy: "sortOrder" });
    wireBucket(builder, { fetch: fetchQuotationTaxes, create: createQuotationTax, update: updateQuotationTax, remove: deleteQuotationTaxApi }, "quotationTaxes", { sortBy: "sortOrder" });

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

    // Activity Duration
    builder
      .addCase(fetchActivityDuration.pending, (s) => {
        s.activityDuration.loading = true;
        s.activityDuration.error = null;
      })
      .addCase(fetchActivityDuration.fulfilled, (s, a) => {
        s.activityDuration.loading = false;
        s.activityDuration.value = a.payload;
      })
      .addCase(fetchActivityDuration.rejected, (s, a) => {
        s.activityDuration.loading = false;
        s.activityDuration.error = a.payload;
      })
      .addCase(updateActivityDuration.pending, (s) => {
        s.activityDuration.submitting = true;
        s.activityDuration.error = null;
      })
      .addCase(updateActivityDuration.fulfilled, (s, a) => {
        s.activityDuration.submitting = false;
        s.activityDuration.value = a.payload;
      })
      .addCase(updateActivityDuration.rejected, (s, a) => {
        s.activityDuration.submitting = false;
        s.activityDuration.error = a.payload;
      });

    builder
      .addCase(setDefaultCurrencyApi.fulfilled, (s, a) => {
        s.productCurrencies.data = s.productCurrencies.data.map((c) => ({
          ...c,
          isDefault: c.id === a.payload.id,
        }));
      })
      .addCase(setDefaultTaxApi.fulfilled, (s, a) => {
        s.productTaxes.data = s.productTaxes.data.map((t) => ({
          ...t,
          isDefault: t.id === a.payload.id,
        }));
      });

    // Permissions
    builder
      .addCase(fetchCrmPermissions.pending, (s) => {
        s.permissions.loading = true;
        s.permissions.error = null;
      })
      .addCase(fetchCrmPermissions.fulfilled, (s, a) => {
        s.permissions.loading = false;
        s.permissions.roles = a.payload.roles;
        s.permissions.permissionKeys = a.payload.permissionKeys;
        s.permissions.data = a.payload.data;
      })
      .addCase(fetchCrmPermissions.rejected, (s, a) => {
        s.permissions.loading = false;
        s.permissions.error = a.payload;
      });
    builder
      .addCase(updateCrmPermissionsAll.pending, (s) => {
        s.permissions.submitting = true;
        s.permissions.submittingError = null;
      })
      .addCase(updateCrmPermissionsAll.fulfilled, (s, a) => {
        s.permissions.submitting = false;
        s.permissions.roles = a.payload.roles;
        s.permissions.permissionKeys = a.payload.permissionKeys;
        s.permissions.data = a.payload.data;
      })
      .addCase(updateCrmPermissionsAll.rejected, (s, a) => {
        s.permissions.submitting = false;
        s.permissions.submittingError = a.payload;
      })

      .addCase(updateCrmPermissionsForRole.pending, (s) => {
        s.permissions.submitting = true;
        s.permissions.submittingError = null;
      })
      .addCase(updateCrmPermissionsForRole.fulfilled, (s, a) => {
        s.permissions.submitting = false;
        s.permissions.roles = a.payload.roles;
        s.permissions.permissionKeys = a.payload.permissionKeys;
        s.permissions.data = a.payload.data;
      })
      .addCase(updateCrmPermissionsForRole.rejected, (s, a) => {
        s.permissions.submitting = false;
        s.permissions.submittingError = a.payload;
      });

       builder.addCase(setDefaultQuotationTaxApi.fulfilled, (s, a) => {
      s.quotationTaxes.data = s.quotationTaxes.data.map(t => ({ ...t, isDefault: t.id === a.payload.id }));
    });
  },
});

export const { clearLeadSettings, clearOpportunitySettings } =
  crmSettingsSlice.actions;
export default crmSettingsSlice.reducer;
