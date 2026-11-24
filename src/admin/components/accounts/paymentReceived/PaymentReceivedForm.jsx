// src/admin/pages/accounts/PaymentReceivedForm.jsx
import React, { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addPayment,
  updatePayment,
} from "../../../store/slices/accounts/paymentsReceivedSlice";
import { X, Upload, Settings, ChevronRight } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";
import TransactionNumberSettingsModal from "../common/TransactionNumberSettingsModal";
import DateInput from "../../common/DateInput";

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

const SummaryRow = ({ label, value, tone }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <span
      className={`font-medium tabular-nums ${
        tone === "danger"
          ? "text-red-600 dark:text-red-400"
          : "text-gray-800 dark:text-gray-100"
      }`}
    >
      {value}
    </span>
  </div>
);

/* ---------- payment mode config ---------- */

const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "Cheque", label: "Cheque" },
  { value: "Credit", label: "Credit" },
];

// Deposit-to options per payment mode
const DEPOSIT_OPTIONS_BY_MODE = {
  Cash: [{ value: "Petty Cash", label: "Petty cash" }],
  Bank: [
    { value: "Deposit", label: "Deposit" },
    { value: "Transfer", label: "Transfer" },
  ],
  Cheque: [
    { value: "Current Date", label: "Current date" },
    { value: "Post Dated", label: "Post dated" },
  ],
  Credit: [{ value: "Undeposited Funds", label: "Undeposited funds" }],
};

// Initial bank details (used both as default state and as reset)
const emptyBankDetails = {
  // Transfer fields
  fromAccountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  branchName: "",
  transferReference: "",
  transferDate: "",
  // Deposit fields
  depositSlipNumber: "",
  bankName: "",
  branchId: "",
  accountNumber: "",
  depositDate: "",
};

/* ---------- page ---------- */

const PaymentReceivedForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingPayment = useSelector((state) =>
    state.paymentsReceived.payments.find((p) => p.id === id),
  );
  const customers = useSelector((state) => state.customers.customers) || [];

  const [isNumberSettingsOpen, setIsNumberSettingsOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerName: existingPayment?.customerName || "",
    amountReceived: existingPayment?.amountReceived || "",
    bankCharges: existingPayment?.bankCharges || "",
    paymentDate:
      existingPayment?.paymentDate || new Date().toISOString().split("T")[0],
    paymentNumber:
      existingPayment?.paymentNumber ||
      Math.floor(1000 + Math.random() * 9000).toString(),
    paymentMode: existingPayment?.paymentMode || "Cash",
    depositTo: existingPayment?.depositTo || "Petty Cash",
    postDatedDate: existingPayment?.postDatedDate || "",
    reference: existingPayment?.reference || "",
    tdsDeducted: existingPayment?.tdsDeducted || false,
    notes: existingPayment?.notes || "",
    status: existingPayment?.status || "Draft",
    bankDetails: {
      ...emptyBankDetails,
      ...(existingPayment?.bankDetails || {}),
    },
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const setBankField = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [key]: value },
    }));

  // When payment mode changes, reset depositTo to the first valid option
  const handlePaymentModeChange = (mode) => {
    const nextOptions = DEPOSIT_OPTIONS_BY_MODE[mode] || [];
    setFormData((prev) => ({
      ...prev,
      paymentMode: mode,
      depositTo: nextOptions[0]?.value || "",
      // clear post-dated date if we're no longer on Cheque → Post Dated
      postDatedDate:
        mode === "Cheque" && prev.depositTo === "Post Dated"
          ? prev.postDatedDate
          : "",
      // reset bank details if moving away from Bank
      bankDetails: mode === "Bank" ? prev.bankDetails : { ...emptyBankDetails },
    }));
  };

  // When depositTo changes, clear the other sub-type's fields
  const handleDepositToChange = (val) => {
    setFormData((prev) => {
      const nextBank = { ...prev.bankDetails };
      if (prev.depositTo === "Transfer" && val !== "Transfer") {
        nextBank.fromAccountNumber = "";
        nextBank.ifscCode = "";
        nextBank.accountHolderName = "";
        nextBank.branchName = "";
        nextBank.transferReference = "";
        nextBank.transferDate = "";
      }
      if (prev.depositTo === "Deposit" && val !== "Deposit") {
        nextBank.depositSlipNumber = "";
        nextBank.bankName = "";
        nextBank.branchId = "";
        nextBank.accountNumber = "";
        nextBank.depositDate = "";
      }
      return { ...prev, depositTo: val, bankDetails: nextBank };
    });
  };

  const depositOptions = useMemo(
    () => DEPOSIT_OPTIONS_BY_MODE[formData.paymentMode] || [],
    [formData.paymentMode],
  );

  const showPostDatedDate =
    formData.paymentMode === "Cheque" && formData.depositTo === "Post Dated";
  const showBankTransferFields =
    formData.paymentMode === "Bank" && formData.depositTo === "Transfer";
  const showBankDepositFields =
    formData.paymentMode === "Bank" && formData.depositTo === "Deposit";

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

  const title = id ? "Edit payment" : "Payment Receipt";
  const amount = Number(formData.amountReceived) || 0;

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
              to="/admin/accounts/sales/payments"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Payments received
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {id ? existingPayment?.paymentNumber || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update payment details"
              : "Record a payment against one or more unpaid invoices"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/sales/payments")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Customer & amount ---- */}
        <Card title="Payment details" description="Who paid, how much, and how">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div className="lg:col-span-2 space-y-4">
              <Field label="Customer" required>
                <SearchableSelect
                  value={formData.customerName}
                  onChange={(val) => {
                    setField("customerName", val);
                  }}
                  options={customers.map((c) => ({
                    value: c.displayName,
                    label: c.displayName,
                  }))}
                  placeholder="Select customer…"
                />
              </Field>

              <Field label="Amount received" required>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg">
                    INR
                  </span>
                  <input
                    type="number"
                    className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
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
                  <input
                    type="text"
                    className={`${inputCls} pr-10`}
                    value={formData.paymentNumber}
                    onChange={(e) => setField("paymentNumber", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsNumberSettingsOpen(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors"
                    title="Configure Payment Number"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </Field>
              <Field label="Payment date" required>
                <DateInput
                  value={formData.paymentDate}
                  onChange={(val) => setField("paymentDate", val)}
                  placeholder="dd/mm/yyyy"
                />
              </Field>
              <Field label="Payment mode">
                <SearchableSelect
                  value={formData.paymentMode}
                  onChange={handlePaymentModeChange}
                  options={PAYMENT_MODES}
                  placeholder="Select payment mode…"
                  clearable={false}
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Field label="Deposit to" required>
              <SearchableSelect
                value={formData.depositTo}
                onChange={handleDepositToChange}
                options={depositOptions}
                placeholder="Select deposit option…"
                emptyMessage="No deposit options for this payment mode"
                clearable={false}
              />
            </Field>
            <Field label="Reference #">
              <input
                type="text"
                className={inputCls}
                value={formData.reference}
                onChange={(e) => setField("reference", e.target.value)}
              />
            </Field>
            <Field label="TDS deducted?">
              <div className="flex items-center gap-5 h-9">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.tdsDeducted}
                    onChange={() => setField("tdsDeducted", false)}
                    className="text-green-500 focus:ring-green-400 border-gray-300"
                  />
                  No
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.tdsDeducted}
                    onChange={() => setField("tdsDeducted", true)}
                    className="text-green-500 focus:ring-green-400 border-gray-300"
                  />
                  Yes, income TDS
                </label>
              </div>
            </Field>
          </div>

          {/* ---- Bank → Transfer details ---- */}
          {showBankTransferFields && (
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Bank transfer details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <Field label="From account #" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. 1234567890"
                    value={formData.bankDetails.fromAccountNumber}
                    onChange={(e) =>
                      setBankField("fromAccountNumber", e.target.value)
                    }
                  />
                </Field>
                <Field label="IFSC code">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. HDFC0001234"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) => setBankField("ifscCode", e.target.value)}
                  />
                </Field>
                <Field label="Account holder name">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Name on the sending account"
                    value={formData.bankDetails.accountHolderName}
                    onChange={(e) =>
                      setBankField("accountHolderName", e.target.value)
                    }
                  />
                </Field>
                <Field label="Branch name">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. MG Road"
                    value={formData.bankDetails.branchName}
                    onChange={(e) => setBankField("branchName", e.target.value)}
                  />
                </Field>
                <Field label="Transfer reference #">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="UTR / IMPS / NEFT reference"
                    value={formData.bankDetails.transferReference}
                    onChange={(e) =>
                      setBankField("transferReference", e.target.value)
                    }
                  />
                </Field>
                <Field label="Transfer date">
                  <DateInput
                    value={formData.bankDetails.transferDate}
                    onChange={(val) => setBankField("transferDate", val)}
                    placeholder="dd/mm/yyyy"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ---- Bank → Deposit details ---- */}
          {showBankDepositFields && (
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Bank deposit details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <Field label="Deposit slip #">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Slip / voucher number"
                    value={formData.bankDetails.depositSlipNumber}
                    onChange={(e) =>
                      setBankField("depositSlipNumber", e.target.value)
                    }
                  />
                </Field>
                <Field label="Bank name" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. HDFC Bank"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => setBankField("bankName", e.target.value)}
                  />
                </Field>
                <Field label="Branch name">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. MG Road"
                    value={formData.bankDetails.branchName}
                    onChange={(e) => setBankField("branchName", e.target.value)}
                  />
                </Field>
                <Field label="Branch ID / IFSC">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. HDFC0001234"
                    value={formData.bankDetails.branchId}
                    onChange={(e) => setBankField("branchId", e.target.value)}
                  />
                </Field>
                <Field label="Account #">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Account credited"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankField("accountNumber", e.target.value)
                    }
                  />
                </Field>
                <Field label="Deposit date">
                  <DateInput
                    value={formData.bankDetails.depositDate}
                    onChange={(val) => setBankField("depositDate", val)}
                    placeholder="dd/mm/yyyy"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ---- Post-dated cheque date — only when Cheque → Post Dated ---- */}
          {showPostDatedDate && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
              <Field label="Post-dated cheque date" required>
                <DateInput
                  value={formData.postDatedDate}
                  onChange={(val) => setField("postDatedDate", val)}
                  placeholder="dd/mm/yyyy"
                  minDate={new Date()}
                />
              </Field>
            </div>
          )}
        </Card>

        {/* ---- Unpaid invoices ---- */}
        <Card
          title="Unpaid invoices"
          description="Apply this payment toward outstanding invoices"
          action={
            <button
              type="button"
              className="text-xs md:text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Clear applied amount
            </button>
          }
          className="!py-0"
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[700px] border-collapse text-xs md:text-[12.5px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Date
                  </th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Invoice #
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Invoice amount
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Amount due
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No unpaid invoices associated with this customer.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td
                    colSpan={4}
                    className="py-2.5 text-right text-[11.5px] font-medium text-gray-500"
                  >
                    Total applied
                  </td>
                  <td className="py-2.5 text-right text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    0.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="py-3 text-[11px] text-gray-500">
            List contains only sent invoices.
          </p>
        </Card>

        {/* ---- Notes & summary ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Notes & attachments">
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Upload size={13} /> Upload file
                </button>
                <p className="text-[11px] text-gray-500 mt-2">
                  Up to 5 files, 5 MB each.
                </p>
              </Field>
            </div>
          </Card>

          <Card title="Summary" className="h-fit">
            <div className="space-y-3 text-xs md:text-[12.5px]">
              <SummaryRow label="Amount received" value={amount.toFixed(2)} />
              <SummaryRow label="Applied to invoices" value="0.00" />
              <SummaryRow label="Refunded" value="0.00" />
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                <SummaryRow
                  label="Amount in excess"
                  value={`₹ ${amount.toFixed(2)}`}
                  tone="danger"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/sales/payments")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {id ? "Save changes" : "Save payment"}
            </button>
          </div>
        </div>
      </form>

      {/* Reusable Number Settings Modal */}
      <TransactionNumberSettingsModal
        isOpen={isNumberSettingsOpen}
        onClose={() => setIsNumberSettingsOpen(false)}
        title="Configure Payment Number Preferences"
        initialData={{
          autoGenerate: true,
          prefix: "PAY-",
          nextNumber: "0001",
          restartFiscalYear: false,
        }}
        onSave={(data) => {
          console.log("Payment Number Settings Saved:", data);
        }}
      />
    </div>
  );
};

export default PaymentReceivedForm;