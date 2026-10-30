import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteCustomer } from "../../store/slices/accounts/customersSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, UserPlus, UploadCloud, X, Mail, Phone, MapPin, CheckCircle2
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const CustomersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.accountCustomers.customers);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteCustomer(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedCustomer?.id === deleteTarget.id) {
        setSelectedCustomer(null); // Close drawer if deleted
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Customers</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/customers/new")} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            <Plus size={16} className="mr-1" /> New
          </Button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 py-1 text-sm text-gray-700 dark:text-gray-200">
                   <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><ArrowUpDown size={14} /> Sort by</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><Download size={14} /> Import</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><Upload size={14} /> Export</span>
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Settings size={14} /> Preferences
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {customers.length === 0 ? (
        // Empty State Layout (Zoho style)
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 relative">
             <UserPlus size={48} className="text-gray-400" />
             <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
               <Plus size={16} className="text-white" />
             </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Every sale starts with a customer</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Create and manage your customers and their contact persons, all in one place.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/customers/new")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
              <Plus size={16} className="mr-2" /> Create New Customer
            </Button>
            <Button variant="secondary" className="px-6 py-2.5">
              <UploadCloud size={16} className="mr-2" /> Import File
            </Button>
          </div>
          
          <div className="mt-16 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-3xl w-full">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Settings size={18} /> Key Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Stay connected with multiple contact persons",
                "Provide portal access to customers",
                "Handle multiple addresses effortlessly",
                "Create multi-currency transactions for contacts"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Table View
        <>
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Filter size={16} /></button>
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Display Name <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Work Phone</th>
                  <th className="px-4 py-3">Receivables</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedCustomer(customer)} // Open sliding drawer
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {customer.displayName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.companyName || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.workPhone || "-"}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">${(customer.openingBalance || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedCustomer(customer)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/customers/edit/${customer.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(customer)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sliding Drawer for View */}
      {selectedCustomer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          {/* Drawer Panel - Made almost half the page width and added scrollable content */}
          <div className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-[45%] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {selectedCustomer.displayName}
              </h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate(`/admin/accounts/sales/customers/edit/${selectedCustomer.id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white justify-center"
                >
                  <Edit2 size={16} className="mr-2" /> Edit
                </Button>
                <Button 
                  onClick={() => setDeleteTarget(selectedCustomer)}
                  variant="secondary" 
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 justify-center dark:border-red-900/30 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} className="mr-2" /> Delete
                </Button>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Primary Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {selectedCustomer.salutation} {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedCustomer.companyName || "Individual Customer"}</p>
                  </div>
                </div>
                
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Mail size={16} className="text-gray-400" />
                    {selectedCustomer.email}
                  </div>
                )}
                
                {(selectedCustomer.workPhone || selectedCustomer.mobile) && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="text-gray-400" />
                    {selectedCustomer.workPhone} {selectedCustomer.mobile && ` / ${selectedCustomer.mobile}`}
                  </div>
                )}
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" /> Billing Address
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.billingAddress?.attention}</p>
                    <p>{selectedCustomer.billingAddress?.street1}</p>
                    {selectedCustomer.billingAddress?.street2 && <p>{selectedCustomer.billingAddress?.street2}</p>}
                    <p>{selectedCustomer.billingAddress?.city}, {selectedCustomer.billingAddress?.state} {selectedCustomer.billingAddress?.pinCode}</p>
                    <p>{selectedCustomer.billingAddress?.country}</p>
                    {selectedCustomer.billingAddress?.phone && <p className="mt-2 text-xs">Phone: {selectedCustomer.billingAddress.phone}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" /> Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.shippingAddress?.attention}</p>
                    <p>{selectedCustomer.shippingAddress?.street1}</p>
                    {selectedCustomer.shippingAddress?.street2 && <p>{selectedCustomer.shippingAddress?.street2}</p>}
                    <p>{selectedCustomer.shippingAddress?.city}, {selectedCustomer.shippingAddress?.state} {selectedCustomer.shippingAddress?.pinCode}</p>
                    <p>{selectedCustomer.shippingAddress?.country}</p>
                    {selectedCustomer.shippingAddress?.phone && <p className="mt-2 text-xs">Phone: {selectedCustomer.shippingAddress.phone}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Other Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Currency</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedCustomer.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Terms</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedCustomer.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Portal Access</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {selectedCustomer.portalAccess ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CustomersPage;