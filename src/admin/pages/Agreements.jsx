import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

// ─── File-type helpers (used by both views) ───
const getFileExt = (name = "") => {
  const parts = String(name).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const getFileMeta = (name) => {
  const ext = getFileExt(name);
  const map = {
    pdf: { icon: "fas fa-file-pdf", color: "text-red-500" },
    doc: { icon: "fas fa-file-word", color: "text-blue-600" },
    docx: { icon: "fas fa-file-word", color: "text-blue-600" },
    xls: { icon: "fas fa-file-excel", color: "text-green-600" },
    xlsx: { icon: "fas fa-file-excel", color: "text-green-600" },
    csv: { icon: "fas fa-file-csv", color: "text-green-600" },
    ppt: { icon: "fas fa-file-powerpoint", color: "text-orange-500" },
    pptx: { icon: "fas fa-file-powerpoint", color: "text-orange-500" },
    jpg: { icon: "fas fa-file-image", color: "text-purple-500" },
    jpeg: { icon: "fas fa-file-image", color: "text-purple-500" },
    png: { icon: "fas fa-file-image", color: "text-purple-500" },
    gif: { icon: "fas fa-file-image", color: "text-purple-500" },
    svg: { icon: "fas fa-file-image", color: "text-purple-500" },
    txt: { icon: "fas fa-file-alt", color: "text-gray-500" },
    zip: { icon: "fas fa-file-archive", color: "text-yellow-600" },
    rar: { icon: "fas fa-file-archive", color: "text-yellow-600" },
    mp4: { icon: "fas fa-file-video", color: "text-pink-500" },
    mp3: { icon: "fas fa-file-audio", color: "text-indigo-500" },
  };
  return map[ext] || { icon: "fas fa-file", color: "text-gray-500" };
};

const FolderIconLarge = () => (
  <svg
    viewBox="0 0 96 72"
    className="w-16 h-16 md:w-20 md:h-20"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f5b74b" />
        <stop offset="100%" stopColor="#d38b1e" />
      </linearGradient>
      <linearGradient id="folderFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd66b" />
        <stop offset="100%" stopColor="#f4b845" />
      </linearGradient>
    </defs>
    {/* back of folder */}
    <path
      d="M6 12 a6 6 0 0 1 6 -6 h18 l8 8 h34 a6 6 0 0 1 6 6 v6 H6 z"
      fill="url(#folderBack)"
    />
    {/* front flap */}
    <path
      d="M6 22 h84 a6 6 0 0 1 6 6 l-8 34 a6 6 0 0 1 -6 5 H14 a6 6 0 0 1 -6 -5 L0 28 a6 6 0 0 1 6 -6 z"
      fill="url(#folderFront)"
    />
    {/* inner shadow line */}
    <path
      d="M6 22 h84 a6 6 0 0 1 6 6 l-1 5 H1 l1 -5 a6 6 0 0 1 4 -6 z"
      fill="#c98c26"
      opacity="0.35"
    />
  </svg>
);

const FolderIconOpen = () => (
  <svg
    viewBox="0 0 96 72"
    className="w-16 h-16 md:w-20 md:h-20"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="folderOpenFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe08a" />
        <stop offset="100%" stopColor="#f3b73e" />
      </linearGradient>
    </defs>
    <path
      d="M6 12 a6 6 0 0 1 6 -6 h18 l8 8 h34 a6 6 0 0 1 6 6 v4 H6 z"
      fill="#d38b1e"
    />
    <path
      d="M0 26 a6 6 0 0 1 6 -6 h84 a6 6 0 0 1 6 6 l-10 34 a6 6 0 0 1 -6 5 H16 a6 6 0 0 1 -6 -5 L0 26 z"
      fill="url(#folderOpenFront)"
    />
  </svg>
);

const Agreements = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const location = useLocation();
  const basePath = location.pathname.split("/")[1] || "admin";

  const { documents: documentsState = [], error = null } = useSelector(
    (state) =>
      state.documents || { documents: [], loading: false, error: null },
  );

  const documents = Array.isArray(documentsState) ? documentsState : [];

  const { childrenOf, ensureLoaded } = useFolderTree();

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbStack, setBreadcrumbStack] = useState([]);

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === "undefined") return "grid";
    return window.localStorage.getItem("agreements:viewMode") || "grid";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("agreements:viewMode", viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [folderModal, setFolderModal] = useState({
    isOpen: false,
    parentId: null,
    folder: null,
  });

  const [folderDeleteConfirm, setFolderDeleteConfirm] = useState({
    isOpen: false,
    folder: null,
  });
  const [folderDeleting, setFolderDeleting] = useState(false);

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

  const filteredFolders = useMemo(() => {
    if (!searchTerm) return currentFolders;
    const s = searchTerm.toLowerCase();
    return currentFolders.filter((f) =>
      (f.name || "").toLowerCase().includes(s),
    );
  }, [currentFolders, searchTerm]);

  // Paginated documents (folders always shown in full at top)
  const totalFiltered = filteredDocuments.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageDocuments = filteredDocuments.slice(start, start + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFolderId, searchTerm, perPage]);

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
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getExpiryClass = (expiryDate) => {
    if (!expiryDate) return "text-gray-400";
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "text-red-500 font-semibold";
    if (diffDays <= 30) return "text-amber-500 font-semibold";
    return "text-gray-500";
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
  const hasFolders = filteredFolders.length > 0;

  const breadcrumbPath = breadcrumbStack.map((f) => f.name).join(" / ");
  const uploadLink = isAtRoot
    ? `/${basePath}/documents/add-agreement`
    : `/${basePath}/documents/add-agreement?folder_id=${currentFolderId}&folder_path=${encodeURIComponent(
        breadcrumbPath,
      )}`;

  // Combined list for list-view: folders first, then documents
  const listItems = useMemo(() => {
    const folderItems = filteredFolders.map((f) => ({
      kind: "folder",
      id: `folder-${f.id}`,
      data: f,
    }));
    const docItems = pageDocuments.map((d) => ({
      kind: "document",
      id: `doc-${d.id}`,
      data: d,
    }));
    return [...folderItems, ...docItems];
  }, [filteredFolders, pageDocuments]);

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

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 md:mb-5">
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
              title="Large icons"
            >
              <i className="fas fa-th-large text-xs"></i>
              <span className="hidden sm:inline">Icons</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Details list"
            >
              <i className="fas fa-list text-xs"></i>
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>

          <button
            onClick={() => openAddFolder(isAtRoot ? null : currentFolderId)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <i className="fas fa-folder-plus text-green-500"></i>
            {isAtRoot ? "Add Folder" : "Add Subfolder"}
          </button>

          <Link
            to={uploadLink}
            className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus-circle"></i> Upload Document
          </Link>
        </div>
      </div>

      {/* Search + pagination controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <i className="fas fa-folder mr-1 text-amber-500"></i>
          {filteredFolders.length} folder{filteredFolders.length === 1 ? "" : "s"}
          {!isAtRoot && (
            <>
              <span className="mx-2 text-gray-300">•</span>
              <i className="fas fa-file-alt mr-1 text-green-500"></i>
              {filteredDocuments.length} file
              {filteredDocuments.length === 1 ? "" : "s"}
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <EntriesSelector value={perPage} onChange={setPerPage} />
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search folders and files..."
          />
        </div>
      </div>

      {/* Breadcrumb */}
      {!isAtRoot && (
        <div className="flex items-center flex-wrap gap-1 mb-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={goToRoot}
            className="hover:text-green-600 flex items-center gap-1"
          >
            <i className="fas fa-home"></i> All Folders
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

      {/* ── GRID VIEW (OS Explorer style) ── */}
      {viewMode === "grid" && (
        <>
         {hasFolders && (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 md:gap-1 mb-4">
              {/* Folders */}
              {filteredFolders.map((folder) => {
                const docCount = documentCountFor(folder.id);
                return (
                  <GridFolderTile
                    key={folder.id}
                    folder={folder}
                    docCount={docCount}
                    onClick={() => openFolder(folder)}
                    onEdit={() => openEditFolder(folder)}
                    onDelete={() => handleFolderDeleteClick(folder)}
                  />
                );
              })}

              {/* Documents (inside a folder) */}
              {!isAtRoot &&
                pageDocuments.map((doc) => (
                  <GridDocumentTile
                    key={doc.id}
                    document={doc}
                    onView={() => handleViewDocument(doc.file_path)}
                    onEdit={() => navigate(`/${basePath}/documents/edit-agreement/${doc.id}`)}
                    onDelete={() => handleDeleteClick(doc)}
                    basePath={basePath}
                  />
                ))}

              {/* Inline add-subfolder tile */}
              {!isAtRoot && (
                <button
                  onClick={() => openAddFolder(currentFolderId)}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-green-300 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all min-h-[130px]"
                >
                  <i className="fas fa-plus text-2xl"></i>
                  <span className="text-[11px] md:text-xs font-semibold">
                    New Subfolder
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Empty state at root */}
          {isAtRoot && !hasFolders && (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
              <div className="mb-3">
                <FolderIconLarge />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                This folder is empty
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-5 text-center max-w-sm">
                Create a folder to organize your documents.
              </p>
              <button
                onClick={() => openAddFolder(null)}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <i className="fas fa-folder-plus"></i> Create Folder
              </button>
            </div>
          )}

          {/* Empty state inside folder */}
          {!isAtRoot && !hasFolders && !hasDocuments && (
            <div className="flex flex-col items-center justify-center py-14 px-4 bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
              <div className="mb-3">
                <FolderIconOpen />
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
        </>
      )}

      {/* ── LIST VIEW (Details) ── */}
      {viewMode === "list" && (
        <>
          {(hasFolders || pageDocuments.length > 0 || !isAtRoot) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-soft mb-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      {["Name", "Type", "Size", "Modified", "Expiry", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-3 md:px-4 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Folders first */}
                    {filteredFolders.map((folder) => {
                      const docCount = documentCountFor(folder.id);
                      return (
                        <ListRow
                          key={folder.id}
                          kind="folder"
                          data={folder}
                          docCount={docCount}
                          onClick={() => openFolder(folder)}
                          onEdit={() => openEditFolder(folder)}
                          onDelete={() => handleFolderDeleteClick(folder)}
                          basePath={basePath}
                        />
                      );
                    })}

                    {/* Then documents of the current folder */}
                    {pageDocuments.map((doc) => (
                      <ListRow
                        key={doc.id}
                        kind="document"
                        data={doc}
                        onView={() => handleViewDocument(doc.file_path)}
                        onDelete={() => handleDeleteClick(doc)}
                        basePath={basePath}
                        formatDate={formatDate}
                        getExpiryClass={getExpiryClass}
                      />
                    ))}

                    {/* Inline add subfolder row */}
                    {!isAtRoot && (
                      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td colSpan={6} className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => openAddFolder(currentFolderId)}
                            className="text-green-600 hover:text-green-700 font-semibold text-xs md:text-sm flex items-center gap-2"
                          >
                            <i className="fas fa-plus-circle"></i> New Subfolder
                          </button>
                        </td>
                      </tr>
                    )}

                    {listItems.length === 0 && isAtRoot && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          No folders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isAtRoot && !hasFolders && (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
              <div className="mb-3">
                <FolderIconLarge />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                This folder is empty
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-5 text-center max-w-sm">
                Create a folder to organize your documents.
              </p>
              <button
                onClick={() => openAddFolder(null)}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <i className="fas fa-folder-plus"></i> Create Folder
              </button>
            </div>
          )}
        </>
      )}

      {/* Pagination (only for documents in current folder) */}
      {!isAtRoot && totalFiltered > perPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalFiltered}
          itemsPerPage={perPage}
        />
      )}

      {/* Modals */}
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

/* ── GRID: folder tile (OS Explorer–style) ── */
const GridFolderTile = ({ folder, docCount, onClick, onEdit, onDelete }) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col items-center p-2 md:p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
  >
    <div className="relative mb-1">
      <FolderIconLarge />
      {docCount > 0 && (
        <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow">
          {docCount}
        </span>
      )}
    </div>

    <div className="text-[11px] md:text-xs font-medium text-center text-gray-800 dark:text-gray-200 leading-tight line-clamp-2 break-words w-full">
      {folder.name}
    </div>

    {/* Hover actions toolbar */}
    <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-md shadow border border-gray-200 dark:border-gray-700 p-0.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
        title="Rename"
      >
        <i className="fas fa-edit text-[10px]"></i>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
        title="Delete"
      >
        <i className="fas fa-trash text-[10px]"></i>
      </button>
    </div>
  </div>
);

/* ── GRID: document tile ── */
const GridDocumentTile = ({
  document,
  onView,
  onEdit,
  onDelete,
}) => {
  const meta = getFileMeta(document.name || "");
  return (
    <div
      onClick={onView}
      className="group relative flex flex-col items-center p-2 md:p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 mb-1 flex items-center justify-center">
        <i className={`${meta.icon} ${meta.color} text-4xl md:text-5xl`}></i>
      </div>

      <div className="text-[11px] md:text-xs font-medium text-center text-gray-800 dark:text-gray-200 leading-tight line-clamp-2 break-words w-full">
        {document.name || "Untitled"}
      </div>

      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-md shadow border border-gray-200 dark:border-gray-700 p-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
          title="View"
        >
          <i className="fas fa-eye text-[10px]"></i>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
          title="Edit"
        >
          <i className="fas fa-edit text-[10px]"></i>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          title="Delete"
        >
          <i className="fas fa-trash text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};

/* ── LIST VIEW row ── */
const ListRow = ({
  kind,
  data,
  docCount = 0,
  onClick,
  onEdit,
  onDelete,
  onView,
  basePath,
  formatDate,
  getExpiryClass,
}) => {
  if (kind === "folder") {
    return (
      <tr
        onClick={onClick}
        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors group"
      >
        <td className="px-3 md:px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <i className="fas fa-folder text-amber-500"></i>
            <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {data.name}
            </span>
          </div>
        </td>
        <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Folder{data.has_children ? " • has subfolders" : ""}
        </td>
        <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {docCount > 0
            ? `${docCount} file${docCount === 1 ? "" : "s"}`
            : "—"}
        </td>
        <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          —
        </td>
        <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          —
        </td>
        <td className="px-3 md:px-4 py-2.5">
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
        </td>
      </tr>
    );
  }

  // Document row
  const meta = getFileMeta(data.name || "");
  const ext = getFileExt(data.name || "");
  const sizeStr = data.size ? `${(data.size / 1024).toFixed(1)} KB` : "—";

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group">
      <td className="px-3 md:px-4 py-2.5">
        <button
          onClick={onView}
          className="flex items-center gap-2 min-w-0 text-left"
        >
          <i className={`${meta.icon} ${meta.color}`}></i>
          <span className="text-xs md:text-sm text-gray-800 dark:text-gray-200 truncate hover:text-green-600">
            {data.name || "Untitled"}
          </span>
        </button>
      </td>
      <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase">
        {ext || "file"}
      </td>
      <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        {sizeStr}
      </td>
      <td className="px-3 md:px-4 py-2.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        {formatDate(data.created_at || data.updated_at)}
      </td>
      <td
        className={`px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap ${getExpiryClass(
          data.expiry_date,
        )}`}
      >
        {formatDate(data.expiry_date)}
      </td>
      <td className="px-3 md:px-4 py-2.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onView}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
            title="View"
          >
            <i className="fas fa-eye text-xs"></i>
          </button>
          <Link
            to={`/${basePath}/documents/edit-agreement/${data.id}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500"
            title="Edit"
          >
            <i className="fas fa-edit text-xs"></i>
          </Link>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            title="Delete"
          >
            <i className="fas fa-trash text-xs"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Agreements;