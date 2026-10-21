import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader,
  GripVertical,
} from "lucide-react";
import { showToast } from "../../../../components/common/Toast";
import {
  fetchOpportunityStages,
  createOpportunityStage,
  updateOpportunityStage,
  deleteOpportunityStageApi,
  fetchLostReasons,
  createLostReason,
  updateLostReason,
  deleteLostReasonApi,
  fetchWinReasons,
  createWinReason,
  updateWinReason,
  deleteWinReasonApi,
  fetchOpportunityTypes,
  createOpportunityType,
  updateOpportunityType,
  deleteOpportunityTypeApi,
} from "../../../store/slices/crmSettingsSlice";

// ----------------------------------------------------
// Shared UI
// ----------------------------------------------------
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

// ----------------------------------------------------
// Simple inline-editable list (for lost/win reasons, types)
// ----------------------------------------------------
const SimpleList = ({
  items,
  loading,
  submitting,
  onCreate,
  onUpdate,
  onRemove,
  placeholder = "New item",
  emptyMessage = "No items yet.",
  extra,
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
      await onCreate(trimmed);
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
                title="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {item.name}
              </span>
              {extra?.(item)}
              <button
                onClick={() => startEdit(item)}
                disabled={submitting}
                className="p-1.5 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                disabled={submitting}
                className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                title="Delete"
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

// ----------------------------------------------------
// Stage row form (rich: color + name + probability)
// ----------------------------------------------------
const StageRowForm = ({ form, setForm, disabled }) => (
  <>
    <input
      type="color"
      value={form.color || "#6b7280"}
      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
      disabled={disabled}
      title="Color"
      className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer p-0.5"
    />
    <input
      autoFocus
      value={form.name}
      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      disabled={disabled}
      placeholder="Stage name"
      className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
    />
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
        Prob.
      </span>
      <input
        type="number"
        min="0"
        max="100"
        value={form.defaultProbability ?? 0}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            defaultProbability: Number(e.target.value),
          }))
        }
        disabled={disabled}
        className="w-16 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs"
      />
      <span className="text-gray-500 dark:text-gray-400">%</span>
    </div>
  </>
);

// ----------------------------------------------------
// Stages list (custom rich editable list)
// ----------------------------------------------------
const StagesList = ({
  items,
  loading,
  submitting,
  onCreate,
  onUpdate,
  onRemove,
}) => {
  const [editingForm, setEditingForm] = useState(null);
  const [addingForm, setAddingForm] = useState(null);

  const startEdit = (item) =>
    setEditingForm({
      id: item.id,
      name: item.name || "",
      color: item.color || "#6b7280",
      defaultProbability: item.defaultProbability ?? 50,
    });

  const cancelEdit = () => setEditingForm(null);

  const confirmEdit = async () => {
    if (!editingForm) return;
    const trimmed = editingForm.name.trim();
    if (!trimmed) return;
    try {
      await onUpdate(editingForm.id, {
        name: trimmed,
        color: editingForm.color,
        default_probability: editingForm.defaultProbability,
      });
      cancelEdit();
    } catch {
      /* toast handled by caller */
    }
  };

  const startAdd = () =>
    setAddingForm({
      name: "",
      color: "#6b7280",
      defaultProbability: 50,
    });

  const confirmAdd = async () => {
    if (!addingForm) return;
    const trimmed = addingForm.name.trim();
    if (!trimmed) return;
    try {
      await onCreate({
        name: trimmed,
        color: addingForm.color,
        default_probability: addingForm.defaultProbability,
      });
      setAddingForm(null);
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
          No stages yet.
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20"
        >
          {editingForm?.id === item.id ? (
            <>
              <StageRowForm
                form={editingForm}
                setForm={setEditingForm}
                disabled={submitting}
              />
              <button
                onClick={confirmEdit}
                disabled={submitting}
                className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                title="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <GripVertical
                size={14}
                className="text-gray-400 flex-shrink-0 cursor-grab"
              />
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || "#6b7280" }}
              />
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {item.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {item.defaultProbability}% prob.
              </span>
              <button
                onClick={() => startEdit(item)}
                disabled={submitting}
                className="p-1.5 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                disabled={submitting}
                className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      ))}

      {addingForm ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10">
          <StageRowForm
            form={addingForm}
            setForm={setAddingForm}
            disabled={submitting}
          />
          <button
            onClick={confirmAdd}
            disabled={submitting}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
          >
            {submitting && <Loader size={12} className="animate-spin" />}
            Add
          </button>
          <button
            onClick={() => setAddingForm(null)}
            disabled={submitting}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={startAdd}
          disabled={submitting}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 disabled:opacity-50"
        >
          <Plus size={14} /> Add stage
        </button>
      )}
    </div>
  );
};

// ----------------------------------------------------
// Main component
// ----------------------------------------------------
const OpportunitySettings = () => {
  const dispatch = useDispatch();
  const {
    opportunityStages,
    lostReasons,
    winReasons,
    opportunityTypes,
  } = useSelector((s) => s.crmSettings);

  useEffect(() => {
    dispatch(fetchOpportunityStages());
    dispatch(fetchLostReasons());
    dispatch(fetchWinReasons());
    dispatch(fetchOpportunityTypes());
  }, [dispatch]);

  // -------- helpers --------
  const run = async (action, successMsg) => {
    try {
      await dispatch(action).unwrap();
      if (successMsg) showToast(successMsg, "success");
    } catch (err) {
      showToast(err || "Operation failed", "error");
      throw err;
    }
  };

  // -------- Stages --------
  const handleCreateStage = (payload) =>
    run(createOpportunityStage(payload), "Stage created");
  const handleUpdateStage = (id, patch) =>
    run(updateOpportunityStage({ id, data: patch }), "Stage updated");
  const handleRemoveStage = (id) =>
    run(deleteOpportunityStageApi(id), "Stage deleted");

  // -------- Lost reasons --------
  const handleCreateLostReason = (name) =>
    run(createLostReason({ name }), "Lost reason created");
  const handleUpdateLostReason = (id, patch) =>
    run(updateLostReason({ id, data: patch }), "Lost reason updated");
  const handleRemoveLostReason = (id) =>
    run(deleteLostReasonApi(id), "Lost reason deleted");

  // -------- Win reasons --------
  const handleCreateWinReason = (name) =>
    run(createWinReason({ name }), "Win reason created");
  const handleUpdateWinReason = (id, patch) =>
    run(updateWinReason({ id, data: patch }), "Win reason updated");
  const handleRemoveWinReason = (id) =>
    run(deleteWinReasonApi(id), "Win reason deleted");

  // -------- Types --------
  const handleCreateType = (name) =>
    run(createOpportunityType({ name }), "Opportunity type created");
  const handleUpdateType = (id, patch) =>
    run(updateOpportunityType({ id, data: patch }), "Opportunity type updated");
  const handleRemoveType = (id) =>
    run(deleteOpportunityTypeApi(id), "Opportunity type deleted");

  return (
    <div className="space-y-4">
      <SettingsCard
        title="Opportunity Stages"
        description="Stages in the sales pipeline, in order"
      >
        <StagesList
          items={opportunityStages.data}
          loading={opportunityStages.loading}
          submitting={opportunityStages.submitting}
          onCreate={handleCreateStage}
          onUpdate={handleUpdateStage}
          onRemove={handleRemoveStage}
        />
      </SettingsCard>

      <SettingsCard
        title="Lost Reasons"
        description="Reasons to pick from when marking a deal lost"
      >
        <SimpleList
          items={lostReasons.data}
          loading={lostReasons.loading}
          submitting={lostReasons.submitting}
          placeholder="e.g. Budget freeze"
          onCreate={handleCreateLostReason}
          onUpdate={handleUpdateLostReason}
          onRemove={handleRemoveLostReason}
        />
      </SettingsCard>

      <SettingsCard
        title="Win Reasons"
        description="Reasons to pick from when marking a deal won"
      >
        <SimpleList
          items={winReasons.data}
          loading={winReasons.loading}
          submitting={winReasons.submitting}
          placeholder="e.g. Referral trust"
          onCreate={handleCreateWinReason}
          onUpdate={handleUpdateWinReason}
          onRemove={handleRemoveWinReason}
        />
      </SettingsCard>

      <SettingsCard
        title="Opportunity Types"
        description="Classification of opportunities"
      >
        <SimpleList
          items={opportunityTypes.data}
          loading={opportunityTypes.loading}
          submitting={opportunityTypes.submitting}
          placeholder="e.g. Trial"
          onCreate={handleCreateType}
          onUpdate={handleUpdateType}
          onRemove={handleRemoveType}
        />
      </SettingsCard>
    </div>
  );
};

export default OpportunitySettings;