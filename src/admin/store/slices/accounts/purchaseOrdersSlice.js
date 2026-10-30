import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialOrders = [
  {
    id: "1",
    orderNumber: "PO-00001",
    vendor: "LocalFix",
    referenceNumber: "REF-2026-01",
    date: "2026-10-30",
    deliveryDate: "2026-11-05",
    paymentTerms: "Due on Receipt",
    deliveryAddress: "Kerala, India",
    shipmentPreference: "",
    items: [
      { id: "item-1", name: "Software License", account: "Job Costing", quantity: 1, rate: 3334.00, amount: 3334.00 }
    ],
    subTotal: 3334.00,
    discount: 0,
    discountType: "percentage",
    adjustment: 0,
    total: 3334.00,
    notes: "Please deliver before the end of the week.",
    termsAndConditions: "Payment is due immediately upon receipt.",
    status: "Draft", // Draft, Issued, Closed
    currency: "INR",
  }
];

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState: {
    orders: initialOrders,
    loading: false,
    error: null,
  },
  reducers: {
    addPurchaseOrder: {
      reducer: (state, action) => {
        state.orders.unshift(action.payload);
      },
      prepare: (orderData) => ({
        payload: { ...orderData, id: nanoid() },
      }),
    },
    updatePurchaseOrder: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.orders.findIndex((o) => o.id === id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updatedData };
      }
    },
    deletePurchaseOrder: (state, action) => {
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

export const { 
  addPurchaseOrder, 
  updatePurchaseOrder, 
  deletePurchaseOrder, 
  updateOrderStatus 
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;