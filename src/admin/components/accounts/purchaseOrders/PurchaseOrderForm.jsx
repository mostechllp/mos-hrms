import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addPurchaseOrder,
  updatePurchaseOrder,
} from "../../../store/slices/accounts/purchaseOrdersSlice";
import { X, Plus, Trash2, Search, GripVertical, Upload } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- primitives ---------- */

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const Surface = ({ title, description, action, children, className = "" }) => (
  <section className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {(title || description || action) && (
      <div className="px-5 sm:px-6 pt-5 pb-1 flex items-start justify-between gap-3">
        <div>
          {title && <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>}
          {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const SummaryRow = ({ label, value, tone }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600 dark:text-slate-300">{label}</span>
    <span className={`font-medium tabular-nums ${tone === "danger" ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}`}>
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

  const [formData, setFormData] = useState({
    orderNumber: existingOrder?.orderNumber || `PO-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`,
    vendor: existingOrder?.vendor || "",
    referenceNumber: existingOrder?.referenceNumber || "",
    date: existingOrder?.date || new Date().toISOString().split("T")[0],
    deliveryDate: existingOrder?.deliveryDate || "",
    paymentTerms: existingOrder?.paymentTerms || "Due on Receipt",
    deliveryAddress: existingOrder?.deliveryAddress || "",
    shipmentPreference: existingOrder?.shipmentPreference || "",
    notes: existingOrder?.notes || "",
    termsAndConditions: existingOrder?.termsAndConditions || "Payment is due immediately upon receipt.",
    items: existingOrder?.items || [
      { id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 },
    ],
    status: existingOrder?.status || "Draft",
    currency: "INR",
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;
    if (field === "quantity" || field === "rate") {
      next[index].amount = Number(next[index].quantity) * Number(next[index].rate);
    }
    setField("items", next);
  };
  const addItemRow = () =>
    setField("items", [...formData.items, { id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 }]);
  const removeItemRow = (index) =>
    setField("items", formData.items.filter((_, i) => i !== index));

  const calculateTotal = () =>
    formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.vendor.trim()) return;

    const finalData = { ...formData, total: calculateTotal(), subTotal: calculateTotal() };
    if (id) dispatch(updatePurchaseOrder({ id, ...finalData }));
    else dispatch(addPurchaseOrder(finalData));
    navigate("/admin/accounts/purchases/purchase-orders");
  };

  const title = id ? "Edit purchase order" : "New purchase order";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases · Purchase orders</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update vendor, dates, and line items" : "Send a purchase order to a vendor for goods or services"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/purchases/purchase-orders")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Vendor & details ---- */}
          <Surface title="Vendor & details" description="Who the order is for and its reference numbers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">

              <div className="lg:col-span-2 space-y-4">
                <Field label="Vendor" required>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchableSelect
                        options={vendors.map((v) => ({ value: v.vendorName || v.name, label: v.vendorName || v.name }))}
                        value={formData.vendor}
                        onChange={(val) => setField("vendor", val)}
                        placeholder="Select a vendor…"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                  <input type="text" className={inputCls} value={formData.orderNumber} onChange={(e) => setField("orderNumber", e.target.value)} />
                </Field>
                <Field label="Reference #">
                  <input type="text" className={inputCls} value={formData.referenceNumber} onChange={(e) => setField("referenceNumber", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <input type="date" className={inputCls} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
                  </Field>
                  <Field label="Delivery date">
                    <input type="date" className={inputCls} value={formData.deliveryDate} onChange={(e) => setField("deliveryDate", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <Field label="Payment terms">
                <select className={inputCls} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                  <option value="Due on Receipt">Due on receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                </select>
              </Field>
              <Field label="Shipment preference">
                <input type="text" className={inputCls} value={formData.shipmentPreference} onChange={(e) => setField("shipmentPreference", e.target.value)} placeholder="Choose the shipment preference" />
              </Field>
            </div>
          </Surface>

          {/* ---- Line items ---- */}
          <Surface
            title="Line items"
            description="What is being ordered"
            className="!py-0"
          >
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full min-w-[800px] text-[12.5px]">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                    <th className="w-8 py-2.5" />
                    <th className="text-left  font-medium py-2.5 px-3">Item</th>
                    <th className="text-left  font-medium py-2.5 px-3 w-36">Account</th>
                    <th className="text-right font-medium py-2.5 px-3 w-24">Qty</th>
                    <th className="text-right font-medium py-2.5 px-3 w-28">Rate</th>
                    <th className="text-right font-medium py-2.5 px-3 w-28">Amount</th>
                    <th className="w-8 py-2.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="align-top group">
                      <td className="py-3 text-slate-300 dark:text-slate-600">
                        <GripVertical size={12} className="mx-auto" />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition font-medium"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        />
                      </td>

                      <td className="py-3 px-3">
                        <select
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                          value={item.account}
                          onChange={(e) => handleItemChange(index, "account", e.target.value)}
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
                            className="w-full px-2 py-1.5 text-[12.5px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
                            value={item[key]}
                            onChange={(e) => handleItemChange(index, key, e.target.value)}
                          />
                        </td>
                      ))}

                      <td className="text-right py-3 px-3 font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                        {Number(item.amount).toFixed(2)}
                      </td>

                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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

            <div className="pt-3 pb-5 flex items-center gap-2">
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={13} /> Add row
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={13} /> Add items in bulk
              </button>
            </div>
          </Surface>

          {/* ---- Notes & totals ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Surface title="Notes & terms">
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Upload size={13} /> Upload file
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">Up to 10 files, 10 MB each.</p>
                </Field>
              </div>
            </Surface>

            <Surface title="Summary" className="h-fit">
              <div className="space-y-3 text-[12.5px]">
                <SummaryRow label="Subtotal" value={calculateTotal().toFixed(2)} />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Discount</span>
                    <input
                      type="number"
                      className="w-16 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums"
                      placeholder="0"
                    />
                    <span className="text-[11.5px] text-slate-500">%</span>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">0.00</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-[11.5px] text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="radio" name="taxType" defaultChecked className="text-slate-900 focus:ring-slate-400 border-slate-300" /> TDS
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11.5px] text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="radio" name="taxType" className="text-slate-900 focus:ring-slate-400 border-slate-300" /> TCS
                    </label>
                    <select className="text-[11.5px] px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400">
                      <option>Select tax</option>
                    </select>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">-0.00</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Adjustment</span>
                    <input
                      type="number"
                      className="w-20 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums"
                      placeholder="0.00"
                    />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">0.00</span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                    Total ({formData.currency})
                  </span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </Surface>
          </div>

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/purchases/purchase-orders")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Save as draft"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;