// src/admin/pages/Warnings.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { showToast } from "../../components/common/Toast";
import Pagination from "../components/common/Paginations";
import ConfirmModal from "../components/common/ConfirmModal";
import WarningModal from "../components/common/WarningModal";
import {
  fetchWarnings,
  fetchWarningById,
  deleteWarning,
  sendWarningEmail,
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentWarning,
} from "../store/slices/warningSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";

const Warnings = () => {
  const dispatch = useDispatch();
  const {
    warnings = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
    sendingEmailId,
    submitting,
  } = useSelector((state) => state.warnings);

  const { employees = [] } = useSelector(
    (state) => state.employees || { employees: [] },
  );

  // Local UI state
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [employeeFilter, setEmployeeFilter] = useState(
    filters.employeeId || "",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarning, setEditingWarning] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [pendingEmailWarning, setPendingEmailWarning] = useState(null);

  const { currentWarning } = useSelector((state) => state.warnings);

  // Initial + reactive fetch
  useEffect(() => {
    dispatch(
      fetchWarnings({
        page: currentPage,
        perPage,
        search: filters.search,
        employeeId: filters.employeeId,
      }),
    );
  }, [dispatch, currentPage, perPage, filters.search, filters.employeeId]);

  // Load employees once (for filter + create modal)
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Get employee display name from the nested employee object
  const getEmployeeName = (w) => {
    const emp = w.employee;
    if (!emp) return w.employee_name || `#${w.employee_id}`;
    const full = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
    return full || emp.user?.username || `#${w.employee_id}`;
  };

  // Get employee avatar URL
  const getEmployeeAvatar = (w) => {
    const avatar = w.employee?.avatar;
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}/storage/${avatar}`;
  };

  const isEmailSent = (w) => Boolean(w?.email_sent_at) || w?.status === "sent";

  const handleEmployeeFilterChange = (e) => {
    const val = e.target.value;
    setEmployeeFilter(val);
    dispatch(setFilters({ employeeId: val || null }));
  };

  // Triggered by the mail icon / modal button — opens confirmation
  const handleSendEmailClick = (w) => {
    closeDetails();
    setPendingEmailWarning(w);
    setConfirmEmailOpen(true);
  };

  // Actually fires the send after user confirms
  const handleConfirmSendEmail = async () => {
    if (!pendingEmailWarning) return;
    try {
      await dispatch(sendWarningEmail(pendingEmailWarning.id)).unwrap();
      showToast("Warning email sent successfully", "success");
      setConfirmEmailOpen(false);
      setPendingEmailWarning(null);
    } catch (error) {
      showToast(error || "Failed to send warning email", "error");
      // Keep the modal open so the user can retry
    }
  };

  const openCreate = () => {
    setEditingWarning(null);
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setEditingWarning(w);
    setModalOpen(true);
  };

  const openDetails = async (w) => {
    dispatch(clearCurrentWarning());
    await dispatch(fetchWarningById(w.id));
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    dispatch(clearCurrentWarning());
  };

  const handleDeleteClick = (w) => {
    setPendingDelete(w);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteWarning(pendingDelete.id)).unwrap();
      showToast("Warning deleted successfully", "success");
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (error) {
      showToast(error || "Failed to delete warning", "error");
    }
  };

  const handleSendEmail = async (w) => {
    try {
      await dispatch(sendWarningEmail(w.id)).unwrap();
      showToast("Warning email sent successfully", "success");
    } catch (error) {
      showToast(error || "Failed to send warning email", "error");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
              Warnings
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Issue and manage employee warnings
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          <Plus size={16} /> New Warning
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or subject..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <select
          value={employeeFilter}
          onChange={handleEmployeeFilterChange}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[800px] md:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  EMPLOYEE
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  TITLE
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  SUBJECT
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  ISSUED
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  EMAIL
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && warnings.length > 0 ? (
                warnings.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => openDetails(w)}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        {getEmployeeAvatar(w) ? (
                          <img
                            src={getEmployeeAvatar(w)}
                            alt={getEmployeeName(w)}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fb =
                                e.target.parentElement.querySelector(
                                  ".avatar-fallback",
                                );
                              if (fb) fb.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="avatar-fallback w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs md:text-sm font-semibold flex-shrink-0"
                          style={{
                            display: getEmployeeAvatar(w) ? "none" : "flex",
                          }}
                        >
                          {(getEmployeeName(w) || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {getEmployeeName(w)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {w.title}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[240px] truncate">
                      {w.subject}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(w.issued_date)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
                          isEmailSent(w)
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {isEmailSent(w) ? "Sent" : "Not sent"}
                      </span>
                    </td>
                    <td
                      className="px-3 md:px-4 py-2 md:py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => openDetails(w)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(w)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleSendEmailClick(w)}
                          disabled={sendingEmailId === w.id}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-500 transition-colors disabled:opacity-50"
                          title={isEmailSent(w) ? "Resend email" : "Send email"}
                        >
                          <Mail
                            size={14}
                            className={
                              sendingEmailId === w.id ? "animate-pulse" : ""
                            }
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(w)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "Loading warnings..." : "No warnings found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => dispatch(setCurrentPage(p))}
          totalItems={totalCount}
          itemsPerPage={perPage}
        />
      )}

      {/* Create / Edit modal */}
      <WarningModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingWarning(null);
        }}
        warning={editingWarning}
        employees={employees}
      />

      {/* Details modal (read-only) */}
      {detailsOpen && currentWarning && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={closeDetails}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---------- Header ---------- */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {getEmployeeAvatar(currentWarning) ? (
                      <img
                        src={getEmployeeAvatar(currentWarning)}
                        alt={getEmployeeName(currentWarning)}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fb = e.target.parentElement.querySelector(
                            ".modal-avatar-fallback",
                          );
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="modal-avatar-fallback w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-md"
                      style={{
                        display: getEmployeeAvatar(currentWarning)
                          ? "none"
                          : "flex",
                      }}
                    >
                      {(getEmployeeName(currentWarning) || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  </div>

                  {/* Name + subject */}
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                      {getEmployeeName(currentWarning)}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {currentWarning.subject || "—"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {currentWarning.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          currentWarning.status === "sent"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {currentWarning.status === "sent"
                          ? "Email Sent"
                          : "Email Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeDetails}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ---------- Body ---------- */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* Top row: metadata (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Issued Date
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-semibold">
                    {formatDate(currentWarning.issued_date)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Email Status
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-semibold">
                    {currentWarning.email_sent_at ||
                    currentWarning.status === "sent"
                      ? `Sent on ${formatDate(
                          currentWarning.email_sent_at ||
                            currentWarning.updated_at,
                        )}`
                      : "Not sent yet"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-5" />

              {/* Subject (full width) */}
              <div className="mb-5">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Subject
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                  {currentWarning.subject || "—"}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Description
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {currentWarning.description || "—"}
                  </p>
                </div>
              </div>

              {/* Optional: issued by */}
              {currentWarning.creator && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Issued By
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                      {currentWarning.creator.username ||
                        currentWarning.creator.email ||
                        "—"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ---------- Footer ---------- */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeDetails}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => handleSendEmailClick(currentWarning)}
                disabled={sendingEmailId === currentWarning.id}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Mail size={14} />
                {isEmailSent(currentWarning) ? "Resend Email" : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Warning"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitting}
        variant="danger"
      />
      {/* Send email confirmation */}
      <ConfirmModal
        isOpen={confirmEmailOpen}
        onClose={() => {
          setConfirmEmailOpen(false);
          setPendingEmailWarning(null);
        }}
        onConfirm={handleConfirmSendEmail}
        title={
          isEmailSent(pendingEmailWarning)
            ? "Resend Warning Email"
            : "Send Warning Email"
        }
        message={
          pendingEmailWarning
            ? isEmailSent(pendingEmailWarning)
              ? `Are you sure you want to resend the warning "${pendingEmailWarning.title}" to ${getEmployeeName(pendingEmailWarning)}? The previous email was already sent.`
              : `Are you sure you want to send the warning "${pendingEmailWarning.title}" to ${getEmployeeName(pendingEmailWarning)}?`
            : ""
        }
        confirmText={isEmailSent(pendingEmailWarning) ? "Resend" : "Send"}
        loading={sendingEmailId === pendingEmailWarning?.id}
        variant="success"
      />
    </div>
  );
};

export default Warnings;
