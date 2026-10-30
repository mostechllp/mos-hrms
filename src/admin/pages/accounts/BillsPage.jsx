import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteBill } from "../../store/slices/accounts/billsSlice";
import { 
  Plus, MoreHorizontal, Search, Filter, ChevronDown, 
  Edit2, X, Mail, Share2, Printer, CheckCircle2, Sparkles, 
  ArrowUpDown, PlayCircle, Eye, Trash2, FileText, Download, Upload, Settings
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const BillsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bills = useSelector((state) => state?.bills?.bills || []);

  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPdfView, setShowPdfView] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const filteredBills = bills.filter(
    (b) =>
      b.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteBill(idToDelete)).unwrap();
      
      // ✅ Reset ALL delete-related state together, after success
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteError(null);
      
      // Close drawer if the deleted bill was selected
      if (selectedBill?.id === idToDelete) {
        setSelectedBill(null);
      }
    } catch (err) {
      console.error("Failed to delete bill:", err);
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete bill. Please try again.");
      // ⚠️ Do NOT close modal — keep it open so user sees the error
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return; // Prevent closing while request in flight
    setDeleteTarget(null);
    setDeleteError(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">All Bills</h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <Filter size={16} />
          </button>
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <Printer size={16} />
          </button>
          
          <div className="flex items-center rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button 
              onClick={() => navigate("/admin/accounts/purchases/bills/new")} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> New
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 border-l border-blue-400">
              <ChevronDown size={14} />
            </button>
          </div>

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

      {/* Content Area */}
      {bills.length === 0 ? (
        <div className="flex flex-col items-center pt-10 pb-20 px-6 overflow-y-auto">
          <h2 className="text-2xl font-normal text-gray-800 mb-2">Owe money? It's good to pay bills on time!</h2>
          <p className="text-gray-500 text-sm mb-8 text-center max-w-md">
            If you've purchased something for your business, and you don't have to repay it immediately, then you can record it as a bill.
          </p>
          <Button onClick={() => navigate("/admin/accounts/purchases/bills/new")} className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5">
            CREATE A BILL
          </Button>
          <button className="text-blue-600 text-sm mt-4 hover:underline">Import Bills</button>


          <div className="w-full max-w-4xl mt-16 text-center">
             <h3 className="text-lg font-medium text-gray-800 mb-8">Life cycle of a Bill</h3>
             <div className="flex justify-center items-center gap-4 text-xs font-semibold text-gray-600">
                <div className="border border-blue-200 bg-blue-50 text-blue-600 rounded px-3 py-2 flex items-center gap-2"><span className="text-lg">🛍️</span> PURCHASE ITEMS</div>
                <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                <div className="border border-blue-200 bg-blue-50 text-blue-600 rounded px-3 py-2 flex items-center gap-2"><span className="text-lg">📝</span> RECORD BILL</div>
                <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                <div className="flex flex-col gap-2">
                   <div className="border border-blue-200 bg-blue-50 text-blue-600 rounded px-3 py-2 flex items-center gap-2"><span className="text-lg">💵</span> RECORD PARTIAL PAYMENT</div>
                   <div className="border border-green-200 bg-green-50 text-green-600 rounded px-3 py-2 flex items-center gap-2"><span className="text-lg">💰</span> RECORD PAYMENT</div>
                </div>
             </div>
             
             <div className="mt-12 text-left inline-block">
                <h4 className="text-base font-medium text-gray-800 mb-4">In the Bills module, you can:</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Create bills and record payments</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Apply credits to bills</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Make online payments</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Allocate landed costs</li>
                </ul>
             </div>
          </div>
        </div>
      ) : (
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
                placeholder="Search bills..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Bill# <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedBill(bill)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">
                      {bill.billNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{bill.vendor}</td>
                    <td className="px-4 py-3 text-gray-500">{bill.date}</td>
                    <td className="px-4 py-3 text-gray-500">{bill.dueDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100 text-right">
                      ₹{bill.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                           bill.status === 'Open' ? 'bg-green-100 text-green-700' : 
                           bill.status === 'Draft' ? 'bg-gray-200 text-gray-700' :
                           'bg-blue-100 text-blue-700'
                       }`}>
                         {bill.status}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedBill(bill)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/bills/edit/${bill.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(bill)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedBill && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-sm"
            onClick={() => setSelectedBill(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-[#F8F9FA] dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            <div className="flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center justify-between px-6 py-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedBill.billNumber || selectedBill.vendor}
                </h2>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                   <button 
                      onClick={() => navigate(`/admin/accounts/purchases/bills/edit/${selectedBill.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors"
                   >
                      <Edit2 size={14} /> Edit
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Printer size={14} /> PDF/Print <ChevronDown size={14} className="ml-0.5" />
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <CheckCircle2 size={14} /> Convert to Open
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <CheckCircle2 size={14} /> Record Payment <ChevronDown size={14} className="ml-0.5" />
                   </button>
                   <button className="p-1.5 ml-1 hover:bg-gray-100 rounded"><MoreHorizontal size={18} /></button>
                   <div className="w-px h-4 bg-gray-300 mx-2"></div>
                   <button onClick={() => setSelectedBill(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                      <X size={20} />
                   </button>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100">
                <div className="bg-blue-50/50 border border-blue-100 rounded-md p-4 flex items-center justify-between">
                   <div className="flex items-start gap-3">
                      <Sparkles size={20} className="text-blue-500 mt-0.5" />
                      <div>
                         <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">WHAT'S NEXT?</h3>
                         <p className="text-sm text-gray-600 mt-1">Bill has been created. Convert the bill to the open status to record payment.</p>
                      </div>
                   </div>
                   <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 h-8">
                      Convert to Open
                   </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
               <div className="w-full max-w-4xl flex justify-end mb-4">
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer select-none italic">
                     Show PDF View
                     <div onClick={() => setShowPdfView(!showPdfView)} className={`w-9 h-5 rounded-full relative transition-colors ${showPdfView ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${showPdfView ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
                     </div>
                  </label>
               </div>

               <div className="w-full max-w-4xl bg-white text-black shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-200 relative flex flex-col min-h-[1000px] mb-8">
                  {selectedBill.status === 'Draft' && (
                     <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
                        <div className="bg-[#8A949E] text-white text-sm font-semibold tracking-wider text-center py-1.5 shadow-md transform -rotate-45 translate-x-[-35px] translate-y-[25px] w-[160px]">
                           Draft
                        </div>
                     </div>
                  )}

                  <div className="p-10 md:p-16 flex-1 flex flex-col font-sans">
                     <div className="flex justify-between items-start mb-16 mt-4">
                        <div className="text-sm space-y-1">
                           <div className="font-bold text-[15px] text-gray-900 mb-1">Fidha</div>
                           <div className="text-gray-600">Kerala</div>
                           <div className="text-gray-600">India</div>
                           <div className="text-gray-600 text-xs mt-2">fidh3549@gmail.com</div>
                        </div>
                        <div className="text-right">
                           <h1 className="text-[36px] font-serif text-black tracking-wide mb-2 uppercase leading-tight">BILL</h1>
                           <p className="text-[13px] font-bold text-gray-700">Bill# {selectedBill.billNumber}</p>
                           <div className="mt-4">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Balance Due</p>
                              <p className="text-xl font-bold text-gray-900">₹{selectedBill.balanceDue.toFixed(2)}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between mb-8 text-[13px]">
                        <div className="space-y-6 mt-16">
                           <div>
                              <p className="text-gray-500 mb-1">Bill From</p>
                              <p className="font-semibold text-[#3B82F6] cursor-pointer hover:underline">{selectedBill.vendor}</p>
                           </div>
                        </div>
                        
                        <div className="text-right space-y-2 mt-16">
                           <p className="text-gray-600"><span className="mr-6">Bill Date :</span> <span className="font-medium text-gray-900">{selectedBill.date}</span></p>
                           <p className="text-gray-600"><span className="mr-6">Due Date :</span> <span className="font-medium text-gray-900">{selectedBill.dueDate}</span></p>
                           <p className="text-gray-600"><span className="mr-6">Terms :</span> <span className="font-medium text-gray-900">{selectedBill.paymentTerms}</span></p>
                        </div>
                     </div>

                     <div className="mb-8 flex-1 mt-6">
                        <table className="w-full text-left text-[13px] border-collapse">
                           <thead>
                              <tr className="bg-[#333333] text-white">
                                 <th className="px-3 py-2 font-medium w-10 text-center">#</th>
                                 <th className="px-3 py-2 font-medium">Item & Description</th>
                                 <th className="px-3 py-2 font-medium text-right w-20">Qty</th>
                                 <th className="px-3 py-2 font-medium text-right w-24">Rate</th>
                                 <th className="px-3 py-2 font-medium text-right w-28">Amount</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200">
                              {selectedBill.items.map((item, idx) => (
                                 <tr key={idx}>
                                    <td className="px-3 py-4 text-center text-gray-700 align-top">{idx + 1}</td>
                                    <td className="px-3 py-4 align-top">
                                       <div className="font-medium text-gray-900">{item.name}</div>
                                       {item.description && <div className="text-gray-500 text-xs mt-1">{item.description}</div>}
                                    </td>
                                    <td className="px-3 py-4 text-right align-top text-gray-700">{Number(item.quantity).toFixed(2)}</td>
                                    <td className="px-3 py-4 text-right align-top text-gray-700">{Number(item.rate).toFixed(2)}</td>
                                    <td className="px-3 py-4 text-right align-top font-medium text-gray-900">{Number(item.amount).toFixed(2)}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     <div className="flex justify-end mb-16">
                        <div className="w-[45%] space-y-3 text-[13px]">
                           <div className="flex justify-between py-1 text-gray-600">
                              <span>Sub Total</span>
                              <span className="font-medium text-gray-900">{Number(selectedBill.subTotal).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between py-2 border-t border-gray-100">
                              <span className="font-bold text-gray-900">Total</span>
                              <span className="font-bold text-gray-900">₹{Number(selectedBill.total).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between py-2 px-3 bg-[#F3F4F6] rounded">
                              <span className="font-bold text-gray-900">Balance Due</span>
                              <span className="font-bold text-gray-900">₹{Number(selectedBill.balanceDue).toFixed(2)}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto pt-16">
                        <p className="text-[13px] text-gray-700">
                           Authorized Signature <span className="inline-block w-64 border-b border-gray-400 ml-2"></span>
                        </p>
                     </div>
                  </div>
               </div>

               <div className="w-full max-w-4xl border-t border-gray-300 pt-4">
                  <div className="flex gap-6 border-b border-gray-200">
                     <button className="pb-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600">Journal</button>
                  </div>
                  <p className="py-4 text-xs text-gray-500">Journal entries will not be available for Bills in the Draft state.</p>
               </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Bill"
        message={
          deleteError 
            ? deleteError 
            : isDeleting 
              ? "Deleting bill, please wait..." 
              : `Are you sure you want to delete bill ${deleteTarget?.billNumber || ""}? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
      
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default BillsPage;