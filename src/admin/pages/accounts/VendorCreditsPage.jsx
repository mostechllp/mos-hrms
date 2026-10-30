import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteVendorCredit } from "../../store/slices/accounts/vendorCreditsSlice";
import { 
  Plus, MoreHorizontal, ChevronDown, Edit2, Trash2, X, FileText, Eye, 
  Search, Filter, ArrowUpDown, PlayCircle, RotateCcw, ShieldCheck, Box, 
  CreditCard, RefreshCw, CheckCircle2, Download, Printer, Mail, Share2, Sparkles
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const VendorCreditsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vendorCredits = useSelector((state) => state.vendorCredits.vendorCredits);

  const [selectedCredit, setSelectedCredit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const filteredCredits = vendorCredits.filter(
    (c) =>
      c.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creditNoteNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteVendorCredit(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedCredit?.id === idToDelete) setSelectedCredit(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete.");
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">All Vendor Credits</h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/accounts/purchases/vendor-credits/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1 rounded">
            <Plus size={16} /> New
          </button>
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {vendorCredits.length === 0 ? (
        /* CUSTOM EMPTY STATE LAYOUT WITH LUCIDE ICONS */
        <div className="flex flex-col items-center pt-16 pb-20 px-6">
          

          <h2 className="text-2xl font-normal text-gray-800 mb-2">You deserve some credit too.</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-lg text-center">
            Create vendor credits and apply them to multiple bills when buying stuff from your vendor.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => navigate("/admin/accounts/purchases/vendor-credits/new")} className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5 rounded font-semibold">
              CREATE VENDOR CREDITS
            </button>
            <button className="text-blue-600 text-sm hover:underline">Import Vendor Credits</button>
          </div>

          {/* Life Cycle Section with Lucide Icons */}
          <div className="w-full max-w-6xl mt-20 text-center border-t border-gray-200 pt-12">
             <h3 className="text-lg font-medium text-gray-800 mb-12">Life cycle of a Vendor Credit</h3>
             
             <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold text-gray-600">
                {/* Step 1 */}
                <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                   <Box size={16} className="text-blue-500"/> PRODUCT RETURNED / CANCELLED
                </div>
                <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                
                {/* Step 2 */}
                <div className="border border-blue-200 bg-blue-50 text-blue-700 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                   <FileText size={16} className="text-blue-500"/> CREDIT NOTE RECEIVED
                </div>
                <div className="w-8 border-t-2 border-dashed border-gray-300"></div>

                {/* Step 3 */}
                <div className="border border-blue-200 bg-blue-50 text-blue-700 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                   <ShieldCheck size={16} className="text-blue-500"/> RECORD VENDOR CREDITS
                </div>
                
                <div className="flex flex-col gap-2 relative">
                   <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 border-t-2 border-dashed border-gray-300"></div>
                   <div className="text-[10px] text-gray-400 mb-1 ml-4 text-left">MARK AS OPEN</div>
                   
                   {/* Top Branch */}
                   <div className="flex items-center gap-2">
                      <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                      <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm text-blue-700">
                         <FileText size={16} className="text-blue-500"/> APPLY TO FUTURE BILLS
                      </div>
                   </div>
                   {/* Bottom Branch */}
                   <div className="flex items-center gap-2">
                      <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                      <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm text-blue-700">
                         <RefreshCw size={16} className="text-blue-500"/> RECORD REFUND
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-16 text-left inline-block">
                <h4 className="text-base font-medium text-gray-800 mb-4">In the Vendor Credits module, you can:</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Record credits when you receive a credit note from your vendor.</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Apply vendor credits to bill payments in the future.</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Record refunds for your vendor credits.</li>
                </ul>
             </div>
          </div>
        </div>
      ) : (
        /* LIST TABLE */
        <>
          <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><Filter size={16} /></button>
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor credits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Credit Note# <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedCredit(credit)}>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                    <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">{credit.creditNoteNumber}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{credit.vendor}</td>
                    <td className="px-4 py-3 text-gray-500">{credit.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-right">₹{Number(credit.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${credit.status === "Open" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>{credit.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedCredit(credit)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/vendor-credits/edit/${credit.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(credit)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sliding Drawer for View Details */}
      {selectedCredit && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSelectedCredit(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[55%] bg-[#F8F9FA] shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200">
            
            {/* Drawer Header */}
            <div className="flex flex-col bg-white border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{selectedCredit.creditNoteNumber}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                   <button onClick={() => navigate(`/admin/accounts/purchases/vendor-credits/edit/${selectedCredit.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Edit2 size={14} /> Edit
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Printer size={14} /> PDF/Print <ChevronDown size={14} className="ml-0.5" />
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <FileText size={14} /> Apply to Bills
                   </button>
                   <button className="p-1.5 ml-1 hover:bg-gray-100 rounded"><MoreHorizontal size={18} /></button>
                   <div className="w-px h-4 bg-gray-300 mx-2"></div>
                   <button onClick={() => setSelectedCredit(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                      <X size={20} />
                   </button>
                </div>
              </div>

              {/* What's Next Banner */}
              {selectedCredit.status === "Draft" && (
                <div className="px-6 py-4">
                  <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-between shadow-sm">
                     <div className="flex items-start gap-3">
                        <Sparkles size={20} className="text-blue-500 mt-0.5" />
                        <div>
                           <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">WHAT'S NEXT?</h3>
                           <p className="text-sm text-gray-600 mt-1">Mark this credit as open to apply it to future bills or record a refund.</p>
                        </div>
                     </div>
                     <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded font-medium">
                        Mark as Open
                     </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable PDF Document */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
               
               {/* Document Paper */}
               <div className="w-full max-w-3xl bg-white text-black shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-200 relative flex flex-col min-h-[900px] mb-8">
                  
                  {/* Draft Ribbon */}
                  {selectedCredit.status === 'Draft' && (
                     <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
                        <div className="bg-[#8A949E] text-white text-sm font-semibold tracking-wider text-center py-1.5 shadow-md transform -rotate-45 translate-x-[-35px] translate-y-[25px] w-[160px]">
                           Draft
                        </div>
                     </div>
                  )}

                  <div className="p-10 md:p-14 flex-1 flex flex-col font-sans">
                     
                     {/* Company Header & Title */}
                     <div className="flex justify-between items-start mb-12 mt-4">
                        <div className="text-sm space-y-1">
                           <div className="font-bold text-[16px] text-gray-900 mb-1">Fidha</div>
                           <div className="text-gray-600">Keralam</div>
                           <div className="text-gray-600">India</div>
                           <div className="text-gray-600 text-xs mt-2">fidh3549@gmail.com</div>
                        </div>
                        <div className="text-right">
                           <h1 className="text-[32px] font-serif text-black tracking-wide mb-2 uppercase leading-tight">
                              VENDOR<br/>CREDITS
                           </h1>
                           <p className="text-[13px] font-bold text-gray-700">CreditNote# {selectedCredit.creditNoteNumber}</p>
                           <div className="mt-4">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Credits Remaining</p>
                              <p className="text-lg font-bold text-gray-900">₹{Number(selectedCredit.total).toFixed(2)}</p>
                           </div>
                        </div>
                     </div>

                     {/* Addresses & Date */}
                     <div className="flex justify-between mb-8 text-[13px]">
                        <div className="space-y-6">
                           <div>
                              <p className="text-gray-500 mb-1">Vendor Address</p>
                              <p className="font-semibold text-[#3B82F6] cursor-pointer hover:underline">{selectedCredit.vendor}</p>
                           </div>
                        </div>
                        
                        <div className="text-right">
                           <p className="text-gray-600"><span className="mr-6">Date :</span> <span className="font-medium text-gray-900">{selectedCredit.date}</span></p>
                        </div>
                     </div>

                     {/* Items Table */}
                     <div className="mb-8 flex-1">
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
                              {selectedCredit.items.map((item, idx) => (
                                 <tr key={idx}>
                                    <td className="px-3 py-4 text-center text-gray-700 align-top">{idx + 1}</td>
                                    <td className="px-3 py-4 align-top">
                                       <div className="font-medium text-gray-900">{item.name}</div>
                                       {item.description && <div className="text-gray-500 text-xs mt-1">{item.description}</div>}
                                    </td>
                                    <td className="px-3 py-4 text-right align-top text-gray-700">
                                       {Number(item.quantity).toFixed(2)}
                                       <div className="text-[10px] text-gray-500 mt-0.5">cm</div>
                                    </td>
                                    <td className="px-3 py-4 text-right align-top text-gray-700">
                                       {Number(item.rate).toFixed(2)}
                                       <div className="text-[10px] text-gray-500 mt-0.5">00</div>
                                    </td>
                                    <td className="px-3 py-4 text-right align-top font-medium text-gray-900">
                                       {Number(item.amount).toFixed(2)}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Totals */}
                     <div className="flex justify-end mb-16">
                        <div className="w-[45%] space-y-3 text-[13px]">
                           <div className="flex justify-between py-1 text-gray-600">
                              <span>Sub Total</span>
                              <span className="font-medium text-gray-900">{Number(selectedCredit.subTotal).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between py-2 border-t border-gray-100">
                              <span className="font-bold text-gray-900">Total</span>
                              <span className="font-bold text-gray-900">₹{Number(selectedCredit.total).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between py-2 px-3 bg-[#F3F4F6] rounded">
                              <span className="font-bold text-gray-900">Credits Remaining</span>
                              <span className="font-bold text-gray-900">₹{Number(selectedCredit.total).toFixed(2)}</span>
                           </div>
                        </div>
                     </div>

                     {/* Signature */}
                     <div className="mt-auto pt-16 flex justify-between items-end">
                        <p className="text-[13px] text-gray-700">
                           Authorized Signature <span className="inline-block w-64 border-b border-gray-400 ml-2"></span>
                        </p>
                        <p className="text-xs text-gray-400">1</p>
                     </div>

                  </div>
               </div>

               {/* Journal Tabs (Bottom) */}
               <div className="w-full max-w-3xl border-t border-gray-300 pt-4">
                  <div className="flex gap-6 border-b border-gray-200">
                     <button className="pb-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600">Journal</button>
                  </div>
                  <p className="py-4 text-xs text-gray-500">Journal entries will not be available for Vendor Credits in the Draft state.</p>
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
        title="Delete Vendor Credit"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting vendor credit, please wait..."
            : `Are you sure you want to delete credit note #${deleteTarget?.creditNoteNumber}? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VendorCreditsPage;