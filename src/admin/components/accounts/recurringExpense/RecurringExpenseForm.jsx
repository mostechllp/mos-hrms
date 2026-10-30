import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, updateProfile } from "../../../store/slices/accounts/recurringExpensesSlice";
import { X, Search, Settings, Info } from "lucide-react";
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

const RecurringExpenseForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingProfile = useSelector((state) => 
    state.recurringExpenses.profiles.find((p) => p.id === id)
  );
  
  const vendors = useSelector((state) => state.vendors?.vendors || []);
  const customers = useSelector((state) => state.accountCustomers?.customers || state.customers?.customers || []);

  const [formData, setFormData] = useState({
    profileName: existingProfile?.profileName || "",
    repeatEvery: existingProfile?.repeatEvery || "Week",
    startDate: existingProfile?.startDate || new Date().toISOString().split('T')[0],
    endDate: existingProfile?.endDate || "",
    neverExpires: existingProfile?.neverExpires ?? true,
    expenseAccount: existingProfile?.expenseAccount || "",
    amount: existingProfile?.amount || "",
    paidThrough: existingProfile?.paidThrough || "",
    vendor: existingProfile?.vendor || "",
    notes: existingProfile?.notes || "",
    customerName: existingProfile?.customerName || "",
    status: existingProfile?.status || "Active",
    currency: "INR"
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.profileName.trim() || !formData.expenseAccount || !formData.amount) return;

    const finalData = {
      ...formData,
      amount: Number(formData.amount) || 0,
      childExpenses: existingProfile?.childExpenses || []
    };

    if (id) {
      dispatch(updateProfile({ id, ...finalData }));
    } else {
      dispatch(addProfile(finalData));
    }
    navigate("/admin/accounts/purchases/recurring-expenses");
  };

  return (
    // Removed pb-24. Flex-col and min-h-screen will push the footer to the bottom.
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {id ? "Edit Recurring Expense" : "New Recurring Expense"}
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => navigate("/admin/accounts/purchases/recurring-expenses")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X size={20} />
            </button>
        </div>
      </div>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          
          {/* Section 1: Schedule Details */}
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
               Schedule Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Profile Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className={inputCls} 
                  value={formData.profileName} 
                  onChange={(e) => setField("profileName", e.target.value)} 
                  placeholder="e.g., Monthly Office Rent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Repeat Every <span className="text-red-500">*</span>
                </label>
                <select 
                  className={inputCls} 
                  value={formData.repeatEvery} 
                  onChange={(e) => setField("repeatEvery", e.target.value)}
                >
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  className={inputCls} 
                  value={formData.startDate} 
                  onChange={(e) => setField("startDate", e.target.value)} 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Info size={12} /> The expense will be created on {formData.startDate}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Ends On
                </label>
                <input 
                  type="date" 
                  className={inputCls} 
                  value={formData.endDate} 
                  onChange={(e) => setField("endDate", e.target.value)} 
                  disabled={formData.neverExpires}
                />
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer mt-1">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    checked={formData.neverExpires}
                    onChange={(e) => setField("neverExpires", e.target.checked)}
                  />
                  Never Expires
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Expense Details */}
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
               Expense Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Expense Account <span className="text-red-500">*</span>
                </label>
                <SearchableSelect 
                  options={EXPENSE_ACCOUNTS} 
                  value={formData.expenseAccount} 
                  onChange={(val) => setField("expenseAccount", val)} 
                  placeholder="Select an account"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="flex w-full">
                  <select className="border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="INR">INR</option>
                  </select>
                  <input 
                    type="number" 
                    className={`${inputCls} rounded-l-none`} 
                    value={formData.amount} 
                    onChange={(e) => setField("amount", e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Paid Through <span className="text-red-500">*</span>
                </label>
                <SearchableSelect 
                  options={PAID_THROUGH_ACCOUNTS} 
                  value={formData.paidThrough} 
                  onChange={(val) => setField("paidThrough", val)} 
                  placeholder="Select an account"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Vendor
                </label>
                <div className="flex w-full">
                  <SearchableSelect 
                    options={vendors.map(v => ({ value: v.id || v.vendorName, label: v.vendorName || v.name }))} 
                    value={formData.vendor} 
                    onChange={(val) => setField("vendor", val)} 
                    placeholder="Select a vendor"
                    className="rounded-r-none border-r-0"
                  />
                  <button type="button" className="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Additional Information */}
          <div className="p-6 md:p-8">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
               Additional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
               <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Customer Name
                </label>
                <div className="flex w-full">
                  <SearchableSelect 
                    options={customers.map(c => ({ value: c.id || c.customerName, label: c.customerName || c.name }))} 
                    value={formData.customerName} 
                    onChange={(val) => setField("customerName", val)} 
                    placeholder="Select a customer"
                    className="rounded-r-none border-r-0"
                  />
                  <button type="button" className="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                    <Search size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Reporting Tags
                </label>
                <div>
                  <button type="button" className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1.5 font-medium mt-1">
                    <Settings size={14} /> Associate Tags
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Notes
                </label>
                <textarea 
                  className={`${inputCls} min-h-[100px] resize-y`} 
                  placeholder="Max. 500 characters" 
                  maxLength={500}
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* 
        Footer: Changed from 'fixed' to 'sticky bottom-0'. 
        This ensures it stays at the bottom of the view but pushes the copyright down instead of overlapping it.
      */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-6 z-20 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full">
        <Button type="submit" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-sm">
          Save
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => navigate("/admin/accounts/purchases/recurring-expenses")}
          className="px-6 py-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RecurringExpenseForm;