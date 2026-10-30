import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAccount } from "../../store/slices/accounts/chartOfAccountsSlice";
import { 
  Plus, MoreHorizontal, ChevronDown, Search, Filter, 
  Settings, UserPlus, X, MessageSquare, 
  Lock,
  Edit2,
  FileText
} from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white";

const ChartOfAccountsPage = () => {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.chartOfAccounts.accounts);
  const isLoading = useSelector((state) => state.chartOfAccounts.loading);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    type: "Other Asset",
    name: "",
    code: "",
    description: "",
    watchlist: false
  });

  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const filteredAccounts = accounts.filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    await dispatch(addAccount(formData)).unwrap();
    setIsModalOpen(false);
    setFormData({ type: "Other Asset", name: "", code: "", description: "", watchlist: false });
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800">Active Accounts</h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            <UserPlus size={16} /> Find Accountants
          </button>
          <div className="flex items-center rounded border border-gray-300 overflow-hidden">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1">
              <Plus size={16} /> New
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 border-l border-blue-400">
              <ChevronDown size={14} />
            </button>
          </div>
          <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-end bg-white">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></th>
              <th className="px-4 py-3">ACCOUNT NAME</th>
              <th className="px-4 py-3">ACCOUNT CODE</th>
              <th className="px-4 py-3">ACCOUNT TYPE</th>
              <th className="px-4 py-3">DOCUMENTS</th>
              <th className="px-4 py-3">PARENT ACCOUNT NAME</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedAccount(acc)}>
                <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline flex items-center gap-2">
                  {acc.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{acc.code || "-"}</td>
                <td className="px-4 py-3 text-gray-800">{acc.type}</td>
                <td className="px-4 py-3 text-gray-400"></td>
                <td className="px-4 py-3 text-gray-400">{acc.parent || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <Settings size={16} className="text-gray-400 group-hover:text-blue-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SLIDING DETAILS PANEL (Image 2) */}
      {selectedAccount && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]" onClick={() => setSelectedAccount(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[45%] lg:w-[40%] bg-white shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-500 font-medium">{selectedAccount.type}</span>
                 <h2 className="text-lg font-bold text-gray-900">{selectedAccount.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><MessageSquare size={16}/></button>
                 <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Settings size={16}/></button>
                 <button onClick={() => setSelectedAccount(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded ml-2"><X size={20} /></button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="flex items-center gap-2 mb-6">
                 <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:underline">
                    <Edit2 size={14}/> Edit
                 </button>
                 <span className="text-gray-300">|</span>
                 <button className="text-sm text-gray-700 hover:underline">More</button>
              </div>

              <div className="mb-8">
                 <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Closing Balance</p>
                 <p className="text-2xl font-medium text-blue-600">₹{Number(selectedAccount.balance).toFixed(2)} <span className="text-xs text-gray-500 font-normal">(Cr)</span></p>
                 <p className="text-sm text-gray-600 mt-4"><span className="text-gray-500">Description :</span> {selectedAccount.description || "-"}</p>
              </div>

              <div className="border-t border-gray-200 pt-8 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <FileText size={28} />
                 </div>
                 <p className="text-sm text-gray-500">There are no transactions available</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CREATE ACCOUNT MODAL (Image 3) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-start pt-16 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in border border-gray-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-normal text-gray-800">Create Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Account Type */}
              <div className="flex items-start gap-4 relative">
                <label className="text-sm text-red-500 font-medium w-40 shrink-0 pt-2">Account Type*</label>
                <div className="w-full relative">
                   <select 
                     className={inputCls}
                     value={formData.type}
                     onChange={(e) => setField("type", e.target.value)}
                   >
                     <option value="Other Asset">Other Asset</option>
                     <option value="Cash">Cash</option>
                     <option value="Bank">Bank</option>
                     <option value="Expense">Expense</option>
                     <option value="Income">Income</option>
                   </select>
                </div>
              </div>

              {/* Account Name */}
              <div className="flex items-start gap-4">
                <label className="text-sm text-red-500 font-medium w-40 shrink-0 pt-2">Account Name*</label>
                <input 
                  type="text" 
                  className={inputCls}
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>

              {/* Account Code */}
              <div className="flex items-start gap-4">
                <label className="text-sm text-gray-700 w-40 shrink-0 pt-2">Account Code</label>
                <input 
                  type="text" 
                  className={`${inputCls} max-w-xs`}
                  value={formData.code}
                  onChange={(e) => setField("code", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="flex items-start gap-4">
                <label className="text-sm text-gray-700 w-40 shrink-0 pt-2">Description</label>
                <textarea 
                  className={`${inputCls} resize-none h-24`}
                  placeholder="Max. 500 characters"
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>

              {/* Watchlist */}
              <div className="flex items-start gap-4">
                <div className="w-40 shrink-0"></div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={formData.watchlist} 
                    onChange={(e) => setField("watchlist", e.target.checked)} 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  Add to the watchlist on my dashboard
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="submit" 
                  disabled={isLoading || !formData.name} 
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
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

export default ChartOfAccountsPage;