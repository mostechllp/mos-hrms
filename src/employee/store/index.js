import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import leavesReducer from "./slices/leavesSlice";
import tasksReducer from "./slices/tasksSlice";
import notesReducer from "./slices/notesSlice";
import themeReducer from "./slices/themeSlice";
import wfhReducer from "./slices/wfhSlice";
import taskReportsReducer from "./slices/taskReportsSlice";
import attendanceReducer from "./slices/attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leavesReducer,
    tasks: tasksReducer,
    notes: notesReducer,
    theme: themeReducer,
    wfh: wfhReducer,
    taskReports: taskReportsReducer,
    attendance: attendanceReducer,
  },
});
