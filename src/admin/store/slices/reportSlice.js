// store/slices/reportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ==================== Attendance Report ====================
// In reportSlice.js - Complete updated function

export const fetchAttendanceReport = createAsyncThunk(
  "attendance/fetchReport",
  async (params) => {
    // Build the params object with proper keys
    const apiParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      date_range: "custom",
      from_date: params.start_date,
      to_date: params.end_date,
    };

    // Only add optional params if they exist
    if (params.company && params.company !== "all") {
      apiParams.company = params.company;
    }
    if (params.search) {
      apiParams.search = params.search;
    }

    const response = await apiClient.get("/admin/reports/attendance", {
      params: apiParams,
    });

    // The API returns data in response.data.data.data
    const apiData = response.data?.data?.data || [];

    return {
      data: apiData.map((record) => ({
        ...record,
        employeeName: record.name,
        punchIn: record.punch_in,
        punchOut: record.punch_out,
        workedHours: record.worked_hours,
        attendance_status: record.status,
        // Keep original fields for compatibility
        id: record.employee_id,
        name: record.name,
        department: record.department,
        company: record.company,
        date: record.date,
        punch_in: record.punch_in,
        punch_out: record.punch_out,
        working_hours: record.worked_hours,
        status: record.status,
      })),
      total: response.data?.data?.meta?.total || 0,
      current_page: response.data?.data?.meta?.current_page || 1,
      per_page: response.data?.data?.meta?.per_page || 10,
      last_page: response.data?.data?.meta?.last_page || 1,
    };
  },
);

export const fetchAllAttendanceReport = createAsyncThunk(
  "attendance/fetchAllReport",
  async (params) => {
    // Build the params object
    const apiParams = {
      date_range: "custom",
      from_date: params.start_date,
      to_date: params.end_date,
      per_page: 1000, // Request a large page size to get all data
    };

    if (params.company && params.company !== "all") {
      apiParams.company = params.company;
    }
    if (params.search) {
      apiParams.search = params.search;
    }

    const response = await apiClient.get("/admin/reports/attendance", {
      params: apiParams,
    });

    // Get the first page with a large per_page
    const apiData = response.data?.data?.data || [];
    const total = response.data?.data?.meta?.total || 0;
    const perPage = response.data?.data?.meta?.per_page || 1000;

    // If total is greater than what we got, fetch remaining pages
    let allData = [...apiData];

    if (total > perPage) {
      const totalPages = Math.ceil(total / perPage);
      const promises = [];

      for (let page = 2; page <= totalPages; page++) {
        promises.push(
          apiClient.get("/admin/reports/attendance", {
            params: { ...apiParams, page },
          }),
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach((res) => {
        const pageData = res.data?.data?.data || [];
        allData = [...allData, ...pageData];
      });
    }

    return {
      data: allData.map((record) => ({
        ...record,
        employeeName: record.name,
        punchIn: record.punch_in,
        punchOut: record.punch_out,
        workedHours: record.worked_hours,
        attendance_status: record.status,
      })),
      total: allData.length,
    };
  },
);

// Add this thunk to your taskReportSlice
// ==================== Task Reports ====================
export const fetchTaskReports = createAsyncThunk(
  "taskReports/fetchReport",
  async (params) => {
    const apiParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      date_range: params.date_range || "custom",
    };

    // Add from_date and to_date only for custom range
    if (params.date_range === "custom") {
      if (params.from_date) apiParams.from_date = params.from_date;
      if (params.to_date) apiParams.to_date = params.to_date;
    }

    if (params.employee_id && params.employee_id !== "all") {
      apiParams.employee_id = params.employee_id;
    }
    if (params.search) {
      apiParams.search = params.search;
    }

    const response = await apiClient.get("/admin/reports/task-reports", {
      params: apiParams,
    });

    const apiData = response.data?.data?.data || [];

    return {
      data: apiData.map((record) => ({
        ...record,
        employee: record.employee_name,
        tasksCompleted: record.tasks_completed,
        pendingTasks: record.pending_tasks,
        planForTomorrow: record.plan_for_tomorrow,
      })),
      total: response.data?.data?.meta?.total || 0,
      current_page: response.data?.data?.meta?.current_page || 1,
      per_page: response.data?.data?.meta?.per_page || 10,
      last_page: response.data?.data?.meta?.last_page || 1,
    };
  },
);

export const fetchAllTaskReports = createAsyncThunk(
  "taskReports/fetchAllReport",
  async (params) => {
    const apiParams = {
      date_range: "custom",
      from_date: params.start_date,
      to_date: params.end_date,
      per_page: 1000,
    };

    if (params.employee_id && params.employee_id !== "all") {
      apiParams.employee_id = params.employee_id;
    }
    if (params.search) {
      apiParams.search = params.search;
    }

    const response = await apiClient.get("/admin/reports/task-reports", {
      params: apiParams,
    });

    const apiData = response.data?.data?.data || [];
    const total = response.data?.data?.meta?.total || 0;
    const perPage = response.data?.data?.meta?.per_page || 1000;

    let allData = [...apiData];

    if (total > perPage) {
      const totalPages = Math.ceil(total / perPage);
      const promises = [];

      for (let page = 2; page <= totalPages; page++) {
        promises.push(
          apiClient.get("/admin/reports/task-reports", {
            params: { ...apiParams, page },
          }),
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach((res) => {
        const pageData = res.data?.data?.data || [];
        allData = [...allData, ...pageData];
      });
    }

    return {
      data: allData.map((record) => ({
        ...record,
        employee: record.employee_name,
        tasksCompleted: record.tasks_completed,
        pendingTasks: record.pending_tasks,
        planForTomorrow: record.plan_for_tomorrow,
      })),
      total: allData.length,
    };
  },
);

// ==================== Leaves Report ====================
// ==================== Leaves Report ====================
export const fetchLeavesReport = createAsyncThunk(
  "reports/fetchLeaves",
  async (params, { rejectWithValue }) => {
    try {
      // Build params matching backend expectations
      const apiParams = {
        page: params.page || 1,
        per_page: params.per_page || 50,
        date_range: params.date_range || "this_month", // Backend default is "this_month"
      };

      // Add optional filters
      if (params.status && params.status !== "all") {
        apiParams.status = params.status;
      }
      if (params.leave_type && params.leave_type !== "all") {
        apiParams.leave_type = params.leave_type;
      }
      if (params.employee_id && params.employee_id !== "all") {
        apiParams.employee_id = params.employee_id;
      }
      if (params.department_id && params.department_id !== "all") {
        apiParams.department_id = params.department_id;
      }
      if (params.search) {
        apiParams.search = params.search;
      }

      // Handle custom date range
      if (params.date_range === "custom") {
        if (params.start_date) apiParams.start_date = params.start_date;
        if (params.end_date) apiParams.end_date = params.end_date;
      }

      const response = await apiClient.get("/admin/reports/leaves", {
        params: apiParams,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaves report",
      );
    }
  },
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
        error.response?.data?.message || "Failed to fetch employees report",
      );
    }
  },
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
        error.response?.data?.message ||
          "Failed to fetch employee details report",
      );
    }
  },
);

// ==================== Employee Nearest Expiry Report ====================
export const fetchEmployeeNearestExpiryReport = createAsyncThunk(
  "reports/fetchEmployeeNearestExpiry",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/reports/employee-nearest-expiry",
        {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            expiry_days: params.expiry_days || 30,
            company: params.company,
            department: params.department,
            search: params.search,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee nearest expiry report",
      );
    }
  },
);

// ==================== Employee Upcoming Renewals Report ====================
export const fetchEmployeeUpcomingRenewalsReport = createAsyncThunk(
  "reports/fetchEmployeeUpcomingRenewals",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/reports/employee-upcoming-renewals",
        {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            min_days: params.min_days || 31,
            max_days: params.max_days || 90,
            company: params.company,
            department: params.department,
            search: params.search,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch employee upcoming renewals report",
      );
    }
  },
);

// ==================== Company Nearest Expiry Report ====================
export const fetchCompanyNearestExpiryReport = createAsyncThunk(
  "reports/fetchCompanyNearestExpiry",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/reports/company-nearest-expiry",
        {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            expiry_days: params.expiry_days || 30,
            search: params.search,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch company nearest expiry report",
      );
    }
  },
);

// ==================== Company Upcoming Renewals Report ====================
export const fetchCompanyUpcomingRenewalsReport = createAsyncThunk(
  "reports/fetchCompanyUpcomingRenewals",
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/admin/reports/company-upcoming-renewals",
        {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            min_days: params.min_days || 31,
            max_days: params.max_days || 90,
            search: params.search,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch company upcoming renewals report",
      );
    }
  },
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
        error.response?.data?.message ||
          "Failed to fetch pending leaves report",
      );
    }
  },
);

// ==================== Update Leave Status (for pending leaves) ====================
export const updateLeaveStatusFromReport = createAsyncThunk(
  "reports/updateLeaveStatus",
  async (
    { id, status, processedBy, rejection_reason },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.post(
        `/admin/reports/leaves/${id}/update-status`,
        {
          status,
          processed_by: processedBy,
          rejection_reason,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave status",
      );
    }
  },
);

// ==================== Task Reports Export ====================
export const exportTaskReports = createAsyncThunk(
  "taskReports/export",
  async (params, { rejectWithValue }) => {
    try {
      // Map format for API - xlsx should be 'excel'
      const apiFormat = params.format === "xlsx" ? "excel" : params.format;

      const response = await apiClient.get(
        "/admin/reports/task-reports/export",
        {
          params: {
            ...params,
            format: apiFormat,
          },
          responseType: "blob", // Important for file download
        },
      );

      // Determine file extension and content type
      const ext = params.format === "xlsx" ? "xlsx" : params.format;
      const contentType =
        params.format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : params.format === "pdf"
            ? "application/pdf"
            : "text/csv";

      // Create a blob URL for the file
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      return { url, format: params.format };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export task reports",
      );
    }
  },
);

// ==================== Fetch All Leaves for Export ====================
export const fetchAllLeavesForExport = createAsyncThunk(
  "reports/fetchAllLeaves",
  async (params, { rejectWithValue }) => {
    try {
      // Build params for fetching all data
      const apiParams = {
        page: 1,
        per_page: 1000, // Get a large batch
        date_range: params.date_range || "this_month",
      };

      // Add custom date range params if selected
      if (params.date_range === "custom") {
        if (params.start_date) apiParams.start_date = params.start_date;
        if (params.end_date) apiParams.end_date = params.end_date;
      }

      // Add optional filters
      if (params.status && params.status !== "all") {
        apiParams.status = params.status;
      }
      if (params.leave_type && params.leave_type !== "all") {
        apiParams.leave_type = params.leave_type;
      }
      if (params.search) {
        apiParams.search = params.search;
      }

      const response = await apiClient.get("/admin/reports/leaves", {
        params: apiParams,
      });

      const allData = response.data?.data?.data || [];
      const total = response.data?.data?.total || 0;

      // If there are more records, fetch remaining pages
      let allLeaves = [...allData];
      const perPage = response.data?.data?.per_page || 1000;
      const totalPages = Math.ceil(total / perPage);

      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            apiClient.get("/admin/reports/leaves", {
              params: { ...apiParams, page },
            }),
          );
        }
        const responses = await Promise.all(promises);
        responses.forEach((res) => {
          const pageData = res.data?.data?.data || [];
          allLeaves = [...allLeaves, ...pageData];
        });
      }

      return {
        data: allLeaves,
        total: allLeaves.length,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch all leaves for export",
      );
    }
  },
);

// ==================== Export Report (Generic) ====================
export const exportReport = createAsyncThunk(
  "reports/export",
  async ({ reportType, params, format }, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Always include report_type and format
      queryParams.append("report_type", reportType);
      queryParams.append("format", format || "csv");
      
      // Add all other params as query parameters (skip 'format' if present)
      Object.keys(params || {}).forEach(key => {
        if (key !== 'format' && params[key] !== undefined && params[key] !== null && params[key] !== "") {
          queryParams.append(key, params[key]);
        }
      });

      const url = `/admin/reports/export?${queryParams.toString()}`;
      console.log("Exporting report with URL:", url);

      // Use POST request with responseType blob in config
      const response = await apiClient.post(url, null, {
        responseType: "blob",
        headers: {
          'Accept': format === 'pdf' ? 'application/pdf' : 'text/csv',
        }
      });

      // Determine content type and extension
      const contentType = format === "pdf" ? "application/pdf" : "text/csv";
      const extension = format === "pdf" ? "pdf" : "csv";

      // Check if response is actually a blob or if it's an error HTML
      if (response.data instanceof Blob) {
        // Check if it's a JSON error response disguised as blob
        const text = await response.data.text();
        if (text.startsWith('{') || text.startsWith('<!DOCTYPE')) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.message || parsed.error) {
              return rejectWithValue(parsed.message || parsed.error || "Export failed");
            }
          } catch {
            // Not JSON, continue
          }
        }
        
        // Create a new blob with the correct content type
        const blob = new Blob([response.data], { type: contentType });
        const urlBlob = window.URL.createObjectURL(blob);

        // Generate filename
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `${reportType}_report_${dateStr}.${extension}`;

        return { url: urlBlob, filename, blob };
      } else {
        // If response data is not a blob, it might be an error
        return rejectWithValue("Invalid response format");
      }
    } catch (error) {
      console.error("Export error:", error);
      
      let errorMessage = "Failed to export report";
      
      // Handle error response
      if (error.response) {
        // If it's a blob response, try to parse it as text
        if (error.response.data instanceof Blob) {
          try {
            const text = await new Response(error.response.data).text();
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.error || errorMessage;
          } catch {
            errorMessage = error.response.statusText || errorMessage;
          }
        } else if (error.response.data) {
          errorMessage = error.response.data.message || 
                         error.response.data.error || 
                         error.response.statusText || 
                         errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== Export Attendance Report ====================
export const exportAttendanceReport = createAsyncThunk(
  "reports/exportAttendance",
  async (params, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      queryParams.append("report_type", "attendance");
      queryParams.append("format", params.format || "csv");
      
      // Add all other params as query parameters
      const { format, ...restParams } = params;
      Object.keys(restParams).forEach(key => {
        if (restParams[key] !== undefined && restParams[key] !== null && restParams[key] !== "") {
          queryParams.append(key, restParams[key]);
        }
      });

      const url = `/admin/reports/export?${queryParams.toString()}`;
      console.log("Exporting attendance report with URL:", url);

      // POST request with query params
      const response = await apiClient.post(url, null, {
        responseType: "blob",
      });

      const contentType = params.format === "pdf" ? "application/pdf" : "text/csv";
      const extension = params.format === "pdf" ? "pdf" : "csv";

      const blob = new Blob([response.data], { type: contentType });
      const urlBlob = window.URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `attendance_report_${dateStr}.${extension}`;

      return { url: urlBlob, filename, blob };
    } catch (error) {
      console.error("Export attendance error:", error);
      
      let errorMessage = "Failed to export attendance report";
      if (error.response && error.response.data) {
        try {
          const text = await new Response(error.response.data).text();
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== Export Leaves Report ====================
export const exportLeavesReport = createAsyncThunk(
  "reports/exportLeaves",
  async (params, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      queryParams.append("report_type", "leaves");
      queryParams.append("format", params.format || "csv");
      
      // Add all other params as query parameters
      const { format, ...restParams } = params;
      Object.keys(restParams).forEach(key => {
        if (restParams[key] !== undefined && restParams[key] !== null && restParams[key] !== "") {
          queryParams.append(key, restParams[key]);
        }
      });

      const url = `/admin/reports/export?${queryParams.toString()}`;
      console.log("Exporting leaves report with URL:", url);

      // POST request with query params
      const response = await apiClient.post(url, null, {
        responseType: "blob",
      });

      const contentType = params.format === "pdf" ? "application/pdf" : "text/csv";
      const extension = params.format === "pdf" ? "pdf" : "csv";

      const blob = new Blob([response.data], { type: contentType });
      const urlBlob = window.URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `leaves_report_${dateStr}.${extension}`;

      return { url: urlBlob, filename, blob };
    } catch (error) {
      console.error("Export leaves error:", error);
      
      let errorMessage = "Failed to export leaves report";
      if (error.response && error.response.data) {
        try {
          const text = await new Response(error.response.data).text();
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== Export Tasks Report ====================
export const exportTasksReport = createAsyncThunk(
  "reports/exportTasks",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append("report_type", "tasks");
      queryParams.append("format", params.format || "csv");
      
      const { format, ...restParams } = params;
      Object.keys(restParams).forEach(key => {
        if (restParams[key] !== undefined && restParams[key] !== null && restParams[key] !== "") {
          queryParams.append(key, restParams[key]);
        }
      });

      const url = `/admin/reports/export?${queryParams.toString()}`;
      console.log("Exporting tasks report with URL:", url);

      // POST request with query params
      const response = await apiClient.post(url, null, {
        responseType: "blob",
      });

      const contentType = params.format === "pdf" ? "application/pdf" : "text/csv";
      const extension = params.format === "pdf" ? "pdf" : "csv";

      const blob = new Blob([response.data], { type: contentType });
      const urlBlob = window.URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `tasks_report_${dateStr}.${extension}`;

      return { url: urlBlob, filename, blob };
    } catch (error) {
      console.error("Export tasks error:", error);
      
      let errorMessage = "Failed to export tasks report";
      if (error.response && error.response.data) {
        try {
          const text = await new Response(error.response.data).text();
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== Export Employees Report ====================
export const exportEmployeesReport = createAsyncThunk(
  "reports/exportEmployees",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append("report_type", "employees");
      queryParams.append("format", params.format || "csv");
      
      const { format, ...restParams } = params;
      Object.keys(restParams).forEach(key => {
        if (restParams[key] !== undefined && restParams[key] !== null && restParams[key] !== "") {
          queryParams.append(key, restParams[key]);
        }
      });

      const url = `/admin/reports/export?${queryParams.toString()}`;
      console.log("Exporting employees report with URL:", url);

      // POST request with query params
      const response = await apiClient.post(url, null, {
        responseType: "blob",
      });

      const contentType = params.format === "pdf" ? "application/pdf" : "text/csv";
      const extension = params.format === "pdf" ? "pdf" : "csv";

      const blob = new Blob([response.data], { type: contentType });
      const urlBlob = window.URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `employees_report_${dateStr}.${extension}`;

      return { url: urlBlob, filename, blob };
    } catch (error) {
      console.error("Export employees error:", error);
      
      let errorMessage = "Failed to export employees report";
      if (error.response && error.response.data) {
        try {
          const text = await new Response(error.response.data).text();
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      }
      
      return rejectWithValue(errorMessage);
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

  // task reports
  taskReports: [],
  taskReportsLoading: false,
  taskReportsError: null,
  taskReportsTotalCount: 0,
  taskReportsCurrentPage: 1,
  taskReportsPerPage: 10,
  taskReportsLastPage: 1,

  // Leaves Report
  leaveRecords: [],
  leavesLoading: false,
  leavesError: null,
  leavesTotalCount: 0,
  leavesCurrentPage: 1,
  leavesPerPage: 10,
  leavesLastPage: 1,
  allLeaveRecords: [],

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

  exportLoading: false,
  exportError: null,
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
        // The payload structure is { data: [...], total, current_page, per_page, last_page }
        const payload = action.payload;
        state.attendanceRecords = payload.data || [];
        state.attendanceTotalCount = payload.total || 0;
        state.attendanceCurrentPage = payload.current_page || 1;
        state.attendancePerPage = payload.per_page || 10;
        state.attendanceLastPage = payload.last_page || 1;
      })
      .addCase(fetchAttendanceReport.rejected, (state, action) => {
        state.attendanceLoading = false;
        state.attendanceError = action.payload;
      })

      // ==================== Task Reports ====================
      .addCase(fetchTaskReports.pending, (state) => {
        state.taskReportsLoading = true;
        state.taskReportsError = null;
      })
      .addCase(fetchTaskReports.fulfilled, (state, action) => {
        state.taskReportsLoading = false;
        const payload = action.payload;
        state.taskReports = payload.data || [];
        state.taskReportsTotalCount = payload.total || 0;
        state.taskReportsCurrentPage = payload.current_page || 1;
        state.taskReportsPerPage = payload.per_page || 10;
        state.taskReportsLastPage = payload.last_page || 1;
      })
      .addCase(fetchTaskReports.rejected, (state, action) => {
        state.taskReportsLoading = false;
        state.taskReportsError = action.payload;
      })

      // ==================== Task Reports Export ====================
      .addCase(exportTaskReports.pending, (state) => {
        state.taskReportsLoading = true;
        state.taskReportsError = null;
      })
      .addCase(exportTaskReports.fulfilled, (state) => {
        state.taskReportsLoading = false;
      })
      .addCase(exportTaskReports.rejected, (state, action) => {
        state.taskReportsLoading = false;
        state.taskReportsError = action.payload;
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
        state.employeeNearestExpiryCurrentPage =
          responseData?.current_page || 1;
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
      .addCase(
        fetchEmployeeUpcomingRenewalsReport.fulfilled,
        (state, action) => {
          state.employeeUpcomingRenewalsLoading = false;
          const responseData = action.payload?.data || action.payload;
          state.employeeUpcomingRenewals =
            responseData?.data || responseData || [];
          state.employeeUpcomingRenewalsTotalCount = responseData?.total || 0;
          state.employeeUpcomingRenewalsCurrentPage =
            responseData?.current_page || 1;
          state.employeeUpcomingRenewalsPerPage = responseData?.per_page || 10;
          state.employeeUpcomingRenewalsLastPage = responseData?.last_page || 1;
        },
      )
      .addCase(
        fetchEmployeeUpcomingRenewalsReport.rejected,
        (state, action) => {
          state.employeeUpcomingRenewalsLoading = false;
          state.employeeUpcomingRenewalsError = action.payload;
        },
      )

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
      .addCase(
        fetchCompanyUpcomingRenewalsReport.fulfilled,
        (state, action) => {
          state.companyUpcomingRenewalsLoading = false;
          const responseData = action.payload?.data || action.payload;
          state.companyUpcomingRenewals =
            responseData?.data || responseData || [];
          state.companyUpcomingRenewalsTotalCount = responseData?.total || 0;
          state.companyUpcomingRenewalsCurrentPage =
            responseData?.current_page || 1;
          state.companyUpcomingRenewalsPerPage = responseData?.per_page || 10;
          state.companyUpcomingRenewalsLastPage = responseData?.last_page || 1;
        },
      )
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
          (leave) => leave.id !== updatedLeaveId,
        );
        state.pendingLeavesTotalCount = Math.max(
          0,
          state.pendingLeavesTotalCount - 1,
        );
      })
      // Add to extraReducers
      .addCase(fetchAllLeavesForExport.pending, (state) => {
        state.leavesLoading = true;
        state.leavesError = null;
      })
      .addCase(fetchAllLeavesForExport.fulfilled, (state, action) => {
        state.leavesLoading = false;
        // Store all leaves for export in a separate state or use existing
        state.allLeaveRecords = action.payload.data || [];
      })
      .addCase(fetchAllLeavesForExport.rejected, (state, action) => {
        state.leavesLoading = false;
        state.leavesError = action.payload;
      })
      // ==================== Export Report ====================
      .addCase(exportReport.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      })

      // ==================== Export Attendance Report ====================
      .addCase(exportAttendanceReport.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportAttendanceReport.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportAttendanceReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      })

      // ==================== Export Leaves Report ====================
      .addCase(exportLeavesReport.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportLeavesReport.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportLeavesReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      })

      // ==================== Export Tasks Report ====================
      .addCase(exportTasksReport.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportTasksReport.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportTasksReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      })

      // ==================== Export Employees Report ====================
      .addCase(exportEmployeesReport.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportEmployeesReport.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportEmployeesReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
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
export const selectAttendanceRecords = (state) =>
  state.reports.attendanceRecords;
export const selectAttendanceLoading = (state) =>
  state.reports.attendanceLoading;
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
export const selectEmployeeDetailsLoading = (state) =>
  state.reports.employeeDetailsLoading;
export const selectEmployeeDetailsError = (state) =>
  state.reports.employeeDetailsError;
export const selectEmployeeDetailsPagination = (state) => ({
  total: state.reports.employeeDetailsTotalCount,
  currentPage: state.reports.employeeDetailsCurrentPage,
  perPage: state.reports.employeeDetailsPerPage,
  lastPage: state.reports.employeeDetailsLastPage,
});

// Employee Nearest Expiry Selectors
export const selectEmployeeNearestExpiry = (state) =>
  state.reports.employeeNearestExpiry;
export const selectEmployeeNearestExpiryLoading = (state) =>
  state.reports.employeeNearestExpiryLoading;
export const selectEmployeeNearestExpiryError = (state) =>
  state.reports.employeeNearestExpiryError;
export const selectEmployeeNearestExpiryPagination = (state) => ({
  total: state.reports.employeeNearestExpiryTotalCount,
  currentPage: state.reports.employeeNearestExpiryCurrentPage,
  perPage: state.reports.employeeNearestExpiryPerPage,
  lastPage: state.reports.employeeNearestExpiryLastPage,
});

// Employee Upcoming Renewals Selectors
export const selectEmployeeUpcomingRenewals = (state) =>
  state.reports.employeeUpcomingRenewals;
export const selectEmployeeUpcomingRenewalsLoading = (state) =>
  state.reports.employeeUpcomingRenewalsLoading;
export const selectEmployeeUpcomingRenewalsError = (state) =>
  state.reports.employeeUpcomingRenewalsError;
export const selectEmployeeUpcomingRenewalsPagination = (state) => ({
  total: state.reports.employeeUpcomingRenewalsTotalCount,
  currentPage: state.reports.employeeUpcomingRenewalsCurrentPage,
  perPage: state.reports.employeeUpcomingRenewalsPerPage,
  lastPage: state.reports.employeeUpcomingRenewalsLastPage,
});

// Company Nearest Expiry Selectors
export const selectCompanyNearestExpiry = (state) =>
  state.reports.companyNearestExpiry;
export const selectCompanyNearestExpiryLoading = (state) =>
  state.reports.companyNearestExpiryLoading;
export const selectCompanyNearestExpiryError = (state) =>
  state.reports.companyNearestExpiryError;
export const selectCompanyNearestExpiryPagination = (state) => ({
  total: state.reports.companyNearestExpiryTotalCount,
  currentPage: state.reports.companyNearestExpiryCurrentPage,
  perPage: state.reports.companyNearestExpiryPerPage,
  lastPage: state.reports.companyNearestExpiryLastPage,
});

// Company Upcoming Renewals Selectors
export const selectCompanyUpcomingRenewals = (state) =>
  state.reports.companyUpcomingRenewals;
export const selectCompanyUpcomingRenewalsLoading = (state) =>
  state.reports.companyUpcomingRenewalsLoading;
export const selectCompanyUpcomingRenewalsError = (state) =>
  state.reports.companyUpcomingRenewalsError;
export const selectCompanyUpcomingRenewalsPagination = (state) => ({
  total: state.reports.companyUpcomingRenewalsTotalCount,
  currentPage: state.reports.companyUpcomingRenewalsCurrentPage,
  perPage: state.reports.companyUpcomingRenewalsPerPage,
  lastPage: state.reports.companyUpcomingRenewalsLastPage,
});

// Pending Leaves Selectors
export const selectPendingLeaves = (state) => state.reports.pendingLeaves;
export const selectPendingLeavesLoading = (state) =>
  state.reports.pendingLeavesLoading;
export const selectPendingLeavesError = (state) =>
  state.reports.pendingLeavesError;
export const selectPendingLeavesPagination = (state) => ({
  total: state.reports.pendingLeavesTotalCount,
  currentPage: state.reports.pendingLeavesCurrentPage,
  perPage: state.reports.pendingLeavesPerPage,
  lastPage: state.reports.pendingLeavesLastPage,
});

export default reportSlice.reducer;
