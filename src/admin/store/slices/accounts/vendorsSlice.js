// src/store/slices/accounts/vendorsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../../utils/apiClient";

/* ---------- helpers ---------- */

// camelCase (form) → snake_case (API body)
const buildVendorPayload = (v) => {
  return {
    name: v.name?.trim() || v.displayName?.trim() || null,
    company_name: v.companyName?.trim() || null,
    email: v.email || null,
    phone: v.phone || v.workPhone || null,
    mobile: v.mobile || null,
    gstin_pan: v.gstinPan || v.pan || null,
    currency: v.currency || "INR",
    opening_balance: Number(v.openingBalance) || 0,
    payment_terms: v.paymentTerms || null,
    status: v.status || "active",
    remarks: v.remarks || null,
  };
};

// snake_case (API) → camelCase (UI). Safe for both wrapped/unwrapped payloads.
const fromBackendVendor = (v) => {
  if (!v) return v;
  return {
    ...v,
    displayName: v.name ?? v.displayName ?? "",
    name: v.name ?? v.displayName ?? "",
    companyName: v.company_name ?? v.companyName ?? "",
    email: v.email ?? "",
    workPhone: v.phone ?? v.workPhone ?? "",
    mobile: v.mobile ?? "",
    phone: v.phone ?? "",
    gstinPan: v.gstin_pan ?? v.gstinPan ?? "",
    pan: v.gstin_pan ?? v.pan ?? "",
    currency: v.currency ?? "INR",
    openingBalance: Number(v.opening_balance ?? v.openingBalance ?? 0),
    paymentTerms: v.payment_terms ?? v.paymentTerms ?? "",
    status: v.status ?? "active",
    remarks: v.remarks ?? "",
    createdAt: v.created_at ?? v.createdAt ?? null,
    updatedAt: v.updated_at ?? v.updatedAt ?? null,
  };
};

/* ---------- vendor thunks ---------- */

export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/vendors", { params });
      const paginator = data?.data ?? data;
      const list = Array.isArray(paginator)
        ? paginator
        : paginator?.data ?? [];
      return {
        list: list.map(fromBackendVendor),
        meta: {
          current_page: paginator?.current_page ?? 1,
          per_page: paginator?.per_page ?? list.length,
          total: paginator?.total ?? list.length,
          last_page: paginator?.last_page ?? 1,
        },
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch vendors",
      );
    }
  },
);

export const fetchVendorsForPicker = createAsyncThunk(
  "vendors/fetchVendorsForPicker",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/vendors", {
        params: { per_page: 500, status: "active", ...params },
      });
      const paginator = data?.data ?? data;
      const list = Array.isArray(paginator)
        ? paginator
        : paginator?.data ?? [];
      return list.map((v) => ({
        value: v.id,
        label: v.name ?? v.company_name ?? `Vendor #${v.id}`,
      }));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch vendors",
      );
    }
  },
);

export const fetchVendorById = createAsyncThunk(
  "vendors/fetchVendorById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/accounts/vendors/${id}`);
      return fromBackendVendor(data.data ?? data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch vendor",
      );
    }
  },
);

export const createVendor = createAsyncThunk(
  "vendors/createVendor",
  async (vendorData, { rejectWithValue }) => {
    try {
      const payload = buildVendorPayload(vendorData);
      const { data } = await apiClient.post("/accounts/vendors", payload);
      return fromBackendVendor(data.data ?? data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create vendor",
      );
    }
  },
);

export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, ...vendorData }, { rejectWithValue }) => {
    try {
      const payload = buildVendorPayload(vendorData);
      const { data } = await apiClient.put(`/accounts/vendors/${id}`, payload);
      return fromBackendVendor(data.data ?? data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update vendor",
      );
    }
  },
);

export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/accounts/vendors/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete vendor",
      );
    }
  },
);

/* ---------- slice ---------- */

const initialState = {
  vendors: [],
  vendorOptions: [],
  selectedVendor: null,
  pagination: { currentPage: 1, perPage: 25, total: 0, lastPage: 1 },
  loading: false,
  submitting: false,
  optionsLoading: false,
  error: null,
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    /* fetch list */
    builder
      .addCase(fetchVendors.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchVendors.fulfilled, (s, a) => {
        s.loading = false;
        s.vendors = a.payload.list;
        s.pagination = {
          currentPage: a.payload.meta.current_page,
          perPage: a.payload.meta.per_page,
          total: a.payload.meta.total,
          lastPage: a.payload.meta.last_page,
        };
      })
      .addCase(fetchVendors.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    /* picker fetch */
    builder
      .addCase(fetchVendorsForPicker.pending, (s) => {
        s.optionsLoading = true;
      })
      .addCase(fetchVendorsForPicker.fulfilled, (s, a) => {
        s.optionsLoading = false;
        s.vendorOptions = a.payload;
      })
      .addCase(fetchVendorsForPicker.rejected, (s, a) => {
        s.optionsLoading = false;
        s.error = a.payload;
      });

    /* fetch one */
    builder
      .addCase(fetchVendorById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (s, a) => {
        s.loading = false;
        s.selectedVendor = a.payload || null;
      })
      .addCase(fetchVendorById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    /* create */
    builder
      .addCase(createVendor.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(createVendor.fulfilled, (s, a) => {
        s.submitting = false;
        s.vendors.unshift(a.payload);
        s.pagination.total += 1;
        s.vendorOptions.push({
          value: a.payload.id,
          label: a.payload.name ?? `Vendor #${a.payload.id}`,
        });
      })
      .addCase(createVendor.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      });

    /* update */
    builder
      .addCase(updateVendor.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(updateVendor.fulfilled, (s, a) => {
        s.submitting = false;
        const idx = s.vendors.findIndex((v) => v.id === a.payload.id);
        if (idx !== -1) s.vendors[idx] = a.payload;
        if (s.selectedVendor?.id === a.payload.id) s.selectedVendor = a.payload;

        const oIdx = s.vendorOptions.findIndex((o) => o.value === a.payload.id);
        if (oIdx !== -1) {
          s.vendorOptions[oIdx] = {
            value: a.payload.id,
            label: a.payload.name ?? `Vendor #${a.payload.id}`,
          };
        }
      })
      .addCase(updateVendor.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      });

    /* delete */
    builder
      .addCase(deleteVendor.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(deleteVendor.fulfilled, (s, a) => {
        s.submitting = false;
        s.vendors = s.vendors.filter((v) => v.id !== a.payload);
        s.pagination.total = Math.max(0, s.pagination.total - 1);
        if (s.selectedVendor?.id === a.payload) s.selectedVendor = null;
        s.vendorOptions = s.vendorOptions.filter((o) => o.value !== a.payload);
      })
      .addCase(deleteVendor.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      });
  },
});

export const { clearError, clearSelectedVendor } = vendorsSlice.actions;
export default vendorsSlice.reducer;