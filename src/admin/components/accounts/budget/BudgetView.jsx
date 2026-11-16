// src/admin/pages/accounts/BudgetView.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChevronDown, Calendar, Clock, Edit2, Trash2,
  FileText, BarChart2, ArrowLeft, X,
} from "lucide-react";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {children}
  </div>
);

const MetaCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
      <Icon size={15} />
    </div>
    <div>
      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  </div>
);

/* ---------- page ---------- */

const BudgetView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const budget = useSelector((state) =>
    state.budgets.budgets.find((b) => b.id === id)
  );

  const months = [
    "APR 2026", "MAY 2026", "JUN 2026", "JUL 2026", "AUG 2026", "SEP 2026",
    "OCT 2026", "NOV 2026", "DEC 2026", "JAN 2027", "FEB 2027", "MAR 2027",
  ];

  if (!budget) {
    return (
      <div className="w-full flex items-center justify-center px-4">
        <Card className="py-16 px-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FileText size={22} className="text-gray-400" />
            </div>
            <h2 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
              Budget not found
            </h2>
            <p className="text-xs md:text-[12.5px] text-gray-500 mt-1.5 mb-5">
              This budget may have been deleted or the link is incorrect.
            </p>
            <button
              onClick={() => navigate("/admin/accounts/accountant/budgets")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft size={13} /> Back to budgets
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => navigate("/admin/accounts/accountant/budgets")}
            className="p-1.5 mt-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Budget
            </p>
            <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent mt-0.5 truncate">
              {budget.name}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn className="border border-gray-200 dark:border-gray-700" aria-label="Edit">
            <Edit2 size={13} /> Edit
          </GhostBtn>
          <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700" aria-label="Delete">
            <Trash2 size={13} />
          </GhostBtn>
          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all">
            <BarChart2 size={13} /> Budget vs. actuals
          </button>
          <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700" aria-label="Export">
            <FileText size={13} />
          </GhostBtn>
          <GhostBtn
            className="!px-2 border border-gray-200 dark:border-gray-700"
            onClick={() => navigate("/admin/accounts/accountant/budgets")}
            aria-label="Close"
          >
            <X size={13} />
          </GhostBtn>
        </div>
      </div>

      {/* ---- Meta strip ---- */}
      <Card className="px-5 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          <MetaCard icon={Calendar} label="Fiscal year" value={budget.fiscalYear} />
          <MetaCard icon={Clock} label="Budget period" value={budget.period} />
        </div>
      </Card>

      {/* ---- P&L table ---- */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            Profit and loss
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-[10px] md:text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-2.5 w-64 text-left font-semibold border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                  Account
                </th>
                {months.map((m) => (
                  <th
                    key={m}
                    className="px-3 py-2.5 text-right font-semibold border-r border-gray-200 dark:border-gray-700"
                  >
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-semibold bg-gray-100 dark:bg-gray-700">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
              {/* Root */}
              <tr className="bg-gray-50/60 dark:bg-gray-700/30 font-semibold">
                <td className="px-5 py-2 text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Profit and loss
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>

              {/* Income section */}
              <tr className="font-semibold bg-gray-50/30 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-7 text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Income
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>
              <tr className="font-semibold">
                <td className="px-5 py-2 pl-10 text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Income
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>

              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <td className="px-5 py-2 pl-14 text-gray-600 dark:text-gray-300">Discount</td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                    {budget.budgetData?.income?.Discount?.[m] || 0}
                  </td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-100 dark:bg-gray-700 font-medium tabular-nums">
                  0
                </td>
              </tr>

              <tr className="font-medium bg-gray-50/50 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-14 text-gray-700 dark:text-gray-200">
                  Total for income
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-100 dark:bg-gray-700 tabular-nums">0</td>
              </tr>

              {/* Other income */}
              <tr className="font-semibold">
                <td className="px-5 py-2 pl-10 text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Other income
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>
              <tr className="font-medium bg-gray-50/50 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-14 text-gray-700 dark:text-gray-200">
                  Total for other income
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-100 dark:bg-gray-700 tabular-nums">0</td>
              </tr>

              <tr className="font-semibold bg-gray-100/80 dark:bg-gray-700/60">
                <td className="px-5 py-2 pl-10 text-gray-900 dark:text-gray-100">
                  Total for income
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-200 dark:bg-gray-600 tabular-nums">0</td>
              </tr>

              {/* Expense section */}
              <tr className="font-semibold bg-gray-50/30 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-7 text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Expense
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>

              <tr className="font-semibold">
                <td className="px-5 py-2 pl-10 text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Cost of goods sold
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>
              <tr className="font-medium bg-gray-50/50 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-14 text-gray-700 dark:text-gray-200">
                  Total for cost of goods sold
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-100 dark:bg-gray-700 tabular-nums">0</td>
              </tr>

              <tr className="font-semibold">
                <td className="px-5 py-2 pl-10 text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Expense
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>
              <tr className="font-medium bg-gray-50/50 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-14 text-gray-700 dark:text-gray-200">
                  Total for expense
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-100 dark:bg-gray-700 tabular-nums">0</td>
              </tr>

              <tr className="font-semibold">
                <td className="px-5 py-2 pl-10 text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <ChevronDown size={13} className="text-gray-400" /> Other expense
                </td>
                {months.map((m) => <td key={m} className="px-3 py-2" />)}
                <td className="px-3 py-2 bg-gray-100 dark:bg-gray-700" />
              </tr>
              <tr className="font-medium bg-gray-50/50 dark:bg-gray-700/20">
                <td className="px-5 py-2 pl-14 text-gray-700 dark:text-gray-200">
                  Total for other expense
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-100 dark:bg-gray-700 tabular-nums">0</td>
              </tr>

              <tr className="font-semibold bg-gray-100/80 dark:bg-gray-700/60">
                <td className="px-5 py-2 pl-10 text-gray-900 dark:text-gray-100">
                  Total for expense
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                ))}
                <td className="px-3 py-2 text-right bg-gray-200 dark:bg-gray-600 tabular-nums">0</td>
              </tr>

              <tr className="font-bold bg-gray-100 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                <td className="px-5 py-3 text-gray-900 dark:text-gray-50">
                  Total for profit and loss
                </td>
                {months.map((m) => (
                  <td key={m} className="px-3 py-3 text-right text-gray-900 dark:text-gray-50 tabular-nums">
                    0
                  </td>
                ))}
                <td className="px-3 py-3 text-right bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-50 tabular-nums">
                  0
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5 text-[11.5px] text-gray-500">
          <span>Amounts are displayed in your base currency</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-semibold uppercase tracking-wider">
            INR
          </span>
        </div>
      </Card>
    </div>
  );
};

export default BudgetView;