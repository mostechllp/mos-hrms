import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialPayments = [
  {
    id: "1",
    paymentNumber: "1",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    amountReceived: 222,
    bankCharges: 0,
    paymentDate: "2026-10-29",
    paymentMode: "Cash",
    depositTo: "Petty Cash",
    reference: "",
    tdsDeducted: false,
    status: "Draft", // Draft, Paid
    notes: "",
    appliedInvoices: []
  }
];

const paymentsReceivedSlice = createSlice({
  name: "paymentsReceived",
  initialState: {
    payments: initialPayments,
    loading: false,
    error: null,
  },
  reducers: {
    addPayment: {
      reducer: (state, action) => {
        state.payments.unshift(action.payload);
      },
      prepare: (paymentData) => ({
        payload: { ...paymentData, id: nanoid() },
      }),
    },
    updatePayment: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.payments.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.payments[index] = { ...state.payments[index], ...updatedData };
      }
    },
    deletePayment: (state, action) => {
      state.payments = state.payments.filter((p) => p.id !== action.payload);
    },
    updatePaymentStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.payments.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.payments[index].status = status;
      }
    }
  },
});

export const { addPayment, updatePayment, deletePayment, updatePaymentStatus } = paymentsReceivedSlice.actions;
export default paymentsReceivedSlice.reducer;