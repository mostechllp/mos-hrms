// src/admin/components/crm/settings/ActivitySettings.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Check, X, Loader, Save } from "lucide-react";
import { showToast } from "../../../../components/common/Toast";
import {
  fetchActivityTypes, createActivityType, updateActivityType, deleteActivityTypeApi,
  fetchReminderOptions, createReminderOption, updateReminderOption, deleteReminderOptionApi,
  fetchActivityPriorities, createActivityPriority, updateActivityPriority, deleteActivityPriorityApi,
  fetchActivityDuration, updateActivityDuration
} from "../../../store/slices/crmSettingsSlice";

const SettingsCard = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

// ----------------------------------------------------
// Generic Editable List (Supports Simple & Rich Modes)
// ----------------------------------------------------
const SimpleList = ({ 
  items, 
  loading, 
  submitting, 
  onCreate, 
  onUpdate, 
  onRemove, 
  placeholder, 
  emptyMessage, 
  renderExtra,
  renderForm, // 👈 If provided, enables "rich" mode (e.g. color picker)
}) => {
  // Simple mode state
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  // Rich mode state
  const [editingForm, setEditingForm] = useState(null);
  const [addingForm, setAddingForm] = useState(null);

  const rich = typeof renderForm === "function";

  const startEdit = (item) => {
    if (rich) {
      setEditingForm({ id: item.id, name: item.name || "", color: item.color || "#6b7280" });
    } else {
      setEditingId(item.id);
      setEditingValue(item.name);
    }
  };

  const cancelEdit = () => {
    setEditingForm(null);
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = async () => {
    try {
      if (rich && editingForm) {
        const trimmed = editingForm.name.trim();
        if (!trimmed) return;
        await onUpdate(editingForm.id, { name: trimmed, color: editingForm.color });
      } else {
        const trimmed = editingValue.trim();
        if (!trimmed) return;
        await onUpdate(editingId, { name: trimmed });
      }
      cancelEdit();
    } catch { /* handled by caller */ }
  };

  const startAdd = () => {
    if (rich) setAddingForm({ name: "", color: "#6b7280" });
    else setAdding(true);
  };

  const confirmAdd = async () => {
    try {
      if (rich && addingForm) {
        const trimmed = addingForm.name.trim();
        if (!trimmed) return;
        await onCreate({ name: trimmed, color: addingForm.color });
        setAddingForm(null);
      } else {
        const trimmed = newValue.trim();
        if (!trimmed) return;
        await onCreate({ name: trimmed });
        setNewValue("");
        setAdding(false);
      }
    } catch { /* handled by caller */ }
  };

  const cancelAdd = () => {
    setAddingForm(null);
    setAdding(false);
    setNewValue("");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500"><Loader size={14} className="animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-gray-500 text-center py-4">{emptyMessage}</p>}
      
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20">
          
          {/* RICH MODE EDIT ROW */}
          {rich && editingForm?.id === item.id ? (
            <>
              {renderForm({ form: editingForm, setForm: setEditingForm, disabled: submitting })}
              <button onClick={confirmEdit} disabled={submitting} className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-50"><Check size={14} /></button>
              <button onClick={cancelEdit} disabled={submitting} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={14} /></button>
            </>
          
          /* SIMPLE MODE EDIT ROW */
          ) : !rich && editingId === item.id ? (
            <>
              <input autoFocus value={editingValue} onChange={(e) => setEditingValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }} disabled={submitting} className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-blue-400 rounded text-sm focus:outline-none" />
              <button onClick={confirmEdit} disabled={submitting} className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-50"><Check size={14} /></button>
              <button onClick={cancelEdit} disabled={submitting} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={14} /></button>
            </>
          
          /* VIEW ROW */
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
              {renderExtra?.(item)}
              <button onClick={() => startEdit(item)} disabled={submitting} className="p-1.5 rounded text-amber-500 hover:bg-amber-50 disabled:opacity-50"><Pencil size={14} /></button>
              <button onClick={() => onRemove(item.id)} disabled={submitting} className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      ))}

      {/* ADD ROW */}
      {rich && addingForm ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10">
          {renderForm({ form: addingForm, setForm: setAddingForm, disabled: submitting })}
          <button onClick={confirmAdd} disabled={submitting} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1">
            {submitting && <Loader size={12} className="animate-spin" />} Add
          </button>
          <button onClick={cancelAdd} disabled={submitting} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold disabled:opacity-50">Cancel</button>
        </div>
      ) : !rich && adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmAdd(); if (e.key === "Escape") cancelAdd(); }} disabled={submitting} placeholder={placeholder} className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={confirmAdd} disabled={submitting} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1">{submitting && <Loader size={12} className="animate-spin" />}Add</button>
          <button onClick={cancelAdd} disabled={submitting} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold disabled:opacity-50">Cancel</button>
        </div>
      ) : (
        <button onClick={startAdd} disabled={submitting} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-2 disabled:opacity-50"><Plus size={14} /> Add</button>
      )}
    </div>
  );
};

// ----------------------------------------------------
// Rich form for Priorities (Color + Name)
// ----------------------------------------------------
const ColorRowForm = ({ form, setForm, disabled }) => (
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
      placeholder="Priority Name"
      className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
    />
  </>
);

// ----------------------------------------------------
// Reminder-specific list (Name + Minutes)
// ----------------------------------------------------
const ReminderList = ({ items, loading, submitting, onCreate, onUpdate, onRemove }) => {
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", minutes: 15 });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", minutes: 0 });

  const startEdit = (i) => { setEditId(i.id); setEditForm({ name: i.name, minutes: i.minutes }); };

  const handleAdd = async () => {
    if (!newForm.name.trim()) return;
    try {
      await onCreate(newForm);
      setNewForm({ name: "", minutes: 15 });
      setAdding(false);
    } catch {}
  };

  const handleEdit = async () => {
    if (!editForm.name.trim()) return;
    try {
      await onUpdate(editId, editForm);
      setEditId(null);
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500"><Loader size={14} className="animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-2">
      {items.map((r) => (
        <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20">
          {editId === r.id ? (
            <>
              <input autoFocus value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm" />
              <input type="number" value={editForm.minutes} onChange={(e) => setEditForm({ ...editForm, minutes: Number(e.target.value) })} className="w-20 px-2 py-1 border rounded text-sm" />
              <button onClick={handleEdit} className="p-1.5 text-green-600"><Check size={14} /></button>
              <button onClick={() => setEditId(null)} className="p-1.5 text-gray-500"><X size={14} /></button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{r.name}</span>
              <span className="text-xs text-gray-500">{r.minutes} min</span>
              <button onClick={() => startEdit(r)} className="p-1.5 text-amber-500"><Pencil size={14} /></button>
              <button onClick={() => onRemove(r.id)} className="p-1.5 text-red-500"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} placeholder="e.g. 30 mins" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <input type="number" value={newForm.minutes} onChange={(e) => setNewForm({ ...newForm, minutes: Number(e.target.value) })} placeholder="Mins" className="w-24 px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Add</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-2"><Plus size={14} /> Add</button>
      )}
    </div>
  );
};

const ActivitySettings = () => {
  const dispatch = useDispatch();
  const { activityTypes, reminderOptions, activityPriorities, activityDuration } = useSelector((s) => s.crmSettings);

  const [durationInput, setDurationInput] = useState("");

  useEffect(() => {
    dispatch(fetchActivityTypes());
    dispatch(fetchReminderOptions());
    dispatch(fetchActivityPriorities());
    dispatch(fetchActivityDuration());
  }, [dispatch]);

  useEffect(() => {
    if (activityDuration.value) setDurationInput(String(activityDuration.value));
  }, [activityDuration.value]);

  const run = async (action, msg) => {
    try {
      await dispatch(action).unwrap();
      if (msg) showToast(msg, "success");
    } catch (err) {
      showToast(err || "Operation failed", "error");
      throw err;
    }
  };

  const handleSaveDuration = async () => {
    const mins = Number(durationInput);
    if (isNaN(mins) || mins < 5) return showToast("Minimum duration is 5 minutes", "error");
    await run(updateActivityDuration(mins), "Duration updated");
  };

  return (
    <div className="space-y-4">
      <SettingsCard title="Activity Types">
        <SimpleList
          items={activityTypes.data} loading={activityTypes.loading} submitting={activityTypes.submitting}
          placeholder="e.g. Webinar" emptyMessage="No activity types yet."
          onCreate={(p) => run(createActivityType(p), "Activity type created")}
          onUpdate={(id, p) => run(updateActivityType({ id, data: p }), "Activity type updated")}
          onRemove={(id) => run(deleteActivityTypeApi(id), "Activity type deleted")}
        />
      </SettingsCard>

      <SettingsCard title="Reminder Options" description="Time before an activity to notify the assigned user">
        <ReminderList
          items={reminderOptions.data} loading={reminderOptions.loading} submitting={reminderOptions.submitting}
          onCreate={(p) => run(createReminderOption(p), "Reminder created")}
          onUpdate={(id, p) => run(updateReminderOption({ id, data: p }), "Reminder updated")}
          onRemove={(id) => run(deleteReminderOptionApi(id), "Reminder deleted")}
        />
      </SettingsCard>

      {/* 👈 Priority Values now uses the rich form with the color picker */}
      <SettingsCard title="Priority Values">
        <SimpleList
          items={activityPriorities.data} 
          loading={activityPriorities.loading} 
          submitting={activityPriorities.submitting}
          placeholder="e.g. Critical" 
          emptyMessage="No priorities yet."
          onCreate={(p) => run(createActivityPriority(p), "Priority created")}
          onUpdate={(id, p) => run(updateActivityPriority({ id, data: p }), "Priority updated")}
          onRemove={(id) => run(deleteActivityPriorityApi(id), "Priority deleted")}
          renderForm={(props) => <ColorRowForm {...props} />}
          renderExtra={(item) => <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || "#6b7280" }} />}
        />
      </SettingsCard>

      <SettingsCard title="Default Activity Duration" description="Used to prefill the end time when creating a new activity">
        {activityDuration.loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500"><Loader size={14} className="animate-spin" /> Loading…</div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="number" min="5" max="480" value={durationInput} onChange={(e) => setDurationInput(e.target.value)}
              className="w-24 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
            <button
              onClick={handleSaveDuration} disabled={activityDuration.submitting || durationInput === String(activityDuration.value)}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {activityDuration.submitting ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
          </div>
        )}
      </SettingsCard>
    </div>
  );
};

export default ActivitySettings;