import { createSlice } from '@reduxjs/toolkit';

const loadNotesFromStorage = () => {
  const saved = localStorage.getItem('employeeNotes');
  if (saved) return JSON.parse(saved);
  return [
    { text: "Meeting with manager at 2 PM", date: new Date().toLocaleDateString() },
    { text: "Complete training module", date: new Date().toLocaleDateString() },
  ];
};

const initialState = {
  notes: loadNotesFromStorage(),
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.notes.unshift({
        text: action.payload,
        date: new Date().toLocaleDateString(),
      });
      localStorage.setItem('employeeNotes', JSON.stringify(state.notes));
    },
    deleteNote: (state, action) => {
      state.notes.splice(action.payload, 1);
      localStorage.setItem('employeeNotes', JSON.stringify(state.notes));
    },
  },
});

export const { addNote, deleteNote } = notesSlice.actions;
export default notesSlice.reducer;