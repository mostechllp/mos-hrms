import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addOrder, updateOrder } from "../../../store/slices/accounts/salesOrdersSlice";
import { X, HelpCircle, ChevronRight, Plus, Trash2, Settings, Search, Upload, ChevronDown } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const SalesOrderForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingOrder = useSelector((state) => 
    state.salesOrders.orders.find((o) => o.id === id)
  );
  
  const customers = useSelector((state) => state.customers.customers);

  const [formData, setFormData] = useState({
    orderNumber: existingOrder?.orderNumber || `SO-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: existingOrder?.customerName || "",
    customerEmail: existingOrder?.customerEmail || "",
    reference: existingOrder?.reference || "",
    orderDate: existingOrder?.orderDate || new Date().toISOString().split('T')[0],
    expectedShipmentDate: existingOrder?.expectedShipmentDate || "",
    paymentTerms: existingOrder?.paymentTerms || "Due on Receipt",
    deliveryMethod: existingOrder?.deliveryMethod || "",
    salesperson: existingOrder?.salesperson || "",
    status: existingOrder?.status || "Draft",
    currency: "INR",
    notes: existingOrder?.notes || "",
    terms: existingOrder?.terms || "",
    discount: existingOrder?.discount || 0,
    discountType: existingOrder?.discountType || "percentage",
    adjustment: existingOrder?.adjustment || 0,
    items: existingOrder?.items || [
      { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 }
    ]
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Calculations
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
      dispatch(updateOrder({ id, ...finalData }));
    } else {
      dispatch(addOrder(finalData));
    }
    navigate("/admin/accounts/sales/orders");
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
        <div className="flex items-center gap-2">
            <ShoppingCartIcon className="text-gray-800 dark:text-gray-200" size={24} />
            <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
            {id ? "Edit Sales Order" : "New Sales Order"}
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-700"><Settings size={20} /></button>
            <button onClick={() => navigate("/admin/accounts/sales/orders")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={20} />
            </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin/dashboard" className="hover:text-blue-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/admin/accounts/sales/orders" className="hover:text-blue-600">Sales Orders</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {id ? `Edit: ${existingOrder?.orderNumber}` : "New Order"}
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
                         placeholder="Select or add a customer"
                      />
                   </div>
                   <button type="button" className="px-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                       <Search size={18} />
                   </button>
                </div>
             </div>

             {/* Sales Order # */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Sales Order#*</label>
                <div className="relative max-w-sm w-full">
                   <input type="text" className={inputCls} value={formData.orderNumber} onChange={(e) => setField("orderNumber", e.target.value)} />
                   <Settings size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
             </div>

             {/* Reference */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium flex justify-end items-center gap-1">Reference# <HelpCircle size={12}/></label>
                <input type="text" className={`${inputCls} max-w-sm`} value={formData.reference} onChange={(e) => setField("reference", e.target.value)} />
             </div>

             {/* Sales Order Date */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-red-500 font-medium">Sales Order Date*</label>
                <input type="date" className={`${inputCls} max-w-sm`} value={formData.orderDate} onChange={(e) => setField("orderDate", e.target.value)} />
             </div>

             {/* Expected Shipment Date */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Expected Shipment<br/>Date</label>
                <input type="date" className={`${inputCls} max-w-sm`} value={formData.expectedShipmentDate} onChange={(e) => setField("expectedShipmentDate", e.target.value)} />
             </div>

             {/* Payment Terms */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Payment Terms</label>
                <select className={`${inputCls} max-w-sm`} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                   <option value="Due on Receipt">Due on Receipt</option>
                   <option value="Net 30">Net 30</option>
                   <option value="Net 60">Net 60</option>
                </select>
             </div>

             {/* Delivery Method */}
             <div className="md:col-span-12 flex items-center gap-4 mt-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Delivery Method</label>
                <select className={`${inputCls} max-w-sm`} value={formData.deliveryMethod} onChange={(e) => setField("deliveryMethod", e.target.value)}>
                   <option value="">Select a delivery method or type to add</option>
                   <option value="Standard">Standard</option>
                   <option value="Express">Express</option>
                </select>
             </div>

             {/* Salesperson */}
             <div className="md:col-span-12 flex items-center gap-4">
                <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Salesperson</label>
                <select className={`${inputCls} max-w-sm`} value={formData.salesperson} onChange={(e) => setField("salesperson", e.target.value)}>
                   <option value="">Select or Add Salesperson</option>
                   <option value="Fidha">Fidha</option>
                </select>
             </div>

          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          {/* Item Table Section */}
          <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Item Table</h2>
                 <button type="button" className="text-sm text-blue-600 hover:underline">Bulk Actions</button>
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
                     {/* Empty Row for adding */}
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                         <td className="px-4 py-2 text-center text-gray-400"></td>
                         <td className="px-4 py-2 text-gray-400 italic text-sm border-l border-gray-100 dark:border-gray-700/60">Type or click to select an item.</td>
                         <td className="px-4 py-2 text-right text-gray-400 border-l border-gray-100 dark:border-gray-700/60">1.00</td>
                         <td className="px-4 py-2 text-right text-gray-400 border-l border-gray-100 dark:border-gray-700/60">0.00</td>
                         <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200 font-medium border-l border-gray-100 dark:border-gray-700/60">0.00</td>
                     </tr>
                  </tbody>
               </table>
             </div>
             
             <div className="flex gap-4 mt-4">
                <button type="button" onClick={addItem} className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded hover:bg-blue-100 flex items-center gap-2">
                   <Plus size={14} /> Add New Row
                </button>
                <button type="button" className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded hover:bg-blue-100 flex items-center gap-2">
                   <Plus size={14} /> Add Items in Bulk
                </button>
             </div>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Notes & Terms */}
             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Notes</label>
                   <textarea rows="3" className={inputCls} placeholder="Enter any notes to be displayed in your transaction" value={formData.notes} onChange={(e) => setField("notes", e.target.value)}></textarea>
                </div>
             </div>

             {/* Calculations */}
             <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-fit">
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <span>Sub Total</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{calculatedSubtotal.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                         <span>Discount</span>
                         <input type="number" className="w-16 px-1 py-0.5 border rounded text-xs text-right" value={formData.discount} onChange={(e) => setField("discount", Number(e.target.value))} />
                         <select className="text-xs border rounded py-0.5" value={formData.discountType} onChange={(e) => setField("discountType", e.target.value)}>
                            <option value="percentage">%</option>
                            <option value="amount">INR</option>
                         </select>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{discountAmount.toFixed(2)}</span>
                   </div>

                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <input type="radio" checked readOnly className="text-blue-600" />
                        <span>TDS</span>
                        <input type="radio" readOnly className="ml-2" />
                        <span>TCS</span>
                        <select className="text-xs border rounded py-0.5 ml-2 text-gray-400">
                            <option>Select a Tax</option>
                        </select>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">- 0.00</span>
                   </div>

                   <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 border border-dashed rounded text-xs">Adjustment</span>
                         <input type="number" className="w-20 px-1 py-0.5 border rounded text-xs text-right" value={formData.adjustment} onChange={(e) => setField("adjustment", Number(e.target.value))} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{Number(formData.adjustment || 0).toFixed(2)}</span>
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
                 <textarea rows="3" className={inputCls} placeholder="Enter the terms and conditions of your business to be displayed in your transaction" value={formData.terms} onChange={(e) => setField("terms", e.target.value)}></textarea>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attach File(s) to Sales Order</label>
                 <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 items-center justify-between">
                     <button type="button" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 px-2 hover:bg-gray-50 rounded">
                         <Upload size={14} /> Upload File
                     </button>
                     <ChevronDown size={14} className="text-gray-400" />
                 </div>
                 <p className="text-xs text-gray-400 mt-2">You can upload a maximum of 10 files, 5MB each</p>
              </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                  Additional Fields: Add custom fields to your sales orders by going to <i>Settings ➔ Sales ➔ Sales Orders ➔ Field Customization</i>.
              </p>
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
        <Button variant="secondary" onClick={() => navigate("/admin/accounts/sales/orders")} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6 ml-auto">
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Simple Icon replacement for ShoppingCart inside the file
const ShoppingCartIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export default SalesOrderForm;