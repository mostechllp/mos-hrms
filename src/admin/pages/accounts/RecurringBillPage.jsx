import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRecurringBill } from "../../store/slices/accounts/recurringBillsSlice";
import {
  Plus,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  FileText,
  Edit2,
  X,
  PlayCircle,
  ArrowRight,
  RefreshCw,
  IndianRupee,
  Eye,
  Trash2,
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const RecurringBillsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bills = useSelector((state) => state.recurringBills.recurringBills);

  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bills based on search
  const filteredBills = bills.filter(
    (b) =>
      b.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    const idToDelete = deleteTarget.id;

    try {
      await dispatch(deleteRecurringBill(idToDelete)).unwrap();
      
      // Reset all state on success
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteError(null);
      
      if (selectedBill?.id === idToDelete) {
        setSelectedBill(null);
      }
    } catch (err) {
      console.error("Failed to delete recurring bill:", err);
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete. Please try again.");
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            All Recurring Bills
          </h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate("/admin/accounts/purchases/recurring-bills/new")
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1 rounded"
          >
            <Plus size={16} /> New
          </button>
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 pb-20 px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-normal text-gray-800 mb-2">
              Create. Set. Repeat.
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">
              Do you pay bills every so often? Start paying your vendors on time
              by creating recurring bills.
            </p>
            <button
              onClick={() =>
                navigate("/admin/accounts/purchases/recurring-bills/new")
              }
              className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5 rounded font-semibold"
            >
              CREATE RECURRING BILL
            </button>
            <div className="mt-4">
              <button className="text-blue-600 text-sm hover:underline">
                Import Recurring Bills
              </button>
            </div>
          </div>

          <div className="w-full max-w-5xl mt-8 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-8">
              Life cycle of a Recurring Bill
            </h3>
            <div className="flex justify-center items-center gap-2 text-xs font-semibold text-gray-600">
              <div className="border border-blue-300 bg-blue-50 text-blue-700 rounded px-4 py-2 flex items-center gap-2">
                <span className="text-base">🔄</span> ROUTINE PURCHASE
              </div>
              <ArrowRight size={16} className="text-gray-400" />
              <div className="border border-blue-300 bg-blue-50 text-blue-700 rounded px-4 py-2 flex items-center gap-2">
                <span className="text-base">📝</span> CREATE RECURRING PROFILE
              </div>
              <ArrowRight size={16} className="text-gray-400" />
              <div className="border border-blue-300 bg-blue-50 text-blue-700 rounded px-4 py-2 flex items-center gap-2">
                <span className="text-base">📄</span> GENERATED BILL
              </div>
              <ArrowRight size={16} className="text-gray-400" />
              <div className="border border-green-300 bg-green-50 text-green-700 rounded px-4 py-2 flex items-center gap-2">
                <span className="text-base">💰</span> RECORD PAYMENT
              </div>
            </div>

            <div className="mt-12 text-left inline-block">
              <h4 className="text-base font-medium text-gray-800 mb-4">
                In the Recurring Bills module, you can:
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" /> Create a
                  recurring profile to automatically generate bills.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" /> View when
                  each bill was generated under the recurring profile.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" /> Create an
                  individual bill within the recurring profile.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* LIST TABLE */
        <>
          {/* Filter / Search Bar */}
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Filter size={16} />
              </button>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="relative w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search recurring bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-700">
                    Profile Name <ArrowUpDown size={12} className="inline ml-1" />
                  </th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Bill Date</th>
                  <th className="px-4 py-3">Recurring Period</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    onClick={() => {
                      setSelectedBill(bill);
                      setActiveTab("Overview");
                    }}
                  >
                    <td
                      className="px-6 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">
                      {bill.profileName}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {bill.vendor}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bill.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {bill.nextBillDate || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {bill.repeatEvery}ly
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-right">
                      ₹{Number(bill.total).toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setActiveTab("Overview");
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/accounts/purchases/recurring-bills/edit/${bill.id}`
                            )
                          }
                          className="p-1.5 text-gray-500 hover:text-green-600 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(bill)}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
      {selectedBill && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-sm"
            onClick={() => setSelectedBill(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[50%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedBill.profileName}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/admin/accounts/purchases/recurring-bills/edit/${selectedBill.id}`
                    )
                  }
                  className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedBill)}
                  className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white flex items-center gap-1 bg-white">
                  <FileText size={14} /> Create Bill
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white flex items-center gap-1 bg-white">
                  More <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 px-6 border-b border-gray-200 bg-white">
              {["Overview", "Next Bill", "Recent Activities"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {activeTab === "Overview" && (
                <div className="flex gap-6">
                  {/* Left Column - Profile Details */}
                  <div className="w-1/3 space-y-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gray-100 rounded text-gray-400 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedBill.vendor}
                          </p>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        DETAILS
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Profile Status:</span>{" "}
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                            ACTIVE
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Start Date:</span>{" "}
                          <span className="text-gray-800">
                            {selectedBill.startOn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">End Date:</span>{" "}
                          <span className="text-gray-800">
                            {selectedBill.neverExpires
                              ? "Never Expires"
                              : selectedBill.endsOn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Terms:</span>{" "}
                          <span className="text-gray-800">
                            {selectedBill.paymentTerms}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Stats & Child Bills */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">
                          Bill Amount
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{Number(selectedBill.total).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">
                          Next Bill Date
                        </p>
                        <p className="text-lg font-semibold text-blue-600">
                          {selectedBill.nextBillDate}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">
                          Recurring Period
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedBill.repeatEvery}ly
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm min-h-[200px]">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-sm font-semibold text-gray-800">
                          All Child Bills
                        </h3>
                        <ChevronDown size={14} className="text-blue-600" />
                      </div>
                      <div className="text-center py-10">
                        <p className="text-gray-500 text-sm">
                          Recurring Bills for this profile will begin from{" "}
                          <strong>{selectedBill.nextBillDate}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== "Overview" && (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No data available for {activeTab}.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Recurring Bill"
        message={
          deleteError
            ? deleteError
            : isDeleting
            ? "Deleting recurring bill, please wait..."
            : `Are you sure you want to delete "${deleteTarget?.profileName}"? This action cannot be undone.`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
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

export default RecurringBillsPage;