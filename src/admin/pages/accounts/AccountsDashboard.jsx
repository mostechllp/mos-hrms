// src/admin/pages/accounts/tabs/AccountsDashboard.jsx
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Plus, ArrowUpRight, ArrowDownRight, Landmark, ChevronDown, AlertCircle } from "lucide-react";
import { MONTHS } from "./accountsData";
import { LineChart, BarChart, DonutChart, Sparkline, HBars } from "../../components/accounts/charts";
import { AccountModal, TransactionModal, JournalModal } from "../../components/accounts/modals";
import { Card, CardHeader, Button, SelectSm, StatusBadge, money, fmtDate, withTax } from "../../components/accounts/ui";

const PALETTE = ["#2563eb", "#f59e0b", "#16a34a", "#8b5cf6", "#ef4444", "#14b8a6", "#6b7280"];
const AGE_COLORS = ["#16a34a", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

const AccountsDashboard = () => {
  const { accounts, expenses, incomes, metrics, monthly, cashTrend, bankAccounts, agingReceivables, agingPayables } = useSelector((s) => s.accounts);
  const [range, setRange] = useState(12);
  const [mode, setMode] = useState("bar");
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null); // 'income' | 'expense' | 'journal' | 'account'

  const sumOf = (fn) => accounts.filter(fn).reduce((s, a) => s + a.balance, 0);
  const receivables = sumOf((a) => a.subType === "Accounts Receivable");
  const payables = sumOf((a) => a.subType === "Accounts Payable");
  const cash = sumOf((a) => ["Cash", "Bank"].includes(a.subType));
  const profit = sumOf((a) => a.type === "Income") - sumOf((a) => a.type === "Expense");

  const cards = [
    { key: "receivables", label: "Total Receivables", value: receivables, icon: TrendingUp, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30", line: "#2563eb", goodUp: true },
    { key: "payables", label: "Total Payables", value: payables, icon: TrendingDown, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30", line: "#f59e0b", goodUp: false },
    { key: "cash", label: "Cash Balance", value: cash, icon: Wallet, color: "text-green-600 bg-green-50 dark:bg-green-900/30", line: "#16a34a", goodUp: true },
    { key: "profit", label: "Net Profit", value: profit, icon: DollarSign, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30", line: "#6366f1", goodUp: true },
  ];

  const labels = MONTHS.slice(-range);
  const inc = monthly.income.slice(-range), exp = monthly.expenses.slice(-range);
  const series = [
    { name: "Income", color: "#16a34a", values: inc },
    { name: "Expenses", color: "#f59e0b", values: exp },
  ];
  const totalInc = inc.reduce((a, b) => a + b, 0), totalExp = exp.reduce((a, b) => a + b, 0);

  const expenseSlices = useMemo(() => {
    const list = accounts.filter((a) => a.type === "Expense" && a.balance > 0).sort((a, b) => b.balance - a.balance);
    return list.map((a, i) => ({ label: a.name, value: a.balance, color: PALETTE[Math.min(i, PALETTE.length - 1)] }));
  }, [accounts]);
  const expTotal = expenseSlices.reduce((s, d) => s + d.value, 0);

  const bucketTotals = (ag) => ag.buckets.map((b, i) => ({ label: b, value: ag.rows.reduce((t, r) => t + r.values[i], 0), color: AGE_COLORS[i] }));
  const arBuckets = bucketTotals(agingReceivables), apBuckets = bucketTotals(agingPayables);
  const overdue = (b) => b.slice(1).reduce((s, x) => s + x.value, 0);

  const recent = useMemo(
    () => [
      ...incomes.map((i) => ({ id: i.id, date: i.date, name: i.source, sub: i.reference, amount: withTax(i.amount, i.taxRate), status: i.status, in: true })),
      ...expenses.map((e) => ({ id: e.id, date: e.date, name: e.vendor, sub: e.reference, amount: withTax(e.amount, e.taxRate), status: e.status, in: false })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [incomes, expenses]
  );

  const actions = [
    ["income", "Record income"], ["expense", "Record expense"], ["journal", "New journal entry"], ["account", "New account"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Dashboard</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">A snapshot of your finances · Fiscal year 2026</p>
        </div>
        <div className="relative">
          <Button onClick={() => setMenu((m) => !m)}><Plus size={14} /> New <ChevronDown size={13} /></Button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 mt-1 w-48 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1">
                {actions.map(([k, label]) => (
                  <button key={k} onClick={() => { setModal(k); setMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const d = metrics.deltas[c.key];
          const good = (d >= 0) === c.goodUp;
          return (
            <div key={c.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-lg ${c.color}`}><Icon size={18} /></span>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${good ? "text-green-600" : "text-red-500"}`}>
                  {d >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(d)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{money(c.value)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{c.label}</p>
              <Sparkline values={metrics.spark[c.key]} color={c.line} />
            </div>
          );
        })}
      </div>

      {/* Income vs Expenses + Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <CardHeader
            title="Income vs Expenses"
            subtitle={`Net ${money(totalInc - totalExp)} over the last ${range} months`}
            action={
              <div className="flex gap-2">
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {["bar", "line"].map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={`px-2.5 py-1.5 text-xs font-semibold capitalize ${mode === m ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/40"}`}>{m}</button>
                  ))}
                </div>
                <SelectSm value={range} onChange={(e) => setRange(Number(e.target.value))}>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                </SelectSm>
              </div>
            }
          />
          <div className="flex gap-6 mb-3">
            {[["Income", totalInc, "#16a34a"], ["Expenses", totalExp, "#f59e0b"]].map(([n, v, col]) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{n}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{money(v)}</span>
              </div>
            ))}
          </div>
          {mode === "bar" ? <BarChart labels={labels} series={series} /> : <LineChart labels={labels} series={series} />}
        </Card>

        <Card className="p-6">
          <CardHeader title="Top Expenses" subtitle="By account, year to date" />
          <div className="flex flex-col items-center gap-4">
            <DonutChart data={expenseSlices} centerTop={money(expTotal)} centerBottom="Total expenses" />
            <div className="w-full space-y-1.5">
              {expenseSlices.slice(0, 6).map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="truncate">{d.label}</span>
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{((d.value / expTotal) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Aging + banks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[["Receivables", arBuckets, receivables], ["Payables", apBuckets, payables]].map(([title, b, total]) => (
          <Card key={title} className="p-6">
            <CardHeader title={title} subtitle={`${money(total)} outstanding`} />
            <HBars items={b} />
            <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <AlertCircle size={13} className="text-amber-500" /> {money(overdue(b))} is past due
            </p>
          </Card>
        ))}
        <Card className="p-6">
          <CardHeader title="Bank & Cash" subtitle="Connected accounts" />
          <div className="space-y-3">
            {bankAccounts.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600"><Landmark size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{b.name}</p>
                  <p className="text-[11px] text-gray-400">{b.number} · {b.lastSync}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{money(b.balance)}</p>
                  {b.uncategorized > 0 && <p className="text-[10px] text-amber-600">{b.uncategorized} to categorise</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cash trend + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Cash Balance Trend" subtitle="Month-end balances across bank and cash accounts" />
          <LineChart labels={MONTHS} series={[{ name: "Cash balance", color: "#2563eb", values: cashTrend }]} height={230} />
        </Card>
        <Card className="p-6">
          <CardHeader title="Recent Transactions" />
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{fmtDate(t.date)} · {t.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${t.in ? "text-green-600" : "text-red-600"}`}>{t.in ? "+" : "-"}{money(t.amount, 2)}</p>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <TransactionModal kind="income" open={modal === "income"} onClose={() => setModal(null)} />
      <TransactionModal kind="expense" open={modal === "expense"} onClose={() => setModal(null)} />
      <JournalModal open={modal === "journal"} onClose={() => setModal(null)} />
      <AccountModal open={modal === "account"} onClose={() => setModal(null)} />
    </div>
  );
};

export default AccountsDashboard;