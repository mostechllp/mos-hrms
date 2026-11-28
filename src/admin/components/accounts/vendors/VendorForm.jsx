// src/admin/pages/accounts/VendorForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createVendor,
  updateVendor,
  fetchVendorById,
  clearSelectedVendor,
  clearError,
} from "../../../store/slices/accounts/vendorsSlice";
import { X, Loader2, AlertCircle } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";
import { showToast } from "../../../components/common/Toast";

export const SALUTATIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Dr.", label: "Dr." },
];

export const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
];

export const CURRENCIES = [
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Pound Sterling" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "RUB", label: "RUB — Russian Ruble" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
];

export const PAYMENT_TERMS = [
  { value: "Due on Receipt", label: "Due on receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
];

export const TDS_OPTIONS = [
  { value: "", label: "Select a tax" },
  { value: "TDS 1%", label: "TDS 1%" },
  { value: "TDS 2%", label: "TDS 2%" },
  { value: "TDS 5%", label: "TDS 5%" },
  { value: "TDS 10%", label: "TDS 10%" },
];

/* ---------- primitives ---------- */

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
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
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const PhoneInput = ({ value, onChange, placeholder }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg">
      +91
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
    />
  </div>
);

/* ---------- helpers ---------- */

const toFormState = (v) => ({
  displayName: v?.displayName ?? v?.name ?? "",
  companyName: v?.companyName ?? v?.company_name ?? "",
  email: v?.email ?? "",
  workPhone: v?.workPhone ?? v?.phone ?? "",
  mobile: v?.mobile ?? "",
  gstinPan: v?.gstinPan ?? v?.gstin_pan ?? v?.pan ?? "",
  currency: (v?.currency ?? "INR").split("-")[0].trim(),
  openingBalance: v?.openingBalance ?? v?.opening_balance ?? 0,
  paymentTerms: v?.paymentTerms ?? v?.payment_terms ?? "Due on Receipt",
  status: v?.status ?? "active",
  remarks: v?.remarks ?? "",
});

/* ---------- page ---------- */

const VendorForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = !!id;

  const vendorsSlice = useSelector((s) => s.vendors) || {};
  const selectedVendor = vendorsSlice.selectedVendor;
  const submitting = vendorsSlice.submitting;
  const loading = vendorsSlice.loading;
  const error = vendorsSlice.error;

  const [formData, setFormData] = useState(() => toFormState(null));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    setFormData(toFormState(null));
    dispatch(clearSelectedVendor());
    dispatch(clearError());
  }, [id, dispatch]);

  useEffect(() => {
    if (isEdit && selectedVendor?.id !== id) {
      dispatch(fetchVendorById(id));
    }
  }, [dispatch, id, isEdit, selectedVendor?.id]);

  useEffect(() => {
    if (isEdit && selectedVendor && selectedVendor.id === id && !hydrated) {
      setFormData(toFormState(selectedVendor));
      setHydrated(true);
    }
  }, [isEdit, selectedVendor, id, hydrated]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedVendor());
      dispatch(clearError());
    };
  }, [dispatch]);

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting) return;

    if (!formData.displayName.trim()) {
      showToast("Display name is required", "error");
      return;
    }

    try {
      if (isEdit) {
        await dispatch(updateVendor({ id, ...formData })).unwrap();
        showToast("Vendor updated", "success");
      } else {
        await dispatch(createVendor(formData)).unwrap();
        showToast("Vendor created", "success");
      }
      navigate("/admin/accounts/purchases/vendors");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Save failed", "error");
    }
  };

  const title = isEdit ? "Edit vendor" : "New vendor";

  return (
    <div className="w-full overflow-x-hidden pb-24 px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Purchases · Vendors
          </p>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {isEdit
              ? "Update vendor details, addresses, and contacts"
              : "Add a vendor to buy from and track payables"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/accounts/purchases/vendors")}
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
          <span>{typeof error === "string" ? error : error?.message || "Something went wrong"}</span>
        </div>
      )}

      {/* Loading state while hydrating edit */}
      {isEdit && loading && !hydrated ? (
        <Card>
          <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin text-green-500" />
            <span className="text-sm">Loading vendor…</span>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card
            title="Basic information"
            description="Who this vendor is and how they appear across transactions"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
              <Field label="Salutation">
                <SearchableSelect
                  value={formData.salutation || ""}
                  onChange={(v) => setField("salutation", v)}
                  options={SALUTATIONS}
                  clearable={false}
                />
              </Field>
              <Field label="First name">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.firstName || ""}
                  onChange={(e) => setField("firstName", e.target.value)}
                />
              </Field>
              <Field label="Last name">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.lastName || ""}
                  onChange={(e) => setField("lastName", e.target.value)}
                />
              </Field>

              <Field label="Company name" className="lg:col-span-3">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                />
              </Field>

              <Field label="Display name" required className="lg:col-span-3">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.displayName}
                  onChange={(e) => setField("displayName", e.target.value)}
                  required
                  autoFocus={!isEdit}
                />
              </Field>

              <Field label="Email address" className="lg:col-span-3">
                <input
                  type="email"
                  className={inputCls}
                  value={formData.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </Field>

              <Field label="Work phone">
                <PhoneInput
                  value={formData.workPhone}
                  onChange={(e) => setField("workPhone", e.target.value)}
                  placeholder="Work phone"
                />
              </Field>
              <Field label="Mobile">
                <PhoneInput
                  value={formData.mobile}
                  onChange={(e) => setField("mobile", e.target.value)}
                  placeholder="Mobile"
                />
              </Field>
              <Field label="Vendor language">
                <select
                  className={inputCls}
                  value={formData.language || "English"}
                  onChange={(e) => setField("language", e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Other details" description="Financial defaults for purchase transactions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
              <Field label="GSTIN / PAN">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.gstinPan}
                  onChange={(e) => setField("gstinPan", e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <select
                  className={inputCls}
                  value={formData.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className={inputCls}
                  value={formData.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>

              <Field label="Opening balance">
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg">
                    INR
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
                    value={formData.openingBalance}
                    onChange={(e) => setField("openingBalance", e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Payment terms">
                <select
                  className={inputCls}
                  value={formData.paymentTerms}
                  onChange={(e) => setField("paymentTerms", e.target.value)}
                >
                  {PAYMENT_TERMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Remarks (internal notes)" className="mt-5">
              <textarea
                rows={4}
                className={inputCls}
                placeholder="Internal notes about this vendor…"
                value={formData.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
              />
            </Field>
          </Card>

          {/* Footer */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/purchases/vendors")}
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
                {isEdit ? "Save changes" : "Create vendor"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default VendorForm;