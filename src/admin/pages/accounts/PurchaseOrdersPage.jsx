import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePurchaseOrder } from "../../store/slices/accounts/purchaseOrdersSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, X, CheckCircle2,
  Mail, Share2, Printer, Sparkles, Package,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <Icon size={14} className="text-slate-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default: "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`p-1.5 rounded-md transition-colors ${tones[tone]}`}>
      <Icon size={15} />
    </button>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    Draft:     "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Issued:    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Received:  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
  >
    <Icon size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.purchaseOrders.orders) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deletePurchaseOrder(deleteTarget.id));
      if (selectedOrder?.id === deleteTarget.id) setSelectedOrder(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Purchase orders
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {orders.length === 0
                ? "No purchase orders yet"
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} issued`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/purchases/purchase-orders/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={ArrowUpDown} label="Sort by" />
                  <MenuItem icon={Download}   label="Import" />
                  <MenuItem icon={Upload}     label="Export" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {orders.length === 0 ? (
          <Surface className="py-16 px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Package size={22} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                No purchase orders yet
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Create a purchase order to formalize the products or services you're buying.
              </p>
              <button
                onClick={() => navigate("/admin/accounts/purchases/purchase-orders/new")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus size={13} /> Create purchase order
              </button>
            </div>
          </Surface>
        ) : (

          /* ---- Table surface ---- */
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label="Select all" />

              <div className="relative ml-auto w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        Order # <ArrowUpDown size={11} />
                      </span>
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                    <th className="px-4 py-2.5 text-left font-medium">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium">Delivery</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-slate-500">
                        No orders match “{searchQuery}”
                      </td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${order.orderNumber}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {order.orderNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{order.vendor}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{order.date}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {order.deliveryDate || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{order.total.toFixed(2)}
                      </td>

                      <td className="px-4 py-3"><StatusPill status={order.status} /></td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => setSelectedOrder(order)} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/purchases/purchase-orders/edit/${order.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(order)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>

      {/* ---- Drawer ---- */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[65%] lg:w-[60%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchase order</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                    {selectedOrder.orderNumber}
                  </h2>
                  <StatusPill status={selectedOrder.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">

              {/* Action row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/accounts/purchases/purchase-orders/edit/${selectedOrder.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <GhostAction icon={Mail}    label="Send" />
                <GhostAction icon={Share2}  label="Share" />
                <GhostAction icon={Printer} label="PDF / Print" />
                <GhostAction icon={CheckCircle2} label="Mark as issued" />
              </div>

              {/* What's next */}
              {selectedOrder.status === "Draft" && (
                <Surface className="p-4 bg-blue-50/60 dark:bg-blue-900/10 !border-blue-100 dark:!border-blue-900/40">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-blue-900 dark:text-blue-200">What's next?</p>
                      <p className="text-[12px] text-blue-700 dark:text-blue-300 mt-0.5">
                        Send this purchase order to your vendor or mark it as issued.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                          <Mail size={12} /> Send order
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          Mark as issued
                        </button>
                      </div>
                    </div>
                  </div>
                </Surface>
              )}

              <PoPreview order={selectedOrder} />

              <p className="text-center text-[11px] text-slate-500">
                PDF template <span className="font-medium text-slate-700 dark:text-slate-300">Standard</span> ·{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Change</a>
              </p>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete purchase order"
        message={`Are you sure you want to delete order "${deleteTarget?.orderNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- preview ---------- */

const PoPreview = ({ order }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-10 mx-auto max-w-3xl relative text-slate-800 dark:text-slate-200">
    {order.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 rounded">
        Draft
      </div>
    )}

    <div className="flex justify-between items-start mb-10">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
        <p className="text-slate-500">Kerala</p>
        <p className="text-slate-500">India</p>
        <p className="text-slate-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Purchase order</h1>
        <p className="text-[11px] text-slate-500 mt-1"># {order.orderNumber}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 text-[11.5px] mb-6">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Vendor</p>
          <p className="font-medium text-slate-900 dark:text-slate-100">{order.vendor}</p>
        </div>
        {order.deliveryAddress && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Deliver to</p>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{order.deliveryAddress}</p>
          </div>
        )}
      </div>
      <div className="text-right space-y-0.5 text-slate-500">
        <p>Date <span className="text-slate-900 dark:text-slate-100 ml-1">{order.date}</span></p>
        {order.deliveryDate && (
          <p>Delivery <span className="text-slate-900 dark:text-slate-100 ml-1">{order.deliveryDate}</span></p>
        )}
      </div>
    </div>

    <table className="w-full text-[11.5px] mb-4">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-y border-slate-200 dark:border-slate-800">
          <th className="text-left  font-medium py-2 w-6">#</th>
          <th className="text-left  font-medium py-2">Item</th>
          <th className="text-right font-medium py-2">Qty</th>
          <th className="text-right font-medium py-2">Rate</th>
          <th className="text-right font-medium py-2">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {order.items?.map((item, idx) => (
          <tr key={item.id ?? idx}>
            <td className="py-2 text-slate-400 tabular-nums">{idx + 1}</td>
            <td className="py-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              {item.description && <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>}
            </td>
            <td className="py-2 text-right tabular-nums">{Number(item.quantity).toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{Number(item.rate).toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{Number(item.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-64 text-[11.5px]">
        <div className="flex justify-between py-1 text-slate-500">
          <span>Subtotal</span>
          <span className="text-slate-900 dark:text-slate-100 tabular-nums">
            {Number(order.subTotal || order.total).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
          <span>Total</span>
          <span className="tabular-nums">₹{Number(order.total).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-12 flex justify-end text-[10.5px] text-slate-500">
      <div className="text-center">
        <div className="w-40 h-px bg-slate-300 dark:bg-slate-700 mb-1"></div>
        <p className="text-[9.5px]">Authorized signature</p>
      </div>
    </div>
  </div>
);

export default PurchaseOrdersPage;