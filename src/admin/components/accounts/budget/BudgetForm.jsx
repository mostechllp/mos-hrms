import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBudget } from "../../../store/slices/accounts/budgetsSlice";
import { X, Plus } from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white";

const BudgetForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.budgets.loading);

  const [formData, setFormData] = useState({
    name: "",
    fiscalYear: "Apr 2026 - Mar 2027",
    period: "Monthly",
    includeBalanceSheet: false
  });

  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newBudget = {
      ...formData,
      incomeAccounts: [],
      expenseAccounts: [],
      budgetData: {
        income: {}, otherIncome: {}, cogs: {}, expense: {}, otherExpense: {}
      }
    };

    await dispatch(addBudget(newBudget)).unwrap();
    navigate("/admin/accounts/accountant/budgets");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
        <h1 className="text-xl font-medium text-gray-800">New Budget</h1>
        <button onClick={() => navigate("/admin/accounts/accountant/budgets")} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-4xl mx-auto px-8 py-8">
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <label className="text-sm text-red-500 font-medium w-40 shrink-0">Name*</label>
              <input type="text" className={`${inputCls} max-w-md`} value={formData.name} onChange={(e) => setField("name", e.target.value)} />
           </div>
           
           <div className="flex items-center gap-4">
              <label className="text-sm text-red-500 font-medium w-40 shrink-0">Fiscal Year*</label>
              <select className={`${inputCls} max-w-md`} value={formData.fiscalYear} onChange={(e) => setField("fiscalYear", e.target.value)}>
                <option value="Apr 2026 - Mar 2027">Apr 2026 - Mar 2027</option>
                <option value="Apr 2025 - Mar 2026">Apr 2025 - Mar 2026</option>
              </select>
           </div>

           <div className="flex items-center gap-4">
              <label className="text-sm text-red-500 font-medium w-40 shrink-0">Budget Period*</label>
              <select className={`${inputCls} max-w-md`} value={formData.period} onChange={(e) => setField("period", e.target.value)}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
           </div>

           <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Income and Expense Accounts</h3>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-700 w-40 shrink-0">Income Accounts</label>
                    <button type="button" className="w-full max-w-md text-left text-sm text-blue-600 border border-dashed border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                       <Plus size={14}/> Add Accounts
                    </button>
                 </div>
                 <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-700 w-40 shrink-0">Expense Accounts</label>
                    <button type="button" className="w-full max-w-md text-left text-sm text-blue-600 border border-dashed border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                       <Plus size={14}/> Add Accounts
                    </button>
                 </div>
              </div>

              <div className="mt-6 ml-44">
                 <button type="button" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Plus size={16} className="bg-blue-600 text-white rounded-full p-0.5"/> Include Asset, Liability, and Equity Accounts in Budget
                 </button>
              </div>
           </div>
        </div>

        <div className="mt-12 pt-6 flex items-center gap-3">
           <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isLoading ? "Creating..." : "Create Budget"}
           </button>
           <button type="button" onClick={() => navigate("/admin/accounts/accountant/budgets")} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors">
              Cancel
           </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;