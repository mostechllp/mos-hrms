import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPayment, updatePayment } from "../../../store/slices/accounts/paymentsMadeSlice";
import { X, Search, ChevronDown, Info, Upload, Settings, Lightbulb } from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white";

const PaymentForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingPayment = useSelector((state) => state.paymentsMade.payments.find((p) => p.id === id));
  const vendors = useSelector((state) => state?.vendors?.vendors || [{ vendorName: "LocalFix" }, { vendorName: "Acme Corp" }]);
  const bills = useSelector((state) => state?.bills?.bills || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeTab, setActiveTab] = useState("Bill Payment");
  const [payFullAmount, setPayFullAmount] = useState(false);

  const [formData, setFormData] = useState({
    paymentNumber: "",
    vendor: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMode: "Cash",
    paidThrough: "Petty Cash",
    depositTo: "Prepaid Expenses",
    reference: "",
    notes: "",
    appliedBills: [],
  });

  useEffect(() => {
    if (existingPayment) {
      setFormData({ ...existingPayment });
      setActiveTab(existingPayment.type || "Bill Payment");
    }
  }, [existingPayment]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const finalData = { ...formData, type: activeTab };

    try {
      if (id) {
        await dispatch(updatePayment({ id, ...finalData })).unwrap();
      } else {
        await dispatch(addPayment(finalData)).unwrap();
      }
      navigate("/admin/accounts/purchases/payments-made");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Top Header with Tabs */}
      <div className="flex items-center justify-between px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex gap-6 mt-2">
          {["Bill Payment", "Vendor Advance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button onClick={() => navigate("/admin/accounts/purchases/payments-made")} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-8">
        {submitError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{submitError}</div>}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Vendor Section */}
          <div className="p-6 flex items-start justify-between border-b border-gray-100">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm text-gray-600 font-medium">Vendor Name <span className="text-red-500">*</span></label>
              <select className={inputCls} value={formData.vendor} onChange={(e) => setField("vendor", e.target.value)}>
                <option value="">Select a Vendor</option>
                {vendors.map(v => <option key={v.vendorName} value={v.vendorName}>{v.vendorName}</option>)}
              </select>
            </div>
            {formData.vendor && (
              <div className="bg-gray-700 text-white text-xs px-3 py-2 rounded flex items-center gap-2 cursor-pointer mt-6">
                {formData.vendor}'s Details <ChevronDown size={12} />
              </div>
            )}
          </div>

          {/* Form Details */}
          <div className="p-6 space-y-4">
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 shrink-0">Payment # <span className="text-red-500">*</span></label>
                <div className="relative w-full max-w-md">
                   <input type="text" className={inputCls} value={formData.paymentNumber} onChange={(e) => setField("paymentNumber", e.target.value)} />
                   <Settings size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 cursor-pointer" />
                </div>
             </div>

             <div className="flex items-start gap-4">
                <label className="text-sm text-gray-600 w-40 shrink-0 mt-2">Payment Made <span className="text-red-500">*</span></label>
                <div className="w-full max-w-md space-y-2">
                   <div className="flex">
                      <span className="border border-r-0 border-gray-300 bg-gray-50 rounded-l-md px-3 py-1.5 text-sm text-gray-600">INR</span>
                      <input type="number" className={`${inputCls} rounded-l-none`} value={formData.amount} onChange={(e) => setField("amount", e.target.value)} />
                   </div>
                   {activeTab === "Bill Payment" && (
                     <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={payFullAmount} onChange={(e) => setPayFullAmount(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Pay full amount (₹3,334.00)
                     </label>
                   )}
                </div>
             </div>

             {activeTab === "Vendor Advance" && (
               <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600 w-40 shrink-0">TDS</label>
                  <select className={`${inputCls} max-w-md`}>
                    <option>Select a Tax</option>
                  </select>
               </div>
             )}

             {/* Info Banner */}
             <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-md border border-gray-100 text-sm text-gray-600 max-w-2xl ml-44">
                <Lightbulb size={18} className="text-yellow-500 shrink-0" />
                <div>
                  Initiate payments for your bills directly from Zoho Books by integrating with one of our partner banks. <a href="#" className="text-blue-600 hover:underline">Set Up Now</a>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 shrink-0">Payment Date <span className="text-red-500">*</span></label>
                <input type="date" className={`${inputCls} max-w-md`} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
             </div>

             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 shrink-0">Payment Mode</label>
                <select className={`${inputCls} max-w-md`} value={formData.paymentMode} onChange={(e) => setField("paymentMode", e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                </select>
             </div>

             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 shrink-0">Paid Through <span className="text-red-500">*</span></label>
                <select className={`${inputCls} max-w-md`} value={formData.paidThrough} onChange={(e) => setField("paidThrough", e.target.value)}>
                  <option value="Petty Cash">Petty Cash</option>
                  <option value="Undeposited Funds">Undeposited Funds</option>
                </select>
             </div>

             {activeTab === "Vendor Advance" && (
               <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600 w-40 shrink-0">Deposit To</label>
                  <select className={`${inputCls} max-w-md`} value={formData.depositTo} onChange={(e) => setField("depositTo", e.target.value)}>
                    <option value="Prepaid Expenses">Prepaid Expenses</option>
                  </select>
               </div>
             )}

             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-40 shrink-0">Reference#</label>
                <input type="text" className={`${inputCls} max-w-md`} value={formData.reference} onChange={(e) => setField("reference", e.target.value)} />
             </div>
          </div>

          {/* Unapplied Amount Table (For Bill Payment only) */}
          {activeTab === "Bill Payment" && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end mb-2">
                 <button type="button" className="text-blue-600 text-sm hover:underline">Clear Applied Amount</button>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-y border-gray-200 text-xs text-gray-500 font-semibold">
                   <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Bill#</th>
                      <th className="px-3 py-2">PO#</th>
                      <th className="px-3 py-2 text-right">Bill Amount</th>
                      <th className="px-3 py-2 text-right">Amount Due</th>
                      <th className="px-3 py-2">Payment Made on</th>
                      <th className="px-3 py-2 text-right">Payment</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {formData.appliedBills.map((bill, idx) => (
                      <tr key={idx}>
                         <td className="px-3 py-3">
                            <div className="text-gray-800">{bill.billDate}</div>
                            <div className="text-xs text-gray-500">Due Date: {bill.billDate}</div>
                         </td>
                         <td className="px-3 py-3 text-gray-800">{bill.billNumber}</td>
                         <td className="px-3 py-3"></td>
                         <td className="px-3 py-3 text-right text-gray-800">{Number(bill.billAmount).toFixed(2)}</td>
                         <td className="px-3 py-3 text-right text-gray-800">{Number(bill.billAmount).toFixed(2)}</td>
                         <td className="px-3 py-3">
                            <input type="date" className={inputCls} defaultValue={bill.billDate} />
                         </td>
                         <td className="px-3 py-3 text-right">
                            <input type="number" className={`${inputCls} text-right`} defaultValue={bill.paymentAmount} />
                            <div className="text-blue-600 text-xs text-right mt-1 cursor-pointer hover:underline">Pay in Full</div>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                 <div className="w-1/3 flex justify-between text-sm font-semibold text-gray-800">
                    <span>Total :</span>
                    <span>₹{Number(formData.amount).toFixed(2)}</span>
                 </div>
              </div>
            </div>
          )}

          {/* Summary Box (For Bill Payment) */}
          {activeTab === "Bill Payment" && (
            <div className="px-6 pb-6 flex justify-end">
               <div className="w-full max-w-sm bg-orange-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                     <span>Amount Paid:</span>
                     <span>{Number(formData.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                     <span>Amount used for Payments:</span>
                     <span>0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                     <span>Amount Refunded:</span>
                     <span>0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-medium">
                     <span>Amount in Excess:</span>
                     <span>₹ 0.00</span>
                  </div>
               </div>
            </div>
          )}

          <hr className="border-gray-200" />

          {/* Notes & Attachments */}
          <div className="p-6 space-y-4">
             <div>
                <label className="block text-sm text-gray-700 mb-1">Notes (Internal use. Not visible to vendor)</label>
                <textarea className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24" placeholder="Enter notes..." value={formData.notes} onChange={(e) => setField("notes", e.target.value)} ></textarea>
             </div>
             <div>
                <label className="block text-sm text-gray-700 mb-1">Attachments</label>
                <button type="button" className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
                   <Upload size={14}/> Upload File <ChevronDown size={14} />
                </button>
                <p className="text-xs text-gray-500 mt-2">You can upload a maximum of 5 files, 10MB each</p>
             </div>
          </div>

          <div className="p-6 pt-0">
             <p className="text-xs text-gray-500">
                Additional Fields: Start adding custom fields for your payments made by going to <span className="font-semibold">Settings > Purchases > Payments Made.</span>
             </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
               {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button type="button" disabled={isSubmitting} onClick={() => navigate("/admin/accounts/purchases/payments-made")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50">
               Cancel
            </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;