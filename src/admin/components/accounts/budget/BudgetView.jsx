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
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}
  >
    {children}
  </div>
);

const MetaCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
      <Icon size={15} />
    </div>
    <div>
      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">
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
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <Surface className="py-16 px-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileText size={22} className="text-slate-400" />
            </div>
            <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              Budget not found
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1.5 mb-5">
              This budget may have been deleted or the link is incorrect.
            </p>
            <button
              onClick={() => navigate("/admin/accounts/accountant/budgets")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={13} /> Back to budgets
            </button>
          </div>
        </Surface>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => navigate("/admin/accounts/accountant/budgets")}
              className="p-1.5 mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Budget
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1 truncate">
                {budget.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn
              className="border border-slate-200 dark:border-slate-800"
              aria-label="Edit"
            >
              <Edit2 size={13} /> Edit
            </GhostBtn>
            <GhostBtn
              className="!px-2 border border-slate-200 dark:border-slate-800"
              aria-label="Delete"
            >
              <Trash2 size={13} />
            </GhostBtn>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              <BarChart2 size={13} /> Budget vs. actuals
            </button>
            <GhostBtn
              className="!px-2 border border-slate-200 dark:border-slate-800"
              aria-label="Export"
            >
              <FileText size={13} />
            </GhostBtn>
            <GhostBtn
              className="!px-2 border border-slate-200 dark:border-slate-800"
              onClick={() => navigate("/admin/accounts/accountant/budgets")}
              aria-label="Close"
            >
              <X size={13} />
            </GhostBtn>
          </div>
        </header>

        {/* ---- Meta strip ---- */}
        <Surface className="px-5 py-4 mb-4">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <MetaCard icon={Calendar} label="Fiscal year" value={budget.fiscalYear} />
            <MetaCard icon={Clock} label="Budget period" value={budget.period} />
          </div>
        </Surface>

        {/* ---- P&L table ---- */}
        <Surface className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Profit and loss
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px] whitespace-nowrap border-collapse">
              <thead>
                <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-2.5 w-64 text-left font-medium border-r border-slate-100 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                    Account
                  </th>
                  {months.map((m) => (
                    <th
                      key={m}
                      className="px-3 py-2.5 text-right font-medium border-r border-slate-100 dark:border-slate-800"
                    >
                      {m}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-semibold bg-slate-50 dark:bg-slate-800/60">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {/* Root */}
                <tr className="bg-slate-50/60 dark:bg-slate-800/30 font-semibold">
                  <td className="px-5 py-2 text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Profit and loss
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>

                {/* Income section */}
                <tr className="font-semibold bg-slate-50/30 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-7 text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Income
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>
                <tr className="font-semibold">
                  <td className="px-5 py-2 pl-10 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Income
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-2 pl-14 text-slate-600 dark:text-slate-300">Discount</td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                      {budget.budgetData?.income?.Discount?.[m] || 0}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-50 dark:bg-slate-800/60 font-medium tabular-nums">
                    0
                  </td>
                </tr>

                <tr className="font-medium bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-14 text-slate-700 dark:text-slate-200">
                    Total for income
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-50 dark:bg-slate-800/60 tabular-nums">0</td>
                </tr>

                {/* Other income */}
                <tr className="font-semibold">
                  <td className="px-5 py-2 pl-10 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Other income
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>
                <tr className="font-medium bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-14 text-slate-700 dark:text-slate-200">
                    Total for other income
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-50 dark:bg-slate-800/60 tabular-nums">0</td>
                </tr>

                <tr className="font-semibold bg-slate-100/80 dark:bg-slate-800/60">
                  <td className="px-5 py-2 pl-10 text-slate-900 dark:text-slate-100">
                    Total for income
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-200 dark:bg-slate-700 tabular-nums">0</td>
                </tr>

                {/* Expense section */}
                <tr className="font-semibold bg-slate-50/30 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-7 text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Expense
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>

                <tr className="font-semibold">
                  <td className="px-5 py-2 pl-10 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Cost of goods sold
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>
                <tr className="font-medium bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-14 text-slate-700 dark:text-slate-200">
                    Total for cost of goods sold
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-50 dark:bg-slate-800/60 tabular-nums">0</td>
                </tr>

                <tr className="font-semibold">
                  <td className="px-5 py-2 pl-10 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Expense
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>
                <tr className="font-medium bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-14 text-slate-700 dark:text-slate-200">
                    Total for expense
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-50 dark:bg-slate-800/60 tabular-nums">0</td>
                </tr>

                <tr className="font-semibold">
                  <td className="px-5 py-2 pl-10 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <ChevronDown size={13} className="text-slate-400" /> Other expense
                  </td>
                  {months.map((m) => <td key={m} className="px-3 py-2" />)}
                  <td className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60" />
                </tr>
                <tr className="font-medium bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="px-5 py-2 pl-14 text-slate-700 dark:text-slate-200">
                    Total for other expense
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-50 dark:bg-slate-800/60 tabular-nums">0</td>
                </tr>

                <tr className="font-semibold bg-slate-100/80 dark:bg-slate-800/60">
                  <td className="px-5 py-2 pl-10 text-slate-900 dark:text-slate-100">
                    Total for expense
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-2 text-right tabular-nums">0</td>
                  ))}
                  <td className="px-3 py-2 text-right bg-slate-200 dark:bg-slate-700 tabular-nums">0</td>
                </tr>

                <tr className="font-bold bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-50">
                    Total for profit and loss
                  </td>
                  {months.map((m) => (
                    <td key={m} className="px-3 py-3 text-right text-slate-900 dark:text-slate-50 tabular-nums">
                      0
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 tabular-nums">
                    0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <span>Amounts are displayed in your base currency</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
              INR
            </span>
          </div>
        </Surface>
      </div>
    </div>
  );
};

export default BudgetView;