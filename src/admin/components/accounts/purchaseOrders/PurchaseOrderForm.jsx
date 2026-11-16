// src/admin/pages/accounts/PurchaseOrderForm.jsx
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addPurchaseOrder,
  updatePurchaseOrder,
} from "../../../store/slices/accounts/purchaseOrdersSlice";
import { X, Plus, Trash2, Search, GripVertical, Upload, Settings, ChevronRight } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";
import TransactionNumberSettingsModal from "../common/TransactionNumberSettingsModal";

/* ---------- primitives ---------- */

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Card = ({ title, description, action, children, className = "" }) => (
  <section
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {(title || description || action) && (
      <div className="px-5 sm:px-6 pt-5 pb-1 flex items-start justify-between gap-3">
        <div>
          {title && (
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span className="font-medium text-gray-800 dark:text-gray-100 tabular-nums">
      {value}
    </span>
  </div>
);

/* ---------- page ---------- */

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingOrder = useSelector((state) =>
    state.purchaseOrders.orders.find((o) => o.id === id)
  );
  const vendors = useSelector((state) => state.vendors?.vendors || []);

  const [isNumberSettingsOpen, setIsNumberSettingsOpen] = useState(false);

  const [formData, setFormData] = useState({
    orderNumber:
      existingOrder?.orderNumber ||
      `PO-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`,
    vendor: existingOrder?.vendor || "",
    referenceNumber: existingOrder?.referenceNumber || "",
    date: existingOrder?.date || new Date().toISOString().split("T")[0],
    deliveryDate: existingOrder?.deliveryDate || "",
    paymentTerms: existingOrder?.paymentTerms || "Due on Receipt",
    deliveryAddress: existingOrder?.deliveryAddress || "",
    shipmentPreference: existingOrder?.shipmentPreference || "",
    notes: existingOrder?.notes || "",
    termsAndConditions:
      existingOrder?.termsAndConditions || "Payment is due immediately upon receipt.",
    items: existingOrder?.items || [
      { id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 },
    ],
    status: existingOrder?.status || "Draft",
    currency: "INR",
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;
    if (field === "quantity" || field === "rate") {
      next[index].amount =
        Number(next[index].quantity) * Number(next[index].rate);
    }
    setField("items", next);
  };
  const addItemRow = () =>
    setField("items", [
      ...formData.items,
      { id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  const removeItemRow = (index) =>
    setField(
      "items",
      formData.items.filter((_, i) => i !== index)
    );

  const calculateTotal = () =>
    formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.vendor.trim()) return;

    const finalData = {
      ...formData,
      total: calculateTotal(),
      subTotal: calculateTotal(),
    };
    if (id) dispatch(updatePurchaseOrder({ id, ...finalData }));
    else dispatch(addPurchaseOrder(finalData));
    navigate("/admin/accounts/purchases/purchase-orders");
  };

  const title = id ? "Edit purchase order" : "New purchase order";

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5 flex-wrap">
            <Link
              to="/admin/dashboard"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <Link
              to="/admin/accounts/purchases/purchase-orders"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Purchase orders
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {id ? existingOrder?.orderNumber || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update vendor, dates, and line items"
              : "Send a purchase order to a vendor for goods or services"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/purchases/purchase-orders")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Vendor & details ---- */}
        <Card
          title="Vendor & details"
          description="Who the order is for and its reference numbers"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div className="lg:col-span-2 space-y-4">
              <Field label="Vendor" required>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <SearchableSelect
                      options={vendors.map((v) => ({
                        value: v.vendorName || v.name,
                        label: v.vendorName || v.name,
                      }))}
                      value={formData.vendor}
                      onChange={(val) => setField("vendor", val)}
                      placeholder="Select a vendor…"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </Field>

              <Field label="Delivery address" required>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={formData.deliveryAddress}
                  onChange={(e) => setField("deliveryAddress", e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Purchase order #" required>
                <div className="relative">
                  <input
                    type="text"
                    className={`${inputCls} pr-10`}
                    value={formData.orderNumber}
                    onChange={(e) => setField("orderNumber", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsNumberSettingsOpen(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors"
                    title="Configure Purchase Order Number"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </Field>
              <Field label="Reference #">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.referenceNumber}
                  onChange={(e) => setField("referenceNumber", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.date}
                    onChange={(e) => setField("date", e.target.value)}
                  />
                </Field>
                <Field label="Delivery date">
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.deliveryDate}
                    onChange={(e) => setField("deliveryDate", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Field label="Payment terms">
              <select
                className={inputCls}
                value={formData.paymentTerms}
                onChange={(e) => setField("paymentTerms", e.target.value)}
              >
                <option value="Due on Receipt">Due on receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
              </select>
            </Field>
            <Field label="Shipment preference">
              <input
                type="text"
                className={inputCls}
                value={formData.shipmentPreference}
                onChange={(e) => setField("shipmentPreference", e.target.value)}
                placeholder="Choose the shipment preference"
              />
            </Field>
          </div>
        </Card>

        {/* ---- Line items ---- */}
        <Card
          title="Line items"
          description="What is being ordered"
          className="!py-0"
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[800px] border-collapse text-xs md:text-[12.5px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="w-8 py-2.5" />
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Item
                  </th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-36">
                    Account
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    Qty
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-28">
                    Rate
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-28">
                    Amount
                  </th>
                  <th className="w-8 py-2.5" />
                </tr>
              </thead>

              <tbody>
                {formData.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="align-top group border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-3 text-gray-300 dark:text-gray-600">
                      <GripVertical size={12} className="mx-auto" />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Item name"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition font-medium"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-3 px-3">
                      <select
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
                        value={item.account}
                        onChange={(e) =>
                          handleItemChange(index, "account", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Office Supplies">Office Supplies</option>
                      </select>
                    </td>

                    {["quantity", "rate"].map((key) => (
                      <td key={key} className="py-3 px-3">
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
                          value={item[key]}
                          onChange={(e) =>
                            handleItemChange(index, key, e.target.value)
                          }
                        />
                      </td>
                    ))}

                    <td className="text-right py-3 px-3 font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                      {Number(item.amount).toFixed(2)}
                    </td>

                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove line"
                        aria-label="Remove line"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 pb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={13} /> Add row
            </button>
          </div>
        </Card>

        {/* ---- Notes & totals ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Notes & terms">
            <div className="space-y-4">
              <Field label="Notes">
                <textarea
                  rows={3}
                  className={inputCls}
                  placeholder="Will be displayed on purchase order"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </Field>
              <Field label="Terms & conditions">
                <textarea
                  rows={3}
                  className={inputCls}
                  placeholder="Enter the terms and conditions of your business"
                  value={formData.termsAndConditions}
                  onChange={(e) => setField("termsAndConditions", e.target.value)}
                />
              </Field>
              <Field label="Attachments">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Upload size={13} /> Upload file
                </button>
                <p className="text-[11px] text-gray-500 mt-2">
                  Up to 10 files, 10 MB each.
                </p>
              </Field>
            </div>
          </Card>

          <Card title="Summary" className="h-fit">
            <div className="space-y-3 text-xs md:text-[12.5px]">
              <SummaryRow label="Subtotal" value={calculateTotal().toFixed(2)} />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-300">Discount</span>
                  <input
                    type="number"
                    className="w-16 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 tabular-nums"
                    placeholder="0"
                  />
                  <span className="text-[11.5px] text-gray-500">%</span>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  0.00
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center gap-1 text-[11.5px] text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      defaultChecked
                      className="text-green-500 focus:ring-green-400 border-gray-300"
                    />{" "}
                    TDS
                  </label>
                  <label className="inline-flex items-center gap-1 text-[11.5px] text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      className="text-green-500 focus:ring-green-400 border-gray-300"
                    />{" "}
                    TCS
                  </label>
                  <select className="text-[11.5px] px-1.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400">
                    <option>Select tax</option>
                  </select>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  -0.00
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-300">Adjustment</span>
                  <input
                    type="number"
                    className="w-20 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 tabular-nums"
                    placeholder="0.00"
                  />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  0.00
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                  Total ({formData.currency})
                </span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-50 tabular-nums">
                  {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/purchases/purchase-orders")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {id ? "Save changes" : "Save as draft"}
            </button>
          </div>
        </div>
      </form>

      {/* Reusable Number Settings Modal */}
      <TransactionNumberSettingsModal
        isOpen={isNumberSettingsOpen}
        onClose={() => setIsNumberSettingsOpen(false)}
        title="Configure Purchase Order Number Preferences"
        initialData={{ autoGenerate: true, prefix: "PO-", nextNumber: "00001", restartFiscalYear: false }}
        onSave={(data) => {
          console.log("Purchase Order Number Settings Saved:", data);
        }}
      />
    </div>
  );
};

export default PurchaseOrderForm;