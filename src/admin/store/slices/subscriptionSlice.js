import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ── Fallback enums (same shape as activitySlice.options) ──
export const FALLBACK_SUBSCRIPTION_OPTIONS = {
  intervals: ["Monthly", "Quarterly", "Yearly"],
  statuses: ["Active", "Draft", "Archived"],
  currencies: ["INR", "USD", "EUR"],
  billing_cycles: ["Recurring", "One-time", "Usage-based"],
  customer_statuses: ["Active", "Trialing", "Past due", "Cancelled"],
};

// ----------------------------------------------------
// STATIC SEED DATA (swap for API later)
// ----------------------------------------------------
const SEED_PLANS = [
  {
    id: 1,
    name: "Starter",
    code: "STARTER",
    description: "Solo founders and tiny teams getting off the ground.",
    price: 499,
    currency: "INR",
    interval: "Monthly",
    billingCycle: "Recurring",
    trialDays: 14,
    status: "Active",
    features: ["1 user", "5 invoices/mo", "Email support"],
    subscriberCount: 42,
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2025-10-14T11:22:00Z",
  },
  {
    id: 2,
    name: "Growth",
    code: "GROWTH",
    description: "Scaling sales-led teams that need automation and reports.",
    price: 1499,
    currency: "INR",
    interval: "Monthly",
    billingCycle: "Recurring",
    trialDays: 14,
    status: "Active",
    features: [
      "Up to 10 users",
      "Unlimited invoices",
      "Automation rules",
      "Priority support",
    ],
    subscriberCount: 118,
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2025-10-30T08:11:00Z",
  },
  {
    id: 3,
    name: "Enterprise",
    code: "ENTERPRISE",
    description: "Custom contracts and SSO for large organisations.",
    price: 3499,
    currency: "INR",
    interval: "Yearly",
    billingCycle: "Recurring",
    trialDays: 30,
    status: "Active",
    features: ["Unlimited users", "SSO + SCIM", "Dedicated CSM", "Custom SLAs"],
    subscriberCount: 7,
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2025-11-02T14:00:00Z",
  },
  {
    id: 4,
    name: "Pay-as-you-go",
    code: "PAYG",
    description: "Usage-based metered billing for transactional workloads.",
    price: 0,
    currency: "INR",
    interval: "Monthly",
    billingCycle: "Usage-based",
    trialDays: 0,
    status: "Draft",
    features: ["Metered by API call", "No minimum", "Monthly statement"],
    subscriberCount: 0,
    createdAt: "2025-09-01T09:00:00Z",
    updatedAt: "2025-11-10T16:03:00Z",
  },
  {
    id: 5,
    name: "Legacy Pro",
    code: "LEGACY_PRO",
    description: "Grandfathered plan — no longer offered to new customers.",
    price: 999,
    currency: "INR",
    interval: "Monthly",
    billingCycle: "Recurring",
    trialDays: 0,
    status: "Archived",
    features: ["Up to 5 users", "Unlimited invoices"],
    subscriberCount: 63,
    createdAt: "2024-11-01T09:00:00Z",
    updatedAt: "2025-04-10T10:00:00Z",
  },
];

const SEED_SUBSCRIBERS = [
  // {
  //   id: 1,
  //   customer: "Acme Corp",
  //   plan: "Growth",
  //   email: "billing@acme.example",
  //   status: "Active",
  //   startedAt: "2025-02-14",
  //   nextBillingAt: "2025-12-14",
  //   mrr: 1499,
  // },
  // {
  //   id: 2,
  //   customer: "Nimbus Labs",
  //   plan: "Starter",
  //   email: "accounts@nimbus.example",
  //   status: "Active",
  //   startedAt: "2025-03-02",
  //   nextBillingAt: "2025-12-02",
  //   mrr: 499,
  // },
  // {
  //   id: 3,
  //   customer: "Foxtrot Studios",
  //   plan: "Enterprise",
  //   email: "ops@foxtrot.example",
  //   status: "Active",
  //   startedAt: "2025-01-09",
  //   nextBillingAt: "2026-01-09",
  //   mrr: 291,
  // },
  // {
  //   id: 4,
  //   customer: "Blue Ridge LLC",
  //   plan: "Growth",
  //   email: "finance@br.example",
  //   status: "Trialing",
  //   startedAt: "2025-11-01",
  //   nextBillingAt: "2025-11-20",
  //   mrr: 0,
  // },
  // {
  //   id: 5,
  //   customer: "Cursor Holdings",
  //   plan: "Growth",
  //   email: "ap@cursor.example",
  //   status: "Past due",
  //   startedAt: "2025-04-18",
  //   nextBillingAt: "2025-11-18",
  //   mrr: 1499,
  // },
  // {
  //   id: 6,
  //   customer: "Grey Matter",
  //   plan: "Starter",
  //   email: "admin@grey.example",
  //   status: "Cancelled",
  //   startedAt: "2024-12-05",
  //   nextBillingAt: "—",
  //   mrr: 0,
  // },
];

// Simulated async — mimics an API round-trip so `unwrap()` works the same way.
const simulateFetch = (payload) =>
  new Promise((resolve) => setTimeout(() => resolve(payload), 250));

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------
export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await simulateFetch({
        plans: SEED_PLANS,
        subscribers: SEED_SUBSCRIBERS,
      });
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch subscriptions");
    }
  },
);

export const fetchSubscriptionOptions = createAsyncThunk(
  "subscriptions/fetchOptions",
  async (_, { rejectWithValue }) => {
    try {
      return await simulateFetch(FALLBACK_SUBSCRIPTION_OPTIONS);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load options");
    }
  },
);

export const createPlan = createAsyncThunk(
  "subscriptions/createPlan",
  async (form, { rejectWithValue }) => {
    try {
      if (!form?.name?.trim()) return rejectWithValue("Plan name is required");
      const plan = {
        id: Date.now(),
        code: (form.code || form.name || "").toUpperCase().replace(/\s+/g, "_"),
        name: form.name.trim(),
        description: form.description || "",
        price: Number(form.price) || 0,
        currency: form.currency || "INR",
        interval: form.interval || "Monthly",
        billingCycle: form.billingCycle || "Recurring",
        trialDays: Number(form.trialDays) || 0,
        status: form.status || "Draft",
        features: Array.isArray(form.features) ? form.features : [],
        subscriberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return await simulateFetch(plan);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to create plan");
    }
  },
);

export const updatePlan = createAsyncThunk(
  "subscriptions/updatePlan",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = {
        ...data,
        id,
        price: Number(data.price) || 0,
        trialDays: Number(data.trialDays) || 0,
        updatedAt: new Date().toISOString(),
      };
      return await simulateFetch(updated);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to update plan");
    }
  },
);

export const deletePlan = createAsyncThunk(
  "subscriptions/deletePlan",
  async (id, { rejectWithValue }) => {
    try {
      await simulateFetch(true);
      return { id };
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to delete plan");
    }
  },
);

// ----------------------------------------------------
// STATE
// ----------------------------------------------------
const initialState = {
  plans: [],
  subscribers: [],

  loading: false,
  error: null,

  options: FALLBACK_SUBSCRIPTION_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

  submitting: false,
  submittingError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearSubmittingError: (state) => {
      state.submittingError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    simulateSubscribe: (state, action) => {
      state.subscribers.push(action.payload);
    },
    requestUpgrade: (state, action) => {
      const { subscriberId, requestedPlan } = action.payload;
      const subscriber = state.subscribers.find((s) => s.id === subscriberId);
      if (subscriber) {
        subscriber.status = "Upgrade Requested";
        subscriber.requestedPlan = requestedPlan;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch all ──
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans || [];
        state.subscribers = action.payload.subscribers || [];
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Options ──
      .addCase(fetchSubscriptionOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(fetchSubscriptionOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.optionsLoaded = true;
        state.options = {
          ...FALLBACK_SUBSCRIPTION_OPTIONS,
          ...(action.payload || {}),
        };
      })
      .addCase(fetchSubscriptionOptions.rejected, (state, action) => {
        state.optionsLoading = false;
        state.optionsError = action.payload;
      })

      // ── Create plan ──
      .addCase(createPlan.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) state.plans.unshift(action.payload);
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Update plan ──
      .addCase(updatePlan.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.plans.findIndex((p) => p.id === updated.id);
        if (idx !== -1) state.plans[idx] = { ...state.plans[idx], ...updated };
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      })

      // ── Delete plan ──
      .addCase(deletePlan.pending, (state) => {
        state.submitting = true;
        state.submittingError = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.submitting = false;
        state.plans = state.plans.filter((p) => p.id !== action.payload.id);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.submitting = false;
        state.submittingError = action.payload;
      });
  },
});

export const { clearSubmittingError, clearError, simulateSubscribe, requestUpgrade, } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
