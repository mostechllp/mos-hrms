import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialOrders = [
  {
    id: "1",
    orderNumber: "SO-000001",
    reference: "REF-100",
    customerName: "Acme Corp",
    customerEmail: "john@acmecorp.com",
    orderDate: "2026-10-29",
    expectedShipmentDate: "2026-11-05",
    paymentTerms: "Due on Receipt",
    deliveryMethod: "Standard",
    salesperson: "Fidha",
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

const salesOrdersSlice = createSlice({
  name: "salesOrders",
  initialState: {
    orders: initialOrders,
    loading: false,
    error: null,
  },
  reducers: {
    addOrder: {
      reducer: (state, action) => {
        state.orders.unshift(action.payload);
      },
      prepare: (orderData) => ({
        payload: { ...orderData, id: nanoid() },
      }),
    },
    updateOrder: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.orders.findIndex((o) => o.id === id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updatedData };
      }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.orders.findIndex((o) => o.id === id);
      if (index !== -1) {
        state.orders[index].status = status;
      }
    }
  },
});

export const { addOrder, updateOrder, deleteOrder, updateOrderStatus } = salesOrdersSlice.actions;
export default salesOrdersSlice.reducer;