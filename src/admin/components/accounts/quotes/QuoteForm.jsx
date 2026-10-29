import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addQuote, updateQuote } from "../../../store/slices/accounts/quotesSlice";
import { X, Info, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const QuoteForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  // Get existing quote if editing
  const existingQuote = useSelector((state) => 
    state.quotes.quotes.find((q) => q.id === id)
  );
  
  // Get customers for dropdown
  const customers = useSelector((state) => state.customers.customers);

  const [formData, setFormData] = useState({
    quoteNumber: existingQuote?.quoteNumber || `QT-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: existingQuote?.customerName || "",
    customerEmail: existingQuote?.customerEmail || "",
    date: existingQuote?.date || new Date().toISOString().split('T')[0],
    expiryDate: existingQuote?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: existingQuote?.status || "Draft",
    currency: "INR",
    notes: existingQuote?.notes || "Looking forward for your business.",
    terms: existingQuote?.terms || "",
    discount: existingQuote?.discount || 0,
    discountType: existingQuote?.discountType || "percentage",
    adjustment: existingQuote?.adjustment || 0,
    items: existingQuote?.items || [
      { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 }
    ]
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Calculate totals dynamically
  const calculatedSubtotal = formData.items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const calculatedTax = formData.items.reduce((acc, item) => acc + (item.qty * item.rate * (item.tax / 100)), 0);
  
  let discountAmount = 0;
  if (formData.discountType === "percentage") {
      discountAmount = calculatedSubtotal * (formData.discount / 100);
  } else {
      discountAmount = formData.discount;
  }

  const finalTotal = calculatedSubtotal + calculatedTax - discountAmount + Number(formData.adjustment || 0);

  // Item handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setField("items", newItems);
  };

  const addItem = () => {
    setField("items", [...formData.items, { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setField("items", newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      subtotal: calculatedSubtotal,
      taxTotal: calculatedTax,
      total: finalTotal,
    };

    if (id) {
      dispatch(updateQuote({ id, ...finalData }));
    } else {
      dispatch(addQuote(finalData));
    }
    navigate("/admin/accounts/sales/quotes");
  };

  const handleCustomerSelect = (customerId) => {
    const selected = customers.find(c => c.id === customerId);
    if (selected) {
       setField("customerName", selected.displayName);
       setField("customerEmail", selected.email);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
          {id ? "Edit Quote" : "New Quote"}
        </h1>
        <button onClick={() => navigate("/admin/accounts/sales/quotes")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X size={20} />
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin/dashboard" className="hover:text-blue-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/admin/accounts/sales/quotes" className="hover:text-blue-600">Quotes</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {id ? `Edit: ${existingQuote?.quoteNumber}` : "New Quote"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full pb-20">
        <div className="py-6 px-8 w-full max-w-7xl mx-auto">
          
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             
             {/* Customer Selection */}
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name*</label>
                <div className="flex gap-2">
                   <div className="flex-1">
                      <SearchableSelect 
                         value={formData.customerName}
                         onChange={(val) => {
                             // If user types a new name manually
                             setField("customerName", val);
                             // Try to find email
                             const found = customers.find(c => c.displayName === val);
                             if (found) setField("customerEmail", found.email);
                         }}
                         options={customers.map(c => ({ value: c.displayName, label: c.displayName }))}
                         placeholder="Select or type customer..."
                      />
                   </div>
                   <button type="button" onClick={() => navigate("/admin/accounts/sales/customers/new")} className="px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      + New
                   </button>
                </div>
                <input 
                  type="email" 
                  className={`${inputCls} mt-2`} 
                  placeholder="Customer Email" 
                  value={formData.customerEmail} 
                  onChange={(e) => setField("customerEmail", e.target.value)} 
                />
             </div>

             {/* Quote Number & Dates */}
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote #</label>
                  <input type="text" className={inputCls} value={formData.quoteNumber} onChange={(e) => setField("quoteNumber", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote Date</label>
                      <input type="date" className={inputCls} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                      <input type="date" className={inputCls} value={formData.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} />
                   </div>
                </div>
             </div>
          </div>

          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          {/* Items Table Section */}
          <div className="mb-8">
             <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Item Table</h2>
             
             <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-semibold">
                     <tr>
                        <th className="px-4 py-3 w-12 text-center">#</th>
                        <th className="px-4 py-3 w-1/3">Item Details</th>
                        <th className="px-4 py-3 w-32 text-right">Quantity</th>
                        <th className="px-4 py-3 w-32 text-right">Rate</th>
                        <th className="px-4 py-3 w-24 text-right">Tax %</th>
                        <th className="px-4 py-3 w-32 text-right">Amount</th>
                        <th className="px-4 py-3 w-12"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                     {formData.items.map((item, index) => (
                        <tr key={item.id}>
                           <td className="px-4 py-2 text-center text-gray-500">{index + 1}</td>
                           <td className="px-4 py-2">
                              <input type="text" placeholder="Item Name" className={`${inputCls} font-medium mb-1`} value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
                              <input type="text" placeholder="Description" className={`${inputCls} text-xs py-1`} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                           </td>
                           <td className="px-4 py-2">
                              <input type="number" min="1" className={`${inputCls} text-right`} value={item.qty} onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))} />
                           </td>
                           <td className="px-4 py-2">
                              <input type="number" min="0" className={`${inputCls} text-right`} value={item.rate} onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} />
                           </td>
                           <td className="px-4 py-2">
                              <input type="number" min="0" className={`${inputCls} text-right`} value={item.tax} onChange={(e) => handleItemChange(index, 'tax', Number(e.target.value))} />
                           </td>
                           <td className="px-4 py-2 text-right font-medium text-gray-800 dark:text-gray-200">
                              {(item.qty * item.rate).toFixed(2)}
                           </td>
                           <td className="px-4 py-2 text-center">
                              <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                                 <Trash2 size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
             
             <div className="flex justify-between items-center mt-3">
                <button type="button" onClick={addItem} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                   <Plus size={14} /> Add New Row
                </button>
             </div>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Notes & Terms */}
             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Notes</label>
                   <textarea rows="3" className={inputCls} placeholder="Looking forward for your business." value={formData.notes} onChange={(e) => setField("notes", e.target.value)}></textarea>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                   <textarea rows="3" className={inputCls} placeholder="Enter terms and conditions..." value={formData.terms} onChange={(e) => setField("terms", e.target.value)}></textarea>
                </div>
             </div>

             {/* Calculations */}
             <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 h-fit">
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <span>Sub Total</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{calculatedSubtotal.toFixed(2)}</span>
                   </div>
                   
                   {/* Discount */}
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                         <span>Discount</span>
                         <input type="number" className="w-16 px-1 py-0.5 border rounded text-xs text-right" value={formData.discount} onChange={(e) => setField("discount", Number(e.target.value))} />
                         <select className="text-xs border rounded py-0.5" value={formData.discountType} onChange={(e) => setField("discountType", e.target.value)}>
                            <option value="percentage">%</option>
                            <option value="amount">INR</option>
                         </select>
                      </div>
                      <span className="font-medium text-red-500">-{discountAmount.toFixed(2)}</span>
                   </div>

                   {/* Tax */}
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <span>Tax</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{calculatedTax.toFixed(2)}</span>
                   </div>

                   {/* Adjustment */}
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                         <span>Adjustment</span>
                         <input type="number" className="w-20 px-1 py-0.5 border rounded text-xs text-right" value={formData.adjustment} onChange={(e) => setField("adjustment", Number(e.target.value))} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{Number(formData.adjustment || 0).toFixed(2)}</span>
                   </div>

                   <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-800 dark:text-gray-200">Total ({formData.currency})</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{finalTotal.toFixed(2)}</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-start gap-3 sticky bottom-0 z-10 px-8 mt-auto">
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save as Draft
        </Button>
        <Button onClick={handleSubmit} variant="secondary" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6">
          Save and Send
        </Button>
        <Button variant="secondary" onClick={() => navigate("/admin/accounts/sales/quotes")} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6 ml-auto">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default QuoteForm;