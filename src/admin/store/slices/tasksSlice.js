import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Dummy employees for reference
const dummyEmployees = [
  { id: 1, name: "John Doe", employee_id: "EMP001", email: "john@example.com" },
  { id: 2, name: "Jane Smith", employee_id: "EMP002", email: "jane@example.com" },
  { id: 3, name: "Mike Johnson", employee_id: "EMP003", email: "mike@example.com" },
  { id: 4, name: "Sarah Williams", employee_id: "EMP004", email: "sarah@example.com" },
  { id: 5, name: "David Brown", employee_id: "EMP005", email: "david@example.com" },
  { id: 6, name: "Lisa Davis", employee_id: "EMP006", email: "lisa@example.com" },
];

// Dummy projects for reference
const dummyProjects = [
  { id: 1, name: "E-Commerce Platform", client_name: "TechSolutions Inc." },
  { id: 2, name: "Mobile App Development", client_name: "HealthCare Plus" },
  { id: 3, name: "CRM System Upgrade", client_name: "SalesForce Partners" },
  { id: 4, name: "Website Redesign", client_name: "Creative Agency" },
  { id: 5, name: "Cloud Migration", client_name: "DataStorage Corp" },
];

// Generate dummy tasks
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

  const tasks = [
    {
      id: 1,
      name: "Design Database Schema",
      project_id: 1,
      project: dummyProjects[0],
      assigned_to_ids: [1, 2],
      assigned_to: [dummyEmployees[0], dummyEmployees[1]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: tomorrow.toISOString().split("T")[0],
      priority: "high",
      status: "in_progress",
      description: "Design the complete database schema including users, products, orders, and payments tables.",
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
    },
    {
      id: 2,
      name: "Create API Endpoints",
      project_id: 1,
      project: dummyProjects[0],
      assigned_to_ids: [2, 3],
      assigned_to: [dummyEmployees[1], dummyEmployees[2]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: nextWeek.toISOString().split("T")[0],
      priority: "high",
      status: "pending",
      description: "Develop RESTful APIs for product management, user authentication, and order processing.",
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
    },
    {
      id: 3,
      name: "Frontend Dashboard UI",
      project_id: 1,
      project: dummyProjects[0],
      assigned_to_ids: [4, 5],
      assigned_to: [dummyEmployees[3], dummyEmployees[4]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: yesterday.toISOString().split("T")[0],
      due_date: nextWeek.toISOString().split("T")[0],
      priority: "medium",
      status: "pending",
      description: "Create responsive admin dashboard with charts, tables, and user management interface.",
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString(),
    },
    {
      id: 4,
      name: "User Authentication Module",
      project_id: 2,
      project: dummyProjects[1],
      assigned_to_ids: [1, 6],
      assigned_to: [dummyEmployees[0], dummyEmployees[5]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: yesterday.toISOString().split("T")[0],
      priority: "high",
      status: "completed",
      description: "Implement JWT authentication, login/register, password reset, and social login integration.",
      created_at: lastWeek.toISOString(),
      updated_at: yesterday.toISOString(),
    },
    {
      id: 5,
      name: "Push Notifications Setup",
      project_id: 2,
      project: dummyProjects[1],
      assigned_to_ids: [2, 4],
      assigned_to: [dummyEmployees[1], dummyEmployees[3]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: yesterday.toISOString().split("T")[0],
      due_date: tomorrow.toISOString().split("T")[0],
      priority: "medium",
      status: "in_progress",
      description: "Configure Firebase push notifications for appointment reminders and alerts.",
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString(),
    },
    {
      id: 6,
      name: "Payment Gateway Integration",
      project_id: 1,
      project: dummyProjects[0],
      assigned_to_ids: [3, 5],
      assigned_to: [dummyEmployees[2], dummyEmployees[4]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: nextWeek.toISOString().split("T")[0],
      priority: "high",
      status: "pending",
      description: "Integrate Stripe/PayPal payment gateway for online transactions.",
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
    },
    {
      id: 7,
      name: "Performance Optimization",
      project_id: 3,
      project: dummyProjects[2],
      assigned_to_ids: [1, 2, 3],
      assigned_to: [dummyEmployees[0], dummyEmployees[1], dummyEmployees[2]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: today.toISOString().split("T")[0],
      priority: "high",
      status: "overdue",
      description: "Optimize database queries, implement caching, and improve load times.",
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
    },
    {
      id: 8,
      name: "Security Audit",
      project_id: 3,
      project: dummyProjects[2],
      assigned_to_ids: [4, 5, 6],
      assigned_to: [dummyEmployees[3], dummyEmployees[4], dummyEmployees[5]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: nextWeek.toISOString().split("T")[0],
      priority: "high",
      status: "pending",
      description: "Conduct security audit, penetration testing, and fix vulnerabilities.",
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
    },
    {
      id: 9,
      name: "Documentation",
      project_id: 4,
      project: dummyProjects[3],
      assigned_to_ids: [1, 6],
      assigned_to: [dummyEmployees[0], dummyEmployees[5]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: yesterday.toISOString().split("T")[0],
      due_date: nextWeek.toISOString().split("T")[0],
      priority: "low",
      status: "pending",
      description: "Create API documentation, user guides, and technical specifications.",
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString(),
    },
    {
      id: 10,
      name: "Deployment Setup",
      project_id: 5,
      project: dummyProjects[4],
      assigned_to_ids: [2, 3, 4],
      assigned_to: [dummyEmployees[1], dummyEmployees[2], dummyEmployees[3]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: lastWeek.toISOString().split("T")[0],
      due_date: yesterday.toISOString().split("T")[0],
      priority: "medium",
      status: "completed",
      description: "Set up CI/CD pipeline, configure servers, and automate deployment process.",
      created_at: lastWeek.toISOString(),
      updated_at: yesterday.toISOString(),
    },
    {
      id: 11,
      name: "Testing & QA",
      project_id: 2,
      project: dummyProjects[1],
      assigned_to_ids: [5, 6],
      assigned_to: [dummyEmployees[4], dummyEmployees[5]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: yesterday.toISOString().split("T")[0],
      due_date: tomorrow.toISOString().split("T")[0],
      priority: "high",
      status: "in_progress",
      description: "Write unit tests, integration tests, and perform QA testing.",
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString(),
    },
    {
      id: 12,
      name: "Analytics Dashboard",
      project_id: 1,
      project: dummyProjects[0],
      assigned_to_ids: [1, 3, 5],
      assigned_to: [dummyEmployees[0], dummyEmployees[2], dummyEmployees[4]],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: today.toISOString().split("T")[0],
      due_date: nextWeek.toISOString().split("T")[0],
      priority: "medium",
      status: "pending",
      description: "Create analytics dashboard with real-time metrics and reports.",
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
    },
  ];

  // Calculate stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => t.status === "overdue").length,
  };

  return {
    status: "success",
    data: {
      data: tasks,
      total: tasks.length,
      current_page: 1,
      last_page: 1,
      per_page: 15,
      stats: stats,
    },
  };
};

// Generate tasks for a specific project
const generateProjectTasks = (projectId) => {
  const allTasks = generateDummyTasks().data.data;
  const projectTasks = allTasks.filter(task => task.project_id === parseInt(projectId));
  
  const stats = {
    total: projectTasks.length,
    pending: projectTasks.filter(t => t.status === "pending").length,
    inProgress: projectTasks.filter(t => t.status === "in_progress").length,
    completed: projectTasks.filter(t => t.status === "completed").length,
    overdue: projectTasks.filter(t => t.status === "overdue").length,
  };

  return {
    status: "success",
    data: projectTasks,
    stats: stats,
  };
};

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    // For development: use dummy data
    const USE_DUMMY_DATA = false; // Set to false when backend is ready
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const dummyData = generateDummyTasks();
      
      // Apply filters if needed
      let filteredTasks = [...dummyData.data.data];
      
      if (params.project_id && params.project_id !== "all") {
        filteredTasks = filteredTasks.filter(t => t.project_id === parseInt(params.project_id));
      }
      
      if (params.status && params.status !== "all") {
        filteredTasks = filteredTasks.filter(t => t.status === params.status);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredTasks = filteredTasks.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.project?.name.toLowerCase().includes(searchLower) ||
          t.project?.client_name.toLowerCase().includes(searchLower)
        );
      }
      
      // Update stats based on filtered tasks
      const stats = {
        total: filteredTasks.length,
        pending: filteredTasks.filter(t => t.status === "pending").length,
        inProgress: filteredTasks.filter(t => t.status === "in_progress").length,
        completed: filteredTasks.filter(t => t.status === "completed").length,
        overdue: filteredTasks.filter(t => t.status === "overdue").length,
      };
      
      return {
        status: "success",
        data: {
          data: filteredTasks,
          total: filteredTasks.length,
          current_page: params.page || 1,
          last_page: Math.ceil(filteredTasks.length / (params.per_page || 15)),
          per_page: params.per_page || 15,
          stats: stats,
        },
      };
    }
    
    try {
      const response = await apiClient.get("/admin/tasks", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

// Fetch tasks by project
export const fetchTasksByProject = createAsyncThunk(
  "tasks/fetchByProject",
  async (projectId, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateProjectTasks(projectId);
    }
    
    try {
      const response = await apiClient.get("/admin/tasks", { 
        params: { project_id: projectId } 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch project tasks");
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const newTask = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...taskData,
        project: dummyProjects.find(p => p.id === parseInt(taskData.project_id)),
        assigned_to: taskData.assigned_to_ids.map(id => dummyEmployees.find(e => e.id === parseInt(id))),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { status: "success", data: newTask };
    }
    
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
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { 
        status: "success", 
        data: { 
          id, 
          ...data, 
          updated_at: new Date().toISOString(),
          project: dummyProjects.find(p => p.id === parseInt(data.project_id)),
          assigned_to: data.assigned_to_ids?.map(id => dummyEmployees.find(e => e.id === parseInt(id))) || []
        } 
      };
    }
    
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
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    }
    
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
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { 
        status: "success", 
        data: { 
          id, 
          status, 
          updated_at: new Date().toISOString() 
        } 
      };
    }
    
    try {
      const response = await apiClient.post(`/admin/tasks/${id}/status`, { status });
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
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projectTasks = action.payload.data?.data || action.payload.data || action.payload || [];
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

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiClient from "../../../utils/apiClient";

// // Fetch all tasks
// export const fetchTasks = createAsyncThunk(
//   "tasks/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get("/admin/tasks", { params });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
//     }
//   }
// );

// // Fetch tasks by project
// export const fetchTasksByProject = createAsyncThunk(
//   "tasks/fetchByProject",
//   async (projectId, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get(`/admin/projects/${projectId}/tasks`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch project tasks");
//     }
//   }
// );

// // Create a new task
// export const createTask = createAsyncThunk(
//   "tasks/create",
//   async (taskData, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.post("/admin/tasks", taskData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create task");
//     }
//   }
// );

// // Update task
// export const updateTask = createAsyncThunk(
//   "tasks/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.put(`/admin/tasks/${id}`, data);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update task");
//     }
//   }
// );

// // Delete task
// export const deleteTask = createAsyncThunk(
//   "tasks/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await apiClient.delete(`/admin/tasks/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete task");
//     }
//   }
// );

// // Update task status
// export const updateTaskStatus = createAsyncThunk(
//   "tasks/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.post(`/admin/tasks/${id}/status`, { status });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update task status");
//     }
//   }
// );



// const initialState = {
//   tasks: [],
//   projectTasks: [],
//   loading: false,
//   error: null,
//   totalCount: 0,
//   currentPage: 1,
//   lastPage: 1,
//   perPage: 15,
//   stats: {
//     total: 0,
//     pending: 0,
//     inProgress: 0,
//     completed: 0,
//     overdue: 0,
//   },
// };

// const taskSlice = createSlice({
//   name: "tasks",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     setPagination: (state, action) => {
//       state.currentPage = action.payload.currentPage;
//       state.perPage = action.payload.perPage;
//     },
//     clearProjectTasks: (state) => {
//       state.projectTasks = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTasks.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTasks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.tasks = action.payload.data?.data || action.payload.data || [];
//         state.totalCount = action.payload.data?.total || state.tasks.length;
//         state.currentPage = action.payload.data?.current_page || 1;
//         state.lastPage = action.payload.data?.last_page || 1;
//         if (action.payload.stats) {
//           state.stats = action.payload.stats;
//         }
//       })
//       .addCase(fetchTasks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(fetchTasksByProject.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchTasksByProject.fulfilled, (state, action) => {
//         state.loading = false;
//         state.projectTasks = action.payload.data || action.payload || [];
//       })
//       .addCase(fetchTasksByProject.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(createTask.fulfilled, (state, action) => {
//         const newTask = action.payload.data || action.payload;
//         state.tasks.unshift(newTask);
//         state.totalCount++;
//       })
//       .addCase(updateTask.fulfilled, (state, action) => {
//         const updatedTask = action.payload.data || action.payload;
//         const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
//         if (index !== -1) {
//           state.tasks[index] = updatedTask;
//         }
//         const projectIndex = state.projectTasks.findIndex((t) => t.id === updatedTask.id);
//         if (projectIndex !== -1) {
//           state.projectTasks[projectIndex] = updatedTask;
//         }
//       })
//       .addCase(deleteTask.fulfilled, (state, action) => {
//         state.tasks = state.tasks.filter((t) => t.id !== action.payload);
//         state.projectTasks = state.projectTasks.filter((t) => t.id !== action.payload);
//         state.totalCount--;
//       })
//       .addCase(updateTaskStatus.fulfilled, (state, action) => {
//         const updatedTask = action.payload.data || action.payload;
//         const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
//         if (index !== -1) {
//           state.tasks[index] = updatedTask;
//         }
//         const projectIndex = state.projectTasks.findIndex((t) => t.id === updatedTask.id);
//         if (projectIndex !== -1) {
//           state.projectTasks[projectIndex] = updatedTask;
//         }
//       });
//   },
// });

// export const { clearError, setPagination, clearProjectTasks } = taskSlice.actions;
// export default taskSlice.reducer;