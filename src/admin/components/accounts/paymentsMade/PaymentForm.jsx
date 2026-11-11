import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPayment, updatePayment } from "../../../store/slices/accounts/paymentsMadeSlice";
import { X, ChevronDown, Info, Upload, Settings, Lightbulb } from "lucide-react";
import { inputCls } from "../ui";

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

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600 dark:text-slate-300">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
  </div>
);

const CurrencyInput = ({ value, onChange }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg">
      INR
    </span>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
    />
  </div>
);

/* ---------- page ---------- */

const PaymentForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingPayment = useSelector((state) =>
    state.paymentsMade.payments.find((p) => p.id === id)
  );
  const vendors = useSelector((state) => state?.vendors?.vendors || [
    { vendorName: "LocalFix" },
    { vendorName: "Acme Corp" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeTab, setActiveTab] = useState("Bill Payment");
  const [payFullAmount, setPayFullAmount] = useState(false);

  const [formData, setFormData] = useState({
    paymentNumber: "",
    vendor: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    paymentMode: "Cash",
    paidThrough: "Petty Cash",
    depositTo: "Prepaid Expenses",
    reference: "",
    notes: "",
    appliedBills: [],
  });

  useEffect(() => {
    if (existingPayment) {
      setFormData({ ...existingPayment });
      setActiveTab(existingPayment.type || "Bill Payment");
    }
  }, [existingPayment]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.vendor) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const finalData = { ...formData, type: activeTab };

    try {
      if (id) await dispatch(updatePayment({ id, ...finalData })).unwrap();
      else await dispatch(addPayment(finalData)).unwrap();
      navigate("/admin/accounts/purchases/payments-made");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = id ? "Edit payment" : "Record payment";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases · Payments made</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update vendor, amount, and applied bills" : "Record a payment against a bill or record a vendor advance"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/purchases/payments-made")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Tabs ---- */}
        <Surface className="mb-4 !py-0">
          <div className="px-5 sm:px-6">
            <div className="flex gap-1 -mb-px overflow-x-auto">
              {["Bill Payment", "Vendor Advance"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </Surface>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Error banner ---- */}
          {submitError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 text-[12.5px] text-rose-700 dark:text-rose-300">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ---- Vendor & payment ---- */}
          <Surface title="Vendor & payment" description="Who you're paying and how much">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
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
                  {formData.vendor && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      Details <ChevronDown size={12} />
                    </button>
                  )}
                </div>
              </Field>

              <Field label="Payment #" required>
                <div className="relative">
                  <input type="text" className={inputCls} value={formData.paymentNumber} onChange={(e) => setField("paymentNumber", e.target.value)} />
                  <Settings size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="Payment date" required>
                <input type="date" className={inputCls} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
              </Field>

              <Field label="Reference #">
                <input type="text" className={inputCls} value={formData.reference} onChange={(e) => setField("reference", e.target.value)} />
              </Field>

              <Field label="Amount paid" required className="lg:col-span-3">
                <div className="space-y-2 max-w-md">
                  <CurrencyInput value={formData.amount} onChange={(e) => setField("amount", e.target.value)} />
                  {activeTab === "Bill Payment" && (
                    <label className="inline-flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payFullAmount}
                        onChange={(e) => setPayFullAmount(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      Pay full amount (₹3,334.00)
                    </label>
                  )}
                </div>
              </Field>
            </div>

            {activeTab === "Vendor Advance" && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field label="TDS">
                  <select className={inputCls}>
                    <option>Select a tax</option>
                  </select>
                </Field>
                <Field label="Deposit to">
                  <select className={inputCls} value={formData.depositTo} onChange={(e) => setField("depositTo", e.target.value)}>
                    <option value="Prepaid Expenses">Prepaid expenses</option>
                  </select>
                </Field>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Payment mode">
                <select className={inputCls} value={formData.paymentMode} onChange={(e) => setField("paymentMode", e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank transfer</option>
                  <option value="Check">Check</option>
                </select>
              </Field>
              <Field label="Paid through" required>
                <select className={inputCls} value={formData.paidThrough} onChange={(e) => setField("paidThrough", e.target.value)}>
                  <option value="Petty Cash">Petty cash</option>
                  <option value="Undeposited Funds">Undeposited funds</option>
                </select>
              </Field>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
              <Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Initiate payments for your bills directly by integrating with a partner bank.
                </p>
                <a href="#" className="text-[11.5px] font-medium text-slate-900 dark:text-slate-100 underline underline-offset-2 hover:no-underline">
                  Set up now
                </a>
              </div>
            </div>
          </Surface>

          {/* ---- Applied bills (Bill Payment only) ---- */}
          {activeTab === "Bill Payment" && (
            <Surface
              title="Applied bills"
              description="Which bills this payment covers"
              action={
                <button type="button" className="text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Clear applied amount
                </button>
              }
              className="!py-0"
            >
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full min-w-[900px] text-[12.5px]">
                  <thead>
                    <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                      <th className="text-left  font-medium py-2.5 px-3">Date</th>
                      <th className="text-left  font-medium py-2.5 px-3">Bill #</th>
                      <th className="text-left  font-medium py-2.5 px-3">PO #</th>
                      <th className="text-right font-medium py-2.5 px-3">Bill amount</th>
                      <th className="text-right font-medium py-2.5 px-3">Amount due</th>
                      <th className="text-left  font-medium py-2.5 px-3">Payment made on</th>
                      <th className="text-right font-medium py-2.5 px-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {formData.appliedBills.length ? formData.appliedBills.map((bill, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-3 px-3">
                          <p className="text-slate-800 dark:text-slate-200">{bill.billDate}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Due {bill.billDate}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">{bill.billNumber}</td>
                        <td className="py-3 px-3 text-slate-500"></td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                          {Number(bill.billAmount).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                          {Number(bill.billAmount).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <input type="date" className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400" defaultValue={bill.billDate} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input type="number" className="w-full px-2 py-1.5 text-[12px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums" defaultValue={bill.paymentAmount} />
                          <button type="button" className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            Pay in full
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[12.5px] text-slate-500">
                          No unpaid bills selected for this vendor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-100 dark:border-slate-800">
                      <td colSpan={6} className="py-2.5 px-3 text-right text-[11.5px] font-medium text-slate-500">Total</td>
                      <td className="py-2.5 px-3 text-right text-[12.5px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{Number(formData.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Surface>
          )}

          {/* ---- Notes & summary ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Surface title="Notes & attachments">
              <div className="space-y-4">
                <Field label="Internal notes">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Internal use. Not visible to the vendor."
                    value={formData.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </Field>
                <Field label="Attachments">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Upload size={13} /> Upload file
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">Up to 5 files, 10 MB each.</p>
                </Field>
              </div>
            </Surface>

            {activeTab === "Bill Payment" && (
              <Surface title="Summary" className="h-fit">
                <div className="space-y-3 text-[12.5px]">
                  <SummaryRow label="Amount paid"             value={Number(formData.amount).toFixed(2)} />
                  <SummaryRow label="Amount used for payments" value="0.00" />
                  <SummaryRow label="Amount refunded"         value="0.00" />
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                    <SummaryRow label="Amount in excess" value="₹ 0.00" />
                  </div>
                </div>
              </Surface>
            )}
          </div>

          {/* ---- Additional fields ---- */}
          <p className="text-[11.5px] text-slate-500 px-1">
            Additional fields: manage custom fields for payments under{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">Settings → Purchases → Payments made</span>.
          </p>

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate("/admin/accounts/purchases/payments-made")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : id ? "Save changes" : "Save payment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;