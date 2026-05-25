import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../utils/apiClient';

// Fetch task reports from API
export const fetchTaskReports = createAsyncThunk(
  'taskReports/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/employee/task-reports');
      console.log("Fetch task reports response:", response.data);
      
      if (response.data?.status === "success") {
        // Make sure we return the data array
        const reports = response.data.data || [];
        console.log("Reports to store:", reports);
        return reports;
      }
      return rejectWithValue(response.data?.message || "Failed to fetch task reports");
    } catch (error) {
      console.error("Fetch task reports error:", error);
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
        state.taskReports = action.payload; // Make sure this is set correctly
        state.error = null;
        console.log("Updated state.taskReports:", state.taskReports);
      })
      .addCase(fetchTaskReports.rejected, (state, action) => {
        console.log("Fetch rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
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