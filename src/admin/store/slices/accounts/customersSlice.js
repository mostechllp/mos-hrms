// src/store/slices/accounts/customersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../../utils/apiClient";

/* ---------- async thunks ---------- */

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/revenue/customers", {
        params,
      });

      // Laravel paginator: { status, message, data: { data: [...], current_page, ... } }
      const paginator = data?.data ?? data;
      const list = Array.isArray(paginator)
        ? paginator
        : paginator?.data ?? [];

      return {
        list,
        meta: {
          current_page: paginator?.current_page ?? 1,
          per_page: paginator?.per_page ?? list.length,
          total: paginator?.total ?? list.length,
          last_page: paginator?.last_page ?? 1,
        },
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch customers"
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/accounts/revenue/customers/${id}`);
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch customer",
      );
    }
  },
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue, getState }) => {
    try {
      const opts = getState().accountCustomers?.formOptions ?? {};
      const codeToValue = Object.fromEntries(
        (opts.currencies ?? []).map((c) => [c.code, c.value])
      );

      const payload = {
        customer_type: customerData.type,
        salutation: customerData.salutation,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        company_name: customerData.companyName || null,
        display_name: customerData.displayName,
        email: customerData.email || null,
        country: customerData.country || null,
        work_phone: customerData.workPhone || null,
        mobile: customerData.mobile || null,
        pan: customerData.pan || null,
        currency:
          codeToValue[customerData.baseCurrency] ??
          customerData.baseCurrency ??
          null,
        receivable_account: customerData.receivableAccount || null,
        opening_balance: Number(customerData.openingBalance) || 0,
        payment_terms: customerData.paymentTerms || null,
        portal_access: Boolean(customerData.portalAccess),
        billing_address: customerData.billingAddress ?? {},
        shipping_address: customerData.shippingAddress ?? {},
        contact_persons: customerData.contactPersons ?? [],
      };

      const { data } = await apiClient.post(
        "/accounts/revenue/customers",
        payload
      );
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create customer"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, ...customerData }, { rejectWithValue, getState }) => {
    try {
      const opts = getState().accountCustomers?.formOptions ?? {};
      const codeToValue = Object.fromEntries(
        (opts.currencies ?? []).map((c) => [c.code, c.value])
      );

      const payload = {
        customer_type: customerData.type,
        salutation: customerData.salutation,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        company_name: customerData.companyName || null,
        display_name: customerData.displayName,
        email: customerData.email || null,
        country: customerData.country || null,
        work_phone: customerData.workPhone || null,
        mobile: customerData.mobile || null,
        pan: customerData.pan || null,
        currency:
          codeToValue[customerData.baseCurrency] ??
          customerData.baseCurrency ??
          null,
        receivable_account: customerData.receivableAccount || null,
        opening_balance: Number(customerData.openingBalance) || 0,
        payment_terms: customerData.paymentTerms || null,
        portal_access: Boolean(customerData.portalAccess),
        billing_address: customerData.billingAddress ?? {},
        shipping_address: customerData.shippingAddress ?? {},
        contact_persons: customerData.contactPersons ?? [],
      };

      const { data } = await apiClient.put(
        `/accounts/revenue/customers/${id}`,
        payload
      );
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update customer"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/accounts/revenue/customers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete customer",
      );
    }
  },
);

export const fetchCustomerFormOptions = createAsyncThunk(
  "customers/fetchCustomerFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(
        "/accounts/revenue/customers/form-options",
      );
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

/* ---------- slice ---------- */

const initialState = {
  customers: [],
  selectedCustomer: null,
  pagination: {
    currentPage: 1,
    perPage: 25,
    total: 0,
    lastPage: 1,
  },
  formOptions: {
    salutations: [],
    customer_types: [],
    currencies: [],
    payment_terms: [],
    accounts_receivable: [],
    countries: [],
    loaded: false,
  },
  loading: false,
  submitting: false,
  optionsLoading: false,
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    /* ---- fetch list ---- */
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
  state.loading = false;
  const { list, meta } = action.payload;
  state.customers = list;
  state.pagination = {
    currentPage: meta.current_page,
    perPage: meta.per_page,
    total: meta.total,
    lastPage: meta.last_page,
  };
})
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ---- fetch one ---- */
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
  state.loading = false;
  const c = action.payload || {};
  const opts = state.formOptions;
  const valueToCode = Object.fromEntries(
    (opts.currencies ?? []).map((o) => [o.value, o.code])
  );
  const valueToCodeAny = Object.fromEntries(
    (opts.currencies ?? []).flatMap((o) => [[o.value, o.code], [o.code, o.code]])
  );

  state.selectedCustomer = {
    ...c,
    currencies: (c.currencies ?? []).map((cur) => valueToCodeAny[cur] ?? cur),
    baseCurrency: valueToCodeAny[c.baseCurrency] ?? c.baseCurrency,
  };
})
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ---- create ---- */
    builder
      .addCase(createCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    /* ---- update ---- */
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        const idx = state.customers.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.customers[idx] = updated;
        if (state.selectedCustomer?.id === updated.id) {
          state.selectedCustomer = updated;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    /* ---- delete ---- */
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.customers = state.customers.filter(
          (c) => c.id !== action.payload,
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    /* ---- form options ---- */
    builder
      .addCase(fetchCustomerFormOptions.pending, (state) => {
        state.optionsLoading = true;
      })
      .addCase(fetchCustomerFormOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        const p = action.payload || {};

        state.formOptions = {
          // keep raw shapes as-is where they already match
          salutations: p.salutations ?? [],
          customer_types: p.customer_types ?? [],
          payment_terms: p.payment_terms ?? [],
          accounts_receivable: p.accounts_receivable ?? [],
          countries: p.countries ?? [],

          // normalize currencies so `value` is always the ISO code
          currencies: (p.currencies ?? []).map((c) => ({
            value: c.code ?? c.value, // "INR"
            label: c.label ?? c.code ?? c.value,
            symbol: c.symbol ?? c.code ?? "",
            code: c.code ?? c.value,
          })),

          loaded: true,
        };
      })
      .addCase(fetchCustomerFormOptions.rejected, (state) => {
        state.optionsLoading = false;
      });
  },
});

export const { clearError, clearSelectedCustomer } = customersSlice.actions;
export default customersSlice.reducer;
