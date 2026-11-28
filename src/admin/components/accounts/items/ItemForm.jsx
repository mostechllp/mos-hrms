// src/admin/pages/accounts/ItemForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createItem,
  updateItem,
  fetchItemById,
  fetchItemFormOptions,
  clearSelectedItem,
  clearError,
} from "../../../store/slices/accounts/itemsSlice";
import {
  X,
  HelpCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";
import { showToast } from "../../../components/common/Toast";
import { fetchVendorsForPicker } from "../../../store/slices/accounts/vendorsSlice";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
      {hint && <HelpCircle size={12} className="text-gray-400 ml-0.5" />}
    </label>
    {children}
  </div>
);

const Card = ({ title, description, children, className = "" }) => (
  <section
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {(title || description) && (
      <div className="px-5 sm:px-6 pt-5 pb-1">
        {title && (
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const CurrencyInput = ({ value, onChange, required, currency = "INR" }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg">
      {currency}
    </span>
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={onChange}
      required={required}
      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
    />
  </div>
);

/* ---------- helpers: convert API payload <-> form state ---------- */

const toFormState = (item) => ({
  name: item?.name ?? "",
  type: item?.type ?? "Goods",
  usage_unit: item?.usageUnit ?? item?.usage_unit ?? "",
  selling_price: item?.rate ?? item?.selling_price ?? "",
  sales_account: item?.salesAccount ?? item?.sales_account ?? "",
  sales_description: item?.description ?? item?.sales_description ?? "",
  cost_price: item?.purchaseRate ?? item?.cost_price ?? "",
  purchase_account: item?.purchaseAccount ?? item?.purchase_account ?? "",
  preferred_vendor_id:
    item?.preferredVendorId ?? item?.preferred_vendor_id ?? "",
  purchase_description:
    item?.purchaseDescription ?? item?.purchase_description ?? "",
  status: item?.status ?? "active",
});

const toApiPayload = (form) => ({
  name: form.name.trim(),
  type: form.type,
  usage_unit: form.usage_unit || null,
  selling_price: Number(form.selling_price) || 0,
  selling_currency: "INR",
  sales_account: form.sales_account || null,
  sales_description: form.sales_description || null,
  cost_price: Number(form.cost_price) || 0,
  cost_currency: "INR",
  purchase_account: form.purchase_account || null,
  preferred_vendor_id:
    form.preferred_vendor_id !== "" && form.preferred_vendor_id != null
      ? Number(form.preferred_vendor_id) || null
      : null,
  purchase_description: form.purchase_description || null,
  status: form.status || "active",
});

/* ---------- page ---------- */

const ItemForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = !!id;

  const itemsSlice = useSelector((state) => state.items) || {};
  const vendorsSlice = useSelector((state) => state.vendors) || {};

  const formOptions = itemsSlice.formOptions;
  const selectedItem = itemsSlice.selectedItem;
  const submitting = itemsSlice.submitting;
  const loading = itemsSlice.loading;
  const error = itemsSlice.error;

  const vendorsFromApi = vendorsSlice.vendorOptions || [];
  const vendorsLoading = vendorsSlice.optionsLoading;

  const [formData, setFormData] = useState(() => toFormState(null));
  const [hydrated, setHydrated] = useState(false);

  /* ---- reset local state when the route id changes ---- */
  useEffect(() => {
    setHydrated(false);
    setFormData(toFormState(null));
    dispatch(clearSelectedItem());
    dispatch(clearError());
  }, [id, dispatch]);

  /* ---- load form options on mount (once) ---- */
  useEffect(() => {
    if (!formOptions?.loaded) dispatch(fetchItemFormOptions());
  }, [dispatch, formOptions?.loaded]);

  /* ---- load current item when editing ---- */
  useEffect(() => {
    if (isEdit && selectedItem?.id !== id) {
      dispatch(fetchItemById(id));
    }
  }, [dispatch, id, isEdit, selectedItem?.id]);

  /* ---- hydrate form once data is available ---- */
  useEffect(() => {
    if (isEdit && selectedItem && selectedItem.id === id && !hydrated) {
      setFormData(toFormState(selectedItem));
      setHydrated(true);
    }
  }, [isEdit, selectedItem, id, hydrated]);

  /* ---- load vendor list for the preferred-vendor dropdown ---- */
  useEffect(() => {
    // Only fetch once per app session unless the list is empty
    if (vendorsFromApi.length === 0) {
      dispatch(fetchVendorsForPicker());
    }
  }, [dispatch, vendorsFromApi.length]);

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      dispatch(clearSelectedItem());
      dispatch(clearError());
    };
  }, [dispatch]);

  /* ---- derived options ---- */
  /* ---- derived options (already normalized in the slice) ---- */
  const unitOptions = useMemo(
    () => formOptions?.usage_units || [],
    [formOptions],
  );

  const salesAccountOptions = useMemo(
    () => formOptions?.sales_accounts || [],
    [formOptions],
  );

  const purchaseAccountOptions = useMemo(
    () => formOptions?.purchase_accounts || [],
    [formOptions],
  );

  const vendorOptions = useMemo(() => {
    // Prefer the dedicated picker list; fall back to formOptions if provided.
    const list =
      vendorsFromApi.length > 0 ? vendorsFromApi : formOptions?.vendors || [];
    const seen = new Set();
    return list.filter((o) => {
      if (seen.has(o.value)) return false;
      seen.add(o.value);
      return true;
    });
  }, [vendorsFromApi, formOptions]);

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting) return;

    if (!formData.name.trim() || !formData.selling_price) {
      showToast("Name and selling price are required", "error");
      return;
    }

    const payload = toApiPayload(formData);

    try {
      if (isEdit) {
        await dispatch(updateItem({ id, ...payload })).unwrap();
        showToast("Item updated", "success");
      } else {
        await dispatch(createItem(payload)).unwrap();
        showToast("Item created", "success");
      }
      // The slice already keeps `items` in sync; the list page refetches on mount.
      navigate("/admin/accounts/items");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Save failed", "error");
    }
  };

  const title = isEdit ? "Edit item" : "New item";

  return (
    <div className="w-full overflow-x-hidden pb-24 px-2 md:px-4">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5 flex-wrap">
            <Link
              to="/admin/dashboard"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <Link
              to="/admin/accounts/items"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Items
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {isEdit ? selectedItem?.name || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {isEdit
              ? "Update pricing, accounts, and vendor defaults"
              : "Add a good or service you buy or sell"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/accounts/items")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-start gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            {typeof error === "string"
              ? error
              : error?.message || "Something went wrong"}
          </span>
        </div>
      )}

      {/* Loading state while hydrating edit */}
      {isEdit && loading && !hydrated ? (
        <Card>
          <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin text-green-500" />
            <span className="text-sm">Loading item…</span>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <Card
            title="Basic information"
            description="Name, type, and unit of measure"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Name" required className="md:col-span-2">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  autoFocus={!isEdit}
                />
              </Field>

              <Field label="Type" required>
                <div className="flex items-center gap-5 h-9">
                  {(formOptions?.types?.length
                    ? formOptions.types
                    : ["Goods", "Service"]
                  ).map((t) => (
                    <label
                      key={t}
                      className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="type"
                        checked={formData.type === t}
                        onChange={() => setField("type", t)}
                        className="text-green-500 focus:ring-green-400 border-gray-300"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Usage unit" hint>
                <SearchableSelect
                  value={formData.usage_unit}
                  onChange={(val) => setField("usage_unit", val)}
                  options={unitOptions}
                  placeholder="Select or type to add"
                  searchPlaceholder="Search units..."
                  clearable
                />
              </Field>
            </div>
          </Card>

          {/* Sales Information */}
          <Card
            title="Sales information"
            description="How this item is priced and posted when you sell it"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Selling price" required>
                <CurrencyInput
                  value={formData.selling_price}
                  onChange={(e) => setField("selling_price", e.target.value)}
                  required
                />
              </Field>

              <Field label="Sales account" required>
                <SearchableSelect
                  value={formData.sales_account}
                  onChange={(val) => setField("sales_account", val)}
                  options={salesAccountOptions}
                  placeholder="Select account"
                  searchPlaceholder="Search accounts..."
                  clearable={false}
                />
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  value={formData.sales_description}
                  onChange={(e) =>
                    setField("sales_description", e.target.value)
                  }
                  placeholder="Optional notes shown on invoices"
                />
              </Field>
            </div>
          </Card>

          {/* Purchase Information */}
          <Card
            title="Purchase information"
            description="Cost, expense account, and preferred vendor"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Cost price" required>
                <CurrencyInput
                  value={formData.cost_price}
                  onChange={(e) => setField("cost_price", e.target.value)}
                />
              </Field>

              <Field label="Purchase account" required>
                <SearchableSelect
                  value={formData.purchase_account}
                  onChange={(val) => setField("purchase_account", val)}
                  options={purchaseAccountOptions}
                  placeholder="Select account"
                  searchPlaceholder="Search accounts..."
                  clearable={false}
                />
              </Field>

              <Field label="Preferred vendor" className="md:col-span-2">
                <SearchableSelect
                  value={formData.preferred_vendor_id}
                  onChange={(val) => setField("preferred_vendor_id", val)}
                  options={vendorOptions}
                  placeholder={
                    vendorsLoading && vendorOptions.length === 0
                      ? "Loading vendors…"
                      : "Select vendor"
                  }
                  searchPlaceholder="Search vendors..."
                  clearable
                  disabled={vendorsLoading && vendorOptions.length === 0}
                />
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  value={formData.purchase_description}
                  onChange={(e) =>
                    setField("purchase_description", e.target.value)
                  }
                  placeholder="Optional notes shown on bills"
                />
              </Field>
            </div>
          </Card>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/items")}
                className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? "Save changes" : "Create item"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ItemForm;
