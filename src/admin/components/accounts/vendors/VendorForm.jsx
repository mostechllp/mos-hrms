// src/admin/pages/accounts/VendorForm.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addVendor, updateVendor } from "../../../store/slices/accounts/vendorsSlice";
import { X, HelpCircle, Upload, Plus, Eye, Info, Sparkles } from "lucide-react";
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

const TABS = ["Other details", "Address", "Contact persons", "Bank details", "Custom fields", "Reporting tags", "Remarks"];

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

const PhoneInput = ({ prefix = "+91", value, onChange, placeholder }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg">
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

const CurrencyInput = ({ value, onChange }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg">
      INR
    </span>
    <input
      type="number"
      value={value}
      onChange={onChange}
      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition tabular-nums"
    />
  </div>
);

const AddressBlock = ({ title, address, onChange, onCopyBilling }) => (
  <Card
    title={title}
    action={
      onCopyBilling && (
        <button
          type="button"
          onClick={onCopyBilling}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <Upload size={12} className="rotate-180" /> Copy billing
        </button>
      )
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
      <Field label="Attention" className="sm:col-span-2">
        <input
          type="text"
          className={inputCls}
          value={address.attention}
          onChange={(e) => onChange("attention", e.target.value)}
        />
      </Field>

      <Field label="Country / region" className="sm:col-span-2">
        <select
          className={inputCls}
          value={address.country}
          onChange={(e) => onChange("country", e.target.value)}
        >
          <option value="">Select</option>
          <option value="United States">United States</option>
          <option value="India">India</option>
        </select>
      </Field>

      <Field label="Street 1" className="sm:col-span-2">
        <input
          type="text"
          className={inputCls}
          value={address.street1}
          onChange={(e) => onChange("street1", e.target.value)}
        />
      </Field>
      <Field label="Street 2" className="sm:col-span-2">
        <input
          type="text"
          className={inputCls}
          value={address.street2}
          onChange={(e) => onChange("street2", e.target.value)}
        />
      </Field>

      <Field label="City">
        <input
          type="text"
          className={inputCls}
          value={address.city}
          onChange={(e) => onChange("city", e.target.value)}
        />
      </Field>
      <Field label="State">
        <input
          type="text"
          className={inputCls}
          value={address.state}
          onChange={(e) => onChange("state", e.target.value)}
        />
      </Field>

      <Field label="Pin code">
        <input
          type="text"
          className={inputCls}
          value={address.pinCode}
          onChange={(e) => onChange("pinCode", e.target.value)}
        />
      </Field>
      <Field label="Phone">
        <input
          type="text"
          className={inputCls}
          value={address.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </Field>
    </div>
  </Card>
);

const EmptyTab = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center text-center py-14">
    <div className="w-10 h-10 mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <Icon size={16} className="text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      {title}
    </p>
    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">{description}</p>
  </div>
);

/* ---------- page ---------- */

const VendorForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingVendor = useSelector((state) =>
    state.vendors.vendors.find((v) => v.id === id)
  );

  const [activeTab, setActiveTab] = useState("Other details");

  const [formData, setFormData] = useState({
    type: existingVendor?.type || "Business",
    salutation: existingVendor?.salutation || "Mr.",
    firstName: existingVendor?.firstName || "",
    lastName: existingVendor?.lastName || "",
    companyName: existingVendor?.companyName || "",
    displayName: existingVendor?.displayName || "",
    email: existingVendor?.email || "",
    workPhone: existingVendor?.workPhone || "",
    mobile: existingVendor?.mobile || "",
    language: existingVendor?.language || "English",
    pan: existingVendor?.pan || "",
    msmeRegistered: existingVendor?.msmeRegistered || false,
    currency: existingVendor?.currency || "INR- Indian Rupee",
    payableAccount: existingVendor?.payableAccount || "Accounts Payable",
    openingBalance: existingVendor?.openingBalance || 0,
    paymentTerms: existingVendor?.paymentTerms || "Due on Receipt",
    tds: existingVendor?.tds || "",
    portalAccess: existingVendor?.portalAccess || false,
    billingAddress:
      existingVendor?.billingAddress || {
        attention: "",
        country: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
        fax: "",
      },
    shippingAddress:
      existingVendor?.shippingAddress || {
        attention: "",
        country: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
        fax: "",
      },
    contactPersons: existingVendor?.contactPersons || [],
    bankDetails: existingVendor?.bankDetails || [],
    remarks: existingVendor?.remarks || "",
  });

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const setAddressField = (type, key, value) =>
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.displayName.trim()) return;

    const finalData = {
      ...formData,
      openingBalance: Number(formData.openingBalance) || 0,
    };
    if (id) dispatch(updateVendor({ id, ...finalData }));
    else dispatch(addVendor(finalData));
    navigate("/admin/accounts/purchases/vendors");
  };

  const title = id ? "Edit vendor" : "New vendor";

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Purchases · Vendors
          </p>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update vendor details, addresses, and contacts"
              : "Add a vendor to buy from and track payables"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/purchases/vendors")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* ---- Prefill banner ---- */}
      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
        <Sparkles size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Prefill vendor details from the GST portal using the vendor's GSTIN.{" "}
          <a
            href="#"
            className="font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
          >
            Prefill now →
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Basic info ---- */}
        <Card
          title="Basic information"
          description="Who this vendor is and how they appear across transactions"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-5">
            <Field label="Salutation">
              <SearchableSelect
                value={formData.salutation}
                onChange={(v) => setField("salutation", v)}
                options={SALUTATIONS}
                clearable={false}
              />
            </Field>
            <Field label="First name">
              <input
                type="text"
                className={inputCls}
                value={formData.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <input
                type="text"
                className={inputCls}
                value={formData.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
              />
            </Field>

            <Field label="Company name" className="lg:col-span-3">
              <input
                type="text"
                className={inputCls}
                value={formData.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
              />
            </Field>

            <Field label="Display name" required className="lg:col-span-3">
              <SearchableSelect
                value={formData.displayName}
                onChange={(v) => setField("displayName", v)}
                options={[
                  {
                    value: `${formData.firstName} ${formData.lastName}`.trim(),
                    label: `${formData.firstName} ${formData.lastName}`.trim(),
                  },
                  { value: formData.companyName, label: formData.companyName },
                ].filter((o) => o.value)}
                placeholder="Select or type to add"
                onAddNew={() => {}}
                addNewLabel="Add new"
              />
              {!formData.displayName && (
                <p className="text-[11.5px] text-red-500 mt-1">
                  Enter the display name of your vendor.
                </p>
              )}
            </Field>

            <Field label="Email address" className="lg:col-span-3">
              <input
                type="email"
                className={inputCls}
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Field>

            <Field label="Work phone">
              <PhoneInput
                value={formData.workPhone}
                onChange={(e) => setField("workPhone", e.target.value)}
                placeholder="Work phone"
              />
            </Field>
            <Field label="Mobile">
              <PhoneInput
                value={formData.mobile}
                onChange={(e) => setField("mobile", e.target.value)}
                placeholder="Mobile"
              />
            </Field>
            <Field label="Vendor language">
              <select
                className={inputCls}
                value={formData.language}
                onChange={(e) => setField("language", e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </Field>
          </div>
        </Card>

        {/* ---- Tabs ---- */}
        <Card className="!py-0">
          <div className="px-5 sm:px-6 pt-3">
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 -mx-5 sm:-mx-6 px-5 sm:px-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-3 py-2.5 text-xs md:text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-green-500 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
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
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.pan}
                    onChange={(e) => setField("pan", e.target.value)}
                  />
                </Field>
                <Field label="Currency">
                  <select
                    className={inputCls}
                    value={formData.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                  >
                    <option value="INR- Indian Rupee">INR — Indian Rupee</option>
                    <option value="USD- US Dollar">USD — US Dollar</option>
                  </select>
                </Field>
                <Field label="Accounts payable" hint>
                  <select
                    className={inputCls}
                    value={formData.payableAccount}
                    onChange={(e) => setField("payableAccount", e.target.value)}
                  >
                    <option value="Accounts Payable">Accounts Payable</option>
                  </select>
                </Field>

                <Field label="Opening balance">
                  <CurrencyInput
                    value={formData.openingBalance}
                    onChange={(e) => setField("openingBalance", e.target.value)}
                  />
                </Field>
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
                <Field label="TDS">
                  <select
                    className={inputCls}
                    value={formData.tds}
                    onChange={(e) => setField("tds", e.target.value)}
                  >
                    <option value="">Select a tax</option>
                    <option value="TDS 10%">TDS 10%</option>
                  </select>
                </Field>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.msmeRegistered}
                      onChange={(e) => setField("msmeRegistered", e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                    />
                    This vendor is MSME registered
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.portalAccess}
                      onChange={(e) => setField("portalAccess", e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                    />
                    Allow portal access for this vendor
                  </label>
                </div>

                <Field label="Documents" className="md:col-span-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Upload size={13} /> Upload file
                    </button>
                    <p className="text-[11px] text-gray-500">
                      Up to 10 files, 10 MB each.
                    </p>
                  </div>
                </Field>
              </div>
            )}

            {/* Address */}
            {activeTab === "Address" && (
              <div className="space-y-4">
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
                    onCopyBilling={() =>
                      setField("shippingAddress", formData.billingAddress)
                    }
                  />
                </div>
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/60">
                  <Info size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11.5px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Add additional addresses from the vendor details panel. Address
                    formatting for PDFs can be customized under{" "}
                    <span className="font-medium">
                      Settings → Preferences → Customers and vendors → Address
                      format
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Contact persons */}
            {activeTab === "Contact persons" && (
              <div>
                <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                  <div className="min-w-[700px] lg:min-w-0">
                    <table className="w-full border-collapse text-xs md:text-[12.5px]">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5 w-32">
                            Salutation
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">
                            First name
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">
                            Last name
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">
                            Email
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">
                            Work phone
                          </th>
                          <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5">
                            Mobile
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.contactPersons.length > 0 ? (
                          formData.contactPersons.map((cp, i) => (
                            <tr
                              key={i}
                              className="border-b border-gray-200 dark:border-gray-700"
                            >
                              {["salutation", "firstName", "lastName", "email", "workPhone", "mobile"].map(
                                (key) => (
                                  <td key={key} className="px-1 py-1">
                                    <input
                                      type="text"
                                      defaultValue={cp[key] || ""}
                                      className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                                    />
                                  </td>
                                )
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-10 text-center text-gray-500 dark:text-gray-400"
                            >
                              No contact persons added yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Plus size={13} /> Add contact person
                </button>
              </div>
            )}

            {/* Bank details */}
            {activeTab === "Bank details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 max-w-2xl">
                <Field label="Account holder name" className="md:col-span-2">
                  <input type="text" className={inputCls} />
                </Field>
                <Field label="Bank name" className="md:col-span-2">
                  <input type="text" className={inputCls} />
                </Field>
                <Field label="Account number" required>
                  <div className="relative">
                    <input type="password" className={inputCls} />
                    <Eye
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    />
                  </div>
                </Field>
                <Field label="Re-enter account number" required>
                  <input type="password" className={inputCls} />
                </Field>
                <Field label="IFSC" required>
                  <input type="text" className={inputCls} />
                </Field>

                <div className="md:col-span-2 mt-2 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
                  <Info size={14} className="text-gray-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-gray-600 dark:text-gray-300 leading-relaxed">
                      Initiate payouts for purchases directly by integrating with a
                      partner bank.
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-[11.5px] font-medium text-green-600 dark:text-green-400 underline underline-offset-2 hover:no-underline"
                    >
                      Set up now
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus size={13} /> Add bank account
                  </button>
                </div>
              </div>
            )}

            {/* Custom fields */}
            {activeTab === "Custom fields" && (
              <EmptyTab
                icon={Info}
                title="No custom fields configured"
                description="Add custom fields for your vendors under Settings → Preferences → Customers and vendors."
              />
            )}

            {/* Reporting tags */}
            {activeTab === "Reporting tags" && (
              <EmptyTab
                icon={Info}
                title="No reporting tags yet"
                description="Create reporting tags under More settings → Reporting tags to categorize purchases."
              />
            )}

            {/* Remarks */}
            {activeTab === "Remarks" && (
              <Field label="Remarks (internal notes)">
                <textarea
                  rows={5}
                  className={inputCls}
                  placeholder="Internal notes about this vendor…"
                  value={formData.remarks}
                  onChange={(e) => setField("remarks", e.target.value)}
                />
              </Field>
            )}
          </div>
        </Card>

        {/* ---- Footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/purchases/vendors")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {id ? "Save changes" : "Create vendor"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;