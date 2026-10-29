import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateQuoteStatus, deleteQuote } from "../../store/slices/accounts/quotesSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, CheckCircle2, 
  Eye, Edit2, Trash2, X, Mail, Phone, FileText, Play
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const QuotesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const quotes = useSelector((state) => state.quotes.quotes);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredQuotes = quotes.filter(
    (q) =>
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteQuote(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedQuote?.id === deleteTarget.id) {
        setSelectedQuote(null); 
      }
    }
  };

  const handleStatusChange = (status) => {
    if (selectedQuote) {
      dispatch(updateQuoteStatus({ id: selectedQuote.id, status }));
      setSelectedQuote({ ...selectedQuote, status });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Quotes</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/quotes/new")} 
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

      {quotes.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Seal the deal.</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            With quotes, give your customers an offer they can't refuse!
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/quotes/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Create New Quote
            </Button>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Quotes</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-20 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-12">Life cycle of a Quote</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
               
               <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 flex items-center gap-2 shadow-sm w-40">
                 <FileText size={18} className="text-gray-500" />
                 <span className="text-sm font-medium">Draft A Quote</span>
               </div>
               
               <div className="hidden md:block w-8 h-px bg-gray-300"></div>
               
               <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 flex items-center gap-2 shadow-sm w-48">
                 <Mail size={18} className="text-blue-500" />
                 <span className="text-sm font-medium">Send To Customer</span>
               </div>

               <div className="hidden md:block w-8 h-px bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gray-300"></div>
               </div>

               <div className="flex flex-col gap-4">
                  <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 flex items-center gap-2 shadow-sm w-32">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Accept</span>
                  </div>
                  <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 flex items-center gap-2 shadow-sm w-32">
                    <X size={16} className="text-red-600" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Decline</span>
                  </div>
               </div>

               <div className="hidden md:block w-8 h-px bg-gray-300"></div>

               <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center gap-2 shadow-sm w-48">
                 <FileText size={18} className="text-blue-600" />
                 <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Convert To Invoice</span>
               </div>

            </div>

            <div className="mt-16 text-center">
              <h4 className="text-lg text-gray-800 dark:text-gray-200 mb-6">In the Quotes module, you can:</h4>
              <div className="space-y-3 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Customize your quote <a href="#" className="text-blue-500 hover:underline">Learn More</a></p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Convert an accepted quote into an invoice</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Know when a quote has been viewed, accepted, or declined <a href="#" className="text-blue-500 hover:underline">Learn More</a></p>
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
                placeholder="Search quotes..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Quote # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredQuotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedQuote(quote)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{quote.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{quote.date}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{quote.expiryDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {quote.currency} {quote.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           quote.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 
                           quote.status === 'Sent' ? 'bg-blue-100 text-blue-600' :
                           quote.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                           'bg-red-100 text-red-600'
                       }`}>
                         {quote.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedQuote(quote)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/quotes/edit/${quote.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(quote)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedQuote && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedQuote(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedQuote.quoteNumber}
                </h2>
                <p className="text-xs text-gray-500">Quote Details</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                <Button onClick={() => navigate(`/admin/accounts/sales/quotes/edit/${selectedQuote.id}`)} variant="secondary" className="px-3 py-1.5 text-xs h-8">
                  <Edit2 size={14} className="mr-1"/> Edit
                </Button>
                <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                  <Mail size={14} className="mr-1"/> Send
                </Button>
                <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                  <FileText size={14} className="mr-1"/> PDF/Print
                </Button>
                <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                  <Settings size={14} className="mr-1"/> Convert
                </Button>
              </div>

              {/* What's Next Section */}
              {selectedQuote.status === 'Draft' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                     ✨ WHAT'S NEXT?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                    Go ahead and email this quote to your customer or simply mark it as sent.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleStatusChange('Sent')} className="bg-blue-600 text-white text-xs h-8">Send Quote</Button>
                    <Button variant="secondary" onClick={() => handleStatusChange('Sent')} className="text-xs h-8">Mark As Sent</Button>
                  </div>
                </div>
              )}

              {/* Quote Details Card */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 relative">
                 <div className="absolute top-0 right-0 bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-semibold rounded-bl-lg">
                     {selectedQuote.status}
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {selectedQuote.quoteNumber} 
                 </h3>
                 <p className="text-sm text-gray-500 mb-6">Total : {selectedQuote.currency} {selectedQuote.total.toFixed(2)}</p>
                 
                 <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="text-gray-500 mb-1">Quote Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedQuote.date}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Expiry Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedQuote.expiryDate}</p>
                    </div>
                 </div>
              </div>

               {/* Customer Details */}
               <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="text-gray-500 mb-1">Customer Name</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedQuote.customerName}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedQuote.customerEmail || "-"}</p>
                    </div>
                  </div>
               </div>

               {/* Items Table */}
               <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Items</h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                              <tr>
                                  <th className="px-4 py-3">#</th>
                                  <th className="px-4 py-3">Item</th>
                                  <th className="px-4 py-3 text-right">Qty</th>
                                  <th className="px-4 py-3 text-right">Rate</th>
                                  <th className="px-4 py-3 text-right">Amount</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                              {selectedQuote.items.map((item, idx) => (
                                  <tr key={item.id}>
                                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                      <td className="px-4 py-3">
                                          <p className="font-medium text-blue-600 dark:text-blue-400">{item.name}</p>
                                          <p className="text-xs text-gray-500">{item.description}</p>
                                      </td>
                                      <td className="px-4 py-3 text-right">{item.qty}</td>
                                      <td className="px-4 py-3 text-right">{item.rate.toFixed(2)}</td>
                                      <td className="px-4 py-3 text-right font-medium">{(item.qty * item.rate).toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                          <tfoot className="bg-gray-50 dark:bg-gray-700/30">
                              <tr>
                                  <td colSpan={4} className="px-4 py-2 text-right text-gray-500 font-medium">Sub Total</td>
                                  <td className="px-4 py-2 text-right font-medium">{selectedQuote.subtotal.toFixed(2)}</td>
                              </tr>
                              <tr>
                                  <td colSpan={4} className="px-4 py-2 text-right text-gray-500 font-medium">Tax</td>
                                  <td className="px-4 py-2 text-right font-medium">{selectedQuote.taxTotal.toFixed(2)}</td>
                              </tr>
                              <tr>
                                  <td colSpan={4} className="px-4 py-3 text-right text-gray-800 dark:text-gray-200 font-bold">Total</td>
                                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{selectedQuote.total.toFixed(2)}</td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
               </div>

               {/* Notes & Terms */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Notes</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded border border-gray-100 dark:border-gray-700">{selectedQuote.notes || "No notes provided."}</p>
                   </div>
                   <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Terms and Conditions</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded border border-gray-100 dark:border-gray-700">{selectedQuote.terms || "No terms and conditions."}</p>
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
        title="Delete Quote"
        message={`Are you sure you want to delete quote "${deleteTarget?.quoteNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default QuotesPage;