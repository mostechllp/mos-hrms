import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteVendor } from "../../store/slices/accounts/vendorsSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, X, CheckCircle2, UserPlus, UploadCloud,
  Mail, Printer, Building2, MoreVertical,
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

const DetailItem = ({ label, value, tone }) => (
  <div className="flex items-center justify-between gap-3 text-[12px]">
    <span className="text-slate-500">{label}</span>
    <span className={`font-medium ${tone === "pos" ? "text-emerald-600" : tone === "neg" ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}`}>
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
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

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Vendors
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {vendors.length === 0
                ? "No vendors yet"
                : `${vendors.length} ${vendors.length === 1 ? "vendor" : "vendors"} in your directory`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/vendors/new")}
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
                  <MenuItem icon={Download}   label="Import" />
                  <MenuItem icon={Upload}     label="Export" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Settings}   label="Preferences" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {vendors.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/purchases/vendors/new")} />
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
                  placeholder="Search vendors…"
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
                        Display name <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Company</th>
                    <th className="px-4 py-2.5 text-left font-medium">Email</th>
                    <th className="px-4 py-2.5 text-left font-medium">Work phone</th>
                    <th className="px-4 py-2.5 text-right font-medium">Payables</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No vendors match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      onClick={() => { setSelectedVendor(vendor); setActiveTab("Overview"); }}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${vendor.displayName}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {vendor.displayName}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {vendor.companyName || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {vendor.email || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {vendor.workPhone || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{(vendor.openingBalance || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => { setSelectedVendor(vendor); setActiveTab("Overview"); }} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/vendors/edit/${vendor.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(vendor)} />
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
      {selectedVendor && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedVendor(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Vendor</p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                  {selectedVendor.displayName}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/accounts/purchases/vendors/edit/${selectedVendor.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  New transaction
                </button>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {["Overview", "Comments", "Transactions", "Mails", "Statement"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors border-b-2 ${
                      activeTab === tab
                        ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
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
                    <Surface className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm shrink-0">
                          {selectedVendor.displayName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {selectedVendor.displayName}
                          </p>
                          {selectedVendor.email && (
                            <p className="text-[11.5px] text-slate-500 truncate">{selectedVendor.email}</p>
                          )}
                          {selectedVendor.workPhone && (
                            <p className="text-[11.5px] text-slate-500">{selectedVendor.workPhone}</p>
                          )}
                        </div>
                      </div>
                    </Surface>

                    {/* Addresses */}
                    <Surface className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Billing address</SectionLabel>
                        <button className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">New</button>
                      </div>
                      {selectedVendor.billingAddress?.attention ? (
                        <div className="text-[11.5px] text-slate-600 dark:text-slate-300 space-y-0.5 leading-relaxed">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{selectedVendor.billingAddress.attention}</p>
                          {selectedVendor.billingAddress.street1 && <p>{selectedVendor.billingAddress.street1}</p>}
                          <p>{[selectedVendor.billingAddress.city, selectedVendor.billingAddress.state].filter(Boolean).join(", ")}</p>
                        </div>
                      ) : (
                        <p className="text-[11.5px] text-slate-400 dark:text-slate-600">Not provided</p>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <SectionLabel>Shipping address</SectionLabel>
                          <button className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">New</button>
                        </div>
                        {selectedVendor.shippingAddress?.attention ? (
                          <div className="text-[11.5px] text-slate-600 dark:text-slate-300 space-y-0.5">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{selectedVendor.shippingAddress.attention}</p>
                            {selectedVendor.shippingAddress.street1 && <p>{selectedVendor.shippingAddress.street1}</p>}
                          </div>
                        ) : (
                          <p className="text-[11.5px] text-slate-400 dark:text-slate-600">Not provided</p>
                        )}
                      </div>
                    </Surface>

                    {/* Other details */}
                    <Surface className="p-4 space-y-2">
                      <SectionLabel>Other details</SectionLabel>
                      <DetailItem label="Currency" value={selectedVendor.currency?.split("-")[0]} />
                      <DetailItem
                        label="Portal status"
                        value={selectedVendor.portalAccess ? "Enabled" : "Disabled"}
                        tone={selectedVendor.portalAccess ? "pos" : "neg"}
                      />
                      <DetailItem label="Language" value={selectedVendor.language} />
                    </Surface>

                    {/* Contact persons */}
                    <Surface className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Contact persons</SectionLabel>
                        <button className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Add</button>
                      </div>
                      <p className="text-[11.5px] text-slate-400 dark:text-slate-600">No contact persons yet</p>
                    </Surface>

                    {/* Bank */}
                    <Surface className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel>Bank accounts</SectionLabel>
                        <button className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Add</button>
                      </div>
                      <p className="text-[11.5px] text-slate-400 dark:text-slate-600">No bank account added</p>
                    </Surface>
                  </div>

                  {/* Right column */}
                  <div className="flex-1 min-w-0 space-y-4">

                    {/* What's next */}
                    <Surface className="p-4 bg-blue-50/60 dark:bg-blue-900/10 !border-blue-100 dark:!border-blue-900/40">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-blue-900 dark:text-blue-200">What's next?</p>
                          <p className="text-[12px] text-blue-700 dark:text-blue-300 mt-0.5">
                            Create a purchase order or record a bill for this vendor.
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                              New bill
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              New purchase order
                            </button>
                          </div>
                        </div>
                      </div>
                    </Surface>

                    {/* Payables */}
                    <Surface>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <div>
                          <SectionLabel>Payables</SectionLabel>
                          <p className="text-[11.5px] text-slate-500">Payment due period <span className="font-medium text-slate-700 dark:text-slate-300">{selectedVendor.paymentTerms}</span></p>
                        </div>
                        <button className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Opening balance</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                              <th className="text-left  font-medium px-4 py-2">Currency</th>
                              <th className="text-right font-medium px-4 py-2">Outstanding</th>
                              <th className="text-right font-medium px-4 py-2">Unused credits</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                              <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{selectedVendor.currency}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums">₹0.00</td>
                              <td className="px-4 py-2.5 text-right tabular-nums">₹0.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Surface>

                    {/* Expenses */}
                    <Surface className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <SectionLabel>Expenses</SectionLabel>
                          <p className="text-[10.5px] text-slate-500">In organization's base currency.</p>
                        </div>
                        <div className="flex gap-2 text-[11px]">
                          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400">
                            <option>Last 6 months</option>
                          </select>
                          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400">
                            <option>Accrual</option>
                          </select>
                        </div>
                      </div>
                      <div className="h-28 flex items-end justify-between gap-2 px-1">
                        {[10, 20, 15, 30, 25, 40].map((h, i) => (
                          <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                        <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
                      </div>
                    </Surface>

                    {/* Timeline */}
                    <Surface className="p-4">
                      <SectionLabel>Recent activity</SectionLabel>
                      <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-2 space-y-4 mt-2">
                        {[
                          { title: "Contact person added", detail: "Fidha was added by Joe Doe" },
                          { title: "Contact created",     detail: "Created by Joe Doe" },
                        ].map((item, i) => (
                          <li key={i} className="pl-4 relative">
                            <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-500 rounded-full" />
                            <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                            <p className="text-[11.5px] text-slate-500 mt-0.5">{item.detail}</p>
                            <p className="text-[10.5px] text-slate-400 mt-0.5">29 Oct 2026 · 5:08 PM</p>
                          </li>
                        ))}
                      </ol>
                    </Surface>
                  </div>
                </div>
              )}

              {activeTab === "Statement" && (
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex gap-2">
                      <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400">
                        <option>This month</option>
                      </select>
                      <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400">
                        <option>All</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Printer size={13} /> Print
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Download size={13} /> PDF
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Mail size={13} /> Send
                      </button>
                    </div>
                  </div>

                  <StatementPreview vendor={selectedVendor} />
                </div>
              )}

              {activeTab !== "Overview" && activeTab !== "Statement" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-10 h-10 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Building2 size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 mb-1">No data</p>
                  <p className="text-[12px] text-slate-500">Nothing to show under {activeTab} yet.</p>
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

const EmptyState = ({ onCreate }) => (
  <Surface className="py-16 px-6">
    <div className="max-w-xl mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <UserPlus size={22} className="text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
        Every purchase starts with a vendor
      </h2>
      <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
        Create and manage your vendors and their contact persons, all in one place.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Create vendor
        </button>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <UploadCloud size={13} /> Import file
        </button>
      </div>
    </div>

    <div className="mt-12 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={14} className="text-slate-400" />
        <h3 className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
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
          <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </div>
  </Surface>
);

const StatementPreview = ({ vendor }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-8 mx-auto max-w-2xl text-slate-800 dark:text-slate-200">
    <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
        <p className="text-slate-500">Keralam</p>
        <p className="text-slate-500">India</p>
        <p className="text-slate-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Statement of accounts</h1>
        <p className="text-[11px] text-slate-500 mt-1">01 Oct – 31 Oct 2026</p>
      </div>
    </div>

    <div className="text-[11.5px] mb-6">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">To</p>
      <p className="font-medium text-slate-900 dark:text-slate-100">{vendor.displayName}</p>
    </div>

    <table className="w-full text-[11.5px] mb-6">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800">
          <th colSpan={2} className="text-left font-medium py-2">Account summary</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Opening balance", "₹0.00"],
          ["Billed amount",   "₹0.00"],
          ["Amount paid",     "₹0.00"],
        ].map(([label, value]) => (
          <tr key={label} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-2 text-slate-500">{label}</td>
            <td className="py-2 text-right text-slate-900 dark:text-slate-100 tabular-nums">{value}</td>
          </tr>
        ))}
        <tr className="border-b-2 border-slate-300 dark:border-slate-700">
          <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">Balance due</td>
          <td className="py-2 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">₹0.00</td>
        </tr>
      </tbody>
    </table>

    <table className="w-full text-[11.5px]">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800">
          <th className="text-left  font-medium py-2">Date</th>
          <th className="text-left  font-medium py-2">Details</th>
          <th className="text-right font-medium py-2">Amount</th>
          <th className="text-right font-medium py-2">Payments</th>
          <th className="text-right font-medium py-2">Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-slate-100 dark:border-slate-800">
          <td className="py-2.5 text-slate-500">01 Oct 2026</td>
          <td className="py-2.5 text-slate-700 dark:text-slate-300">Opening balance</td>
          <td className="py-2.5 text-right tabular-nums">0.00</td>
          <td className="py-2.5 text-right tabular-nums">—</td>
          <td className="py-2.5 text-right tabular-nums">0.00</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="pt-3 text-right font-semibold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800">
            Balance due
          </td>
          <td className="pt-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums border-t border-slate-200 dark:border-slate-800">
            ₹0.00
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default VendorsPage;