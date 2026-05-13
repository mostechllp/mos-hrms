// store/slices/reportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ==================== Attendance Report ====================
export const fetchAttendanceReport = createAsyncThunk(
  "reports/fetchAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/attendance", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          start_date: params.start_date,
          end_date: params.end_date,
          company: params.company,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attendance report"
      );
    }
  }
);

// ==================== Leaves Report ====================
export const fetchLeavesReport = createAsyncThunk(
  "reports/fetchLeaves",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/leaves", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          status: params.status,
          leave_type: params.leave_type,
          start_date: params.start_date,
          end_date: params.end_date,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaves report"
      );
    }
  }
);

// ==================== Employees Basic Report ====================
export const fetchEmployeesReport = createAsyncThunk(
  "reports/fetchEmployees",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/employees", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          company: params.company,
          department: params.department,
          status: params.status,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees report"
      );
    }
  }
);

// ==================== Employee Details Report ====================
export const fetchEmployeeDetailsReport = createAsyncThunk(
  "reports/fetchEmployeeDetails",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/employee-details", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          company: params.company,
          department: params.department,
          status: params.status,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee details report"
      );
    }
  }
);

// ==================== Employee Nearest Expiry Report ====================
export const fetchEmployeeNearestExpiryReport = createAsyncThunk(
  "reports/fetchEmployeeNearestExpiry",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/employee-nearest-expiry", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          expiry_days: params.expiry_days || 30,
          company: params.company,
          department: params.department,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee nearest expiry report"
      );
    }
  }
);

// ==================== Employee Upcoming Renewals Report ====================
export const fetchEmployeeUpcomingRenewalsReport = createAsyncThunk(
  "reports/fetchEmployeeUpcomingRenewals",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/employee-upcoming-renewals", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          min_days: params.min_days || 31,
          max_days: params.max_days || 90,
          company: params.company,
          department: params.department,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee upcoming renewals report"
      );
    }
  }
);

// ==================== Company Nearest Expiry Report ====================
export const fetchCompanyNearestExpiryReport = createAsyncThunk(
  "reports/fetchCompanyNearestExpiry",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/company-nearest-expiry", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          expiry_days: params.expiry_days || 30,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch company nearest expiry report"
      );
    }
  }
);

// ==================== Company Upcoming Renewals Report ====================
export const fetchCompanyUpcomingRenewalsReport = createAsyncThunk(
  "reports/fetchCompanyUpcomingRenewals",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/company-upcoming-renewals", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          min_days: params.min_days || 31,
          max_days: params.max_days || 90,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch company upcoming renewals report"
      );
    }
  }
);

// ==================== Pending Leaves Report ====================
export const fetchPendingLeavesReport = createAsyncThunk(
  "reports/fetchPendingLeaves",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/reports/pending-leaves", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          leave_type: params.leave_type,
          start_date: params.start_date,
          end_date: params.end_date,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending leaves report"
      );
    }
  }
);

// ==================== Update Leave Status (for pending leaves) ====================
export const updateLeaveStatusFromReport = createAsyncThunk(
  "reports/updateLeaveStatus",
  async ({ id, status, processedBy, rejection_reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/admin/reports/leaves/${id}/update-status`, {
        status,
        processed_by: processedBy,
        rejection_reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave status"
      );
    }
  }
);

// ==================== Initial State ====================
const initialState = {
  // Attendance Report
  attendanceRecords: [],
  attendanceLoading: false,
  attendanceError: null,
  attendanceTotalCount: 0,
  attendanceCurrentPage: 1,
  attendancePerPage: 10,
  attendanceLastPage: 1,

  // Leaves Report
  leaveRecords: [],
  leavesLoading: false,
  leavesError: null,
  leavesTotalCount: 0,
  leavesCurrentPage: 1,
  leavesPerPage: 10,
  leavesLastPage: 1,

  // Employees Basic Report
  basicEmployees: [],
  basicEmployeesLoading: false,
  basicEmployeesError: null,
  basicEmployeesTotalCount: 0,
  basicEmployeesCurrentPage: 1,
  basicEmployeesPerPage: 10,
  basicEmployeesLastPage: 1,

  // Employee Details Report
  employeeDetails: [],
  employeeDetailsLoading: false,
  employeeDetailsError: null,
  employeeDetailsTotalCount: 0,
  employeeDetailsCurrentPage: 1,
  employeeDetailsPerPage: 10,
  employeeDetailsLastPage: 1,

  // Employee Nearest Expiry Report
  employeeNearestExpiry: [],
  employeeNearestExpiryLoading: false,
  employeeNearestExpiryError: null,
  employeeNearestExpiryTotalCount: 0,
  employeeNearestExpiryCurrentPage: 1,
  employeeNearestExpiryPerPage: 10,
  employeeNearestExpiryLastPage: 1,

  // Employee Upcoming Renewals Report
  employeeUpcomingRenewals: [],
  employeeUpcomingRenewalsLoading: false,
  employeeUpcomingRenewalsError: null,
  employeeUpcomingRenewalsTotalCount: 0,
  employeeUpcomingRenewalsCurrentPage: 1,
  employeeUpcomingRenewalsPerPage: 10,
  employeeUpcomingRenewalsLastPage: 1,

  // Company Nearest Expiry Report
  companyNearestExpiry: [],
  companyNearestExpiryLoading: false,
  companyNearestExpiryError: null,
  companyNearestExpiryTotalCount: 0,
  companyNearestExpiryCurrentPage: 1,
  companyNearestExpiryPerPage: 10,
  companyNearestExpiryLastPage: 1,

  // Company Upcoming Renewals Report
  companyUpcomingRenewals: [],
  companyUpcomingRenewalsLoading: false,
  companyUpcomingRenewalsError: null,
  companyUpcomingRenewalsTotalCount: 0,
  companyUpcomingRenewalsCurrentPage: 1,
  companyUpcomingRenewalsPerPage: 10,
  companyUpcomingRenewalsLastPage: 1,

  // Pending Leaves Report
  pendingLeaves: [],
  pendingLeavesLoading: false,
  pendingLeavesError: null,
  pendingLeavesTotalCount: 0,
  pendingLeavesCurrentPage: 1,
  pendingLeavesPerPage: 10,
  pendingLeavesLastPage: 1,
};

// ==================== Slice ====================
const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.attendanceError = null;
    },
    clearLeavesError: (state) => {
      state.leavesError = null;
    },
    clearBasicEmployeesError: (state) => {
      state.basicEmployeesError = null;
    },
    clearEmployeeDetailsError: (state) => {
      state.employeeDetailsError = null;
    },
    clearEmployeeNearestExpiryError: (state) => {
      state.employeeNearestExpiryError = null;
    },
    clearEmployeeUpcomingRenewalsError: (state) => {
      state.employeeUpcomingRenewalsError = null;
    },
    clearCompanyNearestExpiryError: (state) => {
      state.companyNearestExpiryError = null;
    },
    clearCompanyUpcomingRenewalsError: (state) => {
      state.companyUpcomingRenewalsError = null;
    },
    clearPendingLeavesError: (state) => {
      state.pendingLeavesError = null;
    },
    resetAllReports: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== Attendance Report ====================
      .addCase(fetchAttendanceReport.pending, (state) => {
        state.attendanceLoading = true;
        state.attendanceError = null;
      })
      .addCase(fetchAttendanceReport.fulfilled, (state, action) => {
        state.attendanceLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.attendanceRecords = responseData?.data || responseData || [];
        state.attendanceTotalCount = responseData?.total || 0;
        state.attendanceCurrentPage = responseData?.current_page || 1;
        state.attendancePerPage = responseData?.per_page || 10;
        state.attendanceLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchAttendanceReport.rejected, (state, action) => {
        state.attendanceLoading = false;
        state.attendanceError = action.payload;
      })

      // ==================== Leaves Report ====================
      .addCase(fetchLeavesReport.pending, (state) => {
        state.leavesLoading = true;
        state.leavesError = null;
      })
      .addCase(fetchLeavesReport.fulfilled, (state, action) => {
        state.leavesLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.leaveRecords = responseData?.data || responseData || [];
        state.leavesTotalCount = responseData?.total || 0;
        state.leavesCurrentPage = responseData?.current_page || 1;
        state.leavesPerPage = responseData?.per_page || 10;
        state.leavesLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchLeavesReport.rejected, (state, action) => {
        state.leavesLoading = false;
        state.leavesError = action.payload;
      })

      // ==================== Employees Basic Report ====================
      .addCase(fetchEmployeesReport.pending, (state) => {
        state.basicEmployeesLoading = true;
        state.basicEmployeesError = null;
      })
      .addCase(fetchEmployeesReport.fulfilled, (state, action) => {
        state.basicEmployeesLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.basicEmployees = responseData?.data || responseData || [];
        state.basicEmployeesTotalCount = responseData?.total || 0;
        state.basicEmployeesCurrentPage = responseData?.current_page || 1;
        state.basicEmployeesPerPage = responseData?.per_page || 10;
        state.basicEmployeesLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchEmployeesReport.rejected, (state, action) => {
        state.basicEmployeesLoading = false;
        state.basicEmployeesError = action.payload;
      })

      // ==================== Employee Details Report ====================
      .addCase(fetchEmployeeDetailsReport.pending, (state) => {
        state.employeeDetailsLoading = true;
        state.employeeDetailsError = null;
      })
      .addCase(fetchEmployeeDetailsReport.fulfilled, (state, action) => {
        state.employeeDetailsLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.employeeDetails = responseData?.data || responseData || [];
        state.employeeDetailsTotalCount = responseData?.total || 0;
        state.employeeDetailsCurrentPage = responseData?.current_page || 1;
        state.employeeDetailsPerPage = responseData?.per_page || 10;
        state.employeeDetailsLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchEmployeeDetailsReport.rejected, (state, action) => {
        state.employeeDetailsLoading = false;
        state.employeeDetailsError = action.payload;
      })

      // ==================== Employee Nearest Expiry Report ====================
      .addCase(fetchEmployeeNearestExpiryReport.pending, (state) => {
        state.employeeNearestExpiryLoading = true;
        state.employeeNearestExpiryError = null;
      })
      .addCase(fetchEmployeeNearestExpiryReport.fulfilled, (state, action) => {
        state.employeeNearestExpiryLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.employeeNearestExpiry = responseData?.data || responseData || [];
        state.employeeNearestExpiryTotalCount = responseData?.total || 0;
        state.employeeNearestExpiryCurrentPage = responseData?.current_page || 1;
        state.employeeNearestExpiryPerPage = responseData?.per_page || 10;
        state.employeeNearestExpiryLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchEmployeeNearestExpiryReport.rejected, (state, action) => {
        state.employeeNearestExpiryLoading = false;
        state.employeeNearestExpiryError = action.payload;
      })

      // ==================== Employee Upcoming Renewals Report ====================
      .addCase(fetchEmployeeUpcomingRenewalsReport.pending, (state) => {
        state.employeeUpcomingRenewalsLoading = true;
        state.employeeUpcomingRenewalsError = null;
      })
      .addCase(fetchEmployeeUpcomingRenewalsReport.fulfilled, (state, action) => {
        state.employeeUpcomingRenewalsLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.employeeUpcomingRenewals = responseData?.data || responseData || [];
        state.employeeUpcomingRenewalsTotalCount = responseData?.total || 0;
        state.employeeUpcomingRenewalsCurrentPage = responseData?.current_page || 1;
        state.employeeUpcomingRenewalsPerPage = responseData?.per_page || 10;
        state.employeeUpcomingRenewalsLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchEmployeeUpcomingRenewalsReport.rejected, (state, action) => {
        state.employeeUpcomingRenewalsLoading = false;
        state.employeeUpcomingRenewalsError = action.payload;
      })

      // ==================== Company Nearest Expiry Report ====================
      .addCase(fetchCompanyNearestExpiryReport.pending, (state) => {
        state.companyNearestExpiryLoading = true;
        state.companyNearestExpiryError = null;
      })
      .addCase(fetchCompanyNearestExpiryReport.fulfilled, (state, action) => {
        state.companyNearestExpiryLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.companyNearestExpiry = responseData?.data || responseData || [];
        state.companyNearestExpiryTotalCount = responseData?.total || 0;
        state.companyNearestExpiryCurrentPage = responseData?.current_page || 1;
        state.companyNearestExpiryPerPage = responseData?.per_page || 10;
        state.companyNearestExpiryLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchCompanyNearestExpiryReport.rejected, (state, action) => {
        state.companyNearestExpiryLoading = false;
        state.companyNearestExpiryError = action.payload;
      })

      // ==================== Company Upcoming Renewals Report ====================
      .addCase(fetchCompanyUpcomingRenewalsReport.pending, (state) => {
        state.companyUpcomingRenewalsLoading = true;
        state.companyUpcomingRenewalsError = null;
      })
      .addCase(fetchCompanyUpcomingRenewalsReport.fulfilled, (state, action) => {
        state.companyUpcomingRenewalsLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.companyUpcomingRenewals = responseData?.data || responseData || [];
        state.companyUpcomingRenewalsTotalCount = responseData?.total || 0;
        state.companyUpcomingRenewalsCurrentPage = responseData?.current_page || 1;
        state.companyUpcomingRenewalsPerPage = responseData?.per_page || 10;
        state.companyUpcomingRenewalsLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchCompanyUpcomingRenewalsReport.rejected, (state, action) => {
        state.companyUpcomingRenewalsLoading = false;
        state.companyUpcomingRenewalsError = action.payload;
      })

      // ==================== Pending Leaves Report ====================
      .addCase(fetchPendingLeavesReport.pending, (state) => {
        state.pendingLeavesLoading = true;
        state.pendingLeavesError = null;
      })
      .addCase(fetchPendingLeavesReport.fulfilled, (state, action) => {
        state.pendingLeavesLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.pendingLeaves = responseData?.data || responseData || [];
        state.pendingLeavesTotalCount = responseData?.total || 0;
        state.pendingLeavesCurrentPage = responseData?.current_page || 1;
        state.pendingLeavesPerPage = responseData?.per_page || 10;
        state.pendingLeavesLastPage = responseData?.last_page || 1;
      })
      .addCase(fetchPendingLeavesReport.rejected, (state, action) => {
        state.pendingLeavesLoading = false;
        state.pendingLeavesError = action.payload;
      })

      // ==================== Update Leave Status ====================
      .addCase(updateLeaveStatusFromReport.fulfilled, (state, action) => {
        // Remove the updated leave from pending leaves list
        const updatedLeaveId = action.meta.arg.id;
        state.pendingLeaves = state.pendingLeaves.filter(
          (leave) => leave.id !== updatedLeaveId
        );
        state.pendingLeavesTotalCount = Math.max(0, state.pendingLeavesTotalCount - 1);
      });
  },
});

// ==================== Export Actions ====================
export const {
  clearAttendanceError,
  clearLeavesError,
  clearBasicEmployeesError,
  clearEmployeeDetailsError,
  clearEmployeeNearestExpiryError,
  clearEmployeeUpcomingRenewalsError,
  clearCompanyNearestExpiryError,
  clearCompanyUpcomingRenewalsError,
  clearPendingLeavesError,
  resetAllReports,
} = reportSlice.actions;

// ==================== Export Selectors ====================
// Attendance Selectors
export const selectAttendanceRecords = (state) => state.reports.attendanceRecords;
export const selectAttendanceLoading = (state) => state.reports.attendanceLoading;
export const selectAttendanceError = (state) => state.reports.attendanceError;
export const selectAttendancePagination = (state) => ({
  total: state.reports.attendanceTotalCount,
  currentPage: state.reports.attendanceCurrentPage,
  perPage: state.reports.attendancePerPage,
  lastPage: state.reports.attendanceLastPage,
});

// Leaves Report Selectors
export const selectLeaveRecords = (state) => state.reports.leaveRecords;
export const selectLeavesLoading = (state) => state.reports.leavesLoading;
export const selectLeavesError = (state) => state.reports.leavesError;
export const selectLeavesPagination = (state) => ({
  total: state.reports.leavesTotalCount,
  currentPage: state.reports.leavesCurrentPage,
  perPage: state.reports.leavesPerPage,
  lastPage: state.reports.leavesLastPage,
});

// Employee Details Selectors
export const selectEmployeeDetails = (state) => state.reports.employeeDetails;
export const selectEmployeeDetailsLoading = (state) => state.reports.employeeDetailsLoading;
export const selectEmployeeDetailsError = (state) => state.reports.employeeDetailsError;
export const selectEmployeeDetailsPagination = (state) => ({
  total: state.reports.employeeDetailsTotalCount,
  currentPage: state.reports.employeeDetailsCurrentPage,
  perPage: state.reports.employeeDetailsPerPage,
  lastPage: state.reports.employeeDetailsLastPage,
});

// Employee Nearest Expiry Selectors
export const selectEmployeeNearestExpiry = (state) => state.reports.employeeNearestExpiry;
export const selectEmployeeNearestExpiryLoading = (state) => state.reports.employeeNearestExpiryLoading;
export const selectEmployeeNearestExpiryError = (state) => state.reports.employeeNearestExpiryError;
export const selectEmployeeNearestExpiryPagination = (state) => ({
  total: state.reports.employeeNearestExpiryTotalCount,
  currentPage: state.reports.employeeNearestExpiryCurrentPage,
  perPage: state.reports.employeeNearestExpiryPerPage,
  lastPage: state.reports.employeeNearestExpiryLastPage,
});

// Employee Upcoming Renewals Selectors
export const selectEmployeeUpcomingRenewals = (state) => state.reports.employeeUpcomingRenewals;
export const selectEmployeeUpcomingRenewalsLoading = (state) => state.reports.employeeUpcomingRenewalsLoading;
export const selectEmployeeUpcomingRenewalsError = (state) => state.reports.employeeUpcomingRenewalsError;
export const selectEmployeeUpcomingRenewalsPagination = (state) => ({
  total: state.reports.employeeUpcomingRenewalsTotalCount,
  currentPage: state.reports.employeeUpcomingRenewalsCurrentPage,
  perPage: state.reports.employeeUpcomingRenewalsPerPage,
  lastPage: state.reports.employeeUpcomingRenewalsLastPage,
});

// Company Nearest Expiry Selectors
export const selectCompanyNearestExpiry = (state) => state.reports.companyNearestExpiry;
export const selectCompanyNearestExpiryLoading = (state) => state.reports.companyNearestExpiryLoading;
export const selectCompanyNearestExpiryError = (state) => state.reports.companyNearestExpiryError;
export const selectCompanyNearestExpiryPagination = (state) => ({
  total: state.reports.companyNearestExpiryTotalCount,
  currentPage: state.reports.companyNearestExpiryCurrentPage,
  perPage: state.reports.companyNearestExpiryPerPage,
  lastPage: state.reports.companyNearestExpiryLastPage,
});

// Company Upcoming Renewals Selectors
export const selectCompanyUpcomingRenewals = (state) => state.reports.companyUpcomingRenewals;
export const selectCompanyUpcomingRenewalsLoading = (state) => state.reports.companyUpcomingRenewalsLoading;
export const selectCompanyUpcomingRenewalsError = (state) => state.reports.companyUpcomingRenewalsError;
export const selectCompanyUpcomingRenewalsPagination = (state) => ({
  total: state.reports.companyUpcomingRenewalsTotalCount,
  currentPage: state.reports.companyUpcomingRenewalsCurrentPage,
  perPage: state.reports.companyUpcomingRenewalsPerPage,
  lastPage: state.reports.companyUpcomingRenewalsLastPage,
});

// Pending Leaves Selectors
export const selectPendingLeaves = (state) => state.reports.pendingLeaves;
export const selectPendingLeavesLoading = (state) => state.reports.pendingLeavesLoading;
export const selectPendingLeavesError = (state) => state.reports.pendingLeavesError;
export const selectPendingLeavesPagination = (state) => ({
  total: state.reports.pendingLeavesTotalCount,
  currentPage: state.reports.pendingLeavesCurrentPage,
  perPage: state.reports.pendingLeavesPerPage,
  lastPage: state.reports.pendingLeavesLastPage,
});

export default reportSlice.reducer;