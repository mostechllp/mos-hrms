// src/admin/pages/accounts/tabs/GeneralLedger.jsx
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, Printer, FileText } from "lucide-react";
import { ACCOUNT_TYPES, isDebitNormal } from "./accountsData";
import { LineChart } from "../../components/accounts/charts";
import {
  Card,
  Button,
  StatTile,
  Th,
  EmptyState,
  inputCls,
  money,
  fmtDate,
  downloadCSV,
} from "../../components/accounts/ui";
import SearchableSelect from "../../../components/common/SearchableSelect"; // 👈 add import

const GeneralLedger = () => {
  const { accounts, ledger } = useSelector((s) => s.accounts);
  const withRows = new Set(ledger.map((l) => l.accountId));
  const [accountId, setAccountId] = useState("a1010");
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-10-31");

  // 👇 Build searchable options grouped by account type
  const accountOptions = useMemo(
    () =>
      ACCOUNT_TYPES.flatMap((type) =>
        accounts
          .filter((a) => a.type === type)
          .map((a) => ({
            value: a.id,
            label: `${type} · ${a.code} ${a.name}${
              withRows.has(a.id) ? "" : " (no activity)"
            }`,
          }))
      ),
    [accounts, withRows]
  );

  const acc = accounts.find((a) => a.id === accountId);
  const debitNormal = acc ? isDebitNormal(acc.type) : true;
  const signed = (r) => (debitNormal ? r.debit - r.credit : r.credit - r.debit);

  const { rows, opening, closing, totalDr, totalCr } = useMemo(() => {
    const all = ledger
      .filter((l) => l.accountId === accountId)
      .sort((a, b) => a.date.localeCompare(b.date));
    // Opening is derived so the closing figure always agrees with the chart of accounts
    const base = (acc?.balance || 0) - all.reduce((s, r) => s + signed(r), 0);
    const before = all
      .filter((r) => r.date < from)
      .reduce((s, r) => s + signed(r), 0);
    const open = base + before;
    let run = open;
    const inRange = all
      .filter((r) => r.date >= from && r.date <= to)
      .map((r) => ({ ...r, balance: (run += signed(r)) }));
    return {
      rows: inRange,
      opening: open,
      closing: run,
      totalDr: inRange.reduce((s, r) => s + r.debit, 0),
      totalCr: inRange.reduce((s, r) => s + r.credit, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledger, accountId, from, to, acc]);

  const trend = [opening, ...rows.map((r) => r.balance)];
  const labels = ["Open", ...rows.map((r) => fmtDate(r.date).slice(0, 6))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            General Ledger
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Every transaction posted to an account, with a running balance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCSV(`ledger-${acc?.code}.csv`, [
                ["Date", "Ref", "Description", "Debit", "Credit", "Balance"],
                ["", "", "Opening balance", "", "", opening],
                ...rows.map((r) => [
                  r.date,
                  r.ref,
                  r.description,
                  r.debit,
                  r.credit,
                  r.balance,
                ]),
              ])
            }
          >
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-col lg:flex-row gap-3 lg:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            Account
          </label>
          {/* 👇 SearchableSelect replaces the native <select> */}
          <SearchableSelect
            value={accountId}
            onChange={(v) => setAccountId(v)}
            options={accountOptions}
            placeholder="Select account…"
            searchPlaceholder="Search by name or code…"
            clearable={false}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            From
          </label>
          <input
            type="date"
            className={inputCls}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            To
          </label>
          <input
            type="date"
            className={inputCls}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Opening balance" value={money(opening, 2)} />
        <StatTile
          label="Total debits"
          value={money(totalDr, 2)}
          tone="text-blue-600"
        />
        <StatTile
          label="Total credits"
          value={money(totalCr, 2)}
          tone="text-amber-600"
        />
        <StatTile label="Closing balance" value={money(closing, 2)} />
      </div>

      {rows.length > 1 && (
        <Card className="p-5">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            Balance movement
          </h4>
          <LineChart
            labels={labels}
            series={[
              {
                name: "Balance",
                color: "#2563eb",
                values: trend.map((v) => Math.max(v, 0)),
              },
            ]}
            height={200}
          />
        </Card>
      )}

      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <Th>Date</Th>
                <Th>Ref #</Th>
                <Th>Description</Th>
                <Th right>Debit</Th>
                <Th right>Credit</Th>
                <Th right>Balance</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              <tr className="bg-gray-50/70 dark:bg-gray-900/30">
                <td className="py-2 text-sm text-gray-500 whitespace-nowrap">
                  {fmtDate(from)}
                </td>
                <td />
                <td className="py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Opening balance
                </td>
                <td />
                <td />
                <td className="py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                  {money(opening, 2)}
                </td>
              </tr>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {fmtDate(r.date)}
                  </td>
                  <td className="py-2 text-xs font-mono text-gray-500">
                    {r.ref}
                  </td>
                  <td className="py-2 text-sm text-gray-800 dark:text-gray-200">
                    {r.description}
                  </td>
                  <td className="py-2 text-sm text-gray-700 dark:text-gray-300 text-right">
                    {r.debit > 0 ? money(r.debit, 2) : "—"}
                  </td>
                  <td className="py-2 text-sm text-gray-700 dark:text-gray-300 text-right">
                    {r.credit > 0 ? money(r.credit, 2) : "—"}
                  </td>
                  <td className="py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {money(r.balance, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td
                    colSpan={3}
                    className="pt-3 text-sm font-bold text-gray-900 dark:text-white"
                  >
                    Totals / closing balance
                  </td>
                  <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                    {money(totalDr, 2)}
                  </td>
                  <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                    {money(totalCr, 2)}
                  </td>
                  <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                    {money(closing, 2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          {rows.length === 0 && (
            <EmptyState
              icon={FileText}
              title={`No transactions for ${acc?.name || "this account"}`}
              text="Pick another account or widen the date range."
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default GeneralLedger;