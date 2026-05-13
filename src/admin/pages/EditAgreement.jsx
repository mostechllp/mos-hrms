import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/common/Toast";
import {
  fetchDocumentFolders,
  fetchShareableUsers,
  fetchParties,
  fetchDocumentById,
  updateDocument,
} from "../store/slices/documentsSlice";
import { clearError } from "../store/slices/authSlice";
import AddFolderModal from "../components/documents/AddFolderModal";
import AddPartyModal from "../components/documents/AddPartyModal";

const EditAgreement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const {
    shareableUsers = [],
    folders = [],
    parties = [],
    currentDocument,
    loading,
    error,
  } = useSelector(
    (state) =>
      state.documents || { shareableUsers: [], folders: [], parties: [], currentDocument: null },
  );
  const [updating, setUpdating] = useState(false);
  const [selectedShareWith, setSelectedShareWith] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Modal states
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [refreshParties, setRefreshParties] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    folder_id: "",
    party_id: "",
    expiryDate: "",
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchShareableUsers());
    dispatch(fetchDocumentFolders());
    dispatch(fetchParties());
    if (id) {
      dispatch(fetchDocumentById(id));
    }
  }, [dispatch, id]);

  // Set form data when currentDocument is loaded
  useEffect(() => {
    if (currentDocument) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: currentDocument.name || "",
        description: currentDocument.description || "",
        folder_id: currentDocument.folder_id || currentDocument.folder || "",
        party_id: currentDocument.party_id || "",
        expiryDate: currentDocument.expiry_date || "",
      });

      // Set selected share with users/parties
      if (currentDocument.shared_users && currentDocument.shared_users.length > 0) {
        const shareNames = currentDocument.shared_users.map(user => user.name);
        setSelectedShareWith(shareNames);
      } else if (currentDocument.share_with && currentDocument.share_with.length > 0) {
        setSelectedShareWith(currentDocument.share_with);
      }
    }
  }, [currentDocument]);

  // Refresh parties when refreshParties flag changes
  useEffect(() => {
    if (refreshParties) {
      dispatch(fetchParties()).then(() => {
        setRefreshParties(false);
      });
      dispatch(fetchShareableUsers());
    }
  }, [refreshParties, dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    if (e.target.id === "party_id" && e.target.value === "__add_new__") {
      setFormData({ ...formData, party_id: "" });
      setShowPartyModal(true);
      return;
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
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
    console.log("Party added callback received:", newParty);
    setRefreshParties(true);
    if (newParty && newParty.id) {
      setTimeout(() => {
        setFormData((prev) => ({ ...prev, party_id: String(newParty.id) }));
        showToast(`Party "${newParty.name}" added and selected`, "success");
      }, 500);
    }
  };

  const handleFolderAdded = async (newFolder) => {
    await dispatch(fetchDocumentFolders());
    if (newFolder && newFolder.id) {
      setFormData({ ...formData, folder_id: String(newFolder.id) });
      showToast(`Folder "${newFolder.name}" added and selected`, "success");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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
      party_id: formData.party_id,
      expiry_date: formData.expiryDate,
    };

    const result = await dispatch(
      updateDocument({ id: id, formData: documentData, file: null })
    );

    setUpdating(false);

    if (updateDocument.fulfilled.match(result)) {
      showToast(
        `✓ Document "${formData.name}" updated successfully!`,
        "success",
      );
      setTimeout(() => {
        navigate("/admin/agreements");
      }, 1200);
    } else {
      showToast(result.payload || "Failed to update agreement", "error");
    }
  };

  if (loading && !currentDocument) {
    return (
      <div className="w-full overflow-x-hidden px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Get selected folder name
  const selectedFolder = folders.find(f => String(f.id) === String(formData.folder_id));

  return (
    <div className="w-full overflow-x-hidden px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to="/admin/agreements"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Agreements
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">
          Edit Agreement
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
          <i className="fas fa-edit mr-2"></i> Edit Agreement
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update agreement details
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 lg:p-8 shadow-soft">
        <form onSubmit={handleSubmit}>
          {/* Document Details Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-4 md:mb-6">
              <i className="fas fa-info-circle text-green-500 text-base md:text-lg"></i>
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                Agreement Details
              </h3>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  <i className="fas fa-tag text-green-500 mr-1"></i> Agreement
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Enter agreement name"
                  required
                />
              </div>

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

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  <i className="fas fa-share-alt text-green-500 mr-1"></i> Share
                  with <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <div className="flex flex-wrap gap-1 flex-1 max-h-20 overflow-y-auto">
                      {selectedShareWith.length === 0 ? (
                        <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                          Select users or parties...
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
                      {/* Shareable Users Section */}
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
                              onClick={() => toggleShareItem(user.name || user.email)}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedShareWith.includes(user.name || user.email)}
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

                      {/* Parties Section */}
                      {parties.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              Parties
                            </span>
                          </div>
                          {parties.map((party) => (
                            <div
                              key={party.id}
                              onClick={() => toggleShareItem(party.name)}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedShareWith.includes(party.name)}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 md:w-4 md:h-4 accent-green-500"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                                  {party.name}
                                </span>
                                {party.company_name && (
                                  <span className="hidden sm:inline text-[10px] md:text-xs text-gray-500 ml-1">
                                    ({party.company_name})
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

              {/* Party Field */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  <i className="fas fa-building text-green-500 mr-1"></i> Party
                </label>
                <div className="relative">
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
                          {party.company_name ? `(${party.company_name})` : ""}
                        </option>
                      ))
                    ) : (
                      <option disabled>No parties available</option>
                    )}
                    <option value="__add_new__">+ Add New Party</option>
                  </select>
                </div>

                {/* Selected Party Details */}
                {formData.party_id &&
                  formData.party_id !== "__add_new__" &&
                  (() => {
                    const selectedParty = Array.isArray(parties)
                      ? parties.find(
                          (p) => String(p.id) === String(formData.party_id),
                        )
                      : null;
                    return selectedParty ? (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-building text-green-500 text-sm"></i>
                            <div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {selectedParty.name}
                              </div>
                              {selectedParty.company_name && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {selectedParty.company_name}
                                </div>
                              )}
                              {selectedParty.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  <i className="fas fa-envelope mr-1"></i>
                                  {selectedParty.email}
                                </div>
                              )}
                              {selectedParty.phone && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  <i className="fas fa-phone mr-1"></i>
                                  {selectedParty.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, party_id: "" })
                            }
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-folder text-green-500 mr-1"></i> Folder{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="folder_id"
                      value={formData.folder_id}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none pr-10"
                      required
                    >
                      <option value="">Select Folder</option>
                      {folders.length > 0 ? (
                        folders.map((folder) => (
                          <option
                            key={folder.id}
                            value={folder.id}
                          >
                            {folder.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No folders available</option>
                      )}
                    </select>

                    {/* Add Folder Button */}
                    <button
                      type="button"
                      onClick={() => setShowFolderModal(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      title="Create New Folder"
                    >
                      <i className="fas fa-plus-circle text-lg"></i>
                    </button>
                  </div>
                  {selectedFolder && (
                    <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 mt-1">
                      <i className="fas fa-info-circle mr-1"></i>
                      Current folder: {selectedFolder.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/admin/agreements"
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <i className="fas fa-times text-xs md:text-sm"></i>
              <span>Cancel</span>
            </Link>
            <button
              type="submit"
              disabled={updating || loading}
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
                  <span>Update Agreement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <AddPartyModal
        isOpen={showPartyModal}
        onClose={() => {
          setShowPartyModal(false);
        }}
        onPartyAdded={handlePartyAdded}
      />

      <AddFolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onFolderAdded={handleFolderAdded}
      />
    </div>
  );
};

export default EditAgreement;