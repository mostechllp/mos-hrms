import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, updateProfile } from "../../../store/slices/accounts/recurringInvoicesSlice";
import {
  X, ChevronRight, Plus, Trash2, Settings, Search, Repeat,
} from "lucide-react";
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

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600 dark:text-slate-300">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
  </div>
);

/* ---------- page ---------- */

const RecurringInvoiceForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingProfile = useSelector((state) =>
    state.recurringInvoices.profiles.find((p) => p.id === id)
  );
  const customers = useSelector((state) => state.customers.customers) || [];

  const [formData, setFormData] = useState({
    profileName: existingProfile?.profileName || "",
    customerName: existingProfile?.customerName || "",
    customerEmail: existingProfile?.customerEmail || "",
    orderNumber: existingProfile?.orderNumber || "",
    repeatEvery: existingProfile?.repeatEvery || "Week",
    startDate: existingProfile?.startDate || new Date().toISOString().split("T")[0],
    endDate: existingProfile?.endDate || "",
    neverExpires: existingProfile?.neverExpires ?? true,
    paymentTerms: existingProfile?.paymentTerms || "Due on Receipt",
    salesperson: existingProfile?.salesperson || "",
    subject: existingProfile?.subject || "",
    status: existingProfile?.status || "Active",
    currency: "INR",
    notes: existingProfile?.notes || "Thanks for your business.",
    terms: existingProfile?.terms || "",
    discount: existingProfile?.discount || 0,
    discountType: existingProfile?.discountType || "percentage",
    adjustment: existingProfile?.adjustment || 0,
    items: existingProfile?.items || [
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
    if (id) dispatch(updateProfile({ id, ...finalData }));
    else dispatch(addProfile(finalData));
    navigate("/admin/accounts/sales/recurring");
  };

  const title = id ? "Edit recurring profile" : "New recurring profile";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/sales/recurring" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Recurring invoices</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                {id ? existingProfile?.profileName || "Edit" : "New"}
              </span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update schedule, items, and terms" : "Set a schedule to auto-generate invoices"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/sales/recurring")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Schedule & customer ---- */}
          <Surface title="Customer & schedule" description="Who is billed and how often">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
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
                        placeholder="Select customer…"
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

                <Field label="Profile name" required>
                  <input type="text" className={inputCls} value={formData.profileName} onChange={(e) => setField("profileName", e.target.value)} />
                </Field>

                <Field label="Order #">
                  <input type="text" className={inputCls} value={formData.orderNumber} onChange={(e) => setField("orderNumber", e.target.value)} />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="Repeat every" required>
                  <select className={inputCls} value={formData.repeatEvery} onChange={(e) => setField("repeatEvery", e.target.value)}>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                </Field>
                <Field label="Start on">
                  <input type="date" className={inputCls} value={formData.startDate} onChange={(e) => setField("startDate", e.target.value)} />
                </Field>
                <Field label="Ends on">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      className={`${inputCls} flex-1`}
                      value={formData.endDate}
                      onChange={(e) => setField("endDate", e.target.value)}
                      disabled={formData.neverExpires}
                    />
                    <label className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={formData.neverExpires}
                        onChange={(e) => setField("neverExpires", e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      Never
                    </label>
                  </div>
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <Field label="Payment terms">
                <select className={inputCls} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                  <option value="Due on Receipt">Due on receipt</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </Field>
              <Field label="Accounts receivable">
                <select className={inputCls}>
                  <option value="Accounts Receivable">Accounts Receivable</option>
                </select>
              </Field>
              <Field label="Salesperson">
                <select className={inputCls} value={formData.salesperson} onChange={(e) => setField("salesperson", e.target.value)}>
                  <option value="">Select or add salesperson</option>
                  <option value="Fidha">Fidha</option>
                </select>
              </Field>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <Field label="Subject">
                <textarea
                  rows={2}
                  className={inputCls}
                  placeholder="Let your customer know what this recurring invoice is for"
                  value={formData.subject}
                  onChange={(e) => setField("subject", e.target.value)}
                />
              </Field>
            </div>
          </Surface>

          {/* ---- Line items ---- */}
          <Surface
            title="Line items"
            description="What each generated invoice will contain"
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

            <div className="pt-3 pb-5 flex items-center gap-2">
              <button
                type="button"
                onClick={addItem}
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
                <Field label="Customer notes">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Thanks for your business."
                    value={formData.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </Field>
                <Field label="Terms & conditions">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Enter the terms and conditions of your business"
                    value={formData.terms}
                    onChange={(e) => setField("terms", e.target.value)}
                  />
                </Field>
              </div>
            </Surface>

            <Surface title="Summary" className="h-fit">
              <div className="space-y-3 text-[12.5px]">
                <SummaryRow label="Subtotal" value={subtotal.toFixed(2)} />

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

          {/* ---- Preferences note ---- */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[12px] text-slate-600 dark:text-slate-300">
            <Settings size={13} className="text-slate-400 shrink-0" />
            <p>
              Invoices are created as <span className="font-medium text-slate-800 dark:text-slate-100">drafts</span> per your recurring invoice preferences.
            </p>
          </div>

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/sales/recurring")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Create profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringInvoiceForm;