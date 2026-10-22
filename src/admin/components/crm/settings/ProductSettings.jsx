import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Check, X, Loader, Star } from "lucide-react";
import { showToast } from "../../../../components/common/Toast";
import {
  fetchProductCategories, createProductCategory, updateProductCategory, deleteProductCategoryApi,
  fetchProductUnits, createProductUnit, updateProductUnit, deleteProductUnitApi,
  fetchProductCurrencies, createProductCurrency, updateProductCurrency, deleteProductCurrencyApi, setDefaultCurrencyApi,
  fetchProductTaxes, createProductTax, updateProductTax, deleteProductTaxApi, setDefaultTaxApi
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

// Reusable Simple List for Categories and Units (Name only)
const SimpleList = ({ items, loading, submitting, onCreate, onUpdate, onRemove, placeholder, emptyMessage }) => {
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  const startEdit = (item) => { setEditingId(item.id); setEditingValue(item.name); };
  const cancelEdit = () => { setEditingId(null); setEditingValue(""); };
  const confirmEdit = async () => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    try { await onUpdate(editingId, { name: trimmed }); cancelEdit(); } catch {}
  };
  const handleAdd = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    try { await onCreate({ name: trimmed }); setNewValue(""); setAdding(false); } catch {}
  };

  if (loading) return <div className="flex justify-center py-6 gap-2 text-sm text-gray-500"><Loader size={14} className="animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-gray-500 text-center py-4">{emptyMessage}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20">
          {editingId === item.id ? (
            <>
              <input autoFocus value={editingValue} onChange={(e) => setEditingValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }} disabled={submitting} className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-blue-400 rounded text-sm focus:outline-none" />
              <button onClick={confirmEdit} disabled={submitting} className="p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50"><Check size={14} /></button>
              <button onClick={cancelEdit} disabled={submitting} className="p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={14} /></button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
              <button onClick={() => startEdit(item)} disabled={submitting} className="p-1.5 text-amber-500 hover:bg-amber-50 disabled:opacity-50"><Pencil size={14} /></button>
              <button onClick={() => onRemove(item.id)} disabled={submitting} className="p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewValue(""); } }} disabled={submitting} placeholder={placeholder} className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={handleAdd} disabled={submitting} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1">{submitting && <Loader size={12} className="animate-spin" />}Add</button>
          <button onClick={() => { setAdding(false); setNewValue(""); }} disabled={submitting} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} disabled={submitting} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mt-2 disabled:opacity-50"><Plus size={14} /> Add</button>
      )}
    </div>
  );
};

// Currency List (Code + Symbol + Set Default)
const CurrencyList = ({ items, loading, submitting, onCreate, onUpdate, onRemove, onSetDefault }) => {
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ code: "", symbol: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ code: "", symbol: "" });

  const handleAdd = async () => {
    if (!newForm.code.trim() || !newForm.symbol.trim()) return;
    try {
      await onCreate(newForm);
      setNewForm({ code: "", symbol: "" });
      setAdding(false);
    } catch {}
  };

  const handleEdit = async () => {
    if (!editForm.code.trim() || !editForm.symbol.trim()) return;
    try {
      await onUpdate(editId, editForm);
      setEditId(null);
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-6 gap-2 text-sm text-gray-500"><Loader size={14} className="animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-2">
      {items.map((c) => (
        <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20">
          {editId === c.id ? (
            <>
              <input autoFocus value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} placeholder="USD" className="w-20 px-2 py-1 border rounded text-sm" />
              <input value={editForm.symbol} onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value })} placeholder="$" className="flex-1 px-2 py-1 border rounded text-sm" />
              <button onClick={handleEdit} className="p-1.5 text-green-600"><Check size={14} /></button>
              <button onClick={() => setEditId(null)} className="p-1.5 text-gray-500"><X size={14} /></button>
            </>
          ) : (
            <>
              <span className="w-16 text-xs font-bold text-gray-500 dark:text-gray-400">{c.code}</span>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{c.symbol}</span>
              {c.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Default</span>
              )}
              {!c.isDefault && (
                <button onClick={() => onSetDefault(c.id)} disabled={submitting} className="text-xs font-semibold text-gray-500 hover:text-blue-600 disabled:opacity-50">Set as default</button>
              )}
              <button onClick={() => { setEditId(c.id); setEditForm({ code: c.code, symbol: c.symbol }); }} className="p-1.5 text-amber-500"><Pencil size={14} /></button>
              <button onClick={() => onRemove(c.id)} className="p-1.5 text-red-500"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus value={newForm.code} onChange={(e) => setNewForm({ ...newForm, code: e.target.value.toUpperCase() })} placeholder="USD" className="w-24 px-3 py-2 border rounded-lg text-sm" />
          <input value={newForm.symbol} onChange={(e) => setNewForm({ ...newForm, symbol: e.target.value })} placeholder="$" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Add</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-2"><Plus size={14} /> Add</button>
      )}
    </div>
  );
};

// Tax List (Name + Rate + Set Default)
const TaxList = ({ items, loading, submitting, onCreate, onUpdate, onRemove, onSetDefault }) => {
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", rate: 0 });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", rate: 0 });

  const handleAdd = async () => {
    if (!newForm.name.trim()) return;
    try {
      await onCreate(newForm);
      setNewForm({ name: "", rate: 0 });
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

  if (loading) return <div className="flex justify-center py-6 gap-2 text-sm text-gray-500"><Loader size={14} className="animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20">
          {editId === t.id ? (
            <>
              <input autoFocus value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="GST 18%" className="flex-1 px-2 py-1 border rounded text-sm" />
              <input type="number" value={editForm.rate} onChange={(e) => setEditForm({ ...editForm, rate: Number(e.target.value) })} placeholder="18" className="w-20 px-2 py-1 border rounded text-sm" />
              <button onClick={handleEdit} className="p-1.5 text-green-600"><Check size={14} /></button>
              <button onClick={() => setEditId(null)} className="p-1.5 text-gray-500"><X size={14} /></button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{t.name}</span>
              <span className="text-xs text-gray-500">{t.rate}%</span>
              {t.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Default</span>
              )}
              {!t.isDefault && (
                <button onClick={() => onSetDefault(t.id)} disabled={submitting} className="text-xs font-semibold text-gray-500 hover:text-blue-600 disabled:opacity-50">Set as default</button>
              )}
              <button onClick={() => { setEditId(t.id); setEditForm({ name: t.name, rate: t.rate }); }} className="p-1.5 text-amber-500"><Pencil size={14} /></button>
              <button onClick={() => onRemove(t.id)} className="p-1.5 text-red-500"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} placeholder="e.g. GST 18%" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <input type="number" value={newForm.rate} onChange={(e) => setNewForm({ ...newForm, rate: Number(e.target.value) })} placeholder="18" className="w-24 px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Add</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-2"><Plus size={14} /> Add</button>
      )}
    </div>
  );
};

const ProductSettings = () => {
  const dispatch = useDispatch();
  const { 
    productCategories, productUnits, productCurrencies, productTaxes 
  } = useSelector((s) => s.crmSettings);

  useEffect(() => {
    dispatch(fetchProductCategories());
    dispatch(fetchProductUnits());
    dispatch(fetchProductCurrencies());
    dispatch(fetchProductTaxes());
  }, [dispatch]);

  const run = async (action, msg) => {
    try {
      await dispatch(action).unwrap();
      if (msg) showToast(msg, "success");
    } catch (err) {
      showToast(err || "Operation failed", "error");
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard title="Product Categories">
        <SimpleList
          items={productCategories.data} loading={productCategories.loading} submitting={productCategories.submitting}
          placeholder="e.g. Hardware" emptyMessage="No categories yet."
          onCreate={(p) => run(createProductCategory(p), "Category created")}
          onUpdate={(id, p) => run(updateProductCategory({ id, data: p }), "Category updated")}
          onRemove={(id) => run(deleteProductCategoryApi(id), "Category deleted")}
        />
      </SettingsCard>

      <SettingsCard title="Units">
        <SimpleList
          items={productUnits.data} loading={productUnits.loading} submitting={productUnits.submitting}
          placeholder="e.g. Bundle" emptyMessage="No units yet."
          onCreate={(p) => run(createProductUnit(p), "Unit created")}
          onUpdate={(id, p) => run(updateProductUnit({ id, data: p }), "Unit updated")}
          onRemove={(id) => run(deleteProductUnitApi(id), "Unit deleted")}
        />
      </SettingsCard>

      <SettingsCard title="Currencies">
        <CurrencyList
          items={productCurrencies.data} loading={productCurrencies.loading} submitting={productCurrencies.submitting}
          onCreate={(p) => run(createProductCurrency(p), "Currency created")}
          onUpdate={(id, p) => run(updateProductCurrency({ id, data: p }), "Currency updated")}
          onRemove={(id) => run(deleteProductCurrencyApi(id), "Currency deleted")}
          onSetDefault={(id) => run(setDefaultCurrencyApi(id), "Default currency changed")}
        />
      </SettingsCard>

      <SettingsCard title="Tax Settings" description="Manage tax definitions used across quotations and invoices">
        <TaxList
          items={productTaxes.data} loading={productTaxes.loading} submitting={productTaxes.submitting}
          onCreate={(p) => run(createProductTax(p), "Tax created")}
          onUpdate={(id, p) => run(updateProductTax({ id, data: p }), "Tax updated")}
          onRemove={(id) => run(deleteProductTaxApi(id), "Tax deleted")}
          onSetDefault={(id) => run(setDefaultTaxApi(id), "Default tax changed")}
        />
      </SettingsCard>
    </div>
  );
};

export default ProductSettings;