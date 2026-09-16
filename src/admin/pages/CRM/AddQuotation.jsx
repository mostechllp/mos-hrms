// src/admin/pages/crm/AddQuotation.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  FileDown,
  Send,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";

// ------------------------------------------------------------
// Static option lists
// ------------------------------------------------------------

const CUSTOMERS = [
  { value: "acme", label: "Acme Corp", email: "billing@acmecorp.com", address: "Plot 42, MIDC, Mumbai, MH 400001" },
  { value: "globex", label: "Globex Ltd", email: "accounts@globex.in", address: "12 MG Road, Bengaluru, KA 560001" },
  { value: "initech", label: "Initech Solutions", email: "finance@initech.io", address: "5th Floor, Titanium One, Ahmedabad, GJ 380015" },
  { value: "lmn", label: "LMN Group", email: "ap@lmngroup.com", address: "Bandra Kurla Complex, Mumbai, MH 400051" },
];

const CONTACTS = [
  "Ramesh Kumar (Procurement Manager)",
  "Sneha Rao (Finance Manager)",
  "Amit Patel (CTO)",
  "Priya Sharma (Operations Head)",
];

const OPPORTUNITIES = [
  { value: "OPP-0001", label: "ABC Traders HRMS Rollout" },
  { value: "OPP-0002", label: "XYZ Pvt Ltd ERP Migration" },
  { value: "OPP-0003", label: "PQR Solutions CRM Setup" },
  { value: "OPP-0005", label: "Acme Corp Payroll Renewal" },
];

const PRODUCTS = [
  { name: "HRMS Implementation", unitPrice: 150000, tax: 18 },
  { name: "CRM Development", unitPrice: 200000, tax: 18 },
  { name: "ERP Software", unitPrice: 500000, tax: 18 },
  { name: "Website Development", unitPrice: 80000, tax: 18 },
  { name: "Monthly Software Subscription", unitPrice: 15000, tax: 18 },
  { name: "Support & Maintenance", unitPrice: 25000, tax: 18 },
];

const CURRENCIES = ["INR", "USD", "AED", "GBP"];
const PAYMENT_TERMS = ["Advance 100%", "50% Advance / 50% on delivery", "Net 15", "Net 30", "Net 45", "Net 60"];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const formatCurrency = (n, currency = "INR") => {
  const symbol =
    currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "AED" ? "AED " : "£";
  return `${symbol}${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const todayISO = () => new Date().toISOString().split("T")[0];
const thirtyDaysFromNowISO = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

// ------------------------------------------------------------
// UI pieces
// ------------------------------------------------------------

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
  />
);

const Select = ({ options, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
  >
    {options.map((o) =>
      typeof o === "string" ? (
        <option key={o} value={o}>
          {o}
        </option>
      ) : (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ),
    )}
  </select>
);

const Section = ({ title, children, rightSlot }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
        {title}
      </h2>
      {rightSlot}
    </div>
    {children}
  </div>
);

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const AddQuotation = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // customer
    customer: "",
    contactPerson: "",
    billingAddress: "",
    email: "",
    phone: "",

    // related
    opportunity: "",

    // quotation details
    number: "Q-2026-0149",
    quotationDate: todayISO(),
    validUntil: thirtyDaysFromNowISO(),
    currency: "INR",
    paymentTerms: "Net 30",
    deliveryTimeline: "",
    notes: "",
    termsAndConditions:
      "1. This quotation is valid for 30 days from the issue date.\n2. Prices are exclusive of any additional taxes unless mentioned.\n3. Payment as per agreed terms.",

    // additional charges
    additionalCharges: 0,
  });

  const [items, setItems] = useState([
    {
      id: 1,
      product: PRODUCTS[0].name,
      description: "",
      quantity: 1,
      unitPrice: PRODUCTS[0].unitPrice,
      discountType: "percent", // percent | amount
      discount: 0,
      tax: PRODUCTS[0].tax,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCustomerSelect = (customerValue) => {
    const c = CUSTOMERS.find((x) => x.value === customerValue);
    setForm((f) => ({
      ...f,
      customer: customerValue,
      email: c?.email || "",
      billingAddress: c?.address || "",
    }));
  };

  // ---- line item handlers ----
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: PRODUCTS[0].name,
        description: "",
        quantity: 1,
        unitPrice: PRODUCTS[0].unitPrice,
        discountType: "percent",
        discount: 0,
        tax: PRODUCTS[0].tax,
      },
    ]);
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const next = { ...it, [field]: value };
        // Auto-fill unit price + tax when product changes
        if (field === "product") {
          const p = PRODUCTS.find((p) => p.name === value);
          if (p) {
            next.unitPrice = p.unitPrice;
            next.tax = p.tax;
          }
        }
        return next;
      }),
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // ---- totals ----
  const totals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unitPrice) || 0;
      const lineBase = qty * unit;

      const discountValue =
        it.discountType === "percent"
          ? (lineBase * (Number(it.discount) || 0)) / 100
          : Number(it.discount) || 0;

      const taxableAmount = lineBase - discountValue;
      const taxValue = (taxableAmount * (Number(it.tax) || 0)) / 100;

      subtotal += lineBase;
      discountTotal += discountValue;
      taxTotal += taxValue;
    });

    const additional = Number(form.additionalCharges) || 0;
    const grandTotal = subtotal - discountTotal + taxTotal + additional;

    return { subtotal, discountTotal, taxTotal, additional, grandTotal };
  }, [items, form.additionalCharges]);

  const lineTotal = (it) => {
    const qty = Number(it.quantity) || 0;
    const unit = Number(it.unitPrice) || 0;
    const base = qty * unit;
    const discountValue =
      it.discountType === "percent"
        ? (base * (Number(it.discount) || 0)) / 100
        : Number(it.discount) || 0;
    const taxable = base - discountValue;
    const taxValue = (taxable * (Number(it.tax) || 0)) / 100;
    return taxable + taxValue;
  };

  const validate = () => {
    if (!form.customer) {
      showToast("Please select a customer", "error");
      return false;
    }
    if (items.length === 0) {
      showToast("Please add at least one line item", "error");
      return false;
    }
    if (items.some((it) => !it.product || it.quantity <= 0 || it.unitPrice < 0)) {
      showToast("Please complete all line items", "error");
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    ...form,
    items,
    totals,
  });

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      console.log("Save draft:", buildPayload());
      showToast("Quotation saved as draft", "success");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!validate()) return;
    showToast("Opening preview…", "info");
  };

  const handleDownloadPdf = () => {
    if (!validate()) return;
    showToast("Generating PDF…", "info");
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      console.log("Send quotation:", buildPayload());
      showToast("Quotation sent successfully", "success");
      setTimeout(() => navigate("/admin/crm/quotations"), 1000);
    } finally {
      setSubmitting(false);
    }
  };

  const currency = form.currency;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Quotation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Build a formal price proposal for your customer
          </p>
        </div>
      </div>

      {/* Customer information */}
      <Section title="Customer Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Customer" required>
            <Select
              value={form.customer}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              options={[{ value: "", label: "Select customer..." }, ...CUSTOMERS]}
            />
          </Field>
          <Field label="Contact Person">
            <Select
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              options={[{ value: "", label: "Select contact..." }, ...CONTACTS]}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Billing Address">
              <Textarea
                rows={2}
                value={form.billingAddress}
                onChange={(e) => update("billingAddress", e.target.value)}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Related Opportunity">
              <Select
                value={form.opportunity}
                onChange={(e) => update("opportunity", e.target.value)}
                options={[{ value: "", label: "Link to opportunity (optional)..." }, ...OPPORTUNITIES]}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Quotation details */}
      <Section title="Quotation Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Quotation Number">
            <Input value={form.number} readOnly disabled />
          </Field>
          <Field label="Quotation Date" required>
            <Input
              type="date"
              value={form.quotationDate}
              onChange={(e) => update("quotationDate", e.target.value)}
            />
          </Field>
          <Field label="Valid Until" required>
            <Input
              type="date"
              value={form.validUntil}
              onChange={(e) => update("validUntil", e.target.value)}
            />
          </Field>
          <Field label="Currency">
            <Select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              options={CURRENCIES}
            />
          </Field>
          <Field label="Payment Terms">
            <Select
              value={form.paymentTerms}
              onChange={(e) => update("paymentTerms", e.target.value)}
              options={PAYMENT_TERMS}
            />
          </Field>
          <Field label="Delivery / Implementation Timeline">
            <Input
              value={form.deliveryTimeline}
              onChange={(e) => update("deliveryTimeline", e.target.value)}
              placeholder="e.g. 4-6 weeks from PO"
            />
          </Field>
        </div>
      </Section>

      {/* Line items */}
      <Section
        title="Line Items"
        rightSlot={
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-1.5 px-3 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Item
          </button>
        }
      >
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {[
                  "PRODUCT / SERVICE",
                  "DESCRIPTION",
                  "QTY",
                  "UNIT PRICE",
                  "DISCOUNT",
                  "TAX %",
                  "LINE TOTAL",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-gray-100 dark:border-gray-700/40"
                >
                  <td className="px-2 py-2 min-w-[180px]">
                    <select
                      value={it.product}
                      onChange={(e) => updateItem(it.id, "product", e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 min-w-[160px]">
                    <input
                      value={it.description}
                      onChange={(e) =>
                        updateItem(it.id, "description", e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-2 py-2 w-20">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(it.id, "quantity", e.target.value)
                      }
                      className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-2 py-2 w-28">
                    <input
                      type="number"
                      min="0"
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateItem(it.id, "unitPrice", e.target.value)
                      }
                      className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-2 py-2 w-40">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={it.discount}
                        onChange={(e) =>
                          updateItem(it.id, "discount", e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                      />
                      <select
                        value={it.discountType}
                        onChange={(e) =>
                          updateItem(it.id, "discountType", e.target.value)
                        }
                        className="px-1.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="percent">%</option>
                        <option value="amount">₹</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-2 py-2 w-20">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={it.tax}
                      onChange={(e) => updateItem(it.id, "tax", e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-2 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {formatCurrency(lineTotal(it), currency)}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2"
            >
              <Field label="Product / Service">
                <select
                  value={it.product}
                  onChange={(e) => updateItem(it.id, "product", e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <input
                  value={it.description}
                  onChange={(e) =>
                    updateItem(it.id, "description", e.target.value)
                  }
                  className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Qty">
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(it.id, "quantity", e.target.value)
                    }
                    className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  />
                </Field>
                <Field label="Unit Price">
                  <input
                    type="number"
                    min="0"
                    value={it.unitPrice}
                    onChange={(e) =>
                      updateItem(it.id, "unitPrice", e.target.value)
                    }
                    className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Discount">
                  <input
                    type="number"
                    min="0"
                    value={it.discount}
                    onChange={(e) =>
                      updateItem(it.id, "discount", e.target.value)
                    }
                    className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  />
                </Field>
                <Field label="Type">
                  <select
                    value={it.discountType}
                    onChange={(e) =>
                      updateItem(it.id, "discountType", e.target.value)
                    }
                    className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  >
                    <option value="percent">%</option>
                    <option value="amount">Flat</option>
                  </select>
                </Field>
                <Field label="Tax %">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={it.tax}
                    onChange={(e) => updateItem(it.id, "tax", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Line Total: {formatCurrency(lineTotal(it), currency)}
                </span>
                <button
                  onClick={() => removeItem(it.id)}
                  disabled={items.length === 1}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Totals */}
      <Section title="Totals">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Field label="Additional Charges">
              <Input
                type="number"
                min="0"
                value={form.additionalCharges}
                onChange={(e) => update("additionalCharges", e.target.value)}
              />
            </Field>
            <Field label="Notes">
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any additional notes for the customer..."
              />
            </Field>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
              <TotalRow
                label="Discount Total"
                value={`- ${formatCurrency(totals.discountTotal, currency)}`}
                muted="red"
              />
              <TotalRow label="Tax Total" value={formatCurrency(totals.taxTotal, currency)} />
              <TotalRow
                label="Additional Charges"
                value={formatCurrency(totals.additional, currency)}
              />
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(totals.grandTotal, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Terms */}
      <Section title="Terms & Conditions">
        <Textarea
          rows={5}
          value={form.termsAndConditions}
          onChange={(e) => update("termsAndConditions", e.target.value)}
        />
      </Section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <X size={15} /> Cancel
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Eye size={15} /> Preview
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <FileDown size={15} /> Download PDF
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={15} /> Save Draft
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          <Send size={15} /> Send Quotation
        </button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Totals row helper
// ------------------------------------------------------------
const TotalRow = ({ label, value, muted }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
    <span
      className={`font-semibold ${
        muted === "red"
          ? "text-red-500 dark:text-red-400"
          : "text-gray-800 dark:text-gray-200"
      }`}
    >
      {value}
    </span>
  </div>
);

export default AddQuotation;