import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteExpense } from "../../store/slices/accounts/expensesSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Printer, Play, ArrowRight, RefreshCw, UploadCloud, CloudUpload
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const ExpensesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const expenses = useSelector((state) => state.expenses.expenses);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPdfView, setShowPdfView] = useState(false);

  const filteredExpenses = expenses.filter(
    (e) =>
      e.expenseAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteExpense(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedExpense?.id === deleteTarget.id) {
        setSelectedExpense(null); 
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <button className="text-gray-500 font-medium pb-2 border-b-2 border-transparent hover:text-gray-800">Receipts Inbox</button>
          <button className="text-gray-800 font-medium pb-2 border-b-2 border-blue-500 flex items-center gap-1">All Expenses <ChevronDown size={16} /></button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/purchases/expenses/new")} 
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

      {expenses.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          

          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Time To Manage Your Expenses!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl text-center">
            Create and manage expenses that are part of your organization's operating costs.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/purchases/expenses/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Record Expense
            </Button>
            <button className="text-blue-500 text-sm font-medium hover:underline">Import Expenses</button>
          </div>

          {/* Life Cycle Section */}
          <div className="mt-24 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-16">Life cycle of an Expense</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative">
                
                {/* Step 1 */}
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-md px-4 py-2 flex items-center gap-2 text-blue-600 w-40 shadow-sm">
                    <FileText size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">EXPENSE<br/>INCURRED</span>
                </div>
                
                {/* Connector */}
                <div className="hidden md:block w-12 border-t-2 border-dashed border-gray-300 relative">
                    <ArrowRight size={12} className="absolute -right-1 -top-1.5 text-gray-300" />
                </div>

                {/* Step 2 */}
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-md px-4 py-2 flex items-center gap-2 text-blue-600 w-40 shadow-sm">
                    <RefreshCw size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">RECORD<br/>EXPENSE</span>
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
                            <FileText size={16} />
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
              <h4 className="text-xl text-gray-800 dark:text-gray-200 mb-6 font-medium">In the Expenses module, you can:</h4>
              <div className="space-y-4 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Record a single expense or record expenses in bulk.</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Set mileage rates and record expenses based on the distance travelled.</p>
                <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500"/> Convert an expense into an invoice to get it reimbursed.</p>
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
                placeholder="Search expenses..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Expense Account <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Paid Through</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => { setSelectedExpense(expense); setShowPdfView(false); }} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 group-hover:underline">
                      {expense.expenseAccount}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{expense.date}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{expense.vendor || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{expense.paidThrough}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedExpense(expense); setShowPdfView(false); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/expenses/edit/${expense.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(expense)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedExpense && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedExpense(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Expense Details
              </h2>
              <button onClick={() => setSelectedExpense(null)} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Edit2 size={14} className="mr-1"/> Edit
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <RefreshCw size={14} className="mr-1"/> Make Recurring
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Printer size={14} className="mr-1"/> PDF/Print
                    </Button>
              </div>

              {/* Top Section */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="flex-1 space-y-6">
                      <div>
                          <p className="text-sm text-gray-500 mb-1">Expense Amount</p>
                          <p className="text-2xl font-medium text-red-500 mb-1">₹{selectedExpense.amount.toFixed(2)} <span className="text-xs text-gray-400 font-normal ml-2">on {selectedExpense.date}</span></p>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded uppercase tracking-wider">Non-Billable</span>
                      </div>
                      
                      <div className="inline-block px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded">
                          {selectedExpense.expenseAccount}
                      </div>

                      <div>
                          <p className="text-xs text-gray-500 mb-1">Paid Through</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedExpense.paidThrough}</p>
                      </div>
                  </div>
                  
                  {/* Receipt Upload Box */}
                  <div className="w-full md:w-64 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/20 h-64">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm">
                          <CloudUpload size={24} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Drag or Drop your Receipts</p>
                      <p className="text-xs text-gray-500 mb-4">Maximum file size allowed is 10MB</p>
                      <Button variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-xs h-8 border-none w-full justify-center">
                          <UploadCloud size={14} className="mr-1"/> Upload your Files <ChevronDown size={14} className="ml-2"/>
                      </Button>
                  </div>
              </div>

              {/* Show PDF Toggle */}
              <div className="flex justify-end items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600 font-medium">Show PDF View</span>
                  <button 
                      onClick={() => setShowPdfView(!showPdfView)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${showPdfView ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                      <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showPdfView ? 'translate-x-5' : ''}`}></span>
                  </button>
              </div>

              {/* PDF View Section */}
              {showPdfView && (
                  <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative mb-8">
                      {/* Non-Billable Watermark */}
                      <div className="absolute top-0 left-0 bg-blue-600 text-white px-6 py-2 text-xs font-bold -rotate-45 transform -translate-x-12 translate-y-6 shadow-sm z-10">
                          Non-Billable
                      </div>
                      
                      <div className="mb-12">
                          <p className="font-bold text-gray-800 mb-1 text-sm">Fidha</p>
                          <p className="text-gray-600 text-xs">Keralam</p>
                          <p className="text-gray-600 text-xs">India</p>
                          <p className="text-gray-600 text-xs">fidh3549@gmail.com</p>
                      </div>

                      <div className="text-center mb-12">
                          <h1 className="text-3xl font-serif text-gray-800 tracking-wide">EXPENSE</h1>
                      </div>

                      <div className="flex justify-between items-start mb-12">
                          <div className="space-y-4 text-xs flex-1">
                              <div className="flex">
                                  <span className="text-gray-500 w-32">Expense Date</span>
                                  <span className="text-gray-900 font-bold">{selectedExpense.date}</span>
                              </div>
                              <div className="flex">
                                  <span className="text-gray-500 w-32">Expense Account</span>
                                  <span className="text-gray-900 font-bold">{selectedExpense.expenseAccount}</span>
                              </div>
                              <div className="flex">
                                  <span className="text-gray-500 w-32">Currency Code</span>
                                  <span className="text-gray-900 font-bold">INR</span>
                              </div>
                              <div className="flex">
                                  <span className="text-gray-500 w-32">Paid Through</span>
                                  <span className="text-gray-900 font-bold">{selectedExpense.paidThrough}</span>
                              </div>
                          </div>

                          <div className="bg-green-600 text-white p-4 text-center rounded-sm w-40 h-24 flex flex-col justify-center shadow-sm">
                              <p className="text-xs uppercase tracking-wider opacity-90 mb-1">Expense Amount</p>
                              <p className="text-2xl font-medium">₹{selectedExpense.amount.toFixed(2)}</p>
                          </div>
                      </div>

                      <div className="mt-16 text-right text-xs text-gray-500">
                          <p className="mb-8">Authorized Signature</p>
                          <div className="w-48 border-b border-gray-400 ml-auto"></div>
                      </div>
                  </div>
              )}

              {/* Journal Section */}
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b-2 border-blue-500 pb-2 mb-4 inline-block">Journal</h3>
                <p className="text-xs text-gray-500 mb-4">Amount is displayed in your base currency <span className="bg-green-600 text-white px-1.5 py-0.5 rounded ml-1 font-bold">INR</span></p>
                
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Expense</h4>
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-2 font-medium">Account</th>
                            <th className="px-4 py-2 font-medium text-right">Debit</th>
                            <th className="px-4 py-2 font-medium text-right">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{selectedExpense.paidThrough}</td>
                            <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">0.00</td>
                            <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">{selectedExpense.amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{selectedExpense.expenseAccount}</td>
                            <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">{selectedExpense.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">0.00</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-600">{selectedExpense.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-600">{selectedExpense.amount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense of "${deleteTarget?.amount}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ExpensesPage;