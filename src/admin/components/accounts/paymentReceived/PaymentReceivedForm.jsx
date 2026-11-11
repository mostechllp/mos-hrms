import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPayment, updatePayment } from "../../../store/slices/accounts/paymentsReceivedSlice";
import { X, ChevronDown, Upload, Settings, FileText, Info } from "lucide-react";
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

const PaymentReceivedForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingPayment = useSelector((state) =>
    state.paymentsReceived.payments.find((p) => p.id === id)
  );
  const customers = useSelector((state) => state.customers.customers) || [];

  const [formData, setFormData] = useState({
    customerName: existingPayment?.customerName || "",
    customerEmail: existingPayment?.customerEmail || "",
    amountReceived: existingPayment?.amountReceived || "",
    bankCharges: existingPayment?.bankCharges || "",
    paymentDate: existingPayment?.paymentDate || new Date().toISOString().split("T")[0],
    paymentNumber: existingPayment?.paymentNumber || Math.floor(1000 + Math.random() * 9000).toString(),
    paymentMode: existingPayment?.paymentMode || "Cash",
    depositTo: existingPayment?.depositTo || "Petty Cash",
    reference: existingPayment?.reference || "",
    tdsDeducted: existingPayment?.tdsDeducted || false,
    notes: existingPayment?.notes || "",
    status: existingPayment?.status || "Draft",
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    const finalData = {
      ...formData,
      amountReceived: Number(formData.amountReceived) || 0,
      bankCharges: Number(formData.bankCharges) || 0,
    };
    if (id) dispatch(updatePayment({ id, ...finalData }));
    else dispatch(addPayment(finalData));
    navigate("/admin/accounts/sales/payments");
  };

  const title = id ? "Edit payment" : "Record payment";
  const amount = Number(formData.amountReceived) || 0;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sales · Payments received</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update payment details" : "Record a payment against one or more unpaid invoices"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/sales/payments")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Customer & amount ---- */}
          <Surface title="Payment details" description="Who paid, how much, and how">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">

              <div className="lg:col-span-2 space-y-4">
                <Field label="Customer" required>
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
                </Field>

                <Field label="Amount received" required>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg">
                      INR
                    </span>
                    <input
                      type="number"
                      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
                      value={formData.amountReceived}
                      onChange={(e) => setField("amountReceived", e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Bank charges">
                  <input
                    type="number"
                    className={inputCls}
                    value={formData.bankCharges}
                    onChange={(e) => setField("bankCharges", e.target.value)}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="Payment #" required>
                  <div className="relative">
                    <input type="text" className={inputCls} value={formData.paymentNumber} onChange={(e) => setField("paymentNumber", e.target.value)} />
                    <Settings size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </Field>
                <Field label="Payment date" required>
                  <input type="date" className={inputCls} value={formData.paymentDate} onChange={(e) => setField("paymentDate", e.target.value)} />
                </Field>
                <Field label="Payment mode">
                  <select className={inputCls} value={formData.paymentMode} onChange={(e) => setField("paymentMode", e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank transfer</option>
                    <option value="Credit Card">Credit card</option>
                    <option value="Check">Check</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <Field label="Deposit to" required>
                <select className={inputCls} value={formData.depositTo} onChange={(e) => setField("depositTo", e.target.value)}>
                  <option value="Petty Cash">Petty cash</option>
                  <option value="Undeposited Funds">Undeposited funds</option>
                  <option value="Bank Account">Bank account</option>
                </select>
              </Field>
              <Field label="Reference #">
                <input type="text" className={inputCls} value={formData.reference} onChange={(e) => setField("reference", e.target.value)} />
              </Field>
              <Field label="TDS deducted?">
                <div className="flex items-center gap-5 h-9">
                  <label className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" checked={!formData.tdsDeducted} onChange={() => setField("tdsDeducted", false)} className="text-slate-900 focus:ring-slate-400 border-slate-300" />
                    No
                  </label>
                  <label className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" checked={formData.tdsDeducted} onChange={() => setField("tdsDeducted", true)} className="text-slate-900 focus:ring-slate-400 border-slate-300" />
                    Yes, income TDS
                  </label>
                </div>
              </Field>
            </div>
          </Surface>

          {/* ---- Unpaid invoices ---- */}
          <Surface
            title="Unpaid invoices"
            description="Apply this payment toward outstanding invoices"
            action={
              <button type="button" className="text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Clear applied amount
              </button>
            }
            className="!py-0"
          >
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full min-w-[700px] text-[12.5px]">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                    <th className="text-left  font-medium py-2.5 px-3">Date</th>
                    <th className="text-left  font-medium py-2.5 px-3">Invoice #</th>
                    <th className="text-right font-medium py-2.5 px-3">Invoice amount</th>
                    <th className="text-right font-medium py-2.5 px-3">Amount due</th>
                    <th className="text-right font-medium py-2.5 px-3">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[12.5px] text-slate-500">
                      No unpaid invoices associated with this customer.
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 dark:border-slate-800">
                    <td colSpan={4} className="py-2.5 text-right text-[11.5px] font-medium text-slate-500">Total applied</td>
                    <td className="py-2.5 text-right text-[12.5px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">0.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="py-3 text-[11px] text-slate-500">List contains only sent invoices.</p>
          </Surface>

          {/* ---- Notes & summary ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Surface title="Notes & attachments">
              <div className="space-y-4">
                <Field label="Internal notes">
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Internal use. Not visible to the customer."
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
                  <p className="text-[11px] text-slate-500 mt-2">Up to 5 files, 5 MB each.</p>
                </Field>
              </div>
            </Surface>

            <Surface title="Summary" className="h-fit">
              <div className="space-y-3 text-[12.5px]">
                <SummaryRow label="Amount received" value={amount.toFixed(2)} />
                <SummaryRow label="Applied to invoices" value="0.00" />
                <SummaryRow label="Refunded" value="0.00" />
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                  <SummaryRow
                    label="Amount in excess"
                    value={`₹ ${amount.toFixed(2)}`}
                    tone="danger"
                  />
                </div>
              </div>
            </Surface>
          </div>

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/sales/payments")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Save payment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentReceivedForm;