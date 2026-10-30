import React, { useState } from "react";
import { 
  ChevronDown, AlertTriangle, Filter, X, Search, ArrowRight, 
  FileText, CheckCircle2, ChevronLeft
} from "lucide-react";

const BulkUpdatePage = () => {
  // State to manage views: 'initial', 'filtered'
  const [view, setView] = useState("initial");
  
  // Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Filter Form State
  const [filterData, setFilterData] = useState({
    account: "",
    contact: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: ""
  });

  // Applied filter state (for the result view)
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Mock Account Options
  const accountOptions = [
    "Employee Advance", "Accounts Payable", "Cash", "Bank", "Petty Cash", "Sales"
  ];
  const contactOptions = [
    "LocalFix", "Mrs. sss www", "Acme Corp"
  ];

  const handleFilterChange = (field, value) => {
    setFilterData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    // Save the applied filters to display in the results view
    setAppliedFilters(filterData);
    setIsFilterModalOpen(false);
    setView("filtered");
  };

  const handleReset = () => {
    setFilterData({
      account: "", contact: "", startDate: "", endDate: "", minAmount: "", maxAmount: ""
    });
    setAppliedFilters(null);
    setView("initial");
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col font-sans">
      
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800">
            {view === "initial" ? "Bulk Update Accounts in Transactions" : "Bulk Update Accounts in Transactions"}
          </h1>
        </div>
      </div>

      {/* INITIAL STATE (Image 1) */}
      {view === "initial" && (
        <div className="flex-1 flex flex-col items-center pt-24 px-6 relative">
          
          {/* Custom Empty Graphic (Using Lucide/CSS shapes to mimic the illustration) */}
          <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
             <div className="absolute inset-0 bg-orange-100 rounded-full opacity-50 blur-xl"></div>
             <div className="relative z-10 w-24 h-28 bg-purple-600 rounded-lg shadow-lg flex flex-col items-center justify-center transform rotate-6">
                <div className="w-16 h-2 bg-purple-400 rounded mb-2"></div>
                <div className="w-16 h-2 bg-purple-400 rounded mb-2"></div>
                <div className="w-16 h-2 bg-purple-400 rounded mb-2"></div>
                <div className="w-12 h-2 bg-purple-400 rounded"></div>
             </div>
             <div className="absolute top-4 right-6 w-8 h-8 bg-yellow-400 rounded-full z-20"></div>
             <div className="absolute bottom-6 left-4 w-10 h-10 bg-orange-400 rounded-full z-0"></div>
          </div>

          <h2 className="text-2xl font-normal text-gray-800 mb-2 text-center max-w-3xl">
            Bulk Update Accounts in Transactions
          </h2>
          <p className="text-gray-600 text-sm mb-8 max-w-3xl text-center">
            Filter transactions (Invoices, Credit Notes, Purchase Orders, Expenses, Bills, Vendor Credits) and bulk-update its accounts with a new account
          </p>

          {/* Warning Banner */}
          <div className="bg-[#FFF8E7] border border-[#FDE5B4] rounded-md p-4 flex items-start gap-3 max-w-3xl mb-8">
             <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
             <p className="text-sm text-gray-800">
                <span className="font-semibold">Bulk-updating accounts in transactions will cause significant changes to the financial data of your business.</span> We recommend that you do this with the assistance of an accountant.
             </p>
          </div>

          <button 
             onClick={() => setIsFilterModalOpen(true)}
             className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors"
          >
             Filter and Bulk Update
          </button>
        </div>
      )}

      {/* FILTERED RESULTS STATE (Image 3) */}
      {view === "filtered" && (
        <div className="flex-1 flex flex-col px-6 py-6 max-w-6xl mx-auto w-full">
          
          {/* Applied Filters Banner */}
          <div className="bg-[#F2FAF5] border border-[#D1F2D9] rounded-md p-6 mb-12">
             <h3 className="text-sm italic font-medium text-green-700 mb-3">Filtered based on</h3>
             <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                <li>
                   Account Name: <span className="font-semibold">{appliedFilters?.account || "All"}</span>
                </li>
                {appliedFilters?.contact && (
                  <li>
                     Contact: <span className="font-semibold">{appliedFilters.contact}</span>
                  </li>
                )}
             </ul>
             <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="text-blue-600 text-sm mt-4 hover:underline flex items-center gap-1"
             >
                Change Filter Criteria <ArrowRight size={14} />
             </button>
          </div>

          {/* Empty Transactions Message */}
          <div className="flex-1 flex items-center justify-center text-center py-12">
             <p className="text-gray-500 text-base max-w-4xl">
                No transactions (Invoices, Credit Notes, Purchase Orders, Expenses, Bills, Vendor Credits) Available. Please change the filter criteria and try again.
             </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t border-gray-200 flex items-center gap-3">
             <button className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors">
                Update
             </button>
             <button 
                onClick={handleReset}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
             >
                Go Back
             </button>
          </div>
        </div>
      )}

      {/* FILTER MODAL (Image 2) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-start pt-16 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-normal text-gray-800">Filter Transactions</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-700">
                Select an account and enter your ranges to filter your transaction
              </p>

              {/* Account */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-red-500 font-medium w-32 shrink-0">Account*</label>
                <select 
                   className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                   value={filterData.account}
                   onChange={(e) => handleFilterChange("account", e.target.value)}
                >
                  <option value="">Select an account</option>
                  {accountOptions.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700 w-32 shrink-0">Contact</label>
                <select 
                   className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                   value={filterData.contact}
                   onChange={(e) => handleFilterChange("contact", e.target.value)}
                >
                  <option value="">Select Contact</option>
                  {contactOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700 w-32 shrink-0">Date Range</label>
                <div className="flex items-center gap-2 w-full">
                   <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filterData.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
                   <span className="text-gray-500">-</span>
                   <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filterData.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
                </div>
              </div>

              {/* Total Amount Range */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700 w-32 shrink-0">Total Amount Range</label>
                <div className="flex items-center gap-2 w-full">
                   <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filterData.minAmount} onChange={(e) => handleFilterChange("minAmount", e.target.value)} />
                   <span className="text-gray-500">-</span>
                   <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filterData.maxAmount} onChange={(e) => handleFilterChange("maxAmount", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center gap-3">
              <button 
                 onClick={handleSearch} 
                 disabled={!filterData.account} 
                 className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Search
              </button>
              <button 
                 onClick={() => setIsFilterModalOpen(false)} 
                 className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BulkUpdatePage;