import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus, RefreshCw, Download, MoreHorizontal, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { MONTHS } from "./accountsData";
import { LineChart, BarChart, DonutChart } from "../../components/accounts/charts";
import { AccountModal, TransactionModal, JournalModal } from "../../components/accounts/modals";
import { money } from "../../components/accounts/ui";

const PALETTE = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6", "#64748b"];

const MOCK_MONTHLY = {
  income:   [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 81000, 78000, 85000],
  expenses: [32000, 35000, 31000, 38000, 34000, 41000, 39000, 42000, 40000, 45000, 43000, 46000],
};
const MOCK_CASH_TREND = [15000, 17000, 16000, 23000, 21000, 26000, 33000, 26000, 35000, 36000, 35000, 39000];

/* ---------- Small primitives ---------- */

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between px-5 pt-5 pb-3">
    <div>
      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const PillSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md px-2.5 py-1.5 border-0 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
  >
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

const Trend = ({ value }) => {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}%
    </span>
  );
};

/* ---------- Dashboard ---------- */

const AccountsDashboard = () => {
  const reduxData = useSelector((s) => s.accounts);
  const accounts   = reduxData?.accounts || [];
  const monthly    = reduxData?.monthly || MOCK_MONTHLY;
  const cashTrend  = reduxData?.cashTrend || MOCK_CASH_TREND;

  const [modal, setModal] = useState(null);
  const [dateRange, setDateRange] = useState("This Fiscal Year");

  // Totals (kept as-is per your flow)
  const totalReceivables  = 18500;
  const totalPayables     = 9500;
  const currentReceivable = 15000;
  const overdueReceivable = 3500;
  const currentPayable    = 8000;
  const overduePayable    = 1500;

  const labels = MONTHS.slice(-12);
  const inc = monthly.income.slice(-12)   || [];
  const exp = monthly.expenses.slice(-12) || [];
  const totalInc = inc.reduce((a, b) => a + b, 0);
  const totalExp = exp.reduce((a, b) => a + b, 0);

  const expenseSlices = useMemo(() => {
    const list = accounts.filter((a) => a.type === "Expense" && a.balance > 0);
    if (!list.length) {
      return [
        { label: "Payroll",   value: 25000, color: PALETTE[0] },
        { label: "Rent",      value: 8000,  color: PALETTE[1] },
        { label: "Software",  value: 5000,  color: PALETTE[2] },
        { label: "Marketing", value: 4000,  color: PALETTE[3] },
      ];
    }
    return list.map((a, i) => ({ label: a.name, value: a.balance, color: PALETTE[i % PALETTE.length] }));
  }, [accounts]);
  const expTotal = expenseSlices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accounts</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Overview
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">Financial snapshot for the current fiscal year</p>
          </div>

          <div className="flex items-center gap-2">
            <PillSelect value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              options={["This Fiscal Year", "Last Fiscal Year", "Custom"]} />
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <Download size={13} /> Export
            </button>
            <button
              onClick={() => setModal("income")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>
          </div>
        </header>

        {/* ---- KPI Row ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <KpiCard label="Total Receivables" value={totalReceivables} trend={12}
            sub={`${money(overdueReceivable)} overdue`} />
          <KpiCard label="Total Payables" value={totalPayables} trend={-5}
            sub={`${money(overduePayable)} overdue`} />
          <KpiCard label="Cash Position" value={totalInc - totalExp} trend={8}
            sub="Incoming − Outgoing" />
          <KpiCard label="Net Revenue" value={totalInc - totalExp} trend={6}
            sub="Income − Expenses" />
        </div>

        {/* ---- Receivables / Payables split ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
        <Surface className="mb-4">
          <SectionHeader title="Cash Flow" subtitle="Monthly movement over the fiscal year" />
          <div className="px-5 pb-5 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <LineChart labels={labels}
                series={[{ name: "Cash", color: "#3b82f6", values: cashTrend }]} height={260} />
            </div>
            <div className="lg:w-56 flex lg:flex-col gap-4 lg:gap-0 lg:divide-y lg:divide-slate-100 dark:lg:divide-slate-800">
              <StatLine label="Incoming" value={money(totalInc)} tone="pos" />
              <StatLine label="Outgoing" value={money(totalExp)} tone="neg" />
              <StatLine label="Net" value={money(totalInc - totalExp)} tone="accent" strong />
            </div>
          </div>
        </Surface>

        {/* ---- Income/Expense + Top Expenses ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Surface>
            <SectionHeader
              title="Income vs Expenses"
              subtitle="Monthly comparison"
              action={
                <div className="flex gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5"><i className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Income</span>
                  <span className="flex items-center gap-1.5"><i className="w-1.5 h-1.5 rounded-full bg-rose-500" />Expense</span>
                </div>
              }
            />
            <div className="px-5 pb-5">
              <div className="flex gap-8 mb-5">
                <div>
                  <p className="text-[11px] text-slate-500">Total income</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{money(totalInc)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Total expenses</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{money(totalExp)}</p>
                </div>
              </div>
              <BarChart labels={labels} height={220}
                series={[
                  { name: "Income",   color: "#10b981", values: inc },
                  { name: "Expenses", color: "#f43f5e", values: exp },
                ]} />
            </div>
          </Surface>

          <Surface>
            <SectionHeader title="Top Expenses" subtitle="Share of total spend" />
            <div className="px-5 pb-6">
              {expenseSlices.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <DonutChart data={expenseSlices} centerTop={money(expTotal)} centerBottom="total" size={170} thickness={22} />
                  <div className="flex-1 w-full space-y-2.5">
                    {expenseSlices.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="truncate">{d.label}</span>
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                          {((d.value / expTotal) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-slate-400 py-8 text-center">No expense recorded</p>
              )}
            </div>
          </Surface>
        </div>

        {/* ---- Watchlist ---- */}
        <Surface>
          <SectionHeader
            title="Account Watchlist"
            subtitle="Debit / credit summary by account"
            action={<PillSelect value="Accrual" onChange={() => {}} options={["Accrual", "Cash"]} />}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                  <th className="text-left  font-medium px-5 py-2.5">Account</th>
                  <th className="text-right font-medium px-5 py-2.5">Debit</th>
                  <th className="text-right font-medium px-5 py-2.5">Credit</th>
                  <th className="text-right font-medium px-5 py-2.5">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: "Sales",               debit: "0.00",       credit: "45,000.00", net: "45,000.00" },
                  { name: "Cost of Goods Sold",  debit: "12,500.00",  credit: "0.00",       net: "-12,500.00" },
                  { name: "Rent Expense",        debit: "5,000.00",   credit: "0.00",       net: "-5,000.00" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{row.name}</td>
                    <td className="px-5 py-3 text-right text-slate-500 tabular-nums">{row.debit}</td>
                    <td className="px-5 py-3 text-right text-slate-500 tabular-nums">{row.credit}</td>
                    <td className={`px-5 py-3 text-right font-semibold tabular-nums ${row.net.startsWith("-") ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}`}>
                      {row.net}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>

      </div>

      {/* Modals */}
      <TransactionModal kind="income"  open={modal === "income"}  onClose={() => setModal(null)} />
      <TransactionModal kind="expense" open={modal === "expense"} onClose={() => setModal(null)} />
      <JournalModal open={modal === "journal"} onClose={() => setModal(null)} />
      <AccountModal open={modal === "account"} onClose={() => setModal(null)} />
    </div>
  );
};

/* ---------- Sub-components ---------- */

const KpiCard = ({ label, value, trend, sub }) => (
  <Surface className="p-5">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <Trend value={trend} />
    </div>
    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums tracking-tight">
      {money(value)}
    </p>
    <p className="text-[11.5px] text-slate-500 mt-1">{sub}</p>
  </Surface>
);

const LedgerSplit = ({ title, total, rows }) => (
  <Surface className="p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums tracking-tight mt-1">
          {money(total)}
        </p>
      </div>
      <button className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1">
        View <ArrowUpRight size={12} />
      </button>
    </div>

    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-3">
      {rows.map((r, i) => (
        <div key={i} className={`${r.color} h-full`} style={{ width: `${(r.value / total) * 100}%` }} />
      ))}
    </div>

    <div className="grid grid-cols-2 gap-3">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${r.color}`} />
          <span className="text-[11.5px] text-slate-500">{r.label}</span>
          <span className="ml-auto text-[12px] font-medium text-slate-900 dark:text-slate-100 tabular-nums">
            {money(r.value)}
          </span>
        </div>
      ))}
    </div>
  </Surface>
);

const StatLine = ({ label, value, tone, strong }) => {
  const toneCls =
    tone === "pos"    ? "text-emerald-600" :
    tone === "neg"    ? "text-rose-600"    :
    tone === "accent" ? "text-blue-600"    :
                        "text-slate-900 dark:text-slate-100";
  return (
    <div className="flex items-center justify-between lg:py-3">
      <span className="text-[11.5px] text-slate-500">{label}</span>
      <span className={`text-[13px] tabular-nums ${strong ? "font-semibold" : "font-medium"} ${toneCls}`}>
        {value}
      </span>
    </div>
  );
};

export default AccountsDashboard;