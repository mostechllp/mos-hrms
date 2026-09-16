// src/admin/pages/crm/Products.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../../components/common/Paginations";
import ConfirmModal from "../../components/common/ConfirmModal";
import ProductModal from "../../components/crm/ProductModal";

// ------------------------------------------------------------
// STATIC DATA
// ------------------------------------------------------------

const PRODUCTS = [
  {
    id: 1,
    productId: "PRD-0001",
    name: "HRMS Implementation",
    code: "HRMS-IMPL",
    type: "Service",
    category: "Human Resources",
    description: "End-to-end HRMS implementation for up to 250 employees",
    unit: "Project",
    defaultPrice: 150000,
    currency: "INR",
    taxRate: 18,
    status: "Active",
    notes: "",
  },
  {
    id: 2,
    productId: "PRD-0002",
    name: "CRM Development",
    code: "CRM-DEV",
    type: "Service",
    category: "Sales",
    description: "Custom CRM development based on agreed scope document",
    unit: "Project",
    defaultPrice: 200000,
    currency: "INR",
    taxRate: 18,
    status: "Active",
    notes: "",
  },
  {
    id: 3,
    productId: "PRD-0003",
    name: "ERP Software — Standard License",
    code: "ERP-STD",
    type: "Product",
    category: "Enterprise",
    description: "Standard ERP license with finance, inventory, and HR modules",
    unit: "License",
    defaultPrice: 500000,
    currency: "INR",
    taxRate: 18,
    status: "Active",
    notes: "",
  },
  {
    id: 4,
    productId: "PRD-0004",
    name: "Website Development",
    code: "WEB-DEV",
    type: "Service",
    category: "Marketing",
    description: "Design and development of a responsive corporate website",
    unit: "Project",
    defaultPrice: 80000,
    currency: "INR",
    taxRate: 18,
    status: "Active",
    notes: "",
  },
  {
    id: 5,
    productId: "PRD-0005",
    name: "Monthly Software Subscription",
    code: "SUB-MONTH",
    type: "Service",
    category: "Subscription",
    description: "Monthly subscription to our SaaS platform",
    unit: "User/Month",
    defaultPrice: 15000,
    currency: "INR",
    taxRate: 18,
    status: "Active",
    notes: "",
  },
  {
    id: 6,
    productId: "PRD-0006",
    name: "Support & Maintenance",
    code: "SUP-MAINT",
    type: "Service",
    category: "Support",
    description: "Annual support and maintenance package",
    unit: "Year",
    defaultPrice: 25000,
    currency: "INR",
    taxRate: 18,
    status: "Active",
    notes: "",
  },
  {
    id: 7,
    productId: "PRD-0007",
    name: "Attendance System — Biometric Bundle",
    code: "ATT-BIO",
    type: "Product",
    category: "Hardware",
    description: "Biometric attendance device + software bundle",
    unit: "Unit",
    defaultPrice: 45000,
    currency: "INR",
    taxRate: 18,
    status: "Inactive",
    notes: "Discontinued in Q3 2026",
  },
];

const TYPES = ["Product", "Service"];
const STATUSES = ["Active", "Inactive"];
const CATEGORIES = [
  "Human Resources",
  "Sales",
  "Enterprise",
  "Marketing",
  "Subscription",
  "Support",
  "Hardware",
  "Other",
];

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const formatCurrency = (n, currency = "INR") => {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "AED" ? "AED " : "";
  return `${symbol}${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusBadge = (status) => {
  const map = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[status] || map.Active;
};

const typeBadge = (type) => {
  const map = {
    Product: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Service: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return map[type] || map.Product;
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState(PRODUCTS);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // ------------------------------------------------------------
  // Filtering
  // ------------------------------------------------------------
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.type && p.type !== filters.type) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.status && p.status !== filters.status) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.productId.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, filters, search]);

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const pageProducts = filtered.slice(start, start + perPage);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------
  const summary = useMemo(() => {
    const active = products.filter((p) => p.status === "Active").length;
    const inactive = products.filter((p) => p.status === "Inactive").length;
    const productCount = products.filter((p) => p.type === "Product").length;
    const serviceCount = products.filter((p) => p.type === "Service").length;

    return {
      total: products.length,
      active,
      inactive,
      productCount,
      serviceCount,
    };
  }, [products]);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleModalSubmit = (data, isEdit) => {
    if (isEdit && editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...data } : p,
        ),
      );
      showToast("Product updated successfully", "success");
    } else {
      const newProduct = {
        ...data,
        id: Date.now(),
        productId: `PRD-${String(products.length + 1).padStart(4, "0")}`,
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast("Product created successfully", "success");
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteClick = (product) => {
    setPendingDelete(product);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setProducts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    showToast(`"${pendingDelete.name}" deleted`, "success");
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const toggleStatus = (product) => {
    const nextStatus = product.status === "Active" ? "Inactive" : "Active";
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, status: nextStatus } : p,
      ),
    );
    showToast(`"${product.name}" is now ${nextStatus}`, "success");
  };

  const handleDuplicate = (product) => {
    const dup = {
      ...product,
      id: Date.now(),
      productId: `PRD-${String(products.length + 1).padStart(4, "0")}`,
      name: `${product.name} (Copy)`,
      code: `${product.code}-COPY`,
      status: "Inactive",
    };
    setProducts((prev) => [dup, ...prev]);
    showToast(`Duplicated as "${dup.name}"`, "success");
  };

  const clearFilters = () => {
    setFilters({ type: "", category: "", status: "" });
    setSearch("");
    setCurrentPage(1);
  };

  const resetToFirstPage = () => setCurrentPage(1);

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
            onClick={() => navigate("/admin/crm/products/import")}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Upload size={15} /> Import
          </button>
          <button
            onClick={() => showToast("Export started", "success")}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> Export
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
        <SummaryCard label="Total Items" value={summary.total} icon={Layers} color="blue" />
        <SummaryCard label="Active" value={summary.active} icon={CheckCircle2} color="green" />
        <SummaryCard label="Inactive" value={summary.inactive} icon={XCircle} color="gray" />
        <SummaryCard label="Products" value={summary.productCount} icon={Package} color="indigo" />
        <SummaryCard label="Services" value={summary.serviceCount} icon={Wrench} color="purple" />
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
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FilterSelect
              label="Type"
              value={filters.type}
              onChange={(v) => {
                setFilters((f) => ({ ...f, type: v }));
                resetToFirstPage();
              }}
              options={TYPES}
            />
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(v) => {
                setFilters((f) => ({ ...f, category: v }));
                resetToFirstPage();
              }}
              options={CATEGORIES}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(v) => {
                setFilters((f) => ({ ...f, status: v }));
                resetToFirstPage();
              }}
              options={STATUSES}
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
              {pageProducts.length > 0 ? (
                pageProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {p.productId}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {p.name}
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
                      {p.category}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 max-w-[240px] truncate">
                      {p.description}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {p.unit}
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
                            p.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() => toggleStatus(p)}
                        />
                        <IconBtn
                          icon={Copy}
                          color="text-teal-500"
                          title="Duplicate"
                          onClick={() => handleDuplicate(p)}
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
      {totalFiltered > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalFiltered}
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
        categories={CATEGORIES}
        onSubmit={handleModalSubmit}
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
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
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

const FilterSelect = ({ label, value, onChange, options }) => (
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