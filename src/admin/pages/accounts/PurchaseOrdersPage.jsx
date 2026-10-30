import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePurchaseOrder } from "../../store/slices/accounts/purchaseOrdersSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Mail, Share2, Printer, Sparkles
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.purchaseOrders.orders);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPdfView, setShowPdfView] = useState(true);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deletePurchaseOrder(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedOrder?.id === deleteTarget.id) {
        setSelectedOrder(null); 
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-x-hidden pb-24">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Purchase Orders</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/purchases/purchase-orders/new")} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          >
            <Plus size={16} className="mr-1" /> New
          </Button>

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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table View (Main Page) */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-16 pb-20 px-6">
           {/* Empty state... */}
           <p className="text-gray-500 mb-4">No purchase orders found.</p>
        </div>
      ) : (
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
                placeholder="Search orders..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Order # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Delivery Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedOrder(order)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.vendor}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.date}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.deliveryDate || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           order.status === 'Issued' ? 'bg-green-100 text-green-700' : 
                           order.status === 'Draft' ? 'bg-gray-200 text-gray-700' :
                           'bg-blue-100 text-blue-700'
                       }`}>
                         {order.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/purchases/purchase-orders/edit/${order.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
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

      {/* SLIDING PANEL (Document View) */}
      {selectedOrder && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-[1px]"
            onClick={() => setSelectedOrder(null)}
          />
          
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-[#F8F9FA] dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Panel Header (Action Bar) */}
            <div className="flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
               {/* Top Row: Title & Actions */}
               <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedOrder.orderNumber}
                     </h2>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                     <button 
                        onClick={() => navigate(`/admin/accounts/purchases/purchase-orders/edit/${selectedOrder.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                     >
                        <Edit2 size={14} /> Edit
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Mail size={14} /> Send Email
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Share2 size={14} /> Share
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Printer size={14} /> PDF/Print <ChevronDown size={14} className="ml-0.5" />
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <CheckCircle2 size={14} /> Mark as Issued
                     </button>
                     <button className="p-1.5 ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <MoreHorizontal size={18} />
                     </button>
                     
                     <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                     
                     <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        <X size={20} />
                     </button>
                  </div>
               </div>

               {/* Bottom Row: What's Next Banner */}
               <div className="px-6 py-4">
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-md p-4 flex items-center justify-between">
                     <div className="flex items-start gap-3">
                        <Sparkles size={20} className="text-blue-500 mt-0.5" />
                        <div>
                           <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">WHAT'S NEXT?</h3>
                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Send this purchase order to your vendor or mark it as issued.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                        <Button className="bg-[#3B82F6] hover:bg-blue-600 text-white text-sm px-4 h-8">
                           Send Purchase Order
                        </Button>
                        <Button variant="outline" className="text-sm h-8 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                           Mark as Issued
                        </Button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Scrollable Document Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
               
               {/* PDF View Toggle */}
               <div className="w-full max-w-4xl flex justify-end mb-4">
                  <label className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                     <span className="italic">Show PDF View</span>
                     <div 
                        onClick={() => setShowPdfView(!showPdfView)}
                        className={`w-9 h-5 rounded-full relative transition-colors ${showPdfView ? 'bg-blue-500' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${showPdfView ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
                     </div>
                  </label>
               </div>

               {/* Document Paper Layout */}
               <div className="w-full max-w-4xl bg-white text-black shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-200 relative flex flex-col min-h-[1000px] mb-8">
                  
                  {/* Draft Ribbon */}
                  {selectedOrder.status === 'Draft' && (
                     <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
                        <div className="bg-[#8A949E] text-white text-sm font-semibold tracking-wider text-center py-1.5 shadow-md transform -rotate-45 translate-x-[-35px] translate-y-[25px] w-[160px]">
                           Draft
                        </div>
                     </div>
                  )}

                  <div className="p-10 md:p-16 flex-1 flex flex-col font-sans">
                     
                     {/* Header: Company vs Document Title */}
                     <div className="flex justify-between items-start mb-24 mt-4">
                        <div className="text-sm space-y-1">
                           <div className="font-bold text-[15px] text-gray-900 mb-1">Fidha</div>
                           <div className="text-gray-600">Kerala</div>
                           <div className="text-gray-600">India</div>
                           <div className="text-gray-600 text-xs mt-2">fidh3549@gmail.com</div>
                        </div>
                        <div className="text-right">
                           <h1 className="text-[32px] font-serif text-black tracking-wide mb-2 uppercase leading-tight">
                              PURCHASE<br/>ORDER
                           </h1>
                           <p className="text-[13px] font-bold text-gray-700"># {selectedOrder.orderNumber}</p>
                        </div>
                     </div>

                     {/* Addresses & Date */}
                     <div className="flex justify-between mb-12 text-sm">
                        <div className="space-y-6">
                           <div>
                              <p className="text-gray-500 mb-1 text-xs">Vendor Address</p>
                              <p className="font-semibold text-[#3B82F6] cursor-pointer hover:underline">{selectedOrder.vendor}</p>
                           </div>
                           <div>
                              <p className="text-gray-500 mb-1 text-xs">Deliver To</p>
                              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedOrder.deliveryAddress}</p>
                              <p className="text-gray-800 mt-1">Kerala</p>
                              <p className="text-gray-800">India</p>
                              <p className="text-gray-800 text-xs mt-2">fidh3549@gmail.com</p>
                           </div>
                        </div>
                        
                        <div className="text-right mt-auto">
                           <p className="text-gray-600">
                              <span className="mr-6">Date :</span> 
                              <span className="font-medium text-gray-900">{selectedOrder.date}</span>
                           </p>
                        </div>
                     </div>

                     {/* Items Table */}
                     <div className="mb-8 flex-1">
                        <table className="w-full text-left text-[13px] border-collapse">
                           <thead>
                              <tr className="bg-[#333333] text-white">
                                 <th className="px-3 py-2 font-medium w-10 text-center">#</th>
                                 <th className="px-3 py-2 font-medium">Item & Description</th>
                                 <th className="px-3 py-2 font-medium text-right w-20">Qty</th>
                                 <th className="px-3 py-2 font-medium text-right w-24">Rate</th>
                                 <th className="px-3 py-2 font-medium text-right w-28">Amount</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200">
                              {selectedOrder.items.map((item, idx) => (
                                 <tr key={idx}>
                                    <td className="px-3 py-4 text-center text-gray-700 align-top">{idx + 1}</td>
                                    <td className="px-3 py-4 align-top">
                                       <div className="font-medium text-gray-900">{item.name}</div>
                                       {item.description && (
                                          <div className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{item.description}</div>
                                       )}
                                    </td>
                                    <td className="px-3 py-4 text-right align-top text-gray-700">
                                       {Number(item.quantity).toFixed(2)}
                                       <div className="text-[10px] text-gray-500 mt-0.5">cm</div>
                                    </td>
                                    <td className="px-3 py-4 text-right align-top text-gray-700">
                                       {Number(item.rate).toFixed(2)}
                                       <div className="text-[10px] text-gray-500 mt-0.5">00</div>
                                    </td>
                                    <td className="px-3 py-4 text-right align-top font-medium text-gray-900">
                                       {Number(item.amount).toFixed(2)}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Totals Section */}
                     <div className="flex justify-end mb-16">
                        <div className="w-1/2 space-y-3 text-[13px]">
                           <div className="flex justify-between py-1 text-gray-600">
                              <span>Sub Total</span>
                              <span className="font-medium text-gray-900">{Number(selectedOrder.subTotal || selectedOrder.total).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between py-2 border-t border-b border-gray-100">
                              <span className="font-bold text-gray-900">Total</span>
                              <span className="font-bold text-gray-900">₹{Number(selectedOrder.total).toFixed(2)}</span>
                           </div>
                        </div>
                     </div>

                     {/* Signature */}
                     <div className="mt-auto pt-16">
                        <p className="text-[13px] text-gray-700">
                           Authorized Signature <span className="inline-block w-64 border-b border-gray-400 ml-2"></span>
                        </p>
                     </div>

                  </div>
               </div>

               {/* Footer outside paper */}
               <div className="w-full max-w-4xl text-center text-sm text-gray-600 dark:text-gray-400 pb-8">
                  PDF Template : 'Standard Template' <a href="#" className="text-blue-600 hover:underline">Change</a>
               </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete order "${deleteTarget?.orderNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PurchaseOrdersPage;