import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Added useDispatch
import { deleteBankAccount } from "../../store/slices/accounts/bankingSlice"; // Imported thunk
import { 
  Plus, MoreHorizontal, ChevronDown, PlayCircle, X, 
  Building2, CreditCard, Search, ChevronRight, Wallet, Landmark, 
  HelpCircle, Settings, ArrowRight, ShieldCheck, Trash2
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal"; // Imported Modal

const BankingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.banking.accounts);

  const [isConnectDrawerOpen, setIsConnectDrawerOpen] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteBankAccount(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete account.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            {accounts.length === 0 ? "Banking" : "Banking Overview"}
          </h1>
          {accounts.length > 0 && <ChevronDown size={16} className="text-blue-600" />}
        </div>

        {accounts.length > 0 && (
          <div className="flex items-center gap-3">
             <button onClick={() => navigate("/admin/accounts/banking/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium rounded flex items-center gap-1">
               Add Bank or Credit Card
             </button>
             <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
               Manage Transaction Rules
             </button>
             <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
               More <ChevronDown size={14}/>
             </button>
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {accounts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center pt-24 px-6 relative">
           <h2 className="text-3xl font-medium text-gray-900 mb-4">Stay on top of your money</h2>
           <p className="text-gray-500 text-sm mb-8 max-w-lg text-center">
             Connect your bank and credit cards to fetch all your transactions. Create, categorize and match these transactions to those you have in Zoho Books.
           </p>
           
           <div className="flex items-center gap-4 mb-12">
             <button onClick={() => setIsConnectDrawerOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
               Connect Bank / Credit Card
             </button>
             <button onClick={() => navigate("/admin/accounts/banking/new")} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded font-medium text-sm transition-colors border border-gray-300">
               Add Manually
             </button>
           </div>
           
           <button className="text-sm text-gray-600 hover:underline flex items-center gap-1 mb-24">
             Don't use banking for your business? <span className="text-blue-600">Skip</span>
           </button>

        </div>
      ) : (
        /* POPULATED DASHBOARD */
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          
          {/* Summary Cards & Chart Container */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-800 flex items-center gap-1 cursor-pointer">All Accounts <ChevronDown size={16}/></h2>
                <button className="text-sm text-gray-600 flex items-center gap-1 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                  <CalendarIcon /> Last 30 days <ChevronDown size={14}/>
                </button>
             </div>
             
             <div className="flex items-center gap-12 mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-600">
                      <Wallet size={20} />
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 font-medium">Cash in Hand</p>
                      <p className="text-lg font-semibold text-gray-900">₹-888.00</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-50 rounded flex items-center justify-center text-green-600">
                      <Landmark size={20} />
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 font-medium">Bank Balance</p>
                      <p className="text-lg font-semibold text-gray-900">₹0.00</p>
                   </div>
                </div>
             </div>

             {/* Chart Area (Mock) */}
             <div className="relative h-64 border-b border-gray-100 mb-4">
                <div className="absolute top-0 left-0 text-blue-600 text-sm font-medium flex items-center gap-1 cursor-pointer">
                   <ChevronDown size={14} className="rotate-180"/> Hide Chart
                </div>
                <div className="absolute left-0 top-8 h-full flex flex-col justify-between text-xs text-gray-400 pb-6">
                   <span>0</span><span>-200</span><span>-400</span><span>-600</span><span>-800</span>
                </div>
                <svg className="w-full h-full pl-12 pt-8" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M 0 50 L 80 50 Q 90 50 95 80 L 100 80" fill="none" stroke="#10B981" strokeWidth="1.5" />
                   <path d="M 0 50 L 75 50 Q 85 50 90 70 L 100 90" fill="none" stroke="#6B7280" strokeWidth="1.5" />
                </svg>
                <div className="absolute bottom-0 left-12 w-full flex justify-between text-xs text-gray-400 pt-2">
                   {["01 Oct","03 Oct","05 Oct","07 Oct","09 Oct","11 Oct","13 Oct","15 Oct","17 Oct","19 Oct","21 Oct","23 Oct","25 Oct","27 Oct","29 Oct"].map(d => <span key={d}>{d}</span>)}
                </div>
             </div>
             
             <div className="flex gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-500 rounded-sm"></div> Cash In Hand</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> Bank Balance</div>
             </div>
          </div>

          {/* Active Accounts Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
             <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 flex items-center gap-1 cursor-pointer">Active Accounts <ChevronDown size={16}/></h2>
             </div>
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                   <tr>
                      <th className="px-6 py-3">Account Details</th>
                      <th className="px-4 py-3 text-right">Uncategorized</th>
                      <th className="px-4 py-3 text-right">Pending Checks</th>
                      <th className="px-4 py-3 text-right">Amount in Bank</th>
                      <th className="px-4 py-3 text-right">Amount in Zoho Books</th>
                      <th className="px-4 py-3 w-20 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-gray-50 group cursor-pointer">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white group-hover:border-blue-400">
                                  {acc.type === "Cash" ? <Wallet size={16}/> : <Building2 size={16}/>}
                               </div>
                               <span className="font-medium text-blue-600 group-hover:underline">{acc.name}</span>
                            </div>
                         </td>
                         <td className="px-4 py-4 text-right text-gray-500"></td>
                         <td className="px-4 py-4 text-right text-gray-500"></td>
                         <td className="px-4 py-4 text-right text-gray-800 font-medium">₹{Number(acc.amountInBank).toFixed(2)}</td>
                         <td className="px-4 py-4 text-right text-gray-800 font-medium">₹{Number(acc.amountInBooks).toFixed(2)}</td>
                         <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(acc); }} 
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete Account"
                               >
                                  <Trash2 size={16} />
                               </button>
                               <ChevronDown size={16} className="text-gray-400 rotate-180"/>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* SLIDING DRAWER (Connect Bank) */}
      {isConnectDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setIsConnectDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-white shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded">
                    <ShieldCheck size={18} />
                 </div>
                 <h2 className="text-lg font-semibold text-gray-800">Connect and Add Your Bank Accounts or Credit Cards</h2>
              </div>
              <button onClick={() => setIsConnectDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-full">
                 <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
              
              <p className="text-sm text-gray-600">
                 Connect your bank accounts to fetch the bank feeds using one of our third-party bank feeds service providers. Or, you can add your bank accounts manually and import bank feeds.
              </p>

              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-6">
                 <span className="text-sm font-medium text-gray-800 w-32 shrink-0">Partner Banks Fetch feeds directly</span>
                 <div className="flex items-center gap-4 flex-wrap">
                    <div className="h-8 bg-gray-100 rounded px-2 flex items-center text-xs font-bold text-blue-800">standard chartered</div>
                    <div className="h-8 bg-gray-100 rounded px-2 flex items-center text-xs font-bold text-red-600">HSBC</div>
                    <div className="h-8 bg-gray-100 rounded px-2 flex items-center text-xs font-bold text-red-600">kotak</div>
                    <div className="h-8 bg-gray-100 rounded px-2 flex items-center text-xs font-bold text-blue-600">SBI</div>
                    <div className="h-8 bg-gray-100 rounded px-2 flex items-center text-xs font-bold text-purple-800">AXIS BANK</div>
                 </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                 <div className="p-6 flex justify-between items-center bg-white">
                    <div>
                       <h3 className="text-lg font-medium text-gray-800 mb-1">Automatic Bank Feeds Supported Banks</h3>
                       <p className="text-sm text-gray-600">Connect your bank accounts and fetch the bank feeds using one of our third-party bank feeds service providers.</p>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium shrink-0">
                       Connect Now
                    </button>
                 </div>
                 
                 <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {[
                         { name: "PayPal", icon: <div className="text-blue-700 font-bold italic">PayPal</div> },
                         { name: "ICICI Bank (India)", icon: <div className="w-6 h-6 bg-orange-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold">i</div> },
                         { name: "HDFC Bank (India)", icon: <div className="w-6 h-6 bg-red-600 rounded text-white text-[10px] flex items-center justify-center font-bold">H</div> },
                         { name: "State Bank of India (I...", icon: <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">S</div> },
                         { name: "Kotak Mahindra Ban...", icon: <div className="w-6 h-6 bg-blue-800 rounded-full text-white text-[10px] flex items-center justify-center font-bold">K</div> },
                         { name: "Axis Bank (India)", icon: <div className="w-6 h-6 bg-red-800 rounded text-white text-[10px] flex items-center justify-center font-bold">A</div> },
                         { name: "HDFC Bank (India) - ...", icon: <div className="w-6 h-6 bg-red-600 rounded text-white text-[10px] flex items-center justify-center font-bold">H</div>, isCc: true },
                         { name: "State Bank of India ...", icon: <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">S</div>, isCc: true },
                         { name: "American Express C...", icon: <div className="w-6 h-6 bg-blue-400 rounded text-white text-[10px] flex items-center justify-center font-bold">Am</div>, isCc: true },
                       ].map((bank, i) => (
                          <div key={i} className="border border-gray-200 rounded-md p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer">
                             {bank.icon}
                             <span className="text-sm text-gray-800 font-medium truncate">{bank.name}</span>
                             {bank.isCc && <div className="ml-auto w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">↻</div>}
                          </div>
                       ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                       <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-blue-500">
                          <CreditCard size={12} />
                       </div>
                       <span>Credit Card</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1 flex items-center gap-2">
                       <Building2 size={20} className="text-blue-500"/> Add bank or credit card account manually
                    </h3>
                    <p className="text-sm text-gray-600 max-w-2xl">
                       Unable to connect your bank or credit card account using our Service Provider? Add the accounts manually using your account details.
                    </p>
                 </div>
                 <button onClick={() => navigate("/admin/accounts/banking/new")} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium shrink-0">
                    Add Account
                 </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
        onConfirm={handleDeleteConfirm}
        title="Delete Bank Account"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting account, please wait..."
            : `Are you sure you want to delete the account "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Simple icon fallback for Calendar
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default BankingPage;