import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAdjustment, deleteAdjustment } from "../../store/slices/accounts/currencyAdjustmentsSlice";
import { 
  Plus, MoreHorizontal, ChevronDown, X, Search, Filter, 
  Trash2, UserPlus
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white";

const CurrencyAdjustmentsPage = () => {
  const dispatch = useDispatch();
  const adjustments = useSelector((state) => state.currencyAdjustments.adjustments);
  const isLoading = useSelector((state) => state.currencyAdjustments.loading);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    currency: "AED- UAE Dirham",
    date: new Date().toISOString().split('T')[0],
    exchangeRate: "25.870544",
    notes: ""
  });

  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currency || !formData.exchangeRate || !formData.notes) return;

    await dispatch(addAdjustment(formData)).unwrap();
    setIsModalOpen(false);
    
    // Reset form
    setFormData({
      currency: "AED- UAE Dirham",
      date: new Date().toISOString().split('T')[0],
      exchangeRate: "25.870544",
      notes: ""
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAdjustment(deleteTarget.id)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col font-sans">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800">Base Currency Adjustments</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            <UserPlus size={16} /> Find Accountants
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1 rounded">
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
           <button className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded flex items-center gap-1 hover:bg-gray-50">
              Filter By: This Month <ChevronDown size={14}/>
           </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {adjustments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
           <p className="text-gray-500 text-sm">
              Record a Base Currency Adjustment to correct fluctuations in exchange rates
           </p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></th>
                <th className="px-4 py-3 cursor-pointer hover:text-gray-700 flex items-center gap-1">DATE <ChevronDown size={12}/></th>
                <th className="px-4 py-3">CURRENCY</th>
                <th className="px-4 py-3">EXCHANGE RATE</th>
                <th className="px-4 py-3 text-right">GAIN OR LOSS</th>
                <th className="px-4 py-3">NOTES</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                  <td className="px-4 py-4 text-gray-800">{adj.date}</td>
                  <td className="px-4 py-4 text-gray-800 font-medium">{adj.currency}</td>
                  <td className="px-4 py-4 text-gray-600">{adj.exchangeRate}</td>
                  <td className={`px-4 py-4 text-right font-medium ${adj.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adj.gainLoss >= 0 ? '+' : ''}{Number(adj.gainLoss).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-gray-500 max-w-xs truncate">{adj.notes}</td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(adj); }} 
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NEW ADJUSTMENT MODAL (Image 2) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-start pt-16 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-fade-in border border-gray-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-normal text-gray-800">Base Currency Adjustment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-sm text-red-500 font-medium">Currency*</label>
                <select 
                  className={inputCls}
                  value={formData.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                >
                  <option value="AED- UAE Dirham">AED- UAE Dirham</option>
                  <option value="USD- US Dollar">USD- US Dollar</option>
                  <option value="EUR- Euro">EUR- Euro</option>
                  <option value="GBP- British Pound">GBP- British Pound</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm text-red-500 font-medium">Date of Adjustment*</label>
                <input 
                  type="date" 
                  className={inputCls}
                  value={formData.date}
                  onChange={(e) => setField("date", e.target.value)}
                />
              </div>

              {/* Exchange Rate */}
              <div className="space-y-1.5">
                <label className="text-sm text-red-500 font-medium">Exchange Rate*</label>
                <div className="flex">
                  <span className="border border-r-0 border-gray-300 bg-gray-50 rounded-l-md px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                    1 {formData.currency.split("-")[0].trim()} =
                  </span>
                  <input 
                    type="number" 
                    step="0.000001"
                    className={`${inputCls} rounded-none border-x-0`}
                    value={formData.exchangeRate}
                    onChange={(e) => setField("exchangeRate", e.target.value)}
                  />
                  <span className="border border-l-0 border-gray-300 bg-gray-50 rounded-r-md px-3 py-2 text-sm text-gray-600">
                    INR
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm text-red-500 font-medium">Notes*</label>
                <textarea 
                  className={`${inputCls} resize-none h-24`}
                  placeholder="Max. 500 characters"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="submit" 
                  disabled={isLoading || !formData.notes} 
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Continue"}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Adjustment"
        message={`Are you sure you want to delete this currency adjustment? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

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

export default CurrencyAdjustmentsPage;