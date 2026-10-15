// src/admin/components/crm/CategoryModal.jsx
import { useEffect, useState } from "react";
import {
  X, Loader, Plus, Pencil, Trash2, Layers, Search, Save, Check,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/common/Toast";
import {
  fetchProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategoryApi,
} from "../../store/slices/productSlice";

const emptyForm = () => ({
  id: null,
  name: "",
  description: "",
  status: "Active",
});

const CategoryModal = ({ isOpen, onClose, onChanged }) => {
  const dispatch = useDispatch();

  const {
    categories = [],
    categoriesLoading,
    categorySubmitting,
  } = useSelector((s) => s.products);

  const [searchInput, setSearchInput] = useState("");
  const [editing, setEditing] = useState(null); // null | { id?, name, description, status }
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load on open
  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchProductCategories());
  }, [isOpen, dispatch]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      dispatch(fetchProductCategories({ search: searchInput }));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEditing(null);
      setSearchInput("");
      setConfirmDelete(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startCreate = () => {
    setEditing(emptyForm());
  };

  const startEdit = (cat) => {
    setEditing({
      id: cat.id,
      name: cat.name || cat.category_name || "",
      description: cat.description || "",
      status: cat.status || "Active",
    });
  };

  const cancelEdit = () => setEditing(null);

  const handleSave = async () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      if (editing.id) {
        await dispatch(
          updateProductCategory({
            id: editing.id,
            data: {
              name,
              description: editing.description,
              status: editing.status,
            },
          }),
        ).unwrap();
        showToast("Category updated", "success");
      } else {
        await dispatch(
          createProductCategory({
            name,
            description: editing.description,
            status: editing.status,
          }),
        ).unwrap();
        showToast("Category created", "success");
      }

      setEditing(null);

      // refresh parent options so the product modal has the new list
      onChanged?.();

      // and refresh local list
      dispatch(fetchProductCategories({ search: searchInput }));
    } catch (err) {
      showToast(err || "Failed to save category", "error");
    }
  };

  const handleDelete = async (cat) => {
    try {
      await dispatch(deleteProductCategoryApi(cat.id)).unwrap();
      showToast("Category deleted", "success");
      setConfirmDelete(null);
      onChanged?.();
      dispatch(fetchProductCategories({ search: searchInput }));
    } catch (err) {
      showToast(err || "Failed to delete category", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !categorySubmitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Manage Categories
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Organize your product / service catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={categorySubmitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={startCreate}
            disabled={!!editing}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={14} /> New Category
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Inline edit form */}
          {editing && (
            <div className="p-4 bg-blue-50/60 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/40 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoFocus
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="e.g. Human Resources"
                    disabled={categorySubmitting}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Status
                  </label>
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value })
                    }
                    disabled={categorySubmitting}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Optional"
                  disabled={categorySubmitting}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  disabled={categorySubmitting}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={categorySubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {categorySubmitting ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {editing.id ? "Update" : "Create"}
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {categoriesLoading && !editing ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500 dark:text-gray-400 text-sm">
              <Loader size={14} className="animate-spin" /> Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-10 text-center">
              <Layers
                size={36}
                className="mx-auto text-gray-300 dark:text-gray-600"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                No categories yet
              </p>
              <button
                onClick={startCreate}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold"
              >
                <Plus size={13} /> Create the first one
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {categories.map((cat) => {
                const name = cat.name || cat.category_name || "—";
                const count = cat.products_count ?? cat.count ?? null;
                const status = cat.status || "Active";
                return (
                  <li
                    key={cat.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {name}
                        </p>
                        {count !== null && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {count} items
                          </span>
                        )}
                        {status === "Inactive" && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        disabled={!!editing}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 disabled:opacity-40"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(cat)}
                        disabled={!!editing}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={categorySubmitting}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete confirmation (inline mini-modal) */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-700 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Delete Category
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                "{confirmDelete.name || confirmDelete.category_name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={categorySubmitting}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={categorySubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {categorySubmitting ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryModal;