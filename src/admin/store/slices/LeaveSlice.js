import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Helper function to transform leave data from admin API - PRESERVING ALL FIELDS
const transformAdminLeaveData = (leave) => {
  return {
    id: leave.id,
    employee_id: leave.employee_id,
    employee_name:
      leave.employee?.name ||
      leave.employee?.full_name ||
      `${leave.employee?.first_name || ""} ${leave.employee?.last_name || ""}`.trim() ||
      leave.employee_name ||
      "-",
    employee: leave.employee || null,
    leave_type_id: leave.leave_type_id || leave.leave_type?.id,
    leave_type: leave.leave_type || { name: leave.type || "-" },
    // PRESERVE original date fields
    start_date: leave.start_date || leave.from_date || leave.fromDate,
    end_date: leave.end_date || leave.to_date || leave.toDate,
    // PRESERVE session fields
    session1: leave.session1 || leave.start_session || null,
    session2: leave.session2 || leave.end_session || null,
    // PRESERVE all other fields
    duration_days:
      leave.duration_days || leave.number_of_days || leave.days || 0,
    claim_salary: leave.claim_salary,
    document: leave.document_path || leave.document || leave.doc || null,
    document_path: leave.document_path || leave.document || leave.doc || null,
    reason: leave.reason || "-",
    status: (leave.status || "pending").toLowerCase(),
    approved_by: leave.approved_by,
    approver: leave.approver || null,
    admin_remark: leave.admin_remark || null,
    processed_by: leave.processed_by || leave.processedBy || "-",
    created_at: leave.created_at,
    updated_at: leave.updated_at,
    rejection_reason: leave.rejection_reason || null,
    // Keep raw data for debugging
    _raw: leave,
  };
};

// Async thunks for admin leave management
export const fetchLeaves = createAsyncThunk(
  "leaves/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/leaves");

      let leavesData = [];

      // Handle different response structures
      if (response.data?.status === "success") {
        leavesData = response.data.data?.data || [];
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        leavesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        leavesData = response.data;
      } else if (response.data?.leaves && Array.isArray(response.data.leaves)) {
        leavesData = response.data.leaves;
      } else {
        leavesData = [];
      }

      // Transform each leave to a consistent format - PRESERVING ALL FIELDS
      const transformedLeaves = leavesData.map(transformAdminLeaveData);

      console.log("Transformed leaves:", transformedLeaves); // Debug log

      return transformedLeaves;
    } catch (error) {
      console.error("Fetch leaves error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave requests",
      );
    }
  },
);

export const fetchLeaveById = createAsyncThunk(
  "leaves/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/leaves/${id}`);

      let leaveData = response.data?.data || response.data;
      return transformAdminLeaveData(leaveData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave request",
      );
    }
  },
);

export const updateLeaveStatus = createAsyncThunk(
  "leaves/updateStatus",
  async (
    { id, status, processedBy, rejection_reason },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.post(`/admin/leaves/${id}/status`, {
        status,
        processed_by: processedBy,
        rejection_reason: rejection_reason || null,
      });

      let updatedLeave = response.data?.data || response.data;
      return transformAdminLeaveData(updatedLeave);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave status",
      );
    }
  },
);

export const fetchLeaveBalances = createAsyncThunk(
  "leaves/fetchBalances",
  async ({ employee_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/leave-allocations/${employee_id}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave balances",
      );
    }
  },
);

export const updateLeaveAllocation = createAsyncThunk(
  "leaves/updateAllocation",
  async ({ employee_id, allocations }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/leave-allocations/${employee_id}`,
        {
          allocations: allocations,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Update allocation error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update allocation",
      );
    }
  },
);

// Leave Types
export const fetchLeaveTypes = createAsyncThunk(
  "leaves/fetchLeaveTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/leave-types");
      console.log("Leave types API response:", response.data);

      let leaveTypesData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        leaveTypesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        leaveTypesData = response.data;
      } else if (
        response.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        leaveTypesData = response.data.data.data;
      }

      return leaveTypesData;
    } catch (error) {
      console.error("Fetch leave types error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave types",
      );
    }
  },
);

export const addLeaveType = createAsyncThunk(
  "leaves/addType",
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/admin/leave-types", data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || "Failed to add leave type",
        data: err.response?.data,
        status: err.response?.status,
      });
    }
  },
);

export const updateLeaveType = createAsyncThunk(
  "leaves/updateType",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/admin/leave-types/${id}`, data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update leave type",
      );
    }
  },
);

export const deleteLeaveType = createAsyncThunk(
  "leaves/deleteType",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/leave-types/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete leave type",
      );
    }
  },
);

export const updateLeaveTypeStatus = createAsyncThunk(
  "leaves/updateTypeStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/admin/leave-types/${id}/status`, {
        status,
      });
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status",
      );
    }
  },
);


export const toggleLeaveTypeStatus = createAsyncThunk(
  "leaves/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/admin/leave-types/${id}/status`, {
        status,
      });
      return response.data.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

const leaveSlice = createSlice({
  name: "leaves",
  initialState: {
    leaves: [],
    currentLeave: null,
    leaveTypes: [],
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentLeave: (state) => {
      state.currentLeave = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leaves
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
        state.totalCount = action.payload?.length || 0;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch leave by ID
      .addCase(fetchLeaveById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeave = action.payload;
      })
      .addCase(fetchLeaveById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update leave status
      .addCase(updateLeaveStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLeave = action.payload;
        const index = state.leaves.findIndex((l) => l.id === updatedLeave.id);
        if (index !== -1) {
          state.leaves[index] = updatedLeave;
        }
        if (state.currentLeave?.id === updatedLeave.id) {
          state.currentLeave = updatedLeave;
        }
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch leave types
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        const types = Array.isArray(action.payload) ? action.payload : [];
        state.leaveTypes = types.map((type) => ({
          id: type.id,
          name: type.name,
          status: type.status === 1,
          raw: type,
        }));
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ... rest of your reducers
      .addCase(addLeaveType.fulfilled, (state, action) => {
        const type = action.payload;
        state.leaveTypes.push({
          id: type.id,
          name: type.name,
          status: type.status === 1,
          raw: type,
        });
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        const updatedType = action.payload;
        const index = state.leaveTypes.findIndex(
          (t) => t.id === updatedType.id,
        );
        if (index !== -1) {
          state.leaveTypes[index] = {
            id: updatedType.id,
            name: updatedType.name,
            status: updatedType.status === 1,
            raw: updatedType,
          };
        }
      })
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        state.leaveTypes = state.leaveTypes.filter(
          (t) => t.id !== action.payload,
        );
      })
      .addCase(updateLeaveTypeStatus.fulfilled, (state, action) => {
        const updatedType = action.payload;
        const index = state.leaveTypes.findIndex(
          (t) => t.id === updatedType.id,
        );
        if (index !== -1) {
          state.leaveTypes[index].status = updatedType.status === 1;
          state.leaveTypes[index].raw = updatedType;
        }
      })
      .addCase(toggleLeaveTypeStatus.fulfilled, (state, action) => {
        const updatedType = action.payload;
        const index = state.leaveTypes.findIndex(
          (t) => t.id === updatedType.id,
        );
        if (index !== -1) {
          state.leaveTypes[index].status = updatedType.status === 1;
        }
      });
  },
});

export const { clearError, clearCurrentLeave } = leaveSlice.actions;
export default leaveSlice.reducer;
