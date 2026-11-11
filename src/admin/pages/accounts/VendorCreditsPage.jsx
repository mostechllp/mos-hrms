import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteVendorCredit } from "../../store/slices/accounts/vendorCreditsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, Edit2, Trash2, X, FileText, Eye,
  Search, Filter, ArrowUpDown, RefreshCw, ShieldCheck, Box,
  CheckCircle2, Printer, Sparkles, Receipt,
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
    Open:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Draft:  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Closed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
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

const VendorCreditsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vendorCredits = useSelector((s) => s.vendorCredits.vendorCredits) || [];

  const [selectedCredit, setSelectedCredit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredCredits = vendorCredits.filter(
    (c) =>
      c.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creditNoteNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteVendorCredit(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedCredit?.id === idToDelete) setSelectedCredit(null);
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

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Vendor credits
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {vendorCredits.length === 0
                ? "No vendor credits yet"
                : `${vendorCredits.length} ${vendorCredits.length === 1 ? "credit" : "credits"} recorded`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/vendor-credits/new")}
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
                  <MenuItem icon={ArrowUpDown} label="Sort by" />
                  <MenuItem icon={ArrowUpDown} label="Import" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={RefreshCw}   label="Refresh list" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {vendorCredits.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/purchases/vendor-credits/new")} />
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
                  placeholder="Search credits…"
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
                    <th className="px-4 py-2.5 text-left font-medium">
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        Credit note # <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                    <th className="px-4 py-2.5 text-left font-medium">Date</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCredits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No credits match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredCredits.map((credit) => (
                    <tr
                      key={credit.id}
                      onClick={() => setSelectedCredit(credit)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${credit.creditNoteNumber}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {credit.creditNoteNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{credit.vendor}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{credit.date}</td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{Number(credit.total).toFixed(2)}
                      </td>

                      <td className="px-4 py-3"><StatusPill status={credit.status} /></td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => setSelectedCredit(credit)} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/vendor-credits/edit/${credit.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(credit)} />
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
      {selectedCredit && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedCredit(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[55%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Vendor credit</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                    {selectedCredit.creditNoteNumber}
                  </h2>
                  <StatusPill status={selectedCredit.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedCredit(null)}
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
                  onClick={() => navigate(`/admin/accounts/purchases/vendor-credits/edit/${selectedCredit.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Printer}  label="PDF / Print" />
                <GhostAction icon={FileText} label="Apply to bills" />
              </div>

              {/* What's next */}
              {selectedCredit.status === "Draft" && (
                <Surface className="p-4 bg-blue-50/60 dark:bg-blue-900/10 !border-blue-100 dark:!border-blue-900/40">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-blue-900 dark:text-blue-200">What's next?</p>
                      <p className="text-[12px] text-blue-700 dark:text-blue-300 mt-0.5">
                        Mark this credit as open to apply it to future bills or record a refund.
                      </p>
                      <button className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 text-[11.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                        <CheckCircle2 size={12} /> Mark as open
                      </button>
                    </div>
                  </div>
                </Surface>
              )}

              <CreditPreview credit={selectedCredit} />

              {/* Journal */}
              <Surface className="p-4">
                <SectionLabel>Journal</SectionLabel>
                <p className="text-[12.5px] text-slate-500 leading-relaxed">
                  Journal entries will not be available for vendor credits in the <span className="font-medium text-slate-700 dark:text-slate-300">{selectedCredit.status}</span> state.
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
        title="Delete vendor credit"
        message={
          deleteError
            ? deleteError
            : isDeleting
              ? "Deleting vendor credit, please wait…"
              : `Are you sure you want to delete credit note #${deleteTarget?.creditNoteNumber}? This action cannot be undone.`
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
    { icon: Box,          label: "Product returned" },
    { icon: FileText,     label: "Credit note received", tone: "accent" },
    { icon: ShieldCheck,  label: "Record credit",        tone: "accent" },
    { icon: CheckCircle2, label: "Apply / refund",       tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Receipt size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          You deserve some credit too
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Record vendor credits and apply them to bills when buying from a vendor.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Create vendor credit
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Record credits when you receive a credit note",
          "Apply vendor credits to future bill payments",
          "Record refunds for your vendor credits",
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
    accent:  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

const CreditPreview = ({ credit }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-8 mx-auto max-w-3xl relative text-slate-800 dark:text-slate-200">
    {credit.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 rounded">
        Draft
      </div>
    )}

    <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
        <p className="text-slate-500">Keralam</p>
        <p className="text-slate-500">India</p>
        <p className="text-slate-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Vendor credit</h1>
        <p className="text-[11px] text-slate-500 mt-1">#{credit.creditNoteNumber}</p>
        <div className="mt-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits remaining</p>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-50 tabular-nums">₹{Number(credit.total).toFixed(2)}</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-[11.5px] mb-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vendor</p>
        <p className="font-medium text-slate-900 dark:text-slate-100">{credit.vendor}</p>
      </div>
      <div className="text-right space-y-0.5 text-slate-500">
        <p>Date <span className="text-slate-900 dark:text-slate-100 ml-1">{credit.date}</span></p>
      </div>
    </div>

    <table className="w-full text-[11.5px] mb-4">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800">
          <th className="text-left  font-medium py-2 w-6">#</th>
          <th className="text-left  font-medium py-2">Item</th>
          <th className="text-right font-medium py-2">Qty</th>
          <th className="text-right font-medium py-2">Rate</th>
          <th className="text-right font-medium py-2">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {credit.items?.map((item, idx) => (
          <tr key={item.id ?? idx}>
            <td className="py-2 text-slate-400 tabular-nums">{idx + 1}</td>
            <td className="py-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              {item.description && <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>}
            </td>
            <td className="py-2 text-right tabular-nums">{Number(item.quantity).toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{Number(item.rate).toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{Number(item.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-64 text-[11.5px]">
        <div className="flex justify-between py-1 text-slate-500">
          <span>Subtotal</span>
          <span className="text-slate-900 dark:text-slate-100 tabular-nums">{Number(credit.subTotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
          <span>Total</span>
          <span className="tabular-nums">₹{Number(credit.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1.5 bg-slate-50 dark:bg-slate-950/40 px-2 rounded mt-1 text-slate-700 dark:text-slate-300">
          <span className="font-medium">Credits remaining</span>
          <span className="font-semibold tabular-nums">₹{Number(credit.total).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-10 flex justify-end text-[10.5px] text-slate-500">
      <div className="text-center">
        <div className="w-40 h-px bg-slate-300 dark:bg-slate-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
      </div>
    </div>
  </div>
);

export default VendorCreditsPage;