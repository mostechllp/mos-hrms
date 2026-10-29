import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateChallanStatus, deleteChallan } from "../../store/slices/accounts/deliveryChallansSlice";
import { 
  Plus, MoreHorizontal, ArrowUpDown, Download, Upload, 
  Settings, Search, Filter, ChevronDown, 
  Eye, Edit2, Trash2, X, FileText, CheckCircle2,
  Mail, Printer, ChevronRight, RotateCcw, HelpCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "../../components/accounts/ui";
import ConfirmModal from "../../components/common/ConfirmModal";

const DeliveryChallansPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const challans = useSelector((state) => state.deliveryChallans.challans);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Delete State
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredChallans = challans.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.challanNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteChallan(deleteTarget.id));
      setDeleteTarget(null);
      if (selectedChallan?.id === deleteTarget.id) {
        setSelectedChallan(null); 
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">All Delivery Challans</h1>
          <ChevronDown size={18} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/admin/accounts/sales/challans/new")} 
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

      {challans.length === 0 ? (
        // Empty State Layout
        <div className="flex flex-col items-center justify-center pt-10 pb-20 px-6">
          
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Deliver Goods effectively!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Create, customize and print professional Delivery Challans
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate("/admin/accounts/sales/challans/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-semibold tracking-wide uppercase">
              Create Delivery Challan
            </Button>
          </div>

          {/* Life Cycle Section - Rebuilt for Accuracy */}
          <div className="mt-24 w-full max-w-5xl border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200 mb-16">Life cycle of a Delivery Challan</h3>
            
            {/* Case 1 */}
            <div className="mb-20">
                <div className="relative flex items-center justify-center mb-10">
                    <div className="absolute w-full border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="relative bg-white dark:bg-gray-800 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Case 1: Relocating Goods</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center relative">
                    
                    {/* Step 1 */}
                    <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-blue-600 w-44 z-10 shadow-sm">
                        <FileText size={20} className="mb-1" />
                        <span className="text-[11px] font-bold text-center leading-tight">CREATE<br/>DELIVERY CHALLAN</span>
                    </div>
                    
                    {/* Connector 1 */}
                    <div className="hidden md:flex flex-col items-center justify-center w-24 relative">
                        <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                        <span className="absolute -top-4 text-[10px] text-gray-400 font-medium">CONVERT<br/>TO OPEN</span>
                    </div>

                    {/* Step 2 */}
                    <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-blue-600 w-40 z-10 shadow-sm">
                        <HelpCircle size={20} className="mb-1" />
                        <span className="text-[11px] font-bold text-center leading-tight">GOODS DELIVERED ?</span>
                    </div>

                    {/* Connector 2 - Branched */}
                    <div className="hidden md:flex flex-col justify-center w-20 relative h-24 ml-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-300"></div>
                        <span className="absolute right-0 -top-1 text-[10px] text-gray-400 font-medium bg-white dark:bg-gray-800 px-1">YES</span>
                        
                        <div className="absolute left-0 top-1/2 h-12 border-l-2 border-dashed border-gray-300"></div>
                        <div className="absolute left-0 bottom-0 w-full border-t-2 border-dashed border-gray-300"></div>
                        <span className="absolute right-0 bottom-1 text-[10px] text-gray-400 font-medium bg-white dark:bg-gray-800 px-1">NO</span>
                    </div>

                    {/* Right Side Branches */}
                    <div className="flex flex-col gap-6">
                        {/* Yes Branch */}
                        <div className="border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-green-600 w-44 z-10 shadow-sm">
                            <CheckCircle2 size={20} className="mb-1" />
                            <span className="text-[11px] font-bold text-center leading-tight">MARK AS<br/>DELIVERED</span>
                        </div>
                        
                        {/* No Branch */}
                        <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-red-600 w-44 z-10 shadow-sm">
                            <RotateCcw size={20} className="mb-1" />
                            <span className="text-[11px] font-bold text-center leading-tight">MARK AS<br/>RETURNED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Case 2 */}
            <div className="mb-20">
                <div className="relative flex items-center justify-center mb-10">
                    <div className="absolute w-full border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="relative bg-white dark:bg-gray-800 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Case 2: Delivering Goods</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center relative">
                    
                    {/* Step 1 */}
                    <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-blue-600 w-44 z-10 shadow-sm">
                        <FileText size={20} className="mb-1" />
                        <span className="text-[11px] font-bold text-center leading-tight">CREATE<br/>DELIVERY CHALLAN</span>
                    </div>
                    
                    {/* Connector 1 */}
                    <div className="hidden md:flex flex-col items-center justify-center w-24 relative">
                        <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                        <span className="absolute -top-4 text-[10px] text-gray-400 font-medium">CONVERT<br/>TO OPEN</span>
                    </div>

                    {/* Step 2 */}
                    <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-blue-600 w-40 z-10 shadow-sm">
                        <HelpCircle size={20} className="mb-1" />
                        <span className="text-[11px] font-bold text-center leading-tight">SALE COMPLETED ?</span>
                    </div>

                    {/* Connector 2 - Branched */}
                    <div className="hidden md:flex flex-col justify-center w-20 relative h-24 ml-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-300"></div>
                        <span className="absolute right-0 -top-1 text-[10px] text-gray-400 font-medium bg-white dark:bg-gray-800 px-1">YES</span>
                        
                        <div className="absolute left-0 top-1/2 h-12 border-l-2 border-dashed border-gray-300"></div>
                        <div className="absolute left-0 bottom-0 w-full border-t-2 border-dashed border-gray-300"></div>
                        <span className="absolute right-0 bottom-1 text-[10px] text-gray-400 font-medium bg-white dark:bg-gray-800 px-1">NO</span>
                    </div>

                    {/* Right Side Branches */}
                    <div className="flex flex-col gap-6">
                        {/* Yes Branch */}
                        <div className="border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-green-600 w-44 z-10 shadow-sm">
                            <CheckCircle2 size={20} className="mb-1" />
                            <span className="text-[11px] font-bold text-center leading-tight">CONVERT TO<br/>INVOICE</span>
                        </div>
                        
                        {/* No Branch */}
                        <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg px-6 py-3 flex flex-col items-center text-red-600 w-44 z-10 shadow-sm">
                            <RotateCcw size={20} className="mb-1" />
                            <span className="text-[11px] font-bold text-center leading-tight">MARK AS<br/>RETURNED</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center">
              <h4 className="text-lg text-gray-800 dark:text-gray-200 mb-6">In the Delivery Challan module, you can:</h4>
              <div className="space-y-3 inline-block text-left text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Create delivery challans to accompany your goods when they are in transit.</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Convert a delivery challan into an invoice to charge your customers.</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Mark your delivery challan as returned or record partial returns.</p>
              </div>
            </div>
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
                placeholder="Search challans..."
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
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Challan # <ArrowUpDown size={12} className="inline ml-1" /></th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Challan Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredChallans.map((challan) => (
                  <tr
                    key={challan.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    onClick={() => setSelectedChallan(challan)} 
                  >
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {challan.challanNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{challan.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{challan.date}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{challan.challanType}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {challan.currency} {challan.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                           challan.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 
                           challan.status === 'Open' ? 'bg-blue-100 text-blue-600' :
                           challan.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                           'bg-red-100 text-red-600'
                       }`}>
                         {challan.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedChallan(challan)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Eye size={16} /></button>
                        <button onClick={() => navigate(`/admin/accounts/sales/challans/edit/${challan.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteTarget(challan)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
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
      {selectedChallan && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setSelectedChallan(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedChallan.challanNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedChallan.status === 'Draft' ? 'bg-gray-200 text-gray-700' : 
                    selectedChallan.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                    {selectedChallan.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedChallan(null)} className="p-1 text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Edit2 size={14} className="mr-1"/> Edit
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <Printer size={14} className="mr-1"/> PDF/Print
                    </Button>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs h-8">
                    <RefreshCw size={14} className="mr-1"/> Convert to Open
                    </Button>
              </div>

              {/* PDF Preview */}
              <div className="border border-gray-300 dark:border-gray-600 p-8 bg-white text-black shadow-sm mx-auto max-w-2xl relative mt-4">
                    {/* Draft Watermark */}
                    {selectedChallan.status === 'Draft' && (
                        <div className="absolute top-0 left-0 bg-gray-400 text-white px-4 py-2 text-sm font-bold -rotate-45 transform -translate-x-8 translate-y-4 shadow-sm">
                            Draft
                        </div>
                    )}
                    
                    {/* PDF Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="text-xs">
                            <p className="font-bold text-gray-800 mb-1 text-sm">Fidha</p>
                            <p className="text-gray-600">Keralam</p>
                            <p className="text-gray-600">India</p>
                            <p className="text-gray-600">fidh3549@gmail.com</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-serif text-gray-800 tracking-wide mb-1">DELIVERY<br/>CHALLAN</h1>
                            <p className="text-[10px] text-gray-600 font-bold">Delivery Challan# {selectedChallan.challanNumber}</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="flex justify-between mb-6 text-xs">
                        <div>
                            <p className="font-bold text-gray-800 mb-1">Deliver To</p>
                            <p className="text-blue-600 font-medium underline">{selectedChallan.customerName}</p>
                        </div>
                        <div className="text-right space-y-1 text-gray-600">
                            <p><span className="inline-block w-24">Challan Date :</span> <span className="text-gray-900">{selectedChallan.date}</span></p>
                            <p><span className="inline-block w-24">Challan Type :</span> <span className="text-gray-900">{selectedChallan.challanType}</span></p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left text-xs mb-6">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-2 px-2 w-8 text-center">#</th>
                                <th className="py-2 px-2">Item & Description</th>
                                <th className="py-2 px-2 text-right w-16">Qty</th>
                                <th className="py-2 px-2 text-right w-20">Rate</th>
                                <th className="py-2 px-2 text-right w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {selectedChallan.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 px-2 text-center text-gray-500">{idx + 1}</td>
                                    <td className="py-3 px-2">
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                                    </td>
                                    <td className="py-3 px-2 text-right text-gray-700">{item.qty.toFixed(2)}<br/><span className="text-[9px] text-gray-400">cm</span></td>
                                    <td className="py-3 px-2 text-right text-gray-700">{item.rate.toFixed(2)}</td>
                                    <td className="py-3 px-2 text-right text-gray-700">{(item.qty * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64 text-xs">
                            <div className="flex justify-between py-1 text-gray-600">
                                <span>Sub Total</span>
                                <span className="text-gray-900">{selectedChallan.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 bg-gray-100 px-2 font-bold text-gray-900 mt-1">
                                <span>Total</span>
                                <span>₹{selectedChallan.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Words */}
                    <div className="text-xs text-gray-600 mb-12 flex gap-2">
                        <span className="font-bold">Total In Words:</span>
                        <span className="italic">Indian Rupee Three Hundred Thirty-Three Only</span>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-xs text-gray-500">
                        <p>Authorized Signature _________________________</p>
                    </div>
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
        title="Delete Delivery Challan"
        message={`Are you sure you want to delete challan "${deleteTarget?.challanNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default DeliveryChallansPage;