// src/admin/pages/accounts/RecurringInvoiceForm.jsx
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, updateProfile } from "../../../store/slices/accounts/recurringInvoicesSlice";
import {
  X, ChevronRight, Plus, Trash2, Settings, Search,
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
    startDate:
      existingProfile?.startDate || new Date().toISOString().split("T")[0],
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

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  /* ---- calculations ---- */
  const subtotal = formData.items.reduce((a, i) => a + i.qty * i.rate, 0);
  const taxTotal = formData.items.reduce(
    (a, i) => a + i.qty * i.rate * (i.tax / 100),
    0
  );
  const discountAmount =
    formData.discountType === "percentage"
      ? subtotal * (formData.discount / 100)
      : Number(formData.discount) || 0;
  const finalTotal =
    subtotal + taxTotal - discountAmount + Number(formData.adjustment || 0);

  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;
    setField("items", next);
  };
  const addItem = () =>
    setField("items", [
      ...formData.items,
      { id: `item-${Date.now()}`, name: "", description: "", qty: 1, rate: 0, tax: 0 },
    ]);
  const removeItem = (index) =>
    setField(
      "items",
      formData.items.filter((_, i) => i !== index)
    );

  const handleSubmit = (e) => {
    e?.preventDefault();
    const finalData = { ...formData, subtotal, taxTotal, total: finalTotal };
    if (id) dispatch(updateProfile({ id, ...finalData }));
    else dispatch(addProfile(finalData));
    navigate("/admin/accounts/sales/recurring");
  };

  const title = id ? "Edit recurring profile" : "New recurring profile";

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
              to="/admin/accounts/sales/recurring"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Recurring invoices
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {id ? existingProfile?.profileName || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update schedule, items, and terms"
              : "Set a schedule to auto-generate invoices"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/sales/recurring")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Schedule & customer ---- */}
        <Card
          title="Customer & schedule"
          description="Who is billed and how often"
        >
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
                      options={customers.map((c) => ({
                        value: c.displayName,
                        label: c.displayName,
                      }))}
                      placeholder="Select customer…"
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

              <Field label="Profile name" required>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.profileName}
                  onChange={(e) => setField("profileName", e.target.value)}
                />
              </Field>

              <Field label="Order #">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.orderNumber}
                  onChange={(e) => setField("orderNumber", e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Repeat every" required>
                <select
                  className={inputCls}
                  value={formData.repeatEvery}
                  onChange={(e) => setField("repeatEvery", e.target.value)}
                >
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </Field>
              <Field label="Start on">
                <input
                  type="date"
                  className={inputCls}
                  value={formData.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                />
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
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={formData.neverExpires}
                      onChange={(e) => setField("neverExpires", e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                    />
                    Never
                  </label>
                </div>
              </Field>
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
              <select
                className={inputCls}
                value={formData.salesperson}
                onChange={(e) => setField("salesperson", e.target.value)}
              >
                <option value="">Select or add salesperson</option>
                <option value="Fidha">Fidha</option>
              </select>
            </Field>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
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
        </Card>

        {/* ---- Line items ---- */}
        <Card
          title="Line items"
          description="What each generated invoice will contain"
          className="!py-0"
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[720px] border-collapse text-xs md:text-[12.5px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 w-10">
                    #
                  </th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Item
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    Qty
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-28">
                    Rate
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    Tax %
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-28">
                    Amount
                  </th>
                  <th className="w-10 py-2.5" />
                </tr>
              </thead>

              <tbody>
                {formData.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="align-top group border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="text-center py-3 text-gray-400 tabular-nums">
                      {index + 1}
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

                    {["qty", "rate", "tax"].map((key) => (
                      <td key={key} className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          className="w-full px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
                          value={item[key]}
                          onChange={(e) =>
                            handleItemChange(index, key, Number(e.target.value))
                          }
                        />
                      </td>
                    ))}

                    <td className="text-right py-3 px-3 font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                      {(item.qty * item.rate).toFixed(2)}
                    </td>

                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
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
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
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

        {/* ---- Notes & totals ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Notes & terms">
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
          </Card>

          <Card title="Summary" className="h-fit">
            <div className="space-y-3 text-xs md:text-[12.5px]">
              <SummaryRow label="Subtotal" value={subtotal.toFixed(2)} />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-300">Discount</span>
                  <input
                    type="number"
                    className="w-16 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 tabular-nums"
                    value={formData.discount}
                    onChange={(e) => setField("discount", Number(e.target.value))}
                  />
                  <select
                    className="text-[11.5px] px-1.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
                    value={formData.discountType}
                    onChange={(e) => setField("discountType", e.target.value)}
                  >
                    <option value="percentage">%</option>
                    <option value="amount">INR</option>
                  </select>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400 tabular-nums">
                  -{discountAmount.toFixed(2)}
                </span>
              </div>

              <SummaryRow label="Tax" value={taxTotal.toFixed(2)} />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600 dark:text-gray-300">Adjustment</span>
                  <input
                    type="number"
                    className="w-20 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 tabular-nums"
                    value={formData.adjustment}
                    onChange={(e) => setField("adjustment", Number(e.target.value))}
                  />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {Number(formData.adjustment || 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                  Total ({formData.currency})
                </span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-50 tabular-nums">
                  {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Preferences note ---- */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs text-gray-600 dark:text-gray-300">
          <Settings size={13} className="text-green-600 dark:text-green-400 shrink-0" />
          <p>
            Invoices are created as{" "}
            <span className="font-medium text-gray-800 dark:text-gray-100">
              drafts
            </span>{" "}
            per your recurring invoice preferences.
          </p>
        </div>

        {/* ---- Footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/sales/recurring")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {id ? "Save changes" : "Create profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecurringInvoiceForm;