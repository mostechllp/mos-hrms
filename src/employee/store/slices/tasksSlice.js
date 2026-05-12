import { createSlice } from '@reduxjs/toolkit';

const loadTasksFromStorage = () => {
  const saved = localStorage.getItem('employeeTasks');
  if (saved) return JSON.parse(saved);
  return [
    { text: "Submit weekly report", completed: false },
    { text: "Review project documents", completed: false },
    { text: "Prepare for team meeting", completed: false },
  ];
};

const initialState = {
  tasks: loadTasksFromStorage(),
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.push({ text: action.payload, completed: false });
      localStorage.setItem('employeeTasks', JSON.stringify(state.tasks));
    },
    toggleTask: (state, action) => {
      const task = state.tasks[action.payload];
      if (task) {
        task.completed = !task.completed;
        localStorage.setItem('employeeTasks', JSON.stringify(state.tasks));
      }
    },
    deleteTask: (state, action) => {
      state.tasks.splice(action.payload, 1);
      localStorage.setItem('employeeTasks', JSON.stringify(state.tasks));
    },
    clearCompletedTasks: (state) => {
      state.tasks = state.tasks.filter(t => !t.completed);
      localStorage.setItem('employeeTasks', JSON.stringify(state.tasks));
    },
  },
});

export const { addTask, toggleTask, deleteTask, clearCompletedTasks } = tasksSlice.actions;
export default tasksSlice.reducer;