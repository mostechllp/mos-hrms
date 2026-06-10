import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

const handleApiError = (error) => {
  if (error.response) {
    return (
      error.response.data?.message || `Server error: ${error.response.status}`
    );
  }
  if (error.request) return "Network error: Unable to connect to server";
  return error.message || "An unexpected error occurred";
};

const isValidPunch = (value) => value && value !== "-" && value.trim() !== "";

// Update the extractAttendanceRecords function in attendanceSlice.js

const extractAttendanceRecords = (response) => {
  try {
    const attendance = response.data?.data?.attendance;
    const apiStats = response.data?.data?.stats;

    if (attendance?.data && Array.isArray(attendance.data)) {
      const records = attendance.data.map((record, idx) => {
        const hasPunchOut = record.punch_out && record.punch_out !== "--";
        
        // Format punch times - handle both 12-hour (02:05 PM) and 24-hour formats
        const formatPunchTime = (punchValue) => {
          if (!punchValue || punchValue === "--") return "-";
          
          // If it's already in 24-hour format (HH:MM:SS)
          if (punchValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
            return punchValue;
          }
          
          // If it's in 12-hour format (HH:MM AM/PM)
          if (punchValue.match(/^\d{2}:\d{2} (AM|PM)$/i)) {
            return punchValue; // Keep as is for display
          }
          
          // If it includes date and time (YYYY-MM-DD HH:MM:SS)
          if (punchValue.includes(" ")) {
            const timePart = punchValue.split(" ")[1];
            return timePart;
          }
          
          return punchValue;
        };
        
        const punchIn = formatPunchTime(record.punch_in);
        const punchOut = record.punch_out && record.punch_out !== "--" 
          ? formatPunchTime(record.punch_out) 
          : null;

        // Extract employee name from user.employee object
        let employeeName = "-";
        let department = "-";

        if (record.user) {
          // Get employee name from user.employee
          if (record.user.employee) {
            const firstName = record.user.employee.first_name || "";
            const lastName = record.user.employee.last_name || "";
            employeeName = `${firstName} ${lastName}`.trim();
            if (!employeeName) employeeName = record.user.username || "-";
          } else {
            employeeName = record.user.username || "-";
          }

          // Get department from user.department
          if (record.user.department && record.user.department.name) {
            department = record.user.department.name;
          }
        }

        // Determine status - prioritize attendance_status from API if available
        let status = "Present";
        if (record.attendance_status) {
          status = record.attendance_status === "present" ? "Present" : "Absent";
        } else {
          // If no attendance_status, check if they have valid punch_in
          status = (record.punch_in && record.punch_in !== "--") ? "Present" : "Absent";
        }

        return {
          id: record.id || record.userid || idx,
          employee_id: record.userid,
          employeeName: employeeName,
          company: record.company?.company_name || "N/A",
          company_id: record.company_id || null,
          department: department,
          date: record.log_date || "-",
          punchIn: punchIn,
          punchOut: punchOut,
          punch_in_raw: record.punch_in,
          punch_out_raw: record.punch_out,
          status: status,
          isLate: false, // You can implement late logic based on business rules
          hasPunchOut: hasPunchOut,
          attendance_status: record.attendance_status,
        };
      });

      const meta = {
        total: attendance.total,
        current_page: attendance.current_page,
        last_page: attendance.last_page,
        per_page: attendance.per_page,
      };

      // Use stats from API if available
      const stats = apiStats
        ? {
            totalActiveEmployees: apiStats.total_active_employees || 0,
            presentToday: apiStats.present_today || 0,
            absentToday: apiStats.absent_today || 0,
            punchedInOnTime: apiStats.punched_in_on_time || 0,
            punchedLate: apiStats.punched_late || 0,
            punchedOutToday: apiStats.punched_out_today || 0,
          }
        : {
            totalActiveEmployees: meta.total || records.length,
            presentToday: records.filter((r) => r.status === "Present").length,
            absentToday: records.filter((r) => r.status === "Absent").length,
            punchedInOnTime: 0,
            punchedLate: 0,
            punchedOutToday: records.filter((r) => r.hasPunchOut).length,
          };

      return {
        records,
        total: meta.total || records.length,
        currentPage: meta.current_page || 1,
        lastPage: meta.last_page || 1,
        perPage: meta.per_page || 15,
        stats,
      };
    }

    return { records: [], total: 0 };
  } catch (error) {
    console.error("Error extracting attendance records:", error);
    return { records: [], total: 0 };
  }
};

const extractData = (response) => {
  if (response.data?.data?.data && Array.isArray(response.data.data.data))
    return response.data.data.data;
  if (response.data?.data && Array.isArray(response.data.data))
    return response.data.data;
  if (Array.isArray(response.data)) return response.data;
  return [];
};

export const fetchAttendanceRecords = createAsyncThunk(
  "attendance/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/attendance`, { params });
      return extractAttendanceRecords(response);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const uploadAttendanceFile = createAsyncThunk(
  "attendance/upload",
  async ({ file }, { rejectWithValue }) => {
    // ← remove company_id
    try {
      const formData = new FormData();
      // ❌ Remove this line: formData.append("company_id", company_id);
      formData.append("file", file); // ← only file

      const response = await apiClient.post(
        `/admin/attendance/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      console.log(
        "Upload response full:",
        JSON.stringify(response.data, null, 2),
      );

      const uploadId = response.data?.data?.id || null;
      const rawStatus = response.data?.data?.status || "pending";
      const processingStatus = [
        "completed",
        "done",
        "success",
        "processed",
      ].includes(rawStatus)
        ? "completed"
        : "processing";

      return {
        id: uploadId,
        status: processingStatus,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Upload error:", error.response?.data);
      if (error.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat();
        return rejectWithValue(msgs.join(", "));
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload attendance file",
      );
    }
  },
);

export const createManualAttendance = createAsyncThunk(
  "attendance/createManual",
  async (data, { rejectWithValue }) => {
    try {
      // The data coming in should already be formatted from the modal
      // But let's ensure proper formatting
      const transformedData = {
        userid: parseInt(data.employee_id),
        log_date: data.date,
        punch_in: data.punch_in, // Should already be "YYYY-MM-DD HH:MM:SS"
        punch_out: data.punch_out || null,
      };

      // Additional validation to ensure datetime format
      if (
        transformedData.punch_in &&
        !transformedData.punch_in.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
      ) {
        return rejectWithValue(
          "Punch In time must be in format: YYYY-MM-DD HH:MM:SS",
        );
      }

      if (
        transformedData.punch_out &&
        !transformedData.punch_out.match(
          /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
        )
      ) {
        return rejectWithValue(
          "Punch Out time must be in format: YYYY-MM-DD HH:MM:SS",
        );
      }

      const response = await apiClient.post(
        `/admin/attendance`,
        transformedData,
      );
      return response.data;
    } catch (error) {
      console.error("Manual attendance error:", error.response?.data);
      if (error.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat();
        return rejectWithValue(msgs.join(", "));
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create attendance",
      );
    }
  },
);

export const fetchUploadStatus = createAsyncThunk(
  "attendance/fetchUploadStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/attendance/upload-status/${id}`,
      );
      console.log(
        "Upload status response:",
        JSON.stringify(response.data, null, 2),
      );

      // API returns: { data: { id, status: "pending"|"completed"|"failed", progress, ... }, message, status: "success" }
      // NOTE: response.data.status is the HTTP wrapper ("success") — NOT the processing status
      // The actual processing status is inside response.data.data.status
      const processingStatus = response.data?.data?.status || "pending";

      // Normalize to our internal values
      let normalizedStatus;
      if (["completed", "done", "processed"].includes(processingStatus)) {
        normalizedStatus = "completed";
      } else if (processingStatus === "failed") {
        normalizedStatus = "failed";
      } else {
        normalizedStatus = "processing"; // "pending" and anything else = still going
      }

      return { id, status: normalizedStatus };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const updateAttendance = createAsyncThunk(
  "attendance/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/attendance/${id}`, data);
      console.log("Update attendance response:", response.data);

      // Return the updated record with proper formatting
      const updatedRecord = response.data?.data;
      if (updatedRecord) {
        // Format the updated record to match the frontend structure
        const formattedRecord = {
          id: updatedRecord.id,
          employee_id: updatedRecord.userid,
          date: updatedRecord.log_date,
          punchIn:
            updatedRecord.punch_in?.split(" ")[1] || updatedRecord.punch_in,
          punchOut:
            updatedRecord.punch_out?.split(" ")[1] || updatedRecord.punch_out,
          punch_in_raw: updatedRecord.punch_in,
          punch_out_raw: updatedRecord.punch_out,
          status:
            updatedRecord.attendance_status === "present"
              ? "Present"
              : "Absent",
          attendance_status: updatedRecord.attendance_status,
          hasPunchOut: !!updatedRecord.punch_out,
        };
        return { data: formattedRecord };
      }
      return response.data;
    } catch (error) {
      console.error("Update attendance error:", error.response?.data);
      if (error.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat();
        return rejectWithValue(msgs.join(", "));
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update attendance",
      );
    }
  },
);

export const deleteAttendance = createAsyncThunk(
  "attendance/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/attendance/${id}`);
      return { id, data: response.data };
    } catch (error) {
      console.error("Delete attendance error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete attendance",
      );
    }
  },
);

export const fetchPunchInToday = createAsyncThunk(
  "attendance/fetchPunchInToday",
  async () => {
    try {
      return extractData(
        await apiClient.get(`/admin/attendance/punch-in-today`),
      );
    } catch {
      return [];
    }
  },
);

export const fetchPunchInYesterday = createAsyncThunk(
  "attendance/fetchPunchInYesterday",
  async () => {
    try {
      return extractData(
        await apiClient.get(`/admin/attendance/punch-in-yesterday`),
      );
    } catch {
      return [];
    }
  },
);

export const fetchPunchOutToday = createAsyncThunk(
  "attendance/fetchPunchOutToday",
  async () => {
    try {
      return extractData(
        await apiClient.get(`/admin/attendance/punch-out-today`),
      );
    } catch {
      return [];
    }
  },
);

export const fetchLateComers = createAsyncThunk(
  "attendance/fetchLateComers",
  async () => {
    try {
      return extractData(await apiClient.get(`/admin/attendance/late-comers`));
    } catch {
      return [];
    }
  },
);

export const fetchAbsentees = createAsyncThunk(
  "attendance/fetchAbsentees",
  async () => {
    try {
      return extractData(await apiClient.get(`/admin/attendance/absentees`));
    } catch {
      return [];
    }
  },
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    records: [],
    stats: {
      totalActiveEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      punchedInOnTime: 0,
      punchedLate: 0,
      punchedOutToday: 0,
    },
    uploadStatus: null, // null | "processing" | "completed" | "failed"
    uploadStatusId: null,
    uploads: [],
    punchInToday: [],
    punchInYesterday: [],
    punchOutToday: [],
    lateComers: [],
    absentees: [],
    loading: false,
    uploadLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
  },
  reducers: {
    clearUploadStatus: (state) => {
      state.uploadStatus = null;
      state.uploadStatusId = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    updateUploadStatus: (state, action) => {
      const { id, status } = action.payload;
      const upload = state.uploads.find((u) => u.id === id);
      if (upload) {
        upload.status = status;
        upload.updatedAt = new Date().toISOString();
      }
      if (state.uploadStatusId === id) state.uploadStatus = status;
    },
    removeUpload: (state, action) => {
      state.uploads = state.uploads.filter((u) => u.id !== action.payload);
      if (state.uploadStatusId === action.payload) {
        state.uploadStatus = null;
        state.uploadStatusId = null;
      }
    },
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter((u) => u.status === "processing");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.totalCount = action.payload.total;
        state.currentPage = action.payload.currentPage || 1;
        state.lastPage = action.payload.lastPage || 1;
        state.perPage = action.payload.perPage || 15;
        if (action.payload.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.records = [];
        state.totalCount = 0;
      })

      .addCase(uploadAttendanceFile.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
        state.uploadStatus = null;
      })
      .addCase(uploadAttendanceFile.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = action.payload.status; // "processing" or "completed"
        state.uploadStatusId = action.payload.id;
        state.uploads.push({
          id: action.payload.id,
          status: action.payload.status,
          fileName: action.payload.fileName,
          company_id: action.payload.company_id,
          uploadedAt: action.payload.uploadedAt,
        });
      })
      .addCase(uploadAttendanceFile.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
        state.uploadStatus = "failed";
      })

      .addCase(fetchUploadStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const upload = state.uploads.find((u) => u.id === id);
        if (upload) upload.status = status;
        if (state.uploadStatusId === id) state.uploadStatus = status;
      })
      .addCase(fetchUploadStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchPunchInToday.fulfilled, (state, action) => {
        state.punchInToday = action.payload;
      })
      .addCase(fetchPunchInToday.rejected, (state) => {
        state.punchInToday = [];
      })
      .addCase(fetchPunchInYesterday.fulfilled, (state, action) => {
        state.punchInYesterday = action.payload;
      })
      .addCase(fetchPunchInYesterday.rejected, (state) => {
        state.punchInYesterday = [];
      })
      .addCase(fetchPunchOutToday.fulfilled, (state, action) => {
        state.punchOutToday = action.payload;
      })
      .addCase(fetchPunchOutToday.rejected, (state) => {
        state.punchOutToday = [];
      })
      .addCase(fetchLateComers.fulfilled, (state, action) => {
        state.lateComers = action.payload;
      })
      .addCase(fetchLateComers.rejected, (state) => {
        state.lateComers = [];
      })
      .addCase(fetchAbsentees.fulfilled, (state, action) => {
        state.absentees = action.payload;
      })
      .addCase(fetchAbsentees.rejected, (state) => {
        state.absentees = [];
      })
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        // Update the record in the state
        const updatedRecord = action.payload?.data;
        if (updatedRecord) {
          const index = state.records.findIndex(
            (r) => r.id === updatedRecord.id,
          );
          if (index !== -1) {
            // Preserve employee and department info while updating attendance data
            state.records[index] = {
              ...state.records[index],
              date: updatedRecord.date || state.records[index].date,
              punchIn: updatedRecord.punchIn || state.records[index].punchIn,
              punchOut: updatedRecord.punchOut || state.records[index].punchOut,
              punch_in_raw:
                updatedRecord.punch_in_raw || state.records[index].punch_in_raw,
              punch_out_raw:
                updatedRecord.punch_out_raw ||
                state.records[index].punch_out_raw,
              status: updatedRecord.status || state.records[index].status,
              attendance_status:
                updatedRecord.attendance_status ||
                state.records[index].attendance_status,
              hasPunchOut:
                updatedRecord.hasPunchOut !== undefined
                  ? updatedRecord.hasPunchOut
                  : state.records[index].hasPunchOut,
            };
          }
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter((r) => r.id !== action.payload.id);
        state.totalCount = state.totalCount - 1;
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearUploadStatus,
  clearErrors,
  updateUploadStatus,
  removeUpload,
  clearCompletedUploads,
} = attendanceSlice.actions;
export default attendanceSlice.reducer;
