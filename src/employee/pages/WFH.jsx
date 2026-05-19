import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWFHRequests,
  setWFHFilter,
  setWFHPagination,
  clearWFHError,
} from "../store/slices/wfhSlice";
import showToast from "../components/common/Toast";
import {
  FiSearch,
  FiPlus,
  FiHome,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from "react-icons/fi";
import StatusBadge from "../components/common/StatusBadge";
import WFHModal from "../components/WFH/WFHModal";

const WFH = () => {
  const dispatch = useDispatch();
  const wfhState = useSelector((state) => state.wfh);
  
  // Add safety defaults
  const wfhRequests = wfhState?.wfhRequests || [];
  const filter = wfhState?.filter || { status: 'all', search: '' };
  const pagination = wfhState?.pagination || { currentPage: 1, perPage: 10 };
  const loading = wfhState?.loading || false;
  const error = wfhState?.error || null;
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch WFH requests on component mount
  useEffect(() => {
    dispatch(fetchWFHRequests());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearWFHError());
    }
  }, [error, dispatch]);

  // Filter requests using useMemo to prevent infinite loops
  const filteredRequests = useMemo(() => {
    let filtered = [...wfhRequests];

    if (filter.status && filter.status !== "all") {
      filtered = filtered.filter(
        (r) => r.status?.toLowerCase() === filter.status.toLowerCase()
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.reason || "").toLowerCase().includes(searchLower) ||
          (r.notes || "").toLowerCase().includes(searchLower) ||
          (r.status || "").toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [wfhRequests, filter.status, filter.search]);

  // Safety check for pagination
  const perPage = pagination?.perPage || 10;
  const currentPage = pagination?.currentPage || 1;
  
  const totalPages = Math.ceil(filteredRequests.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentRequests = filteredRequests.slice(start, start + perPage);

  // Calculate stats from API data
  const stats = useMemo(() => ({
    total: wfhRequests.length,
    pending: wfhRequests.filter((r) => r.status?.toLowerCase() === "pending").length,
    approved: wfhRequests.filter((r) => r.status?.toLowerCase() === "approved").length,
    rejected: wfhRequests.filter((r) => r.status?.toLowerCase() === "rejected").length,
  }), [wfhRequests]);

  const handleStatusFilter = (status) => {
    dispatch(
      setWFHFilter({
        status: status === "all" ? "all" : status.toLowerCase(),
        search: filter.search || '',
      })
    );
  };

  const handleSearch = (e) => {
    dispatch(setWFHFilter({ status: filter.status || 'all', search: e.target.value }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(
        setWFHPagination({ currentPage: page, perPage: perPage })
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEntriesChange = (e) => {
    dispatch(
      setWFHPagination({ currentPage: 1, perPage: parseInt(e.target.value) })
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "-", error;
    }
  };

  if (loading && wfhRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading WFH requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-7">
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl md:text-2xl">
              <FiHome />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-green-600">
            {stats.total}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">
            Total WFH Requests
          </div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl md:text-2xl">
              <FiFileText />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-amber-500">
            {stats.pending}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">Pending</div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl md:text-2xl">
              <FiFileText />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-green-600">
            {stats.approved}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">Approved</div>
        </div>
        <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          <div className="stat-header flex justify-between items-center mb-3">
            <div className="stat-icon w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl md:text-2xl">
              <FiFileText />
            </div>
          </div>
          <div className="stat-number text-2xl md:text-3xl font-extrabold text-red-500">
            {stats.rejected}
          </div>
          <div className="stat-label text-xs text-[var(--muted)]">Rejected</div>
        </div>
      </div>

      <div className="wfh-header flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-7">
        <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent dark:from-gray-200 dark:to-green-400">
          Work From Home Requests
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="request-btn bg-green-500 text-white py-2.5 px-6 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-green-600 hover:-translate-y-0.5 transition-all"
        >
          <FiPlus /> New Request
        </button>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs flex flex-wrap gap-2.5 mb-6 pb-3 border-b border-[var(--border)]">
        {["all", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              (filter.status === status.toLowerCase()) ||
              (status === "all" && filter.status === "all")
                ? "bg-green-500 text-white"
                : "bg-[var(--surface2)] text-[var(--text-secondary)] hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30"
            }`}
          >
            {status === "all" ? "All Requests" : status}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="files-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="entries-select flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 text-xs text-[var(--muted)]">
          <span>Show entries</span>
          <select
            value={perPage}
            onChange={handleEntriesChange}
            className="border-none outline-none bg-transparent font-semibold text-[var(--text)] cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="search-wrapper flex items-center gap-3 flex-wrap">
          <div className="search-box flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-2">
            <FiSearch className="text-[var(--muted)] text-xs" />
            <input
              type="text"
              value={filter.search || ''}
              onChange={handleSearch}
              placeholder="Search records..."
              className="border-none outline-none bg-transparent text-xs text-[var(--text)] placeholder:text-[var(--muted)] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="wfh-table-wrapper bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
        <table className="wfh-table w-full border-collapse text-xs min-w-[800px]">
          <thead>
            <tr className="bg-[var(--surface2)] border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">#</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">Reason</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">Notes</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-[var(--muted)]">
                  No WFH requests found
                </td>
              </tr>
            ) : (
              currentRequests.map((request, idx) => (
                <tr key={request.id || idx} className="hover:bg-[var(--surface2)] transition-colors border-b border-[var(--border)]">
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">{start + idx + 1}</td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text)]">
                    {formatDate(request.date)}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    {request.reason}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate" title={request.notes}>
                    {request.notes || "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="pagination-container flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
          <div className="text-xs text-[var(--muted)]">
            Showing {start + 1} to{" "}
            {Math.min(start + perPage, filteredRequests.length)} of{" "}
            {filteredRequests.length} entries
          </div>
          <div className="page-buttons flex gap-1.5 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)] hover:bg-[var(--surface2)] transition-colors"
            >
              <FiChevronLeft className="mx-auto" />
            </button>
            {[...Array(Math.min(totalPages, 10))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg border text-xs transition-all ${
                    currentPage === pageNum
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)] hover:bg-[var(--surface2)] transition-colors"
            >
              <FiChevronRight className="mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* WFH Modal */}
      <WFHModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default WFH;