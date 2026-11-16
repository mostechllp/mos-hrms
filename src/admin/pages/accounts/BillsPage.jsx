// src/admin/pages/accounts/BillsPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteBill } from "../../store/slices/accounts/billsSlice";
import {
  Plus, MoreHorizontal, Search, Filter,
  Edit2, X, Printer, CheckCircle2, Sparkles,
  ArrowUpDown, Eye, Trash2, FileText, Download, Upload, Settings,
  Receipt,
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
    Draft:  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    Open:   "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    Paid:   "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    Closed: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
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

const BillsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bills = useSelector((state) => state?.bills?.bills || []);

  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredBills = bills.filter(
    (b) =>
      b.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.billNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteBill(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteError(null);
      if (selectedBill?.id === idToDelete) setSelectedBill(null);
    } catch (err) {
      console.error("Failed to delete bill:", err);
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete bill. Please try again.");
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const total = bills.length;
  const drafts = bills.filter((b) => b.status === "Draft").length;
  const open = bills.filter((b) => b.status === "Open").length;
  const paid = bills.filter((b) => b.status === "Paid").length;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Bills" value={total} icon="fas fa-file-invoice" color="green" />
        <MiniStat label="Drafts" value={drafts} icon="fas fa-pen-to-square" color="amber" />
        <MiniStat label="Open" value={open} icon="fas fa-folder-open" color="blue" />
        <MiniStat label="Paid" value={paid} icon="fas fa-check-circle" color="green" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Bills
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No bills recorded yet"
              : `${total} ${total === 1 ? "bill" : "bills"} recorded`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn title="Filter" className="!px-2">
            <Filter size={15} />
          </GhostBtn>
          <GhostBtn title="Print" className="!px-2">
            <Printer size={15} />
          </GhostBtn>

          <button
            onClick={() => navigate("/admin/accounts/purchases/bills/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Bill
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
                <MenuItem icon={ArrowUpDown} label="Sort by" />
                <MenuItem icon={Download} label="Import" />
                <MenuItem icon={Upload} label="Export" />
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
                <MenuItem icon={Settings} label="Preferences" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {total === 0 ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/purchases/bills/new")} />
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
                placeholder="Search bills…"
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
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        Bill # <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Vendor
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Due date
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
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No bills match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr
                        key={bill.id}
                        onClick={() => setSelectedBill(bill)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        <td
                          className="px-3 md:px-4 py-2 md:py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                            aria-label={`Select ${bill.billNumber}`}
                          />
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBill(bill);
                            }}
                            className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                          >
                            {bill.billNumber}
                          </button>
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {bill.vendor}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {bill.date}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {bill.dueDate}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          ₹{bill.total.toFixed(2)}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <StatusPill status={bill.status} />
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
                              onClick={() => setSelectedBill(bill)}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/purchases/bills/edit/${bill.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(bill)}
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
      {selectedBill && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedBill(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[65%] lg:w-[60%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Bill
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate">
                    {selectedBill.billNumber || selectedBill.vendor}
                  </h2>
                  <StatusPill status={selectedBill.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
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
                    navigate(`/admin/accounts/purchases/bills/edit/${selectedBill.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Printer} label="PDF / Print" />
                <GhostAction icon={CheckCircle2} label="Convert to open" />
                <GhostAction icon={CheckCircle2} label="Record payment" />
              </div>

              {/* Draft banner */}
              {selectedBill.status === "Draft" && (
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
                        Bill has been created. Convert to open to record a payment.
                      </p>
                      <button className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 text-[11.5px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors">
                        <CheckCircle2 size={12} /> Convert to open
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              <BillPreview bill={selectedBill} />

              {/* Journal */}
              <Card className="p-4">
                <SectionLabel>Journal</SectionLabel>
                <p className="text-xs md:text-[12.5px] text-gray-500 leading-relaxed">
                  Journal entries will not be available for bills in the{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedBill.status}
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
        title="Delete bill"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting bill, please wait…"
            : `Are you sure you want to delete bill ${deleteTarget?.billNumber || ""}? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

/* ---------- sub-components ---------- */

const MiniStat = ({ label, value, icon, color }) => {
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
      <div className={`text-xl md:text-2xl font-bold ${fg}`}>{value}</div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText, label: "Purchase items" },
    { icon: FileText, label: "Record bill" },
    { icon: CheckCircle2, label: "Record payment", tone: "pos" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Receipt size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Pay bills on time
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          If you've purchased something and don't have to pay immediately, record
          it as a bill.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create a bill
        </button>
      </div>

      <div className="mt-12 max-w-2xl mx-auto">
        <SectionLabel>Lifecycle of a bill</SectionLabel>
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

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Create bills and record payments",
          "Apply credits to bills",
          "Make online payments",
          "Allocate landed costs",
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
    accent:
      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
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

const BillPreview = ({ bill }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-3xl relative text-gray-800 dark:text-gray-200 shadow-soft">
    {bill.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full">
        Draft
      </div>
    )}

    <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-gray-800 dark:text-gray-100">Fidha</p>
        <p className="text-gray-500">Kerala</p>
        <p className="text-gray-500">India</p>
        <p className="text-gray-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          Bill
        </h1>
        <p className="text-[11px] text-gray-500 mt-1">#{bill.billNumber}</p>
        <div className="mt-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Balance due
          </p>
          <p className="text-base font-semibold text-gray-800 dark:text-gray-50 tabular-nums">
            ₹{bill.balanceDue.toFixed(2)}
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-[11.5px] mb-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Bill from
        </p>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {bill.vendor}
        </p>
      </div>
      <div className="text-right space-y-0.5 text-gray-500">
        <p>
          Bill date{" "}
          <span className="text-gray-800 dark:text-gray-100 ml-1">{bill.date}</span>
        </p>
        <p>
          Due date{" "}
          <span className="text-gray-800 dark:text-gray-100 ml-1">
            {bill.dueDate}
          </span>
        </p>
        <p>
          Terms{" "}
          <span className="text-gray-800 dark:text-gray-100 ml-1">
            {bill.paymentTerms}
          </span>
        </p>
      </div>
    </div>

    <table className="w-full border-collapse text-[11.5px] mb-4">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
          <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2 w-6">
            #
          </th>
          <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Item
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Qty
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Rate
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {bill.items?.map((item, idx) => (
          <tr
            key={item.id ?? idx}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <td className="py-2 px-2 text-gray-400 tabular-nums">{idx + 1}</td>
            <td className="py-2 px-2">
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {item.name}
              </p>
              {item.description && (
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {item.description}
                </p>
              )}
            </td>
            <td className="py-2 px-2 text-right tabular-nums">
              {Number(item.quantity).toFixed(2)}
            </td>
            <td className="py-2 px-2 text-right tabular-nums">
              {Number(item.rate).toFixed(2)}
            </td>
            <td className="py-2 px-2 text-right tabular-nums">
              {Number(item.amount).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-64 text-[11.5px]">
        <div className="flex justify-between py-1 text-gray-500">
          <span>Subtotal</span>
          <span className="text-gray-800 dark:text-gray-100 tabular-nums">
            {Number(bill.subTotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-100">
          <span>Total</span>
          <span className="tabular-nums">₹{Number(bill.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 rounded mt-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">Balance due</span>
          <span className="font-semibold tabular-nums">
            ₹{Number(bill.balanceDue).toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    <div className="mt-10 flex justify-end text-[10.5px] text-gray-500">
      <div className="text-center">
        <div className="w-40 h-px bg-gray-300 dark:bg-gray-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
      </div>
    </div>
  </div>
);

export default BillsPage;