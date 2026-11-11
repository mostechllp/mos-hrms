import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBankAccount } from "../../../store/slices/accounts/bankingSlice";
import { X, HelpCircle, ChevronRight } from "lucide-react";

const inputCls = "w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {hint && <HelpCircle size={12} className="text-slate-400 ml-0.5" />}
    </label>
    {children}
  </div>
);

const Surface = ({ title, description, children, className = "" }) => (
  <section className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {(title || description) && (
      <div className="px-5 sm:px-6 pt-5 pb-1">
        {title && <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>}
        {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

/* ---------- page ---------- */

const AddBankForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.banking.loading);

  const [formData, setFormData] = useState({
    accountType: "Bank",
    accountName: "",
    accountCode: "",
    currency: "INR",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    users: "",
    description: "",
    makePrimary: false,
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountName.trim()) return;
    try {
      await dispatch(addBankAccount(formData)).unwrap();
      navigate("/admin/accounts/banking");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/banking" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Banking</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">New</span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              Add bank or credit card
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Enter the account details used to reconcile your books
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/banking")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Account details */}
          <Surface title="Account details" description="Type, name, and currency for this account">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

              <Field label="Account type" required className="md:col-span-2">
                <div className="flex items-center gap-5 h-9">
                  {["Bank", "Credit Card"].map((t) => (
                    <label key={t} className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        checked={formData.accountType === t}
                        onChange={() => setField("accountType", t)}
                        className="text-slate-900 focus:ring-slate-400 border-slate-300"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Account name" required>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.accountName}
                  onChange={(e) => setField("accountName", e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Account code">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.accountCode}
                  onChange={(e) => setField("accountCode", e.target.value)}
                />
              </Field>

              <Field label="Currency" required>
                <select
                  className={inputCls}
                  value={formData.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </Field>

              <Field label="Account number">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.accountNumber}
                  onChange={(e) => setField("accountNumber", e.target.value)}
                />
              </Field>
            </div>
          </Surface>

          {/* Bank information */}
          <Surface title="Bank information" description="Branch details used for feeds and matching">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Bank name">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.bankName}
                  onChange={(e) => setField("bankName", e.target.value)}
                />
              </Field>

              <Field label="IFSC">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.ifsc}
                  onChange={(e) => setField("ifsc", e.target.value)}
                />
              </Field>
            </div>
          </Surface>

          {/* Access & notes */}
          <Surface title="Access & notes" description="Who can see this account, and any internal notes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Users" className="md:col-span-2">
                <select
                  className={`${inputCls} max-w-md`}
                  value={formData.users}
                  onChange={(e) => setField("users", e.target.value)}
                >
                  <option value="">Select users</option>
                  <option value="Fidha">Joe Doe</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Only users associated with this bank can access this bank account.
                </p>
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  placeholder="Max. 500 characters"
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </Field>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-[12.5px] text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.makePrimary}
                    onChange={(e) => setField("makePrimary", e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  Make this primary
                </label>
              </div>
            </div>
          </Surface>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => navigate("/admin/accounts/banking")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving…" : "Save account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankForm;