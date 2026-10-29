import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileStatus, deleteProfile } from "../../store/slices/accounts/recurringInvoicesSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, Play, FileText, CheckCircle2,
  Mail, Printer, CreditCard, ChevronRight, RefreshCw, Info
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const RecurringInvoicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profiles = useSelector((state) => state.recurringInvoices.profiles);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const filteredProfiles = profiles.filter(
    (p) =>
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteProfile(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedProfile?.id === deleteTarget.id) {
        setSelectedProfile(null); 
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Recurring Invoices</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/recurring/new")} 
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

      {profiles.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          

          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Create. Set. Repeat.</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Set up a profile to periodically create and send invoices to your customers.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/recurring/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Create New Recurring Invoice
            </Button>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Recurring Invoices</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-24 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-12">Life cycle of a Recurring Invoice</h3>
            
            <div className="flex flex-col items-center justify-center gap-4 mb-16">
               
               <div className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md p-2 flex items-center gap-2 text-blue-600 w-48 justify-center shadow-sm">
                 <FileText size={14} />
                 <span className="text-xs font-bold uppercase tracking-wider">Recurring Profile</span>
               </div>
               
               <div className="h-8 w-px border-l-2 border-dashed border-blue-200"></div>
               
               <div className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md p-2 flex items-center gap-2 text-blue-600 w-48 justify-center shadow-sm">
                 <FileText size={14} />
                 <span className="text-xs font-bold uppercase tracking-wider">Invoices</span>
               </div>

               <div className="h-8 w-px border-l-2 border-dashed border-blue-200 relative">
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 h-px border-t-2 border-dashed border-blue-200"></div>
                   <div className="absolute top-full left-0 w-px h-8 border-l-2 border-dashed border-blue-200"></div>
                   <div className="absolute top-full right-0 w-px h-8 border-l-2 border-dashed border-blue-200"></div>
               </div>

               <div className="flex gap-4 mt-8">
                  <div className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md p-2 flex items-center gap-2 text-blue-600 w-40 justify-center shadow-sm">
                    <Edit2 size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Save as Draft</span>
                  </div>
                  <div className="border border-green-200 bg-white dark:bg-gray-800 rounded-md p-2 flex items-center gap-2 text-green-600 w-40 justify-center shadow-sm">
                    <Mail size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Sent Invoices</span>
                  </div>
                  <div className="border border-purple-200 bg-white dark:bg-gray-800 rounded-md p-2 flex items-center gap-2 text-purple-600 w-48 justify-center shadow-sm">
                    <CreditCard size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Charge Automatically</span>
                  </div>
               </div>
            </div>

            <div className="mt-16 text-center">
              <h4 className="text-lg text-gray-800 dark:text-gray-200 mb-6">In the Recurring Invoices module, you can:</h4>
              <div className="space-y-3 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Automate sending of repeat invoices based on a schedule of your choice</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Automatically or manually charge your customer's card</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Send email notification to customers in case of payment failure <a href="#" className="text-blue-500 hover:underline">Learn More</a></p>
              </div>
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
                placeholder="Search profiles..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Profile Name <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Next Invoice Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {profile.profileName}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{profile.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{profile.repeatEvery}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{profile.startDate}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           profile.status === 'Active' ? 'bg-green-100 text-green-700' : 
                           profile.status === 'Stopped' ? 'bg-gray-200 text-gray-700' :
                           'bg-red-100 text-red-700'
                       }`}>
                         {profile.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/recurring/edit/${profile.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(profile)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedProfile && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedProfile(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {selectedProfile.profileName}
              </h2>
              <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-8 px-3 text-xs">
                     <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button className="h-8 px-3 text-xs bg-blue-600 text-white">
                     Create Invoice
                  </Button>
                  <button onClick={() => setSelectedProfile(null)} className="p-1 text-gray-500 hover:text-gray-800 ml-2">
                    <X size={20} />
                  </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {["Overview", "Next Invoice", "Recent Activities"].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 text-sm font-medium transition-colors ${
                            activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/30">
              
              {activeTab === "Overview" && (
                  <div className="flex h-full">
                      {/* Left Sidebar Details */}
                      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-6">
                          
                          <div>
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Details</h3>
                              <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                      <span className="text-gray-500">Profile Status:</span>
                                      <span className="font-semibold text-green-600 bg-green-50 px-1.5 rounded">{selectedProfile.status}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-500">Start Date:</span>
                                      <span className="text-gray-800 dark:text-gray-200">{selectedProfile.startDate}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-500">End Date:</span>
                                      <span className="text-gray-800 dark:text-gray-200">{selectedProfile.neverExpires ? "Never Expires" : selectedProfile.endDate}</span>
                                  </div>
                                  <div className="flex justify-between text-right">
                                      <span className="text-gray-500">Payment Terms:</span>
                                      <span className="text-gray-800 dark:text-gray-200">{selectedProfile.paymentTerms}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800 flex gap-2 items-start">
                             <Info size={16} className="shrink-0 mt-0.5" />
                             <p>Recurring Invoice preference has been set to "Create Invoices as Drafts"</p>
                          </div>

                          <div>
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Address</h3>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200">Billing Address</p>
                                  <p className="text-blue-600">{selectedProfile.customerName}</p>
                                  <p>v v<br/>bubvnv<br/>bvn<br/>nbvn bvnbv<br/>Aland Islands</p>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200">Shipping Address</p>
                                  <p>vcbvc</p>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Notes</h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Thanks for your business.</p>
                          </div>

                      </div>

                      {/* Right Area - Invoices List */}
                      <div className="flex-1 p-6">
                          {/* Metrics Row */}
                          <div className="grid grid-cols-3 gap-4 mb-8">
                             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-xs text-gray-500 mb-1">Invoice Amount</p>
                                 <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{selectedProfile.total.toFixed(2)}</p>
                             </div>
                             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-xs text-gray-500 mb-1">Next Invoice Date</p>
                                 <p className="text-lg font-semibold text-blue-600">{selectedProfile.startDate}</p>
                             </div>
                             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-xs text-gray-500 mb-1">Recurring Period</p>
                                 <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProfile.repeatEvery}</p>
                             </div>
                          </div>

                          {/* Child Invoices List */}
                          <div>
                              <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">All Child Invoices <ChevronDown size={14}/></h3>
                                  <p className="text-xs text-gray-500">Unpaid Invoices : ₹0.00</p>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                                  {selectedProfile.childInvoices.map((inv, idx) => (
                                      <div key={idx} className="flex justify-between items-start py-2">
                                          <div>
                                              <p className="font-medium text-blue-600 underline cursor-pointer">{inv.invoiceNumber}</p>
                                              <p className="text-xs text-gray-500 mt-1">{inv.date} <span className="ml-2 px-1 bg-gray-100 rounded text-[10px]">DRAFT</span></p>
                                              <p className="text-xs text-gray-400 mt-1 italic flex items-center gap-1"><RefreshCw size={10}/> Manually Added</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="font-semibold text-gray-900 dark:text-white">₹{inv.amount.toFixed(2)}</p>
                                              <Button variant="secondary" className="text-xs h-7 px-2 mt-1 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">Record Payment</Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === "Next Invoice" && (
                  <div className="p-6">
                      <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative mt-4">
                        {/* Active Watermark */}
                        <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-2 text-sm font-bold -rotate-45 transform -translate-x-8 translate-y-4 shadow-sm">
                            Active
                        </div>
                        
                        {/* PDF Header */}
                        <div className="flex justify-between items-start mb-6 pb-4">
                            <div className="text-xs">
                                <p className="font-bold text-gray-800 mb-1 text-sm">Fidha</p>
                                <p className="text-gray-600">Keralam</p>
                                <p className="text-gray-600">India</p>
                                <p className="text-gray-600">fidh3549@gmail.com</p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-serif text-gray-800 tracking-wide mb-2">TAX INVOICE</h1>
                            </div>
                        </div>

                        {/* Invoice Details Grid */}
                        <div className="flex border border-gray-300 mb-4 text-xs">
                            <div className="flex-1 p-2 space-y-1 border-r border-gray-300">
                                <p><span className="text-gray-500 inline-block w-20">#</span> : Will be generated automatically</p>
                                <p><span className="text-gray-500 inline-block w-20">Invoice Date</span> : {selectedProfile.startDate}</p>
                                <p><span className="text-gray-500 inline-block w-20">Terms</span> : {selectedProfile.paymentTerms}</p>
                                <p><span className="text-gray-500 inline-block w-20">Due Date</span> : {selectedProfile.startDate}</p>
                            </div>
                            <div className="w-1/3 bg-gray-50"></div>
                        </div>

                        {/* Billing Info */}
                        <div className="border border-gray-300 p-2 mb-4 text-xs">
                            <p className="font-bold text-gray-800 mb-1">Bill To</p>
                            <p className="text-blue-600 font-medium underline">{selectedProfile.customerName}</p>
                            <p className="text-gray-600 text-[10px] mt-1 leading-tight">
                                v v<br/>
                                bubvnv<br/>
                                bvn<br/>
                                nbvn bvnbv<br/>
                                Aland Islands
                            </p>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-left text-xs mb-4 border border-gray-300">
                            <thead className="bg-gray-100 border-b border-gray-300">
                                <tr>
                                    <th className="py-2 px-2 w-8 border-r border-gray-300 text-center">#</th>
                                    <th className="py-2 px-2 border-r border-gray-300">Item & Description</th>
                                    <th className="py-2 px-2 text-right border-r border-gray-300 w-16">Qty</th>
                                    <th className="py-2 px-2 text-right border-r border-gray-300 w-20">Rate</th>
                                    <th className="py-2 px-2 text-right w-24">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300">
                                {selectedProfile.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 px-2 border-r border-gray-300 text-center text-gray-500">{idx + 1}</td>
                                        <td className="py-2 px-2 border-r border-gray-300">
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                                        </td>
                                        <td className="py-2 px-2 text-right border-r border-gray-300 text-gray-700">{item.qty.toFixed(2)}<br/><span className="text-[9px] text-gray-400">cm</span></td>
                                        <td className="py-2 px-2 text-right border-r border-gray-300 text-gray-700">{item.rate.toFixed(2)}</td>
                                        <td className="py-2 px-2 text-right text-gray-700">{(item.qty * item.rate).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Bottom Section */}
                        <div className="flex border border-gray-300 text-xs">
                            <div className="flex-1 p-2 border-r border-gray-300 space-y-2">
                                <div>
                                    <p className="text-gray-500 text-[10px]">Total In Words</p>
                                    <p className="font-bold italic text-gray-800">Indian Rupee Three Hundred Thirty-Three Only</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-[10px]">Notes</p>
                                    <p className="text-gray-800">{selectedProfile.notes}</p>
                                </div>
                            </div>
                            <div className="w-64">
                                <div className="flex justify-between p-2 border-b border-gray-300">
                                    <span className="text-gray-500">Sub Total</span>
                                    <span className="text-gray-900">{selectedProfile.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-2 border-b border-gray-300">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-gray-900">₹{selectedProfile.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50">
                                    <span className="font-bold text-gray-900">Balance Due</span>
                                    <span className="font-bold text-gray-900">₹{selectedProfile.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-xs text-gray-500 flex justify-between items-end">
                            <div></div>
                            <div className="text-center">
                                <div className="w-48 h-px bg-gray-400 mb-1"></div>
                                <p className="text-[10px]">Authorized Signature</p>
                            </div>
                        </div>
                      </div>

                      <div className="text-right mt-4 max-w-2xl mx-auto">
                          <p className="text-xs text-gray-500">PDF Template : 'Spreadsheet Template' <a href="#" className="text-blue-500 hover:underline">Change</a></p>
                          <p className="text-xs text-blue-500 hover:underline cursor-pointer">( View sample PDF )</p>
                      </div>
                  </div>
              )}

              {activeTab === "Recent Activities" && (
                  <div className="p-6 text-center text-gray-500 py-20">
                      No recent activities found.
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
        title="Delete Recurring Invoice Profile"
        message={`Are you sure you want to delete profile "${deleteTarget?.profileName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default RecurringInvoicesPage;