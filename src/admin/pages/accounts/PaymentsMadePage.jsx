import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePayment, markPaymentAsPaid } from "../../store/slices/accounts/paymentsMadeSlice";
import {
  Plus, MoreHorizontal, ChevronDown, FileText, Edit2, Trash2, X,
  Printer, CheckCircle2, Sparkles, Search, Filter, Eye, Upload, Settings,
  Banknote,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <Icon size={14} className="text-slate-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default: "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`p-1.5 rounded-md transition-colors ${tones[tone]}`}>
      <Icon size={15} />
    </button>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    Paid:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
  >
    <Icon size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const PaymentsMadePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const payments = useSelector((s) => s.paymentsMade.payments) || [];

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      (p.vendor && p.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.paymentNumber && p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deletePayment(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedPayment?.id === idToDelete) setSelectedPayment(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete.");
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleMarkAsPaid = async (id) => {
    setIsMarkingPaid(true);
    try {
      await dispatch(markPaymentAsPaid(id)).unwrap();
      if (selectedPayment && selectedPayment.id === id) {
        setSelectedPayment((prev) => ({ ...prev, status: "Paid" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Payments made
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {payments.length === 0
                ? "No payments made yet"
                : `${payments.length} ${payments.length === 1 ? "payment" : "payments"} recorded`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/payments-made/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={Filter}   label="Filter" />
                  <MenuItem icon={Upload}   label="Import" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Settings} label="Preferences" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {payments.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/purchases/payments-made/new")} />
        ) : (

          /* ---- Table surface ---- */
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label="Select all" />

              <div className="relative ml-auto w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payments…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                    <th className="px-4 py-2.5 text-left font-medium">Payment #</th>
                    <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                    <th className="px-4 py-2.5 text-left font-medium">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium">Mode</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No payments match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${payment.paymentNumber}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {payment.paymentNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{payment.vendor}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{payment.date}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{payment.paymentMode}</td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{Number(payment.amount).toFixed(2)}
                      </td>

                      <td className="px-4 py-3"><StatusPill status={payment.status} /></td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => setSelectedPayment(payment)} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/payments-made/edit/${payment.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(payment)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>

      {/* ---- Drawer ---- */}
      {selectedPayment && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedPayment(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[55%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Payment made</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                    {selectedPayment.paymentNumber}
                  </h2>
                  <StatusPill status={selectedPayment.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">

              {/* Action row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/accounts/purchases/payments-made/edit/${selectedPayment.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Printer} label="PDF / Print" />
                {selectedPayment.status !== "Paid" && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedPayment.id)}
                    disabled={isMarkingPaid}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} /> {isMarkingPaid ? "Marking…" : "Mark as paid"}
                  </button>
                )}
              </div>

              {/* What's next */}
              {selectedPayment.status !== "Paid" && (
                <Surface className="p-4 bg-blue-50/60 dark:bg-blue-900/10 !border-blue-100 dark:!border-blue-900/40">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-blue-900 dark:text-blue-200">What's next?</p>
                      <p className="text-[12px] text-blue-700 dark:text-blue-300 mt-0.5">
                        Mark the payment as paid to confirm it has been sent.
                      </p>
                      <button
                        onClick={() => handleMarkAsPaid(selectedPayment.id)}
                        disabled={isMarkingPaid}
                        className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 text-[11.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} /> {isMarkingPaid ? "Processing…" : "Mark as paid"}
                      </button>
                    </div>
                  </div>
                </Surface>
              )}

              <PaymentReceipt payment={selectedPayment} />

              {/* Journal */}
              <Surface className="p-4">
                <SectionLabel>Journal</SectionLabel>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Journal entries will not be available for payments in the <span className="font-medium text-slate-700 dark:text-slate-300">{selectedPayment.status}</span> state.
                </p>
              </Surface>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete payment"
        message={
          deleteError
            ? deleteError
            : isDeleting
              ? "Deleting payment, please wait…"
              : `Are you sure you want to delete payment #${deleteTarget?.paymentNumber}? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

/* ---------- sub-components ---------- */

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText,     label: "Bills" },
    { icon: CheckCircle2, label: "ACH" },
    { icon: CheckCircle2, label: "Check" },
    { icon: CheckCircle2, label: "Manual", tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Banknote size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          You haven't made any payments yet
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Receipts of your bill payments will show up here.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Go to unpaid bills
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Payment lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-10 max-w-md mx-auto space-y-2">
        {[
          "Record payments made to vendors",
          "View receipts of paid bills",
          "Record payments manually",
          "Send payment receipts to vendors",
        ].map((b) => (
          <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800",
    pos:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

const PaymentReceipt = ({ payment }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-8 mx-auto max-w-2xl relative text-slate-800 dark:text-slate-200">
    {payment.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 rounded">
        Draft
      </div>
    )}

    <div className="text-[11.5px] space-y-0.5 mb-6">
      <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
      <p className="text-slate-500">Keralam</p>
      <p className="text-slate-500">India</p>
      <p className="text-slate-500">fidh3549@gmail.com</p>
    </div>

    <div className="text-center mb-6">
      <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Payments made</h1>
      <div className="mt-2 mx-auto w-16 h-px bg-slate-200 dark:bg-slate-800"></div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="col-span-2 space-y-2 text-[11.5px]">
        <ReceiptRow label="Payment #"       value={payment.paymentNumber} />
        <ReceiptRow label="Payment date"    value={payment.date} />
        {payment.reference && <ReceiptRow label="Reference" value={payment.reference} />}
        <ReceiptRow label="Paid to"         value={payment.vendor} />
        <ReceiptRow label="Payment mode"    value={payment.paymentMode} />
        <ReceiptRow label="Paid through"    value={payment.paidThrough} />
      </div>
      <div className="bg-emerald-600 text-white rounded-md px-3 py-3 flex flex-col justify-center text-center">
        <p className="text-[9.5px] uppercase tracking-wider opacity-90 mb-0.5">Amount paid</p>
        <p className="text-lg font-semibold tabular-nums">₹{Number(payment.amount).toFixed(2)}</p>
      </div>
    </div>

    <div className="mb-6">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount in words</p>
      <p className="text-[11.5px] italic text-slate-700 dark:text-slate-300">
        Indian Rupee Three Thousand Three Hundred Thirty-Four Only
      </p>
    </div>

    <div className="mb-6">
      <SectionLabel>Applied bills</SectionLabel>
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800">
              <th className="text-left  font-medium py-2">Bill #</th>
              <th className="text-left  font-medium py-2">Bill date</th>
              <th className="text-right font-medium py-2">Bill amount</th>
              <th className="text-right font-medium py-2">Applied</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payment.appliedBills?.length ? payment.appliedBills.map((bill, idx) => (
              <tr key={idx}>
                <td className="py-2 text-blue-600 dark:text-blue-400 font-medium">{bill.billNumber}</td>
                <td className="py-2 text-slate-600 dark:text-slate-300">{bill.billDate}</td>
                <td className="py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">₹{Number(bill.billAmount).toFixed(2)}</td>
                <td className="py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">₹{Number(bill.paymentAmount).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[12px] text-slate-400">No bills applied to this payment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ReceiptRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100">{value || "—"}</span>
  </div>
);

export default PaymentsMadePage;