import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ─── Value maps (UI ↔ API) ───
export const ACCRUAL_TYPE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half Yearly" },
  { value: "yearly", label: "Yearly" },
  { value: "daily", label: "Daily" },
];

export const PROBATION_ACTION_OPTIONS = [
  { value: "hold", label: "Hold" },
  { value: "accrue", label: "Accrue" },
  { value: "accrue_and_restrict_usage", label: "Accrue & Restrict Usage" },
];

// ─── Shape converters ───
export const fromApiPolicy = (p = {}) => ({
  id: p.id ?? null,
  leave_type_id: p.leave_type_id ?? "",
  leave_type_name:
    p.leave_type?.name ?? p.leave_type_name ?? `Type #${p.leave_type_id ?? ""}`,
  annual_allocation: p.annual_allocation ?? 0,
  enable_accrual: Boolean(p.enable_accrual),
  accrual_type: p.accrual_type ?? "monthly",
  accrual_days: p.accrual_days ?? "",
  apply_during_probation: Boolean(p.apply_during_probation),
  probation_action: p.probation_action ?? "hold",
  release_after_probation: Boolean(p.release_after_probation),
  enable_carry_forward: Boolean(p.enable_carry_forward),
  unlimited_carry_forward: Boolean(p.unlimited_carry_forward),
  maximum_carry_forward: p.maximum_carry_forward ?? "",
  status: p.status === false ? false : true,
  created_at: p.created_at,
  updated_at: p.updated_at,
});

export const toApiPolicy = (form = {}) => {
  const enableAccrual = Boolean(form.enable_accrual);
  const enableCF = Boolean(form.enable_carry_forward);
  const unlimitedCF = enableCF && Boolean(form.unlimited_carry_forward);

  return {
    leave_type_id: Number(form.leave_type_id),
    annual_allocation: Number(form.annual_allocation) || 0,
    enable_accrual: enableAccrual,
    accrual_type: enableAccrual ? form.accrual_type : null,
    accrual_days: enableAccrual
      ? Number(form.accrual_days) || 0
      : null,
    apply_during_probation: Boolean(form.apply_during_probation),
    probation_action: form.apply_during_probation
      ? form.probation_action
      : null,
    release_after_probation: Boolean(form.release_after_probation),
    enable_carry_forward: enableCF,
    unlimited_carry_forward: unlimitedCF,
    maximum_carry_forward: unlimitedCF
      ? null
      : enableCF
        ? Number(form.maximum_carry_forward) || 0
        : null,
    status: form.status !== false,
  };
};

// ─── Thunks ───
export const fetchLeavePolicies = createAsyncThunk(
  "leavePolicies/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/leave-policies");
      let data = res.data?.data;
      // Handle Laravel pagination shape { data: { data: [...] } }
      if (data && Array.isArray(data.data)) data = data.data;
      if (!Array.isArray(data)) data = res.data?.data ?? res.data ?? [];
      return data.map(fromApiPolicy);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch leave policies",
      );
    }
  },
);

export const fetchLeavePolicyById = createAsyncThunk(
  "leavePolicies/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/leave-policies/${id}`);
      const data = res.data?.data ?? res.data;
      return fromApiPolicy(data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch leave policy",
      );
    }
  },
);

export const createLeavePolicy = createAsyncThunk(
  "leavePolicies/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toApiPolicy(form);
      const res = await apiClient.post("/admin/leave-policies", payload);
      const data = res.data?.data ?? res.data;
      return fromApiPolicy(data);
    } catch (err) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors).flat()[0];
        return rejectWithValue(first || "Validation error");
      }
      return rejectWithValue(
        err.response?.data?.message || "Failed to create leave policy",
      );
    }
  },
);

export const updateLeavePolicy = createAsyncThunk(
  "leavePolicies/update",
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const payload = toApiPolicy(form);
      const res = await apiClient.put(`/admin/leave-policies/${id}`, payload);
      const data = res.data?.data ?? res.data;
      return fromApiPolicy(data);
    } catch (err) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors).flat()[0];
        return rejectWithValue(first || "Validation error");
      }
      return rejectWithValue(
        err.response?.data?.message || "Failed to update leave policy",
      );
    }
  },
);

export const deleteLeavePolicy = createAsyncThunk(
  "leavePolicies/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/leave-policies/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete leave policy",
      );
    }
  },
);

// ─── Slice ───
const initialState = {
  policies: [],
  currentPolicy: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

const leavePolicySlice = createSlice({
  name: "leavePolicies",
  initialState,
  reducers: {
    clearPolicyError: (state) => {
      state.error = null;
    },
    clearCurrentPolicy: (state) => {
      state.currentPolicy = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchLeavePolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeavePolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchLeavePolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single
      .addCase(fetchLeavePolicyById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeavePolicyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPolicy = action.payload;
      })
      .addCase(fetchLeavePolicyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createLeavePolicy.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createLeavePolicy.fulfilled, (state, action) => {
        state.saving = false;
        state.policies.unshift(action.payload);
      })
      .addCase(createLeavePolicy.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateLeavePolicy.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateLeavePolicy.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.policies.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (idx !== -1) state.policies[idx] = action.payload;
        if (state.currentPolicy?.id === action.payload.id) {
          state.currentPolicy = action.payload;
        }
      })
      .addCase(updateLeavePolicy.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteLeavePolicy.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteLeavePolicy.fulfilled, (state, action) => {
        state.deleting = false;
        state.policies = state.policies.filter(
          (p) => p.id !== action.payload,
        );
      })
      .addCase(deleteLeavePolicy.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearPolicyError, clearCurrentPolicy } = leavePolicySlice.actions;
export default leavePolicySlice.reducer;