import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Dummy data for testing
const generateDummyProjects = () => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const twoMonthsLater = new Date(today);
  twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

  return {
    status: "success",
    data: {
      data: [
        {
          id: 1,
          name: "E-Commerce Platform Development",
          client_name: "TechSolutions Inc.",
          website_url: "https://techsolutions.com",
          description: "Complete e-commerce platform with payment integration, inventory management, and customer portal. Includes mobile responsive design and admin dashboard.",
          start_date: lastMonth.toISOString().split("T")[0],
          end_date: nextMonth.toISOString().split("T")[0],
          status: "active",
          created_at: lastMonth.toISOString(),
          updated_at: lastMonth.toISOString(),
          tasks_count: 12,
          completed_tasks: 5,
        },
        {
          id: 2,
          name: "Mobile App Development",
          client_name: "HealthCare Plus",
          website_url: "https://healthcareplus.com",
          description: "Cross-platform mobile app for patient appointment booking, telemedicine consultation, and prescription management.",
          start_date: threeMonthsAgo.toISOString().split("T")[0],
          end_date: today.toISOString().split("T")[0],
          status: "completed",
          created_at: threeMonthsAgo.toISOString(),
          updated_at: today.toISOString(),
          tasks_count: 25,
          completed_tasks: 25,
        },
        {
          id: 3,
          name: "CRM System Upgrade",
          client_name: "SalesForce Partners",
          website_url: "https://salesforcepartners.com",
          description: "Upgrade existing CRM system with new features including automated workflows, reporting dashboard, and API integrations.",
          start_date: today.toISOString().split("T")[0],
          end_date: twoMonthsLater.toISOString().split("T")[0],
          status: "active",
          created_at: today.toISOString(),
          updated_at: today.toISOString(),
          tasks_count: 18,
          completed_tasks: 2,
        },
        {
          id: 4,
          name: "Website Redesign",
          client_name: "Creative Agency",
          website_url: "https://creativeagency.com",
          description: "Complete website redesign with modern UI/UX, SEO optimization, and improved performance.",
          start_date: threeMonthsAgo.toISOString().split("T")[0],
          end_date: lastMonth.toISOString().split("T")[0],
          status: "completed",
          created_at: threeMonthsAgo.toISOString(),
          updated_at: lastMonth.toISOString(),
          tasks_count: 15,
          completed_tasks: 15,
        },
        {
          id: 5,
          name: "Cloud Migration Project",
          client_name: "DataStorage Corp",
          website_url: "https://datastoragecorp.com",
          description: "Migrate on-premise infrastructure to AWS cloud including database migration, application deployment, and security setup.",
          start_date: lastMonth.toISOString().split("T")[0],
          end_date: threeMonthsAgo.toISOString().split("T")[0],
          status: "on_hold",
          created_at: lastMonth.toISOString(),
          updated_at: lastMonth.toISOString(),
          tasks_count: 8,
          completed_tasks: 3,
        },
        {
          id: 6,
          name: "AI Chatbot Integration",
          client_name: "CustomerFirst Solutions",
          website_url: "https://customerfirst.com",
          description: "Implement AI-powered chatbot for customer support with natural language processing and multi-language support.",
          start_date: today.toISOString().split("T")[0],
          end_date: nextMonth.toISOString().split("T")[0],
          status: "active",
          created_at: today.toISOString(),
          updated_at: today.toISOString(),
          tasks_count: 10,
          completed_tasks: 3,
        },
        {
          id: 7,
          name: "Security Audit & Compliance",
          client_name: "FinanceTrust Bank",
          website_url: "https://financetrust.com",
          description: "Comprehensive security audit, penetration testing, and compliance implementation for GDPR and SOC2.",
          start_date: threeMonthsAgo.toISOString().split("T")[0],
          end_date: lastMonth.toISOString().split("T")[0],
          status: "completed",
          created_at: threeMonthsAgo.toISOString(),
          updated_at: lastMonth.toISOString(),
          tasks_count: 20,
          completed_tasks: 20,
        },
        {
          id: 8,
          name: "API Development",
          client_name: "MobileApp Developers",
          website_url: "https://mobileappdevs.com",
          description: "Develop RESTful APIs for mobile application including authentication, data synchronization, and real-time updates.",
          start_date: lastMonth.toISOString().split("T")[0],
          end_date: today.toISOString().split("T")[0],
          status: "active",
          created_at: lastMonth.toISOString(),
          updated_at: lastMonth.toISOString(),
          tasks_count: 14,
          completed_tasks: 10,
        },
        {
          id: 9,
          name: "Data Analytics Dashboard",
          client_name: "MarketInsights Ltd",
          website_url: "https://marketinsights.com",
          description: "Create interactive data analytics dashboard with real-time metrics, customizable reports, and data visualization.",
          start_date: today.toISOString().split("T")[0],
          end_date: twoMonthsLater.toISOString().split("T")[0],
          status: "active",
          created_at: today.toISOString(),
          updated_at: today.toISOString(),
          tasks_count: 8,
          completed_tasks: 0,
        },
        {
          id: 10,
          name: "Performance Optimization",
          client_name: "SpeedTech Solutions",
          website_url: "https://speedtech.com",
          description: "Optimize website and application performance including database queries, caching strategies, and front-end optimization.",
          start_date: threeMonthsAgo.toISOString().split("T")[0],
          end_date: lastMonth.toISOString().split("T")[0],
          status: "completed",
          created_at: threeMonthsAgo.toISOString(),
          updated_at: lastMonth.toISOString(),
          tasks_count: 6,
          completed_tasks: 6,
        },
      ],
      total: 10,
      current_page: 1,
      last_page: 1,
      per_page: 15,
      stats: {
        total: 10,
        active: 5,
        completed: 4,
        onHold: 1,
      },
    },
  };
};

// Generate dummy tasks for a specific project
export const generateDummyProjectTasks = (projectId) => {
  const projects = generateDummyProjects().data.data;
  const project = projects.find(p => p.id === projectId);
  
  if (!project) return { status: "success", data: [] };
  
  const tasks = [
    {
      id: 1,
      name: "Project Kickoff Meeting",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [1, 2],
      assigned_to: [
        { id: 1, name: "John Doe", employee_id: "EMP001" },
        { id: 2, name: "Jane Smith", employee_id: "EMP002" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: project.start_date,
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 7)).toISOString().split("T")[0],
      priority: "high",
      status: "completed",
      description: "Initial project kickoff meeting to align on requirements and timeline.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 2,
      name: "Requirements Gathering",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [3, 4],
      assigned_to: [
        { id: 3, name: "Mike Johnson", employee_id: "EMP003" },
        { id: 4, name: "Sarah Williams", employee_id: "EMP004" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: project.start_date,
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 14)).toISOString().split("T")[0],
      priority: "high",
      status: project.status === "completed" ? "completed" : "in_progress",
      description: "Gather and document all project requirements from stakeholders.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 3,
      name: "Design Phase",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [5, 6],
      assigned_to: [
        { id: 5, name: "David Brown", employee_id: "EMP005" },
        { id: 6, name: "Lisa Davis", employee_id: "EMP006" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 7)).toISOString().split("T")[0],
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 21)).toISOString().split("T")[0],
      priority: "medium",
      status: project.status === "completed" ? "completed" : "pending",
      description: "Create wireframes, mockups, and design prototypes.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 4,
      name: "Development Sprint 1",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [1, 2, 3],
      assigned_to: [
        { id: 1, name: "John Doe", employee_id: "EMP001" },
        { id: 2, name: "Jane Smith", employee_id: "EMP002" },
        { id: 3, name: "Mike Johnson", employee_id: "EMP003" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 14)).toISOString().split("T")[0],
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 35)).toISOString().split("T")[0],
      priority: "high",
      status: project.status === "completed" ? "completed" : "in_progress",
      description: "First development sprint - core features implementation.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 5,
      name: "Testing & QA",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [4, 5],
      assigned_to: [
        { id: 4, name: "Sarah Williams", employee_id: "EMP004" },
        { id: 5, name: "David Brown", employee_id: "EMP005" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 28)).toISOString().split("T")[0],
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 42)).toISOString().split("T")[0],
      priority: "high",
      status: project.status === "completed" ? "completed" : "pending",
      description: "Comprehensive testing including unit tests, integration tests, and user acceptance testing.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 6,
      name: "Deployment",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [1, 6],
      assigned_to: [
        { id: 1, name: "John Doe", employee_id: "EMP001" },
        { id: 6, name: "Lisa Davis", employee_id: "EMP006" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 35)).toISOString().split("T")[0],
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 49)).toISOString().split("T")[0],
      priority: "medium",
      status: project.status === "completed" ? "completed" : "pending",
      description: "Deploy to production environment and post-deployment verification.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 7,
      name: "Documentation",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [2, 4],
      assigned_to: [
        { id: 2, name: "Jane Smith", employee_id: "EMP002" },
        { id: 4, name: "Sarah Williams", employee_id: "EMP004" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 42)).toISOString().split("T")[0],
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 56)).toISOString().split("T")[0],
      priority: "low",
      status: project.status === "completed" ? "completed" : "pending",
      description: "Create technical documentation and user manuals.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    {
      id: 8,
      name: "Training & Handover",
      project_id: projectId,
      project_name: project.name,
      assigned_to_ids: [3, 5],
      assigned_to: [
        { id: 3, name: "Mike Johnson", employee_id: "EMP003" },
        { id: 5, name: "David Brown", employee_id: "EMP005" }
      ],
      assigned_by_id: 1,
      assigned_by: { id: 1, name: "Admin User" },
      assigned_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 49)).toISOString().split("T")[0],
      due_date: new Date(new Date(project.start_date).setDate(new Date(project.start_date).getDate() + 63)).toISOString().split("T")[0],
      priority: "medium",
      status: project.status === "completed" ? "completed" : "pending",
      description: "Train end-users and handover deliverables to client.",
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
  ];
  
  // Calculate stats based on tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  
  return {
    status: "success",
    data: {
      tasks: tasks,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        in_progress: inProgressTasks,
        pending: pendingTasks,
      }
    }
  };
};

// Fetch all projects
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    // For development: use dummy data
    const USE_DUMMY_DATA = false; // Set to false when backend is ready
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      return generateDummyProjects();
    }
    
    try {
      const response = await apiClient.get("/admin/projects", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch projects");
    }
  }
);

// Fetch project by ID with tasks
export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (id, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const projects = generateDummyProjects().data.data;
      const project = projects.find(p => p.id === parseInt(id));
      const tasksData = generateDummyProjectTasks(parseInt(id));
      
      if (project) {
        return {
          status: "success",
          data: {
            ...project,
            tasks: tasksData.data.tasks,
            tasks_stats: tasksData.data.stats
          }
        };
      }
      return rejectWithValue("Project not found");
    }
    
    try {
      const response = await apiClient.get(`/admin/projects/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch project details");
    }
  }
);

// Create project
export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProject = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks_count: 0,
        completed_tasks: 0,
      };
      return { status: "success", data: newProject };
    }
    
    try {
      const response = await apiClient.post("/admin/projects", projectData);
      return response.data;
    } catch (error) {
      console.error("Create Project Error Payload:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to create project");
    }
  }
);

// Update project
export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, data }, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { status: "success", data: { id, ...data, updated_at: new Date().toISOString() } };
    }
    
    try {
      const response = await apiClient.put(`/admin/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update Project Error Payload:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to update project");
    }
  }
);

// Delete project
export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    }
    
    try {
      await apiClient.delete(`/admin/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete project");
    }
  }
);

// Update project status
export const updateProjectStatus = createAsyncThunk(
  "projects/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    const USE_DUMMY_DATA = false;
    
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { status: "success", data: { id, status, updated_at: new Date().toISOString() } };
    }
    
    try {
      const response = await apiClient.post(`/admin/projects/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update project status");
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  lastPage: 1,
  perPage: 15,
  stats: {
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
  },
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    setPagination: (state, action) => {
      state.currentPage = action.payload.currentPage;
      state.perPage = action.payload.perPage;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data?.data || action.payload.data || [];
        state.totalCount = action.payload.data?.total || state.projects.length;
        state.currentPage = action.payload.data?.current_page || 1;
        state.lastPage = action.payload.data?.last_page || 1;
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.data || action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        const newProject = action.payload.data || action.payload;
        state.projects.unshift(newProject);
        state.totalCount++;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const updatedProject = action.payload.data || action.payload;
        const index = state.projects.findIndex((p) => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
        if (state.currentProject?.id === updatedProject.id) {
          state.currentProject = updatedProject;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        state.totalCount--;
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const updatedProject = action.payload.data || action.payload;
        const index = state.projects.findIndex((p) => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
      });
  },
});

export const { clearError, clearCurrentProject, setPagination } = projectsSlice.actions;
export default projectsSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiClient from "../../../utils/apiClient";

// // Fetch all projects
// export const fetchProjects = createAsyncThunk(
//   "projects/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get("/admin/projects", { params });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to fetch projects");
//     }
//   }
// );

// // Create project
// export const createProject = createAsyncThunk(
//   "projects/create",
//   async (projectData, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.post("/admin/projects", projectData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to create project");
//     }
//   }
// );

// // Update project
// export const updateProject = createAsyncThunk(
//   "projects/update",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.put(`/admin/projects/${id}`, data);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update project");
//     }
//   }
// );

// // Delete project
// export const deleteProject = createAsyncThunk(
//   "projects/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       await apiClient.delete(`/admin/projects/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to delete project");
//     }
//   }
// );

// // Update project status
// export const updateProjectStatus = createAsyncThunk(
//   "projects/updateStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.post(`/admin/projects/${id}/status`, { status });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Failed to update project status");
//     }
//   }
// );

// const initialState = {
//   projects: [],
//   currentProject: null,
//   loading: false,
//   error: null,
//   totalCount: 0,
//   currentPage: 1,
//   lastPage: 1,
//   perPage: 15,
//   stats: {
//     total: 0,
//     active: 0,
//     completed: 0,
//     onHold: 0,
//   },
// };

// const projectsSlice = createSlice({
//   name: "projects",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     clearCurrentProject: (state) => {
//       state.currentProject = null;
//     },
//     setPagination: (state, action) => {
//       state.currentPage = action.payload.currentPage;
//       state.perPage = action.payload.perPage;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProjects.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProjects.fulfilled, (state, action) => {
//         state.loading = false;
//         state.projects = action.payload.data?.data || action.payload.data || [];
//         state.totalCount = action.payload.data?.total || state.projects.length;
//         state.currentPage = action.payload.data?.current_page || 1;
//         state.lastPage = action.payload.data?.last_page || 1;
//         if (action.payload.stats) {
//           state.stats = action.payload.stats;
//         }
//       })
//       .addCase(fetchProjects.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(createProject.fulfilled, (state, action) => {
//         const newProject = action.payload.data || action.payload;
//         state.projects.unshift(newProject);
//         state.totalCount++;
//       })
//       .addCase(updateProject.fulfilled, (state, action) => {
//         const updatedProject = action.payload.data || action.payload;
//         const index = state.projects.findIndex((p) => p.id === updatedProject.id);
//         if (index !== -1) {
//           state.projects[index] = updatedProject;
//         }
//       })
//       .addCase(deleteProject.fulfilled, (state, action) => {
//         state.projects = state.projects.filter((p) => p.id !== action.payload);
//         state.totalCount--;
//       });
//   },
// });

// export const { clearError, clearCurrentProject, setPagination } = projectsSlice.actions;
// export default projectsSlice.reducer;