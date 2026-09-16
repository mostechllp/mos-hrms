// src/admin/components/crm/ProductModal.jsx

import { useEffect, useState } from "react";
import { X, Save, Loader, Plus, Package } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const TYPES = ["Product", "Service"];
const CURRENCIES = ["INR", "USD", "AED", "GBP"];
const UNITS = [
  "Unit",
  "License",
  "Project",
  "User/Month",
  "Month",
  "Year",
  "Hour",
  "Day",
  "Other",
];
const STATUSES = ["Active", "Inactive"];

// ------------------------------------------------------------
// Field wrapper
// ------------------------------------------------------------

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const ProductModal = ({
  isOpen,
  onClose,
  product,
  categories = [],
  onSubmit,
}) => {
  const isEdit = Boolean(product?.id);

  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "Product",
    category: categories[0] || "",
    description: "",
    unit: "Unit",
    defaultPrice: "",
    currency: "INR",
    taxRate: "18",
    status: "Active",
    notes: "",
  });

  // Local category list (allows adding new ones inline)
  const [localCategories, setLocalCategories] = useState(categories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Hydrate
  useEffect(() => {
    if (!isOpen) return;
    setLocalCategories(categories);
    setAddingCategory(false);
    setNewCategory("");
    if (isEdit) {
      setForm({
        name: product.name || "",
        code: product.code || "",
        type: product.type || "Product",
        category: product.category || categories[0] || "",
        description: product.description || "",
        unit: product.unit || "Unit",
        defaultPrice: product.defaultPrice ?? "",
        currency: product.currency || "INR",
        taxRate: product.taxRate ?? "18",
        status: product.status || "Active",
        notes: product.notes || "",
      });
    } else {
      setForm({
        name: "",
        code: "",
        type: "Product",
        category: categories[0] || "",
        description: "",
        unit: "Unit",
        defaultPrice: "",
        currency: "INR",
        taxRate: "18",
        status: "Active",
        notes: "",
      });
    }
    setSubmitting(false);
  }, [isOpen, product, isEdit, categories]);

  // Esc
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      showToast("Category name cannot be empty", "error");
      return;
    }
    if (localCategories.includes(trimmed)) {
      showToast("Category already exists", "error");
      return;
    }
    setLocalCategories((prev) => [...prev, trimmed]);
    update("category", trimmed);
    setNewCategory("");
    setAddingCategory(false);
  };

  const validate = () => {
    if (!form.name.trim()) {
      showToast("Product name is required", "error");
      return false;
    }
    if (!form.code.trim()) {
      showToast("Code / SKU is required", "error");
      return false;
    }
    if (form.defaultPrice !== "" && Number(form.defaultPrice) < 0) {
      showToast("Default price cannot be negative", "error");
      return false;
    }
    if (form.taxRate !== "" && (Number(form.taxRate) < 0 || Number(form.taxRate) > 100)) {
      showToast("Tax rate must be between 0 and 100", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        defaultPrice: Number(form.defaultPrice) || 0,
        taxRate: Number(form.taxRate) || 0,
      };
      onSubmit?.(payload, isEdit);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEdit ? "Edit Product / Service" : "Add Product / Service"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit
                  ? "Update the details below"
                  : "Add a new item to your sales catalog"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Row 1: Name / Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. HRMS Implementation"
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="Code / SKU" required>
              <input
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="e.g. HRMS-IMPL"
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
          </div>

          {/* Row 2: Type / Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Category">
              {addingCategory ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                      if (e.key === "Escape") setAddingCategory(false);
                    }}
                    placeholder="New category name"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategory("");
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {localCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Add new category"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="A short description of this product or service"
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>

          {/* Row 3: Unit / Price / Currency / Tax */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="Unit">
              <select
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field label="Default Price">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.defaultPrice}
                onChange={(e) => update("defaultPrice", e.target.value)}
                placeholder="0.00"
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Tax Rate %">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.taxRate}
                onChange={(e) => update("taxRate", e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
          </div>

          {/* Row 4: Status */}
          <Field label="Status">
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("status", s)}
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    form.status === s
                      ? s === "Active"
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Optional internal notes..."
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update" : "Save Product / Service"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;