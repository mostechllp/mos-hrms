import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialQuotes = [
  {
    id: "1",
    quoteNumber: "QT-000001",
    referenceNumber: "",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    date: "2026-10-29",
    expiryDate: "2026-11-28",
    status: "Draft",
    currency: "INR",
    items: [
      { id: "i1", name: "Web Development Services", description: "Hourly rate", qty: 10, rate: 100, tax: 18 },
      { id: "i2", name: "Hosting", description: "Annual", qty: 1, rate: 500, tax: 18 }
    ],
    notes: "Looking forward for your business.",
    terms: "Payment due within 30 days.",
    discount: 0,
    discountType: "percentage",
    adjustment: 0,
    subtotal: 1500,
    taxTotal: 270,
    total: 1770,
  }
];

const quotesSlice = createSlice({
  name: "quotes",
  initialState: {
    quotes: initialQuotes,
    loading: false,
    error: null,
  },
  reducers: {
    addQuote: {
      reducer: (state, action) => {
        state.quotes.unshift(action.payload);
      },
      prepare: (quoteData) => ({
        payload: { ...quoteData, id: nanoid() },
      }),
    },
    updateQuote: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.quotes.findIndex((q) => q.id === id);
      if (index !== -1) {
        state.quotes[index] = { ...state.quotes[index], ...updatedData };
      }
    },
    deleteQuote: (state, action) => {
      state.quotes = state.quotes.filter((q) => q.id !== action.payload);
    },
    updateQuoteStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.quotes.findIndex((q) => q.id === id);
      if (index !== -1) {
        state.quotes[index].status = status;
      }
    }
  },
});

export const { addQuote, updateQuote, deleteQuote, updateQuoteStatus } = quotesSlice.actions;
export default quotesSlice.reducer;