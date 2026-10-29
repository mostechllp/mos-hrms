import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPayment, updatePayment } from "../../../store/slices/accounts/paymentsReceivedSlice";
import { X, Info, ChevronDown, Upload, Settings, Search, FileText } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const PaymentReceivedForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingPayment = useSelector((state) => 
    state.paymentsReceived.payments.find((p) => p.id === id)
  );
  
  const customers = useSelector((state) => state.customers.customers);
  const invoices = useSelector((state) => state.invoices.invoices);

  const [formData, setFormData] = useState({
    customerName: existingPayment?.customerName || "",
    customerEmail: existingPayment?.customerEmail || "",
    amountReceived: existingPayment?.amountReceived || "",
    bankCharges: existingPayment?.bankCharges || "",
    paymentDate: existingPayment?.paymentDate || new Date().toISOString().split('T')[0],
    paymentNumber: existingPayment?.paymentNumber || Math.floor(1000 + Math.random() * 9000).toString(),
    paymentMode: existingPayment?.paymentMode || "Cash",
    depositTo: existingPayment?.depositTo || "Petty Cash",
    reference: existingPayment?.reference || "",
    tdsDeducted: existingPayment?.tdsDeducted || false,
    notes: existingPayment?.notes || "",
    status: existingPayment?.status || "Draft",
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      amountReceived: Number(formData.amountReceived) || 0,
      bankCharges: Number(formData.bankCharges) || 0,
    };

    if (id) {
      dispatch(updatePayment({ id, ...finalData }));
    } else {
      dispatch(addPayment(finalData));
    }
    navigate("/admin/accounts/sales/payments");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
          {id ? "Edit Payment" : "Record Payment"}
        </h1>
        <button onClick={() => navigate("/admin/accounts/sales/payments")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full pb-20">
        <div className="py-6 px-8 w-full max-w-7xl mx-auto">
          
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 mb-8">
             
             {/* Customer Name */}
             <div className="md:col-span-12 flex items-start gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium mt-2">Customer Name*</label>
                <div className="flex-1 flex gap-4 max-w-4xl">
                   <div className="flex-1 flex flex-col gap-1">
                      <SearchableSelect 
                         value={formData.customerName}
                         onChange={(val) => {
                             setField("customerName", val);
                             const found = customers.find(c => c.displayName === val);
                             if (found) setField("customerEmail", found.email);
                         }}
                         options={customers.map(c => ({ value: c.displayName, label: c.displayName }))}
                         placeholder="Select Customer"
                      />
                      <p className="text-xs text-gray-500 mt-1">PAN: <span className="text-blue-500 underline cursor-pointer">vbbv</span></p>
                   </div>
                   {formData.customerName && (
                       <div className="bg-gray-700 text-white text-xs px-4 py-2 rounded-md flex items-center gap-2 h-fit mt-1 shrink-0">
                           {formData.customerName}'s Details
                           <ChevronDown size={14} className="-rotate-90" />
                       </div>
                   )}
                </div>
             </div>

             <div className="md:col-span-12 border-b border-gray-200 dark:border-gray-700 my-2"></div>

             {/* Amount Received */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Amount Received*</label>
                <div className="flex max-w-sm w-full">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md">INR</span>
                    <input type="number" className={`${inputCls} rounded-l-none`} value={formData.amountReceived} onChange={(e) => setField("amountReceived", e.target.value)} />
                </div>
             </div>

             {/* Bank Charges */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Bank Charges (if any)</label>
                <input type="number" className={`${inputCls} max-w-sm`} value={formData.bankCharges} onChange={(e) => setField("bankCharges", e.target.value)} />
             </div>

             {/* Payment Date */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Payment Date*</label>
                <input type="date" className={`${inputCls} max-w-sm`} value={formData.paymentDate} onChange={(e) => setField("paymentDate", e.target.value)} />
             </div>

             {/* Payment # */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Payment #*</label>
                <div className="relative max-w-sm w-full">
                   <input type="text" className={inputCls} value={formData.paymentNumber} onChange={(e) => setField("paymentNumber", e.target.value)} />
                   <Settings size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
             </div>

             {/* Payment Mode */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Payment Mode</label>
                <select className={`${inputCls} max-w-sm`} value={formData.paymentMode} onChange={(e) => setField("paymentMode", e.target.value)}>
                   <option value="Cash">Cash</option>
                   <option value="Bank Transfer">Bank Transfer</option>
                   <option value="Credit Card">Credit Card</option>
                   <option value="Check">Check</option>
                </select>
             </div>

             {/* Deposit To */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Deposit To*</label>
                <select className={`${inputCls} max-w-sm`} value={formData.depositTo} onChange={(e) => setField("depositTo", e.target.value)}>
                   <option value="Petty Cash">Petty Cash</option>
                   <option value="Undeposited Funds">Undeposited Funds</option>
                   <option value="Bank Account">Bank Account</option>
                </select>
             </div>

             {/* Reference */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Reference#</label>
                <input type="text" className={`${inputCls} max-w-sm`} value={formData.reference} onChange={(e) => setField("reference", e.target.value)} />
             </div>

             {/* TDS Deducted */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">TDS Deducted?</label>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="radio" checked={!formData.tdsDeducted} onChange={() => setField("tdsDeducted", false)} className="text-blue-600 focus:ring-blue-500" /> No
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="radio" checked={formData.tdsDeducted} onChange={() => setField("tdsDeducted", true)} className="text-blue-600 focus:ring-blue-500" /> Yes, Income TDS
                    </label>
                </div>
             </div>

          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          {/* Unpaid Invoices Section */}
          <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-4">
                     <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Unpaid Invoices</h2>
                     <button type="button" className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 flex items-center gap-2">
                        <FileText size={14} className="text-gray-400"/> Filter by Date Range <ChevronDown size={12}/>
                     </button>
                 </div>
                 <button type="button" className="text-sm text-blue-600 hover:underline">Clear Applied Amount</button>
             </div>
             
             <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-semibold uppercase">
                     <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Invoice Number</th>
                        <th className="px-4 py-3 text-right">Invoice Amount</th>
                        <th className="px-4 py-3 text-right">Amount Due</th>
                        <th className="px-4 py-3 text-right">Payment Received On</th>
                        <th className="px-4 py-3 text-right">Payment</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/60">
                     {/* In a real scenario, you would map unpaid invoices here */}
                     <tr>
                         <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                             There are no unpaid invoices associated with this customer.
                         </td>
                     </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
                     <tr>
                         <td colSpan="5" className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Total</td>
                         <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">0.00</td>
                     </tr>
                  </tfoot>
               </table>
             </div>
             <p className="text-xs text-gray-400 mt-2">**List contains only SENT invoices</p>
          </div>

          {/* Totals Box */}
          <div className="flex justify-end mb-8">
             <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 w-96 text-sm space-y-3">
                 <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Amount Received :</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{Number(formData.amountReceived || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Amount used for Payments :</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">0.00</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Amount Refunded :</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">0.00</span>
                 </div>
                 <div className="flex justify-between items-center text-red-500 font-medium border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span className="flex items-center gap-1"><Info size={14}/> Amount in Excess :</span>
                    <span>₹ {Number(formData.amountReceived || 0).toFixed(2)}</span>
                 </div>
             </div>
          </div>

          {/* Notes & Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Internal use. Not visible to customer)</label>
                 <textarea rows="3" className={inputCls} value={formData.notes} onChange={(e) => setField("notes", e.target.value)}></textarea>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments</label>
                 <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 items-center justify-between max-w-xs">
                     <button type="button" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 px-2 hover:bg-gray-50 rounded">
                         <Upload size={14} /> Upload File
                     </button>
                     <ChevronDown size={14} className="text-gray-400" />
                 </div>
                 <p className="text-xs text-gray-400 mt-2">You can upload a maximum of 5 files, 5MB each</p>
              </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                  Additional Fields: Start adding custom fields for your payments received by going to <i>Settings ➔ Sales ➔ Payments Received</i>.
              </p>
          </div>

        </div>
      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-start gap-3 sticky bottom-0 z-10 px-8 mt-auto">
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save
        </Button>
        <Button variant="secondary" onClick={() => navigate("/admin/accounts/sales/payments")} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PaymentReceivedForm;