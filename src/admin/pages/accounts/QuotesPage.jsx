// src/admin/pages/accounts/QuotesPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateQuoteStatus, deleteQuote } from "../../store/slices/accounts/quotesSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, CheckCircle2,
  Eye, Edit2, Trash2, X, Mail, FileText, ArrowRight,
  FileEdit, Send, Sparkles, Receipt,
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
    Draft:    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    Sent:     "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    Accepted: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    Declined: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    Expired:  "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    <span
      className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-semibold whitespace-nowrap capitalize ${styles[status] || styles.Draft}`}
    >
      {status}
    </span>
  );
};

/* ---------- page ---------- */

const QuotesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const quotes = useSelector((s) => s.quotes.quotes) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredQuotes = quotes.filter(
    (q) =>
      q.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteQuote(deleteTarget.id));
      if (selectedQuote?.id === deleteTarget.id) setSelectedQuote(null);
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = (status) => {
    if (selectedQuote) {
      dispatch(updateQuoteStatus({ id: selectedQuote.id, status }));
      setSelectedQuote({ ...selectedQuote, status });
    }
  };

  // stats
  const total = quotes.length;
  const accepted = quotes.filter((q) => q.status === "Accepted").length;
  const pending = quotes.filter((q) => q.status === "Sent").length;
  const drafts = quotes.filter((q) => q.status === "Draft").length;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Quotes" value={total} icon="fas fa-file-invoice" color="green" />
        <MiniStat label="Sent" value={pending} icon="fas fa-paper-plane" color="blue" />
        <MiniStat label="Accepted" value={accepted} icon="fas fa-check-circle" color="green" />
        <MiniStat label="Drafts" value={drafts} icon="fas fa-pen-to-square" color="amber" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Quotes
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No quotes yet"
              : `${total} ${total === 1 ? "quote" : "quotes"} issued`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/admin/accounts/sales/quotes/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Quote
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
        <EmptyState onCreate={() => navigate("/admin/accounts/sales/quotes/new")} />
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
                placeholder="Search quotes…"
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
                        Quote # <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Customer
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Expiry
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
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No quotes match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((quote) => (
                      <tr
                        key={quote.id}
                        onClick={() => setSelectedQuote(quote)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        <td
                          className="px-3 md:px-4 py-2 md:py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                            aria-label={`Select ${quote.quoteNumber}`}
                          />
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuote(quote);
                            }}
                            className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                          >
                            {quote.quoteNumber}
                          </button>
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {quote.customerName}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {quote.date}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {quote.expiryDate}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          {quote.currency} {quote.total.toFixed(2)}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <StatusPill status={quote.status} />
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
                              onClick={() => setSelectedQuote(quote)}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/sales/quotes/edit/${quote.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(quote)}
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
      {selectedQuote && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedQuote(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Quote
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate">
                    {selectedQuote.quoteNumber}
                  </h2>
                  <StatusPill status={selectedQuote.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
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
                    navigate(`/admin/accounts/sales/quotes/edit/${selectedQuote.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Mail} label="Send" />
                <GhostAction icon={FileText} label="PDF / Print" />
                <GhostAction icon={Receipt} label="Convert" />
              </div>

              {/* Draft banner */}
              {selectedQuote.status === "Draft" && (
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
                        Email this quote to your customer, or mark it as sent when
                        you've shared it manually.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <button
                          onClick={() => handleStatusChange("Sent")}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                        >
                          <Send size={12} /> Send quote
                        </button>
                        <button
                          onClick={() => handleStatusChange("Sent")}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-medium text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          Mark as sent
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Summary */}
              <Card className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums mt-0.5">
                      {selectedQuote.currency} {selectedQuote.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Quote date" value={selectedQuote.date} />
                  <DetailItem
                    label="Expiry date"
                    value={selectedQuote.expiryDate}
                  />
                </div>
              </Card>

              {/* Customer */}
              <Card className="p-4">
                <SectionLabel>Customer</SectionLabel>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                  {selectedQuote.customerName}
                </p>
                {selectedQuote.customerEmail && (
                  <div className="flex items-center gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{selectedQuote.customerEmail}</span>
                  </div>
                )}
              </Card>

              {/* Items */}
              <Card className="overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <SectionLabel>Items</SectionLabel>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs md:text-[12.5px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                        <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2 w-8">
                          #
                        </th>
                        <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                          Item
                        </th>
                        <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                          Qty
                        </th>
                        <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                          Rate
                        </th>
                        <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items?.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-3 md:px-4 py-2.5 text-gray-400 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-3 md:px-4 py-2.5">
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-[11.5px] text-gray-500 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </td>
                          <td className="px-3 md:px-4 py-2.5 text-right text-gray-600 dark:text-gray-300 tabular-nums">
                            {item.qty}
                          </td>
                          <td className="px-3 md:px-4 py-2.5 text-right text-gray-600 dark:text-gray-300 tabular-nums">
                            {item.rate.toFixed(2)}
                          </td>
                          <td className="px-3 md:px-4 py-2.5 text-right font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                            {(item.qty * item.rate).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 md:px-4 py-1.5 text-right text-[11.5px] text-gray-500"
                        >
                          Subtotal
                        </td>
                        <td className="px-3 md:px-4 py-1.5 text-right text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 tabular-nums">
                          {selectedQuote.subtotal.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 md:px-4 py-1.5 text-right text-[11.5px] text-gray-500"
                        >
                          Tax
                        </td>
                        <td className="px-3 md:px-4 py-1.5 text-right text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 tabular-nums">
                          {selectedQuote.taxTotal.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 md:px-4 py-2.5 text-right text-xs md:text-[12px] font-semibold text-gray-800 dark:text-gray-100"
                        >
                          Total
                        </td>
                        <td className="px-3 md:px-4 py-2.5 text-right text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          {selectedQuote.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Notes & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="p-4">
                  <SectionLabel>Notes</SectionLabel>
                  <p className="text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedQuote.notes || (
                      <span className="text-gray-400 dark:text-gray-600">
                        No notes provided.
                      </span>
                    )}
                  </p>
                </Card>
                <Card className="p-4">
                  <SectionLabel>Terms &amp; conditions</SectionLabel>
                  <p className="text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedQuote.terms || (
                      <span className="text-gray-400 dark:text-gray-600">
                        No terms and conditions.
                      </span>
                    )}
                  </p>
                </Card>
              </div>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete quote"
        message={`Are you sure you want to delete quote "${deleteTarget?.quoteNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
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
    { icon: FileEdit, label: "Draft a quote", tone: "default" },
    { icon: Send, label: "Send to customer", tone: "default" },
    { icon: CheckCircle2, label: "Accept", tone: "pos" },
    { icon: X, label: "Decline", tone: "neg" },
    { icon: Receipt, label: "Convert to invoice", tone: "accent" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <FileText size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Seal the deal
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          With quotes, give your customers an offer they can't refuse.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> Create quote
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Upload size={14} /> Import quotes
          </button>
        </div>
      </div>

      {/* Lifecycle */}
      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle of a quote</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && (
                <ArrowRight
                  size={12}
                  className="text-gray-300 dark:text-gray-700 shrink-0"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-10 max-w-md mx-auto">
        <div className="space-y-2">
          {[
            "Customize quotes with your own branding",
            "Convert an accepted quote into an invoice",
            "Know when a quote has been viewed, accepted, or declined",
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
      </div>
    </Card>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    pos: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    neg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    accent:
      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium ${tones[tone]}`}
    >
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

const GhostAction = ({ icon: Icon, label }) => (
  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <Icon size={13} /> {label}
  </button>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">
      {label}
    </p>
    <p className="text-xs md:text-[12.5px] font-medium text-gray-800 dark:text-gray-100">
      {value || "—"}
    </p>
  </div>
);

export default QuotesPage;