import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addQuote, updateQuote } from "../../../store/slices/accounts/quotesSlice";
import { X, ChevronRight, Plus, Trash2 } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
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

/* ---------- page ---------- */

const QuoteForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingQuote = useSelector((state) =>
    state.quotes.quotes.find((q) => q.id === id)
  );
  const customers = useSelector((state) => state.customers.customers) || [];

  const [formData, setFormData] = useState({
    quoteNumber: existingQuote?.quoteNumber || `QT-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: existingQuote?.customerName || "",
    customerEmail: existingQuote?.customerEmail || "",
    date: existingQuote?.date || new Date().toISOString().split("T")[0],
    expiryDate: existingQuote?.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status: existingQuote?.status || "Draft",
    currency: "INR",
    notes: existingQuote?.notes || "Looking forward to your business.",
    terms: existingQuote?.terms || "",
    discount: existingQuote?.discount || 0,
    discountType: existingQuote?.discountType || "percentage",
    adjustment: existingQuote?.adjustment || 0,
    items: existingQuote?.items || [
      { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 },
    ],
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  /* ---- calculations ---- */
  const subtotal = formData.items.reduce((a, i) => a + i.qty * i.rate, 0);
  const taxTotal = formData.items.reduce((a, i) => a + i.qty * i.rate * (i.tax / 100), 0);
  const discountAmount = formData.discountType === "percentage"
    ? subtotal * (formData.discount / 100)
    : Number(formData.discount) || 0;
  const finalTotal = subtotal + taxTotal - discountAmount + Number(formData.adjustment || 0);

  /* ---- item handlers ---- */
  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;
    setField("items", next);
  };
  const addItem = () =>
    setField("items", [...formData.items, { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 }]);
  const removeItem = (index) =>
    setField("items", formData.items.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e?.preventDefault();
    const finalData = { ...formData, subtotal, taxTotal, total: finalTotal };
    if (id) dispatch(updateQuote({ id, ...finalData }));
    else dispatch(addQuote(finalData));
    navigate("/admin/accounts/sales/quotes");
  };

  const title = id ? "Edit quote" : "New quote";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/sales/quotes" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Quotes</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                {id ? existingQuote?.quoteNumber || "Edit" : "New"}
              </span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update line items, dates, and terms" : "Draft a quote to send to your customer"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/sales/quotes")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Customer & meta ---- */}
          <Surface title="Customer & details" description="Who the quote is for and its reference numbers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">

              {/* Customer */}
              <div className="lg:col-span-2 space-y-4">
                <Field label="Customer" required>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchableSelect
                        value={formData.customerName}
                        onChange={(val) => {
                          setField("customerName", val);
                          const found = customers.find((c) => c.displayName === val);
                          if (found) setField("customerEmail", found.email);
                        }}
                        options={customers.map((c) => ({ value: c.displayName, label: c.displayName }))}
                        placeholder="Select or type customer…"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/accounts/sales/customers/new")}
                      className="px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      + New
                    </button>
                  </div>
                </Field>

                <Field label="Customer email">
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="Customer email"
                    value={formData.customerEmail}
                    onChange={(e) => setField("customerEmail", e.target.value)}
                  />
                </Field>
              </div>

              {/* Quote number + dates */}
              <div className="space-y-4">
                <Field label="Quote #">
                  <input type="text" className={inputCls} value={formData.quoteNumber} onChange={(e) => setField("quoteNumber", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quote date">
                    <input type="date" className={inputCls} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
                  </Field>
                  <Field label="Expiry date">
                    <input type="date" className={inputCls} value={formData.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          </Surface>

          {/* ---- Line items ---- */}
          <Surface
            title="Line items"
            description="Add the products or services you're quoting"
            className="!py-0"
          >
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full min-w-[720px] text-[12.5px]">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                    <th className="text-center font-medium py-2.5 w-10">#</th>
                    <th className="text-left  font-medium py-2.5 px-3">Item</th>
                    <th className="text-right font-medium py-2.5 px-3 w-24">Qty</th>
                    <th className="text-right font-medium py-2.5 px-3 w-28">Rate</th>
                    <th className="text-right font-medium py-2.5 px-3 w-24">Tax %</th>
                    <th className="text-right font-medium py-2.5 px-3 w-28">Amount</th>
                    <th className="w-10 py-2.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="align-top group">
                      <td className="text-center py-3 text-slate-400 tabular-nums">{index + 1}</td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition font-medium"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          className="w-full mt-1 px-2 py-1 text-[11.5px] bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-slate-300 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none transition"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        />
                      </td>

                      {["qty", "rate", "tax"].map((key) => (
                        <td key={key} className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1.5 text-[12.5px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
                            value={item[key]}
                            onChange={(e) => handleItemChange(index, key, Number(e.target.value))}
                          />
                        </td>
                      ))}

                      <td className="text-right py-3 px-3 font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                        {(item.qty * item.rate).toFixed(2)}
                      </td>

                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
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

            <div className="pt-3 pb-5">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={13} /> Add line item
              </button>
            </div>
          </Surface>

          {/* ---- Notes + Totals ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <Surface title="Notes & terms">
              <div className="space-y-4">
                <Field label="Customer notes">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Looking forward to your business."
                    value={formData.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </Field>
                <Field label="Terms & conditions">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Enter terms and conditions…"
                    value={formData.terms}
                    onChange={(e) => setField("terms", e.target.value)}
                  />
                </Field>
              </div>
            </Surface>

            <Surface title="Summary" className="h-fit">
              <div className="space-y-3 text-[12.5px]">
                <SummaryRow label="Subtotal" value={subtotal.toFixed(2)} />

                {/* Discount */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Discount</span>
                    <input
                      type="number"
                      className="w-16 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums"
                      value={formData.discount}
                      onChange={(e) => setField("discount", Number(e.target.value))}
                    />
                    <select
                      className="text-[11.5px] px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      value={formData.discountType}
                      onChange={(e) => setField("discountType", e.target.value)}
                    >
                      <option value="percentage">%</option>
                      <option value="amount">INR</option>
                    </select>
                  </div>
                  <span className="font-medium text-rose-600 tabular-nums">-{discountAmount.toFixed(2)}</span>
                </div>

                <SummaryRow label="Tax" value={taxTotal.toFixed(2)} />

                {/* Adjustment */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 dark:text-slate-300">Adjustment</span>
                    <input
                      type="number"
                      className="w-20 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums"
                      value={formData.adjustment}
                      onChange={(e) => setField("adjustment", Number(e.target.value))}
                    />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                    {Number(formData.adjustment || 0).toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                    Total ({formData.currency})
                  </span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                    {finalTotal.toFixed(2)}
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
                onClick={() => navigate("/admin/accounts/sales/quotes")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Save &amp; send
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

/* ---------- helpers ---------- */

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600 dark:text-slate-300">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
  </div>
);

export default QuoteForm;