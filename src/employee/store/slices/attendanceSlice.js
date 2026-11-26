import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";
import { setStoredWorkTimezone, getStoredWorkTimezone } from "../../utils/timezone";

// Timezone fields sent with every punch. The timezone is the one of the punch
// LOCATION (resolved from coordinates in LocationModal) - not the device's.
const timezoneFields = (location) => {
  const fields = {};
  if (location?.timezone) {
    fields.timezone = location.timezone;
    if (location.timezone_offset) fields.timezone_offset = location.timezone_offset;
    if (location.timezone_offset_minutes !== undefined && location.timezone_offset_minutes !== null) {
      fields.timezone_offset_minutes = location.timezone_offset_minutes;
    }
  }
  return fields;
};

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

// Fetch Punch Status (Late cutoff, HR approval status, punch permissions)
export const fetchPunchStatus = createAsyncThunk(
  "attendance/fetchPunchStatus",
  async (tzOverride, { rejectWithValue }) => {
    try {
      const storedTz = getStoredWorkTimezone();
      const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tz = tzOverride || storedTz || clientTz || "Asia/Dubai";
      const response = await apiClient.get(
        `/employee/punch-status?timezone=${encodeURIComponent(tz)}`,
        {
          headers: { "X-Timezone": tz },
        },
      );
      console.log("📥 Punch status response:", response.data);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch punch status",
        );
      }
    } catch (error) {
      console.error("Fetch punch status error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch punch status",
      );
    }
  },
);

// attendanceSlice.js - Fix to handle 201 status code and late punch reason
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async (payloadData, { rejectWithValue }) => {
    try {
      console.log("🔍 Punch in request:", payloadData);

      const requestBody = {};

      if (payloadData && payloadData.location) {
        requestBody.punch_in_latitude = payloadData.location.latitude;
        requestBody.punch_in_longitude = payloadData.location.longitude;
        requestBody.punch_in_address = payloadData.location.address;

        Object.assign(requestBody, timezoneFields(payloadData.location));
      } else if (payloadData) {
        if (payloadData.punch_in_latitude !== undefined) {
          requestBody.punch_in_latitude = payloadData.punch_in_latitude;
        }
        if (payloadData.punch_in_longitude !== undefined) {
          requestBody.punch_in_longitude = payloadData.punch_in_longitude;
        }
        if (payloadData.punch_in_address !== undefined) {
          requestBody.punch_in_address = payloadData.punch_in_address;
        }
        if (payloadData.timezone) {
          requestBody.timezone = payloadData.timezone;
        }
      }

      if (payloadData?.reason) {
        requestBody.reason = payloadData.reason;
      }

      console.log("📤 Sending request:", requestBody);

      const response = await apiClient.post("/employee/punch-in", requestBody);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", response.data);

      // Handle both 200 and 201 status codes
      if (response.status === 200 || response.status === 201) {
        const data = response.data.data || response.data;

        // Remember the timezone this shift runs in (used for all displays)
        const tz = payloadData?.location?.timezone || requestBody.timezone;
        if (tz) {
          setStoredWorkTimezone(tz);
        }

        // Store in localStorage
        localStorage.setItem("attendance-punched-in", "true");
        localStorage.setItem(
          "attendance-punch-in-time",
          data.punch_in_time || data.punch_in || new Date().toISOString(),
        );

        // Dispatch success
        return {
          punch_in: data.punch_in_time || data.punch_in,
          punch_in_time: data.punch_in_time || data.punch_in,
          raw_punch_in: data.raw_punch_in,
          show_timer: data.show_timer,
          approval_status: data.approval_status,
          is_late: data.is_late,
          has_leave_today: data.has_leave_today,
          request_id: data.request_id || data.id,
          log_date: data.log_date,
          log_status: data.log_status,
          id: data.id || data.request_id,
          punch_in_latitude: data.punch_in_latitude,
          punch_in_longitude: data.punch_in_longitude,
          punch_in_address: data.punch_in_address,
          message: response.data?.message || "Punched in successfully.",
          raw: data,
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

      const resData = error.response?.data || {};

      // Handle 403 Forbidden specifically for Late Approval workflow
      if (error.response?.status === 403) {
        const requiresReason =
          resData.requires_reason === true ||
          resData.requires_reason === "true" ||
          resData.requiresReason === true;
        const requestStatus =
          resData.request_status ||
          (resData.late_request ? resData.late_request.status : null);

        return rejectWithValue({
          is403: true,
          status: 403,
          requires_reason: requiresReason,
          request_status: requestStatus,
          message:
            resData.message ||
            (requiresReason
              ? "Late arrival requires HR approval with reason."
              : requestStatus === "pending"
                ? "Late request is pending HR approval."
                : requestStatus === "rejected"
                  ? "Late request was rejected by HR."
                  : "HR approval required to punch in."),
          data: resData,
        });
      }

      // Handle different error status codes
      if (error.response?.status === 422) {
        const errors = resData.errors;
        if (errors && errors.timezone) {
          return rejectWithValue(
            `Timezone error: ${errors.timezone.join(", ")}`,
          );
        }
        if (errors && errors.reason) {
          return rejectWithValue(
            `Reason error: ${errors.reason.join(", ")}`,
          );
        }
        return rejectWithValue(
          resData.message || "Validation error",
        );
      }

      return rejectWithValue(
        resData.message || "Punch in failed",
      );
    }
  },
);

// Similarly update punchOut
export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async (
    { tasks_completed, plan_tomorrow, pending_works, pending_tasks, location, is_overtime, overtime_hours },
    { rejectWithValue },
  ) => {
    try {
      const requestBody = {
        tasks_completed,
        plan_tomorrow,
        pending_works: pending_works || pending_tasks,
        is_overtime,
        overtime_hours,
      };

      if (location) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.address = location.address;

        Object.assign(requestBody, timezoneFields(location));
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
      is_overtime,
      overtime_hours,
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
        is_overtime,
        overtime_hours,
      };

      if (location) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.address = location.address;

        Object.assign(requestBody, timezoneFields(location));
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
      const storedTz = getStoredWorkTimezone();
      const payload = storedTz ? { timezone: storedTz } : {};
      const response = await apiClient.post("/employee/break/start", payload);
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
      const storedTz = getStoredWorkTimezone();
      const payload = storedTz ? { timezone: storedTz } : {};
      const response = await apiClient.post("/employee/break/end", payload);
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
  punchStatus: null,
  punchStatusLoading: false,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setPunchStatus: (state, action) => {
      state.punchStatus = { ...state.punchStatus, ...action.payload };
    },
    clearAttendanceState: (state) => {
      state.isPunchedIn = false;
      state.punchInTime = null;
      state.punchOutTime = null;
      state.punchStatus = null;
      state.error = null;
      localStorage.removeItem("attendance-punched-in");
      localStorage.removeItem("attendance-punch-in-time");
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Punch Status
      .addCase(fetchPunchStatus.pending, (state) => {
        state.punchStatusLoading = true;
      })
      .addCase(fetchPunchStatus.fulfilled, (state, action) => {
        state.punchStatusLoading = false;
        state.punchStatus = action.payload;
        if (action.payload) {
          if (action.payload.is_punched_in !== undefined) {
            state.isPunchedIn = action.payload.is_punched_in;
            if (action.payload.is_punched_in) {
              localStorage.setItem("attendance-punched-in", "true");
            } else {
              localStorage.removeItem("attendance-punched-in");
            }
          }
          if (action.payload.punch_in_time) {
            state.punchInTime = action.payload.punch_in_time;
            localStorage.setItem(
              "attendance-punch-in-time",
              action.payload.punch_in_time,
            );
          }
        }
      })
      .addCase(fetchPunchStatus.rejected, (state, action) => {
        state.punchStatusLoading = false;
      })

      // ✅ Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        if (action.payload?.today_attendance) {
          const punchStatusIn = state.punchStatus?.is_punched_in;
          if (punchStatusIn !== undefined) {
            state.isPunchedIn = punchStatusIn;
          } else {
            state.isPunchedIn =
              action.payload.today_attendance.punched_in || false;
          }
          state.punchInTime =
            action.payload.today_attendance.punch_in_time ||
            state.punchInTime ||
            null;
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
        state.punchInTime =
          action.payload.punch_in_time || action.payload.punch_in;
        state.error = null;
        const isLeaveExempt = action.payload.has_leave_today === true;
        state.punchStatus = {
          ...(state.punchStatus || {}),
          is_punched_in: true,
          is_punched_out: false,
          can_punch_in: false,
          punch_in_time:
            action.payload.punch_in_time || action.payload.punch_in,
          raw_punch_in: action.payload.raw_punch_in,
          show_timer: isLeaveExempt
            ? true
            : action.payload.show_timer !== undefined
              ? action.payload.show_timer
              : false,
          approval_status: isLeaveExempt
            ? "approved"
            : action.payload.approval_status || "pending",
          is_late: isLeaveExempt
            ? false
            : (action.payload.is_late ?? state.punchStatus?.is_late),
          has_leave_today:
            action.payload.has_leave_today ??
            state.punchStatus?.has_leave_today,
          late_request:
            !isLeaveExempt && action.payload.approval_status
              ? {
                  id: action.payload.request_id,
                  status: action.payload.approval_status,
                  reason: state.punchStatus?.late_request?.reason,
                  request_time:
                    action.payload.punch_in_time || action.payload.punch_in,
                }
              : state.punchStatus?.late_request,
        };
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

export const { clearAttendanceState, setPunchStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;