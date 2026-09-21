import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../../components/common/Toast";
import {
  addDocumentFolder,
  updateDocumentFolder,
} from "../../store/slices/documentsSlice";

const AddFolderModal = ({
  isOpen,
  onClose,
  onFolderAdded,
  editingFolder = null,
  parentId = null, // NEW: parent folder id when creating a subfolder
}) => {
  const dispatch = useDispatch();
  const [folderName, setFolderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isEditing = !!editingFolder;
  const isSubfolder = !isEditing && parentId != null;

  useEffect(() => {
    if (isOpen) {
      if (editingFolder) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFolderName(editingFolder.name || "");
      } else {
        setFolderName("");
      }
    }
  }, [isOpen, editingFolder]);

  const handleSubmit = async () => {
    if (!folderName.trim()) {
      showToast("Folder name is required", "error");
      return;
    }

    setIsProcessing(true);

    try {
      let result;

      if (isEditing) {
        // Update existing folder — keep its parent_id unchanged
        result = await dispatch(
          updateDocumentFolder({
            id: editingFolder.id,
            name: folderName.trim(),
            parent_id: editingFolder.parent_id ?? null,
          }),
        );

        if (updateDocumentFolder.fulfilled.match(result)) {
          showToast("Folder updated successfully", "success");
          onFolderAdded?.(result.payload);
          onClose();
          setFolderName("");
        } else {
          showToast(result.payload || "Failed to update folder", "error");
        }
      } else {
        // Create new folder OR subfolder
        result = await dispatch(
          addDocumentFolder({
            name: folderName.trim(),
            parent_id: parentId ?? null,
          }),
        );

        if (addDocumentFolder.fulfilled.match(result)) {
          showToast(
            isSubfolder
              ? "Subfolder created successfully"
              : "Folder created successfully",
            "success",
          );
          onFolderAdded?.(result.payload);
          onClose();
          setFolderName("");
        } else {
          showToast(result.payload || "Failed to create folder", "error");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showToast(
        isEditing ? "Failed to update folder" : "Failed to create folder",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Dynamic labels / icons based on mode
  const title = isEditing
    ? "Edit Folder"
    : isSubfolder
      ? "Create Subfolder"
      : "Create New Folder";

  const titleIcon = isEditing
    ? "fas fa-edit"
    : isSubfolder
      ? "fas fa-folder-tree"
      : "fas fa-folder-plus";

  const submitIcon = isEditing ? "fas fa-save" : isSubfolder
    ? "fas fa-folder-tree"
    : "fas fa-folder-plus";

  const submitLabel = isEditing
    ? "Update Folder"
    : isSubfolder
      ? "Create Subfolder"
      : "Create Folder";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-[95%] md:w-full p-6 shadow-soft-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            <i className={`${titleIcon} text-green-500 mr-2`}></i>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Enter folder name"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>{" "}
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <i className={submitIcon}></i> {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFolderModal;