import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updatePaymentStatus, deletePayment } from "../../store/slices/accounts/paymentsReceivedSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Printer, Info, CreditCard, Landmark, Wallet
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const PaymentsReceivedPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const payments = useSelector((state) => state.paymentsReceived.payments);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredPayments = payments.filter(
    (p) =>
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deletePayment(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedPayment?.id === deleteTarget.id) {
        setSelectedPayment(null); 
      }
    }
  };

  const handleMarkAsPaid = () => {
    if (selectedPayment) {
      dispatch(updatePaymentStatus({ id: selectedPayment.id, status: "Paid" }));
      setSelectedPayment({ ...selectedPayment, status: "Paid" });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Received Payments</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/payments/new")} 
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

      {payments.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-16 pb-20 px-6">
          
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">No payments received, yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Payments will be added once your customers pay for their invoices.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/invoices")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Go To Unpaid Invoices
            </Button>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Payments</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-20 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-16">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-16">Life cycle of a Customer Payment</h3>
            
            <div className="flex flex-col items-center justify-center">
                
                {/* Top Banner */}
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 flex justify-between items-center text-xs font-semibold text-gray-500 w-full max-w-3xl mb-8 relative">
                    <span className="text-blue-600">INITIAL<br/>REQUEST</span>
                    <span className="border-l pl-6 h-full flex items-center">REMINDER 1</span>
                    <span className="border-l pl-6 h-full flex items-center">REMINDER 2</span>
                    <span className="border-l pl-6 h-full flex items-center">REMINDER N</span>
                </div>

                {/* Down Arrow and Branch */}
                <div className="relative flex justify-center w-full max-w-3xl mb-4">
                    <div className="w-px h-8 bg-blue-300"></div>
                    <div className="absolute top-8 left-[12.5%] right-[12.5%] border-t-2 border-blue-300 border-dashed"></div>
                    
                    {/* Vertical drops */}
                    <div className="absolute top-8 left-[12.5%] h-4 w-px bg-blue-300 border-dashed"></div>
                    <div className="absolute top-8 left-[37.5%] h-4 w-px bg-blue-300 border-dashed"></div>
                    <div className="absolute top-8 left-[62.5%] h-4 w-px bg-blue-300 border-dashed"></div>
                    <div className="absolute top-8 left-[87.5%] h-4 w-px bg-blue-300 border-dashed"></div>
                </div>

                {/* 4 Boxes Row */}
                <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl mb-8 pt-4">
                    {[
                        { icon: Wallet, text: "PAYPAL" },
                        { icon: CreditCard, text: "CREDIT CARD" },
                        { icon: Landmark, text: "BANK" },
                        { icon: FileText, text: "MANUAL / OFFLINE" },
                    ].map((item, idx) => (
                        <div key={idx} className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md px-4 py-3 flex items-center gap-3 text-blue-600 w-48 shadow-sm">
                            <item.icon size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Bottom Label */}
                <div className="relative flex items-center justify-center w-full max-w-4xl mb-12">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    <span className="absolute bg-white dark:bg-gray-800 px-4 text-[10px] text-gray-500 uppercase tracking-widest">
                        Paid Through <span className="text-red-500">Client Portal</span>
                    </span>
                </div>
            </div>

            <div className="mt-20 text-center max-w-4xl mx-auto">
              <h4 className="text-xl text-gray-800 dark:text-gray-200 mb-6 font-medium">In the Payments Received module, you can:</h4>
              <div className="space-y-4 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Automatically charge your customer's card for recurring invoices</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Configure payment gateways to receive online payments <a href="#" className="text-blue-500 hover:underline">Learn More</a></p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Record payments manually</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Send payment receipts to your customers</p>
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
                placeholder="Search payments..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Payment # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Amount Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedPayment(payment)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {payment.paymentNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{payment.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{payment.paymentDate}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{payment.paymentMode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      ₹{payment.amountReceived.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           payment.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 
                           payment.status === 'Paid' ? 'bg-green-100 text-green-600' :
                           'bg-blue-100 text-blue-600'
                       }`}>
                         {payment.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedPayment(payment)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/payments/edit/${payment.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
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

      {/* Sliding Drawer for View */}
      {selectedPayment && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedPayment(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedPayment.paymentNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedPayment.status === 'Draft' ? 'bg-gray-200 text-gray-700' : 
                    selectedPayment.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                    {selectedPayment.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="p-1 text-gray-500 hover:text-gray-800">
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
                    <Printer size={14} className="mr-1"/> PDF/Print
                    </Button>
                    {selectedPayment.status === 'Draft' && (
                        <Button onClick={handleMarkAsPaid} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs h-8">
                        <CheckCircle2 size={14} className="mr-1"/> Mark as Paid
                        </Button>
                    )}
              </div>

              {/* What's Next Banner */}
              {selectedPayment.status === 'Draft' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                     ✨ WHAT'S NEXT?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                    Mark the payment as Paid to confirm that it has been received.
                  </p>
                  <Button onClick={handleMarkAsPaid} className="bg-blue-600 text-white text-xs h-8">Mark as Paid</Button>
                </div>
              )}

              {/* PDF Preview */}
              <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative mt-4">
                    {/* Draft Watermark */}
                    {selectedPayment.status === 'Draft' && (
                        <div className="absolute top-0 left-0 bg-gray-400 text-white px-4 py-2 text-sm font-bold -rotate-45 transform -translate-x-8 translate-y-4 shadow-sm">
                            Draft
                        </div>
                    )}
                    
                    {/* PDF Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="text-xs">
                            <p className="font-bold text-gray-800 mb-1 text-sm">Fidha</p>
                            <p className="text-gray-600">Keralam</p>
                            <p className="text-gray-600">India</p>
                            <p className="text-gray-600">fidh3549@gmail.com</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-xl font-serif text-gray-800 tracking-wide mb-2">PAYMENT RECEIPT</h1>
                    </div>

                    {/* Info Details */}
                    <div className="flex justify-between mb-8 text-xs relative">
                        <div className="space-y-4 flex-1">
                            <div className="flex">
                                <span className="text-gray-500 w-32">Payment Date</span>
                                <span className="text-gray-900 font-bold">{selectedPayment.paymentDate}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-32">Reference Number</span>
                                <span className="text-gray-900 font-medium">{selectedPayment.reference || ""}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-32">Payment Mode</span>
                                <span className="text-gray-900 font-medium">{selectedPayment.paymentMode}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-32 leading-tight">Amount Received In Words</span>
                                <span className="text-gray-900 font-bold italic leading-tight w-48">Indian Rupee Two Hundred Twenty-Two Only</span>
                            </div>
                        </div>

                        {/* Green Amount Box */}
                        <div className="absolute right-0 top-0 bg-green-600 text-white p-4 text-center rounded-sm w-32 h-20 flex flex-col justify-center shadow-sm">
                            <p className="text-[10px] uppercase tracking-wider opacity-90 mb-1">Amount Received</p>
                            <p className="text-xl font-bold">₹{selectedPayment.amountReceived.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Received From / Signature */}
                    <div className="flex justify-between mt-16 text-xs mb-12">
                        <div>
                            <p className="font-bold text-gray-800 mb-1">Received From</p>
                            <p className="text-blue-600 font-medium underline mb-1">{selectedPayment.customerName}</p>
                            <p className="text-gray-600 text-[10px] mt-1 leading-tight">
                                v v<br/>
                                bubvnv<br/>
                                bvn<br/>
                                nbvn bvnbv<br/>
                                Aland Islands
                            </p>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                            <p className="text-gray-600 font-medium mb-8">Authorized Signature</p>
                            <div className="w-40 border-b border-gray-400"></div>
                        </div>
                    </div>

                    {/* Over Payment */}
                    <div className="border-t border-gray-200 pt-6 text-xs">
                        <p className="text-gray-500 mb-1">Over payment</p>
                        <p className="text-gray-900 font-bold">₹{selectedPayment.amountReceived.toFixed(2)}</p>
                    </div>
                </div>

              {/* Footer Template Info */}
              <div className="text-right mt-4 max-w-2xl mx-auto text-xs text-gray-500">
                  <p>PDF Template : 'Elite Template' <a href="#" className="text-blue-500 hover:underline">Change</a></p>
              </div>

              {/* More Information */}
              <div className="mt-10 max-w-2xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">More Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                      <div className="text-gray-500">Deposit To</div>
                      <div className="text-gray-900 dark:text-gray-100 font-medium">: {selectedPayment.depositTo}</div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mb-4">Journal</h3>
                  <p className="text-sm text-gray-500">Journal entries will not be available for payment in the {selectedPayment.status} state.</p>
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
        title="Delete Payment"
        message={`Are you sure you want to delete payment "${deleteTarget?.paymentNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default PaymentsReceivedPage;