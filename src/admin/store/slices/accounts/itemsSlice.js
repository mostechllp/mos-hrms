import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialItems = [
  {
    id: "1",
    name: "Web Development Services",
    type: "Service",
    purchaseDescription: "Hourly rate for web dev",
    purchaseRate: 50,
    rate: 100,
    description: "Custom web development and maintenance.",
    usageUnit: "Hours",
    salesAccount: "Sales",
    purchaseAccount: "Cost of Goods Sold",
    preferredVendor: "Acme Corp",
  },
  {
    id: "2",
    name: "Premium Software License",
    type: "Goods",
    purchaseDescription: "Bulk license purchase",
    purchaseRate: 200,
    rate: 499,
    description: "Annual license for the premium software suite.",
    usageUnit: "Box",
    salesAccount: "Sales",
    purchaseAccount: "Cost of Goods Sold",
    preferredVendor: "Global Tech",
  },
];

const itemsSlice = createSlice({
  name: "items",
  initialState: {
    items: initialItems,
    loading: false,
    error: null,
  },
  reducers: {
    addItem: {
      reducer: (state, action) => {
        state.items.unshift(action.payload);
      },
      prepare: (itemData) => ({
        payload: { ...itemData, id: nanoid() },
      }),
    },
    updateItem: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedData };
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addItem, updateItem, deleteItem } = itemsSlice.actions;
export default itemsSlice.reducer;