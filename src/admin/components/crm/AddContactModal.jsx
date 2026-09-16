// src/admin/components/crm/AddContactModal.jsx

import { useEffect, useState } from "react";
import { X, UserPlus, Loader } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

const DEPARTMENTS = ["Management", "HR", "Finance", "IT", "Procurement", "Sales", "Operations", "Other"];
const PREFERRED = ["Call", "Email", "WhatsApp", "Other"];

const AddContactModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    designation: "",
    department: "Management",
    email: "",
    phone: "",
    preferred: "Email",
    isPrimary: false,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        designation: "",
        department: "Management",
        email: "",
        phone: "",
        preferred: "Email",
        isPrimary: false,
        notes: "",
      });
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast("Contact name is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      onSubmit?.(form);
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Add Contact
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Add a new contact person for this customer
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
          <Field label="Contact Name" required>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Designation">
              <input
                value={form.designation}
                onChange={(e) => update("designation", e.target.value)}
                placeholder="e.g. HR Manager"
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="Department">
              <select
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+91 ..."
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>
          </div>

          <Field label="Preferred Contact Method">
            <select
              value={form.preferred}
              onChange={(e) => update("preferred", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {PREFERRED.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>

          <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => update("isPrimary", e.target.checked)}
              className="mt-0.5 accent-blue-500"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Mark as primary contact
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                The primary contact is used for all default communications.
              </p>
            </div>
          </label>

          <Field label="Notes">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
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
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Add Contact
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default AddContactModal;