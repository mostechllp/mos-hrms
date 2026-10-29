import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatus, deleteOrder } from "../../store/slices/accounts/salesOrdersSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, Play, FileText, CheckCircle2,
  Mail, Printer
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.salesOrders.orders);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPdfView, setShowPdfView] = useState(false);

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteOrder(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedOrder?.id === deleteTarget.id) {
        setSelectedOrder(null); 
      }
    }
  };

  const handleStatusChange = (status) => {
    if (selectedOrder) {
      dispatch(updateOrderStatus({ id: selectedOrder.id, status }));
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Sales Orders</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/orders/new")} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          >
            <Plus size={16} className="mr-1" /> New
          </Button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 py-1 text-sm text-gray-700 dark:text-gray-200">
                   <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><ArrowUpDown size={14} /> Sort by</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><Download size={14} /> Import</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span className="flex items-center gap-2"><Upload size={14} /> Export</span>
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Settings size={14} /> Preferences
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          

          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Start Managing Your Sales Activities!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Create, customize and send professional Sales Orders.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/orders/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Create Sales Order
            </Button>
          </div>

        </div>
      ) : (
        // Table View
        <>
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Filter size={16} /></button>
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Sales Order # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Shipment Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => { setSelectedOrder(order); setShowPdfView(false); }} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{order.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.orderDate}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.expectedShipmentDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {order.currency} {order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           order.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 
                           order.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                           'bg-blue-100 text-blue-600'
                       }`}>
                         {order.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedOrder(order); setShowPdfView(false); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/orders/edit/${order.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(order)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sliding Drawer for View */}
      {selectedOrder && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedOrder.orderNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedOrder.status === 'Draft' ? 'bg-gray-200 text-gray-700' : 
                    selectedOrder.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                    {selectedOrder.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Edit2 size={14} className="mr-1"/> Edit
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Mail size={14} className="mr-1"/> Send Email
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Printer size={14} className="mr-1"/> PDF/Print
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <CheckCircle2 size={14} className="mr-1"/> Mark As Confirmed
                    </Button>
                </div>
                
                {/* PDF Toggle */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show PDF View</span>
                    <button 
                        onClick={() => setShowPdfView(!showPdfView)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${showPdfView ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showPdfView ? 'translate-x-5' : ''}`}></span>
                    </button>
                </div>
              </div>

              {/* What's Next Banner */}
              {selectedOrder.status === 'Draft' && !showPdfView && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                     ✨ WHAT'S NEXT?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                    Send this Sales Order to your customer by email or mark it as Confirmed.
                  </p>
                  <div className="flex gap-2">
                    <Button className="bg-blue-600 text-white text-xs h-8">Send Sales Order</Button>
                    <Button variant="secondary" onClick={() => handleStatusChange('Confirmed')} className="text-xs h-8">Mark as Confirmed</Button>
                  </div>
                </div>
              )}

              {/* Conditional: Details vs PDF View */}
              {showPdfView ? (
                <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative">
                    {/* Draft Watermark */}
                    <div className="absolute top-0 left-0 bg-gray-400 text-white px-4 py-2 text-sm font-bold -rotate-45 transform -translate-x-8 translate-y-4 shadow-sm">
                        Draft
                    </div>
                    
                    {/* PDF Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="text-sm">
                            <p className="font-bold text-gray-800 mb-1">Fidha</p>
                            <p className="text-gray-600">Keralam</p>
                            <p className="text-gray-600">India</p>
                            <p className="text-gray-600">fidh3549@gmail.com</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-serif text-gray-800 tracking-wide mb-2">SALES<br/>ORDER</h1>
                            <p className="text-xs text-gray-600">Sales Order# {selectedOrder.orderNumber}</p>
                        </div>
                    </div>

                    {/* Billing Info */}
                    <div className="flex justify-between items-end mb-8 text-sm">
                        <div>
                            <p className="font-bold text-gray-800 mb-1">Bill To</p>
                            <p className="text-blue-600 font-medium">{selectedOrder.customerName}</p>
                            <p className="text-gray-600 text-xs mt-1 leading-tight">
                                v v<br/>
                                bubvnv<br/>
                                bvn<br/>
                                nbvn bvnbv<br/>
                                Aland Islands
                            </p>
                        </div>
                        <div className="text-right text-xs space-y-1 text-gray-600">
                            <p>Order Date : <span className="text-gray-900">{selectedOrder.orderDate}</span></p>
                            <p>Ref# : <span className="text-gray-900">{selectedOrder.reference}</span></p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left text-xs mb-6">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="py-2 px-3 w-10">#</th>
                                <th className="py-2 px-3">Item & Description</th>
                                <th className="py-2 px-3 text-right">Qty</th>
                                <th className="py-2 px-3 text-right">Rate</th>
                                <th className="py-2 px-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {selectedOrder.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                                    </td>
                                    <td className="py-3 px-3 text-right text-gray-700">{item.qty.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right text-gray-700">{item.rate.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right text-gray-700">{(item.qty * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 text-xs">
                            <div className="flex justify-between py-1 text-gray-600">
                                <span>Sub Total</span>
                                <span className="text-gray-900">{selectedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 bg-gray-100 px-2 font-bold text-gray-900 mt-1">
                                <span>Total</span>
                                <span>₹{selectedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-xs text-gray-500">
                        <p>Authorized Signature _________________________</p>
                        <p className="text-right mt-4">1</p>
                    </div>
                </div>
              ) : (
                // Standard Details View
                <div className="space-y-6">
                   
                   {/* Customer Details */}
                   <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Customer Details</h3>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1">Customer Name</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Email</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.customerEmail || "-"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Order Date</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.orderDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Shipment Date</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.expectedShipmentDate}</p>
                        </div>
                      </div>
                   </div>

                   <hr className="border-gray-200 dark:border-gray-700" />

                   {/* Items Table */}
                   <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Items</h3>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                                  <tr>
                                      <th className="px-4 py-3">#</th>
                                      <th className="px-4 py-3">Item</th>
                                      <th className="px-4 py-3 text-right">Qty</th>
                                      <th className="px-4 py-3 text-right">Rate</th>
                                      <th className="px-4 py-3 text-right">Amount</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                  {selectedOrder.items.map((item, idx) => (
                                      <tr key={item.id}>
                                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                          <td className="px-4 py-3">
                                              <p className="font-medium text-blue-600 dark:text-blue-400">{item.name}</p>
                                              <p className="text-xs text-gray-500">{item.description}</p>
                                          </td>
                                          <td className="px-4 py-3 text-right">{item.qty}</td>
                                          <td className="px-4 py-3 text-right">{item.rate.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right font-medium">{(item.qty * item.rate).toFixed(2)}</td>
                                      </tr>
                                  ))}
                              </tbody>
                              <tfoot className="bg-gray-50 dark:bg-gray-700/30">
                                  <tr>
                                      <td colSpan={4} className="px-4 py-2 text-right text-gray-500 font-medium">Sub Total</td>
                                      <td className="px-4 py-2 text-right font-medium">{selectedOrder.subtotal.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                      <td colSpan={4} className="px-4 py-2 text-right text-gray-500 font-medium">Tax</td>
                                      <td className="px-4 py-2 text-right font-medium">{selectedOrder.taxTotal.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                      <td colSpan={4} className="px-4 py-3 text-right text-gray-800 dark:text-gray-200 font-bold">Total</td>
                                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{selectedOrder.total.toFixed(2)}</td>
                                  </tr>
                              </tfoot>
                          </table>
                      </div>
                   </div>

                   {/* Notes & Terms */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Customer Notes</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded border border-gray-100 dark:border-gray-700">{selectedOrder.notes || "No notes provided."}</p>
                       </div>
                       <div>
                          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Terms and Conditions</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded border border-gray-100 dark:border-gray-700">{selectedOrder.terms || "No terms and conditions."}</p>
                       </div>
                   </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sales Order"
        message={`Are you sure you want to delete order "${deleteTarget?.orderNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default SalesOrdersPage;