import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial demo data
const initialTaskReports = [
  {
    id: 1,
    date: "2024-04-04",
    employee: "JITHIN",
    tasksCompleted: "Completed API integration, Fixed login bug, Updated documentation",
    planForTomorrow: "Start work on dashboard charts, Review pull requests, Team meeting",
    remarks: "Need additional resources for frontend tasks",
  },
  {
    id: 2,
    date: "2024-04-04",
    employee: "FAWZY",
    tasksCompleted: "Client meeting, Prepared proposal, Updated CRM",
    planForTomorrow: "Follow up with clients, Submit proposals, Team sync",
    remarks: "",
  },
  {
    id: 3,
    date: "2024-04-03",
    employee: "ABHILASH",
    tasksCompleted: "Financial reports, Budget review, Expense approvals",
    planForTomorrow: "Quarterly planning, Audit preparation",
    remarks: "All tasks completed on time",
  },
  {
    id: 4,
    date: "2024-04-03",
    employee: "AKSHAY",
    tasksCompleted: "Bug fixes, Code review, Deployment",
    planForTomorrow: "New feature development, Testing",
    remarks: "Deployment delayed due to server issues",
  },
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchTaskReports = createAsyncThunk(
  "taskReports/fetchAll",
  async () => {
    await delay(500);
    return initialTaskReports;
  }
);

export const addTaskReport = createAsyncThunk(
  "taskReports/add",
  async (reportData) => {
    await delay(500);
    const newReport = {
      id: Date.now(),
      ...reportData,
    };
    return newReport;
  }
);

export const updateTaskReport = createAsyncThunk(
  "taskReports/update",
  async ({ id, data }) => {
    await delay(500);
    return { id, ...data };
  }
);

export const deleteTaskReport = createAsyncThunk(
  "taskReports/delete",
  async (id) => {
    await delay(500);
    return id;
  }
);

const taskReportSlice = createSlice({
  name: "taskReports",
  initialState: {
    taskReports: [],
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Task Reports
      .addCase(fetchTaskReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskReports.fulfilled, (state, action) => {
        state.loading = false;
        state.taskReports = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchTaskReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Task Report
      .addCase(addTaskReport.fulfilled, (state, action) => {
        state.taskReports.unshift(action.payload);
        state.totalCount += 1;
      })
      // Update Task Report
      .addCase(updateTaskReport.fulfilled, (state, action) => {
        const index = state.taskReports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.taskReports[index] = { ...state.taskReports[index], ...action.payload };
        }
      })
      // Delete Task Report
      .addCase(deleteTaskReport.fulfilled, (state, action) => {
        state.taskReports = state.taskReports.filter(r => r.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export default taskReportSlice.reducer;
