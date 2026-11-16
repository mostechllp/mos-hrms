// src/admin/pages/accounts/PaymentsMadePage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePayment, markPaymentAsPaid } from "../../store/slices/accounts/paymentsMadeSlice";
import {
  Plus, MoreHorizontal, FileText, Edit2, Trash2, X,
  Printer, CheckCircle2, Sparkles, Search, Filter, Eye, Upload, Settings,
  Banknote,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
    <Icon size={14} className="text-gray-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    primary:
      "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    warning:
      "text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg transition-colors ${tones[tone]}`}
    >
      <Icon size={14} />
    </button>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    Paid:  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    Draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };
  return (
    <span
      className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-semibold whitespace-nowrap capitalize ${styles[status] || styles.Draft}`}
    >
      {status}
    </span>
  );
};

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMoreMenu(false);
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

  const total = payments.length;
  const paid = payments.filter((p) => p.status === "Paid").length;
  const drafts = payments.filter((p) => p.status === "Draft").length;
  const totalAmount = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Payments" value={total} icon="fas fa-receipt" color="green" />
        <MiniStat label="Paid" value={paid} icon="fas fa-check-circle" color="blue" />
        <MiniStat label="Drafts" value={drafts} icon="fas fa-pen-to-square" color="amber" />
        <MiniStat
          label="Total Paid"
          value={`₹${totalAmount.toFixed(2)}`}
          icon="fas fa-indian-rupee-sign"
          color="green"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Payments Made
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No payments made yet"
              : `${total} ${total === 1 ? "payment" : "payments"} recorded`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/admin/accounts/purchases/payments-made/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Payment
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden">
                <MenuItem icon={Filter} label="Filter" />
                <MenuItem icon={Upload} label="Import" />
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
                <MenuItem icon={Settings} label="Preferences" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {total === 0 ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/purchases/payments-made/new")} />
      ) : (
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <GhostBtn title="Filter" className="!px-2">
              <Filter size={15} />
            </GhostBtn>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
              aria-label="Select all"
            />

            <div className="relative ml-auto w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search payments…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Payment #
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Vendor
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Mode
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No payments match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        <td
                          className="px-3 md:px-4 py-2 md:py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                            aria-label={`Select ${payment.paymentNumber}`}
                          />
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                            }}
                            className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                          >
                            {payment.paymentNumber}
                          </button>
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {payment.vendor}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {payment.date}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {payment.paymentMode}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          ₹{Number(payment.amount).toFixed(2)}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <StatusPill status={payment.status} />
                        </td>

                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <IconAction
                              icon={Eye}
                              label="View"
                              tone="primary"
                              onClick={() => setSelectedPayment(payment)}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/purchases/payments-made/edit/${payment.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(payment)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ---- Drawer ---- */}
      {selectedPayment && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedPayment(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[55%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Payment made
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate">
                    {selectedPayment.paymentNumber}
                  </h2>
                  <StatusPill status={selectedPayment.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    navigate(`/admin/accounts/purchases/payments-made/edit/${selectedPayment.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Printer} label="PDF / Print" />
                {selectedPayment.status !== "Paid" && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedPayment.id)}
                    disabled={isMarkingPaid}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} />{" "}
                    {isMarkingPaid ? "Marking…" : "Mark as paid"}
                  </button>
                )}
              </div>

              {/* Draft banner */}
              {selectedPayment.status !== "Paid" && (
                <Card className="p-4 bg-green-50 dark:bg-green-900/20 !border-green-200/80 dark:!border-green-800/60">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      size={14}
                      className="text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100">
                        What's next?
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                        Mark the payment as paid to confirm it has been sent.
                      </p>
                      <button
                        onClick={() => handleMarkAsPaid(selectedPayment.id)}
                        disabled={isMarkingPaid}
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 text-[11.5px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} />{" "}
                        {isMarkingPaid ? "Processing…" : "Mark as paid"}
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              <PaymentReceipt payment={selectedPayment} />

              {/* Journal */}
              <Card className="p-4">
                <SectionLabel>Journal</SectionLabel>
                <p className="text-xs md:text-[12.5px] text-gray-500 leading-relaxed">
                  Journal entries will not be available for payments in the{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedPayment.status}
                  </span>{" "}
                  state.
                </p>
              </Card>
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

const MiniStat = ({ label, value, icon, color, isMoney }) => {
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
        <div
          className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}
        >
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
      </div>
      <div
        className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText, label: "Bills" },
    { icon: CheckCircle2, label: "ACH" },
    { icon: CheckCircle2, label: "Check" },
    { icon: CheckCircle2, label: "Manual", tone: "pos" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Banknote size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          You haven't made any payments yet
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Receipts of your bill payments will show up here.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Go to unpaid bills
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Payment lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && (
                <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
              )}
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
          <div
            key={b}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    pos: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium ${tones[tone || "default"]}`}
    >
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

const PaymentReceipt = ({ payment }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-2xl relative text-gray-800 dark:text-gray-200 shadow-soft">
    {payment.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full">
        Draft
      </div>
    )}

    <div className="text-[11.5px] space-y-0.5 mb-6">
      <p className="font-semibold text-gray-800 dark:text-gray-100">Fidha</p>
      <p className="text-gray-500">Keralam</p>
      <p className="text-gray-500">India</p>
      <p className="text-gray-500">fidh3549@gmail.com</p>
    </div>

    <div className="text-center mb-6">
      <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100">
        Payments made
      </h1>
      <div className="mt-2 mx-auto w-16 h-px bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="col-span-2 space-y-2 text-[11.5px]">
        <ReceiptRow label="Payment #" value={payment.paymentNumber} />
        <ReceiptRow label="Payment date" value={payment.date} />
        {payment.reference && <ReceiptRow label="Reference" value={payment.reference} />}
        <ReceiptRow label="Paid to" value={payment.vendor} />
        <ReceiptRow label="Payment mode" value={payment.paymentMode} />
        <ReceiptRow label="Paid through" value={payment.paidThrough} />
      </div>
      <div className="bg-green-500 text-white rounded-xl px-3 py-3 flex flex-col justify-center text-center">
        <p className="text-[9.5px] uppercase tracking-wider opacity-90 mb-0.5">
          Amount paid
        </p>
        <p className="text-lg font-bold tabular-nums">
          ₹{Number(payment.amount).toFixed(2)}
        </p>
      </div>
    </div>

    <div className="mb-6">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Amount in words
      </p>
      <p className="text-[11.5px] italic text-gray-700 dark:text-gray-300">
        Indian Rupee Three Thousand Three Hundred Thirty-Four Only
      </p>
    </div>

    <div className="mb-6">
      <SectionLabel>Applied bills</SectionLabel>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
              <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
                Bill #
              </th>
              <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
                Bill date
              </th>
              <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
                Bill amount
              </th>
              <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
                Applied
              </th>
            </tr>
          </thead>
          <tbody>
            {payment.appliedBills?.length ? (
              payment.appliedBills.map((bill, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-2 px-2 text-green-600 dark:text-green-400 font-medium">
                    {bill.billNumber}
                  </td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-300">
                    {bill.billDate}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    ₹{Number(bill.billAmount).toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    ₹{Number(bill.paymentAmount).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-[12px] text-gray-400"
                >
                  No bills applied to this payment.
                </td>
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
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 dark:text-gray-100">{value || "—"}</span>
  </div>
);

export default PaymentsMadePage;