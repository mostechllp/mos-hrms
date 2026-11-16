// src/admin/pages/accounts/BillForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBill, updateBill } from "../../../store/slices/accounts/billsSlice";
import {
  X, Plus, Trash2, Search, Upload, Settings, Info, GripVertical,
} from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

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

const BillForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingBill = useSelector((state) =>
    state?.bills?.bills?.find((b) => b.id === id)
  );
  const vendors = useSelector(
    (state) =>
      state?.vendors?.vendors || [
        { vendorName: "Acme Corp" },
        { vendorName: "Global Tech" },
      ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    billNumber: existingBill?.billNumber || "",
    vendor: existingBill?.vendor || "",
    orderNumber: existingBill?.orderNumber || "",
    date: existingBill?.date || new Date().toISOString().split("T")[0],
    dueDate: existingBill?.dueDate || new Date().toISOString().split("T")[0],
    paymentTerms: existingBill?.paymentTerms || "Due on Receipt",
    accountsPayable: existingBill?.accountsPayable || "Accounts Payable",
    subject: existingBill?.subject || "",
    items: existingBill?.items || [
      { id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, discount: 0, amount: 0, customer: "" },
    ],
    subTotal: existingBill?.subTotal || 0,
    total: existingBill?.total || 0,
    balanceDue: existingBill?.balanceDue || 0,
    notes: existingBill?.notes || "",
    status: existingBill?.status || "Draft",
  });

  useEffect(() => {
    if (existingBill) {
      setFormData({
        billNumber: existingBill.billNumber || "",
        vendor: existingBill.vendor || "",
        orderNumber: existingBill.orderNumber || "",
        date: existingBill.date || new Date().toISOString().split("T")[0],
        dueDate: existingBill.dueDate || new Date().toISOString().split("T")[0],
        paymentTerms: existingBill.paymentTerms || "Due on Receipt",
        accountsPayable: existingBill.accountsPayable || "Accounts Payable",
        subject: existingBill.subject || "",
        items: existingBill.items || [],
        subTotal: existingBill.subTotal || 0,
        total: existingBill.total || 0,
        balanceDue: existingBill.balanceDue || 0,
        notes: existingBill.notes || "",
        status: existingBill.status || "Draft",
      });
    }
  }, [existingBill]);

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;

    if (["quantity", "rate", "discount"].includes(field)) {
      const qty = Number(next[index].quantity) || 0;
      const rate = Number(next[index].rate) || 0;
      const disc = Number(next[index].discount) || 0;
      next[index].amount = qty * rate * (1 - disc / 100);
    }

    const newTotal = next.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    setFormData((prev) => ({
      ...prev,
      items: next,
      subTotal: newTotal,
      total: newTotal,
      balanceDue: newTotal,
    }));
  };

  const addItemRow = () =>
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, discount: 0, amount: 0, customer: "" },
      ],
    }));

  const removeItemRow = (index) => {
    const next = formData.items.filter((_, i) => i !== index);
    const newTotal = next.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    setFormData((prev) => ({
      ...prev,
      items: next,
      subTotal: newTotal,
      total: newTotal,
      balanceDue: newTotal,
    }));
  };

  const handleSubmit = async (e, statusOverride) => {
    e?.preventDefault();
    if (!formData.vendor.trim()) return;

    const finalStatus = statusOverride || formData.status;
    const finalData = { ...formData, status: finalStatus };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) await dispatch(updateBill({ id, ...finalData })).unwrap();
      else await dispatch(addBill(finalData)).unwrap();
      navigate("/admin/accounts/purchases/bills");
    } catch (err) {
      console.error("Failed to save bill:", err);
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = id ? "Edit bill" : "New bill";

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Purchases · Bills
          </p>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update vendor, dates, and line items"
              : "Record a bill to track money you owe"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/purchases/bills")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, "Open")} className="space-y-4">
        {/* ---- Error banner ---- */}
        {submitError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-xs md:text-[12.5px] text-red-700 dark:text-red-300">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* ---- Vendor & details ---- */}
        <Card
          title="Vendor & details"
          description="Who the bill is from and its reference numbers"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div className="lg:col-span-3">
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
            </div>

            <Field label="Bill #" required>
              <input
                type="text"
                className={inputCls}
                value={formData.billNumber}
                onChange={(e) => setField("billNumber", e.target.value)}
              />
            </Field>
            <Field label="Order number">
              <input
                type="text"
                className={inputCls}
                value={formData.orderNumber}
                onChange={(e) => setField("orderNumber", e.target.value)}
              />
            </Field>
            <Field label="Bill date" required>
              <input
                type="date"
                className={inputCls}
                value={formData.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </Field>
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
            <Field label="Due date">
              <input
                type="date"
                className={inputCls}
                value={formData.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
              />
            </Field>
            <Field label="Accounts payable">
              <select
                className={inputCls}
                value={formData.accountsPayable}
                onChange={(e) => setField("accountsPayable", e.target.value)}
              >
                <option value="Accounts Payable">Accounts Payable</option>
              </select>
            </Field>

            <Field label="Subject" className="lg:col-span-3">
              <input
                type="text"
                className={inputCls}
                placeholder="Enter a subject within 250 characters"
                value={formData.subject}
                onChange={(e) => setField("subject", e.target.value)}
                maxLength={250}
              />
            </Field>
          </div>
        </Card>

        {/* ---- Line items ---- */}
        <Card
          title="Line items"
          description="What is being billed"
          action={
            <button
              type="button"
              className="text-xs md:text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1"
            >
              <Plus size={12} /> Bulk actions
            </button>
          }
          className="!py-0"
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[1000px] border-collapse text-xs md:text-[12.5px]">
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
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    Disc %
                  </th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-36">
                    Customer
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
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        className="w-full mt-1 px-2 py-1 text-[11.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-600 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
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

                    {["quantity", "rate", "discount"].map((key) => (
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

                    <td className="py-3 px-3">
                      <select
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
                        value={item.customer}
                        onChange={(e) =>
                          handleItemChange(index, "customer", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                      </select>
                    </td>

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
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Settings size={12} /> Purchase discounts
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Settings size={12} /> Reporting tags
            </button>
          </div>
        </Card>

        {/* ---- Notes & totals ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Notes & attachments">
            <div className="space-y-4">
              <Field label="Notes">
                <textarea
                  rows={3}
                  className={inputCls}
                  placeholder="Will not be shown in the PDF"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
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
                  Up to 5 files, 10 MB each.
                </p>
              </Field>
            </div>
          </Card>

          <Card title="Summary" className="h-fit">
            <div className="space-y-3 text-xs md:text-[12.5px]">
              <SummaryRow label="Subtotal" value={formData.subTotal.toFixed(2)} />

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
                  {formData.total.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-50 tabular-nums">
                  ₹{formData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Additional fields note ---- */}
        <p className="text-[11.5px] text-gray-500 px-1">
          Additional fields: manage custom fields for bills under{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Settings → Purchases → Bills
          </span>
          .
        </p>

        {/* ---- Footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/admin/accounts/purchases/bills")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "Draft")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save as draft"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save as open"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BillForm;