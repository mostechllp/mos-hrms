import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../utils/apiClient';

// Fetch task reports from API
export const fetchTaskReports = createAsyncThunk(
  "taskReports/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.group("📡 TASK REPORTS API CALL");
      console.log("Request URL:", "/employee/task-reports");
      console.log("Request Params:", params);
      
      const response = await apiClient.get("/employee/task-reports", { params });
      
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.groupEnd();
      
      // Fix: Extract the data array from the correct path
      // The response structure is: { status: 'success', message: 'Success', data: [] }
      let reportsData = [];
      if (response.data && response.data.status === "success") {
        // Check if data is an array directly
        if (Array.isArray(response.data.data)) {
          reportsData = response.data.data;
        } 
        // Check if data is nested further
        else if (response.data.data && Array.isArray(response.data.data.data)) {
          reportsData = response.data.data.data;
        }
        // Check if there's a reports property
        else if (response.data.data && Array.isArray(response.data.data.reports)) {
          reportsData = response.data.data.reports;
        }
        // Check if the response itself is the array
        else if (Array.isArray(response.data)) {
          reportsData = response.data;
        }
      }
      
      console.log("Extracted reports data:", reportsData);
      
      return {
        data: reportsData,
        pagination: {
          currentPage: params.page || 1,
          perPage: params.per_page || 10,
          total: reportsData.length,
          totalPages: Math.ceil(reportsData.length / (params.per_page || 10))
        }
      };
    } catch (error) {
      console.group("❌ TASK REPORTS API ERROR");
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      console.groupEnd();
      
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task reports"
      );
    }
  }
);
// Save task report
export const saveTaskReport = createAsyncThunk(
  'taskReports/save',
  async ({ tasks_completed, plan_tomorrow }, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.post('/employee/task-reports', {
        tasks_completed,
        plan_tomorrow
      });
      console.log("Save task report response:", response.data);
      
      if (response.data?.status === "success") {
        // Refresh the list after saving
        await dispatch(fetchTaskReports());
        return response.data.data;
      }
      return rejectWithValue(response.data?.message || "Failed to save task report");
    } catch (error) {
      console.error("Save task report error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save task report"
      );
    }
  }
);

const initialState = {
  taskReports: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    perPage: 10,
  },
  search: '',
};

const taskReportsSlice = createSlice({
  name: 'taskReports',
  initialState,
  reducers: {
    setTaskReportsPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        currentPage: action.payload.currentPage,
        perPage: action.payload.perPage,
      };
    },
    setTaskReportsSearch: (state, action) => {
      state.search = action.payload;
      state.pagination.currentPage = 1;
    },
    clearTaskReportsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Task Reports
      .addCase(fetchTaskReports.pending, (state) => {
        console.log("Fetch pending...");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskReports.fulfilled, (state, action) => {
        console.log("Fetch fulfilled, payload:", action.payload);
        state.loading = false;
        // Fix: Extract the data from the payload correctly
        state.taskReports = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
        console.log("Updated state.taskReports:", state.taskReports);
      })
      .addCase(fetchTaskReports.rejected, (state, action) => {
        console.log("Fetch rejected, payload:", action.payload);
        state.loading = false;
        state.error = action.payload;
        state.taskReports = [];
      })
      
      // Save Task Report
      .addCase(saveTaskReport.pending, (state) => {
        state.error = null;
      })
      .addCase(saveTaskReport.fulfilled, (state) => {
        console.log("Save fulfilled");
        state.error = null;
      })
      .addCase(saveTaskReport.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  setTaskReportsPagination,
  setTaskReportsSearch,
  clearTaskReportsError
} = taskReportsSlice.actions;
export default taskReportsSlice.reducer;