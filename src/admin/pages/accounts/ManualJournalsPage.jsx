import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteJournal } from "../../store/slices/accounts/manualJournalsSlice";
import { 
  Plus, MoreHorizontal, ChevronDown, PlayCircle, X, 
  Search, Filter, ArrowLeft, Trash2, Edit2, CheckCircle2,
  FileText, Printer, Settings
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManualJournalsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const journals = useSelector((state) => state.manualJournals.journals);

  const [selectedJournal, setSelectedJournal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [viewMode, setViewMode] = useState("Details"); // "Details" or "PDF"

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteJournal(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedJournal?.id === idToDelete) setSelectedJournal(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete journal.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800">All Manual Journals</h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          {!selectedJournal && (
            <>
              <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                Find Accountants
              </button>
              <button onClick={() => navigate("/admin/accounts/accountant/manual-journals/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1 rounded">
                <Plus size={16} /> New
              </button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><MoreHorizontal size={18} /></button>
            </>
          )}
        </div>
      </div>

      {journals.length === 0 ? (
        /* EMPTY STATE LAYOUT */
        <div className="flex flex-col items-center pt-16 pb-20 px-6">
          
          <h2 className="text-2xl font-normal text-gray-800 mb-2">Start making journal entries.</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-lg text-center">
            You can transfer & adjust money between accounts.
          </p>
          
          <button onClick={() => navigate("/admin/accounts/accountant/manual-journals/new")} className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5 rounded font-semibold mb-4">
            CREATE NEW JOURNAL
          </button>
          <button className="text-blue-600 text-sm hover:underline mb-16">Import Journals</button>

          {/* Info Section */}
          <div className="w-full max-w-3xl border-t border-gray-200 pt-12">
             <h4 className="text-base font-medium text-gray-800 mb-4">In the Manual Journals module, you can:</h4>
             <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-blue-500"/> 
                   Create journals from the templates you create to save time. <a href="#" className="text-blue-600 hover:underline">Learn More</a>
                </li>
                <li className="flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-blue-500"/> 
                   Customize journals to suit your branding. <a href="#" className="text-blue-600 hover:underline">Learn More</a>
                </li>
                <li className="flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-blue-500"/> 
                   Control journal publishing by customizing roles and permissions. <a href="#" className="text-blue-600 hover:underline">Learn More</a>
                </li>
             </ul>
          </div>
        </div>
      ) : (
        /* LIST TABLE */
        <>
          <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><Filter size={16} /></button>
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search journals..." className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">JOURNAL#</th>
                  <th className="px-4 py-3">REFERENCE#</th>
                  <th className="px-4 py-3">NOTES</th>
                  <th className="px-4 py-3 text-right">AMOUNT</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {journals.map((journal) => (
                  <tr key={journal.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => { setSelectedJournal(journal); setViewMode("Details"); }}>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                    <td className="px-4 py-3 text-gray-800">{journal.date}</td>
                    <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">{journal.journalNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{journal.referenceNumber || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{journal.notes}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-right">₹{Number(journal.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${journal.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>{journal.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedJournal(journal); setViewMode("Details"); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Search size={16} /></button>
                        <button onClick={() => setDeleteTarget(journal)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SLIDING DRAWER (Journal Details) */}
      {selectedJournal && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]" onClick={() => setSelectedJournal(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[65%] lg:w-[60%] bg-[#F8F9FA] shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200">
            
            {/* Drawer Header */}
            <div className="flex flex-col bg-white border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-gray-900">{selectedJournal.journalNumber}</h2>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                   <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white"><FileText size={16}/></button>
                   <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white"><FileText size={16}/></button>
                   <button onClick={() => setSelectedJournal(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded ml-2">
                      <X size={20} />
                   </button>
                </div>
              </div>
              <div className="flex gap-1 px-6 py-2">
                 <button onClick={() => navigate(`/admin/accounts/accountant/manual-journals/edit/${selectedJournal.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors text-sm text-gray-600">
                    <Edit2 size={14} /> Edit
                 </button>
                 <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors text-sm text-gray-600">
                    <Printer size={14} /> PDF/Print <ChevronDown size={14} className="ml-0.5" />
                 </button>
                 <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors text-sm text-gray-600">
                    <MoreHorizontal size={16} />
                 </button>
              </div>
              <div className="flex gap-6 px-6">
                {["Overview", "Activity Logs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "Overview" && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Header with Details/PDF toggle */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                     <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">1</span>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">Published</span>
                     </div>
                     <div className="flex bg-gray-100 rounded p-0.5">
                        <button onClick={() => setViewMode("Details")} className={`px-3 py-1 text-xs font-medium rounded ${viewMode === "Details" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}>Details</button>
                        <button onClick={() => setViewMode("PDF")} className={`px-3 py-1 text-xs font-medium rounded ${viewMode === "PDF" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}>PDF</button>
                     </div>
                  </div>

                  {/* DETAILS VIEW */}
                  {viewMode === "Details" && (
                    <div className="p-6">
                       <div className="grid grid-cols-2 gap-y-4 text-sm mb-8">
                          <div>
                             <p className="text-gray-500 mb-1">Journal#</p>
                             <p className="text-gray-900 font-medium">{selectedJournal.journalNumber}</p>
                          </div>
                          <div>
                             <p className="text-gray-500 mb-1">Reference Number</p>
                             <p className="text-gray-900 font-medium">{selectedJournal.referenceNumber || "-"}</p>
                          </div>
                          <div>
                             <p className="text-gray-500 mb-1">Journal Date</p>
                             <p className="text-gray-900 font-medium">{selectedJournal.date}</p>
                          </div>
                          <div>
                             <p className="text-gray-500 mb-1">Transaction Type</p>
                             <p className="text-gray-900 font-medium">Journal</p>
                          </div>
                          <div>
                             <p className="text-gray-500 mb-1">Currency</p>
                             <p className="text-gray-900 font-medium">INR</p>
                          </div>
                          <div>
                             <p className="text-gray-500 mb-1">Reporting Method</p>
                             <p className="text-gray-900 font-medium">{selectedJournal.reportingMethod}</p>
                          </div>
                          <div className="col-span-2">
                             <p className="text-gray-500 mb-1">Notes</p>
                             <p className="text-gray-900 font-medium">{selectedJournal.notes}</p>
                          </div>
                       </div>

                       <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-base font-semibold text-gray-800 mb-4">Journal Details</h3>
                          <table className="w-full text-left text-sm">
                             <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase">
                                <tr>
                                   <th className="px-3 py-2">ITEM</th>
                                   <th className="px-3 py-2">CONTACT</th>
                                   <th className="px-3 py-2 text-right">DEBIT</th>
                                   <th className="px-3 py-2 text-right">CREDIT</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                {selectedJournal.lines.map((line, idx) => (
                                   <tr key={idx}>
                                      <td className="px-3 py-3">
                                         <p className="text-gray-900 font-medium">{line.account}</p>
                                         <p className="text-xs text-gray-500">{line.description}</p>
                                      </td>
                                      <td className="px-3 py-3 text-gray-800">{line.contact || "-"}</td>
                                      <td className="px-3 py-3 text-right text-gray-800">{line.debit ? Number(line.debit).toFixed(2) : ""}</td>
                                      <td className="px-3 py-3 text-right text-gray-800">{line.credit ? Number(line.credit).toFixed(2) : ""}</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>

                          <div className="flex justify-end mt-4">
                             <div className="w-1/2 space-y-2 text-sm">
                                <div className="flex justify-between border-t border-gray-100 pt-2">
                                   <span className="text-gray-500">Sub Total</span>
                                   <div className="flex gap-12">
                                      <span className="font-medium text-gray-800 w-20 text-right">{Number(selectedJournal.total).toFixed(2)}</span>
                                      <span className="font-medium text-gray-800 w-20 text-right">{Number(selectedJournal.total).toFixed(2)}</span>
                                   </div>
                                </div>
                                <div className="flex justify-between border-t border-gray-300 pt-2">
                                   <span className="text-gray-900 font-semibold">Total Amount</span>
                                   <div className="flex gap-12">
                                      <span className="font-semibold text-gray-900 w-20 text-right">{Number(selectedJournal.total).toFixed(2)}</span>
                                      <span className="font-semibold text-gray-900 w-20 text-right">{Number(selectedJournal.total).toFixed(2)}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* PDF VIEW */}
                  {viewMode === "PDF" && (
                    <div className="p-8 flex justify-center bg-gray-100">
                      <div className="w-full max-w-2xl bg-white shadow-lg border border-gray-200 relative p-10 min-h-[700px] flex flex-col">
                         {/* Published Ribbon */}
                         <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
                            <div className="bg-green-600 text-white text-xs font-bold tracking-wider text-center py-1.5 shadow-md transform -rotate-45 translate-x-[-35px] translate-y-[25px] w-[160px]">
                               Published
                            </div>
                         </div>
                         
                         <div className="flex justify-end mb-4">
                            <button className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded font-medium"><Settings size={12}/> Customize</button>
                         </div>

                         <div className="text-center mb-12">
                            <h1 className="text-3xl font-serif text-black tracking-widest mb-4">JOURNAL</h1>
                            <p className="text-sm font-bold text-gray-800">#1</p>
                         </div>

                         <div className="flex justify-between items-start mb-8 text-sm">
                            <div className="space-y-2">
                               <p className="text-gray-500">Notes</p>
                               <p className="text-gray-900">{selectedJournal.notes}</p>
                            </div>
                            <div className="space-y-2 text-right">
                               <p className="text-gray-600"><span className="inline-block w-20">Date:</span> <span className="font-medium text-gray-900">{selectedJournal.date}</span></p>
                               <p className="text-gray-600"><span className="inline-block w-20">Amount:</span> <span className="font-medium text-gray-900">₹{Number(selectedJournal.total).toFixed(2)}</span></p>
                               <p className="text-gray-600"><span className="inline-block w-20">Reference Number:</span> <span className="font-medium text-gray-900"></span></p>
                            </div>
                         </div>

                         <div className="mb-8 flex-1">
                            <table className="w-full text-left text-sm border-collapse">
                               <thead>
                                  <tr className="bg-[#333333] text-white">
                                     <th className="px-3 py-2 font-medium">Account</th>
                                     <th className="px-3 py-2 font-medium">Contact</th>
                                     <th className="px-3 py-2 font-medium text-right">Debits</th>
                                     <th className="px-3 py-2 font-medium text-right">Credits</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-200">
                                  {selectedJournal.lines.map((line, idx) => (
                                     <tr key={idx}>
                                        <td className="px-3 py-3">
                                           <p className="text-gray-900 font-medium">{line.account}</p>
                                           <p className="text-xs text-gray-500">{line.description}</p>
                                        </td>
                                        <td className="px-3 py-3 text-gray-800">{line.contact || "-"}</td>
                                        <td className="px-3 py-3 text-right text-gray-800">{line.debit ? Number(line.debit).toFixed(2) : ""}</td>
                                        <td className="px-3 py-3 text-right text-gray-800">{line.credit ? Number(line.credit).toFixed(2) : ""}</td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>

                         <div className="flex justify-end mb-8">
                            <div className="w-1/2 space-y-2 text-sm">
                               <div className="flex justify-between py-1">
                                  <span className="text-gray-600">Sub Total</span>
                                  <div className="flex gap-8">
                                     <span className="font-medium text-gray-900 w-16 text-right">{Number(selectedJournal.total).toFixed(2)}</span>
                                     <span className="font-medium text-gray-900 w-16 text-right">{Number(selectedJournal.total).toFixed(2)}</span>
                                  </div>
                               </div>
                               <div className="flex justify-between bg-gray-100 py-2 px-3 rounded font-semibold">
                                  <span className="text-gray-900">Total</span>
                                  <div className="flex gap-8">
                                     <span className="text-gray-900 w-16 text-right">₹{Number(selectedJournal.total).toFixed(2)}</span>
                                     <span className="text-gray-900 w-16 text-right">₹{Number(selectedJournal.total).toFixed(2)}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab !== "Overview" && (
                <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                  No data available for {activeTab}.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
        onConfirm={handleDeleteConfirm}
        title="Delete Journal"
        message={
          deleteError ? deleteError : isDeleting ? "Deleting journal, please wait..." : `Are you sure you want to delete journal #${deleteTarget?.journalNumber}? This action cannot be undone.`
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

export default ManualJournalsPage;