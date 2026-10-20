// src/admin/components/crm/settings/LeadSettings.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Check, X, Loader } from "lucide-react";
import { showToast } from "../../../../components/common/Toast";
import {
  fetchLeadStatuses,
  createLeadStatus,
  updateLeadStatus,
  deleteLeadStatusApi,
  fetchLeadSources,
  createLeadSource,
  updateLeadSource,
  deleteLeadSourceApi,
  fetchLeadPriorities,
  createLeadPriority,
  updateLeadPriority,
  deleteLeadPriorityApi,
  fetchQualificationRules,
  createQualificationRule,
  updateQualificationRule,
  deleteQualificationRuleApi,
  toggleQualificationRuleApi,
} from "../../../store/slices/crmSettingsSlice";

// ----------------------------------------------------
// Shared UI
// ----------------------------------------------------
const SettingsCard = ({ title, description, action, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ----------------------------------------------------
// Editable list with optional rich form
// ----------------------------------------------------
/**
 * Props:
 *  - items, loading, submitting
 *  - onCreate(value) -> Promise          // value is whatever renderForm produces
 *  - onUpdate(id, patch) -> Promise
 *  - onRemove(id) -> Promise
 *  - renderExtra(item) -> ReactNode      // small badge shown in row
 *  - renderForm({ form, setForm }) -> ReactNode   // 👈 optional rich editor
 *      When supplied, `form` is the initial shape used for both add & edit.
 *      If omitted, the list falls back to single-line text editing.
 */
const EditableList = ({
  items,
  loading,
  submitting,
  onCreate,
  onUpdate,
  onRemove,
  renderExtra,
  renderForm,
  initialForm = { name: "" },
  placeholder = "New item",
  emptyMessage = "No items yet.",
}) => {
  // -------- simple mode state (single text field) --------
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // -------- rich mode state (object) --------
  const [editingForm, setEditingForm] = useState(null); // {id, ...fields}
  const [addingForm, setAddingForm] = useState(null); // {..fields}

  const rich = typeof renderForm === "function";

  // ---- START edit ----
  const startEdit = (item) => {
    if (rich) {
      // Prefill with every field we care about
      setEditingForm({
        id: item.id,
        name: item.name || "",
        color: item.color || "#6b7280",
        isDefault: !!item.isDefault,
      });
    } else {
      setEditingId(item.id);
      setEditingValue(item.name);
    }
  };

  // ---- CANCEL edit ----
  const cancelEdit = () => {
    setEditingForm(null);
    setEditingId(null);
    setEditingValue("");
  };

  // ---- CONFIRM edit ----
  const confirmEdit = async () => {
    try {
      if (rich && editingForm) {
        const trimmed = editingForm.name.trim();
        if (!trimmed) return;
        await onUpdate(editingForm.id, {
          name: trimmed,
          color: editingForm.color,
          is_default: editingForm.isDefault,
        });
      } else {
        const trimmed = editingValue.trim();
        if (!trimmed) return;
        await onUpdate(editingId, { name: trimmed });
      }
      cancelEdit();
    } catch {
      /* toast handled by caller */
    }
  };

  // ---- ADD ----
  const startAdd = () => {
    if (rich) {
      setAddingForm({ ...initialForm });
    } else {
      // handled inline in simple mode
    }
  };

  const confirmAdd = async () => {
    try {
      if (rich && addingForm) {
        const trimmed = addingForm.name.trim();
        if (!trimmed) return;
        await onCreate({
          name: trimmed,
          color: addingForm.color,
          is_default: addingForm.isDefault,
        });
        setAddingForm(null);
      } else {
        const trimmed = (editingValue ?? "").trim();
        if (!trimmed) return;
        await onCreate(trimmed);
        setEditingId(null);
        setEditingValue("");
      }
    } catch {
      /* toast handled by caller */
    }
  };

  // ---- ADD cancel ----
  const cancelAdd = () => {
    setAddingForm(null);
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
          {rich && editingForm?.id === item.id ? (
            /* -------- RICH EDIT ROW -------- */
            <>
              {renderForm({
                form: editingForm,
                setForm: setEditingForm,
                disabled: submitting,
              })}
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
          ) : !rich && editingId === item.id ? (
            /* -------- SIMPLE EDIT ROW -------- */
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
            /* -------- VIEW ROW -------- */
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {item.name}
              </span>
              {renderExtra?.(item)}
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

      {/* -------- ADD ROW -------- */}
      {rich && addingForm ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10">
          {renderForm({
            form: addingForm,
            setForm: setAddingForm,
            disabled: submitting,
          })}
          <button
            onClick={confirmAdd}
            disabled={submitting}
            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
          >
            {submitting && <Loader size={12} className="animate-spin" />}
            Add
          </button>
          <button
            onClick={cancelAdd}
            disabled={submitting}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : !rich &&
        editingId ===
          "__new__" ? null : null // not used — kept for symmetry
      }

      {/* Simple-mode "adding" state is handled by a small inline form below */}
      {!rich && (
        <SimpleAddRow
          adding={editingId === "__new__"}
          placeholder={placeholder}
          submitting={submitting}
          onStart={() => {
            setEditingId("__new__");
            setEditingValue("");
          }}
          onChange={setEditingValue}
          value={editingValue}
          onSubmit={async () => {
            const trimmed = editingValue.trim();
            if (!trimmed) return;
            try {
              await onCreate(trimmed);
              setEditingId(null);
              setEditingValue("");
            } catch {
              /* toast handled by caller */
            }
          }}
          onCancel={() => {
            setEditingId(null);
            setEditingValue("");
          }}
        />
      )}

      {rich && !addingForm && (
        <button
          onClick={startAdd}
          disabled={submitting}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 disabled:opacity-50"
        >
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
};

// Small helper for simple-mode add row (keeps main component readable)
const SimpleAddRow = ({
  adding,
  placeholder,
  submitting,
  onStart,
  onChange,
  value,
  onSubmit,
  onCancel,
}) => {
  if (!adding) {
    return (
      <button
        onClick={onStart}
        disabled={submitting}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 disabled:opacity-50"
      >
        <Plus size={14} /> Add
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        disabled={submitting}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
      >
        {submitting && <Loader size={12} className="animate-spin" />}
        Add
      </button>
      <button
        onClick={onCancel}
        disabled={submitting}
        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
};

// ----------------------------------------------------
// Status row form — rich editor for the Lead Statuses card
// ----------------------------------------------------
// ----------------------------------------------------
// Rich row form — color + name (+ optional default checkbox)
// ----------------------------------------------------
const ColorRowForm = ({ form, setForm, disabled, showDefault = false }) => (
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
      placeholder="Name"
      className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
    />
    {showDefault && (
      <label
        className={`flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap ${
          disabled ? "opacity-60" : "cursor-pointer"
        } text-gray-600 dark:text-gray-400`}
        title="Mark as the default status for new leads"
      >
        <input
          type="checkbox"
          checked={!!form.isDefault}
          onChange={(e) =>
            setForm((f) => ({ ...f, isDefault: e.target.checked }))
          }
          disabled={disabled}
          className="accent-blue-500"
        />
        Default
      </label>
    )}
  </>
);

// ----------------------------------------------------
// Main component
// ----------------------------------------------------
const LeadSettings = () => {
  const dispatch = useDispatch();
  const { leadStatuses, leadSources, leadPriorities, qualificationRules } =
    useSelector((s) => s.crmSettings);

  useEffect(() => {
    dispatch(fetchLeadStatuses());
    dispatch(fetchLeadSources());
    dispatch(fetchLeadPriorities());
    dispatch(fetchQualificationRules());
  }, [dispatch]);

  // -------- Statuses --------
  // Payload accepts either a bare string (old flow) or a full object.
  const handleCreateStatus = async (payload) => {
    const body =
      typeof payload === "string"
        ? { name: payload, color: "#6b7280", is_default: false }
        : {
            name: payload.name,
            color: payload.color || "#6b7280",
            is_default: !!payload.is_default,
          };
    try {
      await dispatch(createLeadStatus(body)).unwrap();
      showToast("Lead status created", "success");
    } catch (err) {
      showToast(err || "Failed to create status", "error");
      throw err;
    }
  };

  const handleUpdateStatus = async (id, patch) => {
    try {
      await dispatch(updateLeadStatus({ id, data: patch })).unwrap();
      showToast("Lead status updated", "success");
    } catch (err) {
      showToast(err || "Failed to update status", "error");
      throw err;
    }
  };

  const handleRemoveStatus = async (id) => {
    try {
      await dispatch(deleteLeadStatusApi(id)).unwrap();
      showToast("Lead status deleted", "success");
    } catch (err) {
      showToast(err || "Failed to delete status", "error");
    }
  };

  // -------- Sources --------
  // -------- Sources --------
const handleCreateSource = async (payload) => {
  const name = (typeof payload === "string" ? payload : payload?.name || "").trim();
  if (!name) return;
  try {
    await dispatch(createLeadSource({ name })).unwrap();
    showToast("Lead source created", "success");
  } catch (err) {
    showToast(err || "Failed to create source", "error");
    throw err;
  }
};

const handleUpdateSource = async (id, patch) => {
  const name = (patch?.name || "").trim();
  if (!name) return;
  try {
    await dispatch(updateLeadSource({ id, data: { name } })).unwrap();
    showToast("Lead source updated", "success");
  } catch (err) {
    showToast(err || "Failed to update source", "error");
    throw err;
  }
};

  const handleRemoveSource = async (id) => {
    try {
      await dispatch(deleteLeadSourceApi(id)).unwrap();
      showToast("Lead source deleted", "success");
    } catch (err) {
      showToast(err || "Failed to delete source", "error");
    }
  };

  // -------- Priorities --------
  const handleCreatePriority = async (payload) => {
    const body =
      typeof payload === "string"
        ? { name: payload, color: "#6b7280" }
        : {
            name: payload.name,
            color: payload.color || "#6b7280",
          };

    try {
      await dispatch(createLeadPriority(body)).unwrap();
      showToast("Lead priority created", "success");
    } catch (err) {
      showToast(err || "Failed to create priority", "error");
      throw err;
    }
  };

  const handleUpdatePriority = async (id, patch) => {
    // patch from rich mode is { name, color, is_default? } — the API
    // ignores is_default for priorities, so it's fine either way.
    const body = { name: patch.name, color: patch.color };
    try {
      await dispatch(updateLeadPriority({ id, data: body })).unwrap();
      showToast("Lead priority updated", "success");
    } catch (err) {
      showToast(err || "Failed to update priority", "error");
      throw err;
    }
  };

  const handleRemovePriority = async (id) => {
    try {
      await dispatch(deleteLeadPriorityApi(id)).unwrap();
      showToast("Lead priority deleted", "success");
    } catch (err) {
      showToast(err || "Failed to delete priority", "error");
    }
  };

  // -------- Qualification rules --------
  const [addingRule, setAddingRule] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editingRuleText, setEditingRuleText] = useState("");

  const handleAddRule = async () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    try {
      await dispatch(
        createQualificationRule({ rule: trimmed, enabled: true }),
      ).unwrap();
      showToast("Rule added", "success");
      setNewRule("");
      setAddingRule(false);
    } catch (err) {
      showToast(err || "Failed to add rule", "error");
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      await dispatch(
        toggleQualificationRuleApi({ id: rule.id, enabled: !rule.enabled }),
      ).unwrap();
    } catch (err) {
      showToast(err || "Failed to toggle rule", "error");
    }
  };

  const handleRemoveRule = async (id) => {
    try {
      await dispatch(deleteQualificationRuleApi(id)).unwrap();
      showToast("Rule deleted", "success");
    } catch (err) {
      showToast(err || "Failed to delete rule", "error");
    }
  };

  const handleRenameRule = async (id, newText) => {
    try {
      await dispatch(
        updateQualificationRule({ id, data: { rule: newText } }),
      ).unwrap();
      showToast("Rule updated", "success");
    } catch (err) {
      showToast(err || "Failed to update rule", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* -------- Lead Statuses (rich row form) -------- */}
      <SettingsCard
        title="Lead Statuses"
        description="Statuses a lead can be in through its lifecycle"
      >
        <EditableList
          items={leadStatuses.data}
          loading={leadStatuses.loading}
          submitting={leadStatuses.submitting}
          onCreate={handleCreateStatus}
          onUpdate={handleUpdateStatus}
          onRemove={handleRemoveStatus}
          renderForm={(props) => <ColorRowForm {...props} showDefault />}
          renderExtra={(item) => (
            <>
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || "#6b7280" }}
              />
              {item.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Default
                </span>
              )}
            </>
          )}
        />
      </SettingsCard>

      {/* -------- Lead Sources (simple) -------- */}
      <SettingsCard
        title="Lead Sources"
        description="Where your leads come from"
      >
        <EditableList
          items={leadSources.data}
          loading={leadSources.loading}
          submitting={leadSources.submitting}
          placeholder="e.g. Webinar"
          onCreate={handleCreateSource}
          onUpdate={handleUpdateSource}
          onRemove={handleRemoveSource}
        />
      </SettingsCard>

      {/* -------- Lead Priorities (simple) -------- */}
      <SettingsCard
        title="Lead Priorities"
        description="Priority levels used to triage leads"
      >
        <EditableList
          items={leadPriorities.data}
          loading={leadPriorities.loading}
          submitting={leadPriorities.submitting}
          onCreate={handleCreatePriority}
          onUpdate={handleUpdatePriority}
          onRemove={handleRemovePriority}
          renderForm={(props) => <ColorRowForm {...props} />}
          initialForm={{
            name: "",
            color: "#F59E0B", // Medium — a sensible default
            isDefault: false,
          }}
          renderExtra={(item) => (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color || "#6b7280" }}
            />
          )}
        />
      </SettingsCard>

      {/* -------- Qualification rules (unchanged) -------- */}
      <SettingsCard
        title="Lead Qualification Rules"
        description="Criteria that determine when a lead becomes Qualified"
      >
        {qualificationRules.loading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader size={14} className="animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {qualificationRules.data.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No rules defined yet.
                </p>
              )}
              {qualificationRules.data.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60"
                >
                  <input
                    type="checkbox"
                    checked={!!r.enabled}
                    onChange={() => handleToggleRule(r)}
                    disabled={qualificationRules.submitting}
                    className="accent-blue-500"
                  />
                  {editingRuleId === r.id ? (
                    <>
                      <input
                        autoFocus
                        value={editingRuleText}
                        onChange={(e) => setEditingRuleText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameRule(r.id, editingRuleText.trim());
                            setEditingRuleId(null);
                          }
                          if (e.key === "Escape") setEditingRuleId(null);
                        }}
                        className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-blue-400 rounded text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          handleRenameRule(r.id, editingRuleText.trim());
                          setEditingRuleId(null);
                        }}
                        className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingRuleId(null)}
                        className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                        {r.rule}
                      </span>
                      <button
                        onClick={() => {
                          setEditingRuleId(r.id);
                          setEditingRuleText(r.rule);
                        }}
                        className="p-1.5 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveRule(r.id)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {addingRule ? (
              <div className="flex items-center gap-2 mt-3">
                <input
                  autoFocus
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddRule();
                    if (e.key === "Escape") {
                      setAddingRule(false);
                      setNewRule("");
                    }
                  }}
                  placeholder="e.g. Budget confirmed"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddRule}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingRule(false);
                    setNewRule("");
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingRule(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-3"
              >
                <Plus size={14} /> Add rule
              </button>
            )}
          </>
        )}
      </SettingsCard>
    </div>
  );
};

export default LeadSettings;
