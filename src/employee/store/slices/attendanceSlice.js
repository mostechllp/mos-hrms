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

// ✅ Punch In with Location - Fixed field names
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async (locationData, { rejectWithValue }) => {
    try {
      console.log("🔍 PUNCH IN DEBUG - Raw locationData received:", locationData);
      console.log("🔍 PUNCH IN DEBUG - locationData.location:", locationData?.location);
      
      // Prepare request body with location if available
      const requestBody = {};
      
      if (locationData && locationData.location) {
        // ✅ Use the exact field names the backend expects
        requestBody.punch_in_latitude = locationData.location.latitude;
        requestBody.punch_in_longitude = locationData.location.longitude;
        requestBody.punch_in_address = locationData.location.address;
        console.log("✅ Location added to request body:", requestBody);
      } else {
        console.warn("⚠️ No location data provided for punch in");
      }
      
      console.log("📤 Sending punch in request with body:", requestBody);
      
      const response = await apiClient.post("/employee/punch-in", requestBody);
      
      console.log("📥 Punch in response:", response.data);
      
      if (response.data && response.data.status === "success") {
        const data = response.data.data;
        
        localStorage.setItem("attendance-punched-in", "true");
        localStorage.setItem("attendance-punch-in-time", data.punch_in);
        
        return {
          punch_in: data.punch_in,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id,
          punch_in_latitude: data.punch_in_latitude,
          punch_in_longitude: data.punch_in_longitude,
          punch_in_address: data.punch_in_address
        };
      } else {
        return rejectWithValue(response.data?.message || "Punch in failed");
      }
    } catch (error) {
      console.error("Punch in error:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Punch in failed";
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Punch Out with Location (for current day)
export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async ({ tasks_completed, plan_tomorrow, pending_works, location }, { rejectWithValue }) => {
    try {
      // Prepare request body with tasks and location
      const requestBody = {
        tasks_completed,
        plan_tomorrow,
        pending_works, // Include pending works
      };
      
      // Add location if available
      if (location) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.address = location.address;
      }
      
      const response = await apiClient.post("/employee/punch-out", requestBody);
      
      if (response.data && response.data.status === "success") {
        const data = response.data.data;
        
        localStorage.removeItem("attendance-punched-in");
        localStorage.removeItem("attendance-punch-in-time");
        
        return {
          punch_out: data.punch_out,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id,
          task_report: data.task_report,
          punch_out_latitude: data.punch_out_latitude,
          punch_out_longitude: data.punch_out_longitude,
          punch_out_address: data.punch_out_address
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

// ✅ Pending Punch Out with Location (for previous day with custom time)
export const pendingPunchOut = createAsyncThunk(
  "attendance/pendingPunchOut",
  async ({ tasks_completed, plan_tomorrow, pending_works, punch_out_time, date, location }, { rejectWithValue }) => {
    try {
      // Combine the date with the provided punch out time
      const punchOutDateTime = `${date} ${punch_out_time}:00`;
      
      // Prepare request body with tasks and location
      const requestBody = {
        tasks_completed,
        plan_tomorrow,
        pending_works,
        punch_out_time: punchOutDateTime,
        log_date: date
      };
      
      // Add location if available
      if (location) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.address = location.address;
      }
      
      const response = await apiClient.post("/employee/pending-punch-out", requestBody);
      
      if (response.data && response.data.status === "success") {
        const data = response.data.data;
        return {
          punch_out: data.punch_out,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id,
          task_report: data.task_report,
          punch_out_latitude: data.punch_out_latitude,
          punch_out_longitude: data.punch_out_longitude,
          punch_out_address: data.punch_out_address
        };
      } else {
        return rejectWithValue(response.data?.message || "Failed to complete pending punch out");
      }
    } catch (error) {
      console.error("Pending punch out error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete pending punch out"
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
  dashboardData: null,
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

      // ✅ Punch Out (current day)
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
      })

      // ✅ Pending Punch Out (previous day)
      .addCase(pendingPunchOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pendingPunchOut.fulfilled, (state, action) => {
        state.loading = false;
        state.isPunchedIn = false;
        state.punchOutTime = action.payload.punch_out;
        state.error = null;
      })
      .addCase(pendingPunchOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;