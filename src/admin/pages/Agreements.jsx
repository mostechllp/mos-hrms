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
  deleteDocumentFolder,
} from "@admin/store/slices/documentsSlice";
import useFolderTree from "../hooks/useFolderTree";

const Agreements = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const basePath = location.pathname.split("/")[1] || "admin";

  const { documents: documentsState = [], error = null } = useSelector(
    (state) =>
      state.documents || { documents: [], loading: false, error: null },
  );

  const documents = Array.isArray(documentsState) ? documentsState : [];

  // ── Folder tree (lazy, per-level) ──
  const { childrenOf, ensureLoaded } = useFolderTree();

  // ── Navigation state ──
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbStack, setBreadcrumbStack] = useState([]);

  // ── View mode (grid / list) ──
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === "undefined") return "grid";
    return window.localStorage.getItem("agreements:viewMode") || "grid";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("agreements:viewMode", viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  // ── Table / search ──
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
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (currentFolderId != null) {
      ensureLoaded(currentFolderId);
    }
  }, [currentFolderId, ensureLoaded]);

  const currentFolders =
    currentFolderId == null ? childrenOf(null) : childrenOf(currentFolderId);

  const currentFolder =
    currentFolderId != null
      ? breadcrumbStack.find((f) => String(f.id) === String(currentFolderId)) ||
        null
      : null;

  const documentCountFor = useCallback(
    (folderId) =>
      documents.filter((d) => String(d.folder_id) === String(folderId)).length,
    [documents],
  );

  const openFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbStack((prev) => {
      const last = prev[prev.length - 1];
      if (last && String(last.id) === String(folder.parent_id)) {
        return [...prev, folder];
      }
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

  // ── Documents of current folder ──
  const folderDocuments = useMemo(() => {
    if (currentFolderId == null) return [];
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

  const handleFolderSaved = (savedFolder) => {
    const parentId = savedFolder?.parent_id ?? null;
    ensureLoaded(parentId, true);
    if (
      currentFolderId != null &&
      String(currentFolderId) === String(parentId)
    ) {
      ensureLoaded(currentFolderId, true);
    }
    if (parentId == null) {
      ensureLoaded(null, true);
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

      if (String(currentFolderId) === String(folder.id)) {
        const parentId = folder.parent_id ?? null;
        setCurrentFolderId(parentId);
        setBreadcrumbStack((prev) => {
          const idx = prev.findIndex((f) => String(f.id) === String(folder.id));
          return idx === -1 ? prev : prev.slice(0, idx);
        });
      }

      setBreadcrumbStack((prev) =>
        prev.filter((f) => String(f.id) !== String(folder.id)),
      );

      ensureLoaded(folder.parent_id ?? null, true);
      if (
        currentFolderId != null &&
        String(currentFolderId) !== String(folder.id)
      ) {
        ensureLoaded(currentFolderId, true);
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

  const folderBeingDeleted = folderDeleteConfirm.folder;
  const folderDeleteDocCount = folderBeingDeleted
    ? documentCountFor(folderBeingDeleted.id)
    : 0;

  const isAtRoot = currentFolderId == null;
  const hasDocuments = folderDocuments.length > 0;

  // Breadcrumb path (used for Upload Document link)
  const breadcrumbPath = breadcrumbStack.map((f) => f.name).join(" / ");

  // Upload document link
  const uploadLink = isAtRoot
    ? `/${basePath}/documents/add-agreement`
    : `/${basePath}/documents/add-agreement?folder_id=${currentFolderId}&folder_path=${encodeURIComponent(
        breadcrumbPath,
      )}`;

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

      {/* Header with view toggle + actions */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
          {isAtRoot ? "All Folders" : currentFolder?.name || "Folder"}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Grid view"
            >
              <i className="fas fa-th-large text-xs"></i>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="List view"
            >
              <i className="fas fa-list text-xs"></i>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Add Folder — always visible */}
          <button
            onClick={() => openAddFolder(isAtRoot ? null : currentFolderId)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <i className="fas fa-folder-plus text-green-500"></i>
            {isAtRoot ? "Add Folder" : "Add Subfolder"}
          </button>

          {/* Upload Document — always visible */}
          <Link
            to={uploadLink}
            className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus-circle"></i> Upload Document
          </Link>
        </div>
      </div>

      {/* Breadcrumb */}
      {!isAtRoot && (
        <div className="flex items-center flex-wrap gap-1 mb-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <button onClick={goToRoot} className="hover:text-green-600">
            <i className="fas fa-home mr-1"></i> All Folders
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
      )}

      {/* ── FOLDER GRID / LIST ── */}
      {currentFolders.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
              {currentFolders.map((folder) => {
                const docCount = documentCountFor(folder.id);
                return (
                  <FolderTile
                    key={folder.id}
                    folder={folder}
                    docCount={docCount}
                    onClick={() => openFolder(folder)}
                    onEdit={() => openEditFolder(folder)}
                    onDelete={() => handleFolderDeleteClick(folder)}
                  />
                );
              })}

              {!isAtRoot && (
                <button
                  onClick={() => openAddFolder(currentFolderId)}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all min-h-[140px]"
                >
                  <i className="fas fa-plus text-2xl"></i>
                  <span className="text-xs md:text-sm font-semibold">
                    New Subfolder
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-6">
              {currentFolders.map((folder) => {
                const docCount = documentCountFor(folder.id);
                return (
                  <FolderRowItem
                    key={folder.id}
                    folder={folder}
                    docCount={docCount}
                    onClick={() => openFolder(folder)}
                    onEdit={() => openEditFolder(folder)}
                    onDelete={() => handleFolderDeleteClick(folder)}
                  />
                );
              })}

              {!isAtRoot && (
                <button
                  onClick={() => openAddFolder(currentFolderId)}
                  className="flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 border-dashed border-green-300 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all"
                >
                  <i className="fas fa-plus text-lg"></i>
                  <span className="text-xs md:text-sm font-semibold">
                    New Subfolder
                  </span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── EMPTY STATE at root ── */}
      {isAtRoot && currentFolders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <i className="fas fa-folder-open text-2xl text-green-500"></i>
          </div>
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
            No folders yet
          </h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-5 text-center max-w-sm">
            Create your first folder to start organizing documents.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => openAddFolder(null)}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <i className="fas fa-folder-plus"></i> Create Folder
            </button>
            <Link
              to={`/${basePath}/documents/add-agreement`}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <i className="fas fa-plus-circle text-green-500"></i> Upload
              Document
            </Link>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE inside a folder with no subfolders and no documents ── */}
      {!isAtRoot && currentFolders.length === 0 && !hasDocuments && (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
            <i className="fas fa-folder text-xl text-amber-500"></i>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-5 text-center">
            This folder is empty. Add a subfolder or upload a document.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => openAddFolder(currentFolderId)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <i className="fas fa-folder-plus text-green-500"></i> Add
              Subfolder
            </button>
            <Link
              to={uploadLink}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <i className="fas fa-plus-circle"></i> Upload Document
            </Link>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS inside current folder ── */}
      {!isAtRoot && hasDocuments && (
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
            <h3 className="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
              <i className="fas fa-file-alt mr-2 text-green-500"></i>
              Documents in this folder
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <EntriesSelector value={perPage} onChange={setPerPage} />
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search documents..."
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[700px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {[
                      "Sl.No.",
                      "Name",
                      "Description",
                      "Expiry Date",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
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
                            onClick={() =>
                              handleViewDocument(document.file_path)
                            }
                            className="hover:text-green-500 transition-colors text-left"
                          >
                            {document.name || "Untitled"}
                          </button>
                        </td>
                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[240px] truncate"
                          title={document.description}
                        >
                          {document.description || "-"}
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
                              onClick={() =>
                                handleViewDocument(document.file_path)
                              }
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
                        colSpan="5"
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No documents match your search.
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
        </div>
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

/* ── GRID folder tile ── */
const FolderTile = ({ folder, docCount, onClick, onEdit, onDelete }) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col p-4 md:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-400 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all min-h-[140px]"
  >
    <div className="flex items-start justify-between w-full mb-3">
      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
        <i className="fas fa-folder text-amber-500 text-xl"></i>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
          title="Rename"
        >
          <i className="fas fa-edit text-xs"></i>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          title="Delete"
        >
          <i className="fas fa-trash text-xs"></i>
        </button>
      </div>
    </div>

    <div className="w-full min-w-0 flex-1">
      <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 truncate">
        {folder.name}
      </div>
      <div className="text-[10px] md:text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
        {folder.has_children && (
          <span>
            <i className="fas fa-folder-tree mr-1 text-green-500"></i>
            Has subfolders
          </span>
        )}
        {docCount > 0 && (
          <span>
            <i className="fas fa-file-alt mr-1"></i>
            {docCount} {docCount === 1 ? "file" : "files"}
          </span>
        )}
        {!folder.has_children && docCount === 0 && <span>Empty</span>}
      </div>
    </div>

    {/* Chevron indicator */}
    <div className="absolute bottom-3 right-3 text-gray-300 group-hover:text-green-500 transition-colors">
      <i className="fas fa-chevron-right text-xs"></i>
    </div>
  </div>
);

/* ── LIST folder row ── */
const FolderRowItem = ({ folder, docCount, onClick, onEdit, onDelete }) => (
  <div
    onClick={onClick}
    className="group flex items-center gap-3 p-3 md:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-400 hover:shadow-soft cursor-pointer transition-all"
  >
    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
      <i className="fas fa-folder text-amber-500"></i>
    </div>

    <div className="flex-1 min-w-0">
      <div className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
        {folder.name}
      </div>
      <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
        {folder.has_children && (
          <span>
            <i className="fas fa-folder-tree mr-1 text-green-500"></i>
            Has subfolders
          </span>
        )}
        {docCount > 0 && (
          <span>
            <i className="fas fa-file-alt mr-1"></i>
            {docCount} {docCount === 1 ? "file" : "files"}
          </span>
        )}
        {!folder.has_children && docCount === 0 && <span>Empty</span>}
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
        title="Rename"
      >
        <i className="fas fa-edit text-xs"></i>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
        title="Delete"
      >
        <i className="fas fa-trash text-xs"></i>
      </button>
      <i className="fas fa-chevron-right text-gray-300 group-hover:text-green-500 text-xs ml-1"></i>
    </div>
  </div>
);

export default Agreements;