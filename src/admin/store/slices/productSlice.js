// src/admin/store/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ── Fallback options (used until form-options loads) ──
export const FALLBACK_PRODUCT_OPTIONS = {
  types: ["Product", "Service"],
  categories: ["Other"],
  units: [
    "Unit",
    "License",
    "Project",
    "User/Month",
    "Month",
    "Year",
    "Hour",
    "Day",
    "Other",
  ],
  currencies: ["INR", "USD", "AED", "GBP"],
  statuses: ["Active", "Inactive"],
};

// ----------------------------------------------------
// SHAPE CONVERTERS
// ----------------------------------------------------

// API → UI
export const fromProductApi = (api = {}) => {
  const cat = api.category;

  // Category may be:
  //  - a string (name only)
  //  - an object { id, name }
  //  - undefined (only category_id present)
  const categoryId =
    api.category_id ??
    (typeof cat === "object" && cat !== null ? cat.id : null) ??
    null;

  const categoryName =
    (typeof cat === "object" && cat !== null
      ? cat.name
      : typeof cat === "string"
        ? cat
        : "") ||
    api.category_name ||
    "";

  return {
    id: api.id,
    productId:
      api.product_id || api.product_code || api.code || `PRD-${api.id}`,
    name: api.name || api.product_name || "",
    code: api.code || api.sku || api.product_code || "",
    type: api.type || api.product_type || "Product",

    // 👇 keep both, so the modal can seed either by id or by name
    categoryId,
    category: categoryName,

    description: api.description || "",
    unit: api.unit || api.uom || "",
    defaultPrice: Number(api.default_price ?? api.price ?? api.unit_price) || 0,
    currency: api.currency || "INR",
    taxRate: Number(api.tax_rate ?? api.tax_percent) || 0,
    status: api.status || "Active",
    notes: api.notes || "",
    createdAt: api.created_at || "",
    updatedAt: api.updated_at || "",
  };
};

// UI → API
export const toProductApi = (form = {}) => ({
  name: (form.name || "").trim(),
  code: (form.code || "").trim(),
  type: form.type || "Product",
  category_id: form.categoryId ? Number(form.categoryId) : null, // 👈
  category: form.category || "", // 👈 keep name too
  description: form.description || "",
  unit: form.unit || "",
  default_price: Number(form.defaultPrice) || 0,
  currency: form.currency || "INR",
  tax_rate: Number(form.taxRate) || 0,
  status: form.status || "Active",
  notes: form.notes || "",
});

// Normalize a category object to a consistent { id, name, products_count } shape
export const fromCategoryApi = (c = {}) => ({
  id: c.id ?? null,
  name: c.name || c.category_name || "",
  products_count: Number(c.products_count ?? c.count ?? 0),
  status: c.status || "Active",
  description: c.description || "",
});

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

const buildProductQuery = (params = {}) => {
  const {
    search = "",
    type = "",
    category = "",
    status = "",
    currency = "",
    min_price = "",
    max_price = "",
    date_from = "",
    date_to = "",
    sort_by = "",
    sort_order = "",
  } = params;

  return new URLSearchParams({
    ...(search && { search }),
    ...(type && { type }),
    ...(category && { category }),
    ...(status && { status }),
    ...(currency && { currency }),
    ...(min_price !== "" && { min_price }),
    ...(max_price !== "" && { max_price }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
  });
};

const unwrap = (body) => {
  if (!body) return { ok: true, data: null, message: "" };
  const hasFlag = body.status !== undefined || body.success !== undefined;
  const ok = !hasFlag || body.status === "success" || body.success === true;
  return { ok, data: body.data ?? body, message: body.message };
};

const flattenErrors = (e) => {
  const errs = e.response?.data?.errors;
  if (errs) return Object.values(errs).flat().join(", ");
  return e.response?.data?.message || null;
};

const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const buildFilename = (base, ext) => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${base}_${yyyy}-${mm}-${dd}.${ext}`;
};

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------

// GET /admin/crm/products/form-options
export const fetchProductFormOptions = createAsyncThunk(
  "products/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/products/form-options");
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load form options");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load form options");
    }
  },
);

// GET /admin/crm/products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 15 } = params;
      const qs = buildProductQuery(params);
      qs.set("page", page);
      qs.set("per_page", perPage);
      const res = await apiClient.get(`/admin/crm/products?${qs}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch products");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to fetch products");
    }
  },
);

// GET /admin/crm/products/{id}
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/crm/products/${id}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to fetch product");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to fetch product");
    }
  },
);

// POST /admin/crm/products
export const createProduct = createAsyncThunk(
  "products/create",
  async (form, { rejectWithValue }) => {
    try {
      const payload = toProductApi(form);
      const res = await apiClient.post("/admin/crm/products", payload);
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to create product");
      return data?.product ?? data;
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to create product");
    }
  },
);

// PUT /admin/crm/products/{id}
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = toProductApi(data);
      const res = await apiClient.put(`/admin/crm/products/${id}`, payload);
      const { ok, data: body, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update product");
      return { id, ...(body?.product ?? body ?? {}) };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update product");
    }
  },
);

// DELETE /admin/crm/products/{id}
export const deleteProductApi = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/admin/crm/products/${id}`);
      const { ok, message } = unwrap(res.data);
      if (ok) return { id };
      return rejectWithValue(message || "Failed to delete product");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to delete product");
    }
  },
);

// POST /admin/crm/products/{id}/update-status
export const updateProductStatusApi = createAsyncThunk(
  "products/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/admin/crm/products/${id}/update-status`,
        { status },
      );
      const { ok, data, message } = unwrap(res.data);
      if (ok) return { id, status, ...(data || {}) };
      return rejectWithValue(message || "Failed to update status");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update status");
    }
  },
);

// GET /admin/crm/products/export?format=csv|xlsx|pdf
export const exportProducts = createAsyncThunk(
  "products/export",
  async ({ filters = {}, format = "xlsx" } = {}, { rejectWithValue }) => {
    try {
      const qs = buildProductQuery(filters);
      qs.set("format", format);
      const res = await apiClient.get(`/admin/crm/products/export?${qs}`, {
        responseType: "blob",
      });
      const ext = format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
      triggerBlobDownload(res.data, buildFilename("products", ext));
      return { ok: true };
    } catch (e) {
      let msg = "Failed to export products";
      const data = e.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          msg = parsed?.message || msg;
        } catch {}
      } else if (data?.message) {
        msg = data.message;
      }
      return rejectWithValue(msg);
    }
  },
);

// ----------------------------------------------------
// CATEGORY THUNKS
// ----------------------------------------------------

// GET /admin/crm/products/categories
export const fetchProductCategories = createAsyncThunk(
  "products/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { search = "" } = params;
      const qs = new URLSearchParams({
        ...(search && { search }),
      });
      const res = await apiClient.get(`/admin/crm/products/categories?${qs}`);
      const { ok, data, message } = unwrap(res.data);
      if (ok) return data;
      return rejectWithValue(message || "Failed to load categories");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load categories");
    }
  },
);

// POST /admin/crm/products/categories
export const createProductCategory = createAsyncThunk(
  "products/createCategory",
  async (form, { rejectWithValue }) => {
    try {
      const payload = {
        name: (form.name || "").trim(),
        description: form.description || "",
        status: form.status || "Active",
      };
      const res = await apiClient.post(
        "/admin/crm/products/categories",
        payload,
      );
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to create category");
      return data?.category ?? data;
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to create category");
    }
  },
);

// PUT /admin/crm/products/categories/{id}
export const updateProductCategory = createAsyncThunk(
  "products/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = {
        name: (data.name || "").trim(),
        description: data.description || "",
        status: data.status || "Active",
      };
      const res = await apiClient.put(
        `/admin/crm/products/categories/${id}`,
        payload,
      );
      const { ok, data: body, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update category");
      return { id, ...(body?.category ?? body ?? {}) };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update category");
    }
  },
);

// DELETE /admin/crm/products/categories/{id}
export const deleteProductCategoryApi = createAsyncThunk(
  "products/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(
        `/admin/crm/products/categories/${id}`,
      );
      const { ok, message } = unwrap(res.data);
      if (ok) return { id };
      return rejectWithValue(message || "Failed to delete category");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to delete category");
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  products: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 15,
  filters: {
    search: "",
    type: "",
    category: "",
    status: "",
    currency: "",
    min_price: "",
    max_price: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
  },

  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  categorySubmitting: false,
  categorySubmittingError: null,

  currentProduct: null,
  currentProductLoading: false,
  currentProductError: null,

  options: FALLBACK_PRODUCT_OPTIONS,
  optionsLoading: false,
  optionsLoaded: false,
  optionsError: null,

  submitting: false,
  submittingError: null,
  exporting: false,
  exportError: null,
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCurrentPage: (s, a) => {
      s.currentPage = a.payload;
    },
    setPerPage: (s, a) => {
      s.perPage = a.payload;
      s.currentPage = 1;
    },
    setFilters: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
      s.currentPage = 1;
    },
    resetFilters: (s) => {
      s.filters = initialState.filters;
      s.currentPage = 1;
    },
    clearCurrentProduct: (s) => {
      s.currentProduct = null;
      s.currentProductError = null;
    },
    clearError: (s) => {
      s.error = null;
      s.submittingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Form options ──
      .addCase(fetchProductFormOptions.pending, (s) => {
        s.optionsLoading = true;
        s.optionsError = null;
      })
      .addCase(fetchProductFormOptions.fulfilled, (s, a) => {
        s.optionsLoading = false;
        s.optionsLoaded = true;
        s.options = { ...FALLBACK_PRODUCT_OPTIONS, ...(a.payload || {}) };
      })
      .addCase(fetchProductFormOptions.rejected, (s, a) => {
        s.optionsLoading = false;
        s.optionsError = a.payload;
      })

      // ── List ──
      .addCase(fetchProducts.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        const d = a.payload || {};
        const paginated =
          d?.data && typeof d.data === "object" && !Array.isArray(d.data)
            ? d.data
            : d;
        const list = Array.isArray(paginated?.data)
          ? paginated.data
          : Array.isArray(paginated)
            ? paginated
            : [];
        s.products = list;
        s.totalCount = paginated?.total ?? list.length;
        s.currentPage = paginated?.current_page ?? s.currentPage;
        s.perPage = paginated?.per_page ?? s.perPage;
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ── Single ──
      .addCase(fetchProductById.pending, (s) => {
        s.currentProductLoading = true;
        s.currentProductError = null;
      })
      .addCase(fetchProductById.fulfilled, (s, a) => {
        s.currentProductLoading = false;
        s.currentProduct = a.payload;
      })
      .addCase(fetchProductById.rejected, (s, a) => {
        s.currentProductLoading = false;
        s.currentProductError = a.payload;
      })

      // ── Create ──
      .addCase(createProduct.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(createProduct.fulfilled, (s, a) => {
        s.submitting = false;
        if (a.payload) {
          s.products.unshift(a.payload);
          s.totalCount += 1;
        }
      })
      .addCase(createProduct.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Update ──
      .addCase(updateProduct.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateProduct.fulfilled, (s, a) => {
        s.submitting = false;
        const u = a.payload;
        const idx = s.products.findIndex((p) => p.id === u.id);
        if (idx !== -1) s.products[idx] = { ...s.products[idx], ...u };
        if (s.currentProduct?.id === u.id) {
          s.currentProduct = { ...s.currentProduct, ...u };
        }
      })
      .addCase(updateProduct.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Status only ──
      .addCase(updateProductStatusApi.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateProductStatusApi.fulfilled, (s, a) => {
        s.submitting = false;
        const { id, status } = a.payload;
        const idx = s.products.findIndex((p) => p.id === id);
        if (idx !== -1) s.products[idx].status = status;
        if (s.currentProduct?.id === id) {
          s.currentProduct.status = status;
        }
      })
      .addCase(updateProductStatusApi.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Delete ──
      .addCase(deleteProductApi.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(deleteProductApi.fulfilled, (s, a) => {
        s.submitting = false;
        s.products = s.products.filter((p) => p.id !== a.payload.id);
        s.totalCount = Math.max(0, s.totalCount - 1);
        if (s.currentProduct?.id === a.payload.id) {
          s.currentProduct = null;
        }
      })
      .addCase(deleteProductApi.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      // ── Export ──
      .addCase(exportProducts.pending, (s) => {
        s.exporting = true;
        s.exportError = null;
      })
      .addCase(exportProducts.fulfilled, (s) => {
        s.exporting = false;
      })
      .addCase(exportProducts.rejected, (s, a) => {
        s.exporting = false;
        s.exportError = a.payload;
      })
      // ── Categories ──
      .addCase(fetchProductCategories.pending, (s) => {
        s.categoriesLoading = true;
        s.categoriesError = null;
      })
      .addCase(fetchProductCategories.fulfilled, (s, a) => {
        s.categoriesLoading = false;
        const d = a.payload || {};
        const list = Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d)
            ? d
            : [];
        s.categories = list.map(fromCategoryApi); // 👈 normalize
      })
      .addCase(fetchProductCategories.rejected, (s, a) => {
        s.categoriesLoading = false;
        s.categoriesError = a.payload;
      })

      .addCase(createProductCategory.pending, (s) => {
        s.categorySubmitting = true;
        s.categorySubmittingError = null;
      })
      .addCase(createProductCategory.fulfilled, (s, a) => {
        s.categorySubmitting = false;
        if (a.payload) s.categories.unshift(fromCategoryApi(a.payload));
      })
      .addCase(createProductCategory.rejected, (s, a) => {
        s.categorySubmitting = false;
        s.categorySubmittingError = a.payload;
      })

      .addCase(updateProductCategory.pending, (s) => {
        s.categorySubmitting = true;
        s.categorySubmittingError = null;
      })
      .addCase(updateProductCategory.fulfilled, (s, a) => {
        s.categorySubmitting = false;
        const u = fromCategoryApi(a.payload);
        const idx = s.categories.findIndex((c) => c.id === u.id);
        if (idx !== -1) s.categories[idx] = { ...s.categories[idx], ...u };
      })
      .addCase(updateProductCategory.rejected, (s, a) => {
        s.categorySubmitting = false;
        s.categorySubmittingError = a.payload;
      })

      .addCase(deleteProductCategoryApi.pending, (s) => {
        s.categorySubmitting = true;
        s.categorySubmittingError = null;
      })
      .addCase(deleteProductCategoryApi.fulfilled, (s, a) => {
        s.categorySubmitting = false;
        s.categories = s.categories.filter((c) => c.id !== a.payload.id);
      })
      .addCase(deleteProductCategoryApi.rejected, (s, a) => {
        s.categorySubmitting = false;
        s.categorySubmittingError = a.payload;
      });
  },
});

export const {
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentProduct,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;
