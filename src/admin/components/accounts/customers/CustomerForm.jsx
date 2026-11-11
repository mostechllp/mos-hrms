import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCustomer, updateCustomer } from "../../../store/slices/accounts/customersSlice";
import { X, Info, HelpCircle, ChevronRight, Upload, Plus, Sparkles } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- constants ---------- */

const SALUTATIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Dr.", label: "Dr." },
];

const TABS = ["Other details", "Address", "Contact persons", "Custom fields", "Reporting tags", "Remarks"];

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {hint && <HelpCircle size={12} className="text-slate-400 ml-0.5" />}
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

const PhoneInput = ({ prefix = "+91", value, onChange, placeholder }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg">
      {prefix}
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
    />
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

const AddressBlock = ({ title, address, onChange, onCopyBilling }) => (
  <Surface
    title={title}
    action={onCopyBilling && (
      <button
        type="button"
        onClick={onCopyBilling}
        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Upload size={12} className="rotate-180" /> Copy billing
      </button>
    )}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
      <Field label="Attention" className="sm:col-span-2">
        <input type="text" className={inputCls} value={address.attention} onChange={(e) => onChange("attention", e.target.value)} />
      </Field>

      <Field label="Country / region" className="sm:col-span-2">
        <select className={inputCls} value={address.country} onChange={(e) => onChange("country", e.target.value)}>
          <option value="">Select</option>
          <option value="United States">United States</option>
          <option value="India">India</option>
        </select>
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
      <Field label="State">
        <input type="text" className={inputCls} value={address.state} onChange={(e) => onChange("state", e.target.value)} />
      </Field>

      <Field label="Pin code">
        <input type="text" className={inputCls} value={address.pinCode} onChange={(e) => onChange("pinCode", e.target.value)} />
      </Field>
      <Field label="Phone">
        <input type="text" className={inputCls} value={address.phone} onChange={(e) => onChange("phone", e.target.value)} />
      </Field>
    </div>
  </Surface>
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
    workPhone: existingCustomer?.workPhone || "",
    mobile: existingCustomer?.mobile || "",
    language: existingCustomer?.language || "English",
    pan: existingCustomer?.pan || "",
    currency: existingCustomer?.currency || "INR- Indian Rupee",
    receivableAccount: existingCustomer?.receivableAccount || "Accounts Receivable",
    openingBalance: existingCustomer?.openingBalance || 0,
    paymentTerms: existingCustomer?.paymentTerms || "Due on Receipt",
    portalAccess: existingCustomer?.portalAccess || false,
    billingAddress: existingCustomer?.billingAddress || { attention: "", country: "", street1: "", street2: "", city: "", state: "", pinCode: "", phone: "", fax: "" },
    shippingAddress: existingCustomer?.shippingAddress || { attention: "", country: "", street1: "", street2: "", city: "", state: "", pinCode: "", phone: "", fax: "" },
    contactPersons: existingCustomer?.contactPersons || [],
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const setAddressField = (type, key, value) =>
    setFormData((prev) => ({ ...prev, [type]: { ...prev[type], [key]: value } }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.displayName.trim()) return;

    const finalData = { ...formData, openingBalance: Number(formData.openingBalance) || 0 };

    if (id) dispatch(updateCustomer({ id, ...finalData }));
    else dispatch(addCustomer(finalData));

    navigate("/admin/accounts/sales/customers");
  };

  const title = id ? "Edit customer" : "New customer";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/sales/customers" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Customers</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                {id ? existingCustomer?.displayName || "Edit" : "New"}
              </span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update customer details, addresses, and contacts" : "Add a customer to invoice, receive payments from, and track receivables"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/sales/customers")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Prefill banner ---- */}
        <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[12.5px] text-slate-700 dark:text-slate-300">
          <Sparkles size={14} className="text-slate-500 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Prefill customer details from the GST portal using the customer's GSTIN.{" "}
            <a href="#" className="font-medium text-slate-900 dark:text-slate-100 underline underline-offset-2 hover:no-underline">
              Prefill now →
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Basic info ---- */}
          <Surface title="Basic information" description="Who this customer is and how they appear across transactions">
            <div className="space-y-5">

              {/* Type */}
              <Field label="Customer type" required>
                <div className="flex items-center gap-5 h-9">
                  {["Business", "Individual"].map((t) => (
                    <label key={t} className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={formData.type === t}
                        onChange={() => setField("type", t)}
                        className="text-slate-900 focus:ring-slate-400 border-slate-300"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                <Field label="Salutation">
                  <SearchableSelect
                    value={formData.salutation}
                    onChange={(val) => setField("salutation", val)}
                    options={SALUTATIONS}
                    clearable={false}
                  />
                </Field>
                <Field label="First name">
                  <input type="text" className={inputCls} value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} />
                </Field>
                <Field label="Last name">
                  <input type="text" className={inputCls} value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} />
                </Field>

                <Field label="Company name" className="md:col-span-3">
                  <input type="text" className={inputCls} value={formData.companyName} onChange={(e) => setField("companyName", e.target.value)} />
                </Field>

                <Field label="Display name" required className="md:col-span-3">
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
                    <p className="text-[11.5px] text-rose-500 mt-1">Enter the display name of your customer.</p>
                  )}
                </Field>

                <Field label="Email address" className="md:col-span-3">
                  <input type="email" className={inputCls} value={formData.email} onChange={(e) => setField("email", e.target.value)} />
                </Field>

                <Field label="Work phone">
                  <PhoneInput value={formData.workPhone} onChange={(e) => setField("workPhone", e.target.value)} placeholder="Work phone" />
                </Field>
                <Field label="Mobile">
                  <PhoneInput value={formData.mobile} onChange={(e) => setField("mobile", e.target.value)} placeholder="Mobile" />
                </Field>
                <div className="hidden md:block" />
              </div>
            </div>
          </Surface>

          {/* ---- Tabs surface ---- */}
          <Surface className="!py-0">
            <div className="px-5 sm:px-6 pt-3">
              <div className="flex gap-1 overflow-x-auto border-b border-slate-100 dark:border-slate-800 -mx-5 sm:-mx-6 px-5 sm:px-6">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
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

            <div className="px-5 sm:px-6 py-5 min-h-[280px]">

              {/* Other details */}
              {activeTab === "Other details" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                  <Field label="PAN">
                    <input type="text" className={inputCls} value={formData.pan} onChange={(e) => setField("pan", e.target.value)} />
                  </Field>
                  <Field label="Currency">
                    <select className={inputCls} value={formData.currency} onChange={(e) => setField("currency", e.target.value)}>
                      <option value="INR- Indian Rupee">INR — Indian Rupee</option>
                      <option value="USD- US Dollar">USD — US Dollar</option>
                    </select>
                  </Field>
                  <Field label="Accounts receivable" hint>
                    <select className={inputCls} value={formData.receivableAccount} onChange={(e) => setField("receivableAccount", e.target.value)}>
                      <option value="Accounts Receivable">Accounts Receivable</option>
                    </select>
                  </Field>

                  <Field label="Opening balance">
                    <CurrencyInput value={formData.openingBalance} onChange={(e) => setField("openingBalance", e.target.value)} />
                  </Field>
                  <Field label="Payment terms">
                    <select className={inputCls} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                      <option value="Due on Receipt">Due on receipt</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </Field>

                  <div className="md:col-span-3 pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.portalAccess}
                      onChange={(e) => setField("portalAccess", e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                    />
                    <label className="text-[12.5px] text-slate-700 dark:text-slate-300">
                      Allow portal access for this customer
                    </label>
                  </div>
                </div>
              )}

              {/* Address */}
              {activeTab === "Address" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AddressBlock
                    title="Billing address"
                    address={formData.billingAddress}
                    onChange={(k, v) => setAddressField("billingAddress", k, v)}
                  />
                  <AddressBlock
                    title="Shipping address"
                    address={formData.shippingAddress}
                    onChange={(k, v) => setAddressField("shippingAddress", k, v)}
                    onCopyBilling={() => setField("shippingAddress", formData.billingAddress)}
                  />
                </div>
              )}

              {/* Contact persons */}
              {activeTab === "Contact persons" && (
                <div>
                  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                    <table className="w-full text-[12.5px] whitespace-nowrap">
                      <thead>
                        <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                          <th className="text-left  font-medium px-3 py-2.5 w-32">Salutation</th>
                          <th className="text-left  font-medium px-3 py-2.5">First name</th>
                          <th className="text-left  font-medium px-3 py-2.5">Last name</th>
                          <th className="text-left  font-medium px-3 py-2.5">Email</th>
                          <th className="text-left  font-medium px-3 py-2.5">Work phone</th>
                          <th className="text-left  font-medium px-3 py-2.5">Mobile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {formData.contactPersons.length > 0 ? formData.contactPersons.map((cp, i) => (
                          <tr key={i}>
                            {["salutation", "firstName", "lastName", "email", "workPhone", "mobile"].map((key) => (
                              <td key={key} className="px-1 py-1">
                                <input
                                  type="text"
                                  defaultValue={cp[key] || ""}
                                  className="w-full px-2 py-1.5 text-[12.5px] bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-slate-300 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none transition"
                                />
                              </td>
                            ))}
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-[13px] text-slate-500">
                              No contact persons added yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={13} /> Add contact person
                  </button>
                </div>
              )}

              {/* Custom fields */}
              {activeTab === "Custom fields" && (
                <EmptyTab
                  icon={Info}
                  title="No custom fields configured"
                  description="Add custom fields for your customers under Settings → Preferences → Customers and vendors."
                />
              )}

              {/* Reporting tags */}
              {activeTab === "Reporting tags" && (
                <EmptyTab
                  icon={Info}
                  title="No reporting tags yet"
                  description="Create reporting tags under More settings → Reporting tags to categorize transactions."
                />
              )}

              {/* Remarks */}
              {activeTab === "Remarks" && (
                <Field label="Remarks (internal notes)">
                  <textarea rows={5} className={inputCls} placeholder="Add any internal notes about this customer…" />
                </Field>
              )}
            </div>
          </Surface>

          {/* ---- Sticky footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/sales/customers")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Create customer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- small helper ---------- */

const EmptyTab = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center text-center py-14">
    <div className="w-10 h-10 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <Icon size={16} className="text-slate-400" />
    </div>
    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 mb-1">{title}</p>
    <p className="text-[12px] text-slate-500 max-w-sm leading-relaxed">{description}</p>
  </div>
);

export default CustomerForm;