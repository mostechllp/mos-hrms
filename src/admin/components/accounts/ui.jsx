// src/admin/pages/accounts/components/ui.jsx
import { useEffect } from "react";
import { X, Search, AlertTriangle } from "lucide-react";

/* ---------- helpers ---------- */
export const money = (n, d = 0) =>
  `${n < 0 ? "-" : ""}$${Math.abs(Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;

export const fmtDate = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const withTax = (amount, rate) => (Number(amount) || 0) * (1 + (Number(rate) || 0) / 100);

export const downloadCSV = (filename, rows) => {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/* ---------- form bits ---------- */
export const inputCls =
  "w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors";

export const Field = ({ label, required, error, hint, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-[11px] text-red-500 mt-1">{error}</p>
    ) : hint ? (
      <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
    ) : null}
  </div>
);

const BTN = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 border-transparent",
  secondary:
    "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
  danger: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  success: "bg-green-600 text-white hover:bg-green-700 border-transparent",
};
export const Button = ({ variant = "primary", className = "", children, ...p }) => (
  <button
    {...p}
    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
  >
    {children}
  </button>
);

export const IconBtn = ({ title, danger, children, ...p }) => (
  <button
    {...p}
    title={title}
    className={`p-1.5 rounded-lg text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      danger
        ? "hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
        : "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
    }`}
  >
    {children}
  </button>
);

/* ---------- display ---------- */
const BADGE = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};
const STATUS_TONE = {
  Paid: "green", Received: "green", Posted: "green", Active: "green",
  Pending: "amber", Unpaid: "amber",
  Overdue: "red",
  Draft: "gray", Inactive: "gray",
};
export const Badge = ({ tone = "gray", children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${BADGE[tone]}`}>
    {children}
  </span>
);
export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] || "gray"}>{status}</Badge>;

export const Th = ({ children, right, className = "" }) => (
  <th className={`pb-2 text-[10px] font-bold text-gray-500 uppercase ${right ? "text-right" : ""} ${className}`}>
    {children}
  </th>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SearchBox = ({ value, onChange, placeholder = "Search…" }) => (
  <div className="relative">
    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-8 pr-3 py-1.5 w-full sm:w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
    />
  </div>
);

export const SelectSm = ({ className = "", ...p }) => (
  <select
    {...p}
    className={`px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 ${className}`}
  />
);

export const StatTile = ({ label, value, sub, active, onClick, tone = "text-gray-900 dark:text-white" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left bg-white dark:bg-gray-800 rounded-xl border p-4 transition-colors ${
      active ? "border-blue-500 ring-2 ring-blue-500/10" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
    } ${onClick ? "cursor-pointer" : "cursor-default"}`}
  >
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-xl font-bold mt-1 ${tone}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
  </button>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="py-12 text-center">
    {Icon && <Icon className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={28} />}
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
    {text && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Pagination = ({ page, pages, total, perPage, onPage }) =>
  total <= perPage ? null : (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </p>
      <div className="flex gap-1">
        <Button variant="secondary" disabled={page === 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="secondary" disabled={page === pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );

/* ---------- overlays ---------- */
const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export const Modal = ({ open, onClose, title, subtitle, children, footer, size = "md" }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${SIZES[size]} max-h-[calc(100vh-2rem)] flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl`}
      >
        {/* Header stays fixed */}
        <div className="shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={16} />
          </button>
        </div>

        {/* Only the body scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer stays fixed */}
        {footer && (
          <div className="shrink-0 flex justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, text, confirmLabel = "Delete" }) => (
  <Modal
    open={open}
    onClose={onClose}
    size="sm"
    title={title}
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>
    }
  >
    <div className="flex gap-3">
      <span className="p-2 rounded-lg h-fit bg-red-50 dark:bg-red-900/30 text-red-600">
        <AlertTriangle size={18} />
      </span>
      <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  </Modal>
);