import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Check, X, Loader } from "lucide-react";
import { showToast } from "../../../../components/common/Toast";
import {
  fetchCustomerCategories,
  createCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategoryApi,
  fetchCustomerIndustries,
  createCustomerIndustry,
  updateCustomerIndustry,
  deleteCustomerIndustryApi,
  fetchCustomerStatuses,
  createCustomerStatus,
  updateCustomerStatus,
  deleteCustomerStatusApi,
  fetchCustomerTypes,
  createCustomerType,
  updateCustomerType,
  deleteCustomerTypeApi,
} from "../../../store/slices/crmSettingsSlice";

const SettingsCard = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
    {children}
  </div>
);

const SimpleList = ({
  items,
  loading,
  submitting,
  onCreate,
  onUpdate,
  onRemove,
  placeholder = "New item",
  emptyMessage = "No items yet.",
  renderExtra,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingValue(item.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };
  const confirmEdit = async () => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    try {
      await onUpdate(editingId, { name: trimmed });
      cancelEdit();
    } catch {
      /* toast handled by caller */
    }
  };

  const handleAdd = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    try {
      await onCreate({ name: trimmed });
      setNewValue("");
      setAdding(false);
    } catch {
      /* toast handled by caller */
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Loader size={14} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          {emptyMessage}
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20"
        >
          {editingId === item.id ? (
            <>
              <input
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                disabled={submitting}
                className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-blue-400 rounded text-sm focus:outline-none"
              />
              <button
                onClick={confirmEdit}
                disabled={submitting}
                className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
              >
                <Check size={14} />
              </button>
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {item.name}
              </span>
              {renderExtra?.(item)}
              <button
                onClick={() => startEdit(item)}
                disabled={submitting}
                className="p-1.5 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                disabled={submitting}
                className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setNewValue("");
              }
            }}
            disabled={submitting}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
          >
            {submitting && <Loader size={12} className="animate-spin" />}
            Add
          </button>
          <button
            onClick={() => {
              setAdding(false);
              setNewValue("");
            }}
            disabled={submitting}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          disabled={submitting}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 disabled:opacity-50"
        >
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
};

const CustomerSettings = () => {
  const dispatch = useDispatch();
  const {
    customerCategories,
    customerIndustries,
    customerStatuses,
    customerTypes,
  } = useSelector((s) => s.crmSettings);

  useEffect(() => {
    dispatch(fetchCustomerCategories());
    dispatch(fetchCustomerIndustries());
    dispatch(fetchCustomerStatuses());
    dispatch(fetchCustomerTypes());
  }, [dispatch]);

  const run = async (action, successMsg) => {
    try {
      await dispatch(action).unwrap();
      if (successMsg) showToast(successMsg, "success");
    } catch (err) {
      showToast(err || "Operation failed", "error");
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard title="Customer Categories">
        <SimpleList
          items={customerCategories.data}
          loading={customerCategories.loading}
          submitting={customerCategories.submitting}
          placeholder="e.g. Reseller"
          onCreate={(p) => run(createCustomerCategory(p), "Category created")}
          onUpdate={(id, p) => run(updateCustomerCategory({ id, data: p }), "Category updated")}
          onRemove={(id) => run(deleteCustomerCategoryApi(id), "Category deleted")}
        />
      </SettingsCard>

      <SettingsCard title="Industry List">
        <SimpleList
          items={customerIndustries.data}
          loading={customerIndustries.loading}
          submitting={customerIndustries.submitting}
          placeholder="e.g. Hospitality"
          onCreate={(p) => run(createCustomerIndustry(p), "Industry created")}
          onUpdate={(id, p) => run(updateCustomerIndustry({ id, data: p }), "Industry updated")}
          onRemove={(id) => run(deleteCustomerIndustryApi(id), "Industry deleted")}
        />
      </SettingsCard>

      <SettingsCard title="Customer Statuses">
        <SimpleList
          items={customerStatuses.data}
          loading={customerStatuses.loading}
          submitting={customerStatuses.submitting}
          placeholder="e.g. Churned"
          onCreate={(p) => run(createCustomerStatus(p), "Status created")}
          onUpdate={(id, p) => run(updateCustomerStatus({ id, data: p }), "Status updated")}
          onRemove={(id) => run(deleteCustomerStatusApi(id), "Status deleted")}
          renderExtra={(item) => (
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || "#6b7280" }} />
          )}
        />
      </SettingsCard>

      <SettingsCard title="Customer Types">
        <SimpleList
          items={customerTypes.data}
          loading={customerTypes.loading}
          submitting={customerTypes.submitting}
          placeholder="e.g. Government"
          onCreate={(p) => run(createCustomerType(p), "Type created")}
          onUpdate={(id, p) => run(updateCustomerType({ id, data: p }), "Type updated")}
          onRemove={(id) => run(deleteCustomerTypeApi(id), "Type deleted")}
        />
      </SettingsCard>
    </div>
  );
};

export default CustomerSettings;