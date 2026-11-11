import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addRecurringBill, updateRecurringBill } from "../../../store/slices/accounts/recurringBillsSlice";
import { X, Plus, Trash2, Search, GripVertical, Info } from "lucide-react";
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

const Surface = ({ title, description, children, className = "" }) => (
  <section className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {(title || description) && (
      <div className="px-5 sm:px-6 pt-5 pb-1">
        {title && <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>}
        {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
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

const RecurringBillForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingBill = useSelector((state) =>
    state.recurringBills.recurringBills.find((b) => b.id === id)
  );
  const vendors = useSelector((state) => state?.vendors?.vendors || [
    { vendorName: "LocalFix" },
    { vendorName: "Acme Corp" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    profileName: "",
    vendor: "",
    repeatEvery: "Week",
    startOn: new Date().toISOString().split("T")[0],
    endsOn: "",
    neverExpires: true,
    accountsPayable: "Accounts Payable",
    paymentTerms: "Due on Receipt",
    items: [{ id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 }],
    subTotal: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    if (existingBill) setFormData({ ...existingBill });
  }, [existingBill]);

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
      items: [...prev.items, { id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 }],
    }));

  const removeItemRow = (index) => {
    const next = formData.items.filter((_, i) => i !== index);
    const newTotal = next.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    setFormData((prev) => ({ ...prev, items: next, subTotal: newTotal, total: newTotal }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.vendor.trim() || !formData.profileName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) await dispatch(updateRecurringBill({ id, ...formData })).unwrap();
      else await dispatch(addRecurringBill(formData)).unwrap();
      navigate("/admin/accounts/purchases/recurring-bills");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = id ? "Edit recurring bill" : "New recurring bill";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases · Recurring bills</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update schedule, vendor, and line items" : "Set a schedule to auto-generate bills for a vendor"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/purchases/recurring-bills")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Error banner ---- */}
          {submitError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 text-[12.5px] text-rose-700 dark:text-rose-300">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ---- Vendor & schedule ---- */}
          <Surface title="Vendor & schedule" description="Who is billed and how often">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">

              <div className="lg:col-span-3">
                <Field label="Vendor" required>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchableSelect
                        options={vendors.map((v) => ({ value: v.vendorName, label: v.vendorName }))}
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
              </div>

              <Field label="Profile name" required>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.profileName}
                  onChange={(e) => setField("profileName", e.target.value)}
                  placeholder="e.g. Weekly maintenance"
                />
              </Field>

              <Field label="Repeat every" required>
                <select className={inputCls} value={formData.repeatEvery} onChange={(e) => setField("repeatEvery", e.target.value)}>
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </Field>

              <Field label="Start on" required>
                <input type="date" className={inputCls} value={formData.startOn} onChange={(e) => setField("startOn", e.target.value)} />
              </Field>

              <Field label="Ends on">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className={`${inputCls} flex-1`}
                    value={formData.endsOn}
                    onChange={(e) => setField("endsOn", e.target.value)}
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

              <Field label="Accounts payable" hint>
                <select className={inputCls} value={formData.accountsPayable} onChange={(e) => setField("accountsPayable", e.target.value)}>
                  <option value="Accounts Payable">Accounts Payable</option>
                </select>
              </Field>

              <Field label="Payment terms">
                <select className={inputCls} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                  <option value="Due on Receipt">Due on receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                </select>
              </Field>
            </div>
          </Surface>

          {/* ---- Line items ---- */}
          <Surface
            title="Line items"
            description="What each generated bill will contain"
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
                      <td className="py-3 text-slate-300 dark:text-slate-600"><GripVertical size={12} className="mx-auto" /></td>

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

            <div className="pt-3 pb-5">
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={13} /> Add row
              </button>
            </div>
          </Surface>

          {/* ---- Notes & summary ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Surface title="Notes">
              <Field label="Internal notes">
                <textarea
                  rows={4}
                  className={inputCls}
                  placeholder="Will not be shown in the PDF"
                  value={formData.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </Field>
            </Surface>

            <Surface title="Summary" className="h-fit">
              <div className="space-y-3 text-[12.5px]">
                <SummaryRow label="Subtotal" value={formData.subTotal.toFixed(2)} />
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">Total</span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                    ₹{formData.total.toFixed(2)}
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
                disabled={isSubmitting}
                onClick={() => navigate("/admin/accounts/purchases/recurring-bills")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : id ? "Save changes" : "Create profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringBillForm;