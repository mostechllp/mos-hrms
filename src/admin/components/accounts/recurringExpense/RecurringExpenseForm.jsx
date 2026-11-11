import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, updateProfile } from "../../../store/slices/accounts/recurringExpensesSlice";
import { X, Search, Settings, Info } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- constants ---------- */

const EXPENSE_ACCOUNTS = [
  { value: "Advertising And Marketing", label: "Advertising And Marketing" },
  { value: "Automobile Expense", label: "Automobile Expense" },
  { value: "Job Costing", label: "Job Costing" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Rent Expense", label: "Rent Expense" },
  { value: "Travel Expense", label: "Travel Expense" },
];

const PAID_THROUGH_ACCOUNTS = [
  { value: "Petty Cash", label: "Petty Cash" },
  { value: "Undeposited Funds", label: "Undeposited Funds" },
  { value: "Bank Account", label: "Bank Account" },
];

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint}
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

const CurrencyInput = ({ value, onChange }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg">
      INR
    </span>
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder="0.00"
      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
    />
  </div>
);

/* ---------- page ---------- */

const RecurringExpenseForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingProfile = useSelector((state) =>
    state.recurringExpenses.profiles.find((p) => p.id === id)
  );
  const vendors = useSelector((state) => state.vendors?.vendors || []);
  const customers = useSelector((state) => state.accountCustomers?.customers || state.customers?.customers || []);

  const [formData, setFormData] = useState({
    profileName: existingProfile?.profileName || "",
    repeatEvery: existingProfile?.repeatEvery || "Week",
    startDate: existingProfile?.startDate || new Date().toISOString().split("T")[0],
    endDate: existingProfile?.endDate || "",
    neverExpires: existingProfile?.neverExpires ?? true,
    expenseAccount: existingProfile?.expenseAccount || "",
    amount: existingProfile?.amount || "",
    paidThrough: existingProfile?.paidThrough || "",
    vendor: existingProfile?.vendor || "",
    notes: existingProfile?.notes || "",
    customerName: existingProfile?.customerName || "",
    status: existingProfile?.status || "Active",
    currency: "INR",
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.profileName.trim() || !formData.expenseAccount || !formData.amount) return;

    const finalData = {
      ...formData,
      amount: Number(formData.amount) || 0,
      childExpenses: existingProfile?.childExpenses || [],
    };

    if (id) dispatch(updateProfile({ id, ...finalData }));
    else dispatch(addProfile(finalData));
    navigate("/admin/accounts/purchases/recurring-expenses");
  };

  const title = id ? "Edit recurring expense" : "New recurring expense";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases · Recurring expenses</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update schedule, amount, and details" : "Set a schedule to auto-generate expenses"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/purchases/recurring-expenses")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Schedule ---- */}
          <Surface title="Schedule" description="When this recurring expense runs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Profile name" required>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.profileName}
                  onChange={(e) => setField("profileName", e.target.value)}
                  placeholder="e.g. Monthly office rent"
                />
              </Field>

              <Field label="Repeat every" required>
                <select className={inputCls} value={formData.repeatEvery} onChange={(e) => setField("repeatEvery", e.target.value)}>
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </Field>

              <Field
                label="Start date"
                required
                hint={
                  <p className="mt-1 text-[11.5px] text-slate-500 flex items-center gap-1">
                    <Info size={11} /> The first expense will be created on {formData.startDate}
                  </p>
                }
              >
                <input type="date" className={inputCls} value={formData.startDate} onChange={(e) => setField("startDate", e.target.value)} />
              </Field>

              <Field label="Ends on">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className={`${inputCls} flex-1`}
                    value={formData.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                    disabled={formData.neverExpires}
                  />
                  <label className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={formData.neverExpires}
                      onChange={(e) => setField("neverExpires", e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                    />
                    Never
                  </label>
                </div>
              </Field>
            </div>
          </Surface>

          {/* ---- Expense ---- */}
          <Surface title="Expense" description="What is being paid and from where">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Expense account" required>
                <SearchableSelect
                  options={EXPENSE_ACCOUNTS}
                  value={formData.expenseAccount}
                  onChange={(val) => setField("expenseAccount", val)}
                  placeholder="Select an account"
                />
              </Field>

              <Field label="Amount" required>
                <CurrencyInput value={formData.amount} onChange={(e) => setField("amount", e.target.value)} />
              </Field>

              <Field label="Paid through" required>
                <SearchableSelect
                  options={PAID_THROUGH_ACCOUNTS}
                  value={formData.paidThrough}
                  onChange={(val) => setField("paidThrough", val)}
                  placeholder="Select an account"
                />
              </Field>

              <Field label="Vendor">
                <div className="flex">
                  <div className="flex-1">
                    <SearchableSelect
                      options={vendors.map((v) => ({ value: v.id || v.vendorName, label: v.vendorName || v.name }))}
                      value={formData.vendor}
                      onChange={(val) => setField("vendor", val)}
                      placeholder="Select vendor"
                    />
                  </div>
                  <button
                    type="button"
                    className="ml-2 px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </Field>
            </div>
          </Surface>

          {/* ---- Additional ---- */}
          <Surface title="Additional information" description="Optional context for this profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Customer (for billable expenses)">
                <div className="flex">
                  <div className="flex-1">
                    <SearchableSelect
                      options={customers.map((c) => ({ value: c.id || c.customerName, label: c.customerName || c.name }))}
                      value={formData.customerName}
                      onChange={(val) => setField("customerName", val)}
                      placeholder="Select customer"
                    />
                  </div>
                  <button
                    type="button"
                    className="ml-2 px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </Field>

              <Field label="Reporting tags">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 h-9 px-2.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-fit"
                >
                  <Settings size={12} /> Associate tags
                </button>
              </Field>

              <Field label="Notes" className="md:col-span-2">
                <textarea
                  rows={4}
                  className={inputCls}
                  placeholder="Max. 500 characters"
                  maxLength={500}
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </Field>
            </div>
          </Surface>

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/purchases/recurring-expenses")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Create profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringExpenseForm;