import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-000001",
    orderNumber: "SO-00001",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    invoiceDate: "2026-10-29",
    dueDate: "2026-11-28",
    paymentTerms: "Due on Receipt",
    salesperson: "Fidha",
    subject: "Website Redesign Project",
    status: "Draft", // Draft, Sent, Unpaid, Overdue, Partially Paid, Paid
    currency: "INR",
    items: [
      { id: "i1", name: "Web Development Services", description: "Phase 1", qty: 10, rate: 100, tax: 18 },
    ],
    notes: "Thanks for your business.",
    terms: "Payment due within 30 days.",
    discount: 0,
    discountType: "percentage",
    adjustment: 0,
    subtotal: 1000,
    taxTotal: 180,
    total: 1180,
    amountPaid: 0,
    balanceDue: 1180,
  }
];

const invoicesSlice = createSlice({
  name: "invoices",
  initialState: {
    invoices: initialInvoices,
    loading: false,
    error: null,
  },
  reducers: {
    addInvoice: {
      reducer: (state, action) => {
        state.invoices.unshift(action.payload);
      },
      prepare: (invoiceData) => ({
        payload: { ...invoiceData, id: nanoid() },
      }),
    },
    updateInvoice: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.invoices.findIndex((inv) => inv.id === id);
      if (index !== -1) {
        state.invoices[index] = { ...state.invoices[index], ...updatedData };
      }
    },
    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter((inv) => inv.id !== action.payload);
    },
    updateInvoiceStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.invoices.findIndex((inv) => inv.id === id);
      if (index !== -1) {
        state.invoices[index].status = status;
      }
    }
  },
});

export const { addInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } = invoicesSlice.actions;
export default invoicesSlice.reducer;