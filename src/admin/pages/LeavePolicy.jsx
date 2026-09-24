import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "@admin/components/common/SearchBar";
import EntriesSelector from "@admin/components/common/EntriesSelector";
import Pagination from "@admin/components/common/Paginations";
import ConfirmModal from "@admin/components/common/ConfirmModal";
import { showToast } from "../components/common/Toast";
import LeavePolicyModal from "../components/leaves/LeavePolicyModal";
import {
  fetchLeavePolicies,
  deleteLeavePolicy,
  clearPolicyError,
} from "@admin/store/slices/leavePolicySlice";

const LeavePolicies = () => {
  const dispatch = useDispatch();
  const { policies = [], loading, deleting, error } = useSelector(
    (state) => state.leavePolicies || {},
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [modal, setModal] = useState({ isOpen: false, policy: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, policy: null });

  useEffect(() => {
    dispatch(fetchLeavePolicies());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearPolicyError());
    }
  }, [error, dispatch]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return policies;
    return policies.filter((p) =>
      (p.leave_type_name || "").toLowerCase().includes(s),
    );
  }, [policies, searchTerm]);

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const pageRows = filtered.slice(start, start + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, perPage]);

  const openCreate = () => setModal({ isOpen: true, policy: null });
  const openEdit = (policy) => setModal({ isOpen: true, policy });
  const closeModal = () => setModal({ isOpen: false, policy: null });

  const confirmDelete = async () => {
    const p = deleteModal.policy;
    if (!p) return;
    const res = await dispatch(deleteLeavePolicy(p.id));
    if (deleteLeavePolicy.fulfilled.match(res)) {
      showToast("Leave policy deleted", "success");
      setDeleteModal({ isOpen: false, policy: null });
    } else {
      showToast(res.payload || "Failed to delete", "error");
    }
  };

  // ─── Label helpers for the table ───
  const accrualLabel = (v) =>
    ({
      monthly: "Monthly",
      quarterly: "Quarterly",
      half_yearly: "Half Yearly",
      yearly: "Yearly",
      daily: "Daily",
    })[v] || "—";

  const probationLabel = (v) =>
    ({
      hold: "Hold",
      accrue: "Accrue",
      accrue_and_restrict_usage: "Accrue & Restrict Usage",
    })[v] || "—";

  return (
    <div className="w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to="/admin/leaves"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Leaves
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">
          Leave Policies
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Leave Policies
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure accrual, probation, and carry-forward rules per leave type.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <i className="fas fa-plus"></i>
            Create Policy
          </button>
          <Link
            to="/admin/leaves/allocations"
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Allocations
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
        <EntriesSelector value={perPage} onChange={setPerPage} />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by leave type..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[900px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-12">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Leave Type
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Annual
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Accrual
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Probation
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Carry Forward
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center">
                    <i className="fas fa-spinner fa-spin text-green-500 text-xl"></i>
                  </td>
                </tr>
              ) : pageRows.length > 0 ? (
                pageRows.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {start + idx + 1}
                    </td>
                    <td className="px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {p.leave_type_name}
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                      {p.annual_allocation}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400">
                      {p.enable_accrual ? (
                        <>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {accrualLabel(p.accrual_type)}
                          </div>
                          <div>{p.accrual_days} days</div>
                        </>
                      ) : (
                        <span className="text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400">
                      {p.apply_during_probation ? (
                        <>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {probationLabel(p.probation_action)}
                          </div>
                          <div>
                            {p.release_after_probation
                              ? "Release after"
                              : "No release"}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400">
                      {p.enable_carry_forward ? (
                        p.unlimited_carry_forward ? (
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            Unlimited
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Max {p.maximum_carry_forward} days
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status
                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {p.status ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
                          title="Edit"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ isOpen: true, policy: p })
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                          title="Delete"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    <i className="fas fa-shield-halved text-2xl mb-2 block text-gray-300"></i>
                    No leave policies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalFiltered > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalFiltered}
          itemsPerPage={perPage}
        />
      )}

      {/* Modals */}
      <LeavePolicyModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        editingPolicy={modal.policy}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          !deleting && setDeleteModal({ isOpen: false, policy: null })
        }
        onConfirm={confirmDelete}
        title="Delete Leave Policy"
        message={`Are you sure you want to delete the policy for "${deleteModal.policy?.leave_type_name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default LeavePolicies;