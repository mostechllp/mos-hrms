import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  bills: [
    {
      id: "1",
      vendor: "LocalFix",
      billNumber: "dddd",
      orderNumber: "",
      date: "2026-10-13",
      dueDate: "2026-10-13",
      paymentTerms: "Due on Receipt",
      accountsPayable: "Accounts Payable",
      subject: "",
      items: [
        { id: nanoid(), name: "wrww", description: "fvfdv", account: "", quantity: 1, rate: 3334, discount: 0, amount: 3334 }
      ],
      subTotal: 3334,
      total: 3334,
      balanceDue: 3334,
      status: "Draft",
      notes: "",
      termsAndConditions: ""
    }
  ],
};

const billsSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {
    addBill: (state, action) => {
      state.bills.unshift({ ...action.payload, id: nanoid() });
    },
    updateBill: (state, action) => {
      const index = state.bills.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.bills[index] = { ...state.bills[index], ...action.payload };
      }
    },
    deleteBill: (state, action) => {
      state.bills = state.bills.filter((b) => b.id !== action.payload);
    },
  },
});

export const { addBill, updateBill, deleteBill } = billsSlice.actions;
export default billsSlice.reducer;