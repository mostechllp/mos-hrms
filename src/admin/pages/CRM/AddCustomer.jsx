// src/admin/pages/CRM/AddCustomer.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Save, UserPlus, Briefcase, X, Loader } from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import SearchableSelect from "../../../components/common/SearchableSelect";
import DateInput from "../../components/common/DateInput";
import {
  fetchCustomerFormOptions,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  fromCustomerApi,
} from "../../store/slices/customerSlice";

const emptyForm = {
  customerId: "",
  customerType: "Company",
  companyName: "",
  industry: "",
  registrationNumber: "",
  taxNumber: "",
  website: "",
  status: "Active",
  customerSince: new Date().toISOString().split("T")[0],
  assignedTo: "",
  billingAddress: "",
  shippingAddress: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  contactName: "",
  contactDesignation: "",
  contactEmail: "",
  contactPhone: "",
  contactAltPhone: "",
  preferredComm: "Email",
  category: "Customer",
  source: "",
  paymentTerms: "",
  creditLimit: "0",
  notes: "",
};

const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
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

const Section = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
      {title}
    </h2>
    {children}
  </div>
);

const strOptions = (arr) => (arr || []).map((v) => ({ value: v, label: v }));

const AddCustomer = () => {
  const { customerId: routeId } = useParams();
  const isEdit = Boolean(routeId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { options, currentCustomer, currentCustomerLoading, submitting } =
    useSelector((state) => state.customers);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchCustomerFormOptions());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && routeId) {
      dispatch(fetchCustomerById(routeId));
    }
  }, [dispatch, isEdit, routeId]);

  useEffect(() => {
    if (isEdit && currentCustomer) {
      const mapped = fromCustomerApi(currentCustomer);
      setForm({
        ...emptyForm,
        ...mapped,
        assignedTo: mapped.assignedTo ? String(mapped.assignedTo) : "",
        creditLimit:
          mapped.creditLimit !== "" && mapped.creditLimit != null
            ? String(mapped.creditLimit)
            : "0",
      });
    }
  }, [isEdit, currentCustomer]);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!form.companyName.trim()) {
      showToast("Company name is required", "error");
      return false;
    }
    if (!form.assignedTo) {
      showToast("Please assign an account manager", "error");
      return false;
    }
    if (!form.contactName.trim()) {
      showToast("Primary contact name is required", "error");
      return false;
    }
    if (!form.paymentTerms) {
      showToast("Payment terms are required", "error");
      return false;
    }
    return true;
  };

  const submit = async (afterSuccess) => {
    if (!validate()) return;
    try {
      const payload = {
        ...form,
        creditLimit:
          form.creditLimit === "" || form.creditLimit == null
            ? 0
            : Number(form.creditLimit),
      };

      if (isEdit) {
        await dispatch(updateCustomer({ id: routeId, data: payload })).unwrap();
        showToast("Customer updated successfully", "success");
      } else {
        await dispatch(createCustomer(payload)).unwrap();
        showToast("Customer created successfully", "success");
      }
      afterSuccess?.();
    } catch (err) {
      showToast(err || "Failed to save customer", "error");
    }
  };

  const handleSave = () => submit(() => navigate("/admin/crm/customers"));
  const handleSaveAndAddContact = () =>
    submit((created) => {
      const id = created?.id || routeId;
      showToast("Customer saved. Add contact from the detail page.", "success");
      if (id) navigate(`/admin/crm/customers/${id}`);
    });
  const handleSaveAndAddOpportunity = () =>
    submit((created) => {
      const id = created?.id || routeId;
      showToast(
        "Customer saved. Add opportunity from the detail page.",
        "success",
      );
      if (id) navigate(`/admin/crm/customers/${id}`);
    });

  // Option arrays
  const accountManagerOptions = (options.account_managers || []).map((a) => ({
    value: String(a.id),
    label: a.designation ? `${a.name} — ${a.designation}` : a.name,
  }));

  const customerTypeOptions = strOptions(options.customer_types);
  const statusOptions = strOptions(options.customer_statuses);
  const industryOptions = strOptions(options.industries);
  const countryOptions = strOptions(options.countries);
  const stateOptions = strOptions(options.states);
  const preferredCommOptions = strOptions(options.preferred_communication);
  const categoryOptions = strOptions(options.customer_categories);
  const sourceOptions = strOptions(options.customer_sources);
  const paymentTermsOptions = strOptions(options.payment_terms);

  if (isEdit && currentCustomerLoading && !currentCustomer) {
    return (
      <div className="w-full py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Customer" : "Add Customer"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isEdit
              ? "Update this customer's information"
              : "Create a new customer record"}
          </p>
        </div>
      </div>

      {/* A — Company */}
      <Section title="A. Company Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEdit && (
            <Field label="Customer ID">
              <Input
                value={form.customerId}
                readOnly
                disabled
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </Field>
          )}
          <Field label="Customer Type">
            <SearchableSelect
              value={form.customerType}
              onChange={(v) => update("customerType", v)}
              options={customerTypeOptions}
              placeholder="Select type..."
            />
          </Field>
          <Field label="Company Name" required>
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </Field>
          <Field label="Industry">
            <SearchableSelect
              value={form.industry}
              onChange={(v) => update("industry", v)}
              options={industryOptions}
              placeholder="Select industry..."
            />
          </Field>
          <Field label="Company Registration No.">
            <Input
              value={form.registrationNumber}
              onChange={(e) => update("registrationNumber", e.target.value)}
            />
          </Field>
          <Field label="Tax / GST No.">
            <Input
              value={form.taxNumber}
              onChange={(e) => update("taxNumber", e.target.value)}
            />
          </Field>
          <Field label="Website">
            <Input
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="Customer Status">
            <SearchableSelect
              value={form.status}
              onChange={(v) => update("status", v)}
              options={statusOptions}
            />
          </Field>
          <Field label="Customer Since">
            <DateInput
              value={form.customerSince}
              onChange={(val) => update("customerSince", val)}
              type="general"
              placeholder="dd/mm/yyyy"
              className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !px-3 !py-2"
            />
          </Field>
          <Field label="Assigned Account Manager" required>
            <SearchableSelect
              value={form.assignedTo}
              onChange={(v) => update("assignedTo", v)}
              options={accountManagerOptions}
              placeholder="Select account manager..."
              searchPlaceholder="Search..."
            />
          </Field>
        </div>
      </Section>

      {/* B — Address */}
      <Section title="B. Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Field label="Shipping / Service Address">
              <Textarea
                rows={2}
                value={form.shippingAddress}
                onChange={(e) => update("shippingAddress", e.target.value)}
              />
            </Field>
          </div>
          <Field label="City">
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
          <Field label="State">
            <SearchableSelect
              value={form.state}
              onChange={(v) => update("state", v)}
              options={stateOptions}
              placeholder="Select state..."
            />
          </Field>
          <Field label="Country">
            <SearchableSelect
              value={form.country}
              onChange={(v) => update("country", v)}
              options={countryOptions}
            />
          </Field>
          <Field label="Postal Code">
            <Input
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* C — Contact */}
      <Section title="C. Primary Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact Person Name" required>
            <Input
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              placeholder="e.g. Ramesh Kumar"
            />
          </Field>
          <Field label="Designation">
            <Input
              value={form.contactDesignation}
              onChange={(e) => update("contactDesignation", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
            />
          </Field>
          <Field label="Alternate Phone">
            <Input
              value={form.contactAltPhone}
              onChange={(e) => update("contactAltPhone", e.target.value)}
            />
          </Field>
          <Field label="Preferred Communication">
            <SearchableSelect
              value={form.preferredComm}
              onChange={(v) => update("preferredComm", v)}
              options={preferredCommOptions}
            />
          </Field>
        </div>
      </Section>

      {/* D — Business */}
      <Section title="D. Business Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Customer Category">
            <SearchableSelect
              value={form.category}
              onChange={(v) => update("category", v)}
              options={categoryOptions}
            />
          </Field>
          <Field label="Customer Source">
            <SearchableSelect
              value={form.source}
              onChange={(v) => update("source", v)}
              options={sourceOptions}
              placeholder="Select source..."
            />
          </Field>
          <Field label="Payment Terms" required>
            <SearchableSelect
              value={form.paymentTerms}
              onChange={(v) => update("paymentTerms", v)}
              options={paymentTermsOptions}
              placeholder="Select terms..."
            />
          </Field>
          <Field label="Credit Limit" hint="Defaults to 0">
            <Input
              type="number"
              value={form.creditLimit}
              onChange={(e) => update("creditLimit", e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </Field>
      </Section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <X size={15} /> Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAndAddContact}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <UserPlus size={15} /> Save & Add Contact
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? (
            <>
              <Loader size={15} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={15} /> {isEdit ? "Update Customer" : "Save Customer"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddCustomer;
