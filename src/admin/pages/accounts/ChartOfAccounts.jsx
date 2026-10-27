// src/admin/pages/accounts/tabs/ChartOfAccounts.jsx
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Download, Power, BookOpen } from "lucide-react";
import { ACCOUNT_TYPES } from "./accountsData";
import { saveAccount, deleteAccount } from "../../store/slices/accountsSlice";
import { AccountModal } from "../../components/accounts/modals";
import { Card, Button, IconBtn, Badge, SearchBox, EmptyState, ConfirmDialog, money, downloadCSV } from "../../components/accounts/ui";

const TYPE_DOT = { Asset: "bg-blue-500", Liability: "bg-amber-500", Equity: "bg-indigo-500", Income: "bg-green-500", Expense: "bg-red-500" };

const ChartOfAccounts = () => {
  const dispatch = useDispatch();
  const { accounts } = useSelector((s) => s.accounts);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [showInactive, setShowInactive] = useState(true);
  const [collapsed, setCollapsed] = useState({});
  const [modal, setModal] = useState({ open: false, initial: null });
  const [toDelete, setToDelete] = useState(null);

  const visible = useMemo(
    () =>
      accounts
        .filter((a) => (showInactive ? true : a.active))
        .filter((a) => type === "All" || a.type === type)
        .filter((a) => `${a.code} ${a.name} ${a.subType}`.toLowerCase().includes(q.toLowerCase())),
    [accounts, q, type, showInactive]
  );

  const grouped = ACCOUNT_TYPES.map((t) => [t, visible.filter((a) => a.type === t)]).filter(([, l]) => l.length);
  const open = (initial = null) => setModal({ open: true, initial });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Chart of Accounts</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{accounts.length} accounts across {ACCOUNT_TYPES.length} types</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => downloadCSV("chart-of-accounts.csv", [["Code", "Name", "Type", "Sub type", "Balance", "Active"], ...accounts.map((a) => [a.code, a.name, a.type, a.subType, a.balance, a.active])])}>
            <Download size={14} /> Export
          </Button>
          <Button onClick={() => open()}><Plus size={14} /> New Account</Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-1.5">
            {["All", ...ACCOUNT_TYPES].map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  type === t ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer whitespace-nowrap">
              <input type="checkbox" className="rounded border-gray-300" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
              Show inactive
            </label>
            <SearchBox value={q} onChange={setQ} placeholder="Search code or name…" />
          </div>
        </div>

        {grouped.length === 0 && <EmptyState icon={BookOpen} title="No accounts match" text="Adjust the filters or create a new account." />}

        <div className="space-y-5">
          {grouped.map(([t, list]) => {
            const total = list.reduce((s, a) => s + a.balance, 0);
            const isOpen = !collapsed[t];
            return (
              <div key={t}>
                <button onClick={() => setCollapsed((c) => ({ ...c, [t]: isOpen }))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/40 mb-1">
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className={`w-2 h-2 rounded-full ${TYPE_DOT[t]}`} />
                    {t} <span className="font-normal normal-case text-gray-400">({list.length})</span>
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{money(total)}</span>
                </button>

                {isOpen && (
                  <div className="space-y-0.5">
                    {list.map((a) => (
                      <div key={a.id} className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${a.active ? "" : "opacity-60"}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono text-gray-400 w-14 shrink-0">{a.code}</span>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{a.name}</p>
                            {a.description && <p className="text-[11px] text-gray-400 truncate">{a.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden md:block"><Badge tone="gray">{a.subType}</Badge></span>
                          {!a.active && <Badge tone="gray">Inactive</Badge>}
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-24 text-right">{money(a.balance, 2)}</span>
                          <div className="flex opacity-60 group-hover:opacity-100 transition-opacity">
                            <IconBtn title="Edit" onClick={() => open(a)}><Pencil size={14} /></IconBtn>
                            <IconBtn title={a.active ? "Mark inactive" : "Mark active"} onClick={() => dispatch(saveAccount({ ...a, active: !a.active }))}><Power size={14} /></IconBtn>
                            <IconBtn title={a.balance !== 0 ? "Accounts with a balance can't be deleted" : "Delete"} danger disabled={a.balance !== 0} onClick={() => setToDelete(a)}>
                              <Trash2 size={14} />
                            </IconBtn>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <AccountModal open={modal.open} initial={modal.initial} onClose={() => setModal({ open: false, initial: null })} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete account?" text={`"${toDelete?.name}" will be removed from your chart of accounts.`} onConfirm={() => dispatch(deleteAccount(toDelete.id))} />
    </div>
  );
};

export default ChartOfAccounts;