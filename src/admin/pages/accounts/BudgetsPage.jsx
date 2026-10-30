import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteBudget } from "../../store/slices/accounts/budgetsSlice";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const BudgetsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const budgets = useSelector((state) => state.budgets.budgets);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteBudget(idToDelete)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete budget.");
    }
  };

  return (
    <div className="bg-white min-h-screen relative flex flex-col font-sans">
      
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-lg font-medium text-gray-800">Budgets</h1>
        <button 
          onClick={() => navigate("/admin/accounts/accountant/budgets/new")} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1 rounded"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* Empty State */}
      {budgets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center pt-32 px-6">
          <h2 className="text-2xl font-normal text-gray-800 mb-2 text-center">
            Budget your business finance. Stay on top of your expenses.
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-2xl text-center">
            Create budgets for the various activities of your business, compare them with the actuals, and see how your business is performing.
          </p>
          
          <button 
            onClick={() => navigate("/admin/accounts/accountant/budgets/new")} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 rounded font-medium text-sm transition-colors uppercase tracking-wide"
          >
            CREATE BUDGET
          </button>
        </div>
      ) : (
        /* List Table */
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">NAME</th>
                <th className="px-4 py-3">FISCAL YEAR</th>
                <th className="px-4 py-3">BUDGET PERIOD</th>
                <th className="px-4 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map((budget) => (
                <tr 
                  key={budget.id} 
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/admin/accounts/accountant/budgets/${budget.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-blue-600 group-hover:underline">{budget.name}</td>
                  <td className="px-4 py-4 text-gray-800">{budget.fiscalYear}</td>
                  <td className="px-4 py-4 text-gray-800">{budget.period}</td>
                  <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/admin/accounts/accountant/budgets/${budget.id}`)} 
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/accounts/accountant/budgets/edit/${budget.id}`)} 
                        className="p-1.5 text-gray-500 hover:text-green-600 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(budget)} 
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={
          deleteError 
            ? deleteError 
            : isDeleting 
              ? "Deleting budget, please wait..." 
              : `Are you sure you want to delete the budget "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BudgetsPage;