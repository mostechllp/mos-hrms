import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { X, Edit2, ChevronRight, Package } from "lucide-react";

/* ---------- primitives ---------- */

const Surface = ({ title, children, className = "" }) => (
  <section className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {title && (
      <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const DetailRow = ({ label, children, className = "" }) => (
  <div className={className}>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <div className="text-[13px] text-slate-800 dark:text-slate-100">{children}</div>
  </div>
);

const Empty = () => <span className="text-slate-400 dark:text-slate-600">—</span>;

const Meta = ({ label, value, tone }) => {
  const toneCls =
    tone === "pos" ? "text-emerald-600 dark:text-emerald-400" :
    tone === "neg" ? "text-rose-600 dark:text-rose-400" :
                     "text-slate-900 dark:text-slate-50";
  return (
    <div className="flex flex-col">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-[15px] font-semibold tabular-nums tracking-tight ${toneCls}`}>{value}</p>
    </div>
  );
};

/* ---------- page ---------- */

const ItemViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const item = useSelector((state) =>
    state.items.items.find((i) => i.id === id)
  );

  /* ---- Not found ---- */
  if (!item) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Package size={20} className="text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Item not found</h2>
          <p className="text-[13px] text-slate-500 mb-5">
            It may have been deleted, or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/admin/accounts/items")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Back to items
          </button>
        </div>
      </div>
    );
  }

  return (
    /* FULL WIDTH — no max-w container */
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/items" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Items</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
            </nav>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                {item.name}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {item.type}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              {item.usageUnit ? `Sold per ${item.usageUnit}` : "Item details"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/admin/accounts/items/edit/${item.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={() => navigate("/admin/accounts/items")}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ---- KPI strip ---- */}
        <Surface className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Meta label="Usage unit"    value={item.usageUnit || "—"} />
            <Meta label="Selling price" value={`$${(Number(item.rate) || 0).toFixed(2)}`}         tone="pos" />
            <Meta label="Cost price"    value={`$${(Number(item.purchaseRate) || 0).toFixed(2)}`} tone="neg" />
          </div>
        </Surface>

        {/* ---- Sales ---- */}
        <Surface title="Sales information" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <DetailRow label="Account">
              {item.salesAccount || "Sales"}
            </DetailRow>

            <DetailRow label="Description" className="md:col-span-2">
              {item.description ? (
                <p className="whitespace-pre-wrap leading-relaxed">{item.description}</p>
              ) : (
                <Empty />
              )}
            </DetailRow>
          </div>
        </Surface>

        {/* ---- Purchase ---- */}
        <Surface title="Purchase information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <DetailRow label="Account">
              {item.purchaseAccount || "Cost of Goods Sold"}
            </DetailRow>

            <DetailRow label="Preferred vendor">
              {item.preferredVendor || <Empty />}
            </DetailRow>

            <DetailRow label="Description" className="md:col-span-2">
              {item.purchaseDescription ? (
                <p className="whitespace-pre-wrap leading-relaxed">{item.purchaseDescription}</p>
              ) : (
                <Empty />
              )}
            </DetailRow>
          </div>
        </Surface>

      </div>
    </div>
  );
};

export default ItemViewPage;