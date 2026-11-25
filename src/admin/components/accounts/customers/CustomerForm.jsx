// src/admin/pages/accounts/CustomerForm.jsx
import React, { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCustomer, updateCustomer } from "../../../store/slices/accounts/customersSlice";
import { X, Info, HelpCircle, ChevronRight, Upload, Plus, Sparkles, PlusCircle, XCircle } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";
import { countries } from "../../../utils/countries";

/* ---------- constants ---------- */

const SALUTATIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Dr.", label: "Dr." },
];

const TABS = ["Other details", "Address", "Contact persons", "Remarks"];

const CURRENCIES = [
  { value: "INR", label: "INR — Indian Rupee", symbol: "₹" },
  { value: "USD", label: "USD — US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
  { value: "GBP", label: "GBP — British Pound", symbol: "£" },
  { value: "AED", label: "AED — UAE Dirham", symbol: "د.إ" },
  { value: "SAR", label: "SAR — Saudi Riyal", symbol: "ر.س" },
  { value: "JPY", label: "JPY — Japanese Yen", symbol: "¥" },
  { value: "RUB", label: "RUB — Russian Ruble", symbol: "₽" },
  { value: "CNY", label: "CNY — Chinese Yuan", symbol: "¥" },
];

const PAYMENT_TERMS = [
  { value: "Due on Receipt", label: "Due on receipt" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
];

const RECEIVABLE_ACCOUNTS = [
  { value: "Accounts Receivable", label: "Accounts Receivable" },
];

const getCountryConfig = (countryCode) => {
  switch (countryCode) {
    case "IN": return { dialCode: "+91", taxLabel: "GSTIN / PAN", stateLabel: "State", zipLabel: "Pin Code" };
    case "US": return { dialCode: "+1", taxLabel: "EIN / SSN", stateLabel: "State", zipLabel: "ZIP Code" };
    case "AE": return { dialCode: "+971", taxLabel: "TRN (VAT)", stateLabel: "Emirates", zipLabel: "P.O. Box" };
    case "GB": return { dialCode: "+44", taxLabel: "VAT Number", stateLabel: "County", zipLabel: "Postcode" };
    case "SA": return { dialCode: "+966", taxLabel: "VAT Number", stateLabel: "Province", zipLabel: "Postal Code" };
    case "CA": return { dialCode: "+1", taxLabel: "BN / SIN", stateLabel: "Province", zipLabel: "Postal Code" };
    case "AU": return { dialCode: "+61", taxLabel: "ABN", stateLabel: "State", zipLabel: "Postcode" };
    default: return { dialCode: "+1", taxLabel: "Tax ID", stateLabel: "State / Province", zipLabel: "Postal Code" };
  }
};

const countryOptions = countries.map(c => ({ value: c.code, label: c.name }));

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
      {hint && <HelpCircle size={12} className="text-gray-400 ml-0.5" />}
    </label>
    {children}
  </div>
);

const Card = ({ title, description, action, children, className = "" }) => (
  <section className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}>
    {(title || description || action) && (
      <div className="px-5 sm:px-6 pt-5 pb-1 flex items-start justify-between gap-3">
        <div>
          {title && <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">{title}</h2>}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const PhoneInput = ({ prefix = "+91", value, onChange, placeholder }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg w-16 justify-center">
      {prefix}
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
    />
  </div>
);

const CurrencyInput = ({ symbol = "₹", value, onChange }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg w-12 justify-center">
      {symbol}
    </span>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
    />
  </div>
);

const AddressBlock = ({ title, address, onChange, onCopyBilling, config }) => (
  <Card
    title={title}
    action={
      onCopyBilling && (
        <button type="button" onClick={onCopyBilling} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
          <Upload size={12} className="rotate-180" /> Copy billing
        </button>
      )
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
      <Field label="Attention" className="sm:col-span-2">
        <input type="text" className={inputCls} value={address.attention} onChange={(e) => onChange("attention", e.target.value)} />
      </Field>
      <Field label="Street 1" className="sm:col-span-2">
        <input type="text" className={inputCls} value={address.street1} onChange={(e) => onChange("street1", e.target.value)} />
      </Field>
      <Field label="Street 2" className="sm:col-span-2">
        <input type="text" className={inputCls} value={address.street2} onChange={(e) => onChange("street2", e.target.value)} />
      </Field>
      <Field label="City">
        <input type="text" className={inputCls} value={address.city} onChange={(e) => onChange("city", e.target.value)} />
      </Field>
      <Field label={config.stateLabel}>
        <input type="text" className={inputCls} value={address.state} onChange={(e) => onChange("state", e.target.value)} />
      </Field>
      <Field label={config.zipLabel}>
        <input type="text" className={inputCls} value={address.pinCode} onChange={(e) => onChange("pinCode", e.target.value)} />
      </Field>
      <Field label="Phone">
        <input type="text" className={inputCls} value={address.phone} onChange={(e) => onChange("phone", e.target.value)} />
      </Field>
    </div>
  </Card>
);

/* ---------- page ---------- */

const CustomerForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingCustomer = useSelector((state) =>
    state.customers.customers.find((c) => c.id === id)
  );

  const [activeTab, setActiveTab] = useState("Other details");

  const [formData, setFormData] = useState({
    type: existingCustomer?.type || "Business",
    salutation: existingCustomer?.salutation || "Mr.",
    firstName: existingCustomer?.firstName || "",
    lastName: existingCustomer?.lastName || "",
    companyName: existingCustomer?.companyName || "",
    displayName: existingCustomer?.displayName || "",
    email: existingCustomer?.email || "",
    country: existingCustomer?.country || "IN",
    workPhone: existingCustomer?.workPhone || "",
    mobile: existingCustomer?.mobile || "",
    language: existingCustomer?.language || "English",
    pan: existingCustomer?.pan || "",
    currencies: existingCustomer?.currencies || ["INR"],
    exchangeRates: existingCustomer?.exchangeRates || {},
    baseCurrency: existingCustomer?.baseCurrency || "INR",
    receivableAccount: existingCustomer?.receivableAccount || "Accounts Receivable",
    openingBalance: existingCustomer?.openingBalance || 0,
    paymentTerms: existingCustomer?.paymentTerms || "Due on Receipt",
    portalAccess: existingCustomer?.portalAccess || false,
    billingAddress: existingCustomer?.billingAddress || { attention: "", street1: "", street2: "", city: "", state: "", pinCode: "", phone: "", fax: "" },
    shippingAddress: existingCustomer?.shippingAddress || { attention: "", street1: "", street2: "", city: "", state: "", pinCode: "", phone: "", fax: "" },
    contactPersons: existingCustomer?.contactPersons || [],
  });

  const countryConfig = useMemo(() => getCountryConfig(formData.country), [formData.country]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const setAddressField = (type, key, value) =>
    setFormData((prev) => ({ ...prev, [type]: { ...prev[type], [key]: value } }));

  const handleCurrencyToggle = (currencyCode) => {
    setFormData((prev) => {
      const isSelected = prev.currencies.includes(currencyCode);
      let newCurrencies;
      
      if (isSelected) {
        newCurrencies = prev.currencies.filter((c) => c !== currencyCode);
        if (newCurrencies.length === 0) return prev; 
      } else {
        newCurrencies = [...prev.currencies, currencyCode];
      }

      return {
        ...prev,
        currencies: newCurrencies,
        baseCurrency: newCurrencies.includes(prev.baseCurrency) ? prev.baseCurrency : newCurrencies[0]
      };
    });
  };

  const handleExchangeRateChange = (currencyCode, rate) => {
    setFormData(prev => ({
      ...prev,
      exchangeRates: {
        ...prev.exchangeRates,
        [currencyCode]: rate
      }
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.displayName.trim()) return;

    const finalData = {
      ...formData,
      openingBalance: Number(formData.openingBalance) || 0,
    };

    if (id) dispatch(updateCustomer({ id, ...finalData }));
    else dispatch(addCustomer(finalData));

    navigate("/admin/accounts/sales/customers");
  };

  const title = id ? "Edit customer" : "New customer";
  const baseCurrencySymbol = CURRENCIES.find(c => c.value === formData.baseCurrency)?.symbol || "";

  // Filtered list of currencies for the Base Currency dropdown
  const selectedCurrencyOptions = CURRENCIES
    .filter(c => formData.currencies.includes(c.value))
    .map(c => ({ value: c.value, label: c.value }));

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* Header & Breadcrumbs... (Unchanged) */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5 flex-wrap">
            <Link to="/admin/dashboard" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Home</Link>
            <ChevronRight size={11} className="text-gray-400" />
            <Link to="/admin/accounts/sales/customers" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Customers</Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{id ? existingCustomer?.displayName || "Edit" : "New"}</span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">{title}</h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id ? "Update customer details, addresses, and contacts" : "Add a customer to invoice, receive payments from, and track receivables"}
          </p>
        </div>
        <button onClick={() => navigate("/admin/accounts/sales/customers")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0">
          <X size={18} />
        </button>
      </div>

      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
        <Sparkles size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Prefill customer details from the GST portal using the customer's GSTIN.{" "}
          <a href="#" className="font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline">Prefill now →</a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info Card... (Unchanged) */}
        <Card title="Basic information" description="Who this customer is and how they appear across transactions">
          <div className="space-y-5">
            
            {/* Customer Type Row */}
            <Field label="Customer type" required>
              <div className="flex items-center gap-5 h-9">
                {["Business", "Individual"].map((t) => (
                  <label key={t} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="radio" name="type" checked={formData.type === t} onChange={() => setField("type", t)} className="text-green-500 focus:ring-green-400 border-gray-300" />
                    {t}
                  </label>
                ))}
              </div>
            </Field>

            {/* Row 1: 3 Columns (Salutation, First, Last) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
              <Field label="Salutation">
                <SearchableSelect value={formData.salutation} onChange={(val) => setField("salutation", val)} options={SALUTATIONS} clearable={false} />
              </Field>
              <Field label="First name">
                <input type="text" className={inputCls} value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} />
              </Field>
              <Field label="Last name">
                <input type="text" className={inputCls} value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </Field>
            </div>

            {/* Row 2: 2 Columns (Company, Display Name) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Company name">
                <input type="text" className={inputCls} value={formData.companyName} onChange={(e) => setField("companyName", e.target.value)} />
              </Field>
              <Field label="Display name" required>
                <SearchableSelect
                  value={formData.displayName}
                  onChange={(val) => setField("displayName", val)}
                  options={[
                    { value: `${formData.firstName} ${formData.lastName}`.trim(), label: `${formData.firstName} ${formData.lastName}`.trim() },
                    { value: formData.companyName, label: formData.companyName },
                  ].filter((o) => o.value)}
                  placeholder="Select or type to add"
                  onAddNew={() => {}}
                  addNewLabel="Add new"
                />
                {!formData.displayName && (
                  <p className="text-[11.5px] text-red-500 mt-1">Enter the display name of your customer.</p>
                )}
              </Field>
            </div>

            {/* Row 3: 2 Columns (Email, Country) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Email address">
                <input type="email" className={inputCls} value={formData.email} onChange={(e) => setField("email", e.target.value)} />
              </Field>
              <Field label="Country" required>
                <SearchableSelect value={formData.country} onChange={(val) => setField("country", val)} options={countryOptions} placeholder="Select country" clearable={false} />
              </Field>
            </div>

            {/* Row 4: 2 Columns (Work Phone, Mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Work phone">
                <PhoneInput prefix={countryConfig.dialCode} value={formData.workPhone} onChange={(e) => setField("workPhone", e.target.value)} placeholder="Work phone" />
              </Field>
              <Field label="Mobile">
                <PhoneInput prefix={countryConfig.dialCode} value={formData.mobile} onChange={(e) => setField("mobile", e.target.value)} placeholder="Mobile" />
              </Field>
            </div>

          </div>
        </Card>

        {/* Tabs Surface */}
        <Card className="!py-0">
          <div className="px-5 sm:px-6 pt-3">
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 -mx-5 sm:-mx-6 px-5 sm:px-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap px-3 py-2.5 text-xs md:text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab ? "border-green-500 text-green-600 dark:text-green-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 min-h-[280px]">
            {activeTab === "Other details" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-5">
                
                <Field label={countryConfig.taxLabel}>
                  <input type="text" className={inputCls} value={formData.pan} onChange={(e) => setField("pan", e.target.value)} />
                </Field>
                
                {/* 🌟 REDESIGNED CURRENCY UI 🌟 */}
                <div className="md:col-span-3">
                  <Field label="Currencies">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {CURRENCIES.map((cur) => {
                        const isSelected = formData.currencies.includes(cur.value);
                        return (
                          <button
                            key={cur.value}
                            type="button"
                            onClick={() => handleCurrencyToggle(cur.value)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                              isSelected
                                ? "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300"
                            }`}
                          >
                            {cur.value}
                            {isSelected && <XCircle size={12} className="opacity-70 hover:opacity-100" />}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>

                {/* 🌟 BASE CURRENCY & EXCHANGE RATES PANEL 🌟 */}
                {formData.currencies.length > 1 && (
                  <div className="md:col-span-3 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Base Currency Selector */}
                      <div>
                        <Field label="Base Currency">
                          <SearchableSelect
                            value={formData.baseCurrency}
                            onChange={(val) => setField("baseCurrency", val)}
                            options={selectedCurrencyOptions}
                            placeholder="Select base currency"
                            clearable={false}
                          />
                        </Field>
                        <p className="text-[11px] text-gray-500 mt-2">
                          All transactions will be recorded against this base currency.
                        </p>
                      </div>

                      {/* Exchange Rates Grid */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                          Exchange Rates
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {formData.currencies.filter(c => c !== formData.baseCurrency).map(curr => (
                            <div key={curr} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 pl-2 shrink-0">
                                1 {curr} =
                              </span>
                              <input
                                type="number"
                                step="0.0001"
                                placeholder="0.00"
                                value={formData.exchangeRates[curr] || ""}
                                onChange={(e) => handleExchangeRateChange(curr, e.target.value)}
                                className="w-full min-w-0 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none tabular-nums text-right pr-1"
                              />
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                                {formData.baseCurrency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Field label="Opening balance">
                  <CurrencyInput symbol={baseCurrencySymbol} value={formData.openingBalance} onChange={(e) => setField("openingBalance", e.target.value)} />
                </Field>
                
                <Field label="Payment terms">
                  <SearchableSelect value={formData.paymentTerms} onChange={(val) => setField("paymentTerms", val)} options={PAYMENT_TERMS} clearable={false} />
                </Field>
                
                <Field label="Accounts receivable" hint>
                  <SearchableSelect value={formData.receivableAccount} onChange={(val) => setField("receivableAccount", val)} options={RECEIVABLE_ACCOUNTS} clearable={false} />
                </Field>

                <div className="md:col-span-3 pt-2 flex items-center gap-2">
                  <input type="checkbox" checked={formData.portalAccess} onChange={(e) => setField("portalAccess", e.target.checked)} className="rounded border-gray-300 text-green-500 focus:ring-green-400" />
                  <label className="text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">Allow portal access for this customer</label>
                </div>
              </div>
            )}

            {activeTab === "Address" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AddressBlock title="Billing address" address={formData.billingAddress} onChange={(k, v) => setAddressField("billingAddress", k, v)} config={countryConfig} />
                <AddressBlock title="Shipping address" address={formData.shippingAddress} onChange={(k, v) => setAddressField("shippingAddress", k, v)} onCopyBilling={() => setField("shippingAddress", formData.billingAddress)} config={countryConfig} />
              </div>
            )}

            {activeTab === "Contact persons" && (
              <div>
                <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                  <div className="min-w-[700px] lg:min-w-0">
                    <table className="w-full border-collapse text-xs md:text-[12.5px]">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5 w-32">Salutation</th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">First name</th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">Last name</th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">Email</th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">Work phone</th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">Mobile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.contactPersons.length > 0 ? (
                          formData.contactPersons.map((cp, i) => (
                            <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                              {["salutation", "firstName", "lastName", "email", "workPhone", "mobile"].map((key) => (
                                <td key={key} className="px-1 py-1">
                                  <input type="text" defaultValue={cp[key] || ""} className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">No contact persons added yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button type="button" className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all">
                  <Plus size={13} /> Add contact person
                </button>
              </div>
            )}

            {activeTab === "Remarks" && (
              <Field label="Remarks (internal notes)">
                <textarea rows={5} className={inputCls} placeholder="Add any internal notes about this customer…" />
              </Field>
            )}
          </div>
        </Card>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => navigate("/admin/accounts/sales/customers")} className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all">
              {id ? "Save changes" : "Create customer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;