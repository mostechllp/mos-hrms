// src/admin/pages/crm/AddOpportunity.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  CalendarClock,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";

// ------------------------------------------------------------
// Static option lists
// ------------------------------------------------------------

const CUSTOMERS = [
  "ABC Traders",
  "XYZ Pvt Ltd",
  "PQR Solutions",
  "LMN Group",
  "Acme Corp",
  "Globex Ltd",
  "Initech Solutions",
];

const CONTACT_PERSONS = [
  "Ramesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Neha Verma",
  "Vikram Singh",
  "Anjali Nair",
];

const LEAD_SOURCES = ["Referral", "Website", "Sales", "Other"];

const PRODUCTS = [
  "HRMS",
  "ERP",
  "CRM",
  "Payroll",
  "Attendance System",
  "Custom Development",
];

const STAGES = ["New", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

const CURRENCIES = ["INR", "USD", "AED", "GBP"];

const SALESPEOPLE = [
  { value: "rahul", label: "Rahul Verma" },
  { value: "amina", label: "Amina Khan" },
  { value: "karthik", label: "Karthik Raj" },
  { value: "riya", label: "Riya Roy" },
  { value: "aarav", label: "Aarav Mehta" },
];

const SALES_TEAMS = [
  { value: "sales", label: "Sales" },
  { value: "inside-sales", label: "Inside Sales" },
  { value: "field-sales", label: "Field Sales" },
];

const PRIORITIES = ["Low", "Medium", "High"];

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

const Section = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
      {title}
    </h2>
    {children}
  </div>
);

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

const AddOpportunity = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Basic
    opportunityId: "OPP-0008",
    name: "",
    customer: "",
    contactPerson: "",
    leadSource: "Website",
    products: [],
    description: "",

    // Sales
    estimatedValue: "",
    currency: "INR",
    stage: "New",
    probability: "20",
    expectedClose: "",
    assignedTo: "",
    salesTeam: "",
    priority: "Medium",

    // Additional
    competitor: "",
    requirements: "",
    decisionMaker: "",
    nextAction: "",
    notes: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleProduct = (product) => {
    setForm((prev) => {
      const exists = prev.products.includes(product);
      return {
        ...prev,
        products: exists
          ? prev.products.filter((p) => p !== product)
          : [...prev.products, product],
      };
    });
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (i) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    if (!form.name.trim()) {
      showToast("Opportunity name is required", "error");
      return false;
    }
    if (!form.customer) {
      showToast("Please select a customer", "error");
      return false;
    }
    if (!form.assignedTo) {
      showToast("Please assign a salesperson", "error");
      return false;
    }
    return true;
  };

  const submit = async (afterSave) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: dispatch(createOpportunity({ ...form, attachments }))
      console.log("Submitting opportunity:", { ...form, attachments });
      showToast("Opportunity saved successfully", "success");
      if (afterSave) afterSave();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () =>
    submit(() => navigate("/admin/crm/opportunities"));

  const handleSaveAndScheduleActivity = () =>
    submit(() =>
      showToast("Opportunity saved. Open schedule activity next.", "success"),
    );

  const handleSaveAndCreateQuotation = () =>
    submit(() =>
      showToast("Opportunity saved. Open create quotation next.", "success"),
    );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
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
            Add Opportunity
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create a new sales opportunity
          </p>
        </div>
      </div>

      {/* Basic information */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Opportunity ID">
            <Input
              value={form.opportunityId}
              readOnly
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </Field>
          <Field label="Opportunity Name" required>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. ABC Traders HRMS Rollout"
            />
          </Field>
          <Field label="Customer" required>
            <Select
              value={form.customer}
              onChange={(e) => update("customer", e.target.value)}
              options={[{ value: "", label: "Select customer..." }, ...CUSTOMERS]}
            />
          </Field>
          <Field label="Contact Person">
            <Select
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              options={[{ value: "", label: "Select contact..." }, ...CONTACT_PERSONS]}
            />
          </Field>
          <Field label="Lead Source">
            <Select
              value={form.leadSource}
              onChange={(e) => update("leadSource", e.target.value)}
              options={LEAD_SOURCES}
            />
          </Field>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            Product / Service
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => {
              const selected = form.products.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleProduct(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {selected && "✓ "}
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What is this opportunity about?"
          />
        </Field>
      </Section>

      {/* Sales information */}
      <Section title="Sales Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Estimated Value">
            <Input
              type="number"
              value={form.estimatedValue}
              onChange={(e) => update("estimatedValue", e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Currency">
            <Select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              options={CURRENCIES}
            />
          </Field>
          <Field label="Stage">
            <Select
              value={form.stage}
              onChange={(e) => update("stage", e.target.value)}
              options={STAGES}
            />
          </Field>
          <Field label="Probability (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={form.probability}
              onChange={(e) => update("probability", e.target.value)}
            />
          </Field>
          <Field label="Expected Closing Date">
            <Input
              type="date"
              value={form.expectedClose}
              onChange={(e) => update("expectedClose", e.target.value)}
            />
          </Field>
          <Field label="Assigned Salesperson" required>
            <Select
              value={form.assignedTo}
              onChange={(e) => update("assignedTo", e.target.value)}
              options={[
                { value: "", label: "Select salesperson..." },
                ...SALESPEOPLE,
              ]}
            />
          </Field>
          <Field label="Sales Team">
            <Select
              value={form.salesTeam}
              onChange={(e) => update("salesTeam", e.target.value)}
              options={[{ value: "", label: "Select team..." }, ...SALES_TEAMS]}
            />
          </Field>
          <Field label="Priority">
            <Select
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
              options={PRIORITIES}
            />
          </Field>
        </div>
      </Section>

      {/* Additional information */}
      <Section title="Additional Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Competitor">
            <Input
              value={form.competitor}
              onChange={(e) => update("competitor", e.target.value)}
              placeholder="e.g. Oracle, SAP"
            />
          </Field>
          <Field label="Decision Maker">
            <Input
              value={form.decisionMaker}
              onChange={(e) => update("decisionMaker", e.target.value)}
              placeholder="e.g. CTO, CFO"
            />
          </Field>
        </div>
        <Field label="Customer Requirements">
          <Textarea
            rows={3}
            value={form.requirements}
            onChange={(e) => update("requirements", e.target.value)}
            placeholder="What does the customer need?"
          />
        </Field>
        <Field label="Next Action">
          <Input
            value={form.nextAction}
            onChange={(e) => update("nextAction", e.target.value)}
            placeholder="e.g. Send proposal by Friday"
          />
        </Field>
        <Field label="Notes">
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any internal notes..."
          />
        </Field>

        {/* Attachments */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            Attachments
          </label>
          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
            <Upload size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload files
            </span>
            <input
              type="file"
              multiple
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      ({Math.round(f.size / 1024)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
          onClick={handleSaveAndCreateQuotation}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FileText size={15} /> Save & Create Quotation
        </button>
        <button
          type="button"
          onClick={handleSaveAndScheduleActivity}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CalendarClock size={15} /> Save & Schedule Activity
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <Save size={15} /> Save Opportunity
        </button>
      </div>
    </div>
  );
};

export default AddOpportunity;