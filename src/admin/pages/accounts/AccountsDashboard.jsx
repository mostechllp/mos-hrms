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

  // Mock data for the new layout blocks
  const mockInvoices = { paid: 13625000, outstanding: 1250000, dueSoon: 350000, overdue: 900000 };
  const mockBills = { paid: 6812500, outstanding: 965000, dueSoon: 455000, overdue: 510000 };
  const mockReceivablesAging = [
    { label: "Over 90 days", value: 100000, color: "#f59e0b" },
    { label: "60 to 90 days", value: 125000, color: "#f97316" },
    { label: "30 to 60 days", value: 300000, color: "#ef4444" },
    { label: "1 to 30 days", value: 375000, color: "#e11d48" },
    { label: "Due today", value: 350000, color: "#9f1239" },
  ];

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

      {/* ========================================================= */}
      {/* ---- REDESIGNED SECTION STARTS HERE ---- */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
        {/* Invoices */}
        <Card className="p-4 md:p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Invoices</h3>
            <PillSelect value="Last year" onChange={() => {}} options={["Last year", "This year"]} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1baf7a]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Paid</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockInvoices.paid)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#e34948]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Outstanding</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockInvoices.outstanding)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#eda100]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Due Soon</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockInvoices.dueSoon)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#2a78d6]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Overdue</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockInvoices.overdue)}</span>
               </div>
            </div>
            <div className="shrink-0">
              <DonutChart
                data={[
                  { label: "Paid", value: mockInvoices.paid, color: "#1baf7a" },
                  { label: "Outstanding", value: mockInvoices.outstanding, color: "#e34948" },
                  { label: "Due Soon", value: mockInvoices.dueSoon, color: "#eda100" },
                  { label: "Overdue", value: mockInvoices.overdue, color: "#2a78d6" },
                ]}
                centerTop={money(mockInvoices.paid + mockInvoices.outstanding + mockInvoices.dueSoon + mockInvoices.overdue)}
                centerBottom="Total"
                size={140}
                thickness={18}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button className="flex-1 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">Create Invoices</button>
            <button className="flex-1 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">View Invoices</button>
          </div>
        </Card>

        {/* Account Receivable */}
        <Card className="p-4 md:p-5 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Account Receivable</h3>
              <p className="text-xs text-gray-500 mt-0.5">Total <span className="font-semibold text-gray-800 dark:text-gray-200">$ 1,250,000</span></p>
            </div>
            <button className="text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">View All</button>
          </div>
          <div className="space-y-3 flex-1 justify-center flex flex-col">
            {mockReceivablesAging.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-gray-500 w-20 shrink-0">{item.label}</span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm" style={{ width: `${(item.value / 400000) * 100}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-200 w-20 text-right">$ {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bills */}
        <Card className="p-4 md:p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Bills</h3>
            <PillSelect value="Last year" onChange={() => {}} options={["Last year", "This year"]} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#eda100]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Paid</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockBills.paid)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#2a78d6]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Outstanding</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockBills.outstanding)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#e34948]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Due Soon</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockBills.dueSoon)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1baf7a]"></span><span className="text-xs font-medium text-gray-600 dark:text-gray-300">Overdue</span></div>
                  <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(mockBills.overdue)}</span>
               </div>
            </div>
            <div className="shrink-0">
              <DonutChart
                data={[
                  { label: "Paid", value: mockBills.paid, color: "#eda100" },
                  { label: "Outstanding", value: mockBills.outstanding, color: "#2a78d6" },
                  { label: "Due Soon", value: mockBills.dueSoon, color: "#e34948" },
                  { label: "Overdue", value: mockBills.overdue, color: "#1baf7a" },
                ]}
                centerTop={money(mockBills.paid + mockBills.outstanding + mockBills.dueSoon + mockBills.overdue)}
                centerBottom="Total"
                size={140}
                thickness={18}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button className="flex-1 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">Create Bills</button>
            <button className="flex-1 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">View Bills</button>
          </div>
        </Card>

        {/* Bank Accounts */}
        <Card className="p-4 md:p-5 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Bank Accounts</h3>
            <PillSelect value="SrvKuber Bank" onChange={() => {}} options={["SrvKuber Bank", "Other Bank"]} />
          </div>
          <div className="flex-1 flex flex-col">
             <p className="text-xs text-right text-gray-500 mb-2">Statement Balance <span className="font-bold text-gray-800 dark:text-gray-200">$ 17,512,500</span></p>
             <div className="flex-1 min-h-[160px]">
                <LineChart
                  labels={["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]}
                  series={[{ name: "Balance", color: "#2a78d6", values: [9000000, 10000000, 11500000, 11800000, 13000000, 13500000] }]}
                  height={180}
                />
             </div>
          </div>
        </Card>

        {/* Net Cashflow */}
        <Card className="p-4 md:p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Net Cashflow</h3>
              <p className="text-xs text-gray-500 mt-0.5">Total <span className="font-semibold text-gray-800 dark:text-gray-200">$ 6,812,502</span></p>
            </div>
            <PillSelect value="Last 6 months" onChange={() => {}} options={["Last 6 months", "This year"]} />
          </div>
          <div className="flex-1 min-h-[180px]">
            <BarChart
              labels={["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]}
              height={180}
              series={[
                { name: "Inflow", color: "#1baf7a", values: [1500000, 2200000, 1800000, 2100000, 1900000, 2500000] },
                { name: "Outflow", color: "#eda100", values: [900000, 1000000, 1100000, 950000, 1200000, 1150000] },
              ]}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
             <div className="flex gap-4 text-xs font-medium">
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1baf7a]"></span>Inflow</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#eda100]"></span>Outflow</span>
             </div>
             <button className="text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">View Reports</button>
          </div>
        </Card>

        {/* Profit & Loss */}
        <Card className="p-4 md:p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Profit & Loss</h3>
              <p className="text-xs text-gray-500 mt-0.5">Total <span className="font-semibold text-gray-800 dark:text-gray-200">$ 4,768,751</span></p>
            </div>
            <PillSelect value="Last 6 months" onChange={() => {}} options={["Last 6 months", "This year"]} />
          </div>
          <div className="flex-1 min-h-[180px]">
            <BarChart
              labels={["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]}
              height={180}
              series={[
                { name: "Inflow", color: "#2a78d6", values: [1200000, 1500000, 1400000, 1700000, 1600000, 2100000] },
                { name: "Expense", color: "#eda100", values: [800000, 900000, 950000, 1100000, 1050000, 1200000] },
              ]}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
             <div className="flex gap-4 text-xs font-medium">
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2a78d6]"></span>Inflow</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#eda100]"></span>Expense</span>
             </div>
             <button className="text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">View Reports</button>
          </div>
        </Card>
      </div>

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

export default AccountsDashboard;