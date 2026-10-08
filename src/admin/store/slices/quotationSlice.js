// src/admin/store/slices/quotationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallback enums (used until form-options loads) ──
export const FALLBACK_QUOTATION_OPTIONS = {
  statuses: ["draft", "sent", "viewed", "accepted", "rejected", "expired", "cancelled"],
  currencies: ["INR", "AED", "USD", "EUR", "GBP"],
  payment_terms: ["Net 15", "Net 30", "Net 45", "Net 60", "Advance"],
  customers: [],           // [{ id, company_name }]
  leads: [],               // [{ id, lead_name, company_name }]
  products_services: [],   // [string] or [{name}]
  tax_percents: [0, 5, 12, 18, 28],
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

// Line item: API → form
const fromItemApi = (it = {}, idx = 0) => ({
  id: it.id ?? `line_${Date.now()}_${idx}`,
  product_service: it.product_service || it.product_name || "",
  description: it.description || "",
  quantity: Number(it.quantity) || 1,
  unit_price: Number(it.unit_price) || 0,
  discount: Number(it.discount) || 0,
  discount_type: it.discount_type || "percent",
  tax_percent: Number(it.tax_percent) || 0,
});

// Line item: form → API
const toItemApi = (it = {}) => ({
  product_service: it.product_service || "",
  description: it.description || "",
  quantity: Number(it.quantity) || 1,
  unit_price: Number(it.unit_price) || 0,
  discount: Number(it.discount) || 0,
  discount_type: it.discount_type || "percent",
  tax_percent: Number(it.tax_percent) || 0,
});

// API → Form
export const fromQuotationApi = (api = {}) => {
  const customer = api.customer || {};
  const lead = api.lead || {};
  const items = Array.isArray(api.items) ? api.items : [];

  return {
    id: api.id,
    quotationNumber: api.quotation_number || api.number || `Q-${api.id}`,

    customerId: api.customer_id ?? customer.id ?? "",
    customerName:
      customer.company_name ||
      customer.name ||
      api.customer_name ||
      "—",

    leadId: api.lead_id ?? lead.id ?? "",
    leadName:
      lead.lead_name || lead.name || api.lead_name || "",

    contactPerson: api.contact_person || "",
    contactEmail: api.contact_email || "",
    contactPhone: api.contact_phone || "",

    billingAddress: api.billing_address || "",

    quotationDate: api.quotation_date?.split("T")[0] || "",
    validUntil: api.valid_until?.split("T")[0] || "",

    currency: api.currency || "INR",
    paymentTerms: api.payment_terms || "",
    deliveryTimeline: api.delivery_timeline || "",
    additionalCharges: Number(api.additional_charges) || 0,

    notes: api.notes || "",
    termsAndConditions: api.terms_and_conditions || "",
    status: (api.status || "draft").toLowerCase(),

    subtotal: Number(api.subtotal) || 0,
    taxTotal: Number(api.tax_total) || 0,
    grandTotal: Number(api.grand_total) || Number(api.total) || 0,

    items: items.map(fromItemApi),

    createdBy:
      api.creator?.username ||
      api.creator?.name ||
      api.created_by_name ||
      "",
    createdAt: api.created_at || "",
    updatedAt: api.updated_at || "",
  };
};

// Form → API
export const toQuotationApi = (form = {}) => ({
  customer_id: form.customerId ? Number(form.customerId) : null,
  contact_person: form.contactPerson || "",
  contact_email: form.contactEmail || "",
  contact_phone: form.contactPhone || "",
  billing_address: form.billingAddress || "",
  lead_id: form.leadId ? Number(form.leadId) : null,
  quotation_date: form.quotationDate || "",
  valid_until: form.validUntil || "",
  currency: form.currency || "INR",
  payment_terms: form.paymentTerms || "",
  delivery_timeline: form.deliveryTimeline || "",
  additional_charges: Number(form.additionalCharges) || 0,
  notes: form.notes || "",
  terms_and_conditions: form.termsAndConditions || "",
  status: (form.status || "draft").toLowerCase(),
  items: Array.isArray(form.items) ? form.items.map(toItemApi) : [],
});

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildQuotationFilterQuery = (params = {}) => {
  const { status = "", customer_id = "", search = "" } = params;
  return new URLSearchParams({
    ...(status && { status }),
    ...(customer_id && { customer_id }),
    ...(search && { search }),
  });
};

// Accept any 2xx envelope; only fail when the response explicitly says so.
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

// GET /admin/crm/quotations/form-options
export const fetchQuotationFormOptions = createAsyncThunk(
  "quotations/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/crm/quotations/form-options");
      const { ok, data, message } = unwrap(response.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load form options");
    } catch (error) {
      console.error("Fetch quotation form-options error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load form options",
      );
    }
  },
);

// GET /admin/crm/quotations
export const fetchQuotations = createAsyncThunk(
  "quotations/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 15 } = params;
      const qs = buildQuotationFilterQuery(params);
      qs.set("page", page);
      qs.set("per_page", perPage);

      const response = await apiClient.get(`/admin/crm/quotations?${qs}`);
      const { ok, data, message } = unwrap(response.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch quotations");
    } catch (error) {
      console.error("Fetch quotations error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quotations",
      );
    }
  },
);

// GET /admin/crm/quotations/{id}
export const fetchQuotationById = createAsyncThunk(
  "quotations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/crm/quotations/${id}`);
      const { ok, data, message } = unwrap(response.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch quotation");
    } catch (error) {
      console.error("Fetch quotation error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quotation",
      );
    }
  },
);

// POST /admin/crm/quotations
export const createQuotation = createAsyncThunk(
  "quotations/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toQuotationApi(form);
      const response = await apiClient.post("/admin/crm/quotations", payload);
      const { ok, data, message } = unwrap(response.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to create quotation");
    } catch (error) {
      console.error("Create quotation error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create quotation",
      );
    }
  },
);

// PUT /admin/crm/quotations/{id}
export const updateQuotation = createAsyncThunk(
  "quotations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = toQuotationApi(data);
      const response = await apiClient.put(`/admin/crm/quotations/${id}`, payload);
      const { ok, data: body, message } = unwrap(response.data);
      if (ok) return { id, ...(body || {}) };
      return rejectWithValue(message || "Failed to update quotation");
    } catch (error) {
      console.error("Update quotation error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update quotation",
      );
    }
  },
);

// POST /admin/crm/quotations/{id}/update-status
export const updateQuotationStatusApi = createAsyncThunk(
  "quotations/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/crm/quotations/${id}/update-status`,
        { status },
      );
      const { ok, data, message } = unwrap(response.data);
      if (ok) return { id, status, ...(data || {}) };
      return rejectWithValue(message || "Failed to update status");
    } catch (error) {
      console.error("Update quotation status error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

// DELETE /admin/crm/quotations/{id}
export const deleteQuotationApi = createAsyncThunk(
  "quotations/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/crm/quotations/${id}`);
      const { ok, message } = unwrap(response.data);
      if (ok) return { id };
      return rejectWithValue(message || "Failed to delete quotation");
    } catch (error) {
      console.error("Delete quotation error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete quotation",
      );
    }
  },
);

// GET /admin/crm/quotations/export?format=xlsx&status=sent
export const exportQuotations = createAsyncThunk(
  "quotations/export",
  async ({ filters = {}, format = "xlsx" } = {}, { rejectWithValue }) => {
    try {
      const qs = buildQuotationFilterQuery(filters);
      qs.set("format", format);

      const response = await apiClient.get(
        `/admin/crm/quotations/export?${qs}`,
        { responseType: "blob" },
      );

      const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
      triggerBlobDownload(response.data, buildFilename("quotations", ext));
      return { ok: true };
    } catch (error) {
      console.error("Export quotations error:", error);
      let msg = "Failed to export quotations";
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
  quotations: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    status: "",
    customer_id: "",
  },

  currentQuotation: null,
  currentQuotationLoading: false,
  currentQuotationError: null,

  options: FALLBACK_QUOTATION_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

  submitting: false,
  submittingError: null,
  exporting: false,
  exportError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const quotationSlice = createSlice({
  name: "quotations",
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
    clearCurrentQuotation: (state) => {
      state.currentQuotation = null;
      state.currentQuotationError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.submittingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchQuotationFormOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(fetchQuotationFormOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.optionsLoaded = true;
        state.options = {
          ...FALLBACK_QUOTATION_OPTIONS,
          ...(action.payload || {}),
        };
      })
      .addCase(fetchQuotationFormOptions.rejected, (state, action) => {
        state.optionsLoading = false;
        state.optionsError = action.payload;
      })

      // ── List ──
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        const d = action.payload || {};
        // Handle both paginated { data: [...], total, current_page } and array
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        const list = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
        state.quotations = list;
        state.totalCount = paginated?.total ?? list.length;
        state.currentPage = paginated?.current_page ?? state.currentPage;
        state.perPage = paginated?.per_page ?? state.perPage;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Single ──
      .addCase(fetchQuotationById.pending, (state) => {
        state.currentQuotationLoading = true;
        state.currentQuotationError = null;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.currentQuotationLoading = false;
        state.currentQuotation = action.payload;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.currentQuotationLoading = false;
        state.currentQuotationError = action.payload;
      })

      // ── Create ──
      .addCase(createQuotation.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.quotations.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Update ──
      .addCase(updateQuotation.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.quotations.findIndex((q) => q.id === updated.id);
        if (idx !== -1)
          state.quotations[idx] = { ...state.quotations[idx], ...updated };
        if (state.currentQuotation?.id === updated.id) {
          state.currentQuotation = { ...state.currentQuotation, ...updated };
        }
      })
      .addCase(updateQuotation.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Status only ──
      .addCase(updateQuotationStatusApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateQuotationStatusApi.fulfilled, (state, action) => {
        state.submitting = false;
        const { id, status } = action.payload;
        const idx = state.quotations.findIndex((q) => q.id === id);
        if (idx !== -1) state.quotations[idx].status = status;
        if (state.currentQuotation?.id === id) {
          state.currentQuotation.status = status;
        }
      })
      .addCase(updateQuotationStatusApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Delete ──
      .addCase(deleteQuotationApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(deleteQuotationApi.fulfilled, (state, action) => {
        state.submitting = false;
        state.quotations = state.quotations.filter(
          (q) => q.id !== action.payload.id,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentQuotation?.id === action.payload.id) {
          state.currentQuotation = null;
        }
      })
      .addCase(deleteQuotationApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Export ──
      .addCase(exportQuotations.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportQuotations.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportQuotations.rejected, (state, action) => {
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
  clearCurrentQuotation,
  clearError,
} = quotationSlice.actions;

export default quotationSlice.reducer;