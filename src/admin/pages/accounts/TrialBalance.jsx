// src/admin/pages/accounts/tabs/TrialBalance.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { Download, Printer, CheckCircle2, AlertTriangle } from "lucide-react";
import { ACCOUNT_TYPES, isDebitNormal } from "./accountsData";
import { Card, Button, Th, money, downloadCSV, todayISO, inputCls } from "../../components/accounts/ui";

const TrialBalance = () => {
  const { accounts } = useSelector((s) => s.accounts);
  const [asOf, setAsOf] = useState(todayISO());
  const [hideZero, setHideZero] = useState(true);

  const rows = accounts
    .filter((a) => !hideZero || a.balance !== 0)
    .map((a) => {
      const d = isDebitNormal(a.type);
      return { ...a, debit: d ? a.balance : 0, credit: d ? 0 : a.balance };
    });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Trial Balance</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            As of {new Date(`${asOf}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className={`${inputCls} !w-auto !py-1.5 !text-xs`} />
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)} />
            Hide zero balances
          </label>
          <Button variant="secondary" onClick={() => window.print()}><Printer size={14} /> Print</Button>
          <Button variant="secondary" onClick={() => downloadCSV("trial-balance.csv", [["Code", "Account", "Type", "Debit", "Credit"], ...rows.map((r) => [r.code, r.name, r.type, r.debit, r.credit]), ["", "Total", "", totalDebit, totalCredit]])}>
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <Th>Code</Th><Th>Account</Th><Th right>Debit</Th><Th right>Credit</Th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_TYPES.map((t) => {
                const list = rows.filter((r) => r.type === t);
                if (!list.length) return null;
                return (
                  <FragmentGroup key={t} type={t} list={list} />
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                <td colSpan={2} className="pt-3 text-sm font-bold text-gray-900 dark:text-white">Total</td>
                <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white text-right">{money(totalDebit, 2)}</td>
                <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white text-right">{money(totalCredit, 2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={`mt-4 flex items-center gap-2 text-xs ${balanced ? "text-green-600" : "text-red-600"}`}>
          {balanced ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span className="font-semibold">{balanced ? "Balanced" : "Unbalanced"}</span>
          <span className="text-gray-500 dark:text-gray-400">
            {balanced ? "Debits equal credits" : `Difference of ${money(Math.abs(totalDebit - totalCredit), 2)}`}
          </span>
        </div>
      </Card>
    </div>
  );
};

const FragmentGroup = ({ type, list }) => (
  <>
    <tr>
      <td colSpan={4} className="pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">{type}</td>
    </tr>
    {list.map((r) => (
      <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
        <td className="py-2 text-xs font-mono text-gray-400 w-20">{r.code}</td>
        <td className="py-2 text-sm text-gray-800 dark:text-gray-200">{r.name}</td>
        <td className="py-2 text-sm text-gray-700 dark:text-gray-300 text-right">{r.debit > 0 ? money(r.debit, 2) : "—"}</td>
        <td className="py-2 text-sm text-gray-700 dark:text-gray-300 text-right">{r.credit > 0 ? money(r.credit, 2) : "—"}</td>
      </tr>
    ))}
  </>
);

export default TrialBalance;