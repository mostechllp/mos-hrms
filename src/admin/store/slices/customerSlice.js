// src/admin/store/slices/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallback enums (used only if form-options hasn't loaded yet) ──
export const FALLBACK_CUSTOMER_OPTIONS = {
  customer_types: ["Individual", "Company"],
  customer_statuses: ["Active", "Inactive", "Blacklisted"],
  customer_categories: ["Prospect", "Customer", "Partner"],
  customer_sources: ["Referral", "Website", "Sales", "Other"],
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
  payment_terms: ["Net 15", "Net 30", "Net 45", "Net 60", "Advance"],
  preferred_communication: ["Call", "Email", "WhatsApp", "Other"],
  countries: ["India", "UAE", "USA", "UK", "Singapore", "Australia"],
  states: [
    "Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu",
    "Kerala", "Delhi", "Telangana", "West Bengal",
  ],
  account_managers: [], // [{id, name, designation, employee_id}]
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

// API → Form (for edit / detail views)
export const fromCustomerApi = (api = {}) => ({
  id: api.id,
  customerId: api.customer_id || "",
  customerType: api.customer_type || "Company",
  companyName: api.company_name || "",
  industry: api.industry || "",
  registrationNumber: api.company_registration_no || "",
  taxNumber: api.tax_gst_no || "",
  website: api.website || "",
  status: api.customer_status || "Active",
  customerSince: api.customer_since?.split("T")[0] || "",
  assignedTo: api.account_manager_id ?? "",
  billingAddress: api.billing_address || "",
  shippingAddress: api.shipping_address || "",
  city: api.city || "",
  state: api.state || "",
  country: api.country || "",
  postalCode: api.postal_code || "",
  contactName: api.contact_person_name || "",
  contactDesignation: api.contact_designation || "",
  contactEmail: api.contact_email || "",
  contactPhone: api.contact_phone || "",
  contactAltPhone: api.contact_alternate_phone || "",
  preferredComm: api.preferred_communication || "Email",
  category: api.customer_category || "Customer",
  source: api.customer_source || "",
  paymentTerms: api.payment_terms || "",
  creditLimit: api.credit_limit ?? "",
  notes: api.notes || "",
  createdAt: api.created_at || "",
  updatedAt: api.updated_at || "",
  accountManager: api.account_manager || null,
});

// Form → API
export const toCustomerApi = (form = {}) => ({
  customer_id: form.customerId || undefined,
  customer_type: form.customerType || "Company",
  company_name: (form.companyName || "").trim(),
  industry: form.industry || "",
  company_registration_no: form.registrationNumber || "",
  tax_gst_no: form.taxNumber || "",
  website: form.website || "",
  customer_status: form.status || "Active",
  customer_since: form.customerSince || "",
  account_manager_id: form.assignedTo ? Number(form.assignedTo) : null,

  billing_address: form.billingAddress || "",
  shipping_address: form.shippingAddress || "",
  city: form.city || "",
  state: form.state || "",
  country: form.country || "",
  postal_code: form.postalCode || "",

  contact_person_name: (form.contactName || "").trim(),
  contact_designation: form.contactDesignation || "",
  contact_email: form.contactEmail || "",
  contact_phone: form.contactPhone || "",
  contact_alternate_phone: form.contactAltPhone || "",
  preferred_communication: form.preferredComm || "Email",

  customer_category: form.category || "Customer",
  customer_source: form.source || "",
  payment_terms: form.paymentTerms || "",
  credit_limit: (() => {
    const v = form.creditLimit;
    if (v === "" || v === null || v === undefined) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  })(),
  notes: form.notes || "",
});

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildCustomerFilterQuery = (params = {}) => {
  const {
    search = "",
    customer_status = "",
    customer_type = "",
    customer_category = "",
    industry = "",
    account_manager_id = "",
    sort_by = "",
    sort_order = "",
  } = params;

  return new URLSearchParams({
    ...(search && { search }),
    ...(customer_status && { customer_status }),
    ...(customer_type && { customer_type }),
    ...(customer_category && { customer_category }),
    ...(industry && { industry }),
    ...(account_manager_id && { account_manager_id }),
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

// GET /admin/crm/customers/form-options
export const fetchCustomerFormOptions = createAsyncThunk(
  "customers/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/crm/customers/form-options",
      );
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
      console.error("Fetch customer form options error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load form options",
      );
    }
  },
);

// GET /admin/crm/customers/stats
export const fetchCustomerStats = createAsyncThunk(
  "customers/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/crm/customers/stats");
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch customer stats",
      );
    } catch (error) {
      console.error("Fetch customer stats error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer stats",
      );
    }
  },
);

// GET /admin/crm/customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 15 } = params;
      const qs = buildCustomerFilterQuery(params);
      qs.set("page", page);
      qs.set("per_page", perPage);

      const response = await apiClient.get(`/admin/crm/customers?${qs}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch customers",
      );
    } catch (error) {
      console.error("Fetch customers error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers",
      );
    }
  },
);

// GET /admin/crm/customers/{id}
export const fetchCustomerById = createAsyncThunk(
  "customers/fetchById",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/crm/customers/${customerId}`,
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch customer",
      );
    } catch (error) {
      console.error("Fetch customer error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer",
      );
    }
  },
);

// POST /admin/crm/customers
export const createCustomer = createAsyncThunk(
  "customers/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toCustomerApi(form);
      const response = await apiClient.post("/admin/crm/customers", payload);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to create customer",
      );
    } catch (error) {
      console.error("Create customer error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create customer",
      );
    }
  },
);

// PUT /admin/crm/customers/{id}
export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = toCustomerApi(data);
      const response = await apiClient.put(
        `/admin/crm/customers/${id}`,
        payload,
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update customer",
      );
    } catch (error) {
      console.error("Update customer error:", error.response?.data);
      if (error.response?.data?.errors) {
        return rejectWithValue(
          Object.values(error.response.data.errors).flat().join(", "),
        );
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update customer",
      );
    }
  },
);

// DELETE /admin/crm/customers/{id}
export const deleteCustomerApi = createAsyncThunk(
  "customers/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/crm/customers/${id}`);
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id };
      }
      return rejectWithValue(
        response.data?.message || "Failed to delete customer",
      );
    } catch (error) {
      console.error("Delete customer error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete customer",
      );
    }
  },
);

// POST /admin/crm/customers/{id}/update-status
export const updateCustomerStatusApi = createAsyncThunk(
  "customers/updateStatus",
  async ({ id, customer_status, note = "" }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/crm/customers/${id}/update-status`,
        { customer_status, note },
      );
      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, customer_status, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update customer status",
      );
    } catch (error) {
      console.error("Update customer status error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update customer status",
      );
    }
  },
);

// ----------------------------------------------------
// EXPORTS
// ----------------------------------------------------

// GET /admin/crm/customers/export/excel  (or ?format=csv)
export const exportCustomersExcel = createAsyncThunk(
  "customers/exportExcel",
  async ({ format = "xlsx", filters = {} } = {}, { rejectWithValue }) => {
    try {
      const qs = buildCustomerFilterQuery(filters);
      qs.set("format", format);

      const response = await apiClient.get(
        `/admin/crm/customers/export/excel?${qs}`,
        { responseType: "blob" },
      );

      const ext = format === "csv" ? "csv" : "xlsx";
      triggerBlobDownload(response.data, buildFilename("customers", ext));
      return { format };
    } catch (error) {
      console.error("Export customers excel error:", error);
      let msg = "Failed to export customers";
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

// GET /admin/crm/customers/export/pdf
export const exportCustomersPdf = createAsyncThunk(
  "customers/exportPdf",
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    try {
      const qs = buildCustomerFilterQuery(filters);
      const response = await apiClient.get(
        `/admin/crm/customers/export/pdf?${qs}`,
        { responseType: "blob" },
      );
      triggerBlobDownload(response.data, buildFilename("customers", "pdf"));
      return { format: "pdf" };
    } catch (error) {
      console.error("Export customers pdf error:", error);
      let msg = "Failed to export customers";
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
  customers: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    customer_status: "",
    customer_type: "",
    customer_category: "",
    industry: "",
    account_manager_id: "",
    sort_by: "created_at",
    sort_order: "desc",
  },

  currentCustomer: null,
  currentCustomerLoading: false,
  currentCustomerError: null,

  stats: {
    total_customers: 0,
    active_customers: 0,
    inactive_customers: 0,
    new_this_month: 0,
    with_open_opportunities: 0,
    needs_follow_up: 0,
    customers_by_status: {},
    customers_by_industry: {},
  },
  statsLoading: false,
  statsError: null,

  options: FALLBACK_CUSTOMER_OPTIONS,
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
const customerSlice = createSlice({
  name: "customers",
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
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
      state.currentCustomerError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.submittingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchCustomerFormOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(fetchCustomerFormOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.optionsLoaded = true;
        state.options = {
          ...FALLBACK_CUSTOMER_OPTIONS,
          ...(action.payload || {}),
        };
      })
      .addCase(fetchCustomerFormOptions.rejected, (state, action) => {
        state.optionsLoading = false;
        state.optionsError = action.payload;
      })

      // ── Stats ──
      .addCase(fetchCustomerStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = { ...initialState.stats, ...(action.payload || {}) };
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })

      // ── List ──
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
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
        state.customers = list;
        state.totalCount = paginated?.total ?? list.length;
        state.currentPage = paginated?.current_page ?? state.currentPage;
        state.perPage = paginated?.per_page ?? state.perPage;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Single ──
      .addCase(fetchCustomerById.pending, (state) => {
        state.currentCustomerLoading = true;
        state.currentCustomerError = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.currentCustomerLoading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.currentCustomerLoading = false;
        state.currentCustomerError = action.payload;
      })

      // ── Create ──
      .addCase(createCustomer.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.customers.unshift(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Update ──
      .addCase(updateCustomer.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.customers.findIndex((c) => c.id === updated.id);
        if (idx !== -1)
          state.customers[idx] = { ...state.customers[idx], ...updated };
        if (state.currentCustomer?.id === updated.id) {
          state.currentCustomer = { ...state.currentCustomer, ...updated };
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Quick status ──
      .addCase(updateCustomerStatusApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updateCustomerStatusApi.fulfilled, (state, action) => {
        state.submitting = false;
        const { id, customer_status } = action.payload;
        const idx = state.customers.findIndex((c) => c.id === id);
        if (idx !== -1) state.customers[idx].customer_status = customer_status;
        if (state.currentCustomer?.id === id) {
          state.currentCustomer.customer_status = customer_status;
        }
      })
      .addCase(updateCustomerStatusApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Delete ──
      .addCase(deleteCustomerApi.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(deleteCustomerApi.fulfilled, (state, action) => {
        state.submitting = false;
        state.customers = state.customers.filter(
          (c) => c.id !== action.payload.id,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentCustomer?.id === action.payload.id) {
          state.currentCustomer = null;
        }
      })
      .addCase(deleteCustomerApi.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Exports ──
      .addCase(exportCustomersExcel.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportCustomersExcel.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportCustomersExcel.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      })
      .addCase(exportCustomersPdf.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportCustomersPdf.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportCustomersPdf.rejected, (state, action) => {
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
  clearCurrentCustomer,
  clearError,
} = customerSlice.actions;

export default customerSlice.reducer;