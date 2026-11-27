// src/admin/pages/accounts/CustomerForm.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  fetchCustomerFormOptions,
  fetchContactPersons,
  createContactPerson,
  updateContactPerson,
  deleteContactPerson,
  clearContactPersons,
} from "../../../store/slices/accounts/customersSlice";
import {
  X,
  HelpCircle,
  ChevronRight,
  Upload,
  Plus,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- tabs ---------- */
const TABS = ["Other details", "Address", "Contact persons", "Remarks"];

/* ---------- country name → ISO code ---------- */
const COUNTRY_NAME_TO_CODE = {
  India: "IN",
  "United Arab Emirates": "AE",
  "United States": "US",
  "Saudi Arabia": "SA",
  Qatar: "QA",
  Oman: "OM",
  Kuwait: "KW",
  Bahrain: "BH",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Singapore: "SG",
};

const getCountryConfig = (countryCode) => {
  switch (countryCode) {
    case "IN":
      return {
        dialCode: "+91",
        taxLabel: "GSTIN / PAN",
        stateLabel: "State",
        zipLabel: "Pin Code",
        phoneLength: [10],
      };
    case "US":
      return {
        dialCode: "+1",
        taxLabel: "EIN / SSN",
        stateLabel: "State",
        zipLabel: "ZIP Code",
        phoneLength: [10],
      };
    case "AE":
      return {
        dialCode: "+971",
        taxLabel: "TRN (VAT)",
        stateLabel: "Emirates",
        zipLabel: "P.O. Box",
        phoneLength: [8, 9],
      };
    case "GB":
      return {
        dialCode: "+44",
        taxLabel: "VAT Number",
        stateLabel: "County",
        zipLabel: "Postcode",
        phoneLength: [10, 11],
      };
    case "SA":
      return {
        dialCode: "+966",
        taxLabel: "VAT Number",
        stateLabel: "Province",
        zipLabel: "Postal Code",
        phoneLength: [9],
      };
    case "CA":
      return {
        dialCode: "+1",
        taxLabel: "BN / SIN",
        stateLabel: "Province",
        zipLabel: "Postal Code",
        phoneLength: [10],
      };
    case "AU":
      return {
        dialCode: "+61",
        taxLabel: "ABN",
        stateLabel: "State",
        zipLabel: "Postcode",
        phoneLength: [9],
      };
    case "QA":
      return {
        dialCode: "+974",
        taxLabel: "Tax ID",
        stateLabel: "Municipality",
        zipLabel: "Postal Code",
        phoneLength: [8],
      };
    case "OM":
      return {
        dialCode: "+968",
        taxLabel: "Tax ID",
        stateLabel: "Governorate",
        zipLabel: "Postal Code",
        phoneLength: [8],
      };
    case "KW":
      return {
        dialCode: "+965",
        taxLabel: "Tax ID",
        stateLabel: "Governorate",
        zipLabel: "Postal Code",
        phoneLength: [8],
      };
    case "BH":
      return {
        dialCode: "+973",
        taxLabel: "Tax ID",
        stateLabel: "Governorate",
        zipLabel: "Postal Code",
        phoneLength: [8],
      };
    case "SG":
      return {
        dialCode: "+65",
        taxLabel: "UEN / GST",
        stateLabel: "Region",
        zipLabel: "Postal Code",
        phoneLength: [8],
      };
    default:
      return {
        dialCode: "+1",
        taxLabel: "Tax ID",
        stateLabel: "State / Province",
        zipLabel: "Postal Code",
        phoneLength: [10],
      };
  }
};

const resolveCountryCode = (country) => {
  if (!country) return "IN";
  if (COUNTRY_NAME_TO_CODE[country]) return COUNTRY_NAME_TO_CODE[country];
  if (country.length === 2) return country.toUpperCase();
  return "IN";
};

const emptyAddress = () => ({
  attention: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  pinCode: "",
  phone: "",
  fax: "",
});

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
      <Field label={config.stateLabel}>
        <input
          type="text"
          className={inputCls}
          value={address.state}
          onChange={(e) => onChange("state", e.target.value)}
        />
      </Field>
      <Field label={config.zipLabel}>
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

/* ---------- page ---------- */
const CustomerForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const {
    customers = [],
    selectedCustomer = null,
    formOptions = {},
    submitting = false,
    loading = false,
    contactPersons = {},
    contactPersonsLoading = false,
    contactPersonSubmitting = false,
  } = useSelector((s) => s.accountCustomers ?? {});

  const hasFetchedRef = useRef(false);

  const existingCustomer = useMemo(() => {
    if (selectedCustomer && String(selectedCustomer.id) === String(id)) {
      return selectedCustomer;
    }
    return customers.find((c) => String(c.id) === String(id)) || null;
  }, [customers, selectedCustomer, id]);

  const [activeTab, setActiveTab] = useState("Other details");
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    salutation: "",
    firstName: "",
    lastName: "",
    companyName: "",
    displayName: "",
    email: "",
    country: "",
    workPhone: "",
    mobile: "",
    language: "English",
    pan: "",
    currencies: [],
    exchangeRates: {},
    baseCurrency: "",
    receivableAccount: "",
    openingBalance: 0,
    paymentTerms: "",
    portalAccess: false,
    billingAddress: emptyAddress(),
    shippingAddress: emptyAddress(),
    // ✅ NEW required fields
    accountManagerId: "",
    contactPersonName: "",
    remarks: "",
  });

  // Local mirror of contact persons (hydrated from Redux when editing)
  const [localContactPersons, setLocalContactPersons] = useState([]);

  /* ---- dropdown option lists ---- */
  const SALUTATIONS = formOptions.salutations ?? [];
  const CUSTOMER_TYPES = (formOptions.customer_types ?? []).map((t) =>
    typeof t === "string" ? t : t.value,
  );
  const CURRENCIES = formOptions.currencies ?? [];
  const PAYMENT_TERMS = formOptions.payment_terms ?? [];
  const RECEIVABLE_ACCOUNTS = formOptions.accounts_receivable ?? [];
  const countryOptions = (formOptions.countries ?? []).map((c) =>
    typeof c === "string"
      ? { value: c, label: c }
      : { value: c.code ?? c.value, label: c.name ?? c.label },
  );
  const ACCOUNT_MANAGERS = formOptions.account_managers ?? [];
  const countryConfig = useMemo(
    () => getCountryConfig(resolveCountryCode(formData.country)),
    [formData.country],
  );

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const setAddressField = (type, key, value) =>
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));

  /* ---- fetch dropdown options once ---- */
  useEffect(() => {
    if (!formOptions.loaded) dispatch(fetchCustomerFormOptions());
  }, [dispatch, formOptions.loaded]);

  /* ---- Reset fetch tracking if the ID changes ---- */
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [id]);

  /* ---- Fetch existing customer if not in list ---- */
  useEffect(() => {
    if (!isEdit || hasFetchedRef.current) return;
    if (existingCustomer && String(existingCustomer.id) === String(id)) {
      hasFetchedRef.current = true;
      return;
    }
    hasFetchedRef.current = true;
    dispatch(fetchCustomerById(id));
  }, [dispatch, isEdit, id, existingCustomer]);

  /* ---- Fetch contact persons for this customer (edit mode) ---- */
  useEffect(() => {
    if (!isEdit || !id) return;
    if (!contactPersons[id]) {
      dispatch(fetchContactPersons(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  /* ---- Hydrate local contact persons from Redux ---- */
  useEffect(() => {
    if (!isEdit || !id) return;
    const list = contactPersons[id];
    if (Array.isArray(list)) {
      setLocalContactPersons(
        list.map((cp) => ({
          id: cp.id,
          salutation: cp.salutation ?? "",
          firstName: cp.firstName ?? cp.first_name ?? "",
          lastName: cp.lastName ?? cp.last_name ?? "",
          email: cp.email ?? "",
          workPhone: cp.workPhone ?? cp.work_phone ?? "",
          mobile: cp.mobile ?? "",
        })),
      );
    }
  }, [isEdit, id, contactPersons]);

  /* ---- Hydrate form when existingCustomer AND options are ready ---- */
  useEffect(() => {
    if (!existingCustomer || !formOptions.loaded) return;

    const toCode = (v) => {
      if (!v) return "";
      const hit = CURRENCIES.find(
        (c) => c.value === v || c.code === v || c.label === v,
      );
      return hit?.value ?? v;
    };

    const mapAddress = (snakeObj, camelObj) => {
      const src = camelObj || snakeObj || {};
      return {
        attention: src.attention ?? "",
        street1: src.street1 ?? "",
        street2: src.street2 ?? "",
        city: src.city ?? "",
        state: src.state ?? "",
        pinCode: src.pinCode ?? src.pin_code ?? "",
        phone: src.phone ?? "",
        fax: src.fax ?? "",
      };
    };

    setFormData({
      type: existingCustomer.type ?? existingCustomer.customer_type ?? "",
      salutation: existingCustomer.salutation ?? "",
      firstName:
        existingCustomer.firstName ?? existingCustomer.first_name ?? "",
      lastName: existingCustomer.lastName ?? existingCustomer.last_name ?? "",
      companyName:
        existingCustomer.companyName ?? existingCustomer.company_name ?? "",
      displayName:
        existingCustomer.displayName ?? existingCustomer.display_name ?? "",
      email: existingCustomer.email ?? "",
      country: existingCustomer.country ?? "",
      workPhone:
        existingCustomer.workPhone ?? existingCustomer.work_phone ?? "",
      mobile: existingCustomer.mobile ?? "",
      language: existingCustomer.language ?? "English",
      pan: existingCustomer.pan ?? "",
      currencies: (existingCustomer.currencies ?? [])
        .map(toCode)
        .filter(Boolean),
      exchangeRates: existingCustomer.exchangeRates ?? {},
      baseCurrency: toCode(
        existingCustomer.baseCurrency ?? existingCustomer.currency ?? "",
      ),
      receivableAccount:
        existingCustomer.receivableAccount ??
        existingCustomer.receivable_account ??
        "",
      openingBalance:
        existingCustomer.openingBalance ??
        existingCustomer.opening_balance ??
        0,
      paymentTerms:
        existingCustomer.paymentTerms ?? existingCustomer.payment_terms ?? "",
      portalAccess:
        existingCustomer.portalAccess ??
        existingCustomer.portal_access ??
        false,
      billingAddress: mapAddress(
        existingCustomer.billing_address,
        existingCustomer.billingAddress,
      ),
      shippingAddress: mapAddress(
        existingCustomer.shipping_address,
        existingCustomer.shippingAddress,
      ),
      accountManagerId:
        existingCustomer.accountManagerId ??
        existingCustomer.account_manager_id ??
        "",
      contactPersonName:
        existingCustomer.contactPersonName ??
        existingCustomer.contact_person_name ??
        "",
        remarks: existingCustomer.remarks ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCustomer, formOptions.loaded]);

  /* ---- Seed defaults for a NEW customer once options are loaded ---- */
  useEffect(() => {
    if (isEdit || !formOptions.loaded) return;

    setFormData((prev) => {
      if (prev.type || prev.country) return prev;

      const firstCurrency = CURRENCIES[0]?.value ?? "";
      return {
        ...prev,
        type: CUSTOMER_TYPES[0] ?? "",
        salutation: SALUTATIONS[0]?.value ?? "",
        country: countryOptions[0]?.value ?? "",
        currencies: firstCurrency ? [firstCurrency] : [],
        baseCurrency: firstCurrency,
        paymentTerms: PAYMENT_TERMS[0]?.value ?? "",
        receivableAccount: RECEIVABLE_ACCOUNTS[0]?.value ?? "",
        accountManagerId: ACCOUNT_MANAGERS[0]?.value ?? "",
        contactPersonName: prev.contactPersonName, // leave blank, auto-filled on submit
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, formOptions.loaded]);

  /* ---- Auto-sync display name ---- */
  /* ---- Auto-sync display name + contact person name ---- */
  useEffect(() => {
    const combinedName =
      `${formData.salutation ? formData.salutation + " " : ""}${formData.firstName} ${formData.lastName}`.trim();
    setFormData((prev) => {
      const next = { ...prev };
      if (prev.displayName !== combinedName) next.displayName = combinedName;
      if (!prev.contactPersonName && combinedName)
        next.contactPersonName = combinedName;
      return next;
    });
  }, [
    formData.salutation,
    formData.firstName,
    formData.lastName,
    formData.displayName,
  ]);

  /* ---- currency toggle ---- */
  const handleCurrencyToggle = (code) => {
    setFormData((prev) => {
      const isSel = prev.currencies.includes(code);
      let next;
      if (isSel) {
        next = prev.currencies.filter((c) => c !== code);
        if (next.length === 0) return prev;
      } else {
        next = [...prev.currencies, code];
      }
      return {
        ...prev,
        currencies: next,
        baseCurrency: next.includes(prev.baseCurrency)
          ? prev.baseCurrency
          : next[0],
      };
    });
  };

  const handleExchangeRateChange = (code, rate) =>
  setFormData((prev) => ({
    ...prev,
    exchangeRates: {
      ...prev.exchangeRates,
      [code]: rate === "" ? "" : Number(rate),
    },
  }));
  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
  e?.preventDefault();
  setSubmitError(null);

  if (!formOptions.loaded) {
    setSubmitError("Options are still loading, please wait a moment…");
    return;
  }

  const finalDisplayName =
    `${formData.salutation ? formData.salutation + " " : ""}${formData.firstName} ${formData.lastName}`.trim();
  if (!finalDisplayName) {
    setSubmitError("Display name is required. Please enter a name.");
    return;
  }

  // --- Validations ---

  if (formData.type === "Business" && !formData.companyName.trim()) {
    setSubmitError("Company name is required for business customers.");
    return;
  }

  // --- Build payload ---
  const payload = {
    ...formData,
    displayName: finalDisplayName,
    openingBalance: Number(formData.openingBalance) || 0,
    // ✅ send contact persons inline for CREATE only
    contactPersons: isEdit ? undefined : localContactPersons,
  };

  const action = isEdit
    ? updateCustomer({ id, ...payload })
    : createCustomer(payload);

  const result = await dispatch(action);

  if (!result.type.endsWith("/fulfilled")) {
    setSubmitError(result.payload || "Something went wrong. Please try again.");
    return;
  }

  // ---- On EDIT: diff contact persons via dedicated endpoints ----
  if (isEdit) {
    const existingList = contactPersons[id] ?? [];
    const existingIds = existingList.map((p) => p.id);

    const toCreate = localContactPersons.filter((cp) => !cp.id);
    const toUpdate = localContactPersons.filter((cp) => {
      if (!cp.id) return false;
      const original = existingList.find((p) => p.id === cp.id);
      if (!original) return false;
      return (
        (original.salutation ?? "") !== (cp.salutation ?? "") ||
        (original.firstName ?? original.first_name ?? "") !== (cp.firstName ?? "") ||
        (original.lastName ?? original.last_name ?? "") !== (cp.lastName ?? "") ||
        (original.email ?? "") !== (cp.email ?? "") ||
        (original.workPhone ?? original.work_phone ?? "") !== (cp.workPhone ?? "") ||
        (original.mobile ?? "") !== (cp.mobile ?? "")
      );
    });
    const localIds = new Set(localContactPersons.map((cp) => cp.id).filter(Boolean));
    const toDelete = existingIds.filter((eid) => !localIds.has(eid));

    try {
      for (const cp of toCreate) {
        await dispatch(createContactPerson({ customerId: id, ...cp })).unwrap();
      }
      for (const cp of toUpdate) {
        await dispatch(updateContactPerson({ customerId: id, id: cp.id, ...cp })).unwrap();
      }
      for (const delId of toDelete) {
        await dispatch(deleteContactPerson({ customerId: id, id: delId })).unwrap();
      }
    } catch (err) {
      setSubmitError(
        typeof err === "string"
          ? err
          : "Customer saved, but contact persons could not be updated. Please retry from the edit screen.",
      );
      return;
    }

    dispatch(clearContactPersons(id));
  }

  navigate("/admin/accounts/sales/customers");
};

  /* ---- contact persons handlers (local only) ---- */
  const addContactPerson = () => {
    setLocalContactPersons((prev) => [
      ...prev,
      {
        salutation: "",
        firstName: "",
        lastName: "",
        email: "",
        workPhone: "",
        mobile: "",
      },
    ]);
  };

  const handleUpdateContactPerson = (index, field, value) => {
    setLocalContactPersons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeContactPerson = (index) => {
    setLocalContactPersons((prev) => prev.filter((_, i) => i !== index));
  };

  const title = isEdit ? "Edit customer" : "New customer";
  const baseCurrencySymbol =
    CURRENCIES.find((c) => c.value === formData.baseCurrency)?.symbol || "";
  const selectedCurrencyOptions = CURRENCIES.filter((c) =>
    formData.currencies.includes(c.value),
  ).map((c) => ({ value: c.value, label: c.value }));

  return (
    <div className="w-full overflow-x-hidden pb-24 px-2 md:px-4">
      {/* Header */}
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
              to="/admin/accounts/sales/customers"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Customers
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {isEdit ? existingCustomer?.displayName || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {isEdit
              ? "Update customer details, addresses, and contacts"
              : "Add a customer to invoice, receive payments from, and track receivables"}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/accounts/sales/customers")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="mb-4 flex items-start gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <Card
          title="Basic information"
          description="Who this customer is and how they appear across transactions"
        >
          <div className="space-y-5">
            <Field label="Customer type" required>
              <div className="flex items-center gap-5 h-9">
                {CUSTOMER_TYPES.map((t) => (
                  <label
                    key={t}
                    className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === t}
                      onChange={() => setField("type", t)}
                      className="text-green-500 focus:ring-green-400 border-gray-300"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Company name">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                />
              </Field>
              <Field label="Display name" required>
                <input
                  type="text"
                  className={`${inputCls} bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed`}
                  value={`${formData.salutation ? formData.salutation + " " : ""}${formData.firstName} ${formData.lastName}`.trim()}
                  readOnly
                  placeholder="Auto-generated from name"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Email address">
                <input
                  type="email"
                  className={inputCls}
                  value={formData.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </Field>
              <Field label="Country" required>
                <SearchableSelect
                  value={formData.country}
                  onChange={(v) => setField("country", v)}
                  options={countryOptions}
                  placeholder="Select country"
                  clearable={false}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Work phone">
                <PhoneInput
                  prefix={countryConfig.dialCode}
                  value={formData.workPhone}
                  onChange={(e) => setField("workPhone", e.target.value)}
                  placeholder="Work phone"
                />
              </Field>
              <Field label="Mobile">
                <PhoneInput
                  prefix={countryConfig.dialCode}
                  value={formData.mobile}
                  onChange={(e) => setField("mobile", e.target.value)}
                  placeholder="Mobile"
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="!py-0">
          <div className="px-5 sm:px-6 pt-3">
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 -mx-5 sm:-mx-6 px-5 sm:px-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap px-3 py-2.5 text-xs md:text-[12.5px] font-medium transition-colors border-b-2 -mb-px ${
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
            {activeTab === "Other details" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-5">
                <Field label={countryConfig.taxLabel}>
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.pan}
                    onChange={(e) => setField("pan", e.target.value)}
                  />
                </Field>

                <div className="md:col-span-3">
                  <Field label="Currencies">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {CURRENCIES.map((cur) => {
                        const isSelected = formData.currencies.includes(
                          cur.value,
                        );
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
                            {isSelected && (
                              <XCircle
                                size={12}
                                className="opacity-70 hover:opacity-100"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>

                {formData.currencies.length > 1 && (
                  <div className="md:col-span-3 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Field label="Base Currency">
                          <SearchableSelect
                            value={formData.baseCurrency}
                            onChange={(v) => setField("baseCurrency", v)}
                            options={selectedCurrencyOptions}
                            placeholder="Select base currency"
                            clearable={false}
                          />
                        </Field>
                        <p className="text-[11px] text-gray-500 mt-2">
                          All transactions will be recorded against this base
                          currency.
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                          Exchange Rates
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {formData.currencies
                            .filter((c) => c !== formData.baseCurrency)
                            .map((curr) => (
                              <div
                                key={curr}
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                              >
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 pl-2 shrink-0">
                                  1 {curr} =
                                </span>
                                <input
                                  type="number"
                                  step="0.0001"
                                  placeholder="0.00"
                                  value={formData.exchangeRates[curr] || ""}
                                  onChange={(e) =>
                                    handleExchangeRateChange(
                                      curr,
                                      e.target.value,
                                    )
                                  }
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
                  <CurrencyInput
                    symbol={baseCurrencySymbol}
                    value={formData.openingBalance}
                    onChange={(e) => setField("openingBalance", e.target.value)}
                  />
                </Field>
                

                <Field label="Payment terms">
                  <SearchableSelect
                    value={formData.paymentTerms}
                    onChange={(v) => setField("paymentTerms", v)}
                    options={PAYMENT_TERMS}
                    clearable={false}
                  />
                </Field>

                <Field label="Accounts receivable" hint>
                  <SearchableSelect
                    value={formData.receivableAccount}
                    onChange={(v) => setField("receivableAccount", v)}
                    options={RECEIVABLE_ACCOUNTS}
                    clearable={false}
                  />
                </Field>

                <div className="md:col-span-3 pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.portalAccess}
                    onChange={(e) => setField("portalAccess", e.target.checked)}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-400"
                  />
                  <label className="text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
                    Allow portal access for this customer
                  </label>
                </div>
              </div>
            )}

            {activeTab === "Address" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AddressBlock
                  title="Billing address"
                  address={formData.billingAddress}
                  onChange={(k, v) => setAddressField("billingAddress", k, v)}
                  config={countryConfig}
                />
                <AddressBlock
                  title="Shipping address"
                  address={formData.shippingAddress}
                  onChange={(k, v) => setAddressField("shippingAddress", k, v)}
                  onCopyBilling={() =>
                    setField("shippingAddress", { ...formData.billingAddress })
                  }
                  config={countryConfig}
                />
              </div>
            )}

            {activeTab === "Contact persons" && (
              <div>
                {contactPersonsLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
                    <Loader2
                      size={18}
                      className="animate-spin text-green-500"
                    />
                    <span className="text-sm">Loading contact persons…</span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                      <div className="min-w-[700px] lg:min-w-0">
                        <table className="w-full border-collapse text-xs md:text-[12.5px]">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                              {[
                                "Salutation",
                                "First name",
                                "Last name",
                                "Email",
                                "Work phone",
                                "Mobile",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 md:py-2.5"
                                >
                                  {h}
                                </th>
                              ))}
                              <th className="w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {localContactPersons.length > 0 ? (
                              localContactPersons.map((cp, i) => (
                                <tr
                                  key={cp.id ?? `new-${i}`}
                                  className="border-b border-gray-200 dark:border-gray-700"
                                >
                                  <td className="px-1 py-1">
                                    <select
                                      value={cp.salutation || ""}
                                      onChange={(e) =>
                                        handleUpdateContactPerson(
                                          i,
                                          "salutation",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition cursor-pointer"
                                    >
                                      <option value="">Select</option>
                                      {SALUTATIONS.map((s) => {
                                        const val =
                                          typeof s === "string" ? s : s.value;
                                        const label =
                                          typeof s === "string" ? s : s.label;
                                        return (
                                          <option key={val} value={val}>
                                            {label}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </td>
                                  <td className="px-1 py-1">
                                    <input
                                      type="text"
                                      value={cp.firstName || ""}
                                      onChange={(e) =>
                                        handleUpdateContactPerson(
                                          i,
                                          "firstName",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                                    />
                                  </td>
                                  <td className="px-1 py-1">
                                    <input
                                      type="text"
                                      value={cp.lastName || ""}
                                      onChange={(e) =>
                                        handleUpdateContactPerson(
                                          i,
                                          "lastName",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                                    />
                                  </td>
                                  <td className="px-1 py-1">
                                    <input
                                      type="email"
                                      value={cp.email || ""}
                                      onChange={(e) =>
                                        handleUpdateContactPerson(
                                          i,
                                          "email",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                                    />
                                  </td>
                                  <td className="px-1 py-1">
                                    <div className="flex">
                                      <span className="inline-flex items-center px-2 text-xs text-gray-500 bg-transparent border border-transparent">
                                        {countryConfig.dialCode}
                                      </span>
                                      <input
                                        type="text"
                                        value={cp.workPhone || ""}
                                        onChange={(e) =>
                                          handleUpdateContactPerson(
                                            i,
                                            "workPhone",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full min-w-0 px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-1 py-1">
                                    <div className="flex">
                                      <span className="inline-flex items-center px-2 text-xs text-gray-500 bg-transparent border border-transparent">
                                        {countryConfig.dialCode}
                                      </span>
                                      <input
                                        type="text"
                                        value={cp.mobile || ""}
                                        onChange={(e) =>
                                          handleUpdateContactPerson(
                                            i,
                                            "mobile",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full min-w-0 px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-1 text-center align-middle">
                                    <button
                                      type="button"
                                      onClick={() => removeContactPerson(i)}
                                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                      <X size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="py-10 text-center text-gray-500 dark:text-gray-400"
                                >
                                  No contact persons added yet. Click the button
                                  below to add one.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-center mt-6">
                      <button
                        type="button"
                        onClick={addContactPerson}
                        className="inline-flex items-center gap-1.5 px-6 py-2 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                      >
                        <Plus size={14} /> Add Contact Person
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "Remarks" && (
  <Field label="Remarks (internal notes)">
    <textarea
      rows={5}
      className={inputCls}
      placeholder="Add any internal notes about this customer…"
      value={formData.remarks}
      onChange={(e) => setField("remarks", e.target.value)}
    />
  </Field>
)}
          </div>
        </Card>

        {/* Footer */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/accounts/sales/customers")}
              disabled={submitting || contactPersonSubmitting}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                !formOptions.loaded ||
                contactPersonSubmitting
              }
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {(submitting || contactPersonSubmitting) && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {isEdit ? "Save changes" : "Create customer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
