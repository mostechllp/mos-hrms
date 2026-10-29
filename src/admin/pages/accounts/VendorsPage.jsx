import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteVendor } from "../../store/slices/accounts/vendorsSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, Building2, CheckCircle2,
  UserPlus, UploadCloud, Mail, Phone, MapPin, User, Briefcase, Printer
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const VendorsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vendors = useSelector((state) => state.vendors.vendors);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const filteredVendors = vendors.filter(
    (v) =>
      v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.companyName && v.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.email && v.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteVendor(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedVendor?.id === deleteTarget.id) {
        setSelectedVendor(null); 
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Vendors</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/purchases/vendors/new")} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
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

      {vendors.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 relative">
             <UserPlus size={48} className="text-gray-400" />
             <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
               <Plus size={16} className="text-white" />
             </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Every purchase starts with a vendor</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Create and manage your vendors and their contact persons, all in one place.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/admin/accounts/purchases/vendors/new")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
              <Plus size={16} className="mr-2" /> Create New Vendor
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
                "Provide portal access to vendors",
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
                placeholder="Search vendors..."
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
                  <th className="px-4 py-3">Payables</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => { setSelectedVendor(vendor); setActiveTab("Overview"); }} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {vendor.displayName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{vendor.companyName || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{vendor.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{vendor.workPhone || "-"}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">₹{(vendor.openingBalance || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedVendor(vendor); setActiveTab("Overview"); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/vendors/edit/${vendor.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(vendor)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedVendor && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedVendor(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {selectedVendor.displayName}
              </h2>
              <div className="flex items-center gap-2">
                  <Button 
                     onClick={() => navigate(`/admin/accounts/purchases/vendors/edit/${selectedVendor.id}`)}
                     variant="secondary" 
                     className="h-8 px-3 text-xs"
                  >
                     <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button className="h-8 px-3 text-xs bg-blue-600 text-white">
                     New Transaction
                  </Button>
                  <button onClick={() => setSelectedVendor(null)} className="p-1 text-gray-500 hover:text-gray-800 ml-2">
                    <X size={20} />
                  </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
                {["Overview", "Comments", "Transactions", "Mails", "Statement"].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Drawer Body - ADDED BOTTOM PADDING HERE */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/30 pb-24">
              
              {activeTab === "Overview" && (
                  <div className="flex flex-col md:flex-row min-h-full">
                      {/* Left Sidebar Details */}
                      <div className="w-full md:w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-6">
                          
                          {/* Vendor Info Card */}
                          <div className="flex gap-3 items-start">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                                  {selectedVendor.displayName.charAt(0)}
                              </div>
                              <div>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedVendor.displayName}</p>
                                  <p className="text-xs text-blue-500 break-all">{selectedVendor.email}</p>
                                  <p className="text-xs text-gray-500 mt-1">{selectedVendor.workPhone}</p>
                                  <button className="text-xs text-blue-500 font-medium mt-2 hover:underline">Invite to Portal</button>
                              </div>
                          </div>

                          <hr className="border-gray-200 dark:border-gray-700" />

                          <div>
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Address</h3>
                                <ChevronDown size={14} className="text-gray-400"/>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 flex justify-between">Billing Address <span className="text-blue-500 cursor-pointer hover:underline">New</span></p>
                                  {selectedVendor.billingAddress?.attention ? (
                                      <>
                                        <p className="text-blue-600">{selectedVendor.billingAddress.attention}</p>
                                        <p>{selectedVendor.billingAddress.street1}</p>
                                        <p>{selectedVendor.billingAddress.city}, {selectedVendor.billingAddress.state}</p>
                                      </>
                                  ) : (
                                      <p>No Billing Address - <span className="text-blue-500 cursor-pointer hover:underline">New</span></p>
                                  )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 flex justify-between">Shipping Address <span className="text-blue-500 cursor-pointer hover:underline">New</span></p>
                                  {selectedVendor.shippingAddress?.attention ? (
                                      <>
                                        <p className="text-blue-600">{selectedVendor.shippingAddress.attention}</p>
                                        <p>{selectedVendor.shippingAddress.street1}</p>
                                      </>
                                  ) : (
                                      <p>No Shipping Address - <span className="text-blue-500 cursor-pointer hover:underline">New</span></p>
                                  )}
                              </div>
                          </div>

                          <hr className="border-gray-200 dark:border-gray-700" />

                          <div>
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Other Details</h3>
                                <ChevronDown size={14} className="text-gray-400"/>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                                  <div className="flex justify-between"><span>Default Currency</span><span className="font-medium text-gray-800 dark:text-gray-200">{selectedVendor.currency.split('-')[0]}</span></div>
                                  <div className="flex justify-between"><span>Portal Status</span><span className={`font-medium ${selectedVendor.portalAccess ? 'text-green-600' : 'text-red-500'}`}>{selectedVendor.portalAccess ? "Enabled" : "Disabled"}</span></div>
                                  <div className="flex justify-between"><span>Vendor Language</span><span className="font-medium text-gray-800 dark:text-gray-200">{selectedVendor.language}</span></div>
                              </div>
                          </div>

                          <hr className="border-gray-200 dark:border-gray-700" />

                          <div>
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Persons</h3>
                                <Plus size={14} className="text-blue-500 cursor-pointer"/>
                              </div>
                              <p className="text-xs text-gray-400">No contact persons found.</p>
                          </div>

                          <hr className="border-gray-200 dark:border-gray-700" />

                          <div>
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bank Account Details</h3>
                                <Plus size={14} className="text-blue-500 cursor-pointer"/>
                              </div>
                              <p className="text-xs text-gray-400">No bank account added yet</p>
                          </div>

                          <hr className="border-gray-200 dark:border-gray-700" />
                          
                          <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Record Info</h3>
                              <ChevronDown size={14} className="text-gray-400"/>
                          </div>

                      </div>

                      {/* Right Area */}
                      <div className="flex-1 p-6 space-y-8">
                          
                          {/* What's Next */}
                          <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                                 ✨ WHAT'S NEXT?
                              </h3>
                              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                                Create a <b>purchase order</b> or <b>record a bill</b> for your vendor purchases.
                              </p>
                              <div className="flex gap-2">
                                <Button className="bg-blue-600 text-white text-xs h-8">New Bill</Button>
                                <Button variant="secondary" className="text-xs h-8 bg-white dark:bg-gray-700">New Purchase Order</Button>
                                <Button variant="secondary" className="text-xs h-8 bg-white dark:bg-gray-700 px-2"><MoreHorizontal size={14}/></Button>
                              </div>
                          </div>

                          {/* Payables */}
                          <div>
                              <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Payment due period</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedVendor.paymentTerms}</p>
                                </div>
                              </div>
                              
                              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Payables</h3>
                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-xs">
                                      <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                          <tr>
                                              <th className="px-4 py-2 font-medium">Currency</th>
                                              <th className="px-4 py-2 font-medium text-right">Outstanding Payables</th>
                                              <th className="px-4 py-2 font-medium text-right">Unused Credits</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{selectedVendor.currency}</td>
                                              <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">₹0.00</td>
                                              <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">₹0.00</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                              <button className="text-blue-500 text-xs font-medium mt-3 hover:underline">Enter Opening Balance</button>
                          </div>

                          {/* Expenses Chart Placeholder */}
                          <div>
                              <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Expenses</h3>
                                    <p className="text-[10px] text-gray-400">This chart is displayed in the organization's base currency.</p>
                                  </div>
                                  <div className="flex gap-2 text-xs">
                                      <select className="border rounded px-2 py-1 bg-transparent"><option>Last 6 Months</option></select>
                                      <select className="border rounded px-2 py-1 bg-transparent"><option>Accrual</option></select>
                                  </div>
                              </div>
                              <div className="h-32 border-b border-gray-200 dark:border-gray-700 relative flex items-end justify-between px-2 pb-1">
                                  {/* Mock Chart Lines */}
                                  {[10, 20, 15, 30, 25, 40].map((h, i) => (
                                      <div key={i} className="w-8 bg-gray-100 dark:bg-gray-700 rounded-t" style={{ height: `${h}%` }}></div>
                                  ))}
                              </div>
                              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-2">
                                  <span>Apr 2026</span><span>May 2026</span><span>Jun 2026</span><span>Jul 2026</span><span>Aug 2026</span><span>Sep 2026</span>
                              </div>
                          </div>

                          {/* Timeline */}
                          <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6">
                              <div className="relative">
                                  <div className="absolute -left-[31px] top-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                      <p className="text-xs text-gray-500 mb-1">29/10/2026 05:08 PM</p>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Contact person added</p>
                                      <p className="text-xs text-gray-500 mt-1">Contact person Fidha has been created by Fidha Fathima</p>
                                  </div>
                              </div>
                              <div className="relative">
                                  <div className="absolute -left-[31px] top-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                      <p className="text-xs text-gray-500 mb-1">29/10/2026 05:08 PM</p>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Contact added</p>
                                      <p className="text-xs text-gray-500 mt-1">Contact created by Fidha Fathima</p>
                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>
              )}

              {activeTab === "Statement" && (
                  <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                          <div className="flex gap-2">
                              <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800"><option>This Month</option></select>
                              <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800"><option>Filter By: All</option></select>
                          </div>
                          <div className="flex gap-2">
                              <Button variant="secondary" className="h-8 px-3 text-xs"><Printer size={14} className="mr-1"/> Print</Button>
                              <Button variant="secondary" className="h-8 px-3 text-xs"><Download size={14} className="mr-1"/> PDF</Button>
                              <Button variant="secondary" className="h-8 px-3 text-xs"><Mail size={14} className="mr-1"/> Send Email</Button>
                          </div>
                      </div>

                      <div className="text-center mb-8">
                          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Vendor Statement For {selectedVendor.displayName}</h2>
                          <p className="text-sm text-gray-500">From 01/10/2026 To 31/10/2026</p>
                      </div>

                      <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-3xl">
                          <div className="flex justify-between items-start mb-12">
                              <div className="text-xs">
                                  <p className="font-bold text-gray-800 mb-1 text-sm">Fidha</p>
                                  <p className="text-gray-600">Keralam</p>
                                  <p className="text-gray-600">India</p>
                                  <p className="text-gray-600">fidh3549@gmail.com</p>
                              </div>
                              <div className="text-right">
                                  <h1 className="text-2xl font-serif text-gray-800 tracking-wide mb-2">Statement of Accounts</h1>
                                  <p className="text-xs text-gray-600">01/10/2026 To 31/10/2026</p>
                              </div>
                          </div>

                          <div className="flex justify-between mb-8 text-xs">
                              <div>
                                  <p className="text-gray-500 mb-1">To</p>
                                  <p className="text-blue-600 font-medium underline">{selectedVendor.displayName}</p>
                              </div>
                          </div>

                          <table className="w-full text-left text-xs mb-8">
                              <thead className="bg-gray-100 border-y border-gray-300">
                                  <tr>
                                      <th colSpan={4} className="py-2 px-3 font-bold text-gray-800">Account Summary</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr className="border-b border-gray-200">
                                      <td colSpan={3} className="py-2 px-3 text-gray-600">Opening Balance</td>
                                      <td className="py-2 px-3 text-right text-gray-800">₹ 0.00</td>
                                  </tr>
                                  <tr className="border-b border-gray-200">
                                      <td colSpan={3} className="py-2 px-3 text-gray-600">Billed Amount</td>
                                      <td className="py-2 px-3 text-right text-gray-800">₹ 0.00</td>
                                  </tr>
                                  <tr className="border-b border-gray-200">
                                      <td colSpan={3} className="py-2 px-3 text-gray-600">Amount Paid</td>
                                      <td className="py-2 px-3 text-right text-gray-800">₹ 0.00</td>
                                  </tr>
                                  <tr className="border-b-2 border-gray-400 bg-gray-50">
                                      <td colSpan={3} className="py-2 px-3 font-bold text-gray-800">Balance Due</td>
                                      <td className="py-2 px-3 text-right font-bold text-gray-800">₹ 0.00</td>
                                  </tr>
                              </tbody>
                          </table>

                          <table className="w-full text-left text-xs">
                              <thead className="bg-gray-700 text-white">
                                  <tr>
                                      <th className="py-2 px-3">Date</th>
                                      <th className="py-2 px-3">Transactions Details</th>
                                      <th className="py-2 px-3 text-right">Amount</th>
                                      <th className="py-2 px-3 text-right">Payments</th>
                                      <th className="py-2 px-3 text-right">Balance</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-gray-500">01/10/2026</td>
                                      <td className="py-3 px-3 text-gray-800">***Opening Balance***</td>
                                      <td className="py-3 px-3 text-right text-gray-800">0.00</td>
                                      <td className="py-3 px-3 text-right text-gray-800"></td>
                                      <td className="py-3 px-3 text-right text-gray-800">0.00</td>
                                  </tr>
                              </tbody>
                              <tfoot>
                                  <tr>
                                      <td colSpan={4} className="py-3 px-3 text-right font-bold text-gray-800 border-t border-gray-300">Balance Due</td>
                                      <td className="py-3 px-3 text-right font-bold text-gray-800 border-t border-gray-300">₹ 0.00</td>
                                  </tr>
                              </tfoot>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab !== "Overview" && activeTab !== "Statement" && (
                  <div className="p-6 text-center text-gray-500 py-20">
                      No data found for {activeTab}.
                  </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default VendorsPage;