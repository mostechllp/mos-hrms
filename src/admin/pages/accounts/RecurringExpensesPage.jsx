import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileStatus, deleteProfile } from "../../store/slices/accounts/recurringExpensesSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  ArrowRight, RefreshCw, Wallet, Calendar, DollarSign
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const RecurringExpensesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profiles = useSelector((state) => state.recurringExpenses.profiles);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const filteredProfiles = profiles.filter(
    (p) =>
      p.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.expenseAccount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteProfile(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedProfile?.id === deleteTarget.id) {
        setSelectedProfile(null); 
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Profiles</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/purchases/recurring-expenses/new")} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          >
            <Plus size={16} className="mr-1" /> New
          </Button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 py-1 text-sm text-gray-700 dark:text-gray-200">
                   <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><ArrowUpDown size={14} /> Sort by</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><Download size={14} /> Import</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><Upload size={14} /> Export</span>
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Settings size={14} /> Preferences
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {profiles.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-16 pb-20 px-6">
          
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Create. Set. Repeat.</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Create recurring expenses to handle and pay for stuff you spend on periodically.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/purchases/recurring-expenses/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              New Recurring Expense
            </Button>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Recurring Expenses</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-24 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-16">Life cycle of a Recurring Expense</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative">
                
                {/* Step 1 */}
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-md px-4 py-3 flex items-center gap-2 text-blue-600 w-48 shadow-sm">
                    <FileText size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">CREATE RECURRING<br/>EXPENSE</span>
                </div>
                
                {/* Connector Branches */}
                <div className="hidden md:flex flex-col justify-center w-16 relative h-24">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute left-0 top-1/2 h-12 border-l-2 border-dashed border-gray-300"></div>
                    <div className="absolute left-0 bottom-0 w-full border-t-2 border-dashed border-gray-300"></div>
                </div>

                {/* Right Branches */}
                <div className="flex flex-col gap-4">
                    {/* Top Branch */}
                    <div className="flex items-center gap-2">
                        <div className="border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-md px-4 py-2 flex items-center gap-2 text-green-600 w-32 shadow-sm">
                            <FileText size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">BILLABLE</span>
                        </div>
                        <div className="w-8 border-t-2 border-dashed border-gray-300 relative">
                            <ArrowRight size={12} className="absolute -right-1 -top-1.5 text-gray-300" />
                        </div>
                        <div className="border border-blue-200 bg-white dark:bg-gray-800 rounded-md px-4 py-2 flex items-center gap-2 text-blue-600 w-40 shadow-sm">
                            <FileText size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">CONVERT TO INVOICE</span>
                        </div>
                        <div className="w-8 border-t-2 border-dashed border-gray-300 relative">
                            <ArrowRight size={12} className="absolute -right-1 -top-1.5 text-gray-300" />
                        </div>
                        <div className="border border-green-200 bg-white dark:bg-gray-800 rounded-md px-4 py-2 flex items-center gap-2 text-green-600 w-40 shadow-sm">
                            <DollarSign size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">GET REIMBURSED</span>
                        </div>
                    </div>

                    {/* Bottom Branch */}
                    <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-md px-4 py-2 flex items-center gap-2 text-red-600 w-32 shadow-sm">
                        <FileText size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">NON-BILLABLE</span>
                    </div>
                </div>

            </div>

            <div className="mt-24 text-center max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-12">
              <h4 className="text-xl text-gray-800 dark:text-gray-200 mb-6 font-medium">In the Recurring Expenses module, you can:</h4>
              <div className="space-y-4 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Create a recurring profile to routinely auto-generate expenses.</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> View when each expense was auto-generated.</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Create individual expenses within the recurring profile.</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        // Table View
        <>
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Filter size={16} /></button>
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Profile Name <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Expense Account</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Next Expense Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {profile.profileName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{profile.expenseAccount}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{profile.repeatEvery}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{profile.startDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      ₹{profile.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           profile.status === 'Active' ? 'bg-green-100 text-green-700' : 
                           profile.status === 'Stopped' ? 'bg-gray-200 text-gray-700' :
                           'bg-red-100 text-red-700'
                       }`}>
                         {profile.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedProfile(profile); setActiveTab("Overview"); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/recurring-expenses/edit/${profile.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(profile)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sliding Drawer for View */}
      {selectedProfile && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedProfile(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedProfile.profileName}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedProfile.status === 'Active' ? 'bg-green-500 text-white' : 
                    'bg-gray-300 text-gray-700'
                }`}>
                    {selectedProfile.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                  <Button 
                     onClick={() => navigate(`/admin/accounts/purchases/recurring-expenses/edit/${selectedProfile.id}`)}
                     variant="secondary" 
                     className="h-8 px-3 text-xs"
                  >
                     <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button variant="secondary" className="h-8 px-3 text-xs flex items-center gap-1">
                     More <ChevronDown size={12}/>
                  </Button>
                  <button onClick={() => setSelectedProfile(null)} className="p-1 text-gray-500 hover:text-gray-800 ml-2">
                    <X size={20} />
                  </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {["Overview", "All Expenses"].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 text-sm font-medium transition-colors ${
                            activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/30 pb-24">
              
              {activeTab === "Overview" && (
                  <div className="p-6 space-y-8">
                      
                      {/* Top Metrics Row */}
                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                  <Wallet size={20} />
                              </div>
                              <div>
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">₹{selectedProfile.amount.toFixed(2)}</p>
                                  <p className="text-[10px] text-gray-500">Expense Amount</p>
                              </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                  <RefreshCw size={20} />
                              </div>
                              <div>
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedProfile.repeatEvery}</p>
                                  <p className="text-[10px] text-gray-500">Repeats</p>
                              </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                  <Calendar size={20} />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedProfile.startDate}</p>
                                  <p className="text-[10px] text-gray-500">Next Expense Date</p>
                              </div>
                          </div>
                      </div>

                      <hr className="border-gray-200 dark:border-gray-700" />

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="space-y-4">
                              <div>
                                  <p className="text-gray-500 mb-1">Expense Account</p>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProfile.expenseAccount}</p>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <p className="text-gray-500 mb-1">Paid Through</p>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProfile.paidThrough}</p>
                              </div>
                          </div>
                          <div className="flex gap-4">
                              <div className="w-1/2">
                                  <p className="text-gray-500 mb-1">Start On</p>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProfile.startDate}</p>
                              </div>
                              <div className="w-1/2">
                                  <p className="text-gray-500 mb-1">Ends On</p>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProfile.neverExpires ? "Goes on forever" : selectedProfile.endDate}</p>
                              </div>
                          </div>
                      </div>

                      <hr className="border-gray-200 dark:border-gray-700" />

                      {/* Other Details */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">Other Details</h3>
                          <div className="space-y-2 text-sm">
                              <div className="flex">
                                  <span className="text-gray-500 w-24">Notes</span>
                                  <span className="text-gray-900 dark:text-gray-100">{selectedProfile.notes || "-"}</span>
                              </div>
                          </div>
                      </div>

                      <hr className="border-gray-200 dark:border-gray-700" />

                      {/* History Timeline */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">History</h3>
                          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-6 space-y-6">
                              <div className="relative">
                                  <div className="absolute -left-[29px] top-1 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                                  <div className="flex gap-4">
                                      <div className="w-12 h-12 bg-green-50 rounded flex items-center justify-center shrink-0">
                                          <FileText size={20} className="text-green-500" />
                                      </div>
                                      <div>
                                          <p className="text-xs text-gray-500 mb-1">30/10/2026 11:03 AM</p>
                                          <p className="text-sm text-gray-800 dark:text-gray-200">Recurring expense created for <b>₹{selectedProfile.amount.toFixed(2)}</b></p>
                                          <p className="text-xs text-gray-500 mt-0.5">by Fidha Fathima</p>
                                      </div>
                                  </div>
                              </div>
                              <div className="relative">
                                  <div className="absolute -left-[29px] top-1 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                                  <div className="flex gap-4">
                                      <div className="w-12 h-12 bg-orange-50 rounded flex items-center justify-center shrink-0">
                                          <FileText size={20} className="text-orange-500" />
                                      </div>
                                      <div>
                                          <p className="text-xs text-gray-500 mb-1">30/10/2026 11:03 AM</p>
                                          <p className="text-sm text-gray-800 dark:text-gray-200">Expense Created for <b>₹{selectedProfile.amount.toFixed(2)}</b></p>
                                          <p className="text-xs text-gray-500 mt-0.5">by Fidha Fathima</p>
                                          <button className="text-xs text-blue-500 font-medium mt-2 flex items-center gap-1 hover:underline">
                                              <Eye size={12}/> View the expense
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>
              )}

              {activeTab === "All Expenses" && (
                  <div className="p-6">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold">
                                  <tr>
                                      <th className="px-4 py-3">Date</th>
                                      <th className="px-4 py-3">Expense Account</th>
                                      <th className="px-4 py-3">Status</th>
                                      <th className="px-4 py-3">Paid Through</th>
                                      <th className="px-4 py-3 text-right">Amount</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                  {selectedProfile.childExpenses.map((exp, idx) => (
                                      <tr key={idx}>
                                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{exp.date}</td>
                                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{exp.expenseAccount}</td>
                                          <td className="px-4 py-3 text-gray-500">{exp.status}</td>
                                          <td className="px-4 py-3 text-gray-500">{exp.paidThrough}</td>
                                          <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100">₹{exp.amount.toFixed(2)}</td>
                                      </tr>
                                  ))}
                                  {selectedProfile.childExpenses.length === 0 && (
                                      <tr>
                                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No expenses generated yet.</td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recurring Expense Profile"
        message={`Are you sure you want to delete profile "${deleteTarget?.profileName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default RecurringExpensesPage;