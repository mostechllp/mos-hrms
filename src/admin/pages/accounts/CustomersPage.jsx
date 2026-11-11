import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteCustomer } from "../../store/slices/accounts/customersSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, UserPlus, UploadCloud, X, Mail, Phone, MapPin,
  CheckCircle2, Users,
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

/* ---------- page ---------- */

const CustomersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customers = useSelector((s) => s.accountCustomers.customers) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteCustomer(deleteTarget.id));
      if (selectedCustomer?.id === deleteTarget.id) setSelectedCustomer(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sales</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Customers
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {customers.length === 0
                ? "No customers yet"
                : `${customers.length} ${customers.length === 1 ? "customer" : "customers"} in your directory`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/sales/customers/new")}
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
        {customers.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Users size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Every sale starts with a customer
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Create and manage customers and their contact persons, all in one place.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => navigate("/admin/accounts/sales/customers/new")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Plus size={13} /> Create customer
                </button>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <UploadCloud size={13} /> Import file
                </button>
              </div>
            </div>

            {/* Benefits card */}
            <div className="mt-12 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={14} className="text-slate-400" />
                <h3 className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Key benefits
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  "Stay connected with multiple contact persons",
                  "Provide portal access to customers",
                  "Handle multiple addresses effortlessly",
                  "Create multi-currency transactions for contacts",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </Surface>
        ) : (

          /* ---- Table surface ---- */
          <Surface className="overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label="Select all" />

              <div className="relative ml-auto w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers…"
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
                    <th className="px-4 py-2.5 text-right font-medium">Receivables</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No customers match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${customer.displayName}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {customer.displayName}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {customer.companyName || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {customer.email || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {customer.workPhone || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ${(customer.openingBalance || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => setSelectedCustomer(customer)} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/sales/customers/edit/${customer.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(customer)} />
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
      {selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-[45%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Customer</p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                  {selectedCustomer.displayName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/accounts/sales/customers/edit/${selectedCustomer.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedCustomer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>

              {/* Contact */}
              <Surface className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {[selectedCustomer.salutation, selectedCustomer.firstName, selectedCustomer.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {selectedCustomer.companyName || "Individual customer"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600 dark:text-slate-300">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{selectedCustomer.email}</span>
                    </div>
                  )}
                  {(selectedCustomer.workPhone || selectedCustomer.mobile) && (
                    <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600 dark:text-slate-300">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {selectedCustomer.workPhone}
                        {selectedCustomer.mobile && ` · ${selectedCustomer.mobile}`}
                      </span>
                    </div>
                  )}
                </div>
              </Surface>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AddressBlock title="Billing address" address={selectedCustomer.billingAddress} />
                <AddressBlock title="Shipping address" address={selectedCustomer.shippingAddress} />
              </div>

              {/* Details */}
              <Surface className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DetailItem label="Currency"       value={selectedCustomer.currency} />
                  <DetailItem label="Payment terms"  value={selectedCustomer.paymentTerms} />
                  <DetailItem label="Portal access"  value={selectedCustomer.portalAccess ? "Enabled" : "Disabled"} />
                </div>
              </Surface>

            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete customer"
        message={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- drawer sub-components ---------- */

const AddressBlock = ({ title, address }) => (
  <Surface className="p-4">
    <div className="flex items-center gap-1.5 mb-2">
      <MapPin size={12} className="text-slate-400" />
      <SectionLabel>{title}</SectionLabel>
    </div>
    {address?.street1 || address?.city ? (
      <div className="text-[12.5px] text-slate-600 dark:text-slate-300 space-y-0.5 leading-relaxed">
        {address.attention && <p className="font-medium text-slate-900 dark:text-slate-100">{address.attention}</p>}
        {address.street1 && <p>{address.street1}</p>}
        {address.street2 && <p>{address.street2}</p>}
        <p>
          {[address.city, address.state].filter(Boolean).join(", ")} {address.pinCode}
        </p>
        {address.country && <p>{address.country}</p>}
        {address.phone && <p className="text-[11.5px] text-slate-500 mt-1">Phone: {address.phone}</p>}
      </div>
    ) : (
      <p className="text-[12.5px] text-slate-400 dark:text-slate-600">Not provided</p>
    )}
  </Surface>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">
      {value || <span className="text-slate-400 dark:text-slate-600">—</span>}
    </p>
  </div>
);

export default CustomersPage;