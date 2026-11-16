// src/admin/pages/accounts/VendorsPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteVendor } from "../../store/slices/accounts/vendorsSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter,
  Eye, Edit2, Trash2, X, CheckCircle2, UserPlus, UploadCloud,
  Mail, Printer, Building2,
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

const DetailItem = ({ label, value, tone }) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className="text-gray-500">{label}</span>
    <span
      className={`font-medium ${
        tone === "pos"
          ? "text-green-600 dark:text-green-400"
          : tone === "neg"
          ? "text-red-600 dark:text-red-400"
          : "text-gray-800 dark:text-gray-100"
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

/* ---------- page ---------- */

const VendorsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vendors = useSelector((s) => s.vendors.vendors) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredVendors = vendors.filter(
    (v) =>
      v.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.companyName && v.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.email && v.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteVendor(deleteTarget.id));
      if (selectedVendor?.id === deleteTarget.id) setSelectedVendor(null);
      setDeleteTarget(null);
    }
  };

  const total = vendors.length;
  const withCompany = vendors.filter((v) => v.companyName).length;
  const withPortal = vendors.filter((v) => v.portalAccess).length;
  const totalPayables = vendors.reduce((s, v) => s + (v.openingBalance || 0), 0);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Vendors" value={total} icon="fas fa-truck" color="green" />
        <MiniStat label="With Company" value={withCompany} icon="fas fa-building" color="blue" />
        <MiniStat label="With Portal Access" value={withPortal} icon="fas fa-user-shield" color="violet" />
        <MiniStat
          label="Total Payables"
          value={`₹${totalPayables.toFixed(2)}`}
          icon="fas fa-hand-holding-usd"
          color="amber"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Vendors
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {total === 0
              ? "No vendors yet"
              : `${total} ${total === 1 ? "vendor" : "vendors"} in your directory`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/admin/accounts/purchases/vendors/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Vendor
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
        <EmptyState onCreate={() => navigate("/admin/accounts/purchases/vendors/new")} />
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
                placeholder="Search vendors…"
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
                        Display name <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Company
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Work phone
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Payables
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No vendors match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <tr
                        key={vendor.id}
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setActiveTab("Overview");
                        }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        <td
                          className="px-3 md:px-4 py-2 md:py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                            aria-label={`Select ${vendor.displayName}`}
                          />
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVendor(vendor);
                              setActiveTab("Overview");
                            }}
                            className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                          >
                            {vendor.displayName}
                          </button>
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {vendor.companyName || (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {vendor.email || (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {vendor.workPhone || (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>

                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                          ₹{(vendor.openingBalance || 0).toFixed(2)}
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
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setActiveTab("Overview");
                              }}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(`/admin/accounts/purchases/vendors/edit/${vendor.id}`)
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(vendor)}
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
      {selectedVendor && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedVendor(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedVendor.displayName}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    navigate(`/admin/accounts/purchases/vendors/edit/${selectedVendor.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  New transaction
                </button>
                <button
                  onClick={() => setSelectedVendor(null)}
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
                {["Overview", "Comments", "Transactions", "Mails", "Statement"].map((tab) => (
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
                  {/* Left column */}
                  <div className="lg:w-64 space-y-4 shrink-0">
                    {/* Contact card */}
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm shrink-0">
                          {selectedVendor.displayName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {selectedVendor.displayName}
                          </p>
                          {selectedVendor.email && (
                            <p className="text-[11.5px] text-gray-500 truncate">
                              {selectedVendor.email}
                            </p>
                          )}
                          {selectedVendor.workPhone && (
                            <p className="text-[11.5px] text-gray-500">
                              {selectedVendor.workPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Addresses */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Billing address</SectionLabel>
                        <button className="text-[11px] text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          New
                        </button>
                      </div>
                      {selectedVendor.billingAddress?.attention ? (
                        <div className="text-[11.5px] text-gray-600 dark:text-gray-300 space-y-0.5 leading-relaxed">
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            {selectedVendor.billingAddress.attention}
                          </p>
                          {selectedVendor.billingAddress.street1 && (
                            <p>{selectedVendor.billingAddress.street1}</p>
                          )}
                          <p>
                            {[selectedVendor.billingAddress.city, selectedVendor.billingAddress.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11.5px] text-gray-400 dark:text-gray-600">
                          Not provided
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <SectionLabel>Shipping address</SectionLabel>
                          <button className="text-[11px] text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                            New
                          </button>
                        </div>
                        {selectedVendor.shippingAddress?.attention ? (
                          <div className="text-[11.5px] text-gray-600 dark:text-gray-300 space-y-0.5">
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {selectedVendor.shippingAddress.attention}
                            </p>
                            {selectedVendor.shippingAddress.street1 && (
                              <p>{selectedVendor.shippingAddress.street1}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11.5px] text-gray-400 dark:text-gray-600">
                            Not provided
                          </p>
                        )}
                      </div>
                    </Card>

                    {/* Other details */}
                    <Card className="p-4 space-y-2">
                      <SectionLabel>Other details</SectionLabel>
                      <DetailItem
                        label="Currency"
                        value={selectedVendor.currency?.split("-")[0]}
                      />
                      <DetailItem
                        label="Portal status"
                        value={selectedVendor.portalAccess ? "Enabled" : "Disabled"}
                        tone={selectedVendor.portalAccess ? "pos" : "neg"}
                      />
                      <DetailItem label="Language" value={selectedVendor.language} />
                    </Card>

                    {/* Contact persons */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Contact persons</SectionLabel>
                        <button className="text-[11px] text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          Add
                        </button>
                      </div>
                      <p className="text-[11.5px] text-gray-400 dark:text-gray-600">
                        No contact persons yet
                      </p>
                    </Card>

                    {/* Bank */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Bank accounts</SectionLabel>
                        <button className="text-[11px] text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          Add
                        </button>
                      </div>
                      <p className="text-[11.5px] text-gray-400 dark:text-gray-600">
                        No bank account added
                      </p>
                    </Card>
                  </div>

                  {/* Right column */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* What's next */}
                    <Card className="p-4 bg-green-50 dark:bg-green-900/20 !border-green-200/80 dark:!border-green-800/60">
                      <div className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100">
                            What's next?
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                            Create a purchase order or record a bill for this
                            vendor.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors">
                              New bill
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-medium text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                              New purchase order
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Payables */}
                    <Card>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <div>
                          <SectionLabel>Payables</SectionLabel>
                          <p className="text-[11.5px] text-gray-500">
                            Payment due period{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {selectedVendor.paymentTerms}
                            </span>
                          </p>
                        </div>
                        <button className="text-[11px] text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          Opening balance
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                              <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                                Currency
                              </th>
                              <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                                Outstanding
                              </th>
                              <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 md:px-4 py-2">
                                Unused credits
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="px-3 md:px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                {selectedVendor.currency}
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-right tabular-nums">
                                ₹0.00
                              </td>
                              <td className="px-3 md:px-4 py-2.5 text-right tabular-nums">
                                ₹0.00
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Expenses */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <SectionLabel>Expenses</SectionLabel>
                          <p className="text-[10.5px] text-gray-500">
                            In organization's base currency.
                          </p>
                        </div>
                        <div className="flex gap-2 text-[11px]">
                          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400">
                            <option>Last 6 months</option>
                          </select>
                          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400">
                            <option>Accrual</option>
                          </select>
                        </div>
                      </div>
                      <div className="h-28 flex items-end justify-between gap-2 px-1">
                        {[10, 20, 15, 30, 25, 40].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-green-200 dark:bg-green-900/40 rounded-t"
                            style={{ height: `${h}%` }}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                      </div>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-4">
                      <SectionLabel>Recent activity</SectionLabel>
                      <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2 space-y-4 mt-2">
                        {[
                          { title: "Contact person added", detail: "Fidha was added by Joe Doe" },
                          { title: "Contact created", detail: "Created by Joe Doe" },
                        ].map((item, i) => (
                          <li key={i} className="pl-4 relative">
                            <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-white dark:bg-gray-900 border-2 border-green-500 rounded-full" />
                            <p className="text-xs md:text-[12.5px] font-medium text-gray-800 dark:text-gray-100">
                              {item.title}
                            </p>
                            <p className="text-[11.5px] text-gray-500 mt-0.5">
                              {item.detail}
                            </p>
                            <p className="text-[10.5px] text-gray-400 mt-0.5">
                              29 Oct 2026 · 5:08 PM
                            </p>
                          </li>
                        ))}
                      </ol>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "Statement" && (
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex gap-2">
                      <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400">
                        <option>This month</option>
                      </select>
                      <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400">
                        <option>All</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <Printer size={13} /> Print
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <Download size={13} /> PDF
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <Mail size={13} /> Send
                      </button>
                    </div>
                  </div>

                  <StatementPreview vendor={selectedVendor} />
                </div>
              )}

              {activeTab !== "Overview" && activeTab !== "Statement" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-10 h-10 mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    No data
                  </p>
                  <p className="text-xs text-gray-500">
                    Nothing to show under {activeTab} yet.
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
        title="Delete vendor"
        message={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
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

const EmptyState = ({ onCreate }) => (
  <Card className="py-16 px-6">
    <div className="max-w-xl mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <UserPlus size={22} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        Every purchase starts with a vendor
      </h2>
      <p className="text-sm text-gray-500 mt-1.5 mb-6">
        Create and manage your vendors and their contact persons, all in one place.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create vendor
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <UploadCloud size={14} /> Import file
        </button>
      </div>
    </div>

    <div className="mt-12 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={14} className="text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          Key benefits
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {[
          "Multiple contact persons per vendor",
          "Vendor portal access",
          "Multiple billing and shipping addresses",
          "Multi-currency purchase transactions",
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

const StatementPreview = ({ vendor }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mx-auto max-w-2xl text-gray-800 dark:text-gray-200 shadow-soft">
    <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-gray-800 dark:text-gray-100">Fidha</p>
        <p className="text-gray-500">Keralam</p>
        <p className="text-gray-500">India</p>
        <p className="text-gray-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          Statement of accounts
        </h1>
        <p className="text-[11px] text-gray-500 mt-1">01 Oct – 31 Oct 2026</p>
      </div>
    </div>

    <div className="text-[11.5px] mb-6">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        To
      </p>
      <p className="font-medium text-gray-800 dark:text-gray-100">
        {vendor.displayName}
      </p>
    </div>

    <table className="w-full border-collapse text-[11.5px] mb-6">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
          <th
            colSpan={2}
            className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2"
          >
            Account summary
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Opening balance", "₹0.00"],
          ["Billed amount", "₹0.00"],
          ["Amount paid", "₹0.00"],
        ].map(([label, value]) => (
          <tr
            key={label}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <td className="py-2 px-2 text-gray-500">{label}</td>
            <td className="py-2 px-2 text-right text-gray-800 dark:text-gray-100 tabular-nums">
              {value}
            </td>
          </tr>
        ))}
        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
          <td className="py-2 px-2 font-semibold text-gray-800 dark:text-gray-100">
            Balance due
          </td>
          <td className="py-2 px-2 text-right font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
            ₹0.00
          </td>
        </tr>
      </tbody>
    </table>

    <table className="w-full border-collapse text-[11.5px]">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
          <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Date
          </th>
          <th className="text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Details
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Amount
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Payments
          </th>
          <th className="text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-2 px-2">
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <td className="py-2.5 px-2 text-gray-500">01 Oct 2026</td>
          <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">
            Opening balance
          </td>
          <td className="py-2.5 px-2 text-right tabular-nums">0.00</td>
          <td className="py-2.5 px-2 text-right tabular-nums">—</td>
          <td className="py-2.5 px-2 text-right tabular-nums">0.00</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td
            colSpan={4}
            className="pt-3 px-2 text-right font-semibold text-gray-800 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700"
          >
            Balance due
          </td>
          <td className="pt-3 px-2 text-right font-semibold text-gray-800 dark:text-gray-100 tabular-nums border-t border-gray-200 dark:border-gray-700">
            ₹0.00
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default VendorsPage;