import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBudget } from "../../../store/slices/accounts/budgetsSlice";
import { X, Plus, ChevronRight } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition";

/* ---------- primitives ---------- */

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const Surface = ({ title, description, children, className = "" }) => (
  <section
    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}
  >
    {(title || description) && (
      <div className="px-5 sm:px-6 pt-5 pb-1">
        {title && (
          <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const AccountPicker = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-[12.5px] text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-2"
  >
    <Plus size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const BudgetForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.budgets.loading);

  const [formData, setFormData] = useState({
    name: "",
    fiscalYear: "Apr 2026 - Mar 2027",
    period: "Monthly",
    includeBalanceSheet: false,
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newBudget = {
      ...formData,
      incomeAccounts: [],
      expenseAccounts: [],
      budgetData: {
        income: {},
        otherIncome: {},
        cogs: {},
        expense: {},
        otherExpense: {},
      },
    };

    await dispatch(addBudget(newBudget)).unwrap();
    navigate("/admin/accounts/accountant/budgets");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link
                to="/admin/dashboard"
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Home
              </Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link
                to="/admin/accounts/accountant/budgets"
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Budgets
              </Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                New
              </span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              New budget
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Define the fiscal year and period, then pick the accounts to track
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/accountant/budgets")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Budget details */}
          <Surface
            title="Budget details"
            description="Name, fiscal year, and reporting frequency"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Name" required className="md:col-span-2">
                <input
                  type="text"
                  className={`${inputCls} max-w-md`}
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Fiscal year" required>
                <select
                  className={inputCls}
                  value={formData.fiscalYear}
                  onChange={(e) => setField("fiscalYear", e.target.value)}
                >
                  <option value="Apr 2026 - Mar 2027">Apr 2026 – Mar 2027</option>
                  <option value="Apr 2025 - Mar 2026">Apr 2025 – Mar 2026</option>
                </select>
              </Field>

              <Field label="Budget period" required>
                <select
                  className={inputCls}
                  value={formData.period}
                  onChange={(e) => setField("period", e.target.value)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </Field>
            </div>
          </Surface>

          {/* Income & Expense accounts */}
          <Surface
            title="Income and expense accounts"
            description="Select the accounts to forecast in this budget"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Income accounts">
                <AccountPicker label="Add accounts" onClick={() => {}} />
              </Field>

              <Field label="Expense accounts">
                <AccountPicker label="Add accounts" onClick={() => {}} />
              </Field>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setField("includeBalanceSheet", true)}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                  <Plus size={10} />
                </span>
                Include asset, liability, and equity accounts
              </button>
            </div>
          </Surface>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/accountant/budgets")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating…" : "Create budget"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;