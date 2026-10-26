// src/admin/pages/accounts/tabs/JournalEntries.jsx
import { Fragment, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Send, ChevronDown, ChevronRight, Eye, Copy, NotebookPen } from "lucide-react";
import { postJournal, deleteJournal, saveJournal } from "../../store/slices/accountsSlice";
import { JournalModal } from "../../components/accounts/modals";
import { Card, Button, IconBtn, StatusBadge, SearchBox, StatTile, Th, EmptyState, ConfirmDialog, money, fmtDate, uid } from "../../components/accounts/ui";

const JournalEntries = () => {
  const dispatch = useDispatch();
  const { journalEntries, accounts } = useSelector((s) => s.accounts);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState({ open: false, initial: null });
  const [toDelete, setToDelete] = useState(null);

  const nameOf = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const sum = (je) => je.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);

  const rows = useMemo(
    () =>
      journalEntries
        .filter((j) => status === "All" || j.status === status)
        .filter((j) => `${j.ref} ${j.description}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date) || b.ref.localeCompare(a.ref)),
    [journalEntries, q, status]
  );

  const count = (s) => journalEntries.filter((j) => j.status === s);
  const total = (list) => list.reduce((s, j) => s + sum(j), 0);

  const clone = (je) =>
    dispatch(saveJournal({
      ...je, id: uid("j"), status: "Draft", ref: `JE-${String(journalEntries.length + 1).padStart(4, "0")}`,
      description: `${je.description} (copy)`,
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Journal Entries</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manual adjustments with balanced debits and credits</p>
        </div>
        <Button onClick={() => setModal({ open: true, initial: null })}><Plus size={14} /> New Entry</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="All entries" value={journalEntries.length} sub={money(total(journalEntries))} active={status === "All"} onClick={() => setStatus("All")} />
        <StatTile label="Posted" value={count("Posted").length} sub={money(total(count("Posted")))} active={status === "Posted"} onClick={() => setStatus("Posted")} tone="text-green-600" />
        <StatTile label="Draft" value={count("Draft").length} sub={money(total(count("Draft")))} active={status === "Draft"} onClick={() => setStatus("Draft")} tone="text-amber-600" />
      </div>

      <Card className="p-5">
        <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Search ref or description…" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 w-6" /><Th>Date</Th><Th>Journal #</Th><Th>Description</Th><Th>Status</Th><Th right>Amount</Th><Th right>&nbsp;</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {rows.map((je) => {
                const open = expanded[je.id];
                return (
                  <Fragment key={je.id}>
                    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-2.5">
                        <button onClick={() => setExpanded((e) => ({ ...e, [je.id]: !open }))} className="text-gray-400 hover:text-gray-700">
                          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="py-2.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{fmtDate(je.date)}</td>
                      <td className="py-2.5 text-sm font-mono text-gray-500">{je.ref}</td>
                      <td className="py-2.5 text-sm text-gray-800 dark:text-gray-200">{je.description}</td>
                      <td className="py-2.5"><StatusBadge status={je.status} /></td>
                      <td className="py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">{money(sum(je), 2)}</td>
                      <td className="py-2.5">
                        <div className="flex justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                          {je.status === "Draft" ? (
                            <>
                              <IconBtn title="Post entry" onClick={() => dispatch(postJournal(je.id))}><Send size={14} /></IconBtn>
                              <IconBtn title="Edit" onClick={() => setModal({ open: true, initial: je })}><Pencil size={14} /></IconBtn>
                              <IconBtn title="Delete" danger onClick={() => setToDelete(je)}><Trash2 size={14} /></IconBtn>
                            </>
                          ) : (
                            <IconBtn title="View" onClick={() => setModal({ open: true, initial: je })}><Eye size={14} /></IconBtn>
                          )}
                          <IconBtn title="Clone as draft" onClick={() => clone(je)}><Copy size={14} /></IconBtn>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-gray-50/60 dark:bg-gray-900/30">
                        <td />
                        <td colSpan={6} className="py-3 pr-2">
                          <table className="w-full text-left">
                            <thead>
                              <tr><Th>Account</Th><Th>Note</Th><Th right>Debit</Th><Th right>Credit</Th></tr>
                            </thead>
                            <tbody>
                              {je.lines.map((l, i) => (
                                <tr key={i}>
                                  <td className={`py-1 text-xs text-gray-700 dark:text-gray-300 ${l.credit > 0 ? "pl-6" : ""}`}>{nameOf(l.accountId)}</td>
                                  <td className="py-1 text-xs text-gray-400">{l.note}</td>
                                  <td className="py-1 text-xs text-right text-gray-700 dark:text-gray-300">{l.debit > 0 ? money(l.debit, 2) : "—"}</td>
                                  <td className="py-1 text-xs text-right text-gray-700 dark:text-gray-300">{l.credit > 0 ? money(l.credit, 2) : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <EmptyState icon={NotebookPen} title="No journal entries" text="Create a manual journal to adjust balances." />}
        </div>
      </Card>

      <JournalModal open={modal.open} initial={modal.initial} onClose={() => setModal({ open: false, initial: null })} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete draft?" text={`${toDelete?.ref} will be permanently removed.`} onConfirm={() => dispatch(deleteJournal(toDelete.id))} />
    </div>
  );
};

export default JournalEntries;