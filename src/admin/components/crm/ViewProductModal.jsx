// src/admin/components/crm/ViewProductModal.jsx
import { useEffect, useState } from "react";
import {
  X, Package, Wrench, Pencil, Trash2, Loader,
  Building2, Hash, Tag, Layers as LayersIcon,
  IndianRupee, Percent, FileText, Info,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/common/Toast";
import {
  fetchProductById,
  clearCurrentProduct,
  fromProductApi,
} from "../../store/slices/productSlice";

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

const typeBadge = (type) => {
  const map = {
    Product: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Service:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return map[type] || map.Product;
};

const statusBadge = (status) => {
  const map = {
    Active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[status] || map.Active;
};

// ---------- Info block ----------
const InfoBlock = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className="text-gray-400" />
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
      {value || "—"}
    </p>
  </div>
);

// ============================================================
// Main component
// ============================================================
const ViewProductModal = ({
  isOpen,
  onClose,
  productId,             // 👈 id of the product to fetch & view
  onEdit,                // (product) => void — parent opens the edit modal
  onDelete,              // (product) => void — parent opens confirm modal
}) => {
  const dispatch = useDispatch();

  const {
    currentProduct,
    currentProductLoading,
    currentProductError,
  } = useSelector((s) => s.products);

  const [loaded, setLoaded] = useState(false);

  // ── Fetch fresh data whenever the modal opens with an id ──
  useEffect(() => {
    if (!isOpen || !productId) return;
    setLoaded(false);
    dispatch(fetchProductById(productId));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [isOpen, productId, dispatch]);

  // Mark loaded once the currentProduct matches the requested id
  useEffect(() => {
    if (!isOpen) return;
    if (
      currentProduct &&
      String(currentProduct.id) === String(productId)
    ) {
      setLoaded(true);
    }
  }, [currentProduct, productId, isOpen]);

  // Esc to close
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const p = currentProduct ? fromProductApi(currentProduct) : null;
  const loading = currentProductLoading || (!loaded && !p);
  const error = currentProductError;

  return (
    <div
      className="fixed inset-0 z-[1150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                p?.type === "Service"
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30"
              }`}
            >
              {p?.type === "Service" ? (
                <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {loading ? "Loading…" : p?.name || "Product"}
              </h3>
              {p && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadge(
                      p.type,
                    )}`}
                  >
                    {p.type}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(
                      p.status,
                    )}`}
                  >
                    {p.status}
                  </span>
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                    {p.productId}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-500 dark:text-gray-400">
              <Loader size={16} className="animate-spin" />
              Loading product…
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
              <Info className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          ) : p ? (
            <>
              {/* Highlights: price / tax */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <IndianRupee
                      size={12}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Default Price
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(p.defaultPrice, p.currency)}
                  </p>
                  <p className="text-[11px] text-blue-700/70 dark:text-blue-300/70 mt-0.5">
                    {p.currency}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Percent
                      size={12}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Tax Rate
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {p.taxRate}%
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Applicable on line total
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag
                      size={12}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Unit
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {p.unit || "—"}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Billing unit
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBlock
                    icon={Hash}
                    label="Code / SKU"
                    value={p.code}
                  />
                  <InfoBlock
                    icon={LayersIcon}
                    label="Category"
                    value={p.category}
                  />
                  <InfoBlock
                    icon={Building2}
                    label="Type"
                    value={p.type}
                  />
                  <InfoBlock
                    icon={FileText}
                    label="Status"
                    value={p.status}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {p.description || "No description provided."}
                </p>
              </div>

              {/* Notes */}
              {p.notes && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {p.notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <InfoBlock
                  icon={Info}
                  label="Created"
                  value={
                    p.createdAt
                      ? new Date(p.createdAt).toLocaleString("en-GB")
                      : "—"
                  }
                />
                <InfoBlock
                  icon={Info}
                  label="Last updated"
                  value={
                    p.updatedAt
                      ? new Date(p.updatedAt).toLocaleString("en-GB")
                      : "—"
                  }
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {p && !loading && !error && (
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Close
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(p)}
                className="px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(p)}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProductModal;