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
        return rejectWithValue(
          response.data?.message || "Failed to fetch dashboard data",
        );
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    }
  },
);

// Fetch Employee Breaks
export const fetchEmployeeBreaks = createAsyncThunk(
  "attendance/fetchEmployeeBreaks",
  async (date, { rejectWithValue }) => {
    try {
      const url = date ? `/employee/breaks?date=${date}` : "/employee/breaks";
      const response = await apiClient.get(url);
      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch breaks",
        );
      }
    } catch (error) {
      console.error("Breaks fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch breaks",
      );
    }
  },
);

// attendanceSlice.js - Fix to handle 201 status code

export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async (locationData, { rejectWithValue }) => {
    try {
      console.log("🔍 Punch in request:", locationData);

      const requestBody = {};

      if (locationData && locationData.location) {
        requestBody.punch_in_latitude = locationData.location.latitude;
        requestBody.punch_in_longitude = locationData.location.longitude;
        requestBody.punch_in_address = locationData.location.address;

        // Only send timezone if backend expects it
        if (locationData.location.timezone) {
          requestBody.timezone = locationData.location.timezone;
        }
      }

      console.log("📤 Sending request:", requestBody);

      const response = await apiClient.post("/employee/punch-in", requestBody);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", response.data);

      // Handle both 200 and 201 status codes
      if (response.status === 200 || response.status === 201) {
        const data = response.data.data || response.data;

        // Store in localStorage
        localStorage.setItem("attendance-punched-in", "true");
        localStorage.setItem(
          "attendance-punch-in-time",
          data.punch_in || new Date().toISOString(),
        );

        // Dispatch success
        return {
          punch_in: data.punch_in,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id,
          punch_in_latitude: data.punch_in_latitude,
          punch_in_longitude: data.punch_in_longitude,
          punch_in_address: data.punch_in_address,
        };
      } else {
        return rejectWithValue(response.data?.message || "Punch in failed");
      }
    } catch (error) {
      console.error("Punch in error:", error);
      console.error(
        "Error response:",
        error.response?.status,
        error.response?.data,
      );

      // Handle different error status codes
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && errors.timezone) {
          return rejectWithValue(
            `Timezone error: ${errors.timezone.join(", ")}`,
          );
        }
        return rejectWithValue(
          error.response?.data?.message || "Validation error",
        );
      }

      return rejectWithValue(
        error.response?.data?.message || "Punch in failed",
      );
    }
  },
);

// Similarly update punchOut
export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async (
    { tasks_completed, plan_tomorrow, pending_works, location },
    { rejectWithValue },
  ) => {
    try {
      const requestBody = {
        tasks_completed,
        plan_tomorrow,
        pending_works,
      };

      if (location) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.address = location.address;

        if (location.timezone) {
          requestBody.timezone = location.timezone;
        }
      }

      console.log("📤 Sending punch out request:", requestBody);

      const response = await apiClient.post("/employee/punch-out", requestBody);

      console.log("📥 Punch out response status:", response.status);
      console.log("📥 Punch out response data:", response.data);

      // Handle both 200 and 201 status codes
      if (response.status === 200 || response.status === 201) {
        const data = response.data.data || response.data;

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
          punch_out_address: data.punch_out_address,
        };
      } else {
        return rejectWithValue(response.data?.message || "Punch out failed");
      }
    } catch (error) {
      console.error("Punch out error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Punch out failed",
      );
    }
  },
);

// Update pendingPunchOut similarly
export const pendingPunchOut = createAsyncThunk(
  "attendance/pendingPunchOut",
  async (
    {
      tasks_completed,
      plan_tomorrow,
      pending_works,
      punch_out_time,
      date,
      location,
    },
    { rejectWithValue },
  ) => {
    try {
      const punchOutDateTime = `${date} ${punch_out_time}:00`;

      const requestBody = {
        tasks_completed,
        plan_tomorrow,
        pending_works,
        punch_out_time: punchOutDateTime,
        log_date: date,
      };

      if (location) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.address = location.address;

        if (location.timezone) {
          requestBody.timezone = location.timezone;
        }
      }

      const response = await apiClient.post("/employee/punch-out", requestBody);

      // Handle both 200 and 201 status codes
      if (response.status === 200 || response.status === 201) {
        const data = response.data.data || response.data;
        return {
          punch_out: data.punch_out,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id,
          task_report: data.task_report,
        };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to complete pending punch out",
        );
      }
    } catch (error) {
      console.error("Pending punch out error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete pending punch out",
      );
    }
  },
);

// ✅ Start Break
export const startBreak = createAsyncThunk(
  "attendance/startBreak",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/employee/break/start");
      if (response.status === 200 || response.status === 201) {
        return response.data?.data || response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to start break",
        );
      }
    } catch (error) {
      console.error("Start break error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to start break",
      );
    }
  },
);

// ✅ End Break
export const endBreak = createAsyncThunk(
  "attendance/endBreak",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/employee/break/end");
      if (response.status === 200 || response.status === 201) {
        return response.data?.data || response.data;
      } else {
        return rejectWithValue(response.data?.message || "Failed to end break");
      }
    } catch (error) {
      console.error("End break error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to end break",
      );
    }
  },
);

const initialState = {
  isPunchedIn: localStorage.getItem("attendance-punched-in") === "true",
  punchInTime: localStorage.getItem("attendance-punch-in-time") || null,
  punchOutTime: null,
  loading: false,
  error: null,
  dashboardData: null,
  employeeBreaks: null,
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
    builder;
    // ✅ Fetch Dashboard Data
    // In the extraReducers section of attendanceSlice.js

    builder
      // ✅ Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        if (action.payload?.today_attendance) {
          state.isPunchedIn =
            action.payload.today_attendance.punched_in || false;
          state.punchInTime =
            action.payload.today_attendance.punch_in_time || null;
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
        // Refresh dashboard data after successful punch in
        // This will be handled in the component
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
      })

      // ✅ Start Break
      .addCase(startBreak.pending, (state) => {
        state.loading = true;
      })
      .addCase(startBreak.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ End Break
      .addCase(endBreak.pending, (state) => {
        state.loading = true;
      })
      .addCase(endBreak.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Fetch Employee Breaks
      .addCase(fetchEmployeeBreaks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeBreaks.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeBreaks = action.payload;
      })
      .addCase(fetchEmployeeBreaks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
