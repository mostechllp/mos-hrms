// src/admin/pages/accounts/components/TransactionList.jsx
// Shared list used by ExpensesTab and IncomeTab.
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, CheckCircle2, Download, Receipt } from "lucide-react";
import { EXPENSE_STATUSES, INCOME_STATUSES } from "../../pages/accounts/accountsData";
import { saveExpense, saveIncome, deleteExpenses, deleteIncomes } from "../../store/accounts/accountsSlice";
import { TransactionModal } from "./modals";
import {
  Card, Button, IconBtn, StatusBadge, SearchBox, SelectSm, StatTile, Th, Pagination, EmptyState,
  ConfirmDialog, money, fmtDate, withTax, downloadCSV,
} from "./ui";

const CFG = {
  expense: {
    title: "Expenses", subtitle: "Money going out of your business", newLabel: "Record Expense",
    partyHead: "Vendor", partyKey: "vendor", accKey: "paidThroughId", accHead: "Paid through",
    statuses: EXPENSE_STATUSES, doneStatus: "Paid", amountCls: "text-red-600", sign: "-",
    list: "expenses", save: saveExpense, remove: deleteExpenses, file: "expenses.csv", catHead: "Category",
  },
  income: {
    title: "Income", subtitle: "Money coming into your business", newLabel: "Record Income",
    partyHead: "Source", partyKey: "source", accKey: "depositToId", accHead: "Deposited to",
    statuses: INCOME_STATUSES, doneStatus: "Received", amountCls: "text-green-600", sign: "+",
    list: "incomes", save: saveIncome, remove: deleteIncomes, file: "income.csv", catHead: "Category",
  },
};
const PER = 8;

const TransactionList = ({ kind }) => {
  const C = CFG[kind];
  const dispatch = useDispatch();
  const state = useSelector((s) => s.accounts);
  const items = state[C.list];
  const nameOf = (id) => state.accounts.find((a) => a.id === id)?.name || "—";

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState([]);
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState(null); // array of ids

  const totalOf = (list) => list.reduce((s, i) => s + withTax(i.amount, i.taxRate), 0);
  const categories = [...new Set(items.map((i) => i.categoryId))];

  const filtered = useMemo(
    () =>
      items
        .filter((i) => status === "All" || i.status === status)
        .filter((i) => cat === "All" || i.categoryId === cat)
        .filter((i) => `${i[C.partyKey]} ${i.reference} ${nameOf(i.categoryId)}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, status, cat, q]
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const rows = filtered.slice((page - 1) * PER, page * PER);
  const allOnPage = rows.length > 0 && rows.every((r) => sel.includes(r.id));

  const pick = (fn) => (v) => { fn(v); setPage(1); };
  const open = (initial = null) => setModal({ open: true, initial });

  const exportCsv = () =>
    downloadCSV(C.file, [
      ["Date", "Reference", C.partyHead, C.catHead, C.accHead, "Amount", "Tax %", "Total", "Status"],
      ...filtered.map((i) => [i.date, i.reference, i[C.partyKey], nameOf(i.categoryId), nameOf(i[C.accKey]), i.amount, i.taxRate, withTax(i.amount, i.taxRate).toFixed(2), i.status]),
    ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{C.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{C.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv}><Download size={14} /> Export</Button>
          <Button onClick={() => open()}><Plus size={14} /> {C.newLabel}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="All" value={money(totalOf(items))} sub={`${items.length} records`} active={status === "All"} onClick={() => pick(setStatus)("All")} />
        {C.statuses.map((s) => {
          const list = items.filter((i) => i.status === s);
          return (
            <StatTile key={s} label={s} value={money(totalOf(list))} sub={`${list.length} records`}
              active={status === s} onClick={() => pick(setStatus)(s)}
              tone={s === "Overdue" ? "text-red-600" : s === C.doneStatus ? C.amountCls : "text-amber-600"} />
          );
        })}
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <SearchBox value={q} onChange={pick(setQ)} placeholder={`Search ${C.partyHead.toLowerCase()}, ref…`} />
            <SelectSm value={cat} onChange={(e) => pick(setCat)(e.target.value)}>
              <option value="All">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{nameOf(c)}</option>)}
            </SelectSm>
          </div>
          {sel.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{sel.length} selected</span>
              <Button variant="danger" onClick={() => setConfirm(sel)}><Trash2 size={13} /> Delete</Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 w-8">
                  <input type="checkbox" checked={allOnPage} className="rounded border-gray-300"
                    onChange={() => setSel(allOnPage ? sel.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...sel, ...rows.map((r) => r.id)])])} />
                </th>
                <Th>Date</Th><Th>Ref #</Th><Th>{C.partyHead}</Th><Th>{C.catHead}</Th><Th>{C.accHead}</Th><Th>Status</Th>
                <Th right>Amount</Th><Th right>&nbsp;</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {rows.map((i) => (
                <tr key={i.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-2.5">
                    <input type="checkbox" className="rounded border-gray-300" checked={sel.includes(i.id)}
                      onChange={() => setSel(sel.includes(i.id) ? sel.filter((x) => x !== i.id) : [...sel, i.id])} />
                  </td>
                  <td className="py-2.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{fmtDate(i.date)}</td>
                  <td className="py-2.5 text-xs font-mono text-gray-500">{i.reference}</td>
                  <td className="py-2.5 text-sm text-gray-800 dark:text-gray-200">
                    {i[C.partyKey]}
                    {i.notes && <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{i.notes}</p>}
                  </td>
                  <td className="py-2.5 text-xs text-gray-500">{nameOf(i.categoryId)}</td>
                  <td className="py-2.5 text-xs text-gray-500">{nameOf(i[C.accKey])}</td>
                  <td className="py-2.5"><StatusBadge status={i.status} /></td>
                  <td className={`py-2.5 text-sm font-semibold text-right whitespace-nowrap ${C.amountCls}`}>
                    {C.sign}{money(withTax(i.amount, i.taxRate), 2)}
                    {i.taxRate > 0 && <p className="text-[10px] font-normal text-gray-400">incl. {i.taxRate}% tax</p>}
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                      {i.status !== C.doneStatus && (
                        <IconBtn title={`Mark as ${C.doneStatus.toLowerCase()}`} onClick={() => dispatch(C.save({ ...i, status: C.doneStatus }))}>
                          <CheckCircle2 size={14} />
                        </IconBtn>
                      )}
                      <IconBtn title="Edit" onClick={() => open(i)}><Pencil size={14} /></IconBtn>
                      <IconBtn title="Delete" danger onClick={() => setConfirm([i.id])}><Trash2 size={14} /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <EmptyState icon={Receipt} title={`No ${C.title.toLowerCase()} found`} text="Try a different filter or record a new one."
              action={<Button onClick={() => open()}><Plus size={14} /> {C.newLabel}</Button>} />
          )}
        </div>

        <Pagination page={page} pages={pages} total={filtered.length} perPage={PER} onPage={setPage} />
      </Card>

      <TransactionModal kind={kind} open={modal.open} initial={modal.initial} onClose={() => setModal({ open: false, initial: null })} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`Delete ${confirm?.length > 1 ? `${confirm.length} records` : "record"}?`}
        text="This can't be undone."
        onConfirm={() => { dispatch(C.remove(confirm)); setSel((s) => s.filter((x) => !confirm.includes(x))); }}
      />
    </div>
  );
};

export default TransactionList;