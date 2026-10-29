import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Plus, ChevronDown, RefreshCw, Play, Video, 
  Settings, Calendar, ArrowRight, 
  TrendingUp, TrendingDown, FileText, Wallet, 
  Landmark, AlertCircle, ChevronRight, Download
} from "lucide-react";
import { MONTHS } from "./accountsData";
import { LineChart, BarChart, DonutChart, HBars } from "../../components/accounts/charts";
import { AccountModal, TransactionModal, JournalModal } from "../../components/accounts/modals";
import { Card, CardHeader, Button, SelectSm, money, fmtDate } from "../../components/accounts/ui";

const PALETTE = ["#2563eb", "#f59e0b", "#16a34a", "#8b5cf6", "#ef4444", "#14b8a6", "#6b7280"];
const AGE_COLORS = ["#16a34a", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

// --- MOCK DATA FOR VISUALIZATION (Fallback if Redux is empty) ---
const MOCK_MONTHLY = {
  income: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 81000, 78000, 85000],
  expenses: [32000, 35000, 31000, 38000, 34000, 41000, 39000, 42000, 40000, 45000, 43000, 46000]
};
const MOCK_CASH_TREND = [15000, 17000, 16000, 23000, 21000, 26000, 33000, 26000, 35000, 36000, 35000, 39000];

const AccountsDashboard = () => {
  const reduxData = useSelector((s) => s.accounts);
  
  // Use Redux data if available, otherwise use mock data for visualization
  const accounts = reduxData?.accounts || [];
  const expenses = reduxData?.expenses || [];
  const incomes = reduxData?.incomes || [];
  const metrics = reduxData?.metrics || { deltas: { receivables: 12, payables: -5 }, spark: { receivables: [1,2,3,4,5], payables: [5,4,3,2,1] } };
  const monthly = reduxData?.monthly || MOCK_MONTHLY;
  const cashTrend = reduxData?.cashTrend || MOCK_CASH_TREND;
  const bankAccounts = reduxData?.bankAccounts || [];
  const agingReceivables = reduxData?.agingReceivables || { buckets: ["Current", "1-30", "31-60", "61-90", "90+"], rows: [{ values: [15000, 2000, 1000, 0, 0] }] };
  const agingPayables = reduxData?.agingPayables || { buckets: ["Current", "1-30", "31-60", "61-90", "90+"], rows: [{ values: [8000, 1500, 0, 0, 0] }] };

  // Local state for display
  const [modal, setModal] = useState(null);
  const [dateRange, setDateRange] = useState("This Fiscal Year");
  
  // Hardcoded totals for the Zoho-style top cards
  const totalReceivables = 18500; 
  const totalPayables = 9500;
  const currentReceivable = 15000;
  const overdueReceivable = 3500;
  const currentPayable = 8000;
  const overduePayable = 1500;

  // Chart Data Prep
  const labels = MONTHS.slice(-12);
  const inc = monthly.income.slice(-12) || [];
  const exp = monthly.expenses.slice(-12) || [];
  const totalInc = inc.reduce((a, b) => a + b, 0);
  const totalExp = exp.reduce((a, b) => a + b, 0);

  const expenseSlices = useMemo(() => {
    const list = accounts.filter((a) => a.type === "Expense" && a.balance > 0).sort((a, b) => b.balance - a.balance);
    if (list.length === 0) {
        // Mock expense breakdown for visualization
        return [
            { label: "Payroll", value: 25000, color: PALETTE[0] },
            { label: "Rent", value: 8000, color: PALETTE[1] },
            { label: "Software", value: 5000, color: PALETTE[2] },
            { label: "Marketing", value: 4000, color: PALETTE[3] },
        ];
    }
    return list.map((a, i) => ({ label: a.name, value: a.balance, color: PALETTE[Math.min(i, PALETTE.length - 1)] }));
  }, [accounts]);
  
  const expTotal = expenseSlices.reduce((s, d) => s + d.value, 0);

  const bucketTotals = (ag) => ag.buckets.map((b, i) => ({ label: b, value: ag.rows.reduce((t, r) => t + r.values[i], 0), color: AGE_COLORS[i] }));
  const arBuckets = bucketTotals(agingReceivables);
  const apBuckets = bucketTotals(agingPayables);

  return (
    <div className="space-y-4 bg-gray-50/50 dark:bg-gray-900/20 min-h-screen pb-10">
      
      {/* 1. WELCOME HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold text-lg">
            F
          </div>
          <div>
            <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
              Hello, <span className="font-semibold">Fidha Fathima</span>
            </h1>
            <p className="text-xs text-gray-500">Fidha</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 hidden sm:block">
          <p>Zoho Books India Helpline: <span className="font-semibold text-gray-700 dark:text-gray-300">18003093036</span></p>
          <p>Mon - Fri | 9:30 AM - 7:00 PM | Toll Free</p>
        </div>
      </div>

      {/* 2. TOP TABS & ACTIONS */}
      <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 w-full md:w-auto">
          <button className="pb-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Dashboard</button>
        </div>
        
        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
           <Button onClick={() => setModal("income")} className="whitespace-nowrap bg-blue-600 hover:bg-blue-700">
             <Plus size={14} /> New
           </Button>
           <Button variant="secondary" className="whitespace-nowrap bg-white dark:bg-gray-800"><RefreshCw size={14} /> Refresh</Button>
           <Button variant="secondary" className="whitespace-nowrap bg-white dark:bg-gray-800"><Play size={14} /> Run Auto-Scan</Button>
           <Button variant="secondary" className="whitespace-nowrap bg-white dark:bg-gray-800"><Video size={14} /> Live Webinar</Button>
           <Button variant="secondary" className="whitespace-nowrap bg-white dark:bg-gray-800"><Settings size={14} /> Configure</Button>
        </div>
      </div>

      <div className="px-6 space-y-5">
        
        {/* 3. RECEIVABLES & PAYABLES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Receivables */}
          <Card className="p-0 border-t-4 border-t-blue-500 shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Total Receivables</h3>
              <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus size={12}/> New</button>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Unpaid Invoices</p>
                  <p className="text-3xl font-light text-gray-900 dark:text-white">{money(totalReceivables)}</p>
                </div>
                <div className="flex gap-4 text-sm text-right">
                  <div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Current</p>
                    <p className="font-semibold">{money(currentReceivable)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Overdue</p>
                    <p className="font-semibold text-orange-600">{money(overdueReceivable)}</p>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 flex overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${(currentReceivable/totalReceivables)*100}%` }}></div>
                <div className="bg-orange-500 h-full" style={{ width: `${(overdueReceivable/totalReceivables)*100}%` }}></div>
              </div>
            </div>
          </Card>

          {/* Payables */}
          <Card className="p-0 border-t-4 border-t-orange-500 shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Total Payables</h3>
              <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus size={12}/> New</button>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Unpaid Bills</p>
                  <p className="text-3xl font-light text-gray-900 dark:text-white">{money(totalPayables)}</p>
                </div>
                <div className="flex gap-4 text-sm text-right">
                  <div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Current</p>
                    <p className="font-semibold">{money(currentPayable)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Overdue</p>
                    <p className="font-semibold text-orange-600">{money(overduePayable)}</p>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 flex overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${(currentPayable/totalPayables)*100}%` }}></div>
                <div className="bg-orange-500 h-full" style={{ width: `${(overduePayable/totalPayables)*100}%` }}></div>
              </div>
            </div>
          </Card>
        </div>

        {/* 4. CASH FLOW CHART */}
        <Card className="p-0 shadow-sm">
          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Cash Flow</h3>
            <SelectSm value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-none bg-transparent font-medium">
              <option>This Fiscal Year</option>
              <option>Last Fiscal Year</option>
            </SelectSm>
          </div>
          <div className="p-5 flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <LineChart labels={labels} series={[{ name: "Cash Flow", color: "#2563eb", values: cashTrend }]} height={280} />
            </div>
            <div className="w-full lg:w-64 space-y-4 pt-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Incoming</span>
                    <span className="text-sm font-semibold text-green-600">{money(totalInc)} (+)</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Outgoing</span>
                    <span className="text-sm font-semibold text-red-600">{money(totalExp)} (-)</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cash as on 31/03/2026</span>
                    <span className="text-sm font-bold text-blue-600">{money(totalInc - totalExp)} (=)</span>
                </div>
            </div>
          </div>
        </Card>

        {/* 5. INCOME/EXPENSE & TOP EXPENSES ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Income and Expense */}
          <Card className="p-0 shadow-sm">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Income and Expense</h3>
              <SelectSm value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-none bg-transparent font-medium">
                <option>This Fiscal Year</option>
              </SelectSm>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Total Income</p>
                    <p className="text-lg font-semibold">{money(totalInc)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Total Expenses</p>
                    <p className="text-lg font-semibold">{money(totalExp)}</p>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-0.5 rounded text-[10px] font-medium">
                  <button className="px-2 py-1 bg-white dark:bg-gray-600 rounded shadow-sm">Accrual</button>
                  <button className="px-2 py-1 text-gray-500">Cash</button>
                </div>
              </div>
              <BarChart labels={labels} series={[{ name: "Income", color: "#16a34a", values: inc }, { name: "Expenses", color: "#f59e0b", values: exp }]} height={240} />
              <p className="text-[10px] text-gray-400 mt-2 text-center">* Income and expense values displayed are exclusive of taxes.</p>
            </div>
          </Card>

          {/* Top Expenses */}
          <Card className="p-0 shadow-sm">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Top Expenses</h3>
              <SelectSm value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-none bg-transparent font-medium">
                <option>This Fiscal Year</option>
              </SelectSm>
            </div>
            <div className="p-5 flex flex-col items-center justify-center min-h-[300px]">
              {expenseSlices.length > 0 ? (
                <div className="w-full flex flex-col items-center gap-6">
                  <DonutChart data={expenseSlices} centerTop={money(expTotal)} centerBottom="Total expenses" size={200} thickness={25} />
                  <div className="w-full grid grid-cols-2 gap-3">
                    {expenseSlices.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="truncate">{d.label}</span>
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{((d.value / expTotal) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No Expense recorded for this fiscal year</p>
              )}
            </div>
          </Card>
        </div>

        {/* 6. PROJECTS & BANK/CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-0 shadow-sm min-h-[200px] flex flex-col">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Projects</h3>
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
              <button className="text-sm text-blue-600 font-medium hover:underline">Add Project(s) to this watchlist</button>
            </div>
          </Card>

          <Card className="p-0 shadow-sm min-h-[200px] flex flex-col">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Bank and Credit Cards</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-xs text-gray-500 mb-2">Yet to add Bank and Credit Card details</p>
              <button className="text-sm text-blue-600 font-medium hover:underline">Add Bank Account</button>
            </div>
          </Card>
        </div>

        {/* 7. ACCOUNT WATCHLIST */}
        <Card className="p-0 shadow-sm min-h-[250px]">
          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Account Watchlist</h3>
            <SelectSm className="border-none bg-transparent font-medium text-xs">
                <option>Accrual</option>
            </SelectSm>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium text-right">Debit</th>
                  <th className="px-4 py-3 font-medium text-right">Credit</th>
                  <th className="px-4 py-3 font-medium text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {/* Mock Rows for visual */}
                {[
                  { name: "Sales", debit: "0.00", credit: "45,000.00", net: "45,000.00" },
                  { name: "Cost of Goods Sold", debit: "12,500.00", credit: "0.00", net: "-12,500.00" },
                  { name: "Rent Expense", debit: "5,000.00", credit: "0.00", net: "-5,000.00" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{row.debit}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{row.credit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default AccountsDashboard;