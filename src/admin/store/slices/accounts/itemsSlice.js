// src/store/slices/accounts/itemsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../../utils/apiClient";

/* ---------- helpers ---------- */

// Map internal camelCase → backend snake_case body (used by create & update)
const buildItemPayload = (itemData) => {
  return {
    name: itemData.name?.trim() || null,
    type: itemData.type || "Goods",
    usage_unit: itemData.usageUnit || itemData.usage_unit || null,

    selling_price: Number(itemData.rate ?? itemData.selling_price) || 0,
    selling_currency:
      itemData.sellingCurrency || itemData.selling_currency || "INR",
    sales_account: itemData.salesAccount || itemData.sales_account || null,
    sales_description:
      itemData.description || itemData.sales_description || null,

    cost_price: Number(itemData.purchaseRate ?? itemData.cost_price) || 0,
    cost_currency: itemData.costCurrency || itemData.cost_currency || "INR",
    purchase_account:
      itemData.purchaseAccount || itemData.purchase_account || null,
    preferred_vendor_id:
      itemData.preferredVendorId != null && itemData.preferredVendorId !== ""
        ? Number(itemData.preferredVendorId)
        : itemData.preferred_vendor_id != null &&
            itemData.preferred_vendor_id !== ""
          ? Number(itemData.preferred_vendor_id)
          : null,
    purchase_description:
      itemData.purchaseDescription || itemData.purchase_description || null,

    status: itemData.status || "active",
  };
};

// Map API snake_case item → internal camelCase shape the UI expects
const fromBackendItem = (it) => {
  if (!it) return it;
  return {
    ...it,
    usageUnit: it.usage_unit ?? it.usageUnit ?? "",
    rate: it.selling_price ?? it.rate ?? 0,
    sellingCurrency: it.selling_currency ?? it.sellingCurrency ?? "INR",
    purchaseRate: it.cost_price ?? it.purchaseRate ?? 0,
    costCurrency: it.cost_currency ?? it.costCurrency ?? "INR",
    description: it.sales_description ?? it.description ?? "",
    purchaseDescription:
      it.purchase_description ?? it.purchaseDescription ?? "",
    salesAccount: it.sales_account ?? it.salesAccount ?? "",
    purchaseAccount: it.purchase_account ?? it.purchaseAccount ?? "",
    preferredVendorId: it.preferred_vendor_id ?? it.preferredVendorId ?? null,
    preferredVendor: it.preferred_vendor?.name ?? it.preferredVendor ?? "",
    createdAt: it.created_at ?? it.createdAt ?? null,
    updatedAt: it.updated_at ?? it.updatedAt ?? null,
  };
};

/* ---------- item thunks ---------- */

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/items", { params });
      const paginator = data?.data ?? data;
      const list = Array.isArray(paginator)
        ? paginator
        : (paginator?.data ?? []);
      return {
        list: list.map(fromBackendItem),
        meta: {
          current_page: paginator?.current_page ?? 1,
          per_page: paginator?.per_page ?? list.length,
          total: paginator?.total ?? list.length,
          last_page: paginator?.last_page ?? 1,
        },
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch items",
      );
    }
  },
);

export const fetchItemById = createAsyncThunk(
  "items/fetchItemById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/accounts/items/${id}`);
      return fromBackendItem(data.data ?? data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch item",
      );
    }
  },
);

export const createItem = createAsyncThunk(
  "items/createItem",
  async (itemData, { rejectWithValue }) => {
    try {
      const payload = buildItemPayload(itemData);
      const { data } = await apiClient.post("/accounts/items", payload);
      return fromBackendItem(data.data ?? data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create item",
      );
    }
  },
);

export const updateItem = createAsyncThunk(
  "items/updateItem",
  async ({ id, ...itemData }, { rejectWithValue }) => {
    try {
      const payload = buildItemPayload(itemData);
      const { data } = await apiClient.put(`/accounts/items/${id}`, payload);
      return fromBackendItem(data.data ?? data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update item",
      );
    }
  },
);

export const deleteItem = createAsyncThunk(
  "items/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/accounts/items/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete item",
      );
    }
  },
);

export const fetchItemFormOptions = createAsyncThunk(
  "items/fetchItemFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/items/form-options");
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch form options",
      );
    }
  },
);

export const exportItems = createAsyncThunk(
  "items/exportItems",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/items/export", {
        params,
        responseType: "blob", // Important for file downloads
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to export items",
      );
    }
  },
);

export const importItems = createAsyncThunk(
  "items/importItems",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(
        "/accounts/items/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to import items",
      );
    }
  },
);

/* ---------- slice ---------- */

const initialState = {
  items: [],
  selectedItem: null,
  pagination: { currentPage: 1, perPage: 25, total: 0, lastPage: 1 },
  formOptions: {
    usage_units: [],
    sales_accounts: [],
    purchase_accounts: [],
    vendors: [],
    loaded: false,
  },
  loading: false,
  submitting: false,
  optionsLoading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    /* fetch list */
    builder
      .addCase(fetchItems.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchItems.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.list;
        s.pagination = {
          currentPage: a.payload.meta.current_page,
          perPage: a.payload.meta.per_page,
          total: a.payload.meta.total,
          lastPage: a.payload.meta.last_page,
        };
      })
      .addCase(fetchItems.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    /* fetch one */
    builder
      .addCase(fetchItemById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchItemById.fulfilled, (s, a) => {
        s.loading = false;
        s.selectedItem = a.payload || null;
      })
      .addCase(fetchItemById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    /* create */
    builder
      .addCase(createItem.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(createItem.fulfilled, (s, a) => {
        s.submitting = false;
        s.items.unshift(a.payload);
        s.pagination.total += 1;
      })
      .addCase(createItem.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      });

    /* update */
    builder
      .addCase(updateItem.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(updateItem.fulfilled, (s, a) => {
        s.submitting = false;
        const idx = s.items.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
        if (s.selectedItem?.id === a.payload.id) s.selectedItem = a.payload;
      })
      .addCase(updateItem.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      });

    /* delete */
    builder
      .addCase(deleteItem.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(deleteItem.fulfilled, (s, a) => {
        s.submitting = false;
        s.items = s.items.filter((i) => i.id !== a.payload);
        s.pagination.total = Math.max(0, s.pagination.total - 1);
        if (s.selectedItem?.id === a.payload) s.selectedItem = null;
      })
      .addCase(deleteItem.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      });

    /* form options */
    builder
      .addCase(fetchItemFormOptions.pending, (s) => {
        s.optionsLoading = true;
      })
      .addCase(fetchItemFormOptions.fulfilled, (s, a) => {
        s.optionsLoading = false;
        const p = a.payload || {};

        // usage_units may come as:
        //   { pcs: "Pieces (pcs)", box: "Box" }   (object map)
        //   ["pcs", "box"]                          (array of strings)
        //   [{ value: "pcs", label: "Pieces" }]     (array of objects)
        const normalizeUnits = (raw) => {
          if (!raw) return [];
          if (Array.isArray(raw)) {
            return raw.map((u) =>
              typeof u === "string"
                ? { value: u, label: u }
                : {
                    value: u.value ?? u.id,
                    label: u.label ?? u.name ?? u.value,
                  },
            );
          }
          if (typeof raw === "object") {
            return Object.entries(raw).map(([value, label]) => ({
              value,
              label: String(label),
            }));
          }
          return [];
        };

        // sales/purchase accounts may be plain string arrays or objects with is_heading
        const normalizeAccounts = (raw) => {
          if (!Array.isArray(raw)) return [];
          return raw.map((a) =>
            typeof a === "string"
              ? { value: a, label: a }
              : {
                  value: a.value ?? a.id ?? a.name,
                  label: a.label ?? a.name,
                  disabled: a.is_heading || a.disabled,
                  isHeading: a.is_heading,
                },
          );
        };

        const normalizeVendors = (raw) => {
          if (!Array.isArray(raw)) return [];
          return raw.map((v) =>
            typeof v === "string"
              ? { value: v, label: v }
              : { value: v.id ?? v.value, label: v.name ?? v.label },
          );
        };

        s.formOptions = {
          usage_units: normalizeUnits(p.usage_units ?? p.units),
          sales_accounts: normalizeAccounts(p.sales_accounts ?? p.accounts),
          purchase_accounts: normalizeAccounts(
            p.purchase_accounts ?? p.expense_accounts,
          ),
          vendors: normalizeVendors(p.vendors),
          types: Array.isArray(p.types) ? p.types : ["Goods", "Service"],
          currencies: Array.isArray(p.currencies) ? p.currencies : ["INR"],
          loaded: true,
        };
      })
      .addCase(fetchItemFormOptions.rejected, (s) => {
        s.optionsLoading = false;
      });
  },
});

export const { clearError, clearSelectedItem } = itemsSlice.actions;
export default itemsSlice.reducer;
