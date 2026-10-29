import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialCreditNotes = [
  {
    id: "1",
    creditNoteNumber: "CN-000001",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    date: "2026-10-29",
    reference: "",
    status: "Draft", // Draft, Open, Closed, Refunded
    currency: "INR",
    items: [
      { id: "i1", name: "Web Development Services", description: "Hourly rate", qty: 1, rate: 333, tax: 0 },
    ],
    notes: "Thanks for your business.",
    terms: "",
    subtotal: 333,
    taxTotal: 0,
    total: 333,
    creditsRemaining: 333,
    appliedInvoices: []
  }
];

const creditNotesSlice = createSlice({
  name: "creditNotes",
  initialState: {
    creditNotes: initialCreditNotes,
    loading: false,
    error: null,
  },
  reducers: {
    addCreditNote: {
      reducer: (state, action) => {
        state.creditNotes.unshift(action.payload);
      },
      prepare: (noteData) => ({
        payload: { ...noteData, id: nanoid() },
      }),
    },
    updateCreditNote: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.creditNotes.findIndex((n) => n.id === id);
      if (index !== -1) {
        state.creditNotes[index] = { ...state.creditNotes[index], ...updatedData };
      }
    },
    deleteCreditNote: (state, action) => {
      state.creditNotes = state.creditNotes.filter((n) => n.id !== action.payload);
    },
    updateCreditNoteStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.creditNotes.findIndex((n) => n.id === id);
      if (index !== -1) {
        state.creditNotes[index].status = status;
      }
    }
  },
});

export const { addCreditNote, updateCreditNote, deleteCreditNote, updateCreditNoteStatus } = creditNotesSlice.actions;
export default creditNotesSlice.reducer;