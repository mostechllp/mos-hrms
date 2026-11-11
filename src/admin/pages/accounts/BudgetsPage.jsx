import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteBudget } from "../../store/slices/accounts/budgetsSlice";
import { Plus, Eye, Edit2, Trash2, Target, Search } from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}
  >
    {children}
  </div>
);

/* ---------- page ---------- */

const BudgetsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const budgets = useSelector((state) => state.budgets.budgets);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = budgets.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.fiscalYear?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Accountant
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Budgets
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {budgets.length === 0
                ? "No budgets created yet"
                : `${budgets.length} ${budgets.length === 1 ? "budget" : "budgets"}`}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/accountant/budgets/new")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <Plus size={13} /> New budget
          </button>
        </header>

        {/* ---- Empty / Table ---- */}
        {budgets.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Target size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Budget your business finances
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Create budgets for the various activities of your business,
                compare them with actuals, and see how it's performing.
              </p>
              <button
                onClick={() => navigate("/admin/accounts/accountant/budgets/new")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus size={13} /> Create budget
              </button>
            </div>

            <div className="mt-12 max-w-md mx-auto space-y-2">
              {[
                "Forecast income and expenses per period",
                "Compare budgeted vs. actuals at any time",
                "Include balance-sheet accounts if needed",
              ].map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300"
                >
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </Surface>
        ) : (
          <Surface className="overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                All budgets
              </span>
              <div className="relative ml-auto w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search budgets…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 sm:px-5 py-2.5 text-left font-medium">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium">Fiscal year</th>
                    <th className="px-4 py-2.5 text-left font-medium">Budget period</th>
                    <th className="px-4 py-2.5 text-right font-medium w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-[13px] text-slate-500"
                      >
                        No budgets match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filtered.map((budget) => (
                      <tr
                        key={budget.id}
                        className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        onClick={() =>
                          navigate(`/admin/accounts/accountant/budgets/${budget.id}`)
                        }
                      >
                        <td className="px-4 sm:px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {budget.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {budget.fiscalYear}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {budget.period}
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                navigate(`/admin/accounts/accountant/budgets/${budget.id}`)
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                              title="View"
                              aria-label="View"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/accounts/accountant/budgets/edit/${budget.id}`
                                )
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(budget)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete budget"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting budget, please wait..."
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BudgetsPage;