// src/admin/store/slices/opportunitySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallbacks (used until form-options loads) ──
export const FALLBACK_OPPORTUNITY_OPTIONS = {
  customers: [],       // [{ id, company_name }]
  contact_persons: [], // [{ id, name }] or [string]
  products_services: [], // [{ id, name }] or [string]
  lead_sources: ["Referral", "Website", "Sales", "Other"],
  stages: ["New", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"],
  priorities: ["Low", "Medium", "High"],
  currencies: ["INR", "USD", "AED", "GBP", "EUR", "SGD"],
  sales_people: [],   // [{ id, name }]
  sales_teams: [],    // [{ id, name }] or [string]
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------
// Normalize an activity embedded in the opportunity detail response.
// The API returns the full nested `assigned_employee.employee` object.
const normalizeEmbeddedActivity = (a = {}) => {
  const emp = a.assigned_employee || {};
  const profile = emp.employee || {};
  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    emp.username ||
    emp.email ||
    `Employee #${a.assigned_employee_id ?? "—"}`;

  return {
    id: a.id,
    title: a.title || a.subject || "",
    type: a.activity_type || a.type || "Call",
    priority: a.priority || "Medium",
    status: a.status || "Planned",
    reminder: a.reminder || "None",
    description: a.description || "",

    relatedToType: a.related_record_type || "",
    relatedToId: a.related_record_id ?? "",

    assignedToId: a.assigned_employee_id ?? emp.id ?? "",
    assignedTo: fullName,

    startAt: a.start_date_time || a.start_at || "",
    endAt: a.end_date_time || a.end_at || "",
    createdAt: a.created_at || "",
    updatedAt: a.updated_at || "",
  };
};
// API → Form
// API → Form
export const fromOpportunityApi = (api = {}) => {
  const customer = api.customer || {};
  const owner = api.assigned_salesperson || api.assigned_to || api.owner || {};
  const products = Array.isArray(api.products)
    ? api.products
    : Array.isArray(api.products_services)
      ? api.products_services
      : api.product
        ? [api.product]
        : [];

  return {
    id: api.id,
    opportunityId: api.opportunity_id || api.opportunity_number || `OPP-${api.id}`,
    name: api.name || api.title || "",

    // Customer
    customerId: api.customer_id ?? customer.id ?? "",
    customerName:
      api.customer_name ||
      customer.company_name ||
      customer.name ||
      "—",

    // Contact
    contactPersonId: api.contact_person_id ?? api.contact_id ?? "",
    contactPerson:
      api.contact_person_name ||
      api.contact_person ||
      customer.contact_person_name ||
      "—",

    // Products
    products,
    productNames: products.map((p) =>
      typeof p === "string" ? p : p.name || p.product_name || "",
    ),
    productDisplay: api.product_display || products.join(", "),

    // Meta
    leadSource: api.lead_source || api.source || "",
    description: api.description || "",

    // Sales
    estimatedValue: Number(api.estimated_value ?? api.value) || 0,
    formattedValue: api.formatted_value || null,
    currency: api.currency || "INR",
    stage: api.stage || "New",
    stageBadge: api.stage_badge || null,
    probability: Number(api.probability) || 0,

    expectedClose:
      api.expected_closing_date?.split("T")[0] ||
      api.expected_close_date?.split("T")[0] ||
      "",
    formattedExpectedClose: api.formatted_expected_closing_date || null,

    assignedToId:
      api.assigned_salesperson_id ??
      api.assigned_to_id ??
      owner.id ??
      "",
    assignedTo:
      api.assigned_salesperson_name ||
      owner.name ||
      `${owner.first_name || ""} ${owner.last_name || ""}`.trim() ||
      "—",
    assignedSalesperson: owner,

    salesTeamId: api.sales_team_id ?? api.sales_team?.id ?? "",
    salesTeam:
      api.sales_team_name ||
      api.sales_team?.name ||
      (typeof api.sales_team === "string" ? api.sales_team : "") ||
      "",

    priority: api.priority || "Medium",
    priorityBadge: api.priority_badge || null,

    // Additional
    competitor: api.competitor || "",
    requirements: api.customer_requirements || api.requirements || "",
    decisionMaker: api.decision_maker || "",
    nextAction: api.next_action || "",
    notes: api.notes || "",

    // Relations
    attachments: Array.isArray(api.attachments) ? api.attachments : [],
    quotations: Array.isArray(api.quotations) ? api.quotations : [],
    activities: Array.isArray(api.activities)
  ? api.activities.map(normalizeEmbeddedActivity)
  : [],
    creator: api.creator || null,

    createdAt: api.created_at || "",
    updatedAt: api.updated_at || "",
  };
};

export const toOpportunityApi = (form = {}) => ({
  name: (form.name || "").trim(),
  customer_id: form.customerId ? Number(form.customerId) : null,
  contact_person_id: form.contactPersonId ? Number(form.contactPersonId) : null,
  contact_person: form.contactPerson || "",
  products: Array.isArray(form.productNames) ? form.productNames : [],
  lead_source: form.leadSource || "",
  description: form.description || "",
  estimated_value: Number(form.estimatedValue) || 0,
  currency: form.currency || "INR",
  stage: form.stage || "New",
  probability: Number(form.probability) || 0,

  // ✅ renamed to match the list response
  expected_closing_date: form.expectedClose || "",

  assigned_salesperson_id: form.assignedToId ? Number(form.assignedToId) : null,
  sales_team: form.salesTeam || null,
  priority: form.priority || "Medium",

  competitor: form.competitor || "",

  // ✅ renamed: backend uses `customer_requirements`
  customer_requirements: form.requirements || "",

  decision_maker: form.decisionMaker || "",
  next_action: form.nextAction || "",
  notes: form.notes || "",
});
// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildOpportunityQuery = (params = {}) => {
  const {
    search = "",
    stage = "",
    customer_id = "",
    assigned_to = "",
    product = "",
    priority = "",
    date_from = "",
    date_to = "",
    sort_by = "",
    sort_order = "",
  } = params;
  return new URLSearchParams({
    ...(search && { search }),
    ...(stage && { stage }),
    ...(customer_id && { customer_id }),
    ...(assigned_to && { assigned_to }),
    ...(product && { product }),
    ...(priority && { priority }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
  });
};

// ----------------------------------------------------
// MULTIPART BUILDER
// ----------------------------------------------------
/**
 * Convert the opportunity form into a multipart FormData:
 *  - scalars → string values (empty strings sent as "" so backend can clear them)
 *  - arrays  → `key[]` entries (Laravel parses them as arrays)
 *  - files   → `attachments[]` entries
 *
 * Laravel specific rules:
 *  - null   → send empty string (Laravel converts to null on validation `nullable`)
 *  - false  → send "0"
 *  - true   → send "1"
 */
const buildOpportunityFormData = (form = {}, files = []) => {
  const fd = new FormData();

  const append = (key, value) => {
    if (value === undefined) return;
    if (value === null) {
      fd.append(key, "");
      return;
    }
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
      return;
    }
    fd.append(key, String(value));
  };

  // ── Scalars ──
  append("name", (form.name || "").trim());
  append("customer_id", form.customerId ? Number(form.customerId) : "");
  append("contact_person_id", form.contactPersonId ? Number(form.contactPersonId) : "");
  append("contact_person", form.contactPerson || "");
  append("lead_source", form.leadSource || "");
  append("description", form.description || "");
  append("estimated_value", Number(form.estimatedValue) || 0);
  append("currency", form.currency || "INR");
  append("stage", form.stage || "New");
  append("probability", Number(form.probability) || 0);
  append("expected_closing_date", form.expectedClose || "");
  append("assigned_salesperson_id", form.assignedToId ? Number(form.assignedToId) : "");
  append("sales_team", form.salesTeam || "");
  append("priority", form.priority || "Medium");
  append("competitor", form.competitor || "");
  append("customer_requirements", form.requirements || "");
  append("decision_maker", form.decisionMaker || "");
  append("next_action", form.nextAction || "");
  append("notes", form.notes || "");

  // ── Arrays ──
  const products = Array.isArray(form.productNames) ? form.productNames : [];
  products.forEach((p) => fd.append("products[]", p));

  // ── Files ──
  (files || []).forEach((f) => fd.append("attachments[]", f));

  return fd;
};

const unwrap = (body) => {
  if (!body) return { ok: true, data: null, message: "" };
  const hasFlag = body.status !== undefined || body.success !== undefined;
  const ok = !hasFlag || body.status === "success" || body.success === true;
  return { ok, data: body.data ?? body, message: body.message };
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

// GET /admin/crm/opportunities/form-options
export const fetchOpportunityFormOptions = createAsyncThunk(
  "opportunities/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/opportunities/form-options");
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load form options");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to load form options",
      );
    }
  },
);

// GET /admin/crm/opportunities
export const fetchOpportunities = createAsyncThunk(
  "opportunities/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 15 } = params;
      const qs = buildOpportunityQuery(params);
      qs.set("page", page);
      qs.set("per_page", perPage);
      const res = await apiClient.get(`/admin/crm/opportunities?${qs}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch opportunities");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to fetch opportunities",
      );
    }
  },
);

// GET /admin/crm/opportunities/stats
export const fetchOpportunityStats = createAsyncThunk(
  "opportunities/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/opportunities/stats");
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load stats");
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to load stats");
    }
  },
);

// GET /admin/crm/opportunities/pipeline
export const fetchOpportunityPipeline = createAsyncThunk(
  "opportunities/fetchPipeline",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = buildOpportunityQuery(params);
      const res = await apiClient.get(
        `/admin/crm/opportunities/pipeline?${qs}`,
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load pipeline");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to load pipeline",
      );
    }
  },
);

// GET /admin/crm/opportunities/{id}
export const fetchOpportunityById = createAsyncThunk(
  "opportunities/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/crm/opportunities/${id}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch opportunity");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to fetch opportunity",
      );
    }
  },
);

// POST /admin/crm/opportunities
// POST /admin/crm/opportunities   (multipart when files are present)
export const createOpportunity = createAsyncThunk(
  "opportunities/create",
  async ({ form, files = [] }, { rejectWithValue }) => {
    try {
      const fd = buildOpportunityFormData(form, files);

      const res = await apiClient.post("/admin/crm/opportunities", fd, {
        // ⚠️ do NOT set Content-Type manually — axios/browser sets it with the boundary
      });

      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to create opportunity");

      // API wraps the record: { data: { opportunity: {...} } }
      return data?.opportunity ?? data;
    } catch (e) {
      if (e.response?.data?.errors) {
        return rejectWithValue(
          Object.values(e.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        e.response?.data?.message || "Failed to create opportunity",
      );
    }
  },
);

// PUT /admin/crm/opportunities/{id}
// POST /admin/crm/opportunities/{id}?_method=PUT   (multipart when files present)
export const updateOpportunity = createAsyncThunk(
  "opportunities/update",
  async ({ id, data, files = [] }, { rejectWithValue }) => {
    try {
      const fd = buildOpportunityFormData(data, files);
      fd.append("_method", "PUT");  // Laravel method spoofing

      const res = await apiClient.post(`/admin/crm/opportunities/${id}`, fd);

      const { ok, data: body, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update opportunity");

      return { id, ...(body?.opportunity ?? body ?? {}) };
    } catch (e) {
      if (e.response?.data?.errors) {
        return rejectWithValue(
          Object.values(e.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        e.response?.data?.message || "Failed to update opportunity",
      );
    }
  },
);

// DELETE /admin/crm/opportunities/{id}
export const deleteOpportunityApi = createAsyncThunk(
  "opportunities/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/admin/crm/opportunities/${id}`);
      const { ok, message } = unwrap(res.data);
      if (ok) return { id };
      return rejectWithValue(message || "Failed to delete opportunity");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to delete opportunity",
      );
    }
  },
);

// POST /admin/crm/opportunities/{id}/stage
export const updateOpportunityStageApi = createAsyncThunk(
  "opportunities/updateStage",
  async ({ id, stage, probability, notes, lost_reason, competitor }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(
        `/admin/crm/opportunities/${id}/stage`,
        { stage, probability, notes, lost_reason, competitor },
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return { id, stage, probability, ...(data || {}) };
      return rejectWithValue(message || "Failed to update stage");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to update stage",
      );
    }
  },
);

// POST /admin/crm/opportunities/{id}/create-quotation
export const createLinkedQuotationApi = createAsyncThunk(
  "opportunities/createQuotation",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/admin/crm/opportunities/${id}/create-quotation`,
        payload,
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to create quotation");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to create quotation",
      );
    }
  },
);

// POST /admin/crm/opportunities/{id}/schedule-activity
export const scheduleLinkedActivityApi = createAsyncThunk(
  "opportunities/scheduleActivity",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/admin/crm/opportunities/${id}/schedule-activity`,
        payload,
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to schedule activity");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to schedule activity",
      );
    }
  },
);

// POST /admin/crm/opportunities/{id}/attachments
// src/admin/store/slices/opportunitySlice.js
export const uploadOpportunityAttachmentsApi = createAsyncThunk(
  "opportunities/uploadAttachments",
  async ({ id, files }, { rejectWithValue }) => {
    try {
      const fd = new FormData();

      // ✅ Correct: `attachments[]` — the brackets tell PHP to build an array
      (files || []).forEach((f) => fd.append("attachments[]", f));

      const res = await apiClient.post(
        `/admin/crm/opportunities/${id}/attachments`,
        fd,
        // ⚠️ Do NOT set Content-Type — let the browser set the boundary
      );

      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to upload attachments");
    } catch (e) {
      if (e.response?.data?.errors) {
        return rejectWithValue(
          Object.values(e.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        e.response?.data?.message || "Failed to upload attachments",
      );
    }
  },
);

// DELETE /admin/crm/opportunities/{id}/attachments/{attId}
export const deleteOpportunityAttachmentApi = createAsyncThunk(
  "opportunities/deleteAttachment",
  async ({ id, attId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(
        `/admin/crm/opportunities/${id}/attachments/${attId}`,
      );
      const { ok, message } = unwrap(res.data);
      if (ok) return { id, attId };
      return rejectWithValue(message || "Failed to delete attachment");
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to delete attachment",
      );
    }
  },
);

// GET /admin/crm/opportunities/{id}/attachments/{attId}/download
export const downloadOpportunityAttachmentApi = createAsyncThunk(
  "opportunities/downloadAttachment",
  async ({ id, attId, filename = "attachment" }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/admin/crm/opportunities/${id}/attachments/${attId}/download`,
        { responseType: "blob" },
      );
      triggerBlobDownload(res.data, filename);
      return { ok: true };
    } catch (e) {
      return rejectWithValue("Failed to download attachment");
    }
  },
);

// GET /admin/crm/opportunities/export?format=csv|xlsx|pdf
export const exportOpportunities = createAsyncThunk(
  "opportunities/export",
  async ({ filters = {}, format = "xlsx" } = {}, { rejectWithValue }) => {
    try {
      const qs = buildOpportunityQuery(filters);
      qs.set("format", format);
      const res = await apiClient.get(
        `/admin/crm/opportunities/export?${qs}`,
        { responseType: "blob" },
      );
      const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
      triggerBlobDownload(res.data, buildFilename("opportunities", ext));
      return { ok: true };
    } catch (e) {
      let msg = "Failed to export opportunities";
      const data = e.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          msg = parsed?.message || msg;
        } catch {}
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
  opportunities: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    stage: "",
    customer_id: "",
    assigned_to: "",
    product: "",
    priority: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
  },

  pipeline: [],
  pipelineLoading: false,
  pipelineError: null,

  stats: null,
  statsLoading: false,
  statsError: null,

  currentOpportunity: null,
  currentOpportunityLoading: false,
  currentOpportunityError: null,

  options: FALLBACK_OPPORTUNITY_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

  submitting: false,
  submittingError: null,
  exporting: false,
  exportError: null,

  uploadingAttachments: false,
  uploadingAttachmentsError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const opportunitySlice = createSlice({
  name: "opportunities",
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
    clearCurrentOpportunity: (s) => {
      s.currentOpportunity = null;
      s.currentOpportunityError = null;
    },
    clearError: (s) => {
      s.error = null;
      s.submittingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchOpportunityFormOptions.pending, (s) => {
        s.optionsLoading = true;
        s.optionsError = null;
      })
      .addCase(fetchOpportunityFormOptions.fulfilled, (s, a) => {
        s.optionsLoading = false;
        s.optionsLoaded = true;
        s.options = { ...FALLBACK_OPPORTUNITY_OPTIONS, ...(a.payload || {}) };
      })
      .addCase(fetchOpportunityFormOptions.rejected, (s, a) => {
        s.optionsLoading = false;
        s.optionsError = a.payload;
      })

      // ── List ──
      .addCase(fetchOpportunities.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchOpportunities.fulfilled, (s, a) => {
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
        s.opportunities = list;
        s.totalCount = paginated?.total ?? list.length;
        s.currentPage = paginated?.current_page ?? s.currentPage;
        s.perPage = paginated?.per_page ?? s.perPage;
      })
      .addCase(fetchOpportunities.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ── Pipeline ──
      .addCase(fetchOpportunityPipeline.pending, (s) => {
        s.pipelineLoading = true;
        s.pipelineError = null;
      })
      .addCase(fetchOpportunityPipeline.fulfilled, (s, a) => {
        s.pipelineLoading = false;
        s.pipeline = a.payload || [];
      })
      .addCase(fetchOpportunityPipeline.rejected, (s, a) => {
        s.pipelineLoading = false;
        s.pipelineError = a.payload;
      })

      // ── Stats ──
      .addCase(fetchOpportunityStats.pending, (s) => {
        s.statsLoading = true;
        s.statsError = null;
      })
      .addCase(fetchOpportunityStats.fulfilled, (s, a) => {
        s.statsLoading = false;
        s.stats = a.payload || null;
      })
      .addCase(fetchOpportunityStats.rejected, (s, a) => {
        s.statsLoading = false;
        s.statsError = a.payload;
      })

      // ── Single ──
      .addCase(fetchOpportunityById.pending, (s) => {
        s.currentOpportunityLoading = true;
        s.currentOpportunityError = null;
      })
      .addCase(fetchOpportunityById.fulfilled, (s, a) => {
        s.currentOpportunityLoading = false;
        s.currentOpportunity = a.payload;
      })
      .addCase(fetchOpportunityById.rejected, (s, a) => {
        s.currentOpportunityLoading = false;
        s.currentOpportunityError = a.payload;
      })

      // ── Create ──
      .addCase(createOpportunity.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(createOpportunity.fulfilled, (s, a) => {
        s.submitting = false;
        if (a.payload) {
          s.opportunities.unshift(a.payload);
          s.totalCount += 1;
        }
      })
      .addCase(createOpportunity.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Update ──
      .addCase(updateOpportunity.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateOpportunity.fulfilled, (s, a) => {
        s.submitting = false;
        const u = a.payload;
        const idx = s.opportunities.findIndex((o) => o.id === u.id);
        if (idx !== -1) s.opportunities[idx] = { ...s.opportunities[idx], ...u };
        if (s.currentOpportunity?.id === u.id) {
          s.currentOpportunity = { ...s.currentOpportunity, ...u };
        }
      })
      .addCase(updateOpportunity.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Stage ──
      .addCase(updateOpportunityStageApi.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateOpportunityStageApi.fulfilled, (s, a) => {
        s.submitting = false;
        const { id, stage, probability } = a.payload;
        const idx = s.opportunities.findIndex((o) => o.id === id);
        if (idx !== -1) {
          s.opportunities[idx].stage = stage;
          if (probability !== undefined)
            s.opportunities[idx].probability = probability;
        }
        if (s.currentOpportunity?.id === id) {
          s.currentOpportunity.stage = stage;
          if (probability !== undefined)
            s.currentOpportunity.probability = probability;
        }
      })
      .addCase(updateOpportunityStageApi.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Delete ──
      .addCase(deleteOpportunityApi.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(deleteOpportunityApi.fulfilled, (s, a) => {
        s.submitting = false;
        s.opportunities = s.opportunities.filter((o) => o.id !== a.payload.id);
        s.totalCount = Math.max(0, s.totalCount - 1);
        if (s.currentOpportunity?.id === a.payload.id) {
          s.currentOpportunity = null;
        }
      })
      .addCase(deleteOpportunityApi.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Export ──
      .addCase(exportOpportunities.pending, (s) => {
        s.exporting = true;
        s.exportError = null;
      })
      .addCase(exportOpportunities.fulfilled, (s) => {
        s.exporting = false;
      })
      .addCase(exportOpportunities.rejected, (s, a) => {
        s.exporting = false;
        s.exportError = a.payload;
      })

      // ── Upload attachments ──
      .addCase(uploadOpportunityAttachmentsApi.pending, (s) => {
        s.uploadingAttachments = true;
        s.uploadingAttachmentsError = null;
      })
      .addCase(uploadOpportunityAttachmentsApi.fulfilled, (s) => {
        s.uploadingAttachments = false;
      })
      .addCase(uploadOpportunityAttachmentsApi.rejected, (s, a) => {
        s.uploadingAttachments = false;
        s.uploadingAttachmentsError = a.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentOpportunity,
  clearError,
} = opportunitySlice.actions;

export default opportunitySlice.reducer;