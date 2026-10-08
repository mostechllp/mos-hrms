// src/admin/pages/crm/AddQuotation.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import SearchableSelect from "../../../components/common/SearchableSelect";
import {
  createQuotation,
  updateQuotation,
  fetchQuotationById,
  fetchQuotationFormOptions,
  updateQuotationStatusApi,
  fromQuotationApi,
  clearCurrentQuotation,
} from "../../store/slices/quotationSlice";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const formatCurrency = (n, currency = "INR") => {
  const symbol =
    currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "AED" ? "AED " : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "SGD" ? "S$" : "";
  return `${symbol}${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const todayISO = () => new Date().toISOString().split("T")[0];
const thirtyDaysFromNowISO = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const emptyItem = (id = Date.now()) => ({
  id,
  product_service: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  discount_type: "percent",
  discount: 0,
  tax_percent: 0,
});

const emptyForm = () => ({
  customerId: "",
  contactPerson: "",
  billingAddress: "",
  email: "",
  phone: "",
  leadId: "",
  number: "Auto-generated",
  quotationDate: todayISO(),
  validUntil: thirtyDaysFromNowISO(),
  currency: "INR",
  paymentTerms: "Net 30",
  deliveryTimeline: "",
  notes: "",
  termsAndConditions:
    "1. This quotation is valid for 30 days from the issue date.\n2. Prices are exclusive of any additional taxes unless mentioned.\n3. Payment as per agreed terms.",
  additionalCharges: 0,
});

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
        <option key={o} value={o}>{o}</option>
      ) : (
        <option key={o.value} value={o.value}>{o.label}</option>
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
  const dispatch = useDispatch();
  const { id: editId } = useParams();          // present when editing
  const isEdit = Boolean(editId);

  const {
    options,
    optionsLoading,
    optionsLoaded,
    currentQuotation,
    currentQuotationLoading,
  } = useSelector((state) => state.quotations);

  const [form, setForm] = useState(emptyForm());
  const [items, setItems] = useState([emptyItem(1)]);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── Load form options ──
  useEffect(() => {
    if (!optionsLoaded) dispatch(fetchQuotationFormOptions());
  }, [dispatch, optionsLoaded]);

  // ── Load quotation for edit ──
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchQuotationById(editId));
    } else {
      dispatch(clearCurrentQuotation());
      setHydrated(false);
    }
    return () => { if (isEdit) dispatch(clearCurrentQuotation()); };
  }, [dispatch, isEdit, editId]);

  // ── Hydrate form when quotation arrives ──
  useEffect(() => {
    if (!isEdit || !currentQuotation || hydrated) return;
    const q = fromQuotationApi(currentQuotation);
    setForm({
      customerId: q.customerId ? String(q.customerId) : "",
      contactPerson: q.contactPerson || "",
      billingAddress: q.billingAddress || "",
      email: q.contactEmail || "",
      phone: q.contactPhone || "",
      leadId: q.leadId ? String(q.leadId) : "",
      number: q.quotationNumber || "Auto-generated",
      quotationDate: q.quotationDate || todayISO(),
      validUntil: q.validUntil || thirtyDaysFromNowISO(),
      currency: q.currency || "INR",
      paymentTerms: q.paymentTerms || "Net 30",
      deliveryTimeline: q.deliveryTimeline || "",
      notes: q.notes || "",
      termsAndConditions: q.termsAndConditions || "",
      additionalCharges: q.additionalCharges || 0,
    });
    setItems(
      Array.isArray(q.items) && q.items.length > 0
        ? q.items.map((it, idx) => ({ ...it, id: it.id ?? Date.now() + idx }))
        : [emptyItem(1)],
    );
    setHydrated(true);
  }, [isEdit, currentQuotation, hydrated]);

  // ── Options ──
  const customerOptions = useMemo(
    () =>
      (options.customers || []).map((c) => ({
        value: String(c.id),
        label: c.company_name || c.contact_person || `Customer #${c.id}`,
      })),
    [options.customers],
  );

  const leadOptions = useMemo(
    () =>
      (options.leads || []).map((l) => ({
        value: String(l.id),
        label: l.label || l.lead_id || `Lead #${l.id}`,
      })),
    [options.leads],
  );

  const currencyOptions = options.currencies || ["INR", "USD", "AED", "GBP"];
  const paymentTermOptions = options.payment_terms || ["Net 30"];
  const discountTypeOptions = options.discount_types || ["percent", "fixed"];

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCustomerSelect = (customerId) => {
    const c = (options.customers || []).find(
      (x) => String(x.id) === String(customerId),
    );
    setForm((f) => ({
      ...f,
      customerId,
      contactPerson: c?.contact_person || f.contactPerson,
      email: c?.email || f.email,
      phone: c?.phone || f.phone,
      billingAddress: c?.billing_address || f.billingAddress,
      paymentTerms: c?.payment_terms || f.paymentTerms,
    }));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const updateItem = (id, field, value) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    );
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  // ── Totals ──
  const totals = useMemo(() => {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unit_price) || 0;
      const lineBase = qty * unit;
      const discountValue =
        it.discount_type === "percent"
          ? (lineBase * (Number(it.discount) || 0)) / 100
          : Number(it.discount) || 0;
      const taxable = lineBase - discountValue;
      const taxValue = (taxable * (Number(it.tax_percent) || 0)) / 100;
      subtotal += lineBase;
      discountTotal += discountValue;
      taxTotal += taxValue;
    });
    const additional = Number(form.additionalCharges) || 0;
    return {
      subtotal,
      discountTotal,
      taxTotal,
      additional,
      grandTotal: subtotal - discountTotal + taxTotal + additional,
    };
  }, [items, form.additionalCharges]);

  const lineTotal = (it) => {
    const qty = Number(it.quantity) || 0;
    const unit = Number(it.unit_price) || 0;
    const base = qty * unit;
    const discountValue =
      it.discount_type === "percent"
        ? (base * (Number(it.discount) || 0)) / 100
        : Number(it.discount) || 0;
    const taxable = base - discountValue;
    const taxValue = (taxable * (Number(it.tax_percent) || 0)) / 100;
    return taxable + taxValue;
  };

  const validate = () => {
    if (!form.customerId) { showToast("Please select a customer", "error"); return false; }
    if (items.length === 0) { showToast("Please add at least one line item", "error"); return false; }
    if (items.some((it) => !it.product_service || it.quantity <= 0 || it.unit_price < 0)) {
      showToast("Please complete all line items", "error");
      return false;
    }
    return true;
  };

  const buildPayload = (status = "draft") => ({
    ...form,
    contactEmail: form.email,
    contactPhone: form.phone,
    status,
    items,
  });

  // ── Save as draft (create or update) ──
  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await dispatch(
          updateQuotation({ id: editId, data: buildPayload("draft") }),
        ).unwrap();
        showToast("Quotation updated", "success");
        navigate(`/admin/crm/quotations/${editId}`);
      } else {
        const created = await dispatch(
          createQuotation(buildPayload("draft")),
        ).unwrap();
        showToast("Quotation saved as draft", "success");
        const newId = created?.id ?? created?.data?.id;
        if (newId) navigate(`/admin/crm/quotations/${newId}`);
        else navigate("/admin/crm/quotations");
      }
    } catch (err) {
      showToast(err || "Failed to save quotation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Send quotation (create as draft, then flip to "sent") ──
  const handleSend = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let quotationId = editId;

      // 1. create or update as draft
      if (isEdit) {
        await dispatch(
          updateQuotation({ id: editId, data: buildPayload("draft") }),
        ).unwrap();
      } else {
        const created = await dispatch(
          createQuotation(buildPayload("draft")),
        ).unwrap();
        quotationId = created?.id ?? created?.data?.id;
        if (!quotationId) throw new Error("Quotation created but no id returned");
      }

      // 2. flip status to "sent"
      await dispatch(
        updateQuotationStatusApi({ id: quotationId, status: "sent" }),
      ).unwrap();

      showToast("Quotation sent successfully", "success");
      navigate(`/admin/crm/quotations/${quotationId}`);
    } catch (err) {
      showToast(err || "Failed to send quotation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const currency = form.currency;

  // ── Loading state for edit ──
  if (isEdit && currentQuotationLoading && !hydrated) {
    return (
      <div className="w-full max-w-6xl mx-auto py-16 text-center text-gray-500 dark:text-gray-400">
        Loading quotation…
      </div>
    );
  }

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
            {isEdit ? "Edit Quotation" : "Add Quotation"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isEdit
              ? "Update this price proposal"
              : "Build a formal price proposal for your customer"}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <Section title="Customer Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Customer"
            required
            value={form.customerId}
            onChange={handleCustomerSelect}
            options={customerOptions}
            placeholder="Select customer..."
            searchPlaceholder="Search customers..."
            loading={optionsLoading}
            emptyMessage="No customers found"
          />
          <Field label="Contact Person">
            <Input value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Billing Address">
              <Textarea rows={2} value={form.billingAddress} onChange={(e) => update("billingAddress", e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <SearchableSelect
              label="Related Lead / Opportunity"
              value={form.leadId}
              onChange={(v) => update("leadId", v)}
              options={leadOptions}
              placeholder="Link to lead (optional)..."
              searchPlaceholder="Search leads..."
              loading={optionsLoading}
              emptyMessage="No leads found"
            />
          </div>
        </div>
      </Section>

      {/* Quotation Details */}
      <Section title="Quotation Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Quotation Number">
            <Input value={form.number} readOnly disabled />
          </Field>
          <Field label="Quotation Date" required>
            <Input type="date" value={form.quotationDate} onChange={(e) => update("quotationDate", e.target.value)} />
          </Field>
          <Field label="Valid Until" required>
            <Input type="date" value={form.validUntil} onChange={(e) => update("validUntil", e.target.value)} />
          </Field>
          <Field label="Currency">
            <Select value={form.currency} onChange={(e) => update("currency", e.target.value)} options={currencyOptions} />
          </Field>
          <Field label="Payment Terms">
            <Select value={form.paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} options={paymentTermOptions} />
          </Field>
          <Field label="Delivery / Implementation Timeline">
            <Input value={form.deliveryTimeline} onChange={(e) => update("deliveryTimeline", e.target.value)} placeholder="e.g. 4-6 weeks from PO" />
          </Field>
        </div>
      </Section>

      {/* Line Items */}
      <Section
        title="Line Items"
        rightSlot={
          <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-1.5 px-3 rounded-lg transition-colors">
            <Plus size={14} /> Add Item
          </button>
        }
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {["PRODUCT / SERVICE", "DESCRIPTION", "QTY", "UNIT PRICE", "DISCOUNT", "TAX %", "LINE TOTAL", ""].map((h) => (
                  <th key={h} className="px-2 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-gray-100 dark:border-gray-700/40">
                  <td className="px-2 py-2 min-w-[180px]">
                    <input value={it.product_service} onChange={(e) => updateItem(it.id, "product_service", e.target.value)} placeholder="Product / Service" className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                  </td>
                  <td className="px-2 py-2 min-w-[160px]">
                    <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} placeholder="Optional" className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                  </td>
                  <td className="px-2 py-2 w-20">
                    <input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(it.id, "quantity", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                  </td>
                  <td className="px-2 py-2 w-28">
                    <input type="number" min="0" value={it.unit_price} onChange={(e) => updateItem(it.id, "unit_price", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                  </td>
                  <td className="px-2 py-2 w-40">
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" value={it.discount} onChange={(e) => updateItem(it.id, "discount", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                      <select value={it.discount_type} onChange={(e) => updateItem(it.id, "discount_type", e.target.value)} className="px-1.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500">
                        {discountTypeOptions.map((dt) => (
                          <option key={dt} value={dt}>{dt === "percent" ? "%" : "₹"}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-2 py-2 w-20">
                    <input type="number" min="0" max="100" value={it.tax_percent} onChange={(e) => updateItem(it.id, "tax_percent", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                  </td>
                  <td className="px-2 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {formatCurrency(lineTotal(it), currency)}
                  </td>
                  <td className="px-2 py-2">
                    <button onClick={() => removeItem(it.id)} disabled={items.length === 1} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {items.map((it) => (
            <div key={it.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
              <Field label="Product / Service">
                <input value={it.product_service} onChange={(e) => updateItem(it.id, "product_service", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" />
              </Field>
              <Field label="Description">
                <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Qty"><input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(it.id, "quantity", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" /></Field>
                <Field label="Unit Price"><input type="number" min="0" value={it.unit_price} onChange={(e) => updateItem(it.id, "unit_price", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" /></Field>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Discount"><input type="number" min="0" value={it.discount} onChange={(e) => updateItem(it.id, "discount", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" /></Field>
                <Field label="Type">
                  <select value={it.discount_type} onChange={(e) => updateItem(it.id, "discount_type", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs">
                    {discountTypeOptions.map((dt) => (<option key={dt} value={dt}>{dt === "percent" ? "%" : "Flat"}</option>))}
                  </select>
                </Field>
                <Field label="Tax %"><input type="number" min="0" max="100" value={it.tax_percent} onChange={(e) => updateItem(it.id, "tax_percent", e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs" /></Field>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Line Total: {formatCurrency(lineTotal(it), currency)}</span>
                <button onClick={() => removeItem(it.id)} disabled={items.length === 1} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-30"><Trash2 size={14} /></button>
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
              <Input type="number" min="0" value={form.additionalCharges} onChange={(e) => update("additionalCharges", e.target.value)} />
            </Field>
            <Field label="Notes">
              <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any additional notes for the customer..." />
            </Field>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
              <TotalRow label="Discount Total" value={`- ${formatCurrency(totals.discountTotal, currency)}`} muted="red" />
              <TotalRow label="Tax Total" value={formatCurrency(totals.taxTotal, currency)} />
              <TotalRow label="Additional Charges" value={formatCurrency(totals.additional, currency)} />
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">Grand Total</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(totals.grandTotal, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Terms */}
      <Section title="Terms & Conditions">
        <Textarea rows={5} value={form.termsAndConditions} onChange={(e) => update("termsAndConditions", e.target.value)} />
      </Section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <button type="button" onClick={() => navigate(-1)} disabled={submitting} className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center gap-2">
          <X size={15} /> Cancel
        </button>
        <button type="button" onClick={handleSaveDraft} disabled={submitting} className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
          <Save size={15} /> {isEdit ? "Update Draft" : "Save Draft"}
        </button>
        <button type="button" onClick={handleSend} disabled={submitting} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm">
          <Send size={15} /> {isEdit ? "Update & Send" : "Send Quotation"}
        </button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
const TotalRow = ({ label, value, muted }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
    <span className={`font-semibold ${muted === "red" ? "text-red-500 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
      {value}
    </span>
  </div>
);

export default AddQuotation;