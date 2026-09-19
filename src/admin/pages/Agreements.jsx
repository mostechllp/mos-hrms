import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "@admin/components/common/SearchBar";
import EntriesSelector from "@admin/components/common/EntriesSelector";
import { showToast } from "../../components/common/Toast";
import Pagination from "@admin/components/common/Paginations";
import ConfirmModal from "@admin/components/common/ConfirmModal";
import AddFolderModal from "../components/documents/AddFolderModal";
import {
  fetchDocuments,
  deleteDocument,
  clearError,
  fetchDocumentFolders,
  deleteDocumentFolder,
} from "@admin/store/slices/documentsSlice";
import useFolderTree from "../hooks/useFolderTree";

const Agreements = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const basePath = location.pathname.split("/")[1] || "admin";

  const {
    documents: documentsState = [],
    error = null,
  } = useSelector(
    (state) =>
      state.documents || { documents: [], loading: false, error: null },
  );

  const documents = Array.isArray(documentsState) ? documentsState : [];

  // ── Folder tree (lazy, per-level) ──
  const { childrenOf, ensureLoaded } = useFolderTree();

  // ── Navigation state ──
  const [currentFolderId, setCurrentFolderId] = useState(null);
  // Stack of folders from root → current, so breadcrumb works even if not cached
  const [breadcrumbStack, setBreadcrumbStack] = useState([]);

  // ── Table / search state ──
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Folder modal ──
  const [folderModal, setFolderModal] = useState({
    isOpen: false,
    parentId: null,
    folder: null,
  });

  // ── Folder delete confirm ──
  const [folderDeleteConfirm, setFolderDeleteConfirm] = useState({
    isOpen: false,
    folder: null,
  });
  const [folderDeleting, setFolderDeleting] = useState(false);

  // ── Initial load ──
  useEffect(() => {
    dispatch(fetchDocuments());
    // The hook auto-loads root folders
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ── Load subfolders whenever we enter a folder ──
  useEffect(() => {
    if (currentFolderId != null) {
      ensureLoaded(currentFolderId);
    }
  }, [currentFolderId, ensureLoaded]);

  // ── Folder lists ──
  const rootFolders = childrenOf(null);
  const currentSubfolders =
    currentFolderId != null ? childrenOf(currentFolderId) : [];

  // ── Counts (document count only; subfolder count comes from has_children) ──
  const documentCountFor = useCallback(
    (folderId) =>
      documents.filter((d) => String(d.folder_id) === String(folderId)).length,
    [documents],
  );

  // ── Navigation helpers ──
  const openFolder = (folder) => {
    setCurrentFolderId(folder.id);
    // Extend breadcrumb stack
    setBreadcrumbStack((prev) => {
      // If we're navigating forward from the current folder, push
      const last = prev[prev.length - 1];
      if (last && String(last.id) === String(folder.parent_id)) {
        return [...prev, folder];
      }
      // Otherwise treat as a jump — rebuild from parent chain
      // (we only know current + parent, so simple cases work)
      const idx = prev.findIndex((f) => String(f.id) === String(folder.id));
      if (idx !== -1) return prev.slice(0, idx + 1);
      return [...prev, folder];
    });
  };

  const goToRoot = () => {
    setCurrentFolderId(null);
    setBreadcrumbStack([]);
  };

  const goToBreadcrumb = (folder, index) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbStack((prev) => prev.slice(0, index + 1));
  };

  // ── Documents in the currently selected folder ──
  const folderDocuments = useMemo(() => {
    if (currentFolderId == null) {
      return documents.filter(
        (d) => d.folder_id == null || d.folder_id === "",
      );
    }
    return documents.filter(
      (d) => String(d.folder_id) === String(currentFolderId),
    );
  }, [documents, currentFolderId]);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return folderDocuments;
    const s = searchTerm.toLowerCase();
    return folderDocuments.filter(
      (doc) =>
        (doc.name || "").toLowerCase().includes(s) ||
        (doc.description || "").toLowerCase().includes(s),
    );
  }, [folderDocuments, searchTerm]);

  const totalFiltered = filteredDocuments.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageDocuments = filteredDocuments.slice(start, start + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFolderId, searchTerm, perPage]);

  // ── Folder modal handlers ──
  const openAddFolder = (parentId = null) => {
    setFolderModal({ isOpen: true, parentId, folder: null });
  };

  const openEditFolder = (folder) => {
    setFolderModal({ isOpen: true, parentId: folder.parent_id, folder });
  };

  const closeFolderModal = () => {
    setFolderModal({ isOpen: false, parentId: null, folder: null });
  };

  // Refresh the level that was affected by the operation
  const refreshParentLevel = (parentId) => {
    // Force-refresh by dispatching directly. The slice caches per-level,
    // so this will overwrite the cache for that parent.
    dispatch(fetchDocumentFolders(parentId ?? null));
    // Also refresh current view's children (in case a subfolder was added)
    if (currentFolderId != null) {
      dispatch(fetchDocumentFolders(currentFolderId));
    }
  };

  const handleFolderSaved = (savedFolder) => {
    // Refresh the parent level (or root if it's a root folder)
    const parentId = savedFolder?.parent_id ?? null;
    dispatch(fetchDocumentFolders(parentId));
    // If we're currently viewing that parent, refresh its children
    if (
      currentFolderId != null &&
      String(currentFolderId) === String(parentId)
    ) {
      dispatch(fetchDocumentFolders(currentFolderId));
    }
    // Root refresh fallback
    if (parentId == null) {
      dispatch(fetchDocumentFolders(null));
    }
  };

  // ── Folder delete ──
  const handleFolderDeleteClick = (folder) => {
    setFolderDeleteConfirm({ isOpen: true, folder });
  };

  const confirmFolderDelete = async () => {
    const folder = folderDeleteConfirm.folder;
    if (!folder) return;
    setFolderDeleting(true);
    try {
      await dispatch(deleteDocumentFolder(folder.id)).unwrap();
      showToast(`Folder "${folder.name}" deleted`, "success");

      // If we were inside the deleted folder (or its descendants), go up
      if (String(currentFolderId) === String(folder.id)) {
        const parentId = folder.parent_id ?? null;
        setCurrentFolderId(parentId);
        // Trim breadcrumb
        setBreadcrumbStack((prev) => {
          const idx = prev.findIndex(
            (f) => String(f.id) === String(folder.id),
          );
          return idx === -1 ? prev : prev.slice(0, idx);
        });
      }

      // Remove from breadcrumb stack if present
      setBreadcrumbStack((prev) =>
        prev.filter((f) => String(f.id) !== String(folder.id)),
      );

      // Refresh parent level cache
      dispatch(fetchDocumentFolders(folder.parent_id ?? null));
      if (currentFolderId != null && String(currentFolderId) !== String(folder.id)) {
        dispatch(fetchDocumentFolders(currentFolderId));
      }

      dispatch(fetchDocuments());
      setFolderDeleteConfirm({ isOpen: false, folder: null });
    } catch (err) {
      showToast(typeof err === "string" ? err : "Delete failed", "error");
    } finally {
      setFolderDeleting(false);
    }
  };

  // ── Document handlers ──
  const handleDeleteClick = (document) => {
    setSelectedDocument(document);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;
    setDeleteLoading(true);
    const result = await dispatch(deleteDocument(selectedDocument.id));
    if (deleteDocument.fulfilled.match(result)) {
      showToast(`${selectedDocument.name} deleted successfully`, "success");
      setConfirmOpen(false);
      setSelectedDocument(null);
    } else {
      showToast("Failed to delete document", "error");
    }
    setDeleteLoading(false);
  };

  const handleViewDocument = (filePath) => {
    if (!filePath) {
      showToast("No document file available", "info");
      return;
    }
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
      window.location.origin;
    const fileUrl = `${baseUrl}/storage/${filePath.replace(/^\/+/, "")}`;
    window.open(fileUrl, "_blank");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No Expiry";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getExpiryClass = (expiryDate) => {
    if (!expiryDate) return "";
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "text-red-500 font-semibold";
    if (diffDays <= 30) return "text-amber-500 font-semibold";
    return "";
  };

  const total = documents.length;
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  let expiringSoon = 0;
  let expired = 0;
  documents.forEach((doc) => {
    if (doc.expiry_date) {
      const d = new Date(doc.expiry_date);
      if (d < today) expired++;
      else if (d <= thirtyDaysFromNow) expiringSoon++;
    }
  });

  // For the delete confirmation message
  const folderBeingDeleted = folderDeleteConfirm.folder;
  const folderDeleteDocCount = folderBeingDeleted
    ? documentCountFor(folderBeingDeleted.id)
    : 0;

  return (
    <div className="w-full overflow-x-hidden">
      {/* Stats */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6">
        <StatCard
          icon="fas fa-file-alt"
          color="green"
          value={total}
          label="Total Documents"
        />
        <StatCard
          icon="fas fa-clock"
          color="amber"
          value={expiringSoon}
          label="Expiring Soon (30 days)"
        />
        <StatCard
          icon="fas fa-calendar-times"
          color="red"
          value={expired}
          label="Expired"
        />
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
          Documents
        </h2>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center flex-wrap gap-1 mb-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={goToRoot}
          className={`hover:text-green-600 ${
            currentFolderId == null ? "font-semibold text-green-600" : ""
          }`}
        >
          <i className="fas fa-home mr-1"></i> All Files
        </button>
        {breadcrumbStack.map((f, idx) => (
          <span key={f.id} className="flex items-center gap-1">
            <i className="fas fa-chevron-right text-[10px]"></i>
            <button
              onClick={() => goToBreadcrumb(f, idx)}
              className={`hover:text-green-600 ${
                String(currentFolderId) === String(f.id)
                  ? "font-semibold text-green-600"
                  : ""
              }`}
            >
              {f.name}
            </button>
          </span>
        ))}
      </div>

      {/* Root folders row */}
      <div className="overflow-x-auto pb-2 mb-3 -mx-4 px-4">
        <div className="flex gap-2 min-w-max items-center">
          {rootFolders.length === 0 ? (
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 italic mr-2">
              No folders yet.
            </span>
          ) : (
            rootFolders.map((folder) => (
              <FolderChip
                key={folder.id}
                folder={folder}
                active={String(currentFolderId) === String(folder.id)}
                docCount={documentCountFor(folder.id)}
                onClick={() => openFolder(folder)}
                onEdit={() => openEditFolder(folder)}
                onDelete={() => handleFolderDeleteClick(folder)}
                showActions
              />
            ))
          )}
          <button
            onClick={() => openAddFolder(null)}
            className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-dashed border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 flex items-center gap-1 whitespace-nowrap"
          >
            <i className="fas fa-plus text-[10px]"></i> New Folder
          </button>
        </div>
      </div>

      {/* Subfolders of current folder */}
      {currentFolderId != null && (
        <div className="mb-4 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300">
              <i className="fas fa-folder-tree mr-1"></i> Subfolders
            </span>
            <button
              onClick={() => openAddFolder(currentFolderId)}
              className="text-xs md:text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <i className="fas fa-plus-circle"></i> Add Subfolder
            </button>
          </div>

          {currentSubfolders.length === 0 ? (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              No subfolders yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {currentSubfolders.map((sub) => (
                <div
                  key={sub.id}
                  className="group flex items-center justify-between gap-2 p-2 md:p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-400 cursor-pointer transition-all"
                  onClick={() => openFolder(sub)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <i className="fas fa-folder text-amber-500"></i>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm truncate">
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {sub.has_children ? "Has subfolders" : "No subfolders"} •{" "}
                        {documentCountFor(sub.id)} doc
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditFolder(sub);
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
                      title="Rename"
                    >
                      <i className="fas fa-edit text-[10px]"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderDeleteClick(sub);
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      title="Delete"
                    >
                      <i className="fas fa-trash text-[10px]"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
        <EntriesSelector value={perPage} onChange={setPerPage} />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search documents..."
          />
          <Link
            to={`/${basePath}/documents/add-agreement${
              currentFolderId ? `?folder_id=${currentFolderId}` : ""
            }`}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <i className="fas fa-plus-circle"></i> Upload Document
          </Link>
        </div>
      </div>

      {/* Documents table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[800px] md:min-w-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {["Sl.No.", "Name", "Description", "Share With", "Expiry Date", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pageDocuments.length > 0 ? (
                pageDocuments.map((document, idx) => (
                  <tr
                    key={document.id || idx}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                      {start + idx + 1}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <button
                        onClick={() => handleViewDocument(document.file_path)}
                        className="hover:text-green-500 transition-colors text-left"
                      >
                        {document.name || "Untitled"}
                      </button>
                    </td>
                    <td
                      className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate"
                      title={document.description}
                    >
                      {document.description || "-"}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className="inline-flex items-center gap-1 md:gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap">
                        <i className="fas fa-share-alt text-gray-500 text-[8px] md:text-xs"></i>
                        <span>
                          {document.shared_users?.length > 0
                            ? document.shared_users.map((u) => u.name).join(", ")
                            : document.share_with?.length > 0
                              ? document.share_with.join(", ")
                              : "-"}
                        </span>
                      </span>
                    </td>
                    <td
                      className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm ${getExpiryClass(
                        document.expiry_date,
                      )} whitespace-nowrap`}
                    >
                      {formatDate(document.expiry_date)}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleViewDocument(document.file_path)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
                          title="View"
                        >
                          <i className="fas fa-eye text-xs md:text-sm"></i>
                        </button>
                        <Link
                          to={`/${basePath}/documents/edit-agreement/${document.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit text-xs md:text-sm"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(document)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash text-xs md:text-sm"></i>
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
                    {currentFolderId == null && rootFolders.length === 0
                      ? 'No folders or documents yet. Click "New Folder" to get started.'
                      : "No documents found in this folder."}
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

      {/* Document delete modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDocument?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
        variant="danger"
      />

      {/* Folder delete modal */}
      <ConfirmModal
        isOpen={folderDeleteConfirm.isOpen}
        onClose={() =>
          !folderDeleting &&
          setFolderDeleteConfirm({ isOpen: false, folder: null })
        }
        onConfirm={confirmFolderDelete}
        title="Delete Folder"
        message={
          folderBeingDeleted
            ? `Are you sure you want to delete "${folderBeingDeleted.name}"?` +
              (folderBeingDeleted.has_children
                ? ` It contains subfolders`
                : "") +
              (folderDeleteDocCount > 0
                ? `${folderBeingDeleted.has_children ? " and" : " It contains"} ${folderDeleteDocCount} document(s)`
                : "") +
              `. This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        loading={folderDeleting}
        variant="danger"
      />

      {/* Folder add/edit modal */}
      <AddFolderModal
        isOpen={folderModal.isOpen}
        onClose={closeFolderModal}
        onFolderAdded={handleFolderSaved}
        editingFolder={folderModal.folder}
        parentId={folderModal.parentId}
      />
    </div>
  );
};

/* ── Presentational helpers ── */

const StatCard = ({ icon, color, value, label }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
    <div className="flex justify-between items-start mb-2 md:mb-3">
      <div
        className={`w-10 h-10 md:w-12 md:h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}
      >
        <i
          className={`${icon} text-${color}-600 dark:text-${color}-400 text-base md:text-xl`}
        ></i>
      </div>
    </div>
    <div
      className={`text-2xl md:text-3xl font-extrabold text-${color}-600 dark:text-${color}-400`}
    >
      {value}
    </div>
    <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
      {label}
    </div>
  </div>
);

const FolderChip = ({
  folder,
  active,
  onClick,
  onEdit,
  onDelete,
  showActions,
  docCount = 0,
}) => (
  <div
    onClick={onClick}
    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${
      active
        ? "bg-green-500 text-white shadow-md"
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
    }`}
  >
    <i className="fas fa-folder"></i>
    <span>{folder.name}</span>
    {(folder.has_children || docCount > 0) && (
      <span
        className={`text-[10px] px-1.5 rounded-full ${
          active ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        {docCount}
        {folder.has_children && " +"}
      </span>
    )}
    {showActions && (
      <span className="flex items-center gap-1 ml-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className={`p-0.5 rounded hover:bg-black/10 ${active ? "text-white" : "text-amber-500"}`}
          title="Rename"
        >
          <i className="fas fa-edit text-[10px]"></i>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-0.5 rounded hover:bg-black/10 ${active ? "text-white" : "text-red-500"}`}
          title="Delete"
        >
          <i className="fas fa-trash text-[10px]"></i>
        </button>
      </span>
    )}
  </div>
);

export default Agreements;