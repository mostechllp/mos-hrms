import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import {
  addDocumentFolder,
  updateDocumentFolder,
  deleteDocumentFolder,
  fetchDocumentFolders,
} from "@admin/store/slices/documentsSlice";

const FoldersModal = ({ isOpen, onClose, documentCounts = {} }) => {
  const dispatch = useDispatch();
  const { folders = [] } = useSelector((state) => state.documents || {});

  const [newFolderName, setNewFolderName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDocumentFolders());
      // Reset internal state on open
      setNewFolderName("");
      setEditingId(null);
      setEditingName("");
      setConfirmDeleteId(null);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    const name = newFolderName.trim();
    if (!name) {
      showToast("Please enter a folder name", "error");
      return;
    }
    setAdding(true);
    const result = await dispatch(addDocumentFolder({ name }));
    setAdding(false);
    if (addDocumentFolder.fulfilled.match(result)) {
      showToast(`Folder "${name}" added`, "success");
      setNewFolderName("");
    } else {
      showToast(result.payload || "Failed to add folder", "error");
    }
  };

  const startEdit = (folder) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (folder) => {
    const name = editingName.trim();
    if (!name) {
      showToast("Folder name cannot be empty", "error");
      return;
    }
    if (name === folder.name) {
      cancelEdit();
      return;
    }
    setSavingId(folder.id);
    const result = await dispatch(
      updateDocumentFolder({ id: folder.id, name }),
    );
    setSavingId(null);
    if (updateDocumentFolder.fulfilled.match(result)) {
      showToast("Folder updated", "success");
      cancelEdit();
    } else {
      showToast(result.payload || "Failed to update folder", "error");
    }
  };

  const handleDelete = async (folder) => {
    setDeletingId(folder.id);
    const result = await dispatch(deleteDocumentFolder(folder.id));
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (deleteDocumentFolder.fulfilled.match(result)) {
      showToast(`Folder "${folder.name}" deleted`, "success");
    } else {
      showToast(result.payload || "Failed to delete folder", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-folder text-green-500"></i>
            Manage Folders
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Add new folder */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Add New Folder
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Enter folder name"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-60 flex items-center gap-2"
            >
              {adding ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-plus"></i>
              )}
              Add
            </button>
          </div>
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {folders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No folders yet. Add your first folder above.
            </div>
          ) : (
            <ul className="space-y-2">
              {folders.map((folder) => {
                const isEditing = editingId === folder.id;
                const isSaving = savingId === folder.id;
                const isDeleting = deletingId === folder.id;
                const isConfirming = confirmDeleteId === folder.id;
                const count = documentCounts[folder.id] ?? 0;

                return (
                  <li
                    key={folder.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
                  >
                    <i className="fas fa-folder text-green-500"></i>

                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(folder);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:border-green-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(folder)}
                          disabled={isSaving}
                          className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                          title="Save"
                        >
                          {isSaving ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Cancel"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    ) : isConfirming ? (
                      <>
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                          Delete <strong>{folder.name}</strong>? Documents in it
                          will not be deleted.
                        </span>
                        <button
                          onClick={() => handleDelete(folder)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            "Delete"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {folder.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {count} doc{count !== 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={() => startEdit(folder)}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(folder.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoldersModal;