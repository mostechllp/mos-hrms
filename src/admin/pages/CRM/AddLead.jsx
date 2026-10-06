// src/admin/pages/CRM/AddLead.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Save, Plus, CalendarClock, X, Loader } from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import SearchableSelect from "../../../components/common/SearchableSelect";
import {
  fetchLeadFormOptions,
  fetchLeadById,
  createLead,
  updateLead,
  fromLeadApi,
} from "../../store/slices/leadSlice";
import { TimeInput } from "../../components/common/TimeInput";
import DateInput from "../../components/common/DateInput";

const emptyForm = {
  leadId: "",
  leadType: "Company",
  leadName: "",
  companyName: "",
  designation: "",
  industry: "",
  website: "",
  leadSource: "",
  leadStatus: "New",
  priority: "Medium",
  email: "",
  primaryPhone: "",
  alternatePhone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  assignedSalespersonId: "",
  salesTeam: "",
  expectedValue: "0", // ← default 0
  expectedClosingDate: "",
  interestedProducts: [],
  notes: "",
  nextFollowUpDate: "",
  nextFollowUpTime: "",
  followUpType: "Call",
  followUpNotes: "",
};

// ---- small pieces ----
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

// Helpers to turn string arrays into SearchableSelect options
const strOptions = (arr) => (arr || []).map((v) => ({ value: v, label: v }));

const AddLead = () => {
  const { leadId } = useParams(); // numeric id in edit mode
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isEdit = Boolean(leadId);

  const { options, currentLead, currentLeadLoading, submitting } = useSelector(
    (state) => state.leads,
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchLeadFormOptions());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && leadId) {
      dispatch(fetchLeadById(leadId));
    }
  }, [dispatch, isEdit, leadId]);

  // Hydrate form on edit
  useEffect(() => {
    if (isEdit && currentLead) {
      const mapped = fromLeadApi(currentLead);

      // Split datetime into date + time
      let nextDate = "";
      let nextTime = "";
      if (mapped.nextFollowUpAt && mapped.nextFollowUpAt.includes(" ")) {
        const [d, t] = mapped.nextFollowUpAt.split(" ");
        nextDate = d;
        nextTime = t.slice(0, 5); // HH:MM
      } else if (mapped.nextFollowUpAt) {
        nextDate = mapped.nextFollowUpAt;
      }

      setForm({
        ...emptyForm,
        ...mapped,
        assignedSalespersonId: mapped.assignedSalespersonId
          ? String(mapped.assignedSalespersonId)
          : "",
        expectedValue:
          mapped.expectedValue !== "" && mapped.expectedValue != null
            ? String(mapped.expectedValue)
            : "0",
        nextFollowUpDate: nextDate,
        nextFollowUpTime: nextTime,
      });
    }
  }, [isEdit, currentLead]);

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
    if (!form.assignedSalespersonId) {
      showToast("Please assign a salesperson", "error");
      return false;
    }
    return true;
  };

  const submitLead = async (afterSuccess) => {
    if (!validate()) return;
    try {
      // Recombine date + time into the API's expected format
      const nextFollowUpAt =
        form.nextFollowUpDate && form.nextFollowUpTime
          ? `${form.nextFollowUpDate} ${form.nextFollowUpTime}:00`
          : form.nextFollowUpDate
            ? `${form.nextFollowUpDate} 00:00:00`
            : "";

      const payload = {
        ...form,
        nextFollowUpAt,
        expectedValue:
          form.expectedValue === "" || form.expectedValue == null
            ? 0
            : Number(form.expectedValue),
      };

      if (isEdit) {
        await dispatch(updateLead({ id: leadId, data: payload })).unwrap();
        showToast("Lead updated successfully", "success");
      } else {
        await dispatch(createLead(payload)).unwrap();
        showToast("Lead created successfully", "success");
      }
      afterSuccess?.();
    } catch (err) {
      showToast(err || "Failed to save lead", "error");
    }
  };

  const handleSave = () => submitLead(() => navigate("/admin/crm/leads"));

  const handleSaveAndAddAnother = () => {
    if (isEdit) {
      submitLead(() => {});
      return;
    }
    submitLead(() => setForm(emptyForm));
  };

  const handleSaveAndScheduleFollowUp = () => {
    submitLead((created) => {
      const newId = created?.id || created?.lead_id || leadId;
      if (newId) navigate(`/admin/crm/leads/${newId}`);
      else navigate("/admin/crm/leads");
    });
  };

  // SearchableSelect option arrays
  const salespersonOptions = (options.salespersons || []).map((s) => ({
    value: String(s.id),
    label: s.designation ? `${s.name} — ${s.designation}` : s.name,
  }));

  const leadTypeOptions = strOptions(options.lead_types);
  const industryOptions = strOptions(options.industries);
  const leadSourceOptions = strOptions(options.lead_sources);
  const leadStatusOptions = strOptions(options.lead_statuses);
  const priorityOptions = strOptions(options.priorities);
  const salesTeamOptions = strOptions(options.sales_teams);
  const followUpTypeOptions = strOptions(options.follow_up_types);

  if (isEdit && currentLeadLoading && !currentLead) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 flex justify-center">
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
            {isEdit ? "Edit Lead" : "Add Lead"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isEdit
              ? "Update this lead's information"
              : "Create a new sales lead"}
          </p>
        </div>
      </div>

      {/* A. Basic */}
      <Section title="A. Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEdit && (
            <Field label="Lead ID">
              <Input
                value={form.leadId}
                readOnly
                disabled
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </Field>
          )}
          <Field label="Lead Type">
            <SearchableSelect
              value={form.leadType}
              onChange={(v) => update("leadType", v)}
              options={leadTypeOptions}
              placeholder="Select lead type..."
              searchPlaceholder="Search type..."
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
            <SearchableSelect
              value={form.industry}
              onChange={(v) => update("industry", v)}
              options={industryOptions}
              placeholder="Select industry..."
              searchPlaceholder="Search industry..."
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
            <SearchableSelect
              value={form.leadSource}
              onChange={(v) => update("leadSource", v)}
              options={leadSourceOptions}
              placeholder="Select source..."
              searchPlaceholder="Search source..."
            />
          </Field>
          <Field label="Lead Status">
            <SearchableSelect
              value={form.leadStatus}
              onChange={(v) => update("leadStatus", v)}
              options={leadStatusOptions}
              placeholder="Select status..."
              searchPlaceholder="Search status..."
            />
          </Field>
          <Field label="Priority">
            <SearchableSelect
              value={form.priority}
              onChange={(v) => update("priority", v)}
              options={priorityOptions}
              placeholder="Select priority..."
              searchPlaceholder="Search priority..."
            />
          </Field>
        </div>
      </Section>

      {/* B. Contact */}
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

      {/* C. Sales */}
      <Section title="C. Sales Assignment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Assigned Salesperson" required>
            <SearchableSelect
              value={form.assignedSalespersonId}
              onChange={(v) => update("assignedSalespersonId", v)}
              options={salespersonOptions}
              placeholder="Select salesperson..."
              searchPlaceholder="Search salesperson..."
              loading={!options.salespersons?.length && !options.salespersons}
            />
          </Field>
          <Field label="Sales Team">
            <SearchableSelect
              value={form.salesTeam}
              onChange={(v) => update("salesTeam", v)}
              options={salesTeamOptions}
              placeholder="Select team..."
              searchPlaceholder="Search team..."
            />
          </Field>
          <Field label="Expected Value" hint="Defaults to 0 if left blank">
            <Input
              type="number"
              value={form.expectedValue}
              onChange={(e) => update("expectedValue", e.target.value)}
              placeholder="0"
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
            {(options.interested_products || []).map((p) => {
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

      <Section title="D. Follow-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Next Follow-up Date">
            <DateInput
              value={form.nextFollowUpDate}
              onChange={(val) => update("nextFollowUpDate", val)}
              type="general"
              placeholder="dd/mm/yyyy"
              className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !px-3 !py-2"
            />
          </Field>
          <Field label="Next Follow-up Time">
            <TimeInput
              value={form.nextFollowUpTime}
              onChange={(e) => update("nextFollowUpTime", e.target.value)}
              className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !py-2"
            />
          </Field>
          <Field label="Follow-up Type">
            <SearchableSelect
              value={form.followUpType}
              onChange={(v) => update("followUpType", v)}
              options={followUpTypeOptions}
              placeholder="Select follow-up type..."
              searchPlaceholder="Search type..."
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
        {!isEdit && (
          <button
            type="button"
            onClick={handleSaveAndAddAnother}
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus size={15} /> Save & Add Another
          </button>
        )}
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
              <Save size={15} /> {isEdit ? "Update Lead" : "Save Lead"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddLead;
