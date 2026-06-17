import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Dummy data for testing
const generateDummyTasks = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return {
    status: "success",
    data: {
      data: [
        {
          id: 1,
          name: "Complete Dashboard UI Implementation",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: today.toISOString().split("T")[0],
          due_date: tomorrow.toISOString().split("T")[0],
          priority: "high",
          status: "pending",
          remarks: "Need to complete the dashboard with all charts and statistics. Make sure to include dark mode support and responsive design.",
          client_name: "Tech Corp",
          website_url: "https://techcorp.com/dashboard-project",
          created_at: today.toISOString(),
          updated_at: today.toISOString(),
        },
        {
          id: 2,
          name: "Fix Login Authentication Bug",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: yesterday.toISOString().split("T")[0],
          due_date: today.toISOString().split("T")[0],
          priority: "high",
          status: "in_progress",
          remarks: "Users are unable to login after password reset. Need to investigate the token generation issue.",
          client_name: "Internal",
          website_url: null,
          created_at: yesterday.toISOString(),
          updated_at: today.toISOString(),
        },
        {
          id: 3,
          name: "Create API Documentation",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: lastWeek.toISOString().split("T")[0],
          due_date: nextWeek.toISOString().split("T")[0],
          priority: "medium",
          status: "pending",
          remarks: "Document all API endpoints with request/response examples and authentication requirements.",
          client_name: "API Team",
          website_url: "https://api-docs.example.com",
          created_at: lastWeek.toISOString(),
          updated_at: lastWeek.toISOString(),
        },
        {
          id: 4,
          name: "Optimize Database Queries",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: yesterday.toISOString().split("T")[0],
          due_date: nextWeek.toISOString().split("T")[0],
          priority: "medium",
          status: "in_progress",
          remarks: "Slow loading times on reports page. Need to optimize queries and add indexes.",
          client_name: "Internal",
          website_url: null,
          created_at: yesterday.toISOString(),
          updated_at: yesterday.toISOString(),
        },
        {
          id: 5,
          name: "Design Email Templates",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: lastWeek.toISOString().split("T")[0],
          due_date: yesterday.toISOString().split("T")[0],
          priority: "low",
          status: "completed",
          remarks: "Create responsive email templates for notifications, password reset, and weekly reports.",
          client_name: "Marketing Dept",
          website_url: null,
          created_at: lastWeek.toISOString(),
          updated_at: yesterday.toISOString(),
        },
        {
          id: 6,
          name: "Implement Real-time Notifications",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: today.toISOString().split("T")[0],
          due_date: nextWeek.toISOString().split("T")[0],
          priority: "high",
          status: "pending",
          remarks: "Add WebSocket support for real-time notifications for attendance and task updates.",
          client_name: "Tech Corp",
          website_url: "https://techcorp.com/notifications",
          created_at: today.toISOString(),
          updated_at: today.toISOString(),
        },
        {
          id: 7,
          name: "Fix Mobile Responsiveness Issues",
          assigned_to_id: 5,
          assigned_to: {
            id: 5,
            name: "John Doe",
            employee_id: "EMP001",
            avatar: null,
          },
          assigned_by_id: 1,
          assigned_by: {
            id: 1,
            name: "Admin User",
          },
          assigned_date: lastWeek.toISOString().split("T")[0],
          due_date: lastWeek.toISOString().split("T")[0],
          priority: "medium",
          status: "overdue",
          remarks: "Tables and modals are not displaying correctly on mobile devices. Need to fix layout issues.",
          client_name: "Internal",
          website_url: null,
          created_at: lastWeek.toISOString(),
          updated_at: lastWeek.toISOString(),
        },
      ],
      total: 7,
      current_page: 1,
      last_page: 1,
      per_page: 10,
      stats: {
        total: 7,
        pending: 3,
        in_progress: 2,
        completed: 1,
        overdue: 1,
      },
    },
  };
};

// Fetch employee tasks
export const fetchMyTasks = createAsyncThunk(
  "employeeTasks/fetchMyTasks",
  async (params = {}, { rejectWithValue, getState }) => {
    // For development: use dummy data
    const USE_DUMMY_DATA = true; // Set to false when backend is ready
    
    if (USE_DUMMY_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateDummyTasks();
    }
    
    try {
      const response = await apiClient.get("/employee/tasks", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  "employeeTasks/updateStatus",
  async ({ id, status }, { rejectWithValue, getState }) => {
    const USE_DUMMY_DATA = true;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current tasks from state
      const state = getState();
      const tasks = state.employeeTasks?.tasks || [];
      const task = tasks.find(t => t.id === id);
      
      if (task) {
        const oldStatus = task.status;
        const updatedTask = { ...task, status, updated_at: new Date().toISOString() };
        
        return {
          status: "success",
          data: updatedTask,
          oldStatus: oldStatus,
        };
      }
      return rejectWithValue("Task not found");
    }
    
    try {
      const response = await apiClient.post(`/employee/tasks/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task status");
    }
  }
);

// Get task details
export const getTaskDetails = createAsyncThunk(
  "employeeTasks/getTaskDetails",
  async (id, { rejectWithValue, getState }) => {
    const USE_DUMMY_DATA = true;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const state = getState();
      const tasks = state.employeeTasks?.tasks || [];
      const task = tasks.find(t => t.id === id);
      
      if (task) {
        return {
          status: "success",
          data: task,
        };
      }
      return rejectWithValue("Task not found");
    }
    
    try {
      const response = await apiClient.get(`/employee/tasks/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch task details");
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  },
  pagination: {
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  },
};

const tasksSlice = createSlice({
  name: "employeeTasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.tasks = data?.data || data || [];
        state.stats = data?.stats || state.stats;
        state.pagination = {
          currentPage: data?.current_page || 1,
          perPage: data?.per_page || 10,
          total: data?.total || state.tasks.length,
          lastPage: data?.last_page || 1,
        };
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        // Don't set global loading to true for status updates
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload?.data || action.payload;
        const oldStatus = action.payload?.oldStatus || updatedTask.oldStatus;
        
        // Update task in the tasks array
        const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        
        // Update stats based on status change
        if (oldStatus && oldStatus !== updatedTask.status) {
          // Decrement old status count
          if (oldStatus === "pending") state.stats.pending = Math.max(0, (state.stats.pending || 0) - 1);
          if (oldStatus === "in_progress") state.stats.in_progress = Math.max(0, (state.stats.in_progress || 0) - 1);
          if (oldStatus === "completed") state.stats.completed = Math.max(0, (state.stats.completed || 0) - 1);
          if (oldStatus === "overdue") state.stats.overdue = Math.max(0, (state.stats.overdue || 0) - 1);
          
          // Increment new status count
          if (updatedTask.status === "pending") state.stats.pending = (state.stats.pending || 0) + 1;
          if (updatedTask.status === "in_progress") state.stats.in_progress = (state.stats.in_progress || 0) + 1;
          if (updatedTask.status === "completed") state.stats.completed = (state.stats.completed || 0) + 1;
          if (updatedTask.status === "overdue") state.stats.overdue = (state.stats.overdue || 0) + 1;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Get Task Details
      .addCase(getTaskDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTaskDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload?.data || action.payload;
      })
      .addCase(getTaskDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTask, setPagination } = tasksSlice.actions;
export default tasksSlice.reducer;


// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import apiClient from "../../../utils/apiClient";

// // Fetch employee tasks
// export const fetchMyTasks = createAsyncThunk(
//   "employeeTasks/fetchMyTasks",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get("/employee/tasks", { params });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
//     }
//   }
// );

// // Update task status
// export const updateTaskStatus = createAsyncThunk(
//   "employeeTasks/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.post(`/employee/tasks/${id}/status`, { status });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update task status");
//     }
//   }
// );

// // Get task details
// export const getTaskDetails = createAsyncThunk(
//   "employeeTasks/getTaskDetails",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get(`/employee/tasks/${id}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch task details");
//     }
//   }
// );

// const initialState = {
//   tasks: [],
//   currentTask: null,
//   loading: false,
//   error: null,
//   stats: {
//     total: 0,
//     pending: 0,
//     in_progress: 0,
//     completed: 0,
//     overdue: 0,
//   },
//   pagination: {
//     currentPage: 1,
//     perPage: 10,
//     total: 0,
//     lastPage: 1,
//   },
// };

// const tasksSlice = createSlice({
//   name: "employeeTasks",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     clearCurrentTask: (state) => {
//       state.currentTask = null;
//     },
//     setPagination: (state, action) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Tasks
//       .addCase(fetchMyTasks.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchMyTasks.fulfilled, (state, action) => {
//         state.loading = false;
//         const data = action.payload?.data || action.payload;
//         state.tasks = data?.data || data || [];
//         state.stats = data?.stats || state.stats;
//         state.pagination = {
//           currentPage: data?.current_page || 1,
//           perPage: data?.per_page || 10,
//           total: data?.total || state.tasks.length,
//           lastPage: data?.last_page || 1,
//         };
//       })
//       .addCase(fetchMyTasks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Update Task Status
//       .addCase(updateTaskStatus.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(updateTaskStatus.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedTask = action.payload?.data || action.payload;
//         const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
//         if (index !== -1) {
//           state.tasks[index] = updatedTask;
//         }
//         // Update stats
//         if (updatedTask.status === "completed") {
//           state.stats.completed = (state.stats.completed || 0) + 1;
//           if (updatedTask.oldStatus === "pending") state.stats.pending = Math.max(0, (state.stats.pending || 0) - 1);
//           if (updatedTask.oldStatus === "in_progress") state.stats.in_progress = Math.max(0, (state.stats.in_progress || 0) - 1);
//         }
//       })
//       .addCase(updateTaskStatus.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Get Task Details
//       .addCase(getTaskDetails.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getTaskDetails.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentTask = action.payload?.data || action.payload;
//       })
//       .addCase(getTaskDetails.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearError, clearCurrentTask, setPagination } = tasksSlice.actions;
// export default tasksSlice.reducer;