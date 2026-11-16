// src/admin/pages/accounts/ItemsPage.jsx
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
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label, hasChevron }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
    <Icon size={14} className="text-gray-400" />
    <span className="flex-1 text-left">{label}</span>
    {hasChevron && <ChevronDown size={12} className="-rotate-90 text-gray-400" />}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    primary:
      "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    warning:
      "text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg transition-colors ${tones[tone]}`}
    >
      <Icon size={14} />
    </button>
  );
};

/* ---------- Page ---------- */

const ItemsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.items) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const menuRef = useRef(null);

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
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteItem(deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const totalItems = items.length;
  const goodsCount = items.filter((i) => i.type === "Goods").length;
  const serviceCount = items.filter((i) => i.type === "Service").length;
  const avgRate =
    totalItems > 0
      ? items.reduce((s, i) => s + (Number(i.rate) || 0), 0) / totalItems
      : 0;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Items" value={totalItems} icon="fas fa-box" color="green" />
        <MiniStat label="Goods" value={goodsCount} icon="fas fa-cubes" color="blue" />
        <MiniStat label="Services" value={serviceCount} icon="fas fa-concierge-bell" color="violet" />
        <MiniStat
          label="Avg. Rate"
          value={`$${avgRate.toFixed(2)}`}
          icon="fas fa-dollar-sign"
          color="amber"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Items
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"} · goods and services you buy or sell
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/admin/accounts/items/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Item
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden">
                <MenuItem icon={ArrowUpDown} label="Sort by" hasChevron />
                <MenuItem icon={Download}   label="Import"  hasChevron />
                <MenuItem icon={Upload}     label="Export"  hasChevron />
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
                <MenuItem icon={Settings}   label="Preferences" />
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
                <MenuItem icon={RefreshCw}  label="Refresh list" />
                <MenuItem icon={RotateCcw}  label="Reset column width" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Table surface ---- */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <GhostBtn title="Filter" className="!px-2">
            <Filter size={15} />
          </GhostBtn>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
            aria-label="Select all"
          />

          <div className="relative ml-auto w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[1000px] lg:min-w-0">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      Name <ArrowUpDown size={11} />
                    </span>
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Purchase description</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Purchase rate</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Description</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Rate</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Usage unit</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/admin/accounts/items/view/${item.id}`)}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                          aria-label={`Select ${item.name}`}
                        />
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/accounts/items/view/${item.id}`);
                          }}
                          className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                        >
                          {item.name}
                        </button>
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-[220px] truncate">
                        {item.purchaseDescription || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        ${(Number(item.purchaseRate) || 0).toFixed(2)}
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-[220px] truncate">
                        {item.description || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                        ${(Number(item.rate) || 0).toFixed(2)}
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {item.usageUnit || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <IconAction
                            icon={Eye}
                            label="View"
                            tone="primary"
                            onClick={() => navigate(`/admin/accounts/items/view/${item.id}`)}
                          />
                          <IconAction
                            icon={Edit2}
                            label="Edit"
                            tone="warning"
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
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                          <Package size={20} className="text-gray-400" />
                        </div>
                        <p className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 mb-1">
                          {searchQuery ? "No items match your search" : "No items yet"}
                        </p>
                        <p className="text-xs text-gray-500 mb-4 max-w-xs">
                          {searchQuery
                            ? "Try a different keyword or clear the search."
                            : "Goods and services, if they have a price tag, put them here."}
                        </p>
                        {!searchQuery && (
                          <button
                            onClick={() => navigate("/admin/accounts/items/new")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                          >
                            <Plus size={14} /> New item
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
      </Card>

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

/* ---------- sub-components ---------- */

const MiniStat = ({ label, value, icon, color, isMoney }) => {
  const bg = {
    green: "bg-green-100 dark:bg-green-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
    violet: "bg-violet-100 dark:bg-violet-900/30",
  }[color] || "bg-gray-100 dark:bg-gray-700";

  const fg = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    violet: "text-violet-600 dark:text-violet-400",
  }[color] || "text-gray-600 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

export default ItemsPage;