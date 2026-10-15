// src/admin/store/slices/reportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallbacks (used until filter-options loads) ──
export const FALLBACK_REPORT_FILTERS = {
  date_ranges: [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ],
  salespersons: [],
  teams: [],
  customers: [],
  lead_sources: [],
  stages: [],
};

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildReportQuery = (params = {}) => {
  const {
    date_range = "",
    from_date = "",
    to_date = "",
    salesperson_id = "",
    team_id = "",
    customer_id = "",
    lead_source = "",
    stage = "",
  } = params;
  return new URLSearchParams({
    ...(date_range && { date_range }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
    ...(salesperson_id && { salesperson_id }),
    ...(team_id && { team_id }),
    ...(customer_id && { customer_id }),
    ...(lead_source && { lead_source }),
    ...(stage && { stage }),
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

// GET /admin/crm/reports/filter-options
export const fetchReportFilterOptions = createAsyncThunk(
  "reports/fetchFilterOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/reports/filter-options");
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load filter options");
    } catch (e) {
      return rejectWithValue(
        flattenErrors(e) || "Failed to load filter options",
      );
    }
  },
);

// Factory for the report fetchers — same shape for all 7
const makeReportThunk = (name, endpoint) =>
  createAsyncThunk(
    `reports/fetch${name}`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const qs = buildReportQuery(params);
        const res = await apiClient.get(
          `/admin/crm/reports/${endpoint}?${qs}`,
        );
        const { ok, data, message } = unwrap(res.data);
        if (ok) return data;
        return rejectWithValue(message || `Failed to load ${name} report`);
      } catch (e) {
        return rejectWithValue(
          flattenErrors(e) || `Failed to load ${name} report`,
        );
      }
    },
  );

export const fetchSalesReport = makeReportThunk("Sales", "sales");
export const fetchOpportunityReport = makeReportThunk(
  "Opportunity",
  "opportunity",
);
export const fetchSalesPerformanceReport = makeReportThunk(
  "SalesPerformance",
  "sales-performance",
);
export const fetchActivityReport = makeReportThunk("Activity", "activity");
export const fetchQuotationReport = makeReportThunk(
  "Quotation",
  "quotation",
);
export const fetchCustomerReport = makeReportThunk("Customer", "customer");
export const fetchLeadReport = makeReportThunk("Lead", "lead");

// Factory for exports — same shape for all 7
const makeExportThunk = (name, endpoint) =>
  createAsyncThunk(
    `reports/export${name}`,
    async ({ filters = {}, format = "xlsx" } = {}, { rejectWithValue }) => {
      try {
        const qs = buildReportQuery(filters);
        qs.set("format", format);
        const res = await apiClient.get(
          `/admin/crm/reports/${endpoint}/export?${qs}`,
          { responseType: "blob" },
        );
        const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
        triggerBlobDownload(res.data, buildFilename(`${endpoint}_report`, ext));
        return { ok: true };
      } catch (e) {
        let msg = `Failed to export ${name} report`;
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

export const exportSalesReport = makeExportThunk("Sales", "sales");
export const exportOpportunityReport = makeExportThunk(
  "Opportunity",
  "opportunity",
);
export const exportSalesPerformanceReport = makeExportThunk(
  "SalesPerformance",
  "sales-performance",
);
export const exportActivityReport = makeExportThunk(
  "Activity",
  "activity",
);
export const exportQuotationReport = makeExportThunk(
  "Quotation",
  "quotation",
);
export const exportCustomerReport = makeExportThunk(
  "Customer",
  "customer",
);
export const exportLeadReport = makeExportThunk("Lead", "lead");

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  filterOptions: FALLBACK_REPORT_FILTERS,
  filterOptionsLoading: false,
  filterOptionsError: null,

  // Each report has its own data / loading / error bucket
  sales: { data: null, loading: false, error: null },
  opportunity: { data: null, loading: false, error: null },
  salesPerformance: { data: null, loading: false, error: null },
  activity: { data: null, loading: false, error: null },
  quotation: { data: null, loading: false, error: null },
  customer: { data: null, loading: false, error: null },
  lead: { data: null, loading: false, error: null },

  exporting: false,
  exportError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportError: (s) => {
      s.sales.error = null;
      s.opportunity.error = null;
      s.salesPerformance.error = null;
      s.activity.error = null;
      s.quotation.error = null;
      s.customer.error = null;
      s.lead.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Filter options ──
      .addCase(fetchReportFilterOptions.pending, (s) => {
        s.filterOptionsLoading = true;
        s.filterOptionsError = null;
      })
      .addCase(fetchReportFilterOptions.fulfilled, (s, a) => {
        s.filterOptionsLoading = false;
        s.filterOptions = {
          ...FALLBACK_REPORT_FILTERS,
          ...(a.payload || {}),
        };
      })
      .addCase(fetchReportFilterOptions.rejected, (s, a) => {
        s.filterOptionsLoading = false;
        s.filterOptionsError = a.payload;
      })

      // ── Sales ──
      .addCase(fetchSalesReport.pending, (s) => {
        s.sales.loading = true;
        s.sales.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (s, a) => {
        s.sales.loading = false;
        s.sales.data = a.payload || null;
      })
      .addCase(fetchSalesReport.rejected, (s, a) => {
        s.sales.loading = false;
        s.sales.error = a.payload;
      })

      // ── Opportunity ──
      .addCase(fetchOpportunityReport.pending, (s) => {
        s.opportunity.loading = true;
        s.opportunity.error = null;
      })
      .addCase(fetchOpportunityReport.fulfilled, (s, a) => {
        s.opportunity.loading = false;
        s.opportunity.data = a.payload || null;
      })
      .addCase(fetchOpportunityReport.rejected, (s, a) => {
        s.opportunity.loading = false;
        s.opportunity.error = a.payload;
      })

      // ── Sales Performance ──
      .addCase(fetchSalesPerformanceReport.pending, (s) => {
        s.salesPerformance.loading = true;
        s.salesPerformance.error = null;
      })
      .addCase(fetchSalesPerformanceReport.fulfilled, (s, a) => {
        s.salesPerformance.loading = false;
        s.salesPerformance.data = a.payload || null;
      })
      .addCase(fetchSalesPerformanceReport.rejected, (s, a) => {
        s.salesPerformance.loading = false;
        s.salesPerformance.error = a.payload;
      })

      // ── Activity ──
      .addCase(fetchActivityReport.pending, (s) => {
        s.activity.loading = true;
        s.activity.error = null;
      })
      .addCase(fetchActivityReport.fulfilled, (s, a) => {
        s.activity.loading = false;
        s.activity.data = a.payload || null;
      })
      .addCase(fetchActivityReport.rejected, (s, a) => {
        s.activity.loading = false;
        s.activity.error = a.payload;
      })

      // ── Quotation ──
      .addCase(fetchQuotationReport.pending, (s) => {
        s.quotation.loading = true;
        s.quotation.error = null;
      })
      .addCase(fetchQuotationReport.fulfilled, (s, a) => {
        s.quotation.loading = false;
        s.quotation.data = a.payload || null;
      })
      .addCase(fetchQuotationReport.rejected, (s, a) => {
        s.quotation.loading = false;
        s.quotation.error = a.payload;
      })

      // ── Customer ──
      .addCase(fetchCustomerReport.pending, (s) => {
        s.customer.loading = true;
        s.customer.error = null;
      })
      .addCase(fetchCustomerReport.fulfilled, (s, a) => {
        s.customer.loading = false;
        s.customer.data = a.payload || null;
      })
      .addCase(fetchCustomerReport.rejected, (s, a) => {
        s.customer.loading = false;
        s.customer.error = a.payload;
      })

      // ── Lead ──
      .addCase(fetchLeadReport.pending, (s) => {
        s.lead.loading = true;
        s.lead.error = null;
      })
      .addCase(fetchLeadReport.fulfilled, (s, a) => {
        s.lead.loading = false;
        s.lead.data = a.payload || null;
      })
      .addCase(fetchLeadReport.rejected, (s, a) => {
        s.lead.loading = false;
        s.lead.error = a.payload;
      });

    // ── Exports (all share the same exporting flag) ──
    const exportThunks = [
      exportSalesReport,
      exportOpportunityReport,
      exportSalesPerformanceReport,
      exportActivityReport,
      exportQuotationReport,
      exportCustomerReport,
      exportLeadReport,
    ];
    exportThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (s) => {
          s.exporting = true;
          s.exportError = null;
        })
        .addCase(thunk.fulfilled, (s) => {
          s.exporting = false;
        })
        .addCase(thunk.rejected, (s, a) => {
          s.exporting = false;
          s.exportError = a.payload;
        });
    });
  },
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;