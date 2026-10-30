import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// Import the async thunks
import { addBill, updateBill } from "../../../store/slices/accounts/billsSlice"; 
import { X, Plus, Trash2, Search, Paperclip, FileText, ChevronDown, Info, Upload, Settings, HelpCircle } from "lucide-react";

// Mocking UI components
const inputCls = "w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white";
const SearchableSelect = ({ options, value, onChange, placeholder, className }) => (
  <select 
    className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500 ${className}`}
    value={value} 
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const BillForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  // Selectors for existing bill and vendors
  const existingBill = useSelector((state) => 
    state?.bills?.bills?.find((b) => b.id === id)
  );
  const vendors = useSelector((state) => state?.vendors?.vendors || [
    { vendorName: "Acme Corp" },
    { vendorName: "Global Tech" }
  ]);

  // Loading & Error states for the thunks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    billNumber: existingBill?.billNumber || "",
    vendor: existingBill?.vendor || "",
    orderNumber: existingBill?.orderNumber || "",
    date: existingBill?.date || new Date().toISOString().split('T')[0],
    dueDate: existingBill?.dueDate || new Date().toISOString().split('T')[0],
    paymentTerms: existingBill?.paymentTerms || "Due on Receipt",
    accountsPayable: existingBill?.accountsPayable || "Accounts Payable",
    subject: existingBill?.subject || "",
    items: existingBill?.items || [
      { id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, discount: 0, amount: 0, customer: "" }
    ],
    subTotal: existingBill?.subTotal || 0,
    total: existingBill?.total || 0,
    balanceDue: existingBill?.balanceDue || 0,
    notes: existingBill?.notes || "",
    status: existingBill?.status || "Draft",
  });

  // Sync form if existingBill loads asynchronously (e.g., from API)
  useEffect(() => {
    if (existingBill) {
      setFormData({
        billNumber: existingBill.billNumber || "",
        vendor: existingBill.vendor || "",
        orderNumber: existingBill.orderNumber || "",
        date: existingBill.date || new Date().toISOString().split('T')[0],
        dueDate: existingBill.dueDate || new Date().toISOString().split('T')[0],
        paymentTerms: existingBill.paymentTerms || "Due on Receipt",
        accountsPayable: existingBill.accountsPayable || "Accounts Payable",
        subject: existingBill.subject || "",
        items: existingBill.items || [],
        subTotal: existingBill.subTotal || 0,
        total: existingBill.total || 0,
        balanceDue: existingBill.balanceDue || 0,
        notes: existingBill.notes || "",
        status: existingBill.status || "Draft",
      });
    }
  }, [existingBill]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (["quantity", "rate", "discount"].includes(field)) {
      const qty = Number(newItems[index].quantity) || 0;
      const rate = Number(newItems[index].rate) || 0;
      const disc = Number(newItems[index].discount) || 0;
      newItems[index].amount = qty * rate * (1 - disc / 100);
    }
    
    // Recalculate totals
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setFormData(prev => ({ 
      ...prev, 
      items: newItems, 
      subTotal: newTotal, 
      total: newTotal,
      balanceDue: newTotal
    }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, discount: 0, amount: 0, customer: "" }]
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setFormData(prev => ({ 
      ...prev, 
      items: newItems,
      subTotal: newTotal,
      total: newTotal,
      balanceDue: newTotal
    }));
  };

  const handleSubmit = async (e, statusOverride) => {
    e.preventDefault();
    if (!formData.vendor.trim()) return;

    // Determine status based on which button was clicked
    const finalStatus = statusOverride || formData.status;
    const finalData = { ...formData, status: finalStatus };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) {
        // Call updateBill thunk
        await dispatch(updateBill({ id, ...finalData })).unwrap();
      } else {
        // Call addBill thunk
        await dispatch(addBill(finalData)).unwrap();
      }
      // Navigate back to list on success
      navigate("/admin/accounts/purchases/bills");
    } catch (err) {
      console.error("Failed to save bill:", err);
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between py-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h1 className="text-xl font-medium text-gray-800 flex items-center gap-2">
           <span className="text-gray-600"><FileText size={20} /></span>
           {id ? "Edit Bill" : "New Bill"}
        </h1>
        <button onClick={() => navigate("/admin/accounts/purchases/bills")} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, "Open")} className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 pb-8">
        
        {/* Error Banner */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          
          {/* Vendor Section */}
          <div className="p-6 bg-gray-50/50 border-b border-gray-200">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm text-gray-600 font-medium">Vendor Name <span className="text-red-500">*</span></label>
              <div className="flex">
                <SearchableSelect 
                  options={vendors.map(v => ({ value: v.vendorName || v.name, label: v.vendorName || v.name }))} 
                  value={formData.vendor} 
                  onChange={(val) => setField("vendor", val)} 
                  placeholder="Select a Vendor"
                  className="rounded-r-none border-r-0 focus:z-10"
                />
                <button type="button" className="bg-blue-500 text-white px-3 border border-blue-500 rounded-r-md flex items-center justify-center hover:bg-blue-600">
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Form Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-32 shrink-0">Bill# <span className="text-red-500">*</span></label>
                <input type="text" className={inputCls} value={formData.billNumber} onChange={(e) => setField("billNumber", e.target.value)} />
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-32 shrink-0">Order Number</label>
                <input type="text" className={inputCls} value={formData.orderNumber} onChange={(e) => setField("orderNumber", e.target.value)} />
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-32 shrink-0">Bill Date <span className="text-red-500">*</span></label>
                <input type="date" className={inputCls} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-32 shrink-0">Payment Terms</label>
                <select className={inputCls} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                </select>
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-32 shrink-0">Due Date</label>
                <input type="date" className={inputCls} value={formData.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600 w-32 shrink-0 flex items-center gap-1">Accounts Payable <Info size={14} className="text-gray-400"/></label>
                <select className={inputCls} value={formData.accountsPayable} onChange={(e) => setField("accountsPayable", e.target.value)}>
                  <option value="Accounts Payable">Accounts Payable</option>
                </select>
             </div>
          </div>

          <div className="px-6 pb-6 flex items-center gap-4">
             <label className="text-sm text-gray-600 w-32 shrink-0 flex items-center gap-1">Subject <Info size={14} className="text-gray-400"/></label>
             <input type="text" className={inputCls} placeholder="Enter a subject within 250 characters" value={formData.subject} onChange={(e) => setField("subject", e.target.value)} maxLength={250} />
          </div>

          <hr className="border-gray-200" />

          {/* Item Table */}
          <div className="p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="border border-gray-300 rounded px-2 py-1 flex items-center gap-1 text-xs cursor-pointer hover:bg-gray-50">At Line Item Level <ChevronDown size={12}/></span>
               </div>
               <button type="button" className="text-blue-600 text-sm hover:underline flex items-center gap-1"><Plus size={14}/> Bulk Actions</button>
            </div>
            
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
              <thead className="bg-gray-50 border-y border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                 <tr>
                    <th className="px-3 py-2 w-8"></th>
                    <th className="px-3 py-2 w-[25%]">ITEM DETAILS</th>
                    <th className="px-3 py-2">ACCOUNT</th>
                    <th className="px-3 py-2 text-right">QUANTITY</th>
                    <th className="px-3 py-2 text-right">RATE</th>
                    <th className="px-3 py-2 text-right">DISCOUNT</th>
                    <th className="px-3 py-2">CUSTOMER DETAILS</th>
                    <th className="px-3 py-2 text-right">AMOUNT</th>
                    <th className="px-3 py-2 w-8"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {formData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                       <td className="px-3 py-3 text-gray-400 text-center"><div className="cursor-grab">⋮⋮</div></td>
                       <td className="px-3 py-3">
                          <input 
                            type="text" 
                            className="w-full border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none" 
                            placeholder="Type or click to select an item." 
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          />
                       </td>
                       <td className="px-3 py-3">
                          <select className="w-full border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none bg-transparent">
                             <option value="">Select an account</option>
                          </select>
                       </td>
                       <td className="px-3 py-3 text-right">
                          <input 
                            type="number" 
                            className="w-20 text-right border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none" 
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                       </td>
                       <td className="px-3 py-3 text-right">
                          <input 
                            type="number" 
                            className="w-24 text-right border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none" 
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          />
                       </td>
                       <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end">
                             <input 
                               type="number" 
                               className="w-16 text-right border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none" 
                               value={item.discount}
                               onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                             />
                             <span className="text-gray-500 ml-1">%</span>
                          </div>
                       </td>
                       <td className="px-3 py-3">
                          <select className="w-full border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none bg-transparent">
                             <option value="">Select Customer</option>
                          </select>
                       </td>
                       <td className="px-3 py-3 text-right font-medium">
                          {Number(item.amount).toFixed(2)}
                       </td>
                       <td className="px-3 py-3 text-center">
                          <button type="button" onClick={() => removeItemRow(index)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <X size={16} />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center gap-2">
               <button type="button" onClick={addItemRow} className="text-blue-600 text-sm flex items-center gap-1 hover:underline border border-blue-200 bg-blue-50 px-3 py-1.5 rounded">
                  <Plus size={14}/> Add New Row
               </button>
               <button type="button" className="text-gray-600 text-sm flex items-center gap-1 hover:underline border border-gray-200 px-3 py-1.5 rounded bg-gray-50">
                  <Settings size={14}/> Purchase Discounts <ChevronDown size={12}/>
               </button>
               <button type="button" className="text-gray-600 text-sm flex items-center gap-1 hover:underline border border-gray-200 px-3 py-1.5 rounded bg-gray-50">
                  <Settings size={14}/> Reporting Tags <ChevronDown size={12}/>
               </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end p-6 pt-0">
             <div className="w-full max-w-sm space-y-3 text-sm">
                <div className="flex justify-between items-center">
                   <span className="text-gray-600">Sub Total</span>
                   <span className="font-medium">{formData.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-gray-600"><input type="radio" name="taxType" defaultChecked className="text-blue-600 focus:ring-blue-500" /> TDS</label>
                      <label className="flex items-center gap-1 text-gray-600"><input type="radio" name="taxType" className="text-blue-600 focus:ring-blue-500" /> TCS</label>
                   </div>
                   <select className="border border-gray-300 rounded px-2 py-1 text-sm w-40 focus:outline-none focus:border-blue-500">
                      <option>Select a Tax</option>
                   </select>
                   <span className="font-medium text-gray-500">-0.00</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-600">Adjustment</span>
                   <input type="number" className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-sm focus:outline-none focus:border-blue-500" placeholder="0.00" />
                   <Info size={14} className="text-gray-400" />
                   <span className="font-medium">{formData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
                   <span className="text-gray-800 font-semibold text-base">Total</span>
                   <span className="font-semibold text-base">₹{formData.total.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <hr className="border-gray-200" />

          {/* Notes & Attachments */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/30">
             <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Notes</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24" 
                  placeholder="It will not be shown in PDF"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                ></textarea>
             </div>
             <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Attach File(s) to Bill</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                   <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                   <span className="text-blue-600 text-sm font-medium">Upload File</span>
                   <ChevronDown size={12} className="inline text-blue-600 ml-1" />
                   <p className="text-xs text-gray-500 mt-1">You can upload a maximum of 5 files, 10MB each</p>
                </div>
             </div>
          </div>

          {/* Additional Fields */}
          <div className="p-6 pt-0">
             <p className="text-xs text-gray-500">
                Additional Fields: Start adding custom fields for your payments made by going to <span className="font-semibold">Settings > Purchases > Bills.</span>
             </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
           <div className="flex items-center gap-3">
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "Draft")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                 {isSubmitting ? "Saving..." : "Save as Draft"}
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                 {isSubmitting ? "Saving..." : "Save as Open"}
              </button>
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => navigate("/admin/accounts/purchases/bills")} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                 Cancel
              </button>
           </div>
        </div>
      </form>

    </div>
  );
};

export default BillForm;