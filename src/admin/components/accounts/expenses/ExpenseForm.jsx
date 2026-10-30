import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addExpense, updateExpense } from "../../../store/slices/accounts/expensesSlice";
import { X, Settings, Search, UploadCloud, ChevronDown, ListTree, Plus, Trash2, MoreHorizontal } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const EXPENSE_ACCOUNTS = [
  { value: "Advertising And Marketing", label: "Advertising And Marketing" },
  { value: "Automobile Expense", label: "Automobile Expense" },
  { value: "Job Costing", label: "Job Costing" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Rent Expense", label: "Rent Expense" },
  { value: "Travel Expense", label: "Travel Expense" },
];

const PAID_THROUGH_ACCOUNTS = [
  { value: "Petty Cash", label: "Petty Cash" },
  { value: "Undeposited Funds", label: "Undeposited Funds" },
  { value: "Bank Account", label: "Bank Account" },
];

// Helper to generate empty bulk rows
const createEmptyRow = () => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
  date: "",
  expenseAccount: "",
  amount: "",
  paidThrough: "",
  vendor: "",
  customerName: "",
  project: "",
  billable: false,
});

const ExpenseForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingExpense = useSelector((state) => 
    state.expenses.expenses.find((e) => e.id === id)
  );
  
  const vendors = useSelector((state) => state.vendors.vendors);
  const customers = useSelector((state) => state.customers.customers);

  const [activeTab, setActiveTab] = useState("Record Expense");
  
  // --- Form State for Single Expense ---
  const [formData, setFormData] = useState({
    date: existingExpense?.date || new Date().toISOString().split('T')[0],
    expenseAccount: existingExpense?.expenseAccount || "",
    amount: existingExpense?.amount || "",
    paidThrough: existingExpense?.paidThrough || "",
    vendor: existingExpense?.vendor || "",
    invoiceNumber: existingExpense?.invoiceNumber || "",
    notes: existingExpense?.notes || "",
    customerName: existingExpense?.customerName || "",
    isBillable: existingExpense?.isBillable || false,
    currency: "INR"
  });

  // --- Form State for Mileage ---
  const [mileageData, setMileageData] = useState({
    date: new Date().toISOString().split('T')[0],
    employee: "",
    calculateMileageUsing: "distance",
    distance: "",
    ratePerKm: 3,
    amount: "0.00",
    paidThrough: "",
    vendor: "",
    invoiceNumber: "",
    notes: "",
    customerName: ""
  });

  // --- Form State for Bulk Add ---
  const [bulkRows, setBulkRows] = useState([createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()]);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setMileageField = (key, value) => {
    setMileageData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBulkRowChange = (rowId, field, value) => {
    setBulkRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const addBulkRow = () => {
    setBulkRows([...bulkRows, createEmptyRow()]);
  };

  const removeBulkRow = (rowId) => {
    setBulkRows(bulkRows.filter(row => row.id !== rowId));
  };

  // Auto-calculate mileage amount
  React.useEffect(() => {
    if (mileageData.calculateMileageUsing === "distance" && mileageData.distance) {
      const amt = Number(mileageData.distance) * mileageData.ratePerKm;
      setMileageField("amount", amt.toFixed(2));
    }
  }, [mileageData.distance, mileageData.ratePerKm, mileageData.calculateMileageUsing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === "Record Expense") {
      if (!formData.expenseAccount || !formData.amount) return;
      const finalData = {
        ...formData,
        amount: Number(formData.amount) || 0,
        isBillable: !!formData.customerName,
        status: "Paid"
      };
      if (id) {
        dispatch(updateExpense({ id, ...finalData }));
      } else {
        dispatch(addExpense(finalData));
      }
    } else if (activeTab === "Record Mileage") {
      if (!mileageData.paidThrough || !mileageData.amount) return;
      const finalData = {
        ...mileageData,
        expenseAccount: "Automobile Expense", // Default for mileage
        amount: Number(mileageData.amount) || 0,
        status: "Paid"
      };
      dispatch(addExpense(finalData));
    } else if (activeTab === "Bulk Add Expenses") {
      // Filter out completely empty rows
      const validRows = bulkRows.filter(row => row.expenseAccount && row.amount);
      validRows.forEach(row => {
        dispatch(addExpense({
          ...row,
          amount: Number(row.amount) || 0,
          status: "Paid"
        }));
      });
    }
    
    navigate("/admin/accounts/purchases/expenses");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header / Tabs */}
      <div className="px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex gap-8">
            {["Record Expense", "Record Mileage", "Bulk Add Expenses"].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium transition-colors ${
                        activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
        <button onClick={() => navigate("/admin/accounts/purchases/expenses")} className="p-2 text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full pb-20">
        
        {/* === TAB 1: RECORD EXPENSE === */}
        {activeTab === "Record Expense" && (
          <div className="py-6 px-8 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-6 max-w-3xl">
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium">Date*</label>
                  <input type="date" className={`${inputCls} max-w-sm`} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
               </div>
               <div className="flex items-start gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium mt-2">Expense Account*</label>
                  <div className="flex-1 max-w-sm space-y-2">
                      <SearchableSelect value={formData.expenseAccount} onChange={(val) => setField("expenseAccount", val)} options={EXPENSE_ACCOUNTS} placeholder="Select an account" />
                      <button type="button" className="text-xs text-blue-600 flex items-center gap-1 font-medium hover:underline">
                          <ListTree size={14} /> Itemize
                      </button>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium">Amount*</label>
                  <div className="flex max-w-sm w-full">
                      <select className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md outline-none">
                          <option>INR</option>
                      </select>
                      <input type="number" className={`${inputCls} rounded-l-none`} value={formData.amount} onChange={(e) => setField("amount", e.target.value)} />
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium">Paid Through*</label>
                  <div className="flex-1 max-w-sm">
                      <SearchableSelect value={formData.paidThrough} onChange={(val) => setField("paidThrough", val)} options={PAID_THROUGH_ACCOUNTS} placeholder="Select an account" />
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Vendor</label>
                  <div className="flex-1 flex gap-2 max-w-sm">
                      <div className="flex-1">
                          <SearchableSelect value={formData.vendor} onChange={(val) => setField("vendor", val)} options={vendors.map(v => ({ value: v.displayName, label: v.displayName }))} placeholder="" />
                      </div>
                      <button type="button" className="px-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                          <Search size={18} />
                      </button>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Invoice#</label>
                  <input type="text" className={`${inputCls} max-w-sm`} value={formData.invoiceNumber} onChange={(e) => setField("invoiceNumber", e.target.value)} />
               </div>
               <div className="flex items-start gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">Notes</label>
                  <textarea rows="3" className={`${inputCls} max-w-sm`} placeholder="Max. 500 characters" value={formData.notes} onChange={(e) => setField("notes", e.target.value)}></textarea>
               </div>
               <div className="border-b border-gray-200 dark:border-gray-700 my-6"></div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Customer Name</label>
                  <div className="flex-1 flex gap-2 max-w-sm">
                      <div className="flex-1">
                          <SearchableSelect value={formData.customerName} onChange={(val) => setField("customerName", val)} options={customers.map(c => ({ value: c.displayName, label: c.displayName }))} placeholder="Select or add a customer" />
                      </div>
                      <button type="button" className="px-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                          <Search size={18} />
                      </button>
                  </div>
               </div>
            </div>
            
            <div className="w-full md:w-80">
                <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/20 h-80 sticky top-24">
                    <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm">
                        <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Drag or Drop your Receipts</p>
                    <p className="text-xs text-gray-500 mb-6">Maximum file size allowed is 10MB</p>
                    <Button variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-xs h-9 border-none w-full justify-center">
                        <UploadCloud size={14} className="mr-2"/> Upload your Files <ChevronDown size={14} className="ml-2"/>
                    </Button>
                </div>
            </div>
          </div>
        )}

        {/* === TAB 2: RECORD MILEAGE === */}
        {activeTab === "Record Mileage" && (
          <div className="py-6 px-8 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-6 max-w-3xl">
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium">Date*</label>
                  <input type="date" className={`${inputCls} max-w-sm`} value={mileageData.date} onChange={(e) => setMileageField("date", e.target.value)} />
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Employee</label>
                  <select className={`${inputCls} max-w-sm`} value={mileageData.employee} onChange={(e) => setMileageField("employee", e.target.value)}>
                     <option value="">Select Employee</option>
                     <option value="fidha">Fidha Fathima</option>
                  </select>
               </div>
               <div className="flex items-start gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium mt-2">Calculate mileage using*</label>
                  <div className="flex flex-col gap-3 mt-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input type="radio" checked={mileageData.calculateMileageUsing === "distance"} onChange={() => setMileageField("calculateMileageUsing", "distance")} className="text-blue-600 focus:ring-blue-500" /> Distance travelled
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input type="radio" checked={mileageData.calculateMileageUsing === "odometer"} onChange={() => setMileageField("calculateMileageUsing", "odometer")} className="text-blue-600 focus:ring-blue-500" /> Odometer reading
                      </label>
                  </div>
               </div>
               
               {mileageData.calculateMileageUsing === "distance" && (
                  <>
                    <div className="flex items-center gap-4">
                        <label className="w-40 text-sm text-right text-red-500 font-medium">Distance*</label>
                        <div className="flex max-w-sm w-full">
                            <input type="number" className={`${inputCls} rounded-r-none`} value={mileageData.distance} onChange={(e) => setMileageField("distance", e.target.value)} />
                            <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-r-md">Kilometer(s)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium"></label>
                        <p className="text-xs text-gray-500">Rate per km = ₹ {mileageData.ratePerKm} <button type="button" className="text-blue-500 hover:underline">Change</button></p>
                    </div>
                  </>
               )}

               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium">Amount*</label>
                  <div className="flex max-w-sm w-full">
                      <select className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md outline-none">
                          <option>INR</option>
                      </select>
                      <input type="number" className={`${inputCls} rounded-l-none`} value={mileageData.amount} readOnly={mileageData.calculateMileageUsing === "distance"} onChange={(e) => setMileageField("amount", e.target.value)} />
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-red-500 font-medium">Paid Through*</label>
                  <div className="flex-1 max-w-sm">
                      <SearchableSelect value={mileageData.paidThrough} onChange={(val) => setMileageField("paidThrough", val)} options={PAID_THROUGH_ACCOUNTS} placeholder="Select an account" />
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Vendor</label>
                  <div className="flex-1 flex gap-2 max-w-sm">
                      <div className="flex-1">
                          <SearchableSelect value={mileageData.vendor} onChange={(val) => setMileageField("vendor", val)} options={vendors.map(v => ({ value: v.displayName, label: v.displayName }))} placeholder="" />
                      </div>
                      <button type="button" className="px-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                          <Search size={18} />
                      </button>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Invoice#</label>
                  <input type="text" className={`${inputCls} max-w-sm`} value={mileageData.invoiceNumber} onChange={(e) => setMileageField("invoiceNumber", e.target.value)} />
               </div>
               <div className="flex items-start gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">Notes</label>
                  <textarea rows="3" className={`${inputCls} max-w-sm`} placeholder="Max. 500 characters" value={mileageData.notes} onChange={(e) => setMileageField("notes", e.target.value)}></textarea>
               </div>
               <div className="border-b border-gray-200 dark:border-gray-700 my-6"></div>
               <div className="flex items-center gap-4">
                  <label className="w-40 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">Customer Name</label>
                  <div className="flex-1 flex gap-2 max-w-sm">
                      <div className="flex-1">
                          <SearchableSelect value={mileageData.customerName} onChange={(val) => setMileageField("customerName", val)} options={customers.map(c => ({ value: c.displayName, label: c.displayName }))} placeholder="Select or add a customer" />
                      </div>
                      <button type="button" className="px-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                          <Search size={18} />
                      </button>
                  </div>
               </div>
            </div>

            <div className="w-full md:w-80">
                <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/20 h-80 sticky top-24">
                    <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm">
                        <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Drag or Drop your Receipts</p>
                    <p className="text-xs text-gray-500 mb-6">Maximum file size allowed is 10MB</p>
                    <Button variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-xs h-9 border-none w-full justify-center">
                        <UploadCloud size={14} className="mr-2"/> Upload your Files <ChevronDown size={14} className="ml-2"/>
                    </Button>
                </div>
            </div>
          </div>
        )}

        {/* === TAB 3: BULK ADD EXPENSES === */}
        {activeTab === "Bulk Add Expenses" && (
          <div className="py-6 px-8 w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1200px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                 <tr>
                    <th className="px-3 py-3 w-10"></th>
                    <th className="px-3 py-3 text-red-500">Date*</th>
                    <th className="px-3 py-3 text-red-500">Expense Account*</th>
                    <th className="px-3 py-3 text-red-500">Amount*</th>
                    <th className="px-3 py-3 text-red-500">Paid Through*</th>
                    <th className="px-3 py-3">Vendor</th>
                    <th className="px-3 py-3">Customer Name</th>
                    <th className="px-3 py-3">Projects</th>
                    <th className="px-3 py-3 text-center">Billable</th>
                    <th className="px-3 py-3">Reporting Tags</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                 {bulkRows.map((row, index) => (
                    <tr key={row.id}>
                       <td className="px-3 py-2 text-center text-gray-400">
                           <button type="button" onClick={() => removeBulkRow(row.id)} className="hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                           </button>
                       </td>
                       <td className="px-3 py-2">
                          <input type="date" className={`${inputCls} py-1.5 px-2 text-sm`} value={row.date} onChange={(e) => handleBulkRowChange(row.id, "date", e.target.value)} />
                       </td>
                       <td className="px-3 py-2">
                          <select className={`${inputCls} py-1.5 px-2 text-sm`} value={row.expenseAccount} onChange={(e) => handleBulkRowChange(row.id, "expenseAccount", e.target.value)}>
                              <option value="">Select an account</option>
                              {EXPENSE_ACCOUNTS.map(acc => <option key={acc.value} value={acc.value}>{acc.label}</option>)}
                          </select>
                       </td>
                       <td className="px-3 py-2">
                          <div className="flex">
                              <select className="px-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md outline-none">
                                  <option>INR</option>
                              </select>
                              <input type="number" className={`${inputCls} rounded-l-none py-1.5 px-2 text-sm`} value={row.amount} onChange={(e) => handleBulkRowChange(row.id, "amount", e.target.value)} />
                          </div>
                       </td>
                       <td className="px-3 py-2">
                          <select className={`${inputCls} py-1.5 px-2 text-sm`} value={row.paidThrough} onChange={(e) => handleBulkRowChange(row.id, "paidThrough", e.target.value)}>
                              <option value="">Select an account</option>
                              {PAID_THROUGH_ACCOUNTS.map(acc => <option key={acc.value} value={acc.value}>{acc.label}</option>)}
                          </select>
                       </td>
                       <td className="px-3 py-2">
                          <select className={`${inputCls} py-1.5 px-2 text-sm`} value={row.vendor} onChange={(e) => handleBulkRowChange(row.id, "vendor", e.target.value)}>
                              <option value="">Select</option>
                              {vendors.map(v => <option key={v.id} value={v.displayName}>{v.displayName}</option>)}
                          </select>
                       </td>
                       <td className="px-3 py-2">
                          <select className={`${inputCls} py-1.5 px-2 text-sm`} value={row.customerName} onChange={(e) => handleBulkRowChange(row.id, "customerName", e.target.value)}>
                              <option value="">Select</option>
                              {customers.map(c => <option key={c.id} value={c.displayName}>{c.displayName}</option>)}
                          </select>
                       </td>
                       <td className="px-3 py-2">
                          <select className={`${inputCls} py-1.5 px-2 text-sm`}>
                              <option value="">Select</option>
                          </select>
                       </td>
                       <td className="px-3 py-2 text-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" checked={row.billable} onChange={(e) => handleBulkRowChange(row.id, "billable", e.target.checked)} />
                       </td>
                       <td className="px-3 py-2">
                          <button type="button" className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              <TagIcon size={12} className="text-gray-400"/> Associate Tags
                          </button>
                          <button type="button" className="ml-2 text-gray-400 hover:text-gray-700"><MoreHorizontal size={16}/></button>
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
            
            <button type="button" onClick={addBulkRow} className="mt-4 text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
               <Plus size={14} /> Add More Expenses
            </button>
          </div>
        )}

      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-start gap-3 sticky bottom-0 z-10 px-8 mt-auto">
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save (Alt+S)
        </Button>
        {activeTab !== "Bulk Add Expenses" && (
           <Button onClick={handleSubmit} variant="secondary" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6">
             Save and New (Alt+N)
           </Button>
        )}
        <Button variant="secondary" onClick={() => navigate("/admin/accounts/purchases/expenses")} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6">
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Simple icon for Reporting Tags
const TagIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
);

export default ExpenseForm;