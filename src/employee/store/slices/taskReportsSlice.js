import { createSlice } from '@reduxjs/toolkit';

const loadTaskReportsFromStorage = () => {
  const saved = localStorage.getItem('employeeTaskReports');
  if (saved) return JSON.parse(saved);
  return [
    {
      id: 1,
      date: "06 Apr 2026",
      tasksCompleted: "Completed dashboard UI, fixed sidebar issues",
      planTomorrow: "Work on WFH module integration",
      remarks: "Need design review"
    },
    {
      id: 2,
      date: "05 Apr 2026",
      tasksCompleted: "Created WFH page and modal, fixed theme issues",
      planTomorrow: "Testing and bug fixes",
      remarks: "All good"
    },
    {
      id: 3,
      date: "04 Apr 2026",
      tasksCompleted: "Fixed widget colors in light/dark mode",
      planTomorrow: "Continue with task reports",
      remarks: "Widgets working properly"
    }
  ];
};

const initialState = {
  taskReports: loadTaskReportsFromStorage(),
  pagination: {
    currentPage: 1,
    perPage: 10,
  },
  search: '',
};

const taskReportsSlice = createSlice({
  name: 'taskReports',
  initialState,
  reducers: {
    addTaskReport: (state, action) => {
      state.taskReports.unshift(action.payload);
      localStorage.setItem('employeeTaskReports', JSON.stringify(state.taskReports));
    },
    updateTaskReport: (state, action) => {
      const { id, data } = action.payload;
      const index = state.taskReports.findIndex(r => r.id === id);
      if (index !== -1) {
        state.taskReports[index] = { ...state.taskReports[index], ...data };
        localStorage.setItem('employeeTaskReports', JSON.stringify(state.taskReports));
      }
    },
    deleteTaskReport: (state, action) => {
      state.taskReports = state.taskReports.filter(r => r.id !== action.payload);
      localStorage.setItem('employeeTaskReports', JSON.stringify(state.taskReports));
    },
    setTaskReportsPagination: (state, action) => {
      state.pagination.currentPage = action.payload.currentPage;
      state.pagination.perPage = action.payload.perPage;
    },
    setTaskReportsSearch: (state, action) => {
      state.search = action.payload;
      state.pagination.currentPage = 1;
    },
  },
});

export const { 
  addTaskReport, 
  updateTaskReport, 
  deleteTaskReport, 
  setTaskReportsPagination,
  setTaskReportsSearch 
} = taskReportsSlice.actions;
export default taskReportsSlice.reducer;