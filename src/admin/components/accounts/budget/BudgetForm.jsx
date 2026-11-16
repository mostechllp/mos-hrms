// src/admin/pages/accounts/BudgetForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBudget } from "../../../store/slices/accounts/budgetsSlice";
import { X, Plus, ChevronRight, Sparkles } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition";

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
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
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
    className="w-full text-left px-3 py-2 text-xs md:text-[12.5px] text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-green-400 transition-colors flex items-center gap-2"
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
    <div className="w-full overflow-x-hidden pb-24">
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
              to="/admin/accounts/accountant/budgets"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Budgets
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">New</span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            New budget
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            Define the fiscal year and period, then pick the accounts to track
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/accountant/budgets")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* ---- Info banner ---- */}
      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
        <Sparkles size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Budgets help you forecast income and expenses, and compare plan vs. actuals
          at any time.{" "}
          <a
            href="#"
            className="font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
          >
            Learn more →
          </a>
        </p>
      </div>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Budget details */}
        <Card
          title="Budget details"
          description="Name, fiscal year, and reporting frequency"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
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
        </Card>

        {/* Income & Expense accounts */}
        <Card
          title="Income and expense accounts"
          description="Select the accounts to forecast in this budget"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Income accounts">
              <AccountPicker label="Add accounts" onClick={() => {}} />
            </Field>

            <Field label="Expense accounts">
              <AccountPicker label="Add accounts" onClick={() => {}} />
            </Field>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setField("includeBalanceSheet", true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs md:text-[12.5px] font-medium text-gray-700 dark:text-gray-200 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Plus size={11} />
              </span>
              Include asset, liability, and equity accounts
            </button>
          </div>
        </Card>

        {/* Footer actions */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/accountant/budgets")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating…" : "Create budget"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;