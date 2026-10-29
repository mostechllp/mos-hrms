import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateCreditNoteStatus, deleteCreditNote } from "../../store/slices/accounts/creditNotesSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Printer, Play, CreditCard, XCircle,
  Mail,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const CreditNotesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const creditNotes = useSelector((state) => state.creditNotes.creditNotes);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredNotes = creditNotes.filter(
    (n) =>
      n.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.creditNoteNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteCreditNote(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedNote?.id === deleteTarget.id) {
        setSelectedNote(null); 
      }
    }
  };

  const handleStatusChange = (status) => {
    if (selectedNote) {
      dispatch(updateCreditNoteStatus({ id: selectedNote.id, status }));
      setSelectedNote({ ...selectedNote, status });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Credit Notes</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/credit-notes/new")} 
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

      {creditNotes.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Handle Returns and Adjustments With Credit Notes</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl text-center">
            Create credit notes for returns, refunds, or invoice corrections without modifying the original invoice.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/credit-notes/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Create Credit Note
            </Button>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Credit Notes</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-24 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-16">Life cycle of a Credit Note</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
                
                {/* Left Branches */}
                <div className="flex flex-col gap-6">
                    <div className="border border-orange-200 bg-orange-50 dark:bg-orange-900/10 rounded-md p-3 flex items-center gap-2 text-orange-600 w-52 shadow-sm">
                        <div className="w-5 h-5 rounded-full border border-orange-400 flex items-center justify-center"><span className="text-[10px]">↺</span></div>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Product Returned</span>
                    </div>
                    <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-md p-3 flex items-center gap-2 text-red-600 w-52 shadow-sm">
                        <XCircle size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Order Cancelled</span>
                    </div>
                </div>

                {/* Connector */}
                <div className="hidden md:block w-16 relative h-24">
                    <div className="absolute top-1/4 left-0 w-full border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute top-3/4 left-0 w-full border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute left-0 top-1/4 h-1/2 border-l-2 border-dashed border-gray-300"></div>
                </div>

                {/* Main Node */}
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-md p-3 flex items-center gap-2 text-blue-600 w-40 justify-center shadow-sm">
                    <FileText size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Credit Notes</span>
                </div>

                {/* Connector */}
                <div className="hidden md:block w-16 relative h-24">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute right-0 top-1/4 h-1/2 border-r-2 border-dashed border-gray-300"></div>
                    <div className="absolute top-1/4 right-0 w-full border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute top-3/4 right-0 w-full border-t-2 border-dashed border-gray-300"></div>
                </div>

                {/* Right Branches */}
                <div className="flex flex-col gap-6">
                    <div className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md p-3 flex items-center gap-2 text-blue-600 w-52 shadow-sm">
                        <CreditCard size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Refund</span>
                    </div>
                    <div className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md p-3 flex items-center gap-2 text-blue-600 w-52 shadow-sm">
                        <UserIcon size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Credits</span>
                    </div>
                </div>

                {/* Arrow to future invoices */}
                <div className="hidden md:flex items-center">
                    <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                    <ChevronRight className="text-gray-300" size={16} />
                </div>
                <div className="border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-md p-3 flex items-center gap-2 text-green-600 w-52 shadow-sm">
                    <FileText size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Apply to Future Invoices</span>
                </div>

            </div>

            <div className="mt-24 text-center max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-12">
              <h4 className="text-xl text-gray-800 dark:text-gray-200 mb-6 font-medium">In the Credit Notes module, you can:</h4>
              <div className="space-y-4 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Issue refunds and credits to your customers and apply them to invoices</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Record and manage excess payments as credits. <a href="#" className="text-blue-500 hover:underline">Learn More</a></p>
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
                placeholder="Search credit notes..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Credit Note # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Credits Remaining</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedNote(note)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {note.creditNoteNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{note.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{note.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      ₹{note.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      ₹{note.creditsRemaining.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           note.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 
                           note.status === 'Open' ? 'bg-blue-100 text-blue-600' :
                           note.status === 'Closed' ? 'bg-green-100 text-green-600' :
                           'bg-purple-100 text-purple-600'
                       }`}>
                         {note.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedNote(note)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/credit-notes/edit/${note.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(note)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedNote && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedNote(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedNote.creditNoteNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedNote.status === 'Draft' ? 'bg-gray-200 text-gray-700' : 
                    selectedNote.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {selectedNote.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedNote(null)} className="p-1 text-gray-500 hover:text-gray-800">
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
                    <Mail size={14} className="mr-1"/> Email
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Printer size={14} className="mr-1"/> PDF/Print
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <RefreshCw size={14} className="mr-1"/> Refund
                    </Button>
              </div>

              {/* What's Next Banner */}
              {selectedNote.status === 'Draft' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                     ✨ WHAT'S NEXT?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                    Go ahead and email this credit note to your customer or simply convert it to open.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleStatusChange('Open')} className="bg-blue-600 text-white text-xs h-8">Send Credit Note</Button>
                    <Button variant="secondary" onClick={() => handleStatusChange('Open')} className="text-xs h-8">Convert to Open</Button>
                  </div>
                </div>
              )}

              {/* PDF Preview */}
              <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative mt-4">
                    {/* Draft Watermark */}
                    {selectedNote.status === 'Draft' && (
                        <div className="absolute top-0 left-0 bg-gray-400 text-white px-4 py-2 text-sm font-bold -rotate-45 transform -translate-x-8 translate-y-4 shadow-sm">
                            Draft
                        </div>
                    )}
                    
                    {/* PDF Header */}
                    <div className="flex justify-between items-start mb-6 pb-4">
                        <div className="text-xs">
                            <p className="font-bold text-gray-800 mb-1 text-sm">Fidha</p>
                            <p className="text-gray-600">Keralam</p>
                            <p className="text-gray-600">India</p>
                            <p className="text-gray-600">fidh3549@gmail.com</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-serif text-gray-800 tracking-wide mb-2">CREDIT NOTE</h1>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="flex border border-gray-300 mb-4 text-xs">
                        <div className="flex-1 p-2 space-y-1 border-r border-gray-300">
                            <p><span className="text-gray-500 inline-block w-20">#</span> : {selectedNote.creditNoteNumber}</p>
                            <p><span className="text-gray-500 inline-block w-20">Credit Date</span> : {selectedNote.date}</p>
                        </div>
                        <div className="w-1/3 bg-gray-50"></div>
                    </div>

                    {/* Billing Info */}
                    <div className="border border-gray-300 p-2 mb-4 text-xs">
                        <p className="font-bold text-gray-800 mb-1">Bill To</p>
                        <p className="text-blue-600 font-medium underline">{selectedNote.customerName}</p>
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
                            {selectedNote.items.map((item, idx) => (
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
                        </div>
                        <div className="w-64">
                            <div className="flex justify-between p-2 border-b border-gray-300">
                                <span className="text-gray-500">Sub Total</span>
                                <span className="text-gray-900">{selectedNote.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-2 border-b border-gray-300">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900">₹{selectedNote.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 font-bold">
                                <span className="text-gray-900">Credits Remaining</span>
                                <span className="text-gray-900">₹{selectedNote.creditsRemaining.toFixed(2)}</span>
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

              {/* Footer Template Info */}
              <div className="text-right mt-4 max-w-2xl mx-auto text-xs text-gray-500">
                  <p>PDF Template : 'Spreadsheet Template' <a href="#" className="text-blue-500 hover:underline">Change</a></p>
              </div>

              {/* Journal Section below PDF */}
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mb-4">Journal</h3>
                <p className="text-sm text-gray-500">
                    Journal entries will not be available for Credit Notes in the {selectedNote.status} state.
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
        title="Delete Credit Note"
        message={`Are you sure you want to delete credit note "${deleteTarget?.creditNoteNumber}"? This action cannot be undone.`}
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

export default CreditNotesPage;