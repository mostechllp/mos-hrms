import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem } from "../../store/slices/accounts/itemsSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, RefreshCw, RotateCcw, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, Package,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- Small primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label, hasChevron }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <Icon size={14} className="text-slate-400" />
    <span className="flex-1 text-left">{label}</span>
    {hasChevron && <ChevronDown size={12} className="-rotate-90 text-slate-400" />}
  </button>
);

/* ---------- Page ---------- */

const ItemsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.items) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteItem(deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accounts</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Items
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} · goods and services you buy or sell
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/items/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>

              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={ArrowUpDown} label="Sort by" hasChevron />
                  <MenuItem icon={Download}   label="Import"  hasChevron />
                  <MenuItem icon={Upload}     label="Export"  hasChevron />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Settings}   label="Preferences" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={RefreshCw}  label="Refresh list" />
                  <MenuItem icon={RotateCcw}  label="Reset column width" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Table surface ---- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <input
              type="checkbox"
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              aria-label="Select all"
            />

            <div className="relative ml-auto w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                      Name <ArrowUpDown size={11} />
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">Purchase description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Purchase rate</th>
                  <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                  <th className="px-4 py-2.5 text-left font-medium">Usage unit</th>
                  <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/admin/accounts/items/view/${item.id}`)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          aria-label={`Select ${item.name}`}
                        />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.name}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                        {item.purchaseDescription || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                        ${(Number(item.purchaseRate) || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                        {item.description || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ${(Number(item.rate) || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.usageUnit || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      {/* Actions — fade in on hover */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction
                            icon={Eye}
                            label="View"
                            onClick={() => navigate(`/admin/accounts/items/view/${item.id}`)}
                          />
                          <IconAction
                            icon={Edit2}
                            label="Edit"
                            onClick={() => navigate(`/admin/accounts/items/edit/${item.id}`)}
                          />
                          <IconAction
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onClick={() => setDeleteTarget(item)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Package size={20} className="text-slate-400" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 mb-1">
                          {searchQuery ? "No items match your search" : "No items yet"}
                        </p>
                        <p className="text-[12px] text-slate-500 mb-4 max-w-xs">
                          {searchQuery
                            ? "Try a different keyword or clear the search."
                            : "Goods and services, if they have a price tag, put them here."}
                        </p>
                        {!searchQuery && (
                          <button
                            onClick={() => navigate("/admin/accounts/items/new")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                          >
                            <Plus size={13} /> New item
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- Icon action ---------- */

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default: "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-md transition-colors ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
};

export default ItemsPage;