// src/admin/pages/accounts/components/modals.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2 } from "lucide-react";
import {
  ACCOUNT_TYPES, ACCOUNT_SUBTYPES, TAX_RATES, EXPENSE_STATUSES, INCOME_STATUSES,
} from "../../pages/accounts/accountsData";
import { saveAccount, saveExpense, saveIncome, saveJournal } from "../../store/slices/accountsSlice";
import { Modal, Field, Button, inputCls, money, todayISO, uid, withTax } from "./ui";

/* ============ Account ============ */
const BASE = { Asset: 1000, Liability: 2000, Equity: 3000, Income: 4000, Expense: 5000 };
const nextCode = (type, accounts) => {
  const codes = accounts.filter((a) => a.type === type).map((a) => Number(a.code));
  return String(codes.length ? Math.max(...codes) + 10 : BASE[type]);
};

const AccountForm = ({ onClose, initial }) => {
  const dispatch = useDispatch();
  const accounts = useSelector((s) => s.accounts.accounts);
  const editing = !!initial;
  const [f, setF] = useState(
    initial
      ? { ...initial }
      : { type: "Asset", subType: "Cash", code: nextCode("Asset", accounts), name: "", description: "", balance: "0", active: true }
  );
  const [err, setErr] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const changeType = (type) =>
    setF((p) => ({ ...p, type, subType: ACCOUNT_SUBTYPES[type][0], code: editing ? p.code : nextCode(type, accounts) }));

  const submit = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Account name is required";
    if (!String(f.code).trim()) e.code = "Account code is required";
    else if (accounts.some((a) => a.code === String(f.code).trim() && a.id !== f.id)) e.code = "This code is already in use";
    setErr(e);
    if (Object.keys(e).length) return;
    dispatch(saveAccount({
      ...f,
      id: f.id || `a${String(f.code).trim()}_${uid("n")}`,
      code: String(f.code).trim(),
      name: f.name.trim(),
      balance: Number(f.balance) || 0,
    }));
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Edit Account" : "New Account"}
      subtitle="Accounts are used to categorise every transaction"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create account"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Account type" required>
          <select className={inputCls} value={f.type} onChange={(e) => changeType(e.target.value)}>
            {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Sub type" required>
          <select className={inputCls} value={f.subType} onChange={(e) => set("subType", e.target.value)}>
            {ACCOUNT_SUBTYPES[f.type].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Account code" required error={err.code}>
          <input className={`${inputCls} font-mono`} value={f.code} onChange={(e) => set("code", e.target.value)} />
        </Field>
        <Field label={editing ? "Current balance" : "Opening balance"} hint={editing ? "Changes only through journal entries" : undefined}>
          <input type="number" className={inputCls} value={f.balance} disabled={editing} onChange={(e) => set("balance", e.target.value)} />
        </Field>
        <Field label="Account name" required error={err.name} className="col-span-2">
          <input className={inputCls} value={f.name} placeholder="e.g. Bank - Savings" onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Description" className="col-span-2">
          <textarea rows={2} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <label className="col-span-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="rounded border-gray-300" />
          Account is active
        </label>
      </div>
    </Modal>
  );
};
export const AccountModal = (p) => (p.open ? <AccountForm {...p} /> : null);

/* ============ Expense / Income ============ */
const KINDS = {
  expense: {
    title: "Expense", party: "Vendor", partyKey: "vendor", catLabel: "Expense account", catType: "Expense",
    accLabel: "Paid through", accKey: "paidThroughId", statuses: EXPENSE_STATUSES, ref: "EXP-", save: saveExpense, listKey: "expenses",
    total: "text-red-600",
  },
  income: {
    title: "Income", party: "Customer / source", partyKey: "source", catLabel: "Income account", catType: "Income",
    accLabel: "Deposit to", accKey: "depositToId", statuses: INCOME_STATUSES, ref: "INV-", save: saveIncome, listKey: "incomes",
    total: "text-green-600",
  },
};

const TxnForm = ({ kind, onClose, initial }) => {
  const K = KINDS[kind];
  const dispatch = useDispatch();
  const { accounts, ...rest } = useSelector((s) => s.accounts);
  const count = rest[K.listKey].length;
  const editing = !!initial;
  const catOptions = accounts.filter((a) => a.type === K.catType && a.active);
  const bankOptions = accounts.filter((a) => ["Cash", "Bank"].includes(a.subType) && a.active);

  const [f, setF] = useState(
    initial
      ? { ...initial, amount: String(initial.amount) }
      : {
          date: todayISO(), [K.partyKey]: "", categoryId: catOptions[0]?.id || "", [K.accKey]: bankOptions[0]?.id || "",
          amount: "", taxRate: 0, status: K.statuses[1], reference: `${K.ref}${1050 + count}`, notes: "",
        }
  );
  const [err, setErr] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const total = withTax(f.amount, f.taxRate);

  const submit = () => {
    const e = {};
    if (!String(f[K.partyKey]).trim()) e[K.partyKey] = `${K.party} is required`;
    if (!(Number(f.amount) > 0)) e.amount = "Enter an amount greater than 0";
    if (!f.date) e.date = "Date is required";
    setErr(e);
    if (Object.keys(e).length) return;
    dispatch(K.save({ ...f, id: f.id || uid(kind[0]), amount: Number(f.amount), taxRate: Number(f.taxRate) }));
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${editing ? "Edit" : "Record"} ${K.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save changes" : `Record ${K.title.toLowerCase()}`}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Date" required error={err.date}>
          <input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Reference #">
          <input className={`${inputCls} font-mono`} value={f.reference} onChange={(e) => set("reference", e.target.value)} />
        </Field>
        <Field label={K.party} required error={err[K.partyKey]} className="sm:col-span-2">
          <input className={inputCls} value={f[K.partyKey]} onChange={(e) => set(K.partyKey, e.target.value)} />
        </Field>
        <Field label={K.catLabel} required>
          <select className={inputCls} value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            {catOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label={K.accLabel} required>
          <select className={inputCls} value={f[K.accKey]} onChange={(e) => set(K.accKey, e.target.value)}>
            {bankOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Amount (before tax)" required error={err.amount}>
          <input type="number" min="0" step="0.01" className={inputCls} value={f.amount} onChange={(e) => set("amount", e.target.value)} />
        </Field>
        <Field label="Tax">
          <select className={inputCls} value={f.taxRate} onChange={(e) => set("taxRate", e.target.value)}>
            {TAX_RATES.map((t) => <option key={t} value={t}>{t === 0 ? "No tax" : `${t}%`}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <div className="flex gap-1.5">
            {K.statuses.map((s) => (
              <button key={s} type="button" onClick={() => set("status", s)}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  f.status === s ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex items-end justify-between sm:justify-end gap-3 pb-2">
          <span className="text-xs text-gray-500">Total incl. tax</span>
          <span className={`text-lg font-bold ${K.total}`}>{money(total, 2)}</span>
        </div>
        <Field label="Notes" className="sm:col-span-2">
          <textarea rows={2} className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
};
export const TransactionModal = (p) => (p.open ? <TxnForm {...p} /> : null);

/* ============ Journal ============ */
const emptyLine = () => ({ accountId: "", debit: "", credit: "", note: "" });

const JournalForm = ({ onClose, initial }) => {
  const dispatch = useDispatch();
  const { accounts, journalEntries } = useSelector((s) => s.accounts);
  const ro = initial?.status === "Posted";
  const [f, setF] = useState(
    initial
      ? { ...initial, lines: initial.lines.map((l) => ({ ...l, debit: l.debit || "", credit: l.credit || "" })) }
      : {
          date: todayISO(), ref: `JE-${String(journalEntries.length + 1).padStart(4, "0")}`, description: "", status: "Draft",
          lines: [emptyLine(), emptyLine()],
        }
  );
  const [err, setErr] = useState([]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setLine = (i, k, v) =>
    setF((p) => ({
      ...p,
      lines: p.lines.map((l, x) => (x === i ? { ...l, [k]: v, ...(k === "debit" && v ? { credit: "" } : {}), ...(k === "credit" && v ? { debit: "" } : {}) } : l)),
    }));

  const dr = f.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const cr = f.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const diff = +(dr - cr).toFixed(2);

  const submit = (status) => {
    const e = [];
    if (!f.description.trim()) e.push("Add a description");
    if (f.lines.some((l) => !l.accountId)) e.push("Choose an account on every line");
    if (dr <= 0) e.push("Enter at least one debit and one credit amount");
    if (diff !== 0) e.push("Total debits must equal total credits");
    setErr(e);
    if (e.length) return;
    dispatch(saveJournal({
      ...f, id: f.id || uid("j"), status,
      lines: f.lines.map((l) => ({ ...l, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })),
    }));
    onClose();
  };

  const grouped = ACCOUNT_TYPES.map((t) => [t, accounts.filter((a) => a.type === t && a.active)]);

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={ro ? `Journal ${f.ref}` : initial ? `Edit ${f.ref}` : "New Journal Entry"}
      subtitle={ro ? "Posted entries can't be edited" : "Every debit needs a matching credit"}
      footer={
        ro ? (
          <Button variant="secondary" onClick={onClose}>Close</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="secondary" onClick={() => submit("Draft")}>Save as draft</Button>
            <Button onClick={() => submit("Posted")}>Save &amp; post</Button>
          </>
        )
      }
    >
      <fieldset disabled={ro} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Date" required>
            <input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Journal #">
            <input className={`${inputCls} font-mono`} value={f.ref} onChange={(e) => set("ref", e.target.value)} />
          </Field>
          <Field label="Description" required>
            <input className={inputCls} value={f.description} placeholder="What is this entry for?" onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-[10px] font-bold text-gray-500 uppercase w-[34%]">Account</th>
                <th className="pb-2 text-[10px] font-bold text-gray-500 uppercase">Note</th>
                <th className="pb-2 text-[10px] font-bold text-gray-500 uppercase w-28 text-right">Debit</th>
                <th className="pb-2 text-[10px] font-bold text-gray-500 uppercase w-28 text-right">Credit</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {f.lines.map((l, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1.5 pr-2">
                    <select className={inputCls} value={l.accountId} onChange={(e) => setLine(i, "accountId", e.target.value)}>
                      <option value="">Select account</option>
                      {grouped.map(([t, list]) => (
                        <optgroup key={t} label={t}>
                          {list.map((a) => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input className={inputCls} value={l.note} onChange={(e) => setLine(i, "note", e.target.value)} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" min="0" className={`${inputCls} text-right`} value={l.debit} onChange={(e) => setLine(i, "debit", e.target.value)} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" min="0" className={`${inputCls} text-right`} value={l.credit} onChange={(e) => setLine(i, "credit", e.target.value)} />
                  </td>
                  <td className="py-1.5">
                    {!ro && f.lines.length > 2 && (
                      <button onClick={() => setF((p) => ({ ...p, lines: p.lines.filter((_, x) => x !== i) }))}
                        className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                <td colSpan={2} className="pt-3">
                  {!ro && (
                    <button onClick={() => setF((p) => ({ ...p, lines: [...p.lines, emptyLine()] }))}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Plus size={13} /> Add line
                    </button>
                  )}
                </td>
                <td className="pt-3 pr-2 text-sm font-bold text-right text-gray-900 dark:text-white">{money(dr, 2)}</td>
                <td className="pt-3 pr-2 text-sm font-bold text-right text-gray-900 dark:text-white">{money(cr, 2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs ${diff === 0 && dr > 0 ? "text-green-600" : "text-amber-600"}`}>
            {diff === 0 && dr > 0 ? "Balanced - ready to post" : `Out of balance by ${money(Math.abs(diff), 2)}`}
          </span>
        </div>
        {err.length > 0 && (
          <ul className="text-xs text-red-500 space-y-0.5 list-disc pl-4">{err.map((m) => <li key={m}>{m}</li>)}</ul>
        )}
      </fieldset>
    </Modal>
  );
};
export const JournalModal = (p) => (p.open ? <JournalForm {...p} /> : null);