// src/admin/pages/CRM/Proposals.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {createPortal} from "react-dom"
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ProposalModal from "../../components/crm/ProposalModal";
import {
  fetchProposals,
  fetchProposalFormOptions,
  createProposal,
  updateProposal,
  deleteProposalApi,
  updateProposalStatusApi,
  fromProposalApi,
  setCurrentPage,
  setFilters,
  resetFilters,
} from "../../store/slices/proposalSlice";
import { Plus, Search, Pencil, Trash2, FileText, Link as LinkIcon, ExternalLink, Loader, Check } from "lucide-react";

// ── Status pill colors ──
const STATUS_STYLES = {
  Preparing:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Approved:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Reject: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_DOT = {
  Preparing: "#9ca3af",
  Pending: "#f59e0b",
  Sent: "#3b82f6",
  Approved: "#10b981",
  Reject: "#ef4444",
};

const Proposals = () => {
  const dispatch = useDispatch();

  const {
    proposals = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
    options,
    submitting,
  } = useSelector((s) => s.proposals);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // ── load form options once on mount ──
useEffect(() => {
  dispatch(fetchProposalFormOptions());
}, [dispatch]);

  // ── list fetch on filter/page change ──
  useEffect(() => {
    dispatch(
      fetchProposals({
        page: currentPage,
        perPage,
        search: filters.search,
        status: filters.status,
        from_date: filters.from_date,
        to_date: filters.to_date,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      }),
    );
  }, [dispatch, currentPage, perPage, filters]);

  // ── debounced search ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const refetchList = () =>
    dispatch(
      fetchProposals({
        page: currentPage,
        perPage,
        search: filters.search,
        status: filters.status,
        from_date: filters.from_date,
        to_date: filters.to_date,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      }),
    );

  const normalized = useMemo(
    () => (proposals || []).map((p) => fromProposalApi(p)),
    [proposals],
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const statuses = options.statuses || [];

  // ── CRUD ──
  const openCreate = async () => {
  setEditing(null);
  // refresh options so next_serial_no + statuses are current
  try {
    await dispatch(fetchProposalFormOptions()).unwrap();
  } catch {
    /* non-fatal — modal falls back to slice defaults */
  }
  setModalOpen(true);
};

  const openEdit = async (p) => {
  setEditing(p);
  try {
    await dispatch(fetchProposalFormOptions()).unwrap();
  } catch {
    /* non-fatal */
  }
  setModalOpen(true);
};

const handleQuickStatusChange = async (proposal, newStatus) => {
  if (!proposal?.id || newStatus === proposal.status) return;
  setStatusUpdatingId(proposal.id);
  try {
    await dispatch(
      updateProposalStatusApi({ id: proposal.id, status: newStatus }),
    ).unwrap();
    showToast(`Status changed to ${newStatus}`, "success");
    // Slice already mutates state; no need to refetch
  } catch (err) {
    showToast(err || "Failed to update status", "error");
  } finally {
    setStatusUpdatingId(null);
  }
};

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await dispatch(
          updateProposal({ id: editing.id, data }),
        ).unwrap();
        showToast("Proposal updated successfully", "success");
      } else {
        await dispatch(createProposal(data)).unwrap();
        showToast("Proposal created successfully", "success");
      }
      setModalOpen(false);
      setEditing(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to save proposal", "error");
    }
  };

  const handleDeleteClick = (p) => {
    setPendingDelete(p);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteProposalApi(pendingDelete.id)).unwrap();
      showToast("Proposal deleted successfully", "success");
      setConfirmOpen(false);
      setPendingDelete(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to delete proposal", "error");
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

  const handleStatusFilterChange = (e) =>
    dispatch(setFilters({ status: e.target.value }));

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
              Proposals
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Manage proposals shared with customers
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          <Plus size={16} /> New Proposal
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
            placeholder="Search S.No, customer, ref #, or link..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={filters.status}
          onChange={handleStatusFilterChange}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[900px] md:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {[
                  "S.NO","DATE","CUSTOMER","PROPOSAL REFERENCE #",
                  "DRIVE LINK","STATUS","ACTION",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading proposals...
                  </td>
                </tr>
              ) : normalized.length > 0 ? (
                normalized.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {p.sno ?? "—"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {p.customer}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {p.proposal_reference}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      {p.drive_link ? (
                        <a
                          href={p.drive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <LinkIcon size={12} />
                          Open
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[10px] md:text-xs text-gray-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
  <StatusDropdown
    value={p.status}
    statuses={statuses}
    onChange={(newStatus) => handleQuickStatusChange(p, newStatus)}
    disabled={statusUpdatingId === p.id}
  />
</td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No proposals found
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
      <ProposalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        proposal={editing}
        onSave={handleSave}
        submitting={submitting}
        statuses={statuses}
        defaultSerialNo={options.next_serial_no ?? 1}
      />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Proposal"
        message={`Are you sure you want to delete the proposal "${
          pendingDelete?.proposal_reference || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        loading={submitting}
        variant="danger"
      />
    </div>
  );
};


const StatusDropdown = ({ value, statuses, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Position menu just below the trigger, and keep it on-screen
  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const MENU_W = 150;
    const MENU_H = 20 + statuses.length * 30; // rough

    let left = r.left;
    let top = r.bottom + 4;

    // Keep within viewport horizontally
    if (left + MENU_W > window.innerWidth - 8) {
      left = window.innerWidth - MENU_W - 8;
    }
    // Flip up if it would run off the bottom
    if (top + MENU_H > window.innerHeight - 8) {
      top = Math.max(8, r.top - MENU_H - 4);
    }

    setCoords({ top, left });
  };

  const toggle = () => {
    if (disabled) return;
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  // close on outside click / Escape / scroll / resize
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const pillClass = STATUS_STYLES[value] || STATUS_STYLES.Preparing;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold transition-colors ${pillClass} ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:opacity-90"
        }`}
      >
        {disabled && <Loader size={10} className="animate-spin" />}
        {value || "Preparing"}
        {!disabled && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
            }}
            className="min-w-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          >
            {statuses.map((s) => {
              const active = s === value;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (!active) onChange(s);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 transition-colors ${
                    active
                      ? "bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: STATUS_DOT[s] || "#9ca3af",
                      }}
                    />
                    {s}
                  </span>
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Proposals;