// src/admin/pages/accounts/ItemsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItems,
  deleteItem,
  importItems,
  exportItems,
  clearError,
} from "../../store/slices/accounts/itemsSlice";
import {
  Plus,
  ArrowUpDown,
  Download,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  Package,
  Columns,
  Loader2,
  Settings,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";
import ExportModal from "../../../components/common/ExportModal";
import ImportModal from "../../../components/common/ImportModal";
import { showToast } from "../../../components/common/Toast";

/* ---------- primitives ---------- */
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
      "text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30",
    primary:
      "text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30",
    warning:
      "text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/30",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-full transition-all duration-200 ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
};

/* ---------- column definitions ---------- */
const ALL_COLUMNS = [
  { id: "name", label: "Name", locked: true, defaultVisible: true },
  { id: "type", label: "Type", defaultVisible: true },
  { id: "purchaseDescription", label: "Purchase Description", defaultVisible: false },
  { id: "purchaseRate", label: "Purchase Rate", defaultVisible: true },
  { id: "description", label: "Description", defaultVisible: true },
  { id: "rate", label: "Rate", defaultVisible: true },
  { id: "usageUnit", label: "Usage Unit", defaultVisible: true },
  { id: "sku", label: "SKU", defaultVisible: false },
  { id: "hsnSac", label: "HSN / SAC", defaultVisible: false },
  { id: "tax", label: "Tax", defaultVisible: false },
  { id: "account", label: "Account", defaultVisible: false },
  { id: "createdAt", label: "Created At", defaultVisible: false },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A-Z)", sort_by: "name", sort_dir: "asc" },
  { value: "name_desc", label: "Name (Z-A)", sort_by: "name", sort_dir: "desc" },
  { value: "rate_desc", label: "Highest Rate", sort_by: "selling_price", sort_dir: "desc" },
  { value: "rate_asc", label: "Lowest Rate", sort_by: "selling_price", sort_dir: "asc" },
];

const ITEM_IMPORT_COLUMNS = [
  "Name", "Type", "SKU", "HSN / SAC", "Description",
  "Purchase Description", "Purchase Rate", "Rate",
  "Usage Unit", "Tax", "Account",
];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* ---------- page ---------- */
const ItemsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const itemsSlice = useSelector((state) => state.items) || {};
  const items = itemsSlice.items || [];
  const loading = itemsSlice.loading ?? false;
  const error = itemsSlice.error ?? null;
  const pagination = itemsSlice.pagination ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: "all",
    usageUnit: "all",
  });
  const [sortBy, setSortBy] = useState("name_asc");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  /* ---- load items whenever page / search / filters / sort change ---- */
  useEffect(() => {
    const params = { page, per_page: pageSize };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (filters.type !== "all") params.type = filters.type;
    if (filters.usageUnit !== "all") params.usage_unit = filters.usageUnit;

    const sort = SORT_OPTIONS.find((o) => o.value === sortBy);
    if (sort) {
      params.sort_by = sort.sort_by;
      params.sort_dir = sort.sort_dir;
    }

    dispatch(fetchItems(params));
  }, [dispatch, page, pageSize, searchQuery, filters, sortBy]);

  /* ---- reset to page 1 when search / filters / sort change ---- */
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters, sortBy]);

  /* ---- clear stale errors on unmount ---- */
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  /* ---- column visibility + order (persisted) ---- */
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.reduce(
      (acc, col) => ({
        ...acc,
        [col.id]: col.defaultVisible || col.locked,
      }),
      {},
    ),
  );

  const [columnOrder, setColumnOrder] = useState(() => {
    const savedOrder = localStorage.getItem("itemsColumnOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        const savedIds = parsed.filter((id) =>
          ALL_COLUMNS.some((col) => col.id === id)
        );
        const missingColumns = ALL_COLUMNS
          .filter((col) => !savedIds.includes(col.id))
          .map((col) => col.id);
        return [...savedIds, ...missingColumns];
      } catch {
        return ALL_COLUMNS.map((col) => col.id);
      }
    }
    return ALL_COLUMNS.map((col) => col.id);
  });

  const orderedColumns = useMemo(
    () => columnOrder.map((id) => ALL_COLUMNS.find((col) => col.id === id)).filter(Boolean),
    [columnOrder],
  );

  const handleReorderColumns = (reorderedColumns) => {
    const newOrder = reorderedColumns.map((col) => col.id);
    setColumnOrder(newOrder);
    localStorage.setItem("itemsColumnOrder", JSON.stringify(newOrder));
  };

  const toggleColumn = (id) =>
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ---- derived data ---- */
  // In server-paginated mode, filter dropdown options must come from the
  // server-provided form options. As a resilient fallback, derive from
  // whatever rows we currently have.
  const availableUnits = useMemo(
    () => [...new Set(items.map((i) => i.usageUnit).filter(Boolean))],
    [items],
  );

  const availableTypes = useMemo(
    () => [...new Set(items.map((i) => i.type).filter(Boolean))],
    [items],
  );

  const hasActiveFilters =
    filters.type !== "all" || filters.usageUnit !== "all";

  /* ---- rows to render ---- */
  // Server already filtered, sorted and paginated — render as-is.
  // Client fallback (no pagination meta) still applies in-memory filtering.
  const pagedItems = useMemo(() => {
    if (pagination) return items;

    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.purchaseDescription && item.purchaseDescription.toLowerCase().includes(q)),
      );
    }
    if (filters.type !== "all") {
      result = result.filter((item) => item.type === filters.type);
    }
    if (filters.usageUnit !== "all") {
      result = result.filter((item) => item.usageUnit === filters.usageUnit);
    }

    result.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (sortBy === "name_asc") return nameA.localeCompare(nameB);
      if (sortBy === "name_desc") return nameB.localeCompare(nameA);
      const rateA = Number(a.rate) || 0;
      const rateB = Number(b.rate) || 0;
      if (sortBy === "rate_desc") return rateB - rateA;
      if (sortBy === "rate_asc") return rateA - rateB;
      return 0;
    });

    return result.slice((page - 1) * pageSize, page * pageSize);
  }, [items, pagination, searchQuery, filters, sortBy, page, pageSize]);

  const serverPaginated = !!pagination;
  const totalItems = serverPaginated
    ? (pagination.total ?? items.length)
    : (() => {
        // Recompute total count for client fallback
        let result = [...items];
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          result = result.filter(
            (item) =>
              item.name?.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q)) ||
              (item.purchaseDescription && item.purchaseDescription.toLowerCase().includes(q)),
          );
        }
        if (filters.type !== "all") result = result.filter((i) => i.type === filters.type);
        if (filters.usageUnit !== "all") result = result.filter((i) => i.usageUnit === filters.usageUnit);
        return result.length;
      })();
  const totalPages = serverPaginated
    ? (pagination.lastPage ?? 1)
    : Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = serverPaginated
    ? (pagination.currentPage ?? 1)
    : page;

  /* ---- handlers ---- */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget; // capture before state changes
    try {
      await dispatch(deleteItem(target.id)).unwrap();
      showToast("Item deleted", "success");
    } catch (e) {
      showToast(e || "Delete failed", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleImportSubmit = async (formData) => {
    try {
      await dispatch(importItems(formData)).unwrap();
      showToast("Items imported successfully", "success");
      // refresh current page
      dispatch(fetchItems({ page: 1, per_page: pageSize }));
      setPage(1);
    } catch (e) {
      showToast(e || "Import failed", "error");
      throw e;
    }
  };

  const handleExport = async (format) => {
    try {
      const params = { format: format === "excel" ? "xlsx" : format };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filters.type !== "all") params.type = filters.type;
      if (filters.usageUnit !== "all") params.usage_unit = filters.usageUnit;

      const sort = SORT_OPTIONS.find((o) => o.value === sortBy);
      if (sort) {
        params.sort_by = sort.sort_by;
        params.sort_dir = sort.sort_dir;
      }

      // Only send explicit columns for PDF (matches prior behavior)
      if (params.format === "pdf") {
        params.columns = orderedColumns
          .filter((col) => visibleColumns[col.id])
          .map((col) => col.label);
      }

      const blob = await dispatch(exportItems(params)).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `items_export_${new Date().toISOString().split("T")[0]}.${params.format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Export downloaded successfully", "success");
    } catch (e) {
      showToast(e || "Export failed", "error");
    }
  };

  /* ---- stats ---- */
  const goodsCount = items.filter((i) => i.type === "Goods").length;
  const serviceCount = items.filter((i) => i.type === "Service").length;
  const avgRate =
    items.length > 0
      ? items.reduce((s, i) => s + (Number(i.rate) || 0), 0) / items.length
      : 0;

  const visibleColumnCount =
    Object.values(visibleColumns).filter(Boolean).length + 1;

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300">
          <span>{typeof error === "string" ? error : error?.message || "Something went wrong"}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="text-[11px] font-medium underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Items" value={totalItems} icon="fas fa-box" color="green" />
        <MiniStat label="Goods" value={goodsCount} icon="fas fa-cubes" color="blue" />
        <MiniStat label="Services" value={serviceCount} icon="fas fa-concierge-bell" color="violet" />
        <MiniStat
          label="Avg. Rate"
          value={`₹${avgRate.toFixed(2)}`}
          icon="fas fa-rupee-sign"
          color="amber"
          isMoney
        />
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Items
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalItems === 0
              ? "No items yet"
              : `${totalItems} ${totalItems === 1 ? "item" : "items"} · goods and services you buy or sell`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/accounts/items/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Item
          </button>
        </div>
      </div>

      {/* Main table content */}
      {loading && items.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 size={22} className="animate-spin text-green-500" />
          <span className="text-sm">Loading items…</span>
        </Card>
      ) : totalItems === 0 && !searchQuery && !hasActiveFilters ? (
        <EmptyState navigate={navigate} />
      ) : (
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Columns size={15} />
              <span className="hidden md:inline">Columns</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Type: Any</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={filters.usageUnit}
                onChange={(e) => setFilters({ ...filters, usageUnit: e.target.value })}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Unit: Any</option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ type: "all", usageUnit: "all" })}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {orderedColumns
                      .filter((col) => visibleColumns[col.id])
                      .map((col) => (
                        <th
                          key={col.id}
                          className={`px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 ${
                            ["purchaseRate", "rate"].includes(col.id)
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {col.id === "name" ? (
                            <span className="inline-flex items-center gap-1">
                              {col.label}
                              <ArrowUpDown size={11} />
                            </span>
                          ) : (
                            col.label
                          )}
                        </th>
                      ))}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={visibleColumnCount} className="py-10 text-center text-gray-500">
                        <Loader2 size={18} className="inline animate-spin mr-2 text-green-500" />
                        Loading…
                      </td>
                    </tr>
                  ) : pagedItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumnCount}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No items match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    pagedItems.map((item) => {
                      const emptyValue = (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      );
                      const cellClass =
                        "px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap";

                      const renderCell = (columnId) => {
                        switch (columnId) {
                          case "name":
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/accounts/items/view/${item.id}`);
                                }}
                                className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline"
                              >
                                {item.name || emptyValue}
                              </button>
                            );
                          case "type":
                            return item.type ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {item.type}
                              </span>
                            ) : emptyValue;
                          case "purchaseDescription":
                            return (
                              <span className="block max-w-[220px] truncate">
                                {item.purchaseDescription || emptyValue}
                              </span>
                            );
                          case "description":
                            return (
                              <span className="block max-w-[220px] truncate">
                                {item.description || emptyValue}
                              </span>
                            );
                          case "purchaseRate":
                            return `₹${(Number(item.purchaseRate) || 0).toFixed(2)}`;
                          case "rate":
                            return `₹${(Number(item.rate) || 0).toFixed(2)}`;
                          case "usageUnit":
                            return item.usageUnit || emptyValue;
                          case "sku":
                            return item.sku || emptyValue;
                          case "hsnSac":
                            return item.hsnSac || emptyValue;
                          case "tax":
                            return item.tax || emptyValue;
                          case "account":
                            return item.account || emptyValue;
                          case "createdAt":
                            return item.createdAt ? formatDate(item.createdAt) : emptyValue;
                          default:
                            return emptyValue;
                        }
                      };

                      return (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/admin/accounts/items/view/${item.id}`)}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                        >
                          {orderedColumns
                            .filter((col) => visibleColumns[col.id])
                            .map((col) => (
                              <td
                                key={col.id}
                                className={`${cellClass} ${
                                  ["purchaseRate", "rate"].includes(col.id)
                                    ? "text-right tabular-nums"
                                    : ""
                                } ${
                                  col.id === "name"
                                    ? "font-semibold text-gray-800 dark:text-gray-200"
                                    : ""
                                }`}
                              >
                                {renderCell(col.id)}
                              </td>
                            ))}
                          <td
                            className="px-3 md:px-4 py-2 md:py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages} · {totalItems} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <CustomizeColumnsModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={orderedColumns}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onReorderColumns={handleReorderColumns}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSubmit}
        title="Import Items"
        subtitle="Upload a spreadsheet to bulk-import items."
        expectedColumns={ITEM_IMPORT_COLUMNS}
        onSuccess={() => {
          dispatch(fetchItems({ page: 1, per_page: pageSize }));
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        title="Export Items"
        subtitle="Download your items list"
        totalRecords={totalItems}
        formats={["csv", "xlsx", "pdf"]}
        defaultFormat="csv"
      />

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
const EmptyState = ({ navigate }) => (
  <Card className="py-16 px-6">
    <div className="max-w-xl mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Package size={22} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        Goods and services, in one place
      </h2>
      <p className="text-sm text-gray-500 mt-1.5 mb-6">
        Create and manage the items you buy or sell, with rates, taxes and stock units.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => navigate("/admin/accounts/items/new")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create item
        </button>
      </div>
    </div>
    <div className="mt-12 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={14} className="text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          Key benefits
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {[
          "Track purchase & selling rates",
          "Add taxes, HSN/SAC codes and SKUs",
          "Support for goods and services",
          "Multi-currency ready",
        ].map((benefit, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

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
        <div
          className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}
        >
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
      </div>
      <div
        className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

export default ItemsPage;