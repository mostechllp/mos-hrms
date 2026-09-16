// src/admin/pages/crm/AddLead.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, CalendarClock, X } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

// ------------------------------------------------------------
// Static option lists
// ------------------------------------------------------------

const LEAD_TYPES = ["Person", "Company"];

const INDUSTRIES = [
  "IT Services",
  "Manufacturing",
  "Fintech",
  "Retail",
  "Aerospace",
  "Logistics",
  "Healthcare",
  "Education",
  "Real Estate",
  "Other",
];

const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Email",
  "Phone",
  "Exhibition",
  "Manual Entry",
  "Other",
];

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Unqualified",
];

const PRIORITIES = ["Low", "Medium", "High"];
const FOLLOW_UP_TYPES = ["Call", "Email", "Meeting", "Task"];

const SALESPEOPLE = [
  { value: "riya", label: "Riya Roy" },
  { value: "karthik", label: "Karthik Raj" },
  { value: "aarav", label: "Aarav Mehta" },
];

const SALES_TEAMS = [
  { value: "sales", label: "Sales" },
  { value: "inside-sales", label: "Inside Sales" },
  { value: "field-sales", label: "Field Sales" },
];

const PRODUCTS = [
  "HRMS",
  "ERP",
  "CRM",
  "Payroll",
  "Attendance System",
  "Custom Development",
];

// ------------------------------------------------------------
// Small UI pieces
// ------------------------------------------------------------

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

const AddLead = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // A — Basic
    leadId: "LED-0007",
    leadType: "Company",
    leadName: "",
    companyName: "",
    designation: "",
    industry: "",
    website: "",
    leadSource: "Website",
    leadStatus: "New",
    priority: "Medium",

    // B — Contact
    email: "",
    primaryPhone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",

    // C — Sales assignment
    assignedTo: "",
    salesTeam: "",
    expectedValue: "",
    expectedClosingDate: "",
    interestedProducts: [],
    notes: "",

    // D — Follow-up
    nextFollowUpDate: "",
    followUpType: "Call",
    followUpNotes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleProduct = (product) => {
    setForm((prev) => {
      const exists = prev.interestedProducts.includes(product);
      return {
        ...prev,
        interestedProducts: exists
          ? prev.interestedProducts.filter((p) => p !== product)
          : [...prev.interestedProducts, product],
      };
    });
  };

  const validate = () => {
    if (!form.leadName.trim()) {
      showToast("Lead name is required", "error");
      return false;
    }
    if (!form.assignedTo) {
      showToast("Please assign a salesperson", "error");
      return false;
    }
    return true;
  };

  const submitLead = async (afterSave) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: dispatch(createLead(form))
      console.log("Submitting lead:", form);
      showToast("Lead saved successfully", "success");
      if (afterSave) afterSave();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () =>
    submitLead(() => navigate("/admin/crm/leads"));

  const handleSaveAndAddAnother = () =>
    submitLead(() => {
      setForm((f) => ({
        ...f,
        leadName: "",
        companyName: "",
        designation: "",
        website: "",
        email: "",
        primaryPhone: "",
        alternatePhone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        expectedValue: "",
        expectedClosingDate: "",
        interestedProducts: [],
        notes: "",
        nextFollowUpDate: "",
        followUpNotes: "",
      }));
    });

  const handleSaveAndScheduleFollowUp = () =>
    submitLead(() => {
      showToast("Lead saved. Open follow-up scheduler next.", "success");
    });

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
            Add Lead
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create a new sales lead
          </p>
        </div>
      </div>

      {/* Section A — Basic information */}
      <Section title="A. Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lead ID">
            <Input value={form.leadId} readOnly disabled className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
          </Field>
          <Field label="Lead Type">
            <Select
              value={form.leadType}
              onChange={(e) => update("leadType", e.target.value)}
              options={LEAD_TYPES}
            />
          </Field>
          <Field label="Lead Name" required>
            <Input
              value={form.leadName}
              onChange={(e) => update("leadName", e.target.value)}
              placeholder="e.g. Ramesh Kumar"
            />
          </Field>
          <Field label="Company Name">
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </Field>
          <Field label="Designation">
            <Input
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
              placeholder="e.g. Procurement Manager"
            />
          </Field>
          <Field label="Industry">
            <Select
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              options={["", ...INDUSTRIES]}
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
          <Field label="Lead Source">
            <Select
              value={form.leadSource}
              onChange={(e) => update("leadSource", e.target.value)}
              options={LEAD_SOURCES}
            />
          </Field>
          <Field label="Lead Status">
            <Select
              value={form.leadStatus}
              onChange={(e) => update("leadStatus", e.target.value)}
              options={LEAD_STATUSES}
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

      {/* Section B — Contact details */}
      <Section title="B. Contact Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Primary Phone">
            <Input
              value={form.primaryPhone}
              onChange={(e) => update("primaryPhone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Alternate Phone">
            <Input
              value={form.alternatePhone}
              onChange={(e) => update("alternatePhone", e.target.value)}
            />
          </Field>
          <Field label="Postal Code">
            <Input
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Street, area, landmark..."
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
            <Input
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </Field>
          <Field label="Country">
            <Input
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Section C — Sales assignment */}
      <Section title="C. Sales Assignment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Assigned Salesperson" required>
            <Select
              value={form.assignedTo}
              onChange={(e) => update("assignedTo", e.target.value)}
              options={[{ value: "", label: "Select salesperson..." }, ...SALESPEOPLE]}
            />
          </Field>
          <Field label="Sales Team">
            <Select
              value={form.salesTeam}
              onChange={(e) => update("salesTeam", e.target.value)}
              options={[{ value: "", label: "Select team..." }, ...SALES_TEAMS]}
            />
          </Field>
          <Field label="Expected Value">
            <Input
              type="number"
              value={form.expectedValue}
              onChange={(e) => update("expectedValue", e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field label="Expected Closing Date">
            <Input
              type="date"
              value={form.expectedClosingDate}
              onChange={(e) => update("expectedClosingDate", e.target.value)}
            />
          </Field>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            Interested Product / Service
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => {
              const selected = form.interestedProducts.includes(p);
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

        <Field label="Notes">
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any additional context about this lead..."
          />
        </Field>
      </Section>

      {/* Section D — Follow-up */}
      <Section title="D. Follow-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Next Follow-up Date & Time">
            <Input
              type="datetime-local"
              value={form.nextFollowUpDate}
              onChange={(e) => update("nextFollowUpDate", e.target.value)}
            />
          </Field>
          <Field label="Follow-up Type">
            <Select
              value={form.followUpType}
              onChange={(e) => update("followUpType", e.target.value)}
              options={FOLLOW_UP_TYPES}
            />
          </Field>
        </div>
        <Field label="Follow-up Notes">
          <Textarea
            rows={3}
            value={form.followUpNotes}
            onChange={(e) => update("followUpNotes", e.target.value)}
            placeholder="What should this follow-up accomplish?"
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
          onClick={handleSaveAndScheduleFollowUp}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CalendarClock size={15} /> Save & Schedule Follow-up
        </button>
        <button
          type="button"
          onClick={handleSaveAndAddAnother}
          disabled={submitting}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus size={15} /> Save & Add Another
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <Save size={15} /> Save Lead
        </button>
      </div>
    </div>
  );
};

export default AddLead;