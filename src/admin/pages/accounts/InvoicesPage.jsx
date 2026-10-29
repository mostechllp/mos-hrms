import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateInvoiceStatus, deleteInvoice } from "../../store/slices/accounts/invoicesSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, Play, FileText, CheckCircle2,
  Mail, Printer, CreditCard, ChevronRight
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteInvoice(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedInvoice?.id === deleteTarget.id) {
        setSelectedInvoice(null); 
      }
    }
  };

  const handleStatusChange = (status) => {
    if (selectedInvoice) {
      dispatch(updateInvoiceStatus({ id: selectedInvoice.id, status }));
      setSelectedInvoice({ ...selectedInvoice, status });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Invoices</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/invoices/new")} 
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

      {invoices.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          

          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">It's time to get paid!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-center">
            We don't want to boast too much, but sending amazing invoices and getting paid is easier than ever. Go ahead! Try it yourself.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
                <Button onClick={() => navigate("/admin/accounts/sales/invoices/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-sm font-semibold tracking-wide">
                  New Invoice
                </Button>
                <Button variant="secondary" className="px-6 py-3 rounded text-sm font-semibold tracking-wide bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  New Recurring Invoice
                </Button>
            </div>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Invoices</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-24 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-12">Life cycle of an Invoice</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 mb-16">
               
               <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 flex items-center gap-2 text-blue-600 w-28 justify-center">
                 <Edit2 size={14} />
                 <span className="text-xs font-bold">DRAFT</span>
               </div>
               
               <div className="w-8 h-px bg-blue-200"></div>
               
               <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-md p-2 flex items-center gap-2 text-green-600 w-28 justify-center">
                 <Mail size={14} />
                 <span className="text-xs font-bold">SENT</span>
               </div>

               <div className="w-8 h-px bg-gray-300"></div>

               <div className="flex flex-col gap-2 relative">
                  <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-px h-12 bg-gray-300"></div>
                  <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 flex items-center gap-2 text-blue-600 w-28 justify-center">
                    <CreditCard size={14} />
                    <span className="text-xs font-bold">UNPAID</span>
                  </div>
               </div>

               <div className="w-8 h-px bg-gray-300 ml-4"></div>

               <div className="flex flex-col gap-2">
                  <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-md p-2 flex items-center gap-2 text-red-600 w-28 justify-center">
                    <X size={14} />
                    <span className="text-xs font-bold">OVERDUE</span>
                  </div>
                  <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-md p-2 flex items-center gap-2 text-green-600 w-28 justify-center">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-bold">PARTIALLY PAID</span>
                  </div>
               </div>

               <div className="w-8 h-px bg-gray-300"></div>

               <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-md p-2 flex items-center gap-2 text-green-600 w-28 justify-center">
                 <CheckCircle2 size={14} />
                 <span className="text-xs font-bold">PAID</span>
               </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
                <div>
                    <div className="w-10 h-10 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><FileText size={20}/></div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Brand Your Invoices</h4>
                    <p className="text-sm text-gray-500 mb-2">Choose your favourite theme from our gallery of templates and personalize your invoice to reflect your brand.</p>
                    <a href="#" className="text-blue-500 text-sm hover:underline">Learn More</a>
                </div>
                <div>
                    <div className="w-10 h-10 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4"><CreditCard size={20}/></div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Collect Online Payments</h4>
                    <p className="text-sm text-gray-500 mb-2">Configure a payment gateway and collect online payments from your customer with ease.</p>
                    <a href="#" className="text-blue-500 text-sm hover:underline">Learn More</a>
                </div>
                <div>
                    <div className="w-10 h-10 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4"><UserIcon size={20}/></div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Customer Portal</h4>
                    <p className="text-sm text-gray-500 mb-2">Enable Customer Portal for your customers and allow them to accept quotes, keep track of invoices and make payments.</p>
                    <a href="#" className="text-blue-500 text-sm hover:underline">Learn More</a>
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
                placeholder="Search invoices..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Invoice # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Invoice Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedInvoice(inv)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{inv.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {inv.currency} {inv.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {inv.currency} {inv.balanceDue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           inv.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 
                           inv.status === 'Sent' ? 'bg-blue-100 text-blue-600' :
                           inv.status === 'Paid' ? 'bg-green-100 text-green-600' :
                           'bg-orange-100 text-orange-600'
                       }`}>
                         {inv.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/invoices/edit/${inv.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(inv)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedInvoice && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedInvoice(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedInvoice.invoiceNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedInvoice.status === 'Draft' ? 'bg-gray-200 text-gray-700' : 
                    selectedInvoice.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {selectedInvoice.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Edit2 size={14} className="mr-1"/> Edit
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Mail size={14} className="mr-1"/> Send
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Printer size={14} className="mr-1"/> PDF/Print
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <CreditCard size={14} className="mr-1"/> Record Payment
                    </Button>
              </div>

              {/* What's Next Banner */}
              {selectedInvoice.status === 'Draft' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                     ✨ WHAT'S NEXT?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                    Send this Invoice to your customer or mark it as Sent.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleStatusChange('Sent')} className="bg-blue-600 text-white text-xs h-8">Send Invoice</Button>
                    <Button variant="secondary" onClick={() => handleStatusChange('Sent')} className="text-xs h-8">Mark As Sent</Button>
                  </div>
                </div>
              )}

              {/* PDF Preview */}
              <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative">
                    {/* Draft Watermark */}
                    {selectedInvoice.status === 'Draft' && (
                        <div className="absolute top-0 left-0 bg-gray-400 text-white px-4 py-2 text-sm font-bold -rotate-45 transform -translate-x-8 translate-y-4 shadow-sm">
                            Draft
                        </div>
                    )}
                    
                    {/* PDF Header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
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
                            <p><span className="text-gray-500 inline-block w-20">#</span> : {selectedInvoice.invoiceNumber}</p>
                            <p><span className="text-gray-500 inline-block w-20">Invoice Date</span> : {selectedInvoice.invoiceDate}</p>
                            <p><span className="text-gray-500 inline-block w-20">Terms</span> : {selectedInvoice.paymentTerms}</p>
                            <p><span className="text-gray-500 inline-block w-20">Due Date</span> : {selectedInvoice.dueDate}</p>
                        </div>
                        <div className="w-1/3 bg-gray-50"></div>
                    </div>

                    {/* Billing Info */}
                    <div className="border border-gray-300 p-2 mb-4 text-xs">
                        <p className="font-bold text-gray-800 mb-1">Bill To</p>
                        <p className="text-blue-600 font-medium underline">{selectedInvoice.customerName}</p>
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
                            {selectedInvoice.items.map((item, idx) => (
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
                                <p className="text-gray-800">{selectedInvoice.notes}</p>
                            </div>
                        </div>
                        <div className="w-64">
                            <div className="flex justify-between p-2 border-b border-gray-300">
                                <span className="text-gray-500">Sub Total</span>
                                <span className="text-gray-900">{selectedInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-2 border-b border-gray-300">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900">₹{selectedInvoice.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50">
                                <span className="font-bold text-gray-900">Balance Due</span>
                                <span className="font-bold text-gray-900">₹{selectedInvoice.balanceDue.toFixed(2)}</span>
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
                    <div className="text-right text-[10px] text-gray-400 mt-4">1</div>
                </div>

              {/* Journal Section below PDF */}
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mb-4">Journal</h3>
                <p className="text-sm text-gray-500">
                    Journal entries will not be available for Invoices in the {selectedInvoice.status} state.
                </p>
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
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${deleteTarget?.invoiceNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

// Simple Icon replacement for User inside the file
const UserIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export default InvoicesPage;