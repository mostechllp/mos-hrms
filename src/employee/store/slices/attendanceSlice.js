import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Fetch Dashboard Data
export const fetchDashboardData = createAsyncThunk(
  "attendance/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/employee/dashboard");
      console.log("Dashboard data:", response.data);
      
      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

// ✅ Punch In
// Update punchIn thunk to provide better error messages
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/employee/punch-in");
      
      if (response.data && response.data.status === "success") {
        const data = response.data.data;
        
        localStorage.setItem("attendance-punched-in", "true");
        localStorage.setItem("attendance-punch-in-time", data.punch_in);
        
        return {
          punch_in: data.punch_in,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id
        };
      } else {
        return rejectWithValue(response.data?.message || "Punch in failed");
      }
    } catch (error) {
      console.error("Punch in error:", error);
      // Preserve the exact error message from the API
      const errorMsg = error.response?.data?.message || "Punch in failed";
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Punch Out
// In your taskReportsSlice.js or attendanceSlice.js
export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async ({ tasks_completed, plan_tomorrow, pending_tasks }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/employee/punch-out", {
        tasks_completed,
        plan_tomorrow,
        pending_tasks, // Add this field
      });
      
      if (response.data && response.data.status === "success") {
        const data = response.data.data;
        
        localStorage.removeItem("attendance-punched-in");
        localStorage.removeItem("attendance-punch-in-time");
        
        return {
          punch_out: data.punch_out,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id,
          task_report: data.task_report // If API returns the task report
        };
      } else {
        return rejectWithValue(response.data?.message || "Punch out failed");
      }
    } catch (error) {
      console.error("Punch out error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Punch out failed"
      );
    }
  }
);

const initialState = {
  isPunchedIn: localStorage.getItem("attendance-punched-in") === "true",
  punchInTime: localStorage.getItem("attendance-punch-in-time") || null,
  punchOutTime: null,
  loading: false,
  error: null,
  dashboardData: null, // Store dashboard data
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceState: (state) => {
      state.isPunchedIn = false;
      state.punchInTime = null;
      state.punchOutTime = null;
      state.error = null;
      localStorage.removeItem("attendance-punched-in");
      localStorage.removeItem("attendance-punch-in-time");
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        // Update punch status from dashboard data if not already set
        if (action.payload.today_attendance) {
          state.isPunchedIn = action.payload.today_attendance.punched_in || false;
          state.punchInTime = action.payload.today_attendance.punch_in_time || null;
        }
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Punch In
      .addCase(punchIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        state.loading = false;
        state.isPunchedIn = true;
        state.punchInTime = action.payload.punch_in;
        state.error = null;
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Punch Out
      .addCase(punchOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        state.loading = false;
        state.isPunchedIn = false;
        state.punchOutTime = action.payload.punch_out;
        state.punchInTime = null;
        state.error = null;
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;