import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/common/Toast";
import {
  fetchDocumentFolders,
  fetchShareableUsers,
  fetchParties,
  fetchDocumentById,
  updateDocument,
  uploadToTemp,
  fetchFolderById,
} from "../store/slices/documentsSlice";
import { clearError } from "../store/slices/authSlice";
import AddFolderModal from "../components/documents/AddFolderModal";
import AddPartyModal from "../components/documents/AddPartyModal";
import DateInput from "../components/common/DateInput";
import useFolderTree from "../hooks/useFolderTree";

// ─── Recursive row for the lazy folder dropdown (same as AddAgreement) ───
const FolderRow = ({
  node,
  depth,
  selectedId,
  onSelect,
  expanded,
  setExpanded,
  childrenOf,
  ensureLoaded,
  onAddSubfolder,
}) => {
  const isOpen = !!expanded[node.id];
  const isSelected = String(selectedId) === String(node.id);

  const toggleExpand = (e) => {
    e.stopPropagation();
    const next = !isOpen;
    setExpanded((prev) => ({ ...prev, [node.id]: next }));
    if (next) ensureLoaded(node.id);
  };

  const handleRowClick = () => {
    onSelect(node);
    if (node.has_children && !isOpen) {
      setExpanded((prev) => ({ ...prev, [node.id]: true }));
      ensureLoaded(node.id);
    }
  };

  const children = isOpen ? childrenOf(node.id) : [];
  const isLoadingChildren =
    isOpen && children.length === 0 && node.has_children;

  return (
    <>
      <div
        onClick={handleRowClick}
        className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? "bg-green-50 dark:bg-green-900/20"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
        style={{ paddingLeft: `${12 + depth * 18}px` }}
      >
        {node.has_children ? (
          <button
            type="button"
            onClick={toggleExpand}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <i
              className={`fas fa-chevron-right text-[10px] transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
            ></i>
          </button>
        ) : (
          <span className="w-4 h-4"></span>
        )}

        <i
          className={`${
            depth === 0
              ? "fas fa-folder text-amber-500"
              : "fas fa-folder-open text-amber-400"
          } text-sm`}
        ></i>

        <span
          className={`flex-1 truncate text-xs md:text-sm ${
            depth === 0
              ? "font-semibold text-gray-800 dark:text-gray-200"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {node.name}
        </span>

        {isLoadingChildren && (
          <i className="fas fa-spinner fa-spin text-gray-400 text-xs"></i>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddSubfolder(node.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-green-500 hover:text-green-600 text-xs"
          title="Add subfolder"
        >
          <i className="fas fa-plus-circle"></i>
        </button>

        {isSelected && <i className="fas fa-check text-green-500 text-xs"></i>}
      </div>

      {isOpen &&
        children.map((child) => (
          <FolderRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            expanded={expanded}
            setExpanded={setExpanded}
            childrenOf={childrenOf}
            ensureLoaded={ensureLoaded}
            onAddSubfolder={onAddSubfolder}
          />
        ))}
    </>
  );
};

const EditAgreement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const basePath = location.pathname.split("/")[1] || "admin";

  const {
    shareableUsers = [],
    parties = [],
    currentDocument,
    loading,
    error,
  } = useSelector(
    (state) =>
      state.documents || {
        shareableUsers: [],
        parties: [],
        currentDocument: null,
      },
  );

  // ── Lazy folder tree ──
  const { childrenOf, ensureLoaded, foldersById } = useFolderTree();
  const [expanded, setExpanded] = useState({});
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const folderDropdownRef = useRef(null);

  const [updating, setUpdating] = useState(false);
  const [uploadingToTemp, setUploadingToTemp] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tempFilePath, setTempFilePath] = useState(null);
  const [selectedShareWith, setSelectedShareWith] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [replaceFile, setReplaceFile] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [autoUpdateName, setAutoUpdateName] = useState(true);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Modal states
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderModalParentId, setFolderModalParentId] = useState(null);
  const [refreshParties, setRefreshParties] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    folder_id: "",
    party_id: "",
    expiryDate: "",
  });

  // Human-readable label for the currently selected folder
  const [selectedFolderLabel, setSelectedFolderLabel] = useState(null);

  const getFileNameWithoutExtension = (filename) => {
    if (!filename) return "";
    return filename.replace(/\.[^/.]+$/, "");
  };

  const uploadFileToTemp = async (file) => {
    setUploadingToTemp(true);
    try {
      const result = await dispatch(uploadToTemp(file));
      if (uploadToTemp.fulfilled.match(result)) {
        const { path, filename } = result.payload;
        setTempFilePath(path);

        if (autoUpdateName) {
          const nameWithoutExt =
            filename || getFileNameWithoutExtension(file.name);
          setFormData((prev) => ({ ...prev, name: nameWithoutExt }));
          showToast(`Document name updated to: ${nameWithoutExt}`, "success");
        } else if (!formData.name) {
          const nameWithoutExt =
            filename || getFileNameWithoutExtension(file.name);
          setFormData((prev) => ({ ...prev, name: nameWithoutExt }));
        }

        showToast("File uploaded successfully", "success");
        return true;
      } else {
        showToast(result.payload || "Failed to upload file", "error");
        return false;
      }
    } catch (error) {
      showToast("Failed to upload file", "error");
      return false;
    } finally {
      setUploadingToTemp(false);
    }
  };

  // ── Initial loads ──
  useEffect(() => {
    dispatch(fetchShareableUsers());
    dispatch(fetchParties());
    if (id) {
      dispatch(fetchDocumentById(id));
    }
  }, [dispatch, id]);

  // Load the folder tree whenever the folder dropdown opens
  useEffect(() => {
    if (showFolderDropdown) ensureLoaded(null);
  }, [showFolderDropdown, ensureLoaded]);

  // ── Populate form when currentDocument loads ──
  useEffect(() => {
    if (currentDocument) {
      setFormData({
        name: currentDocument.name || "",
        description: currentDocument.description || "",
        folder_id: currentDocument.folder_id || "",
        party_id: currentDocument.party_id || "",
        expiryDate: currentDocument.expiry_date || "",
      });

      // Seed the folder label from the document's own folder info if present
      if (currentDocument.folder_name || currentDocument.folder_path) {
        setSelectedFolderLabel(
          currentDocument.folder_path || currentDocument.folder_name,
        );
      }

      if (
        currentDocument.shared_users &&
        currentDocument.shared_users.length > 0
      ) {
        setSelectedShareWith(
          currentDocument.shared_users.map((u) => u.name || u.email),
        );
      } else if (
        currentDocument.share_with &&
        currentDocument.share_with.length > 0
      ) {
        setSelectedShareWith(currentDocument.share_with);
      }

      // Build file URL
      if (currentDocument.file_path) {
        let filePath = currentDocument.file_path;
        if (Array.isArray(filePath)) filePath = filePath[0] || "";
        if (typeof filePath === "object" && filePath !== null) {
          filePath = filePath.path || filePath.file_path || "";
        }
        if (typeof filePath === "string" && filePath.trim()) {
          let baseUrl = import.meta.env.VITE_API_URL || "";
          baseUrl = baseUrl.replace("/api", "").replace(/\/$/, "");
          if (!baseUrl) baseUrl = window.location.origin;

          const cleanPath = filePath.replace(/^\/+/, "");
          const encodedPath = cleanPath
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");
          setFileUrl(`${baseUrl}/storage/${encodedPath}`);
        } else {
          setFileUrl(null);
        }
      }
    }
  }, [currentDocument]);

  // ── Once we know the folder_id and the tree is loaded, try to derive its label ──
  // The folder dropdown will lazily fetch levels as the user expands them.
  // For an initial label, we fetch the folder's parent chain if unknown.
  useEffect(() => {
    if (!currentDocument?.folder_id) return;
    if (selectedFolderLabel) return;

    let cancelled = false;
    (async () => {
      const res = await dispatch(fetchFolderById(currentDocument.folder_id));
      if (cancelled) return;
      if (fetchFolderById.fulfilled.match(res)) {
        const folder = res.payload;
        setSelectedFolderLabel(folder.full_path || folder.name || null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDocument?.folder_id]);

  // ── Walk the document's folder ancestors, preload them, and expand them ──
useEffect(() => {
  if (!currentDocument?.folder_id) return;

  let cancelled = false;

  (async () => {
    const chain = []; // root-most first
    let cursorId = currentDocument.folder_id;
    let safety = 0;

    while (cursorId != null && safety < 50) {
      // Prefer the cache; fetch if we don't have it yet
      let folder = foldersById[cursorId] || foldersById[String(cursorId)];

      if (!folder) {
        const res = await dispatch(fetchFolderById(cursorId));
        if (cancelled) return;
        if (fetchFolderById.fulfilled.match(res)) {
          folder = res.payload;
        } else {
          break;
        }
      }

      chain.unshift(folder);
      cursorId = folder.parent_id ?? null;
      safety += 1;
    }

    if (cancelled || chain.length === 0) return;

    // Preload every ancestor's children and mark each as expanded
    const nextExpanded = {};
    chain.forEach((folder) => {
      ensureLoaded(folder.id);
      nextExpanded[folder.id] = true;
    });

    // Also load the target's own children so its siblings are visible
    const target = chain[chain.length - 1];
    if (target?.id) ensureLoaded(target.id);

    // Ensure root is loaded (in case this page was reached cold)
    ensureLoaded(null);

    setExpanded((prev) => ({ ...prev, ...nextExpanded }));
  })();

  return () => {
    cancelled = true;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentDocument?.folder_id, foldersById]);

  useEffect(() => {
    if (refreshParties) {
      dispatch(fetchParties()).then(() => setRefreshParties(false));
      dispatch(fetchShareableUsers());
    }
  }, [refreshParties, dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDateChange = (dateValue) => {
    setFormData((prev) => ({ ...prev, expiryDate: dateValue }));
  };

  const handleChange = (e) => {
    if (e.target.id === "party_id" && e.target.value === "__add_new__") {
      setFormData({ ...formData, party_id: "" });
      setShowPartyModal(true);
      return;
    }
    if (e.target.id === "name") setAutoUpdateName(false);
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 10) {
      showToast("File size must be less than 10MB", "error");
      return;
    }
    setSelectedFile(file);
    setReplaceFile(true);
    setAutoUpdateName(true);
    await uploadFileToTemp(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setTempFilePath(null);
    setReplaceFile(false);
    setAutoUpdateName(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleShareItem = (value) => {
    if (selectedShareWith.includes(value)) {
      setSelectedShareWith(selectedShareWith.filter((item) => item !== value));
    } else {
      setSelectedShareWith([...selectedShareWith, value]);
    }
  };

  const removeSelectedItem = (item) => {
    setSelectedShareWith(selectedShareWith.filter((i) => i !== item));
  };

  const handlePartyAdded = async (newParty) => {
    setRefreshParties(true);
    if (newParty?.id) {
      setTimeout(() => {
        setFormData((prev) => ({ ...prev, party_id: String(newParty.id) }));
        showToast(`Party "${newParty.name}" added and selected`, "success");
      }, 500);
    }
  };

  const handleFolderAdded = (newFolder) => {
    if (newFolder?.id) {
      setFormData((prev) => ({ ...prev, folder_id: newFolder.id }));
      setSelectedFolderLabel(newFolder.full_path || newFolder.name);
    }
    const parentId = newFolder?.parent_id ?? null;
    ensureLoaded(parentId, true);
    if (parentId != null) {
      setExpanded((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  // Close share & folder dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        folderDropdownRef.current &&
        !folderDropdownRef.current.contains(event.target)
      ) {
        setShowFolderDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      showToast("Document name is required", "error");
      return;
    }
    if (selectedShareWith.length === 0) {
      showToast("Please select at least one recipient to share with", "error");
      return;
    }
    if (!formData.folder_id) {
      showToast("Please select a folder", "error");
      return;
    }
    if (replaceFile && !tempFilePath) {
      showToast("Please wait for file upload to complete", "error");
      return;
    }

    setUpdating(true);

    const partiesList = Array.isArray(parties) ? parties : [];
    const usersList = Array.isArray(shareableUsers) ? shareableUsers : [];

    const shareWithIds = selectedShareWith.map((selectedName) => {
      const user = usersList.find((u) => (u.name || u.email) === selectedName);
      const party = partiesList.find((p) => p.name === selectedName);
      return user?.id || party?.id || selectedName;
    });

    const documentData = {
      name: formData.name,
      description: formData.description,
      share_with: shareWithIds,
      folder_id: formData.folder_id,
      type: "agreements",
      party_id: formData.party_id || null,
      expiry_date: formData.expiryDate || null,
    };

    if (replaceFile && tempFilePath) {
      documentData.file_path = tempFilePath;
    }

    const result = await dispatch(
      updateDocument({ id, formData: documentData, file: null }),
    );

    setUpdating(false);

    if (updateDocument.fulfilled.match(result)) {
      showToast(
        `✓ Document "${formData.name}" updated successfully!`,
        "success",
      );
      setTimeout(() => {
        const targetFolderId = formData.folder_id || currentDocument?.folder_id;
        if (targetFolderId) {
          navigate(`/${basePath}/documents?folder=${targetFolderId}`);
        } else {
          navigate(`/${basePath}/documents`);
        }
      }, 1200);
    } else {
      const errorPayload = result.payload;
      let errorMessage = "Failed to update agreement";
      if (errorPayload?.errors) {
        const errors = errorPayload.errors;
        const errorMessages = [];
        if (errors.name) errorMessages.push(`Name: ${errors.name.join(", ")}`);
        if (errors.type) errorMessages.push(`Type: ${errors.type.join(", ")}`);
        if (errors.folder_id)
          errorMessages.push(`Folder: ${errors.folder_id.join(", ")}`);
        if (errors.share_with)
          errorMessages.push(`Share with: ${errors.share_with.join(", ")}`);
        if (errors.file_path)
          errorMessages.push(`File: ${errors.file_path.join(", ")}`);
        if (errors.expiry_date)
          errorMessages.push(`Expiry date: ${errors.expiry_date.join(", ")}`);
        errorMessage =
          errorMessages.length > 0
            ? errorMessages.join(" | ")
            : errorPayload.message || "Validation error occurred";
      } else if (errorPayload?.message) {
        errorMessage = errorPayload.message;
      } else if (typeof errorPayload === "string") {
        errorMessage = errorPayload;
      }
      showToast(errorMessage, "error");
    }
  };

  const openFileInNewTab = () => {
    if (fileUrl) window.open(fileUrl, "_blank");
    else showToast("File URL not available", "error");
  };

  const triggerFileInput = () => fileInputRef.current.click();

  if (loading && !currentDocument) {
    return (
      <div className="w-full overflow-x-hidden px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  const getCurrentFileName = () => {
    if (!currentDocument?.file_path) return "No file attached";
    let filePath = currentDocument.file_path;
    if (Array.isArray(filePath)) filePath = filePath[0] || "";
    if (typeof filePath === "object" && filePath !== null) {
      filePath = filePath.path || filePath.file_path || "";
    }
    if (typeof filePath !== "string") return "Invalid file path";
    const parts = filePath.split("/");
    const fileName = decodeURIComponent(parts[parts.length - 1]);
    if (fileName.startsWith("php") && currentDocument.name) {
      return currentDocument.name;
    }
    return fileName || "No file attached";
  };

  const getFileIcon = (filename) => {
    if (
      !filename ||
      filename === "No file attached" ||
      filename === "Invalid file path"
    ) {
      return "fas fa-file-alt";
    }
    const ext = filename.split(".").pop()?.toLowerCase();
    const iconMap = {
      pdf: "fas fa-file-pdf",
      doc: "fas fa-file-word",
      docx: "fas fa-file-word",
      xls: "fas fa-file-excel",
      xlsx: "fas fa-file-excel",
      jpg: "fas fa-file-image",
      jpeg: "fas fa-file-image",
      png: "fas fa-file-image",
      gif: "fas fa-file-image",
      txt: "fas fa-file-alt",
    };
    return iconMap[ext] || "fas fa-file-alt";
  };

  const currentFileName = getCurrentFileName();
  const fileIcon = getFileIcon(currentFileName);

 const rootFolders = childrenOf(null) || [];
const hasAnyRootFolder = rootFolders.length > 0;

  return (
    <div className="w-full overflow-x-hidden px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to={`/${basePath}/documents`}
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Documents
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">Edit Document</span>
      </div>

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
          <i className="fas fa-edit mr-2"></i> Edit Document
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update document details
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 lg:p-8 shadow-soft">
        <form onSubmit={handleSubmit}>
          {/* Current File Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
              <i className="fas fa-file-alt text-green-500 text-base md:text-lg"></i>
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                Current Document
              </h3>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <i
                    className={`${fileIcon} text-2xl md:text-3xl text-blue-500 flex-shrink-0`}
                  ></i>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                      {currentFileName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Document Name:{" "}
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formData.name || "Not set"}
                      </span>
                    </div>
                    {autoUpdateName && replaceFile && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <i className="fas fa-sync-alt mr-1"></i>
                        Document name will auto-update when file is uploaded
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {fileUrl && (
                    <button
                      type="button"
                      onClick={openFileInNewTab}
                      className="px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <i className="fas fa-external-link-alt text-xs"></i>
                      <span>View</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={uploadingToTemp}
                    className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <i className="fas fa-sync-alt text-xs"></i>
                    <span>{uploadingToTemp ? "Uploading..." : "Replace"}</span>
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingToTemp}
              />

              {selectedFile && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file-pdf text-xl md:text-2xl text-green-500"></i>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        {tempFilePath && (
                          <span className="text-green-600 ml-2">
                            ✓ Uploaded
                          </span>
                        )}
                        {uploadingToTemp && (
                          <span className="text-yellow-600 ml-2">
                            Uploading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={uploadingToTemp}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-red-500 transition-colors self-start sm:self-center disabled:opacity-50"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Document Details */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
              <i className="fas fa-info-circle text-green-500 text-base md:text-lg"></i>
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                Document Details
              </h3>
            </div>

            <div className="space-y-4 md:space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  <i className="fas fa-tag text-green-500 mr-1"></i> Document
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Enter document name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  <i className="fas fa-align-left text-green-500 mr-1"></i>{" "}
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical"
                  placeholder="Enter description about this document"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {/* Share With */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-share-alt text-green-500 mr-1"></i>{" "}
                    Share with <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                    >
                      <div className="flex flex-wrap gap-1 flex-1 max-h-20 overflow-y-auto">
                        {selectedShareWith.length === 0 ? (
                          <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                            Select users
                          </span>
                        ) : (
                          selectedShareWith.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs"
                            >
                              <span className="truncate max-w-[80px] md:max-w-none">
                                {item}
                              </span>
                              <i
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSelectedItem(item);
                                }}
                                className="fas fa-times cursor-pointer hover:text-red-500 text-[8px] md:text-xs"
                              ></i>
                            </span>
                          ))
                        )}
                      </div>
                      <i
                        className={`fas fa-chevron-down text-gray-400 text-xs md:text-sm transition-transform ml-2 flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`}
                      ></i>
                    </div>

                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-soft-lg z-10 max-h-80 overflow-y-auto">
                        {shareableUsers.length > 0 && (
                          <div>
                            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50">
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                Users
                              </span>
                            </div>
                            {shareableUsers.map((user) => (
                              <div
                                key={user.id || user.name}
                                onClick={() =>
                                  toggleShareItem(user.name || user.email)
                                }
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedShareWith.includes(
                                    user.name || user.email,
                                  )}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 md:w-4 md:h-4 accent-green-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                                    {user.name || user.email}
                                  </span>
                                  {user.designation && (
                                    <span className="hidden sm:inline text-[10px] md:text-xs text-gray-500 ml-1">
                                      ({user.designation})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Party */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-building text-green-500 mr-1"></i>{" "}
                    Party
                  </label>
                  <div>
                    <select
                      id="party_id"
                      value={formData.party_id}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none pr-10"
                    >
                      <option value="">Select Party (Optional)</option>
                      {Array.isArray(parties) && parties.length > 0 ? (
                        parties.map((party) => (
                          <option key={party.id} value={party.id}>
                            {party.name}{" "}
                            {party.company_name
                              ? `(${party.company_name})`
                              : ""}
                          </option>
                        ))
                      ) : (
                        <option disabled>No parties available</option>
                      )}
                      <option value="__add_new__">+ Add New Party</option>
                    </select>
                  </div>
                </div>

                {/* Folder — LAZY TREE DROPDOWN */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-folder text-green-500 mr-1"></i> Folder{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={folderDropdownRef}>
                    <div
                      onClick={() => setShowFolderDropdown((v) => !v)}
                      className="flex items-center justify-between w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base cursor-pointer hover:border-green-500 transition-colors"
                    >
                      <span
                        className={
                          formData.folder_id
                            ? "text-gray-800 dark:text-gray-200 truncate"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      >
                        {formData.folder_id ? (
                          <>
                            <i className="fas fa-folder text-amber-500 mr-2"></i>
                            {selectedFolderLabel ||
                              `Folder #${formData.folder_id}`}
                          </>
                        ) : !hasAnyRootFolder ? (
                          "No folders yet — click + to create one"
                        ) : (
                          "Select Folder"
                        )}
                      </span>
                      <i
                        className={`fas fa-chevron-down text-gray-400 text-xs md:text-sm transition-transform ml-2 flex-shrink-0 ${
                          showFolderDropdown ? "rotate-180" : ""
                        }`}
                      ></i>
                    </div>

                    {/* Create folder/subfolder button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderModalParentId(formData.folder_id || null);
                        setShowFolderModal(true);
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      title={
                        formData.folder_id
                          ? "Create subfolder inside selected folder"
                          : "Create new folder"
                      }
                    >
                      <i className="fas fa-plus-circle text-lg"></i>
                    </button>

                    {showFolderDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-soft-lg z-20 max-h-72 overflow-y-auto">
                        {!hasAnyRootFolder ? (
                          <div className="px-4 py-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            <i className="fas fa-folder-open text-2xl mb-2 block text-gray-300"></i>
                            No folders yet. Click the{" "}
                            <span className="text-green-500 font-semibold">
                              +
                            </span>{" "}
                            button to create one.
                          </div>
                        ) : (
                          rootFolders.map((root) => (
                            <FolderRow
                              key={root.id}
                              node={root}
                              depth={0}
                              selectedId={formData.folder_id}
                              onSelect={(node) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  folder_id: node.id,
                                }));
                                setSelectedFolderLabel(
                                  node.full_path || node.name,
                                );
                                if (!node.has_children) {
                                  setShowFolderDropdown(false);
                                }
                              }}
                              expanded={expanded}
                              setExpanded={setExpanded}
                              childrenOf={childrenOf}
                              ensureLoaded={ensureLoaded}
                              onAddSubfolder={(parentId) => {
                                setFolderModalParentId(parentId);
                                setShowFolderModal(true);
                              }}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                    Expiry Date
                  </label>
                  <div className="relative">
                    <DateInput
                      value={formData.expiryDate}
                      onChange={handleDateChange}
                      placeholder="dd/mm/yyyy"
                      type="general"
                    />
                    {formData.expiryDate && (
                      <button
                        type="button"
                        onClick={() => handleDateChange("")}
                        title="Clear expiry date"
                        aria-label="Clear expiry date"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                      >
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Expiry date must be a future date
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to={
                formData.folder_id
                  ? `/${basePath}/documents?folder=${formData.folder_id}`
                  : `/${basePath}/documents`
              }
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <i className="fas fa-times text-xs md:text-sm"></i>
              <span>Cancel</span>
            </Link>
            <button
              type="submit"
              disabled={
                updating ||
                loading ||
                (replaceFile && !tempFilePath && uploadingToTemp)
              }
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
            >
              {updating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>{" "}
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save text-xs md:text-sm"></i>{" "}
                  <span>Update Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <AddPartyModal
        isOpen={showPartyModal}
        onClose={() => setShowPartyModal(false)}
        onPartyAdded={handlePartyAdded}
      />

      <AddFolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setFolderModalParentId(null);
        }}
        onFolderAdded={handleFolderAdded}
        parentId={folderModalParentId}
      />
    </div>
  );
};

export default EditAgreement;
