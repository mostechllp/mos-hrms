import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addChallan, updateChallan } from "../../../store/slices/accounts/deliveryChallansSlice";
import { X, ChevronRight, Plus, Settings, Search, FileText } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const DeliveryChallanForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingChallan = useSelector((state) => 
    state.deliveryChallans.challans.find((c) => c.id === id)
  );
  
  const customers = useSelector((state) => state.customers.customers);

  const [formData, setFormData] = useState({
    challanNumber: existingChallan?.challanNumber || `DC-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: existingChallan?.customerName || "",
    customerEmail: existingChallan?.customerEmail || "",
    date: existingChallan?.date || new Date().toISOString().split('T')[0],
    challanType: existingChallan?.challanType || "Job Work",
    status: existingChallan?.status || "Draft",
    currency: "INR",
    notes: existingChallan?.notes || "Thanks for your business.",
    terms: existingChallan?.terms || "Goods once sold will not be taken back.",
    items: existingChallan?.items || [
      { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 }
    ]
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Calculations
  const calculatedSubtotal = formData.items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const finalTotal = calculatedSubtotal; // Assuming no tax for challans usually

  // Item handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setField("items", newItems);
  };

  const addItem = () => {
    setField("items", [...formData.items, { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      subtotal: calculatedSubtotal,
      taxTotal: 0,
      total: finalTotal,
    };

    if (id) {
      dispatch(updateChallan({ id, ...finalData }));
    } else {
      dispatch(addChallan(finalData));
    }
    navigate("/admin/accounts/sales/challans");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center gap-2">
            <FileText className="text-gray-800 dark:text-gray-200" size={24} />
            <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
            {id ? "Edit Delivery Challan" : "New Delivery Challan"}
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-700"><Settings size={20} /></button>
            <button onClick={() => navigate("/admin/accounts/sales/challans")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={20} />
            </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin/dashboard" className="hover:text-blue-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/admin/accounts/sales/challans" className="hover:text-blue-600">Delivery Challans</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {id ? `Edit: ${existingChallan?.challanNumber}` : "New Challan"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full pb-20">
        <div className="py-6 px-8 w-full max-w-7xl mx-auto">
          
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 mb-8">
             
             {/* Customer Name */}
             <div className="md:col-span-12 flex items-start gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium mt-2">Customer Name*</label>
                <div className="flex-1 flex gap-2 max-w-3xl">
                   <div className="flex-1">
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
                   </div>
                   <button type="button" className="px-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                       <Search size={18} />
                   </button>
                </div>
             </div>

             {/* Challan # */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Challan#*</label>
                <div className="relative max-w-sm w-full">
                   <input type="text" className={inputCls} value={formData.challanNumber} onChange={(e) => setField("challanNumber", e.target.value)} />
                   <Settings size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
             </div>

             {/* Challan Date */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Challan Date*</label>
                <input type="date" className={`${inputCls} max-w-sm`} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
             </div>

             {/* Challan Type */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Challan Type</label>
                <select className={`${inputCls} max-w-sm`} value={formData.challanType} onChange={(e) => setField("challanType", e.target.value)}>
                   <option value="Job Work">Job Work</option>
                   <option value="Supply">Supply</option>
                   <option value="Return">Return</option>
                </select>
             </div>
             
             {/* Subject */}
             <div className="md:col-span-12 flex items-start gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">Subject</label>
                <textarea rows="2" className={`${inputCls} max-w-3xl`} placeholder="Let your customer know what this Challan is for" value={formData.subject || ""} onChange={(e) => setField("subject", e.target.value)}></textarea>
             </div>

          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          {/* Item Table Section */}
          <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Item Table</h2>
                 <button type="button" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Settings size={14}/> Bulk Actions</button>
             </div>
             
             <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800/30">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-semibold uppercase">
                     <tr>
                        <th className="px-4 py-3 w-10"></th>
                        <th className="px-4 py-3 w-1/3">Item Details</th>
                        <th className="px-4 py-3 w-32 text-right border-l border-gray-200 dark:border-gray-700">Quantity</th>
                        <th className="px-4 py-3 w-32 text-right border-l border-gray-200 dark:border-gray-700">Rate</th>
                        <th className="px-4 py-3 w-32 text-right border-l border-gray-200 dark:border-gray-700">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                     {formData.items.map((item, index) => (
                        <tr key={item.id}>
                           <td className="px-4 py-2 text-center text-gray-400">
                               <div className="flex flex-col gap-1 items-center opacity-30">
                                   <div className="w-4 h-0.5 bg-current"></div>
                                   <div className="w-4 h-0.5 bg-current"></div>
                                   <div className="w-4 h-0.5 bg-current"></div>
                               </div>
                           </td>
                           <td className="px-4 py-2 border-l border-gray-100 dark:border-gray-700/60">
                              <input type="text" placeholder="Type or click to select an item." className={`${inputCls} border-none shadow-none focus:ring-0 px-0 font-medium`} value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
                              <input type="text" placeholder="Description" className={`${inputCls} border-none shadow-none focus:ring-0 px-0 text-xs py-1 text-gray-500`} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                           </td>
                           <td className="px-4 py-2 border-l border-gray-100 dark:border-gray-700/60">
                              <input type="number" min="1" className={`${inputCls} text-right border-none shadow-none focus:ring-0`} value={item.qty} onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))} />
                           </td>
                           <td className="px-4 py-2 border-l border-gray-100 dark:border-gray-700/60">
                              <input type="number" min="0" className={`${inputCls} text-right border-none shadow-none focus:ring-0`} value={item.rate} onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} />
                           </td>
                           <td className="px-4 py-2 text-right font-medium text-gray-800 dark:text-gray-200 border-l border-gray-100 dark:border-gray-700/60">
                              {(item.qty * item.rate).toFixed(2)}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
             
             <div className="flex gap-4 mt-4">
                <button type="button" onClick={addItem} className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded hover:bg-blue-100 flex items-center gap-2">
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
                   <textarea rows="3" className={inputCls} placeholder="Thanks for your business." value={formData.notes} onChange={(e) => setField("notes", e.target.value)}></textarea>
                </div>
             </div>

             {/* Calculations */}
             <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-fit">
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <span>Sub Total</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{calculatedSubtotal.toFixed(2)}</span>
                   </div>
                   <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded">
                      <span className="text-base font-bold text-gray-800 dark:text-gray-200">Total (₹)</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{finalTotal.toFixed(2)}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions</label>
                 <textarea rows="3" className={inputCls} placeholder="Enter the terms and conditions" value={formData.terms} onChange={(e) => setField("terms", e.target.value)}></textarea>
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
        <Button variant="secondary" onClick={() => navigate("/admin/accounts/sales/challans")} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6 ml-auto">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeliveryChallanForm;