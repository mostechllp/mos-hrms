import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addPurchaseOrder,
  updatePurchaseOrder,
} from "../../../store/slices/accounts/purchaseOrdersSlice";
import { X, Plus, Trash2, Search } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingOrder = useSelector((state) =>
    state.purchaseOrders.orders.find((o) => o.id === id),
  );

  const vendors = useSelector((state) => state.vendors?.vendors || []);

  const [formData, setFormData] = useState({
    orderNumber:
      existingOrder?.orderNumber ||
      `PO-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")}`,
    vendor: existingOrder?.vendor || "",
    referenceNumber: existingOrder?.referenceNumber || "",
    date: existingOrder?.date || new Date().toISOString().split("T")[0],
    deliveryDate: existingOrder?.deliveryDate || "",
    paymentTerms: existingOrder?.paymentTerms || "Due on Receipt",
    deliveryAddress: existingOrder?.deliveryAddress || "",
    shipmentPreference: existingOrder?.shipmentPreference || "",
    notes: existingOrder?.notes || "",
    termsAndConditions:
      existingOrder?.termsAndConditions ||
      "Payment is due immediately upon receipt.",
    items: existingOrder?.items || [
      {
        id: Date.now().toString(),
        name: "",
        account: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    status: existingOrder?.status || "Draft",
    currency: "INR",
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-calculate amount
    if (field === "quantity" || field === "rate") {
      newItems[index].amount =
        Number(newItems[index].quantity) * Number(newItems[index].rate);
    }

    setField("items", newItems);
  };

  const addItemRow = () => {
    setField("items", [
      ...formData.items,
      {
        id: Date.now().toString(),
        name: "",
        account: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setField("items", newItems);
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendor.trim()) return;

    const finalData = {
      ...formData,
      total: calculateTotal(),
      subTotal: calculateTotal(),
    };

    if (id) {
      dispatch(updatePurchaseOrder({ id, ...finalData }));
    } else {
      dispatch(addPurchaseOrder(finalData));
    }
    navigate("/admin/accounts/purchases/orders");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {id ? "Edit Purchase Order" : "New Purchase Order"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/accounts/purchases/orders")}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          {/* Top Section: Vendor Details */}
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <div className="flex w-full max-w-md">
                  <SearchableSelect
                    options={vendors.map((v) => ({
                      value: v.vendorName || v.name,
                      label: v.vendorName || v.name,
                    }))}
                    value={formData.vendor}
                    onChange={(val) => setField("vendor", val)}
                    placeholder="Select a Vendor"
                    className="rounded-r-none border-r-0"
                  />
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-3 border border-blue-500 rounded-r-md flex items-center justify-center"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`${inputCls} min-h-[80px]`}
                  value={formData.deliveryAddress}
                  onChange={(e) => setField("deliveryAddress", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Purchase Order# <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.orderNumber}
                  onChange={(e) => setField("orderNumber", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Reference#
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.referenceNumber}
                  onChange={(e) => setField("referenceNumber", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Date
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={formData.date}
                  onChange={(e) => setField("date", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Delivery Date
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={formData.deliveryDate}
                  onChange={(e) => setField("deliveryDate", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Payment Terms
                </label>
                <select
                  className={inputCls}
                  value={formData.paymentTerms}
                  onChange={(e) => setField("paymentTerms", e.target.value)}
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Shipment Preference
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.shipmentPreference}
                  onChange={(e) =>
                    setField("shipmentPreference", e.target.value)
                  }
                  placeholder="Choose the shipment preference"
                />
              </div>
            </div>
          </div>

          {/* Middle Section: Item Table */}
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              Item Table
            </h2>

            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3 w-1/3">Item Details</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3 w-24 text-right">Quantity</th>
                  <th className="px-4 py-3 w-24 text-right">Rate</th>
                  <th className="px-4 py-3 w-32 text-right">Amount</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {formData.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-2 text-gray-400 text-center cursor-move">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto"
                      >
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Type or click to select an item."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400 dark:text-gray-200 outline-none"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-500 dark:text-gray-400 outline-none"
                        value={item.account}
                        onChange={(e) =>
                          handleItemChange(index, "account", e.target.value)
                        }
                      >
                        <option value="">Select an account</option>
                        {/* Map your accounts here */}
                        <option value="Inventory">Inventory</option>
                        <option value="Office Supplies">Office Supplies</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-right dark:text-gray-200 outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-right dark:text-gray-200 outline-none"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium dark:text-gray-200">
                      {Number(item.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={addItemRow}
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Add New Row
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
              >
                <Plus size={16} /> Add Items in Bulk
              </Button>
            </div>
          </div>

          {/* Bottom Section: Totals & Notes */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Notes & Terms */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Notes
                </label>
                <textarea
                  className={`${inputCls} min-h-[100px]`}
                  placeholder="Will be displayed on purchase order"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Terms & Conditions
                </label>
                <textarea
                  className={`${inputCls} min-h-[100px]`}
                  placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setField("termsAndConditions", e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Attach File(s) to Purchase Order
                </label>
                <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 mb-2 bg-white dark:bg-gray-700"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload File
                  </Button>
                  <span className="text-xs text-gray-500">
                    You can upload a maximum of 10 files, 10MB each
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Totals */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 h-fit border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Sub Total
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  {calculateTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Discount
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className={`${inputCls} w-24 py-1 px-2 text-right`}
                    placeholder="0"
                  />
                  <span className="text-gray-500">%</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold w-16 text-right">
                    0.00
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 text-sm">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      className="text-blue-500 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      TDS
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      TCS
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <select className={`${inputCls} py-1 px-2 text-sm w-36`}>
                    <option>Select a Tax</option>
                  </select>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold w-16 text-right">
                    - 0.00
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Adjustment
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className={`${inputCls} w-24 py-1 px-2 text-right`}
                    placeholder="0.00"
                  />
                  <span className="text-gray-900 dark:text-gray-100 font-semibold w-16 text-right">
                    0.00
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 justify-end pb-12">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/accounts/purchases/orders")}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {id ? "Update Order" : "Save as Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
