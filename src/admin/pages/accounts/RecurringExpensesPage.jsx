// src/admin/pages/accounts/RecurringExpensesPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteProfile } from "../../store/slices/accounts/recurringExpensesSlice";
import {
  Plus, ArrowUpDown, Download, Upload,
  Search,
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  ArrowRight, RefreshCw, Wallet, Calendar, Receipt,
  Columns,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";

/* ---------- primitives ---------- */

const ALL_COLUMNS = [
  { id: "profileName", label: "Profile name", locked: true },
  { id: "expenseAccount", label: "Expense account" },
  { id: "repeatEvery", label: "Frequency" },
  { id: "startDate", label: "Next date" },
  { id: "amount", label: "Amount" },
  { id: "status", label: "Status" },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "date_asc", label: "Next Date (Soonest)" },
  { value: "date_desc", label: "Next Date (Latest)" },
  { value: "amount_desc", label: "Highest Amount" },
  { value: "amount_asc", label: "Lowest Amount" },
];

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
    default: "text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-700",
    danger: "text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30",
    primary: "text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30",
    warning: "text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/30",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-full transition-all duration-200 ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    Active:  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    Stopped: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    Draft:   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
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

const RecurringExpensesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profiles = useSelector((s) => s.recurringExpenses.profiles) || [];

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  // Column Customization State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );

  const toggleColumn = (id) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtering & Sorting Logic
  const processedProfiles = useMemo(() => {
    let result = profiles.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.profileName?.toLowerCase().includes(q) ||
        p.expenseAccount?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name_asc")
        return (a.profileName || "").localeCompare(b.profileName || "");
      if (sortBy === "name_desc")
        return (b.profileName || "").localeCompare(a.profileName || "");
      if (sortBy === "date_asc")
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      if (sortBy === "date_desc")
        return new Date(b.startDate || 0) - new Date(a.startDate || 0);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [profiles, searchQuery, statusFilter, sortBy]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteProfile(deleteTarget.id));
      if (selectedProfile?.id === deleteTarget.id) setSelectedProfile(null);
      setDeleteTarget(null);
    }
  };

  const total = profiles.length;
  const active = profiles.filter((p) => p.status === "Active").length;
  const stopped = profiles.filter((p) => p.status === "Stopped").length;
  const drafts = profiles.filter((p) => p.status === "Draft").length;

  const hasActiveFilters = statusFilter !== "all";

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Profiles" value={total} icon="fas fa-repeat" color="green" />
        <MiniStat label="Active" value={active} icon="fas fa-play-circle" color="blue" />
        <MiniStat label="Stopped" value={stopped} icon="fas fa-pause-circle" color="red" />
        <MiniStat label="Drafts" value={drafts} icon="fas fa-pen-to-square" color="amber" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Recurring Expenses
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No recurring profiles yet"
              : `${total} ${total === 1 ? "profile" : "profiles"} configured`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Download size={14} /> Import
          </button>
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Upload size={14} /> Export
          </button>

          <button
            onClick={() => navigate("/admin/accounts/purchases/recurring-expenses/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Profile
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {total === 0 ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/purchases/recurring-expenses/new")} />
      ) : (
        <Card className="overflow-hidden">

          {/* 🌟 UNIFIED TOOLBAR ROW 🌟 */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search profiles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Columns size={15} />
              <span className="hidden md:inline">Columns</span>
            </button>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

            {/* Inline Filters & Sort */}
            <div className="flex flex-wrap items-center gap-2 flex-1">

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Status: Any</option>
                <option value="Active">Active</option>
                <option value="Stopped">Stopped</option>
                <option value="Draft">Draft</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {visibleColumns.profileName && (
                      <th className="px-4 md:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                          Profile name <ArrowUpDown size={11} />
                        </span>
                      </th>
                    )}
                    {visibleColumns.expenseAccount && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Expense account</th>
                    )}
                    {visibleColumns.repeatEvery && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Frequency</th>
                    )}
                    {visibleColumns.startDate && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Next date</th>
                    )}
                    {visibleColumns.amount && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                    )}
                    {visibleColumns.status && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    )}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {processedProfiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No profiles match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    processedProfiles.map((profile) => (
                      <tr
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfile(profile);
                          setActiveTab("Overview");
                        }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        {visibleColumns.profileName && (
                          <td className="px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProfile(profile);
                                setActiveTab("Overview");
                              }}
                              className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                            >
                              {profile.profileName}
                            </button>
                          </td>
                        )}

                        {visibleColumns.expenseAccount && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {profile.expenseAccount}
                          </td>
                        )}

                        {visibleColumns.repeatEvery && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {profile.repeatEvery}
                          </td>
                        )}

                        {visibleColumns.startDate && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {profile.startDate}
                          </td>
                        )}

                        {visibleColumns.amount && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                            ₹{profile.amount.toFixed(2)}
                          </td>
                        )}

                        {visibleColumns.status && (
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <StatusPill status={profile.status} />
                          </td>
                        )}

                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <IconAction
                              icon={Eye}
                              label="View"
                              tone="primary"
                              onClick={() => {
                                setSelectedProfile(profile);
                                setActiveTab("Overview");
                              }}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/purchases/recurring-expenses/edit/${profile.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(profile)}
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

      {/* 🌟 REUSABLE CUSTOMIZE COLUMNS MODAL 🌟 */}
      <CustomizeColumnsModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      {/* ---- Drawer ---- */}
      {selectedProfile && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedProfile(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Recurring profile
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate">
                    {selectedProfile.profileName}
                  </h2>
                  <StatusPill status={selectedProfile.status} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    navigate(`/admin/accounts/purchases/recurring-expenses/edit/${selectedProfile.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {["Overview", "All expenses"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-3 py-2.5 text-xs md:text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
              {activeTab === "Overview" && (
                <>
                  {/* Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Metric
                      icon={Wallet}
                      label="Amount"
                      value={`₹${selectedProfile.amount.toFixed(2)}`}
                    />
                    <Metric
                      icon={RefreshCw}
                      label="Repeats"
                      value={selectedProfile.repeatEvery}
                    />
                    <Metric
                      icon={Calendar}
                      label="Next date"
                      value={selectedProfile.startDate}
                    />
                  </div>

                  {/* Details */}
                  <Card className="p-4">
                    <SectionLabel>Details</SectionLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem
                        label="Expense account"
                        value={selectedProfile.expenseAccount}
                      />
                      <DetailItem
                        label="Paid through"
                        value={selectedProfile.paidThrough}
                      />
                      <DetailItem label="Start on" value={selectedProfile.startDate} />
                      <DetailItem
                        label="Ends on"
                        value={
                          selectedProfile.neverExpires
                            ? "Never expires"
                            : selectedProfile.endDate
                        }
                      />
                    </div>
                  </Card>

                  {/* Notes */}
                  {selectedProfile.notes && (
                    <Card className="p-4">
                      <SectionLabel>Notes</SectionLabel>
                      <p className="text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedProfile.notes}
                      </p>
                    </Card>
                  )}

                  {/* History */}
                  <Card className="p-4">
                    <SectionLabel>History</SectionLabel>
                    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2 space-y-4 mt-2">
                      {[
                        {
                          icon: FileText,
                          title: "Recurring expense created",
                          detail: `For ₹${selectedProfile.amount.toFixed(2)} by Joe Doe`,
                          tone: "pos",
                        },
                        {
                          icon: FileText,
                          title: "Expense generated",
                          detail: `For ₹${selectedProfile.amount.toFixed(2)} by Joe Doe`,
                          tone: "warn",
                        },
                      ].map((item, i) => (
                        <li key={i} className="pl-4 relative">
                          <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-white dark:bg-gray-900 border-2 border-green-500 rounded-full" />
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                item.tone === "pos"
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <item.icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs md:text-[12.5px] font-medium text-gray-800 dark:text-gray-100">
                                {item.title}
                              </p>
                              <p className="text-[11.5px] text-gray-500 mt-0.5">
                                {item.detail}
                              </p>
                              <p className="text-[10.5px] text-gray-400 mt-0.5">
                                30 Oct 2026 · 11:03 AM
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </>
              )}

              {activeTab === "All expenses" && (
                <Card className="overflow-hidden">
                  <div className="px-4 pt-4 pb-2">
                    <SectionLabel>Generated expenses</SectionLabel>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs md:text-[12.5px]">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                            Date
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                            Account
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                            Status
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                            Paid through
                          </th>
                          <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProfile.childExpenses?.length ? (
                          selectedProfile.childExpenses.map((exp, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-200 dark:border-gray-700"
                            >
                              <td className="px-3 md:px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                {exp.date}
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                {exp.expenseAccount}
                              </td>
                              <td className="px-3 md:px-4 py-2.5">
                                <StatusPill status={exp.status} />
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-gray-500">
                                {exp.paidThrough}
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-right font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                                ₹{exp.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                            >
                              No expenses generated yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete recurring profile"
        message={`Are you sure you want to delete profile "${deleteTarget?.profileName}"? This action cannot be undone.`}
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

const Metric = ({ icon: Icon, label, value }) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <Icon size={12} className="text-green-600 dark:text-green-400" />
      </div>
      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
    </div>
    <p className="text-base font-bold text-gray-800 dark:text-gray-50 tabular-nums">
      {value}
    </p>
  </Card>
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

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText, label: "Create profile" },
    { icon: RefreshCw, label: "Auto-generate" },
    { icon: CheckCircle2, label: "Billable → Invoice", tone: "pos" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Receipt size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Create. Set. Repeat.
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Automate recurring expenses for periodic operating costs.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> New recurring expense
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && (
                <ArrowRight size={12} className="text-gray-300 dark:text-gray-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Routinely auto-generate expenses",
          "Track when each expense is created",
          "Add manual entries within a profile",
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

export default RecurringExpensesPage;