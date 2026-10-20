// src/employee/pages/Warnings.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Eye,
  Mail,
  AlertTriangle,
  Paperclip,
} from "lucide-react";
import Pagination from "../components/common/Paginations";
import {
  fetchMyWarnings,
  fetchMyWarningById,
  setCurrentPage,
  clearCurrentWarning,
} from "../store/slices/employeeWarningSlice";

const EmployeeWarnings = () => {
  const dispatch = useDispatch();
  const {
    warnings = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
  } = useSelector((state) => state.employeeWarnings);

  // ── Auth: pull the employee's email from the auth/user slice ──
  // Adjust the selector path if your auth slice differs (e.g. state.auth.user.email)
  const userEmail = useSelector(
    (state) =>
      state.auth?.user?.email ||
      state.auth?.user?.personal_email ||
      state.employeeAuth?.user?.email ||
      "",
  );

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { currentWarning } = useSelector((state) => state.employeeWarnings);

  // Initial + reactive fetch
  useEffect(() => {
    dispatch(
      fetchMyWarnings({
        page: currentPage,
        perPage,
        search: filters.search,
      }),
    );
  }, [dispatch, currentPage, perPage, filters.search]);

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(
          // reuse the same setFilters action from the employee warning slice
          require("../store/slices/employeeWarningSlice").setFilters({
            search: searchInput,
          }),
        );
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const getAttachmentUrl = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}/storage/${path}`;
  };

  const getAttachmentName = (path) => {
    if (!path) return "";
    return String(path).split("/").pop();
  };

  const isEmailSent = (w) => Boolean(w?.email_sent_at) || w?.status === "sent";

  const openDetails = async (w) => {
    dispatch(clearCurrentWarning());
    await dispatch(fetchMyWarningById(w.id));
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    dispatch(clearCurrentWarning());
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ── Open default email client (Outlook / Mail) with recipient prefilled ──
  const handleReplyViaEmail = (w) => {
    const recipient = userEmail || "";
    const subject = encodeURIComponent(
      `Re: ${w.subject || w.title || "Warning"}`,
    );
    const body = encodeURIComponent(
      `\n\n---------- Original Warning ----------\n` +
        `Title: ${w.title || "—"}\n` +
        `Subject: ${w.subject || "—"}\n` +
        `Issued Date: ${formatDate(w.issued_date)}\n\n` +
        `${w.description || ""}`,
    );

    // mailto: opens the OS default mail client (Outlook, Mail, etc.)
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
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
              My Warnings
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              View warnings issued to you
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
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
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[800px] md:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
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
                  ATTACHMENT
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
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {w.title}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[240px] truncate">
                      {w.subject}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(w.issued_date)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      {w.attachment || w.attachment_url ? (
                        <a
                          href={getAttachmentUrl(
                            w.attachment || w.attachment_url,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                          title={getAttachmentName(
                            w.attachment || w.attachment_url,
                          )}
                        >
                          <Paperclip size={12} />
                          <span className="hidden sm:inline">View</span>
                        </a>
                      ) : (
                        <span className="text-[10px] md:text-xs text-gray-400">
                          —
                        </span>
                      )}
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
                        {userEmail && (
                          <button
                            onClick={() => handleReplyViaEmail(w)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-500 transition-colors"
                            title={`Reply via email (${userEmail})`}
                          >
                            <Mail size={14} />
                          </button>
                        )}
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
                    {loading
                      ? "Loading warnings..."
                      : "No warnings found"}
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
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    {currentWarning.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {currentWarning.subject || "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isEmailSent(currentWarning)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {isEmailSent(currentWarning)
                        ? "Email Sent"
                        : "Email Pending"}
                    </span>
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
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
                    {isEmailSent(currentWarning)
                      ? `Sent on ${formatDate(
                          currentWarning.email_sent_at ||
                            currentWarning.updated_at,
                        )}`
                      : "Not sent yet"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-5" />

              <div className="mb-5">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Subject
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                  {currentWarning.subject || "—"}
                </p>
              </div>

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

              {(currentWarning.attachment ||
                currentWarning.attachment_url) && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Attachment
                    </p>
                    <a
                      href={getAttachmentUrl(
                        currentWarning.attachment ||
                          currentWarning.attachment_url,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-amber-400 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <Paperclip className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-amber-600">
                            {getAttachmentName(
                              currentWarning.attachment ||
                                currentWarning.attachment_url,
                            )}
                          </p>
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            View attachment →
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeDetails}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Close
              </button>
              {userEmail && (
                <button
                  onClick={() => handleReplyViaEmail(currentWarning)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  title={`Open email client (${userEmail})`}
                >
                  <Mail size={14} />
                  Reply via Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWarnings;