import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialChallans = [
  {
    id: "1",
    challanNumber: "DC-000001",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    date: "2026-10-29",
    challanType: "Job Work",
    status: "Draft", // Draft, Open, Delivered, Returned, Invoiced
    currency: "INR",
    items: [
      { id: "i1", name: "Web Development Services", description: "Hourly rate", qty: 1, rate: 333, tax: 0 },
    ],
    notes: "Thanks for your business.",
    terms: "Goods once sold will not be taken back.",
    subtotal: 333,
    taxTotal: 0,
    total: 333,
  }
];

const deliveryChallansSlice = createSlice({
  name: "deliveryChallans",
  initialState: {
    challans: initialChallans,
    loading: false,
    error: null,
  },
  reducers: {
    addChallan: {
      reducer: (state, action) => {
        state.challans.unshift(action.payload);
      },
      prepare: (challanData) => ({
        payload: { ...challanData, id: nanoid() },
      }),
    },
    updateChallan: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.challans.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.challans[index] = { ...state.challans[index], ...updatedData };
      }
    },
    deleteChallan: (state, action) => {
      state.challans = state.challans.filter((c) => c.id !== action.payload);
    },
    updateChallanStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.challans.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.challans[index].status = status;
      }
    }
  },
});

export const { addChallan, updateChallan, deleteChallan, updateChallanStatus } = deliveryChallansSlice.actions;
export default deliveryChallansSlice.reducer;