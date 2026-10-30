import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePayment, markPaymentAsPaid } from "../../store/slices/accounts/paymentsMadeSlice";
import { 
  Plus, MoreHorizontal, ChevronDown, FileText, Edit2, Trash2, X, 
  Printer, CheckCircle2, Sparkles, Search, Filter, Eye, Mail, Share2
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const PaymentsMadePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const payments = useSelector((state) => state.paymentsMade.payments);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const filteredPayments = payments.filter(
    (p) =>
      (p.vendor && p.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.paymentNumber && p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deletePayment(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedPayment?.id === idToDelete) setSelectedPayment(null);
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

  const handleMarkAsPaid = async (id) => {
    setIsMarkingPaid(true);
    try {
      await dispatch(markPaymentAsPaid(id)).unwrap();
      if (selectedPayment && selectedPayment.id === id) {
        setSelectedPayment(prev => ({ ...prev, status: "Paid" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">All Payments</h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/accounts/purchases/payments-made/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1 rounded">
            <Plus size={16} /> New
          </button>
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {payments.length === 0 ? (
        /* EMPTY STATE LAYOUT */
        <div className="flex flex-col items-center pt-16 pb-20 px-6">
          <h2 className="text-2xl font-normal text-gray-800 mb-2">You haven't made any payments yet.</h2>
          <p className="text-gray-500 text-sm mb-6">Receipts of your bill payments will show up here.</p>
          
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => navigate("/admin/accounts/purchases/payments-made/new")} className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5 rounded font-semibold">
              GO TO UNPAID BILLS
            </button>
            <button className="text-blue-600 text-sm hover:underline">Import Payments</button>
          </div>

          {/* Partner Logos (mock representation) */}
          <div className="mt-16 flex items-center justify-center gap-8 opacity-70">
             <div className="flex items-center gap-2 text-gray-700 font-semibold"><div className="w-6 h-6 bg-blue-500 rounded-full"></div> standard chartered</div>
             <div className="flex items-center gap-2 text-red-600 font-bold text-lg"><div className="w-6 h-6 bg-red-600 text-white text-center text-xs rounded">X</div> HSBC</div>
             <div className="flex items-center gap-2 text-blue-700 font-bold text-lg"><div className="w-6 h-6 bg-blue-700 text-white text-center text-xs rounded">S</div> SBI</div>
             <div className="flex items-center gap-2 text-red-800 font-bold text-sm"><div className="w-6 h-6 bg-red-800 text-white text-center text-xs rounded">A</div> AXIS BANK</div>
          </div>
          <p className="text-sm text-gray-600 mt-4">We've partnered with the above Bank(s). You can now initiate payment directly via Zoho Books. <a href="#" className="text-blue-600 hover:underline">Set Up Now</a></p>

          {/* Life Cycle Section */}
          <div className="w-full max-w-5xl mt-20 text-center border-t border-gray-200 pt-12">
             <h3 className="text-lg font-medium text-gray-800 mb-12">Life cycle of a Vendor Payment</h3>
             
             <div className="flex flex-col items-center gap-6">
                <div className="border border-gray-300 rounded px-6 py-2 text-sm text-gray-600">BILLS</div>
                <div className="w-px h-8 bg-gray-300 border-l-2 border-dashed"></div>
                <div className="w-2/3 border-t-2 border-dashed border-gray-300"></div>
                
                <div className="flex justify-between w-full max-w-2xl px-12">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-px h-6 bg-gray-300 border-l-2 border-dashed"></div>
                      <div className="border border-blue-200 bg-blue-50 text-blue-600 rounded px-4 py-2 flex items-center gap-2 text-sm"><span className="text-lg">🏦</span> ACH PAYMENT</div>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-px h-6 bg-gray-300 border-l-2 border-dashed"></div>
                      <div className="border border-blue-200 bg-blue-50 text-blue-600 rounded px-4 py-2 flex items-center gap-2 text-sm"><span className="text-lg">💳</span> CHECK</div>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-px h-6 bg-gray-300 border-l-2 border-dashed"></div>
                      <div className="border border-blue-200 bg-blue-50 text-blue-600 rounded px-4 py-2 flex items-center gap-2 text-sm"><span className="text-lg">✍️</span> MANUAL / OFFLINE</div>
                   </div>
                </div>
             </div>

             <div className="mt-16 text-left inline-block">
                <h4 className="text-base font-medium text-gray-800 mb-4">In the Payments Made module, you can:</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Record payments made to vendors</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> View receipts of paid bills</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Record payments manually</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Send payment receipts to your customers</li>
                </ul>
             </div>
          </div>
        </div>
      ) : (
        /* LIST TABLE */
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
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3">Payment #</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedPayment(payment)}>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                    <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">{payment.paymentNumber}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{payment.vendor}</td>
                    <td className="px-4 py-3 text-gray-500">{payment.date}</td>
                    <td className="px-4 py-3 text-gray-500">{payment.paymentMode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-right">₹{Number(payment.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payment.status === "Paid" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>{payment.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedPayment(payment)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/payments-made/edit/${payment.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(payment)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedPayment && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSelectedPayment(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[55%] bg-white shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200">
            
            {/* Drawer Header (Action Bar) */}
            <div className="flex flex-col bg-white border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{selectedPayment.paymentNumber}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                   <button onClick={() => navigate(`/admin/accounts/purchases/payments-made/edit/${selectedPayment.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Edit2 size={14} /> Edit
                   </button>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Printer size={14} /> PDF/Print <ChevronDown size={14} className="ml-0.5" />
                   </button>
                   {selectedPayment.status !== "Paid" && (
                     <button 
                        onClick={() => handleMarkAsPaid(selectedPayment.id)}
                        disabled={isMarkingPaid}
                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                     >
                        <CheckCircle2 size={14} /> {isMarkingPaid ? "Marking..." : "Mark as Paid"}
                     </button>
                   )}
                   <button className="p-1.5 ml-1 hover:bg-gray-100 rounded"><MoreHorizontal size={18} /></button>
                   <div className="w-px h-4 bg-gray-300 mx-2"></div>
                   <button onClick={() => setSelectedPayment(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                      <X size={20} />
                   </button>
                </div>
              </div>

              {/* What's Next Banner */}
              {selectedPayment.status !== "Paid" && (
                <div className="px-6 py-4 bg-gray-50">
                  <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-between shadow-sm">
                     <div className="flex items-start gap-3">
                        <Sparkles size={20} className="text-blue-500 mt-0.5" />
                        <div>
                           <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">WHAT'S NEXT?</h3>
                           <p className="text-sm text-gray-600 mt-1">Mark the payment as Paid to confirm that it has been sent.</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleMarkAsPaid(selectedPayment.id)}
                        disabled={isMarkingPaid}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded font-medium disabled:opacity-50"
                     >
                        {isMarkingPaid ? "Processing..." : "Mark as Paid"}
                     </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable PDF Document */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-[#F8F9FA]">
               
               {/* Document Paper */}
               <div className="w-full max-w-3xl bg-white text-black shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-200 relative flex flex-col min-h-[900px] mb-8">
                  
                  {/* Draft Ribbon */}
                  {selectedPayment.status === 'Draft' && (
                     <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
                        <div className="bg-[#8A949E] text-white text-sm font-semibold tracking-wider text-center py-1.5 shadow-md transform -rotate-45 translate-x-[-35px] translate-y-[25px] w-[160px]">
                           Draft
                        </div>
                     </div>
                  )}

                  <div className="p-10 md:p-14 flex-1 flex flex-col font-sans">
                     
                     {/* Company Header */}
                     <div className="text-sm space-y-1 mb-10">
                        <div className="font-bold text-[16px] text-gray-900 mb-1">Fidha</div>
                        <div className="text-gray-600">Keralam</div>
                        <div className="text-gray-600">India</div>
                        <div className="text-gray-600 text-xs mt-2">fidh3549@gmail.com</div>
                     </div>

                     {/* Document Title */}
                     <div className="text-center mb-10">
                        <h1 className="text-2xl font-serif text-black tracking-widest uppercase leading-tight">
                           PAYMENTS MADE
                        </h1>
                        <div className="w-full border-b border-gray-200 mt-4"></div>
                     </div>

                     {/* Payment Details */}
                     <div className="flex justify-between items-start mb-10">
                        <div className="space-y-4 text-[13px] flex-1">
                           <div className="flex"><span className="text-gray-500 w-32">Payment#</span> <span className="font-semibold text-gray-900">{selectedPayment.paymentNumber}</span></div>
                           <div className="flex"><span className="text-gray-500 w-32">Payment Date</span> <span className="font-semibold text-gray-900">{selectedPayment.date}</span></div>
                           <div className="flex"><span className="text-gray-500 w-32">Reference Number</span> <span className="font-semibold text-gray-900">{selectedPayment.reference || "-"}</span></div>
                           <div className="flex"><span className="text-gray-500 w-32">Paid To</span> <span className="font-semibold text-blue-600">{selectedPayment.vendor}</span></div>
                           <div className="flex"><span className="text-gray-500 w-32">Payment Mode</span> <span className="font-semibold text-gray-900">{selectedPayment.paymentMode}</span></div>
                           <div className="flex"><span className="text-gray-500 w-32">Paid Through</span> <span className="font-semibold text-gray-900">{selectedPayment.paidThrough}</span></div>
                           <div className="flex"><span className="text-gray-500 w-32">Amount Paid In Words</span> <span className="font-semibold text-gray-900 text-xs mt-0.5">Indian Rupee Three Thousand Three Hundred Thirty-Four Only</span></div>
                        </div>

                        {/* Amount Box */}
                        <div className="bg-[#6BA55C] text-white p-6 text-center w-44 shadow-sm">
                           <p className="text-xs uppercase tracking-wider opacity-90 mb-1">Amount Paid</p>
                           <p className="text-xl font-medium">₹{Number(selectedPayment.amount).toFixed(2)}</p>
                        </div>
                     </div>

                     <div className="mb-10 text-[13px]">
                        <p className="text-gray-500 mb-1">Paid To</p>
                        <p className="font-semibold text-gray-900">{selectedPayment.vendor}</p>
                     </div>

                     {/* Payment For Table */}
                     <div className="mt-8 mb-8 flex-1">
                        <h3 className="text-base font-serif text-gray-900 mb-4">Payment for</h3>
                        <table className="w-full text-left text-[12px] border-collapse">
                           <thead>
                              <tr className="bg-gray-100 text-gray-700">
                                 <th className="px-3 py-2 font-medium">Bill Number</th>
                                 <th className="px-3 py-2 font-medium">Bill Date</th>
                                 <th className="px-3 py-2 font-medium text-right">Bill Amount</th>
                                 <th className="px-3 py-2 font-medium text-right">Payment Amount</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {selectedPayment.appliedBills?.map((bill, idx) => (
                                 <tr key={idx}>
                                    <td className="px-3 py-3 text-blue-600">{bill.billNumber}</td>
                                    <td className="px-3 py-3 text-gray-700">{bill.billDate}</td>
                                    <td className="px-3 py-3 text-right text-gray-700">₹{Number(bill.billAmount).toFixed(2)}</td>
                                    <td className="px-3 py-3 text-right text-gray-700">₹{Number(bill.paymentAmount).toFixed(2)}</td>
                                 </tr>
                              ))}
                              {(!selectedPayment.appliedBills || selectedPayment.appliedBills.length === 0) && (
                                <tr>
                                  <td colSpan={4} className="px-3 py-6 text-center text-gray-400">No bills applied to this payment.</td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>

               {/* Journal Tabs (Bottom) */}
               <div className="w-full max-w-3xl border-t border-gray-300 pt-4">
                  <div className="flex gap-6 border-b border-gray-200">
                     <button className="pb-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600">Journal</button>
                  </div>
                  <p className="py-4 text-xs text-gray-500">Journal entries will not be available for Payments in the Draft state.</p>
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
        title="Delete Payment"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting payment, please wait..."
            : `Are you sure you want to delete payment #${deleteTarget?.paymentNumber}? This action cannot be undone.`
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

export default PaymentsMadePage;