// src/admin/pages/AccountsDashboard.jsx
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  Plus, RefreshCw, Download, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { MONTHS } from "./accountsData";
import { LineChart, BarChart, DonutChart } from "../../components/accounts/charts";
import { AccountModal, TransactionModal, JournalModal } from "../../components/accounts/modals";
import { money } from "../../components/accounts/ui";

const PALETTE = ["#2a78d6", "#eda100", "#1baf7a", "#4a3aa7", "#e34948", "#14b8a6", "#64748b"];

const MOCK_MONTHLY = {
  income:   [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 81000, 78000, 85000],
  expenses: [32000, 35000, 31000, 38000, 34000, 41000, 39000, 42000, 40000, 45000, 43000, 46000],
};
const MOCK_CASH_TREND = [15000, 17000, 16000, 23000, 21000, 26000, 33000, 26000, 35000, 36000, 35000, 39000];

/* ---------- HRMS primitives ---------- */

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between px-4 md:px-5 pt-4 md:pt-5 pb-2 md:pb-3">
    <div>
      <h3 className="text-sm md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    {action}
  </div>
);

const PillSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="text-[11px] md:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1.5 border-0 focus:ring-2 focus:ring-green-500/30 outline-none cursor-pointer"
  >
    {options.map((o) => (
      <option key={o}>{o}</option>
    ))}
  </select>
);

const Trend = ({ value }) => {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        positive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}%
    </span>
  );
};

/* ---------- Dashboard ---------- */

const AccountsDashboard = () => {
  const reduxData = useSelector((s) => s.accounts);
  const accounts = reduxData?.accounts || [];
  const monthly = reduxData?.monthly || MOCK_MONTHLY;
  const cashTrend = reduxData?.cashTrend || MOCK_CASH_TREND;

  const [modal, setModal] = useState(null);
  const [dateRange, setDateRange] = useState("This Fiscal Year");

  const location = useLocation();
  const basePath = location.pathname.split("/")[1] || "admin";

  // Totals
  const totalReceivables = 18500;
  const totalPayables = 9500;
  const currentReceivable = 15000;
  const overdueReceivable = 3500;
  const currentPayable = 8000;
  const overduePayable = 1500;

  const labels = MONTHS.slice(-12);
  const inc = monthly.income.slice(-12) || [];
  const exp = monthly.expenses.slice(-12) || [];
  const totalInc = inc.reduce((a, b) => a + b, 0);
  const totalExp = exp.reduce((a, b) => a + b, 0);
  const net = totalInc - totalExp;

  const expenseSlices = useMemo(() => {
    const list = accounts.filter((a) => a.type === "Expense" && a.balance > 0);
    if (!list.length) {
      return [
        { label: "Payroll", value: 25000, color: PALETTE[0] },
        { label: "Rent", value: 8000, color: PALETTE[1] },
        { label: "Software", value: 5000, color: PALETTE[2] },
        { label: "Marketing", value: 4000, color: PALETTE[3] },
      ];
    }
    return list.map((a, i) => ({
      label: a.name,
      value: a.balance,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [accounts]);
  const expTotal = expenseSlices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards (HRMS style) ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiStat
          label="Total Receivables"
          value={totalReceivables}
          sub={`${money(overdueReceivable)} overdue`}
          icon="fas fa-hand-holding-usd"
          color="green"
          trend={12}
        />
        <KpiStat
          label="Total Payables"
          value={totalPayables}
          sub={`${money(overduePayable)} overdue`}
          icon="fas fa-file-invoice-dollar"
          color="amber"
          trend={-5}
        />
        <KpiStat
          label="Cash Position"
          value={net}
          sub="Incoming − Outgoing"
          icon="fas fa-wallet"
          color="blue"
          trend={8}
        />
        <KpiStat
          label="Net Revenue"
          value={net}
          sub="Income − Expenses"
          icon="fas fa-chart-line"
          color="violet"
          trend={6}
        />
      </div>

      {/* ---- Header (HRMS style) ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
          Accounts Overview
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <PillSelect
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={["This Fiscal Year", "Last Fiscal Year", "Custom"]}
          />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setModal("income")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* ---- Receivables / Payables ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
        <LedgerSplit
          title="Receivables"
          total={totalReceivables}
          rows={[
            { label: "Current", value: currentReceivable, color: "bg-blue-500" },
            { label: "Overdue", value: overdueReceivable, color: "bg-amber-500" },
          ]}
        />
        <LedgerSplit
          title="Payables"
          total={totalPayables}
          rows={[
            { label: "Current", value: currentPayable, color: "bg-blue-500" },
            { label: "Overdue", value: overduePayable, color: "bg-amber-500" },
          ]}
        />
      </div>

      {/* ---- Cash Flow ---- */}
      <Card className="mb-4 md:mb-5">
        <SectionHeader title="Cash Flow" subtitle="Monthly movement over the fiscal year" />
        <div className="px-4 md:px-5 pb-5 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <LineChart
              labels={labels}
              series={[{ name: "Cash", color: "#2a78d6", values: cashTrend }]}
              height={260}
            />
          </div>
          <div className="lg:w-56 flex lg:flex-col gap-4 lg:gap-0 lg:divide-y lg:divide-gray-100 dark:lg:divide-gray-700">
            <StatLine label="Incoming" value={money(totalInc)} tone="pos" />
            <StatLine label="Outgoing" value={money(totalExp)} tone="neg" />
            <StatLine label="Net" value={money(net)} tone="accent" strong />
          </div>
        </div>
      </Card>

      {/* ---- Income/Expense + Top Expenses ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
        <Card>
          <SectionHeader
            title="Income vs Expenses"
            subtitle="Monthly comparison"
            action={
              <div className="flex gap-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <i className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Income
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="w-1.5 h-1.5 rounded-full bg-rose-500" />Expense
                </span>
              </div>
            }
          />
          <div className="px-4 md:px-5 pb-5">
            <div className="flex gap-8 mb-5">
              <div>
                <p className="text-[11px] text-gray-500">Total income</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                  {money(totalInc)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Total expenses</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                  {money(totalExp)}
                </p>
              </div>
            </div>
            <BarChart
              labels={labels}
              height={220}
              series={[
                { name: "Income", color: "#1baf7a", values: inc },
                { name: "Expenses", color: "#e34948", values: exp },
              ]}
            />
          </div>
        </Card>

        <Card>
          <SectionHeader title="Top Expenses" subtitle="Share of total spend" />
          <div className="px-4 md:px-5 pb-6">
            {expenseSlices.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <DonutChart
                  data={expenseSlices}
                  centerTop={money(expTotal)}
                  centerBottom="total"
                  size={170}
                  thickness={22}
                />
                <div className="flex-1 w-full space-y-2.5">
                  {expenseSlices.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="truncate">{d.label}</span>
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                        {((d.value / expTotal) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">No expense recorded</p>
            )}
          </div>
        </Card>
      </div>

      {/* ---- Watchlist (HRMS table style) ---- */}
      <Card className="overflow-x-auto">
        <SectionHeader
          title="Account Watchlist"
          subtitle="Debit / credit summary by account"
          action={<PillSelect value="Accrual" onChange={() => {}} options={["Accrual", "Cash"]} />}
        />
        <div className="min-w-[600px] lg:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Account
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Debit
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Credit
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Net
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Sales", debit: "0.00", credit: "45,000.00", net: "45,000.00" },
                { name: "Cost of Goods Sold", debit: "12,500.00", credit: "0.00", net: "-12,500.00" },
                { name: "Rent Expense", debit: "5,000.00", credit: "0.00", net: "-5,000.00" },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {row.name}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-right tabular-nums">
                    {row.debit}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-right tabular-nums">
                    {row.credit}
                  </td>
                  <td
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right font-semibold tabular-nums ${
                      row.net.startsWith("-")
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {row.net}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <TransactionModal kind="income" open={modal === "income"} onClose={() => setModal(null)} />
      <TransactionModal kind="expense" open={modal === "expense"} onClose={() => setModal(null)} />
      <JournalModal open={modal === "journal"} onClose={() => setModal(null)} />
      <AccountModal open={modal === "account"} onClose={() => setModal(null)} />
    </div>
  );
};

/* ---------- Sub-components ---------- */

const KpiStat = ({ label, value, sub, icon, color, trend }) => {
  const bg = {
    green: "bg-green-100 dark:bg-green-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
    violet: "bg-violet-100 dark:bg-violet-900/30",
  }[color] || "bg-gray-100 dark:bg-gray-700";

  const fg = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    violet: "text-violet-600 dark:text-violet-400",
  }[color] || "text-gray-600 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
        {typeof trend === "number" && <Trend value={trend} />}
      </div>
      <div className={`text-xl md:text-2xl font-bold ${fg} tabular-nums`}>
        {money(value)}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
      <div className="text-[10px] md:text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
};

const LedgerSplit = ({ title, total, rows }) => (
  <Card className="p-4 md:p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-50 tabular-nums tracking-tight mt-1">
          {money(total)}
        </p>
      </div>
      <Link
        to="#"
        className="text-[11px] font-medium text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1"
      >
        View <ArrowUpRight size={12} />
      </Link>
    </div>

    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 flex overflow-hidden mb-3">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`${r.color} h-full`}
          style={{ width: `${(r.value / total) * 100}%` }}
        />
      ))}
    </div>

    <div className="grid grid-cols-2 gap-3">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${r.color}`} />
          <span className="text-[11.5px] text-gray-500">{r.label}</span>
          <span className="ml-auto text-xs font-medium text-gray-800 dark:text-gray-100 tabular-nums">
            {money(r.value)}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

const StatLine = ({ label, value, tone, strong }) => {
  const toneCls =
    tone === "pos"
      ? "text-green-600 dark:text-green-400"
      : tone === "neg"
      ? "text-red-600 dark:text-red-400"
      : tone === "accent"
      ? "text-blue-600 dark:text-blue-400"
      : "text-gray-800 dark:text-gray-100";
  return (
    <div className="flex items-center justify-between lg:py-3">
      <span className="text-[11.5px] text-gray-500">{label}</span>
      <span className={`text-[13px] tabular-nums ${strong ? "font-semibold" : "font-medium"} ${toneCls}`}>
        {value}
      </span>
    </div>
  );
};

export default AccountsDashboard;