import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Helper for error handling
const handleApiError = (error) => {
  if (error.response) {
    return (
      error.response.data?.message || `Server error: ${error.response.status}`
    );
  }
  if (error.request) {
    return "Network error: Unable to connect to server";
  }
  return error.message || "An unexpected error occurred";
};

// Helper to extract and transform attendance records from API response
const extractAttendanceRecords = (response) => {
  try {
    if (
      response.data?.data?.attendance?.data &&
      Array.isArray(response.data.data.attendance.data)
    ) {
      const attendanceData = response.data.data.attendance;
      const records = attendanceData.data.map((record) => ({
        id: record.userid,
        company: record.company?.company_name || "Unknown",
        company_id: record.company_id,
        employeeName: record.user?.first_name
          ? `${record.user.first_name} ${record.user.last_name || ""}`.trim()
          : `User ${record.userid}`,
        employee_id: record.userid,
        date: record.log_date,
        punchIn: record.punch_in
          ? new Date(record.punch_in).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
        punchOut: record.punch_out
          ? new Date(record.punch_out).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        punch_in_raw: record.punch_in,
        punch_out_raw: record.punch_out,
        isLate: false,
        hasPunchOut: !!record.punch_out,
      }));

      return {
        records,
        total: attendanceData.total || records.length,
        currentPage: attendanceData.current_page,
        lastPage: attendanceData.last_page,
        perPage: attendanceData.per_page,
      };
    }

    if (response.data?.data && Array.isArray(response.data.data)) {
      return {
        records: response.data.data,
        total: response.data.data.length,
      };
    }

    if (Array.isArray(response.data)) {
      return {
        records: response.data,
        total: response.data.length,
      };
    }

    return { records: [], total: 0 };
  } catch (error) {
    console.error("Error extracting attendance records:", error);
    return { records: [], total: 0 };
  }
};

// Helper to extract stats from API response
const extractStats = (response) => {
  try {
    if (response.data?.data?.stats) {
      const stats = response.data.data.stats;
      return {
        totalActiveEmployees: stats.total_active_employees || 0,
        presentToday: stats.present_today || 0,
        absentToday: stats.absent_today || 0,
        punchedInOnTime: stats.punched_in_on_time || 0,
        punchedLate: stats.punched_late || 0,
        punchedOutToday: stats.punched_out_today || 0,
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting stats:", error);
    return null;
  }
};

// Helper to extract data from simple list responses
const extractData = (response) => {
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  if (
    response.data?.status === "success" &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};

// Async Thunks
export const fetchAttendanceRecords = createAsyncThunk(
  "attendance/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/reports/attendance`, { params });
      console.log("Attendance records response:", response.data);
      const result = extractAttendanceRecords(response);
      const stats = extractStats(response);
      return { ...result, stats };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const uploadAttendanceFile = createAsyncThunk(
  "attendance/upload",
  async ({ company_id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("company_id", company_id);
      formData.append("file", file);

      const response = await apiClient.post(
        `/admin/attendance/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Upload response:", response.data);

      const uploadId =
        response.data?.upload_id ||
        response.data?.data?.id ||
        response.data?.id;
      const status = response.data?.status || "processing";

      return { 
        id: uploadId, 
        status: status,
        fileName: file.name,
        company_id: company_id,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Upload error details:", error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return rejectWithValue(errorMessages.join(", "));
      }
      
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to upload attendance file",
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
      console.log("Upload status response:", response.data);

      let status = "processing";
      if (response.data?.data?.status) {
        status = response.data.data.status;
      } else if (response.data?.status) {
        status = response.data.status;
      } else if (typeof response.data === "string") {
        status = response.data;
      }

      return { id, status };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const fetchPunchInToday = createAsyncThunk(
  "attendance/fetchPunchInToday",
  async () => {
    try {
      const response = await apiClient.get(`/admin/attendance/punch-in-today`);
      console.log("Punch in today response:", response.data);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch punch in today:", error);
      return [];
    }
  },
);

export const fetchPunchInYesterday = createAsyncThunk(
  "attendance/fetchPunchInYesterday",
  async () => {
    try {
      const response = await apiClient.get(
        `/admin/attendance/punch-in-yesterday`,
      );
      console.log("Punch in yesterday response:", response.data);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch punch in yesterday:", error);
      return [];
    }
  },
);

export const fetchPunchOutToday = createAsyncThunk(
  "attendance/fetchPunchOutToday",
  async () => {
    try {
      const response = await apiClient.get(`/admin/attendance/punch-out-today`);
      console.log("Punch out today response:", response.data);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch punch out today:", error);
      return [];
    }
  },
);

export const fetchLateComers = createAsyncThunk(
  "attendance/fetchLateComers",
  async () => {
    try {
      const response = await apiClient.get(`/admin/attendance/late-comers`);
      console.log("Late comers response:", response.data);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch late comers:", error);
      return [];
    }
  },
);

export const fetchAbsentees = createAsyncThunk(
  "attendance/fetchAbsentees",
  async () => {
    try {
      const response = await apiClient.get(`/admin/attendance/absentees`);
      console.log("Absentees response:", response.data);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch absentees:", error);
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
    uploadStatus: null,
    uploadStatusId: null,
    uploads: [], // Track multiple uploads
    punchInToday: [],
    punchInYesterday: [],
    punchOutToday: [],
    lateComers: [],
    absentees: [],
    loading: false,
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
    addUpload: (state, action) => {
      state.uploads.push(action.payload);
    },
    updateUploadStatus: (state, action) => {
      const { id, status } = action.payload;
      const upload = state.uploads.find(u => u.id === id);
      if (upload) {
        upload.status = status;
        upload.updatedAt = new Date().toISOString();
      }
      // Also update the current upload if it matches
      if (state.uploadStatusId === id) {
        state.uploadStatus = status;
      }
    },
    removeUpload: (state, action) => {
      state.uploads = state.uploads.filter(u => u.id !== action.payload);
      if (state.uploadStatusId === action.payload) {
        state.uploadStatus = null;
        state.uploadStatusId = null;
      }
    },
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter(u => u.status === 'processing');
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Attendance Records
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
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.records = [];
        state.totalCount = 0;
      })

      // Upload Attendance File
      .addCase(uploadAttendanceFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAttendanceFile.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadStatus = "processing";
        state.uploadStatusId = action.payload.id;
        // Add to uploads list for persistence
        state.uploads.push({
          id: action.payload.id,
          status: "processing",
          fileName: action.payload.fileName,
          company_id: action.payload.company_id,
          uploadedAt: action.payload.uploadedAt
        });
      })
      .addCase(uploadAttendanceFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadStatus = "failed";
      })

      // Fetch Upload Status
      .addCase(fetchUploadStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUploadStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const upload = state.uploads.find(u => u.id === id);
        if (upload) {
          upload.status = status;
        }
        if (state.uploadStatusId === id) {
          state.uploadStatus = status;
          if (status === 'completed' || status === 'failed') {
            // Keep in uploads for notification, but mark as complete
          }
        }
      })
      .addCase(fetchUploadStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch Punch In Today
      .addCase(fetchPunchInToday.fulfilled, (state, action) => {
        state.punchInToday = action.payload;
      })
      .addCase(fetchPunchInToday.rejected, (state) => {
        state.punchInToday = [];
      })

      // Fetch Punch In Yesterday
      .addCase(fetchPunchInYesterday.fulfilled, (state, action) => {
        state.punchInYesterday = action.payload;
      })
      .addCase(fetchPunchInYesterday.rejected, (state) => {
        state.punchInYesterday = [];
      })

      // Fetch Punch Out Today
      .addCase(fetchPunchOutToday.fulfilled, (state, action) => {
        state.punchOutToday = action.payload;
      })
      .addCase(fetchPunchOutToday.rejected, (state) => {
        state.punchOutToday = [];
      })

      // Fetch Late Comers
      .addCase(fetchLateComers.fulfilled, (state, action) => {
        state.lateComers = action.payload;
      })
      .addCase(fetchLateComers.rejected, (state) => {
        state.lateComers = [];
      })

      // Fetch Absentees
      .addCase(fetchAbsentees.fulfilled, (state, action) => {
        state.absentees = action.payload;
      })
      .addCase(fetchAbsentees.rejected, (state) => {
        state.absentees = [];
      });
  },
});

export const { 
  clearUploadStatus, 
  clearErrors, 
  addUpload, 
  updateUploadStatus, 
  removeUpload,
  clearCompletedUploads
} = attendanceSlice.actions;
export default attendanceSlice.reducer;
