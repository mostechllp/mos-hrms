// src/admin/pages/accounts/CreditNoteForm.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCreditNote, updateCreditNote } from "../../../store/slices/accounts/creditNotesSlice";
import { X, Plus, Trash2, Settings, Search } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";
import DateInput from "../../common/DateInput";
import TransactionNumberSettingsModal from "../common/TransactionNumberSettingsModal";

/* ---------- constants ---------- */

const CURRENCIES = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "AED", label: "AED" },
  { value: "SAR", label: "SAR" },
  { value: "JPY", label: "JPY" },
  { value: "RUB", label: "RUB" },
  { value: "CNY", label: "CNY" },
];

const ACCOUNTS = [
  { value: "Sales", label: "Sales" },
  { value: "General Income", label: "General Income" },
];

const getTaxLabel = (currency) => {
  switch (currency) {
    case "INR": return "GST %";
    case "AED":
    case "SAR": return "VAT %";
    case "USD":
    case "EUR":
    case "GBP": return "Tax %";
    default: return "Tax %";
  }
};

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

const CreditNoteForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingNote = useSelector((state) =>
    state.creditNotes.creditNotes.find((n) => n.id === id)
  );
  const customers = useSelector((state) => state.customers.customers) || [];

  const [isNumberSettingsOpen, setIsNumberSettingsOpen] = useState(false);

  const [formData, setFormData] = useState({
    creditNoteNumber:
      existingNote?.creditNoteNumber ||
      `CN-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: existingNote?.customerName || "",
    date: existingNote?.date || new Date().toISOString().split("T")[0],
    reference: existingNote?.reference || "",
    status: existingNote?.status || "Draft",
    currency: "INR",
    subject: existingNote?.subject || "",
    notes: existingNote?.notes || "Will be displayed on the credit note",
    terms: existingNote?.terms || "",
    discount: existingNote?.discount || 0,
    discountType: existingNote?.discountType || "percentage",
    adjustment: existingNote?.adjustment || 0,
    items: existingNote?.items || [
      {
        id: `item-${Date.now()}`,
        name: "",
        description: "",
        account: "Sales",
        qty: 1,
        rate: 0,
        currency: "INR",
        tax: 0,
      },
    ],
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  /* ---- calculations ---- */
  const subtotal = formData.items.reduce((a, i) => a + i.qty * i.rate, 0);
  const taxTotal = formData.items.reduce(
    (a, i) => a + i.qty * i.rate * ((Number(i.tax) || 0) / 100),
    0
  );
  const discountAmount =
    formData.discountType === "percentage"
      ? subtotal * (formData.discount / 100)
      : Number(formData.discount) || 0;
  const finalTotal =
    subtotal + taxTotal - discountAmount + Number(formData.adjustment || 0);

  const primaryCurrency = formData.items[0]?.currency || "INR";
  const taxLabel = getTaxLabel(primaryCurrency);

  const handleItemChange = (index, field, value) => {
    const next = [...formData.items];
    next[index][field] = value;
    setField("items", next);
  };
  const addItem = () =>
    setField("items", [
      ...formData.items,
      {
        id: `item-${Date.now()}`,
        name: "",
        description: "",
        account: "Sales",
        qty: 1,
        rate: 0,
        currency: "INR",
        tax: 0,
      },
    ]);
  const removeItem = (index) =>
    setField(
      "items",
      formData.items.filter((_, i) => i !== index)
    );

  const handleSubmit = (e) => {
    e?.preventDefault();
    const finalData = {
      ...formData,
      subtotal,
      taxTotal,
      total: finalTotal,
      creditsRemaining: finalTotal,
    };
    if (id) dispatch(updateCreditNote({ id, ...finalData }));
    else dispatch(addCreditNote(finalData));
    navigate("/admin/accounts/sales/credit-notes");
  };

  const title = id ? "Edit credit note" : "New credit note";

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Sales · Credit notes
          </p>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update credit note details"
              : "Issue a credit note for a return, refund, or adjustment"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/sales/credit-notes")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Customer & meta ---- */}
        <Card title="Customer & details" description="Who the credit note is for">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div className="lg:col-span-2 space-y-4">
              <Field label="Customer" required>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <SearchableSelect
                      value={formData.customerName}
                      onChange={(val) => {
                        setField("customerName", val);
                      }}
                      options={customers.map((c) => ({
                        value: c.displayName,
                        label: c.displayName,
                      }))}
                      placeholder="Select or add a customer…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/accounts/sales/customers/new")}
                    className="px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap"
                  >
                    + New
                  </button>
                </div>
              </Field>

              <Field label="Subject">
                <textarea
                  rows={2}
                  className={inputCls}
                  placeholder="Let your customer know what this credit note is for"
                  value={formData.subject}
                  onChange={(e) => setField("subject", e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Credit note #" required>
                <div className="relative">
                  <input
                    type="text"
                    className={`${inputCls} pr-10`}
                    value={formData.creditNoteNumber}
                    onChange={(e) => setField("creditNoteNumber", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsNumberSettingsOpen(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors"
                    title="Configure Credit Note Number"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </Field>
              <Field label="Reference #">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.reference}
                  onChange={(e) => setField("reference", e.target.value)}
                />
              </Field>
              <Field label="Credit note date" required>
                <DateInput
                  value={formData.date}
                  onChange={(val) => setField("date", val)}
                  placeholder="dd/mm/yyyy"
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Field label="Accounts receivable">
              <SearchableSelect
                value="Accounts Receivable"
                onChange={() => {}}
                options={[
                  { value: "Accounts Receivable", label: "Accounts Receivable" },
                ]}
                clearable={false}
              />
            </Field>
            <Field label="Salesperson">
              <SearchableSelect
                value={formData.salesperson || ""}
                onChange={(val) => setField("salesperson", val)}
                options={[{ value: "Fidha", label: "Fidha" }]}
                placeholder="Select or add salesperson"
              />
            </Field>
          </div>
        </Card>

        {/* ---- Line items ---- */}
        <Card
          title="Line items"
          description="Items being credited"
          className="!py-0"
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[950px] border-collapse text-xs md:text-[12.5px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 w-10">
                    #
                  </th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3">
                    Item
                  </th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-40">
                    Account
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-20">
                    Qty
                  </th>
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    Rate
                  </th>
                  {/* 🌟 NEW CURRENCY COLUMN 🌟 */}
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    Currency
                  </th>
                  {/* 🌟 DYNAMIC TAX HEADER 🌟 */}
                  <th className="text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5 px-3 w-24">
                    {taxLabel}
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

                    <td className="py-3 px-3">
                      <SearchableSelect
                        value={item.account}
                        onChange={(val) => handleItemChange(index, "account", val)}
                        options={ACCOUNTS}
                        clearable={false}
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", Number(e.target.value))
                        }
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", Number(e.target.value))
                        }
                      />
                    </td>

                    {/* 🌟 CURRENCY SELECT 🌟 */}
                    <td className="py-3 px-3">
                      <SearchableSelect
                        value={item.currency}
                        onChange={(val) => handleItemChange(index, "currency", val)}
                        options={CURRENCIES}
                        clearable={false}
                      />
                    </td>

                    {/* TAX INPUT */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
                        value={item.tax}
                        onChange={(e) =>
                          handleItemChange(index, "tax", Number(e.target.value))
                        }
                      />
                    </td>

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
                  placeholder="Will be displayed on the credit note"
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
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Discount</span>
                  <input
                    type="number"
                    className="w-16 px-1.5 py-1 text-[11.5px] text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 tabular-nums"
                    value={formData.discount}
                    onChange={(e) => setField("discount", Number(e.target.value))}
                  />
                  <div className="w-24">
                    <SearchableSelect
                      value={formData.discountType}
                      onChange={(val) => setField("discountType", val)}
                      options={[
                        { value: "percentage", label: "%" },
                        { value: "amount", label: "INR" },
                      ]}
                      clearable={false}
                    />
                  </div>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400 tabular-nums">
                  -{discountAmount.toFixed(2)}
                </span>
              </div>

              <SummaryRow label={taxLabel.replace(" %", "")} value={taxTotal.toFixed(2)} />

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
                  Total ({primaryCurrency})
                </span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-50 tabular-nums">
                  {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/sales/credit-notes")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Save &amp; send
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {id ? "Save changes" : "Save as draft"}
            </button>
          </div>
        </div>
      </form>

      {/* Reusable Number Settings Modal */}
      <TransactionNumberSettingsModal
        isOpen={isNumberSettingsOpen}
        onClose={() => setIsNumberSettingsOpen(false)}
        title="Configure Credit Note Number Preferences"
        initialData={{ autoGenerate: true, prefix: "CN-", nextNumber: "00001", restartFiscalYear: false }}
        onSave={(data) => {
          console.log("Credit Note Number Settings Saved:", data);
        }}
      />
    </div>
  );
};

export default CreditNoteForm;