// src/admin/pages/CRM/Proposals.jsx
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ProposalModal from "../../components/crm/ProposalModal";

// ── Allowed statuses ──
export const PROPOSAL_STATUSES = [
  "Preparing",
  "Pending",
  "Sent",
  "Approved",
  "Reject",
];

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

// ── Seed data (now includes user-facing `sno`) ──
const SEED = [
  {
    id: 1,
    sno: 1,
    date: "2026-09-05",
    customer: "Emirates NBD",
    proposal_reference: "PR-2026-0041",
    drive_link: "https://drive.google.com/file/d/example1",
    status: "Sent",
  },
  {
    id: 2,
    sno: 2,
    date: "2026-09-08",
    customer: "Mostech Business Solutions",
    proposal_reference: "PR-2026-0042",
    drive_link: "https://drive.google.com/file/d/example2",
    status: "Pending",
  },
  {
    id: 3,
    sno: 3,
    date: "2026-09-11",
    customer: "ADCB",
    proposal_reference: "PR-2026-0043",
    drive_link: "https://drive.google.com/file/d/example3",
    status: "Approved",
  },
  {
    id: 4,
    sno: 4,
    date: "2026-09-14",
    customer: "First Abu Dhabi Bank",
    proposal_reference: "PR-2026-0044",
    drive_link: "https://drive.google.com/file/d/example4",
    status: "Preparing",
  },
  {
    id: 5,
    sno: 5,
    date: "2026-09-18",
    customer: "Etisalat",
    proposal_reference: "PR-2026-0045",
    drive_link: "https://drive.google.com/file/d/example5",
    status: "Reject",
  },
  {
    id: 6,
    sno: 6,
    date: "2026-09-20",
    customer: "Noon",
    proposal_reference: "PR-2026-0046",
    drive_link: "https://drive.google.com/file/d/example6",
    status: "Sent",
  },
];

const PER_PAGE = 5;

const Proposals = () => {
  const [proposals, setProposals] = useState(SEED);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Filtered + sorted by sno ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proposals
      .filter((p) => {
        const matchesSearch =
          !q ||
          String(p.sno ?? "").includes(q) ||
          p.customer?.toLowerCase().includes(q) ||
          p.proposal_reference?.toLowerCase().includes(q) ||
          p.drive_link?.toLowerCase().includes(q);
        const matchesStatus = !statusFilter || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => Number(a.sno ?? 0) - Number(b.sno ?? 0));
  }, [proposals, search, statusFilter]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PER_PAGE;
  const pageRows = filtered.slice(startIndex, startIndex + PER_PAGE);

  // ── Helpers ──
  const isSnoTaken = (sno, exceptId = null) =>
    proposals.some(
      (p) => Number(p.sno) === Number(sno) && p.id !== exceptId,
    );

  // ── CRUD (local) ──
  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    setSubmitting(true);
    try {
      // Guard against duplicate S.No (modal also validates, this is belt & braces)
      if (isSnoTaken(data.sno, editing?.id)) {
        showToast(`S.No "${data.sno}" is already used`, "error");
        return;
      }

      if (editing?.id) {
        setProposals((prev) =>
          prev.map((p) =>
            p.id === editing.id ? { ...p, ...data, sno: Number(data.sno) } : p,
          ),
        );
        showToast("Proposal updated successfully", "success");
      } else {
        const nextId =
          proposals.reduce((max, p) => Math.max(max, p.id), 0) + 1;
        setProposals((prev) => [
          { id: nextId, ...data, sno: Number(data.sno) },
          ...prev,
        ]);
        showToast("Proposal created successfully", "success");
      }
      setModalOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (p) => {
    setPendingDelete(p);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setSubmitting(true);
    try {
      setProposals((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      showToast("Proposal deleted successfully", "success");
      setConfirmOpen(false);
      setPendingDelete(null);
    } finally {
      setSubmitting(false);
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
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search S.No, customer, ref #, or link..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Statuses</option>
          {PROPOSAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[900px] md:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 w-16">
                  S.NO
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  DATE
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  CUSTOMER
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  PROPOSAL REFERENCE #
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  DRIVE LINK
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  STATUS
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((p) => (
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
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
                          STATUS_STYLES[p.status] || STATUS_STYLES.Preparing
                        }`}
                      >
                        {p.status || "Preparing"}
                      </span>
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
                    colSpan="7"
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
      {totalCount > PER_PAGE && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalCount}
          itemsPerPage={PER_PAGE}
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
        statuses={PROPOSAL_STATUSES}
        isSnoTaken={isSnoTaken}
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

export default Proposals;