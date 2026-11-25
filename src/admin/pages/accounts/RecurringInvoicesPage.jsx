// src/admin/pages/accounts/RecurringInvoicesPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteProfile } from "../../store/slices/accounts/recurringInvoicesSlice";
import {
  Plus, ArrowUpDown, Download, Upload,
  Settings, Search,
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Mail, CreditCard, Info, RefreshCw, Repeat,
  Columns,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";

/* ---------- primitives ---------- */

const ALL_COLUMNS = [
  { id: "profileName", label: "Profile name", locked: true },
  { id: "customerName", label: "Customer" },
  { id: "repeatEvery", label: "Frequency" },
  { id: "startDate", label: "Next invoice" },
  { id: "status", label: "Status" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
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

/* ---------- page ---------- */

const RecurringInvoicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profiles = useSelector((s) => s.recurringInvoices.profiles) || [];

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  
  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

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
      // Search
      const matchesSearch =
        p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.profileName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status Filter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.startDate) - new Date(a.startDate);
      if (sortBy === "date_asc") return new Date(a.startDate) - new Date(b.startDate);
      if (sortBy === "name_asc") return (a.profileName || "").localeCompare(b.profileName || "");
      if (sortBy === "name_desc") return (b.profileName || "").localeCompare(a.profileName || "");
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
            Recurring Invoices
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
            onClick={() => navigate("/admin/accounts/sales/recurring/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Profile
          </button>
        </div>
      </div>

      {/* ---- Empty / Table ---- */}
      {total === 0 ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/sales/recurring/new")} />
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
                    {visibleColumns.customerName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                    )}
                    {visibleColumns.repeatEvery && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Frequency</th>
                    )}
                    {visibleColumns.startDate && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Next invoice</th>
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
                        colSpan={6}
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

                        {visibleColumns.customerName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {profile.customerName}
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
                                navigate(`/admin/accounts/sales/recurring/edit/${profile.id}`)
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
          <aside className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[60%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
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
                    navigate(`/admin/accounts/sales/recurring/edit/${selectedProfile.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  Create invoice
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
                {["Overview", "Next invoice", "Recent activities"].map((tab) => (
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
            <div className="flex-1 overflow-y-auto">
              {activeTab === "Overview" && (
                <div className="flex flex-col lg:flex-row gap-4 p-5 sm:p-6">
                  {/* Left column: Details */}
                  <div className="lg:w-72 space-y-4 shrink-0">
                    <Card className="p-4">
                      <SectionLabel>Profile</SectionLabel>
                      <div className="space-y-2.5">
                        <DetailItem label="Status" value={selectedProfile.status} />
                        <DetailItem label="Start date" value={selectedProfile.startDate} />
                        <DetailItem
                          label="End date"
                          value={
                            selectedProfile.neverExpires
                              ? "Never expires"
                              : selectedProfile.endDate
                          }
                        />
                        <DetailItem
                          label="Payment terms"
                          value={selectedProfile.paymentTerms}
                        />
                      </div>
                    </Card>

                    <Card className="p-4 bg-green-50 dark:bg-green-900/20 !border-green-200/80 dark:!border-green-800/60">
                      <div className="flex items-start gap-2">
                        <Info
                          size={13}
                          className="text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                        />
                        <p className="text-[11.5px] text-gray-600 dark:text-gray-300 leading-relaxed">
                          Recurring invoices are created as{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            drafts
                          </span>{" "}
                          per current preferences.
                        </p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <SectionLabel>Billing address</SectionLabel>
                      <p className="text-xs md:text-[12px] font-medium text-gray-800 dark:text-gray-100 mb-1">
                        {selectedProfile.customerName}
                      </p>
                      <p className="text-[11.5px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {"v v\nbubvnv\nbvn\nnbvn bvnbv\nAland Islands"}
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Shipping
                        </p>
                        <p className="text-[11.5px] text-gray-500">vcbvc</p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <SectionLabel>Customer notes</SectionLabel>
                      <p className="text-[11.5px] text-gray-500 leading-relaxed">
                        Thanks for your business.
                      </p>
                    </Card>
                  </div>

                  {/* Right column: Metrics + invoices */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card className="p-4">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Invoice amount
                        </p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-50 tabular-nums">
                          ₹{selectedProfile.total.toFixed(2)}
                        </p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Next invoice date
                        </p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-50 tabular-nums">
                          {selectedProfile.startDate}
                        </p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Recurring period
                        </p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-50">
                          {selectedProfile.repeatEvery}
                        </p>
                      </Card>
                    </div>

                    {/* Child invoices */}
                    <Card>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <SectionLabel>Child invoices</SectionLabel>
                        <p className="text-[11.5px] text-gray-500">
                          Unpaid{" "}
                          <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                            ₹0.00
                          </span>
                        </p>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedProfile.childInvoices.map((inv, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs md:text-[12.5px] font-medium text-green-600 dark:text-green-400 cursor-pointer hover:underline">
                                {inv.invoiceNumber}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11.5px] text-gray-500">
                                  {inv.date}
                                </span>
                                <StatusPill status="Draft" />
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                <RefreshCw size={10} /> Manually added
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                                ₹{inv.amount.toFixed(2)}
                              </p>
                              <button className="mt-1.5 text-[11px] font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                Record payment
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "Next invoice" && (
                <div className="p-5 sm:p-6">
                  <InvoicePreview profile={selectedProfile} />
                </div>
              )}

              {activeTab === "Recent activities" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-10 h-10 mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <RefreshCw size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    No recent activities
                  </p>
                  <p className="text-xs text-gray-500">
                    Activity for this profile will appear here.
                  </p>
                </div>
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

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: FileText, label: "Profile" },
    { icon: FileText, label: "Invoices" },
    { icon: Edit2, label: "Drafts" },
    { icon: Mail, label: "Sent" },
    { icon: CreditCard, label: "Auto-charge" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Repeat size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Create. Set. Repeat.
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Set up a profile to periodically create and send invoices to your
          customers.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create recurring invoice
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle of a recurring profile</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                <s.icon size={13} />
                <span className="whitespace-nowrap">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="text-gray-300 dark:text-gray-700 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Automate repeat invoices on a schedule of your choice",
          "Automatically or manually charge your customer's card",
          "Email customers on payment failure",
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

const InvoicePreview = ({ profile }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-2xl relative text-gray-800 dark:text-gray-200 shadow-soft">
    <div className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
      Scheduled
    </div>

    <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-gray-800 dark:text-gray-100">Fidha</p>
        <p className="text-gray-500">Keralam</p>
        <p className="text-gray-500">India</p>
        <p className="text-gray-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          Tax invoice
        </h1>
        <p className="text-[11px] text-gray-500 mt-1">
          Will be generated automatically
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-[11.5px] mb-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Bill to
        </p>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {profile.customerName}
        </p>
      </div>
      <div className="text-right space-y-0.5 text-gray-500">
        <p>
          Invoice date{" "}
          <span className="text-gray-800 dark:text-gray-100 ml-1">
            {profile.startDate}
          </span>
        </p>
        <p>
          Terms{" "}
          <span className="text-gray-800 dark:text-gray-100 ml-1">
            {profile.paymentTerms}
          </span>
        </p>
        <p>
          Due date{" "}
          <span className="text-gray-800 dark:text-gray-100 ml-1">
            {profile.startDate}
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
        {profile.items?.map((item, idx) => (
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
              {item.qty.toFixed(2)}
            </td>
            <td className="py-2 px-2 text-right tabular-nums">
              {item.rate.toFixed(2)}
            </td>
            <td className="py-2 px-2 text-right tabular-nums">
              {(item.qty * item.rate).toFixed(2)}
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
            {profile.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-100">
          <span>Total</span>
          <span className="tabular-nums">₹{profile.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 rounded mt-1 text-gray-700 dark:text-gray-300">
          <span className="font-medium">Balance due</span>
          <span className="font-semibold tabular-nums">
            ₹{profile.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    <div className="mt-10 flex justify-between items-end text-[10.5px] text-gray-500">
      <div className="max-w-[55%]">
        {profile.notes && (
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-gray-400 mb-0.5">
              Notes
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{profile.notes}</p>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="w-40 h-px bg-gray-300 dark:bg-gray-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
      </div>
    </div>

    <div className="mt-4 text-right text-[10.5px] text-gray-500">
      PDF template{" "}
      <span className="text-gray-700 dark:text-gray-300">Spreadsheet</span> ·{" "}
      <a href="#" className="text-green-600 dark:text-green-400 hover:underline">
        Change
      </a>
    </div>
  </div>
);

export default RecurringInvoicesPage;