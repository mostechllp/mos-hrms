// tasksSlice.js - Fixed to handle the correct response structure

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/tasks", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

// Fetch tasks by project - FIXED to handle the correct response structure
export const fetchTasksByProject = createAsyncThunk(
  "tasks/fetchByProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/projects/${projectId}/tasks`);
      console.log("Tasks by project response:", response.data);
      
      // The response structure is:
      // { status: "success", message: "Success", data: { project_id, total, tasks: [...] } }
      const responseData = response.data;
      
      if (responseData?.status === "success" && responseData?.data) {
        // Extract tasks from data.tasks
        const tasks = responseData.data.tasks || [];
        const total = responseData.data.total || tasks.length;
        const projectId = responseData.data.project_id;
        
        return {
          status: "success",
          data: {
            tasks: tasks,
            total: total,
            project_id: projectId,
            stats: {
              total: total,
              completed: tasks.filter(t => {
                const status = t.status || t.task_status || t.assigned_to?.[0]?.pivot?.status || "";
                return String(status).toLowerCase() === "completed" || String(status).toLowerCase() === "done";
              }).length,
              in_progress: tasks.filter(t => {
                const status = t.status || t.task_status || t.assigned_to?.[0]?.pivot?.status || "";
                return String(status).toLowerCase() === "in_progress" || String(status).toLowerCase() === "progress";
              }).length,
              pending: tasks.filter(t => {
                const status = t.status || t.task_status || t.assigned_to?.[0]?.pivot?.status || "";
                return String(status).toLowerCase() === "pending" || String(status).toLowerCase() === "assigned";
              }).length,
            }
          }
        };
      }
      
      // Fallback: try to extract tasks from different response formats
      let tasks = [];
      if (Array.isArray(responseData)) {
        tasks = responseData;
      } else if (responseData?.data) {
        tasks = Array.isArray(responseData.data) ? responseData.data : responseData.data.tasks || [];
      } else if (responseData?.tasks) {
        tasks = responseData.tasks;
      }
      
      return {
        status: "success",
        data: {
          tasks: tasks,
          total: tasks.length,
          project_id: parseInt(projectId),
          stats: {
            total: tasks.length,
            completed: tasks.filter(t => {
              const status = t.status || t.task_status || "";
              return String(status).toLowerCase() === "completed" || String(status).toLowerCase() === "done";
            }).length,
            in_progress: tasks.filter(t => {
              const status = t.status || t.task_status || "";
              return String(status).toLowerCase() === "in_progress" || String(status).toLowerCase() === "progress";
            }).length,
            pending: tasks.filter(t => {
              const status = t.status || t.task_status || "";
              return String(status).toLowerCase() === "pending" || String(status).toLowerCase() === "assigned";
            }).length,
          }
        }
      };
    } catch (error) {
      console.error("Failed to fetch project tasks:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch project tasks");
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/tasks", taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create task");
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task");
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete task");
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/admin/tasks/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task status");
    }
  }
);

const initialState = {
  tasks: [],
  projectTasks: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  lastPage: 1,
  perPage: 15,
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  },
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPagination: (state, action) => {
      state.currentPage = action.payload.currentPage;
      state.perPage = action.payload.perPage;
    },
    clearProjectTasks: (state) => {
      state.projectTasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data?.data || action.payload.data || [];
        state.totalCount = action.payload.data?.total || state.tasks.length;
        state.currentPage = action.payload.data?.current_page || 1;
        state.lastPage = action.payload.data?.last_page || 1;
        if (action.payload.data?.stats) {
          state.stats = action.payload.data.stats;
        } else if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        // Extract tasks from the response
        const responseData = action.payload?.data || action.payload || {};
        const tasks = responseData.tasks || responseData || [];
        
        // Ensure we only store tasks for this project
        state.projectTasks = Array.isArray(tasks) ? tasks : [];
        
        // Update stats if available
        if (responseData.stats) {
          state.stats = {
            ...state.stats,
            total: responseData.stats.total || state.projectTasks.length,
            pending: responseData.stats.pending || 0,
            inProgress: responseData.stats.in_progress || 0,
            completed: responseData.stats.completed || 0,
          };
        }
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const newTask = action.payload.data || action.payload;
        state.tasks.unshift(newTask);
        state.totalCount++;
        // Update stats
        if (newTask.status === "pending") state.stats.pending++;
        state.stats.total++;
        
        // If the new task belongs to the current project, add it to projectTasks
        if (state.projectTasks.length > 0) {
          const projectId = state.projectTasks[0]?.project_id;
          if (newTask.project_id === projectId) {
            state.projectTasks.unshift(newTask);
          }
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload.data || action.payload;
        const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          // Update stats for status change
          const oldStatus = state.tasks[index].status;
          if (oldStatus !== updatedTask.status) {
            if (oldStatus === "pending") state.stats.pending--;
            if (oldStatus === "in_progress") state.stats.inProgress--;
            if (oldStatus === "completed") state.stats.completed--;
            if (oldStatus === "overdue") state.stats.overdue--;
            
            if (updatedTask.status === "pending") state.stats.pending++;
            if (updatedTask.status === "in_progress") state.stats.inProgress++;
            if (updatedTask.status === "completed") state.stats.completed++;
            if (updatedTask.status === "overdue") state.stats.overdue++;
          }
          state.tasks[index] = updatedTask;
        }
        const projectIndex = state.projectTasks.findIndex((t) => t.id === updatedTask.id);
        if (projectIndex !== -1) {
          state.projectTasks[projectIndex] = updatedTask;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const deletedTask = state.tasks.find((t) => t.id === action.payload);
        if (deletedTask) {
          // Update stats
          if (deletedTask.status === "pending") state.stats.pending--;
          if (deletedTask.status === "in_progress") state.stats.inProgress--;
          if (deletedTask.status === "completed") state.stats.completed--;
          if (deletedTask.status === "overdue") state.stats.overdue--;
          state.stats.total--;
        }
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        state.projectTasks = state.projectTasks.filter((t) => t.id !== action.payload);
        state.totalCount--;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload.data || action.payload;
        const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          // Update stats
          const oldStatus = state.tasks[index].status;
          if (oldStatus !== updatedTask.status) {
            if (oldStatus === "pending") state.stats.pending--;
            if (oldStatus === "in_progress") state.stats.inProgress--;
            if (oldStatus === "completed") state.stats.completed--;
            if (oldStatus === "overdue") state.stats.overdue--;
            
            if (updatedTask.status === "pending") state.stats.pending++;
            if (updatedTask.status === "in_progress") state.stats.inProgress++;
            if (updatedTask.status === "completed") state.stats.completed++;
            if (updatedTask.status === "overdue") state.stats.overdue++;
          }
          state.tasks[index] = { ...state.tasks[index], status: updatedTask.status };
        }
        const projectIndex = state.projectTasks.findIndex((t) => t.id === updatedTask.id);
        if (projectIndex !== -1) {
          state.projectTasks[projectIndex] = { ...state.projectTasks[projectIndex], status: updatedTask.status };
        }
      });
  },
});

export const { clearError, setPagination, clearProjectTasks } = taskSlice.actions;
export default taskSlice.reducer;