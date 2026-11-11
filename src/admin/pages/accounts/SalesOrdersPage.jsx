import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatus, deleteOrder } from "../../store/slices/accounts/salesOrdersSlice";
import {
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload,
  Settings, Search, Filter, ChevronDown,
  Eye, Edit2, Trash2, X, Mail, Printer, CheckCircle2, Package,
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
    Confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Invoiced:  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{value || "—"}</p>
  </div>
);

const GhostAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
  >
    <Icon size={13} /> {label}
  </button>
);

/* ---------- page ---------- */

const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.salesOrders.orders) || [];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPdfView, setShowPdfView] = useState(false);
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
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteOrder(deleteTarget.id));
      if (selectedOrder?.id === deleteTarget.id) setSelectedOrder(null);
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = (status) => {
    if (selectedOrder) {
      dispatch(updateOrderStatus({ id: selectedOrder.id, status }));
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sales</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Sales orders
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {orders.length === 0
                ? "No sales orders yet"
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} issued`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/accounts/sales/orders/new")}
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
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Settings}   label="Preferences" />
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
                Start managing your sales activities
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
                Create, customize, and send professional sales orders.
              </p>
              <button
                onClick={() => navigate("/admin/accounts/sales/orders/new")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Plus size={13} /> Create sales order
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
                    <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                    <th className="px-4 py-2.5 text-left font-medium">Order date</th>
                    <th className="px-4 py-2.5 text-left font-medium">Shipment</th>
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
                      onClick={() => { setSelectedOrder(order); setShowPdfView(false); }}
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

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{order.customerName}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{order.orderDate}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {order.expectedShipmentDate || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {order.currency} {order.total.toFixed(2)}
                      </td>

                      <td className="px-4 py-3"><StatusPill status={order.status} /></td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Eye}    label="View"   onClick={() => { setSelectedOrder(order); setShowPdfView(false); }} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/sales/orders/edit/${order.id}`)} />
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
          <aside className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sales order</p>
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

              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/accounts/sales/orders/edit/${selectedOrder.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <GhostAction icon={Mail}          label="Send" />
                  <GhostAction icon={Printer}       label="PDF / Print" />
                  <GhostAction icon={CheckCircle2}  label="Confirm" onClick={() => handleStatusChange("Confirmed")} />
                </div>

                {/* PDF toggle */}
                <label className="flex items-center gap-2 text-[11.5px] text-slate-500 cursor-pointer select-none">
                  PDF view
                  <button
                    type="button"
                    onClick={() => setShowPdfView(!showPdfView)}
                    className={`w-8 h-4.5 rounded-full relative transition-colors ${showPdfView ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-700"}`}
                    style={{ height: 18 }}
                    aria-pressed={showPdfView}
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white dark:bg-slate-900 rounded-full transition-transform ${showPdfView ? "translate-x-3.5" : ""}`} style={{ width: 14, height: 14 }} />
                  </button>
                </label>
              </div>

              {/* What's next */}
              {selectedOrder.status === "Draft" && !showPdfView && (
                <Surface className="p-4 bg-blue-50/60 dark:bg-blue-900/10 !border-blue-100 dark:!border-blue-900/40">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-blue-900 dark:text-blue-200">What's next?</p>
                      <p className="text-[12px] text-blue-700 dark:text-blue-300 mt-0.5">
                        Send this sales order to your customer, or mark it as confirmed once approved.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                          <Mail size={12} /> Send
                        </button>
                        <button
                          onClick={() => handleStatusChange("Confirmed")}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          Mark as confirmed
                        </button>
                      </div>
                    </div>
                  </div>
                </Surface>
              )}

              {/* Details or PDF */}
              {showPdfView ? (
                <PdfPreview order={selectedOrder} />
              ) : (
                <>
                  {/* Summary */}
                  <Surface className="p-4">
                    <SectionLabel>Customer</SectionLabel>
                    <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {selectedOrder.customerName}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label="Email"           value={selectedOrder.customerEmail} />
                      <DetailItem label="Shipment date"   value={selectedOrder.expectedShipmentDate} />
                      <DetailItem label="Order date"      value={selectedOrder.orderDate} />
                      <DetailItem label="Payment terms"   value={selectedOrder.paymentTerms} />
                    </div>
                  </Surface>

                  {/* Items */}
                  <Surface className="overflow-hidden">
                    <div className="px-4 pt-4 pb-2"><SectionLabel>Items</SectionLabel></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12.5px]">
                        <thead>
                          <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                            <th className="text-left  font-medium px-4 py-2 w-8">#</th>
                            <th className="text-left  font-medium px-4 py-2">Item</th>
                            <th className="text-right font-medium px-4 py-2">Qty</th>
                            <th className="text-right font-medium px-4 py-2">Rate</th>
                            <th className="text-right font-medium px-4 py-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedOrder.items?.map((item, idx) => (
                            <tr key={item.id ?? idx}>
                              <td className="px-4 py-2.5 text-slate-400 tabular-nums">{idx + 1}</td>
                              <td className="px-4 py-2.5">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                                {item.description && <p className="text-[11.5px] text-slate-500 mt-0.5">{item.description}</p>}
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300 tabular-nums">{item.qty}</td>
                              <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300 tabular-nums">{item.rate.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                                {(item.qty * item.rate).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
                          <tr>
                            <td colSpan={4} className="px-4 py-1.5 text-right text-[11.5px] text-slate-500">Subtotal</td>
                            <td className="px-4 py-1.5 text-right text-[12.5px] text-slate-700 dark:text-slate-300 tabular-nums">
                              {selectedOrder.subtotal.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="px-4 py-1.5 text-right text-[11.5px] text-slate-500">Tax</td>
                            <td className="px-4 py-1.5 text-right text-[12.5px] text-slate-700 dark:text-slate-300 tabular-nums">
                              {selectedOrder.taxTotal.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="px-4 py-2.5 text-right text-[12px] font-semibold text-slate-900 dark:text-slate-100">Total</td>
                            <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {selectedOrder.total.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </Surface>

                  {/* Notes & Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Surface className="p-4">
                      <SectionLabel>Notes</SectionLabel>
                      <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedOrder.notes || <span className="text-slate-400 dark:text-slate-600">No notes provided.</span>}
                      </p>
                    </Surface>
                    <Surface className="p-4">
                      <SectionLabel>Terms &amp; conditions</SectionLabel>
                      <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedOrder.terms || <span className="text-slate-400 dark:text-slate-600">No terms and conditions.</span>}
                      </p>
                    </Surface>
                  </div>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete sales order"
        message={`Are you sure you want to delete order "${deleteTarget?.orderNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- PDF preview ---------- */

const PdfPreview = ({ order }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-6 sm:p-8 mx-auto max-w-2xl relative text-slate-800 dark:text-slate-200">
    {order.status === "Draft" && (
      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 rounded">
        Draft
      </div>
    )}

    <div className="flex justify-between items-start mb-10">
      <div className="text-[11.5px] space-y-0.5">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Fidha</p>
        <p className="text-slate-500">Keralam</p>
        <p className="text-slate-500">India</p>
        <p className="text-slate-500">fidh3549@gmail.com</p>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Sales order</h1>
        <p className="text-[11px] text-slate-500 mt-1">#{order.orderNumber}</p>
      </div>
    </div>

    <div className="flex justify-between items-end mb-6 text-[11.5px]">
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bill to</p>
        <p className="font-medium text-slate-900 dark:text-slate-100">{order.customerName}</p>
      </div>
      <div className="text-right space-y-0.5 text-slate-500">
        <p>Order date <span className="text-slate-900 dark:text-slate-100 ml-1">{order.orderDate}</span></p>
        {order.reference && (
          <p>Ref <span className="text-slate-900 dark:text-slate-100 ml-1">{order.reference}</span></p>
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
            <td className="py-2 text-right tabular-nums">{item.qty.toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{item.rate.toFixed(2)}</td>
            <td className="py-2 text-right tabular-nums">{(item.qty * item.rate).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-56 text-[11.5px]">
        <div className="flex justify-between py-1 text-slate-500">
          <span>Subtotal</span>
          <span className="text-slate-900 dark:text-slate-100 tabular-nums">{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
          <span>Total</span>
          <span className="tabular-nums">₹{order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-12 text-[10.5px] text-slate-500 flex justify-between">
      <span>Authorized signature _________________________</span>
      <span>1</span>
    </div>
  </div>
);

export default SalesOrdersPage;