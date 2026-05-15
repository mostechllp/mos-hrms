// store/slices/taskReportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Helper function to transform task report data from API
const transformTaskReportData = (report) => {
  return {
    id: report.id,
    date: report.date,
    employee_id: report.employee_id,
    employee: report.employee?.name || 
              report.employee?.full_name || 
              `Employee #${report.employee_id}` || 
              "-",
    tasksCompleted: report.tasks_completed || "-",
    planForTomorrow: report.plan_tomorrow || "-",
    remarks: report.remarks || "",
    created_at: report.created_at,
    updated_at: report.updated_at,
  };
};

// Fetch all task reports (Admin - List)
export const fetchTaskReports = createAsyncThunk(
  "taskReports/fetchAll",
  async ({ page = 1, perPage = 15, search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/task-reports", {
        params: {
          page,
          per_page: perPage,
          search: search || undefined,
        },
      });

      let reportsData = [];
      let total = 0;
      let currentPage = page;
      let perPageValue = perPage;
      let lastPage = 1;

      // Handle response structure
      if (response.data?.status === "success") {
        const paginatedData = response.data.data;
        reportsData = paginatedData?.data || [];
        total = paginatedData?.total || 0;
        currentPage = paginatedData?.current_page || page;
        perPageValue = paginatedData?.per_page || perPage;
        lastPage = paginatedData?.last_page || 1;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        reportsData = response.data.data;
        total = response.data.data.length;
      } else if (Array.isArray(response.data)) {
        reportsData = response.data;
        total = response.data.length;
      } else {
        reportsData = [];
      }

      const transformedReports = reportsData.map(transformTaskReportData);

      return {
        data: transformedReports,
        total: total,
        currentPage: currentPage,
        perPage: perPageValue,
        lastPage: lastPage,
      };
    } catch (error) {
      console.error("Fetch task reports error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task reports"
      );
    }
  }
);

// Get single task report (Admin - Show)
export const fetchTaskReportById = createAsyncThunk(
  "taskReports/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/task-reports/${id}`);
      let reportData = response.data?.data || response.data;
      return transformTaskReportData(reportData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task report"
      );
    }
  }
);

// Update remarks only (Admin can add/update remarks)
export const updateTaskReportRemarks = createAsyncThunk(
  "taskReports/updateRemarks",
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/task-reports/${id}`, {
        remarks: remarks || null,
      });

      let updatedReport = response.data?.data || response.data;
      return transformTaskReportData(updatedReport);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update remarks"
      );
    }
  }
);

// Delete task report (Admin - Delete)
export const deleteTaskReport = createAsyncThunk(
  "taskReports/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/task-reports/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete task report"
      );
    }
  }
);

const taskReportSlice = createSlice({
  name: "taskReports",
  initialState: {
    taskReports: [],
    currentReport: null,
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    perPage: 15,
    lastPage: 1,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Task Reports
      .addCase(fetchTaskReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskReports.fulfilled, (state, action) => {
        state.loading = false;
        state.taskReports = action.payload.data;
        state.totalCount = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.perPage = action.payload.perPage;
        state.lastPage = action.payload.lastPage;
      })
      .addCase(fetchTaskReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Task Report By ID
      .addCase(fetchTaskReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
      })
      .addCase(fetchTaskReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Remarks Only
      .addCase(updateTaskReportRemarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskReportRemarks.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReport = action.payload;
        const index = state.taskReports.findIndex(r => r.id === updatedReport.id);
        if (index !== -1) {
          state.taskReports[index] = updatedReport;
        }
        if (state.currentReport?.id === updatedReport.id) {
          state.currentReport = updatedReport;
        }
      })
      .addCase(updateTaskReportRemarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Task Report
      .addCase(deleteTaskReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaskReport.fulfilled, (state, action) => {
        state.loading = false;
        state.taskReports = state.taskReports.filter(r => r.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteTaskReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError, clearCurrentReport } = taskReportSlice.actions;
export default taskReportSlice.reducer;