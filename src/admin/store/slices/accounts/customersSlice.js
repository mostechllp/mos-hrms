// src/store/slices/accounts/customersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../../utils/apiClient";

/* ---------- helpers ---------- */

// Map internal camelCase address → backend snake_case object (NOT a string!)
const toBackendAddress = (addr) => {
  if (!addr) return null;
  const out = {
    attention: addr.attention || "",
    street1: addr.street1 || "",
    street2: addr.street2 || "",
    city: addr.city || "",
    state: addr.state || "",
    pin_code: addr.pinCode || "",
    phone: addr.phone || "",
  };
  // Return null only if every field is empty
  const hasValue = Object.values(out).some((v) => v !== "");
  return hasValue ? out : null;
};

// Build the shared payload body used by both create & update
const buildCustomerPayload = (customerData) => {
  const currencies = (customerData.currencies || []).map((c) =>
    typeof c === "string" ? c : c.value ?? c.code,
  );

  // Ensure base_currency is in currencies list
  const baseCurrency =
    customerData.baseCurrency || currencies[0] || null;

  return {
    customer_type: customerData.type || null,
    salutation: customerData.salutation || null,
    first_name: customerData.firstName || null,
    last_name: customerData.lastName || null,
    company_name:
      customerData.companyName?.trim() ||
      customerData.displayName?.trim() ||
      "Unnamed",
    display_name: customerData.displayName || null,
    email: customerData.email || null,
    country: customerData.country || null,
    work_phone: customerData.workPhone || null,
    mobile: customerData.mobile || null,
    // ✅ Correct field name per working request
    gstin_pan: customerData.pan || null,
    // ✅ Multi-currency fields
    currencies: currencies.length ? currencies : baseCurrency ? [baseCurrency] : [],
    base_currency: baseCurrency,
    exchange_rates: customerData.exchangeRates || {},
    // ✅ Money / terms
    opening_balance: Number(customerData.openingBalance) || 0,
    payment_terms: customerData.paymentTerms || null,
    receivable_account: customerData.receivableAccount || null,
    portal_access: Boolean(customerData.portalAccess),
    // ✅ Addresses are OBJECTS (not strings)
    billing_address: toBackendAddress(customerData.billingAddress),
    shipping_address: toBackendAddress(customerData.shippingAddress),
    remarks: customerData.remarks || null,
  };
};

// Map internal contact person → backend snake_case
const toBackendContactPerson = (cp) => ({
  salutation: cp.salutation || null,
  first_name: cp.firstName || null,
  last_name: cp.lastName || null,
  email: cp.email || null,
  work_phone: cp.workPhone || null,
  mobile: cp.mobile || null,
});

/* ---------- customer thunks ---------- */

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/accounts/revenue/customers", {
        params,
      });
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
        err.response?.data?.message || err.message || "Failed to fetch customers",
      );
    }
  },
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/accounts/revenue/customers/${id}`);
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch customer",
      );
    }
  },
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const payload = {
        ...buildCustomerPayload(customerData),
        // ✅ Contact persons are accepted inline on create
        contact_persons: (customerData.contactPersons || []).map(
          toBackendContactPerson,
        ),
      };

      const { data } = await apiClient.post(
        "/accounts/revenue/customers",
        payload,
      );
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create customer",
      );
    }
  },
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, ...customerData }, { rejectWithValue }) => {
    try {
      const payload = buildCustomerPayload(customerData);
      // Contact persons are NOT sent here — handled via dedicated endpoints

      const { data } = await apiClient.put(
        `/accounts/revenue/customers/${id}`,
        payload,
      );
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update customer",
      );
    }
  },
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/accounts/revenue/customers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete customer",
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
        err.response?.data?.message || err.message || "Failed to fetch form options",
      );
    }
  },
);

/* ---------- contact person thunks (unchanged from prior step) ---------- */

export const fetchContactPersons = createAsyncThunk(
  "customers/fetchContactPersons",
  async (customerId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(
        `/accounts/revenue/customers/${customerId}/contact-persons`,
      );
      const payload = data?.data ?? data;
      return Array.isArray(payload) ? payload : payload?.data ?? [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch contact persons",
      );
    }
  },
);

export const fetchContactPersonById = createAsyncThunk(
  "customers/fetchContactPersonById",
  async ({ customerId, id }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(
        `/accounts/revenue/customers/${customerId}/contact-persons/${id}`,
      );
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch contact person",
      );
    }
  },
);

export const createContactPerson = createAsyncThunk(
  "customers/createContactPerson",
  async ({ customerId, ...cp }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(
        `/accounts/revenue/customers/${customerId}/contact-persons`,
        toBackendContactPerson(cp),
      );
      return { customerId, person: data.data ?? data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create contact person",
      );
    }
  },
);

export const updateContactPerson = createAsyncThunk(
  "customers/updateContactPerson",
  async ({ customerId, id, ...cp }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(
        `/accounts/revenue/customers/${customerId}/contact-persons/${id}`,
        toBackendContactPerson(cp),
      );
      return { customerId, person: data.data ?? data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update contact person",
      );
    }
  },
);

export const deleteContactPerson = createAsyncThunk(
  "customers/deleteContactPerson",
  async ({ customerId, id }, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        `/accounts/revenue/customers/${customerId}/contact-persons/${id}`,
      );
      return { customerId, id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete contact person",
      );
    }
  },
);

/* ---------- slice ---------- */

const initialState = {
  customers: [],
  selectedCustomer: null,
  pagination: { currentPage: 1, perPage: 25, total: 0, lastPage: 1 },
  formOptions: {
    salutations: [],
    customer_types: [],
    currencies: [],
    base_currencies: [],
    default_exchange_rates: {},
    payment_terms: [],
    accounts_receivable: [],
    countries: [],
    loaded: false,
  },
  contactPersons: {},          // { [customerId]: [ ...persons ] }
  contactPersonsLoading: false,
  contactPersonSubmitting: false,
  loading: false,
  submitting: false,
  optionsLoading: false,
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSelectedCustomer: (state) => { state.selectedCustomer = null; },
    clearContactPersons: (state, action) => {
      const customerId = action.payload;
      if (customerId) delete state.contactPersons[customerId];
      else state.contactPersons = {};
    },
  },
  extraReducers: (builder) => {
    /* fetch list */
    builder
      .addCase(fetchCustomers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCustomers.fulfilled, (s, a) => {
        s.loading = false;
        s.customers = a.payload.list;
        s.pagination = {
          currentPage: a.payload.meta.current_page,
          perPage: a.payload.meta.per_page,
          total: a.payload.meta.total,
          lastPage: a.payload.meta.last_page,
        };
      })
      .addCase(fetchCustomers.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    /* fetch one */
    builder
      .addCase(fetchCustomerById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCustomerById.fulfilled, (s, a) => {
        s.loading = false;
        s.selectedCustomer = a.payload || null;
      })
      .addCase(fetchCustomerById.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    /* create */
    builder
      .addCase(createCustomer.pending, (s) => { s.submitting = true; s.error = null; })
      .addCase(createCustomer.fulfilled, (s, a) => {
        s.submitting = false;
        s.customers.unshift(a.payload);
        s.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (s, a) => { s.submitting = false; s.error = a.payload; });

    /* update */
    builder
      .addCase(updateCustomer.pending, (s) => { s.submitting = true; s.error = null; })
      .addCase(updateCustomer.fulfilled, (s, a) => {
        s.submitting = false;
        const idx = s.customers.findIndex((c) => c.id === a.payload.id);
        if (idx !== -1) s.customers[idx] = a.payload;
        if (s.selectedCustomer?.id === a.payload.id) s.selectedCustomer = a.payload;
      })
      .addCase(updateCustomer.rejected, (s, a) => { s.submitting = false; s.error = a.payload; });

    /* delete */
    builder
      .addCase(deleteCustomer.pending, (s) => { s.submitting = true; s.error = null; })
      .addCase(deleteCustomer.fulfilled, (s, a) => {
        s.submitting = false;
        s.customers = s.customers.filter((c) => c.id !== a.payload);
        s.pagination.total = Math.max(0, s.pagination.total - 1);
        if (s.selectedCustomer?.id === a.payload) s.selectedCustomer = null;
        delete s.contactPersons[a.payload];
      })
      .addCase(deleteCustomer.rejected, (s, a) => { s.submitting = false; s.error = a.payload; });

    /* form options */
    builder
      .addCase(fetchCustomerFormOptions.pending, (s) => { s.optionsLoading = true; })
      .addCase(fetchCustomerFormOptions.fulfilled, (s, a) => {
        s.optionsLoading = false;
        const p = a.payload || {};
        s.formOptions = {
          salutations: p.salutations ?? [],
          customer_types: p.customer_types ?? [],
          payment_terms: p.payment_terms ?? [],
          accounts_receivable: p.accounts_receivable ?? [],
          countries: p.countries ?? [],
          base_currencies: p.base_currencies ?? [],
          default_exchange_rates: p.default_exchange_rates ?? {},
          currencies: (p.currencies ?? []).map((c) => ({
            value: c.code ?? c.value,
            label: c.label ?? c.code ?? c.value,
            symbol: c.symbol ?? c.code ?? "",
            code: c.code ?? c.value,
            name: c.name ?? "",
          })),
          loaded: true,
        };
      })
      .addCase(fetchCustomerFormOptions.rejected, (s) => { s.optionsLoading = false; });

    /* contact persons */
    builder
      .addCase(fetchContactPersons.pending, (s) => { s.contactPersonsLoading = true; })
      .addCase(fetchContactPersons.fulfilled, (s, a) => {
        s.contactPersonsLoading = false;
        const key = a.meta.arg;
        s.contactPersons[key] = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchContactPersons.rejected, (s, a) => {
        s.contactPersonsLoading = false;
        s.error = a.payload;
      });

    builder
      .addCase(createContactPerson.pending, (s) => { s.contactPersonSubmitting = true; s.error = null; })
      .addCase(createContactPerson.fulfilled, (s, a) => {
        s.contactPersonSubmitting = false;
        const { customerId, person } = a.payload;
        if (!s.contactPersons[customerId]) s.contactPersons[customerId] = [];
        s.contactPersons[customerId].push(person);
      })
      .addCase(createContactPerson.rejected, (s, a) => {
        s.contactPersonSubmitting = false;
        s.error = a.payload;
      });

    builder
      .addCase(updateContactPerson.pending, (s) => { s.contactPersonSubmitting = true; s.error = null; })
      .addCase(updateContactPerson.fulfilled, (s, a) => {
        s.contactPersonSubmitting = false;
        const { customerId, person } = a.payload;
        const arr = s.contactPersons[customerId] ?? [];
        const idx = arr.findIndex((p) => p.id === person.id);
        if (idx !== -1) arr[idx] = person;
      })
      .addCase(updateContactPerson.rejected, (s, a) => {
        s.contactPersonSubmitting = false;
        s.error = a.payload;
      });

    builder
      .addCase(deleteContactPerson.pending, (s) => { s.contactPersonSubmitting = true; s.error = null; })
      .addCase(deleteContactPerson.fulfilled, (s, a) => {
        s.contactPersonSubmitting = false;
        const { customerId, id } = a.payload;
        if (s.contactPersons[customerId]) {
          s.contactPersons[customerId] = s.contactPersons[customerId].filter(
            (p) => p.id !== id,
          );
        }
      })
      .addCase(deleteContactPerson.rejected, (s, a) => {
        s.contactPersonSubmitting = false;
        s.error = a.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedCustomer,
  clearContactPersons,
} = customersSlice.actions;
export default customersSlice.reducer;