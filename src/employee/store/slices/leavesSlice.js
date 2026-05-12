import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// Fetch Employee Leaves
export const fetchEmployeeLeaves = createAsyncThunk(
  "leaves/fetchEmployeeLeaves",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/employee/leaves");
      console.log("Fetched leaves:", response.data);
      
      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Fetch leaves error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaves"
      );
    }
  }
);

// Fetch Leave Balance from dedicated API
export const fetchLeaveBalance = createAsyncThunk(
  "leaves/fetchLeaveBalance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/employee/leave-balance");
      console.log("Leave balance response:", response.data);
      
      if (response.data && response.data.status === "success") {
        const balanceData = response.data.data;
        
        // Transform the data into a more usable format
        const leaveBalances = {};
        
        // Process leave types if available
        if (balanceData.leave_types && Array.isArray(balanceData.leave_types)) {
          balanceData.leave_types.forEach(leaveType => {
            leaveBalances[leaveType.name] = {
              allocated: balanceData.total_allocated || 0,
              taken: balanceData.leaves_taken || 0,
              pending: 0,
              remaining: balanceData.remaining_balance || 0,
              id: leaveType.id,
              status: leaveType.status
            };
          });
        }
        
        // Add total balance
        leaveBalances.total = {
          allocated: balanceData.total_allocated || 0,
          taken: balanceData.leaves_taken || 0,
          pending: 0,
          remaining: balanceData.remaining_balance || 0
        };
        
        return leaveBalances;
      } else {
        return rejectWithValue(response.data?.message || "Failed to fetch leave balance");
      }
    } catch (error) {
      console.error("Fetch leave balance error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave balance"
      );
    }
  }
);

// Store New Leave Request
export const addLeaveRequest = createAsyncThunk(
  "leaves/storeLeaveRequest",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      // Format the data for API based on actual response structure
      const payload = new FormData();
      payload.append('leave_type', formData.leaveType);
      payload.append('from_date', formData.fromDate);
      payload.append('to_date', formData.toDate);
      payload.append('reason', formData.reason);
      payload.append('claim_salary', formData.claimSalary === "Yes" ? 1 : 0);
      
      if (formData.document) {
        payload.append('document', formData.document);
      }
      
      const response = await apiClient.post("/employee/leaves", payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Store leave response:", response.data);
      
      if (response.data && response.data.status === "success") {
        // Refresh balance after successful submission
        await dispatch(fetchLeaveBalance());
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Store leave error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit leave request"
      );
    }
  }
);

// Calculate leave balances (now uses the API data)
export const calculateLeaveBalances = createAsyncThunk(
  "leaves/calculateLeaveBalances",
  async (_, { getState }) => {
    const state = getState();
    return state.leaves.leaveBalances;
  }
);

const initialState = {
  leaves: [],
  leaveBalances: {
    total: {
      allocated: 0,
      taken: 0,
      pending: 0,
      remaining: 0
    }
  },
  filter: {
    status: 'all',
    search: '',
  },
  pagination: {
    currentPage: 1,
    perPage: 10,
  },
  loading: false,
  error: null,
  submitting: false,
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setLeaveFilter: (state, action) => {
      state.filter.status = action.payload.status;
      state.filter.search = action.payload.search || '';
      state.pagination.currentPage = 1;
    },
    setLeavePagination: (state, action) => {
      state.pagination.currentPage = action.payload.currentPage;
      state.pagination.perPage = action.payload.perPage;
    },
    clearLeaveError: (state) => {
      state.error = null;
    },
    updateLeaveBalance: (state, action) => {
      state.leaveBalances = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employee Leaves
      .addCase(fetchEmployeeLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Leave Balance
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveBalances = action.payload;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Store Leave Request
      .addCase(addLeaveRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addLeaveRequest.fulfilled, (state, action) => {
        state.submitting = false;
        state.leaves.unshift(action.payload);
        state.error = null;
      })
      .addCase(addLeaveRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Calculate Leave Balances
      .addCase(calculateLeaveBalances.pending, (state) => {
        state.loading = true;
      })
      .addCase(calculateLeaveBalances.fulfilled, (state) => {
        state.loading = false;
        // Keep existing balances, don't overwrite
      })
      .addCase(calculateLeaveBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLeaveFilter, setLeavePagination, clearLeaveError, updateLeaveBalance } = leavesSlice.actions;
export default leavesSlice.reducer;