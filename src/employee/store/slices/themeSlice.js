import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('employee-theme') || 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('employee-theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('employee-theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;