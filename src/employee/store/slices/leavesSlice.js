import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../utils/apiClient';

// Fetch Employee Leaves
/// Fetch Employee Leaves
export const fetchEmployeeLeaves = createAsyncThunk(
  "leaves/fetchEmployeeLeaves",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the current employee ID from auth state
      const state = getState();
      const currentUser = state.auth?.user;
      const employeeId = currentUser?.employee?.id || currentUser?.id;
      
      console.log("Fetching leaves for employee ID:", employeeId);
      
      // Use admin endpoint to get leaves for this employee
      const response = await apiClient.get(`/employee/leaves`);
      console.log("Admin leaves response:", response.data);
      
      let leavesData = [];
      
      if (response.data && response.data.status === "success") {
        // Check the actual response structure from Postman
        if (response.data.data && response.data.data.leaves && Array.isArray(response.data.data.leaves)) {
          // Structure: { status: "success", data: { leaves: [...], user: {...} } }
          leavesData = response.data.data.leaves;
          console.log("Found leaves in data.leaves:", leavesData);
        } else if (Array.isArray(response.data.data)) {
          // Structure: { status: "success", data: [...] }
          leavesData = response.data.data;
          console.log("Found leaves in data array:", leavesData);
        } else if (response.data.data && Array.isArray(response.data.data.data)) {
          // Structure: { status: "success", data: { data: [...] } }
          leavesData = response.data.data.data;
          console.log("Found leaves in data.data:", leavesData);
        } else {
          leavesData = [];
          console.log("No leaves found in response");
        }
        
        // Transform the data to ensure consistent format
        const transformedLeaves = leavesData.map(leave => ({
          id: leave.id,
          leave_type: leave.leave_type?.name || leave.leave_type || "Annual Leave",
          leave_type_id: leave.leave_type_id || leave.leave_type?.id,
          start_date: leave.start_date?.split('T')[0] || leave.start_date,
          end_date: leave.end_date?.split('T')[0] || leave.end_date,
          duration_days: leave.duration_days,
          reason: leave.reason,
          status: leave.status,
          claim_salary: leave.claim_salary,
          document: leave.document,
          created_at: leave.created_at,
          // Add these for backward compatibility
          from_date: leave.start_date?.split('T')[0] || leave.start_date,
          to_date: leave.end_date?.split('T')[0] || leave.end_date,
          type: leave.leave_type?.name || leave.leave_type || "Annual Leave"
        }));
        
        console.log("Transformed leaves:", transformedLeaves);
        return transformedLeaves;
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
// Fetch Leave Balance - Use the employee API endpoint (correct one)
export const fetchLeaveBalance = createAsyncThunk(
  "leaves/fetchLeaveBalance",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.auth?.user;
      const employeeId = currentUser?.employee?.id || currentUser?.id;
      
      console.log("Fetching leave balance for employee ID:", employeeId);
      
      // Use the employee API endpoint instead of admin API
      const response = await apiClient.get("/employee/leave-balance");
      console.log("Employee leave balance response:", response.data);
      
      if (response.data && response.data.status === "success") {
        const leaveTypesData = response.data.data.leave_types || [];
        
        const leaveBalances = {};
        
        // Process each leave type from the employee API response
        leaveTypesData.forEach(leaveType => {
          leaveBalances[leaveType.name] = {
            allocated: leaveType.allocated || 0,
            taken: leaveType.taken || 0,
            pending: leaveType.pending || 0,
            remaining: leaveType.balance || 0,
            id: leaveType.id,
            status: leaveType.status,
            leave_type_id: leaveType.id,
            leave_type_name: leaveType.name
          };
        });
        
        // Add total balance
        leaveBalances.total = {
          allocated: response.data.data.total_allocated || 0,
          taken: response.data.data.leaves_taken || 0,
          pending: 0,
          remaining: response.data.data.remaining_balance || 0
        };
        
        console.log("Processed leave balances from employee API:", leaveBalances);
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

// Store New Leave Request - Updated to use employee API balance
// Store New Leave Request - Updated to work with new form data structure
export const addLeaveRequest = createAsyncThunk(
  "leaves/storeLeaveRequest",
  async (formData, { rejectWithValue, dispatch, getState }) => {
    try {
      console.log("Raw formData received:", formData);
      
      let leaveTypeId, startDate, endDate, reason, claimSalary, year, document;
      
      // Check if formData is FormData or regular object
      if (formData instanceof FormData) {
        // Extract values from FormData
        leaveTypeId = formData.get('leave_type_id');
        startDate = formData.get('start_date');
        endDate = formData.get('end_date');
        reason = formData.get('reason');
        claimSalary = formData.get('claim_salary');
        year = formData.get('year');
        document = formData.get('document');
      } else {
        // Regular object (JSON payload)
        leaveTypeId = formData.leave_type_id;
        startDate = formData.start_date;
        endDate = formData.end_date;
        reason = formData.reason;
        claimSalary = formData.claim_salary;
        year = formData.year;
        document = formData.document;
      }
      
      console.log("Extracted values:", {
        leaveTypeId,
        startDate,
        endDate,
        reason,
        claimSalary,
        year
      });
      
      // Get the current state
      const state = getState();
      const leaveBalances = state.EmpLeaves?.leaveBalances || {};
      
      // Calculate total days
      const from = new Date(startDate);
      const to = new Date(endDate);
      const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log("Total days calculated:", totalDays);
      
      // Find the leave type balance for validation
      let leaveTypeBalance = null;
      for (const [name, balance] of Object.entries(leaveBalances)) {
        if (balance.leave_type_id === parseInt(leaveTypeId) || balance.id === parseInt(leaveTypeId)) {
          leaveTypeBalance = balance;
          break;
        }
      }
      
      // Frontend validation using the employee API balance (skip for Unpaid Leave)
      const isUnpaidLeave = leaveTypeId == 4; // Assuming 4 is Unpaid Leave
      if (!isUnpaidLeave && leaveTypeBalance && totalDays > leaveTypeBalance.remaining && leaveTypeBalance.remaining >= 0) {
        return rejectWithValue(`Insufficient balance. You have only ${leaveTypeBalance.remaining} days remaining for this leave type`);
      }
      
      // Prepare payload for API
      let payload;
      let headers = {};
      
      if (document && document instanceof File) {
        // Use FormData for file upload
        payload = new FormData();
        payload.append('leave_type_id', leaveTypeId);
        payload.append('start_date', startDate);
        payload.append('end_date', endDate);
        payload.append('reason', reason);
        payload.append('claim_salary', claimSalary);
        payload.append('year', year);
        payload.append('document', document);
        headers = { 'Content-Type': 'multipart/form-data' };
        
        console.log("Sending as FormData with file");
      } else {
        // Send as JSON
        payload = {
          leave_type_id: parseInt(leaveTypeId),
          start_date: startDate,
          end_date: endDate,
          reason: reason,
          claim_salary: parseInt(claimSalary),
          year: parseInt(year)
        };
        headers = { 'Content-Type': 'application/json' };
        
        console.log("Sending as JSON:", payload);
      }
      
      // Use the correct API endpoint
      const response = await apiClient.post("/employee/leaves", payload, { headers });
      
      console.log("Store leave response:", response.data);
      
      if (response.data && response.data.status === "success") {
        // Refresh balance after successful submission
        await dispatch(fetchLeaveBalance());
        await dispatch(fetchEmployeeLeaves());
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Store leave error:", error);
      console.error("Error response:", error.response?.data);
      
      // Extract error message from response
      let errorMessage = "Failed to submit leave request";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat()[0];
      }
      
      return rejectWithValue(errorMessage);
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