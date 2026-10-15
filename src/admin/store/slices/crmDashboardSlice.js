// src/admin/store/slices/crmDashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

const normalizeKpi = (kpi = {}) => ({
  value: kpi.value ?? 0,
  label: kpi.label || "",
  formatted: kpi.formatted ?? null, // some KPIs are pre-formatted strings
  // convenience: use formatted when present, otherwise the raw value
  display: kpi.formatted ?? kpi.value ?? 0,
});

// GET /admin/crm/dashboard
export const fromDashboardApi = (api = {}) => {
  const kpis = api.kpis || {};

  return {
    kpis: {
      totalLeads: normalizeKpi(kpis.total_leads),
      totalCustomers: normalizeKpi(kpis.total_customers),
      openOpportunities: normalizeKpi(kpis.open_opportunities),
      estimatedOpenDealValue: normalizeKpi(kpis.estimated_open_deal_value),
      newLeadsThisMonth: normalizeKpi(kpis.new_leads_this_month),
      wonDealsThisMonth: normalizeKpi(kpis.won_deals_this_month),
      lostDealsThisMonth: normalizeKpi(kpis.lost_deals_this_month),
      followUpsDueToday: normalizeKpi(kpis.follow_ups_due_today),
      overdueActivities: normalizeKpi(kpis.overdue_activities),
      conversionRate: normalizeKpi(kpis.conversion_rate),
      quotationValue: normalizeKpi(kpis.quotation_value),
      averageDealValue: normalizeKpi(kpis.average_deal_value),
    },

    salesPipeline: (api.sales_pipeline || []).map((s) => ({
      stage: s.stage || "",
      count: Number(s.count) || 0,
      value: Number(s.value) || 0,
      formattedValue: s.formatted_value || null,
      color: s.color || "#3b82f6",
    })),

    leadSources: (api.lead_sources || []).map((s) => ({
      source: s.source || "Unknown",
      count: Number(s.count) || 0,
      percentage: Number(s.percentage) || 0,
      color: s.color || "#3b82f6",
    })),

    monthlySales: {
      labels: api.monthly_sales?.labels || [],
      deals: api.monthly_sales?.deals || [],
      values: api.monthly_sales?.values || [],
      formattedValues: api.monthly_sales?.formatted_values || [],
      series: (api.monthly_sales?.series || []).map((r) => ({
        month: r.month || "",
        fullMonth: r.full_month || r.month || "",
        deals: Number(r.deals) || 0,
        value: Number(r.value) || 0,
        formattedValue: r.formatted_value || null,
      })),
    },

    upcomingActivities: (api.upcoming_activities || []).map((a) => ({
      id: a.action_view_id ?? a.id,
      title: a.activity || a.title || "",
      type: a.activity_type || "",
      customer: a.customer || a.customer_name || "",
      assignee: a.assignee || a.assigned_to_name || "",
      // keep both — `dueLabel` for display, `dueDate` for sorting/formatting if needed
      dueLabel: a.due || null,
      dueDate: a.raw_due || a.start_date_time || a.due_date || "",
      priority: a.priority || "Medium",
      priorityBadge: a.priority_badge || null, // { bg, color }
      status: a.status || "Pending",
    })),

    recentActivities: (api.recent_activities || []).map((a) => ({
      id: a.id,
      type: a.type || "",
      title: a.title || "",
      subtitle: a.subtitle || "",
      user: a.user || "",
      icon: a.icon || "file-text",
      color: a.color || "#6b7280",
      createdAt: a.created_at || "",
    })),

    filters: {
      dateRanges: api.filters?.date_ranges || {},
      salespersons: (api.filters?.salespersons || []).map((s) => ({
        id: s.id,
        name: s.name || "",
      })),
      salesTeams: api.filters?.sales_teams || [],
    },
  };
};

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

const buildDashboardQuery = (params = {}) => {
  const { date_range = "", salesperson_id = "", team_id = "" } = params;
  return new URLSearchParams({
    ...(date_range && { date_range }),
    ...(salesperson_id && { salesperson_id }),
    ...(team_id && { team_id }),
  });
};

// ----------------------------------------------------
// THUNK
// ----------------------------------------------------
export const fetchCrmDashboard = createAsyncThunk(
  "crmDashboard/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = buildDashboardQuery(params);
      const url = qs.toString()
        ? `/admin/crm/dashboard?${qs}`
        : "/admin/crm/dashboard";
      const res = await apiClient.get(url);
      const { ok, data, message } = unwrap(res.data);
      if (!ok)
        return rejectWithValue(message || "Failed to load CRM dashboard");
      return fromDashboardApi(data);
    } catch (e) {
      return rejectWithValue(
        flattenErrors(e) || "Failed to load CRM dashboard",
      );
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const emptyDashboard = () => ({
  kpis: {
    totalLeads: { value: 0, label: "Total leads", display: 0 },
    totalCustomers: { value: 0, label: "Total customers", display: 0 },
    openOpportunities: { value: 0, label: "Open opportunities", display: 0 },
    estimatedOpenDealValue: {
      value: 0,
      label: "Estimated open deal value",
      display: 0,
    },
    newLeadsThisMonth: { value: 0, label: "New leads this month", display: 0 },
    wonDealsThisMonth: { value: 0, label: "Won deals this month", display: 0 },
    lostDealsThisMonth: {
      value: 0,
      label: "Lost deals this month",
      display: 0,
    },
    followUpsDueToday: { value: 0, label: "Follow-ups due today", display: 0 },
    overdueActivities: { value: 0, label: "Overdue activities", display: 0 },
    conversionRate: { value: 0, label: "Conversion rate", display: "0%" },
    quotationValue: { value: 0, label: "Quotation value", display: 0 },
    averageDealValue: { value: 0, label: "Average deal value", display: 0 },
  },
  salesPipeline: [],
  leadSources: [],
  monthlySales: {
    labels: [],
    deals: [],
    values: [],
    formattedValues: [],
    series: [],
  },
  upcomingActivities: [],
  recentActivities: [],
  filters: { dateRanges: {}, salespersons: [], salesTeams: [] },
});

const initialState = {
  data: emptyDashboard(),
  loading: false,
  error: null,
  // local UI state that lived in the component
  filters: {
    date_range: "this_month",
    salesperson_id: "",
    team_id: "",
  },
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const crmDashboardSlice = createSlice({
  name: "crmDashboard",
  initialState,
  reducers: {
    setDashboardFilter: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
    },
    resetDashboardFilters: (s) => {
      s.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrmDashboard.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCrmDashboard.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchCrmDashboard.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { setDashboardFilter, resetDashboardFilters } =
  crmDashboardSlice.actions;
export default crmDashboardSlice.reducer;
