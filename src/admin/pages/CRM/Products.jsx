// src/admin/pages/crm/Products.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Pencil,
  Trash2,
  Copy,
  Package,
  Wrench,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  Layers,
  Eye,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ExportModal from "../../../components/common/ExportModal";
import ProductModal from "../../components/crm/ProductModal";
import {
  fetchProducts,
  fetchProductFormOptions,
  createProduct,
  updateProduct,
  deleteProductApi,
  updateProductStatusApi,
  exportProducts,
  fromProductApi,
  setCurrentPage,
  setFilters,
  resetFilters,
  fetchProductById,
} from "../../store/slices/productSlice";
import CategoryModal from "../../components/crm/CategoryModal";
import ViewProductModal from "../../components/crm/ViewProductModal";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const formatCurrency = (n, currency = "INR") => {
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "AED"
          ? "AED "
          : currency === "GBP"
            ? "£"
            : "";
  return `${symbol}${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusBadge = (status) => {
  const map = {
    Active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[status] || map.Active;
};

const typeBadge = (type) => {
  const map = {
    Product: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Service:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return map[type] || map.Product;
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
const Products = () => {
  const dispatch = useDispatch();

  const {
    products = [],
    loading,
    totalCount,
    currentPage,
    perPage,
    filters,
    options,
    optionsLoading,
    submitting,
  } = useSelector((s) => s.products);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingProductId, setViewingProductId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);

  // ── load form options once ──
  useEffect(() => {
    dispatch(fetchProductFormOptions());
  }, [dispatch]);

  // ── list fetch on filters/page change ──
  useEffect(() => {
    dispatch(
      fetchProducts({
        page: currentPage,
        perPage,
        search: filters.search,
        type: filters.type,
        category: filters.category,
        status: filters.status,
        currency: filters.currency,
        min_price: filters.min_price,
        max_price: filters.max_price,
        date_from: filters.date_from,
        date_to: filters.date_to,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      }),
    );
  }, [dispatch, currentPage, perPage, filters]);

  // ── debounced search ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const refetchList = () =>
    dispatch(
      fetchProducts({
        page: currentPage,
        perPage,
        search: filters.search,
        type: filters.type,
        category: filters.category,
        status: filters.status,
        currency: filters.currency,
        min_price: filters.min_price,
        max_price: filters.max_price,
        date_from: filters.date_from,
        date_to: filters.date_to,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      }),
    );

  const openView = (product) => {
    setViewingProductId(product.id);
    setViewModalOpen(true);
  };

  const normalized = useMemo(
    () => (products || []).map((p) => fromProductApi(p)),
    [products],
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const activeFilterCount = useMemo(
    () =>
      ["type", "category", "status", "currency"].filter((k) => filters[k])
        .length,
    [filters],
  );

  // ── Summary from current page (server doesn't expose a stats endpoint) ──
  const summary = useMemo(() => {
    const active = normalized.filter((p) => p.status === "Active").length;
    const inactive = normalized.filter((p) => p.status === "Inactive").length;
    const productCount = normalized.filter((p) => p.type === "Product").length;
    const serviceCount = normalized.filter((p) => p.type === "Service").length;
    return {
      total: totalCount || normalized.length,
      active,
      inactive,
      productCount,
      serviceCount,
    };
  }, [normalized, totalCount]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const openCreate = async () => {
    setEditingProduct(null);
    try {
      await dispatch(fetchProductFormOptions()).unwrap();
    } catch {
      /* non-fatal */
    }
    setModalOpen(true);
  };

  const openEdit = async (product) => {
    try {
      // 1. fetch fresh single record (populates notes, timestamps, etc.)
      const full = await dispatch(fetchProductById(product.id)).unwrap();
      // 2. hydrate the modal with the API-normalized shape
      setEditingProduct(fromProductApi(full));
    } catch {
      // fall back to the row data if the detail fetch fails
      setEditingProduct(product);
    }
    // 3. make sure dropdown options are fresh
    try {
      await dispatch(fetchProductFormOptions()).unwrap();
    } catch {
      /* non-fatal */
    }
    setModalOpen(true);
  };

  const handleModalSubmit = async (data, isEdit) => {
    try {
      if (isEdit && editingProduct?.id) {
        await dispatch(updateProduct({ id: editingProduct.id, data })).unwrap();
        showToast("Product updated successfully", "success");
      } else {
        await dispatch(createProduct(data)).unwrap();
        showToast("Product created successfully", "success");
      }
      setModalOpen(false);
      setEditingProduct(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to save product", "error");
    }
  };

  const handleDeleteClick = (product) => {
    setPendingDelete(product);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteProductApi(pendingDelete.id)).unwrap();
      showToast(`"${pendingDelete.name}" deleted`, "success");
      setConfirmOpen(false);
      setPendingDelete(null);
      await refetchList();
    } catch (err) {
      showToast(err || "Failed to delete product", "error");
    }
  };

  const toggleStatus = async (product) => {
    const nextStatus = product.status === "Active" ? "Inactive" : "Active";
    try {
      await dispatch(
        updateProductStatusApi({ id: product.id, status: nextStatus }),
      ).unwrap();
      showToast(`"${product.name}" is now ${nextStatus}`, "success");
      // Slice patches the row in place — no refetch needed
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const updateFilter = (key, value) => dispatch(setFilters({ [key]: value }));

  const handleCategoriesChanged = async () => {
    try {
      await dispatch(fetchProductFormOptions()).unwrap();
    } catch {
      /* non-fatal */
    }
  };

  // ------------------------------------------------------------
  // Export
  // ------------------------------------------------------------
  const handleExport = async (format) => {
    try {
      await dispatch(
        exportProducts({
          format,
          filters: {
            search: filters.search,
            type: filters.type,
            category: filters.category,
            status: filters.status,
            currency: filters.currency,
          },
        }),
      ).unwrap();
      showToast("Export downloaded successfully", "success");
    } catch (err) {
      showToast(err || "Failed to export products", "error");
    }
  };

  const handleEditFromView = (product) => {
    setViewModalOpen(false);
    setViewingProductId(null);
    // opens the ProductModal in edit mode; fetchProductFormOptions runs inside openEdit
    openEdit(product);
  };

  const handleDeleteFromView = (product) => {
    setViewModalOpen(false);
    setViewingProductId(null);
    handleDeleteClick(product);
  };

  // Options from slice
  const typeOptions = options.types || ["Product", "Service"];
  // options.categories is now [{ id, name, products_count }, ...]
  const categoryList = options.categories || [];
  const categoryOptions = categoryList.map((c) => c.name); // names for filters
  const statusOptions = options.statuses || ["Active", "Inactive"];

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Products & Services
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage the catalog of products and services your sales team offers
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setExportOpen(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> Export
          </button>

          <button
            onClick={() => setCategoryModalOpen(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Layers size={15} /> Manage Categories
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Product / Service
          </button>
        </div>
      </div>

      {/* ---------- Summary cards ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          label="Total Items"
          value={summary.total}
          icon={Layers}
          color="blue"
        />
        <SummaryCard
          label="Active"
          value={summary.active}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          label="Inactive"
          value={summary.inactive}
          icon={XCircle}
          color="gray"
        />
        <SummaryCard
          label="Products"
          value={summary.productCount}
          icon={Package}
          color="indigo"
        />
        <SummaryCard
          label="Services"
          value={summary.serviceCount}
          icon={Wrench}
          color="purple"
        />
      </div>

      {/* ---------- Search + Filters ---------- */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, code, ID, or category..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
            activeFilterCount > 0
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Filter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FilterSelect
              label="Type"
              value={filters.type}
              onChange={(v) => updateFilter("type", v)}
              options={typeOptions}
            />
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(v) => updateFilter("category", v)}
              options={categoryOptions} // array of names
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(v) => updateFilter("status", v)}
              options={statusOptions}
            />
            <FilterSelect
              label="Currency"
              value={filters.currency}
              onChange={(v) => updateFilter("currency", v)}
              options={options.currencies || []}
            />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- Table ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
        <div className="min-w-[1100px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {[
                  "ID",
                  "NAME",
                  "CODE / SKU",
                  "TYPE",
                  "CATEGORY",
                  "DESCRIPTION",
                  "UNIT",
                  "DEFAULT PRICE",
                  "TAX",
                  "STATUS",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : normalized.length > 0 ? (
                normalized.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {p.productId}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openView(p)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {p.code}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${typeBadge(
                          p.type,
                        )}`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {p.category || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 max-w-[240px] truncate">
                      {p.description || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {p.unit || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(p.defaultPrice, p.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {p.taxRate}%
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
                          p.status,
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <IconBtn
                          icon={Eye}
                          color="text-blue-500"
                          title="View"
                          onClick={() => openView(p)}
                        />
                        <IconBtn
                          icon={Pencil}
                          color="text-amber-500"
                          title="Edit"
                          onClick={() => openEdit(p)}
                        />
                        <IconBtn
                          icon={p.status === "Active" ? PowerOff : Power}
                          color={
                            p.status === "Active"
                              ? "text-gray-500"
                              : "text-green-600"
                          }
                          title={
                            p.status === "Active" ? "Deactivate" : "Activate"
                          }
                          onClick={() => toggleStatus(p)}
                        />
                        <IconBtn
                          icon={Trash2}
                          color="text-red-500"
                          title="Delete"
                          onClick={() => handleDeleteClick(p)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products or services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Pagination ---------- */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => dispatch(setCurrentPage(p))}
          totalItems={totalCount}
          itemsPerPage={perPage}
        />
      )}

      {/* ---------- Add / Edit modal ---------- */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categoryList} // 👈 full objects, not just names
        categoriesLoading={optionsLoading}
        types={typeOptions}
        units={options.units}
        currencies={options.currencies}
        statuses={statusOptions}
        onSubmit={handleModalSubmit}
        submitting={submitting}
        onManageCategories={() => setCategoryModalOpen(true)}
        onCategoryCreated={handleCategoriesChanged}
      />

      {/* ---------- Delete confirm ---------- */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product / Service"
        message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      {/* ---------- Export modal ---------- */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        title="Export Products"
        subtitle="Download the current filtered list"
        totalRecords={totalCount}
        formats={["csv", "xlsx", "pdf"]}
        defaultFormat="xlsx"
      />
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onChanged={handleCategoriesChanged}
      />
      <ViewProductModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingProductId(null);
        }}
        productId={viewingProductId}
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />
    </div>
  );
};

// ------------------------------------------------------------
// Building blocks
// ------------------------------------------------------------
const SummaryCard = ({ label, value, icon: Icon, color }) => {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
};

const IconBtn = ({ icon: Icon, color, title, onClick }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color}`}
  >
    <Icon size={14} />
  </button>
);

const FilterSelect = ({ label, value, onChange, options = [] }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="">All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default Products;
