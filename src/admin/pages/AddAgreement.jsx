import { useState, useRef, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/common/Toast";
import {
  fetchDocumentFolders,
  fetchShareableUsers,
  fetchParties,
  uploadDocument,
  uploadToTemp,
} from "../store/slices/documentsSlice";
import { clearError } from "../store/slices/authSlice";
import AddFolderModal from "../components/documents/AddFolderModal";
import DateInput from "../components/common/DateInput";
import useFolderTree from "../hooks/useFolderTree";

// Recursive row for the lazy-loaded folder dropdown
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
    // Auto-expand so children are visible
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

        {/* Loading spinner for children */}
        {isLoadingChildren && (
          <i className="fas fa-spinner fa-spin text-gray-400 text-xs"></i>
        )}

        {/* Subfolder quick-add */}
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

const AddAgreement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const basePath = location.pathname.split("/")[1] || "admin";
  const preselectedFolderId = searchParams.get("folder_id");
  const preselectedFolderPath = searchParams.get("folder_path");

  const {
    shareableUsers = [],
    loading,
    error,
  } = useSelector(
    (state) =>
      state.documents || { shareableUsers: [], loading: false, error: null },
  );

  // ── Lazy folder tree ──
  const { childrenOf, ensureLoaded } = useFolderTree();
  const [expanded, setExpanded] = useState({});

  const [uploading, setUploading] = useState(false);
  const [uploadingToTemp, setUploadingToTemp] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tempFilePath, setTempFilePath] = useState(null);
  const [selectedShareWith, setSelectedShareWith] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const folderDropdownRef = useRef(null);

  // Modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderModalParentId, setFolderModalParentId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    folder_id: preselectedFolderId || null,
    expiry_date: "",
  });

  // ── Initial loads ──
  useEffect(() => {
    dispatch(fetchShareableUsers());
    dispatch(fetchParties());
    // Root folders are auto-loaded by useFolderTree
  }, [dispatch]);

  // Ensure root children are loaded when dropdown opens
  useEffect(() => {
    if (showFolderDropdown) ensureLoaded(null);
  }, [showFolderDropdown, ensureLoaded]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ── Handle preselected folder via ?folder_id ──
  // We can't easily walk ancestors with lazy loading, so we rely on the
  // ?folder_path=... query param passed from Agreements for a nice label,
  // and we attempt a best-effort fetch of the folder's parent chain if
  // the folder isn't already cached.
  const [preselectedFolderLabel, setPreselectedFolderLabel] = useState(
    preselectedFolderPath || null,
  );

  // Try to resolve the selected folder name from cache when possible
  const [selectedFolderLabel, setSelectedFolderLabel] = useState(
    preselectedFolderPath || null,
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const uploadFileToTemp = async (file) => {
    setUploadingToTemp(true);
    try {
      const result = await dispatch(uploadToTemp(file));
      if (uploadToTemp.fulfilled.match(result)) {
        const { path, filename } = result.payload;
        setTempFilePath(path);
        if (!formData.name) {
          const nameWithoutExt = filename || file.name.replace(/\.[^/.]+$/, "");
          setFormData((prev) => ({ ...prev, name: nameWithoutExt }));
        }
        showToast("File uploaded successfully", "success");
        return true;
      } else {
        showToast(result.payload || "Failed to upload file", "error");
        return false;
      }
    } catch (err) {
      showToast("Failed to upload file", "error");
      return false;
    } finally {
      setUploadingToTemp(false);
    }
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
    await uploadFileToTemp(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(
      "border-green-500",
      "bg-green-50",
      "dark:bg-green-900/20",
    );
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(
      "border-green-500",
      "bg-green-50",
      "dark:bg-green-900/20",
    );
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(
      "border-green-500",
      "bg-green-50",
      "dark:bg-green-900/20",
    );
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 10) {
      showToast("File size must be less than 10MB", "error");
      return;
    }
    setSelectedFile(file);
    await uploadFileToTemp(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setTempFilePath(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleShareItem = (user) => {
    const value = user.id;
    if (selectedShareWith.includes(value)) {
      setSelectedShareWith(selectedShareWith.filter((id) => id !== value));
    } else {
      setSelectedShareWith([...selectedShareWith, value]);
    }
  };

  const removeSelectedItem = (id) => {
    setSelectedShareWith(selectedShareWith.filter((i) => i !== id));
  };

  // ── Folder created: select it, refresh parent level ──
  // ── Folder created: select it, refresh parent level ──
  const handleFolderAdded = (newFolder) => {
    if (newFolder?.id) {
      setFormData((prev) => ({ ...prev, folder_id: newFolder.id }));
      setSelectedFolderLabel(newFolder.full_path || newFolder.name);
    }

    const parentId = newFolder?.parent_id ?? null;

    // Force-refresh the parent level so the new subfolder shows
    ensureLoaded(parentId, true);

    // Auto-expand the parent so the user sees the new child
    if (parentId != null) {
      setExpanded((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  // Outside-click handling for both dropdowns
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

  const handleDateChange = (dateValue) => {
    setFormData((prev) => ({ ...prev, expiry_date: dateValue }));
  };

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
    if (!tempFilePath) {
      showToast("Please upload a file first", "error");
      return;
    }

    setUploading(true);

    const documentData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      share_with: selectedShareWith,
      folder_id: formData.folder_id,
      expiry_date: formData.expiry_date,
      file_path: tempFilePath,
    };

    const result = await dispatch(
      uploadDocument({ formData: documentData, file: null }),
    );
    setUploading(false);

    if (uploadDocument.fulfilled.match(result)) {
      showToast(
        `✓ Document "${formData.name}" uploaded successfully!`,
        "success",
      );
      setTimeout(() => {
        const targetFolderId = formData.folder_id;
        if (targetFolderId) {
          navigate(`/${basePath}/documents?folder=${targetFolderId}`);
        } else {
          navigate(`/${basePath}/documents`);
        }
      }, 1200);
    } else {
      showToast(result.payload || "Failed to upload document", "error");
    }
  };

  const rootFolders = childrenOf(null);
  const hasAnyRootFolder = rootFolders.length > 0;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
          <Link
            to={`/${basePath}/documents`}
            className="text-green-500 hover:text-green-600 font-medium"
          >
            Documents
          </Link>
          <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
          <span className="text-gray-500 dark:text-gray-400">
            Upload Document
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
            <i className="fas fa-file-upload mr-2"></i> Upload Document
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 lg:p-8 shadow-soft">
          <form onSubmit={handleSubmit}>
            {/* Upload File Section */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
                <i className="fas fa-cloud-upload-alt text-green-500 text-base md:text-lg"></i>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Upload File
                </h3>
              </div>

              <div
                onClick={() => !uploadingToTemp && fileInputRef.current.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 md:p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all ${
                  uploadingToTemp ? "opacity-50 cursor-wait" : ""
                }`}
              >
                <div className="mb-3 md:mb-4">
                  <i className="fas fa-file-upload text-4xl md:text-6xl text-green-500"></i>
                </div>
                <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  {uploadingToTemp
                    ? "Uploading file..."
                    : "Drag & Drop files here or click to upload"}
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                  All standard document file types such as .pdf .docx .xls can
                  be uploaded with a maximum file size of 10 MB
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
                <div className="mt-3 md:mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                            ✓ Uploaded to temp
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

            {/* Document Details Section */}
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

                {/* Type */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-tag text-green-500 mr-1"></i> Document
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none pr-10"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="organization">Organization</option>
                      <option value="agreements">Agreements</option>
                      <option value="hr">HR</option>
                      <option value="others">Others</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
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
                            Select users to share this document
                          </span>
                        ) : (
                          selectedShareWith.map((id) => {
                            const user = shareableUsers.find(
                              (u) => u.id === id,
                            );
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs"
                              >
                                <span className="truncate max-w-[80px] md:max-w-none">
                                  {user ? user.name || user.email : id}
                                </span>
                                <i
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSelectedItem(id);
                                  }}
                                  className="fas fa-times cursor-pointer hover:text-red-500 text-[8px] md:text-xs"
                                ></i>
                              </span>
                            );
                          })
                        )}
                      </div>
                      <i
                        className={`fas fa-chevron-down text-gray-400 text-xs md:text-sm transition-transform ml-2 flex-shrink-0 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
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
                                key={user.id}
                                onClick={() => toggleShareItem(user)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedShareWith.includes(user.id)}
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

                {/* Folder + Expiry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {/* Custom Folder Dropdown — lazy tree */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-folder text-green-500 mr-1"></i>{" "}
                      Folder <span className="text-red-500">*</span>
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
                                preselectedFolderLabel ||
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
                                  setShowFolderDropdown(false);
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

                  {/* Expiry */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                      Expiry Date
                    </label>
                    <DateInput
                      value={formData.expiry_date}
                      onChange={handleDateChange}
                      placeholder="dd/mm/yyyy"
                      type="general"
                    />
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
                  uploading || loading || !tempFilePath || uploadingToTemp
                }
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>{" "}
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload text-xs md:text-sm"></i>{" "}
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
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

export default AddAgreement;
