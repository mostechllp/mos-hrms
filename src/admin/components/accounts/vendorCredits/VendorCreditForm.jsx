// src/admin/pages/accounts/VendorCreditForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addVendorCredit, updateVendorCredit } from "../../../store/slices/accounts/vendorCreditsSlice";
import {
  X, Plus, Trash2, Search, GripVertical, Info, Upload,
  Settings, ChevronRight, Sparkles,
} from "lucide-react";
import { inputCls } from "../ui";

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
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
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
    <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{value}</span>
  </div>
);

/* ---------- page ---------- */

const VendorCreditForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingCredit = useSelector((state) =>
    state.vendorCredits.vendorCredits.find((c) => c.id === id)
  );
  const vendors = useSelector((state) => state?.vendors?.vendors || [
    { vendorName: "LocalFix" },
    { vendorName: "Acme Corp" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    creditNoteNumber: "",
    vendor: "",
    orderNumber: "",
    date: new Date().toISOString().split("T")[0],
    subject: "",
    accountsPayable: "Accounts Payable",
    items: [{ id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, amount: 0 }],
    subTotal: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    if (existingCredit) setFormData({ ...existingCredit });
  }, [existingCredit]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;

    if (["quantity", "rate"].includes(field)) {
      const qty = Number(next[index].quantity) || 0;
      const rate = Number(next[index].rate) || 0;
      next[index].amount = qty * rate;
    }

    const newTotal = next.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    setFormData((prev) => ({ ...prev, items: next, subTotal: newTotal, total: newTotal }));
  };

  const addItemRow = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, amount: 0 }],
    }));

  const removeItemRow = (index) => {
    const next = formData.items.filter((_, i) => i !== index);
    const newTotal = next.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    setFormData((prev) => ({ ...prev, items: next, subTotal: newTotal, total: newTotal }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.vendor.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) await dispatch(updateVendorCredit({ id, ...formData })).unwrap();
      else await dispatch(addVendorCredit(formData)).unwrap();
      navigate("/admin/accounts/purchases/vendor-credits");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = id ? "Edit vendor credit" : "New vendor credit";

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
              to="/admin/accounts/purchases/vendor-credits"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Vendor credits
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {id ? formData.creditNoteNumber || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update vendor, dates, and line items"
              : "Record a credit note received from a vendor"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/purchases/vendor-credits")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* ---- Prefill banner ---- */}
      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
        <Sparkles size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Applying a vendor credit reduces the amount owed on your bills.{" "}
          <a
            href="#"
            className="font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
          >
            Learn more →
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Error banner ---- */}
        {submitError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-xs md:text-[12.5px] text-red-700 dark:text-red-300">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* ---- Vendor & details ---- */}
        <Card title="Vendor & details" description="Who the credit note is from">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-4">
            <Field label="Vendor" required className="lg:col-span-3">
              <div className="flex gap-2">
                <select
                  className={`${inputCls} flex-1`}
                  value={formData.vendor}
                  onChange={(e) => setField("vendor", e.target.value)}
                >
                  <option value="">Select a vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.vendorName} value={v.vendorName}>{v.vendorName}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Search size={14} />
                </button>
              </div>
            </Field>

            <Field label="Credit note #" required>
              <div className="relative">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.creditNoteNumber}
                  onChange={(e) => setField("creditNoteNumber", e.target.value)}
                />
                <Settings size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>

            <Field label="Order #">
              <input
                type="text"
                className={inputCls}
                value={formData.orderNumber}
                onChange={(e) => setField("orderNumber", e.target.value)}
              />
            </Field>

            <Field label="Vendor credit date">
              <input
                type="date"
                className={inputCls}
                value={formData.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </Field>

            <Field label="Subject" className="lg:col-span-2">
              <input
                type="text"
                className={inputCls}
                placeholder="Enter a subject within 250 characters"
                value={formData.subject}
                onChange={(e) => setField("subject", e.target.value)}
                maxLength={250}
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
          </div>
        </Card>

        {/* ---- Line items ---- */}
        <Card
          title="Line items"
          description="Items being credited"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Plus size={12} /> Bulk actions
            </button>
          }
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[800px] text-xs md:text-[12.5px] border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="w-8 py-2.5" />
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">Item</th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-36">Account</th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">Qty</th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-28">Rate</th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-28">Amount</th>
                  <th className="w-8 py-2.5" />
                </tr>
              </thead>

              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={item.id} className="align-top group border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-gray-300 dark:text-gray-600">
                      <GripVertical size={12} className="mx-auto" />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Item name"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition font-medium"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        className="w-full mt-1 px-2 py-1 text-[11.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-600 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none transition"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      />
                    </td>

                    <td className="py-3 px-3">
                      <select
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                        value={item.account}
                        onChange={(e) => handleItemChange(index, "account", e.target.value)}
                      >
                        <option value="">Select</option>
                      </select>
                    </td>

                    {["quantity", "rate"].map((key) => (
                      <td key={key} className="py-3 px-3">
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition tabular-nums"
                          value={item[key]}
                          onChange={(e) => handleItemChange(index, key, e.target.value)}
                        />
                      </td>
                    ))}

                    <td className="text-right py-3 px-3 font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                      {Number(item.amount).toFixed(2)}
                    </td>

                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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

          <div className="pt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Plus size={13} /> Add row
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Plus size={13} /> Add items in bulk
            </button>
          </div>
        </Card>

        {/* ---- Notes & summary ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Notes & attachments">
            <div className="space-y-4">
              <Field label="Internal notes">
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
                <p className="text-[11px] text-gray-500 mt-2">Up to 5 files, 10 MB each.</p>
              </Field>
            </div>
          </Card>

          <Card title="Summary" className="h-fit">
            <div className="space-y-3 text-xs md:text-[12.5px]">
              <SummaryRow label="Subtotal" value={formData.subTotal.toFixed(2)} />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-300">Discount</span>
                  <input
                    type="number"
                    className="w-16 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 tabular-nums"
                    placeholder="0"
                  />
                  <span className="text-[11.5px] text-gray-500">%</span>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">0.00</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 text-[11.5px] text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input type="radio" name="taxType" defaultChecked className="text-green-500 focus:ring-green-400 border-gray-300" /> TDS
                  </label>
                  <label className="inline-flex items-center gap-1 text-[11.5px] text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input type="radio" name="taxType" className="text-green-500 focus:ring-green-400 border-gray-300" /> TCS
                  </label>
                  <select className="text-[11.5px] px-1.5 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20">
                    <option>Select tax</option>
                  </select>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">-0.00</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-300">Adjustment</span>
                  <input
                    type="number"
                    className="w-20 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 tabular-nums"
                    placeholder="0.00"
                  />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">0.00</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400 tabular-nums">
                  ₹{formData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Sticky footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/admin/accounts/purchases/vendor-credits")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : id ? "Save changes" : "Create credit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorCreditForm;