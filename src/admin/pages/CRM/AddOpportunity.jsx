// src/admin/pages/crm/AddOpportunity.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  CalendarClock,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import SearchableSelect from "../../../components/common/SearchableSelect";
import DateInput from "../../components/common/DateInput";
import {
  fetchOpportunityFormOptions,
  fetchOpportunityById,
  createOpportunity,
  updateOpportunity,
  uploadOpportunityAttachmentsApi,
  clearCurrentOpportunity,
  fromOpportunityApi,
  createLinkedQuotationApi,
  scheduleLinkedActivityApi,
} from "../../store/slices/opportunitySlice";
import ActivityModal from "../../components/crm/ActivityModal";
import {
  fetchActivityEmployees,
  fetchLeadLookup,
  fetchCustomerLookup,
  fetchOpportunityLookup,
  toActivityApi,    
} from "../../store/slices/activitySlice";

// ------------------------------------------------------------
// UI primitives
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

const Section = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
      {title}
    </h2>
    {children}
  </div>
);

// ------------------------------------------------------------
// Initial form
// ------------------------------------------------------------
const emptyForm = () => ({
  name: "",
  customerId: "",
  contactPersonId: "",
  contactPerson: "",
  leadSource: "Website",
  productNames: [],
  description: "",

  estimatedValue: "",
  currency: "INR",
  stage: "New",
  probability: "20",
  expectedClose: "",
  assignedToId: "",
  salesTeam: "",
  priority: "Medium",

  competitor: "",
  requirements: "",
  decisionMaker: "",
  nextAction: "",
  notes: "",
});

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
const AddOpportunity = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { opportunityId } = useParams();
  const isEdit = Boolean(opportunityId);

  const {
    options,
    optionsLoading,
    optionsLoaded,
    currentOpportunity,
    currentOpportunityLoading,
    submitting,
  } = useSelector((s) => s.opportunities);

  const {
  employeesLookup = [],
  employeesLookupLoading = false,
  leadsLookup = [],
  leadsLookupLoading = false,
  customersLookup = [],
  customersLookupLoading = false,
  opportunitiesLookup = [],
  opportunitiesLookupLoading = false,
} = useSelector((s) => s.activities);

  const [form, setForm] = useState(emptyForm());
  const [attachments, setAttachments] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
const [savedOpportunityId, setSavedOpportunityId] = useState(null);

// Preload activity lookups once so the "Schedule Activity" modal is populated
useEffect(() => {
  dispatch(fetchActivityEmployees());
  dispatch(fetchLeadLookup());
  dispatch(fetchCustomerLookup());
  dispatch(fetchOpportunityLookup());
}, [dispatch]);

  // ── Load form options ──
  useEffect(() => {
    if (!optionsLoaded) dispatch(fetchOpportunityFormOptions());
  }, [dispatch, optionsLoaded]);

  // ── Load single opportunity for edit ──
  useEffect(() => {
    if (isEdit) dispatch(fetchOpportunityById(opportunityId));
    else {
      dispatch(clearCurrentOpportunity());
      setHydrated(false);
    }
    return () => {
      if (isEdit) dispatch(clearCurrentOpportunity());
    };
  }, [dispatch, isEdit, opportunityId]);

  // ── Hydrate form on edit ──
  useEffect(() => {
    if (!isEdit || !currentOpportunity || hydrated) return;
    const o = fromOpportunityApi(currentOpportunity);
    setForm({
      name: o.name || "",
      customerId: o.customerId ? String(o.customerId) : "",
      contactPersonId: o.contactPersonId ? String(o.contactPersonId) : "",
      contactPerson: o.contactPerson === "—" ? "" : o.contactPerson || "",
      leadSource: o.leadSource || "Website",
      productNames: o.productNames || [],
      description: o.description || "",
      estimatedValue: String(o.estimatedValue || ""),
      currency: o.currency || "INR",
      stage: o.stage || "New",
      probability: String(o.probability ?? ""),
      expectedClose: o.expectedClose || "",
      assignedToId: o.assignedToId ? String(o.assignedToId) : "",
      salesTeam: o.salesTeam || "",
      priority: o.priority || "Medium",
      competitor: o.competitor || "",
      requirements: o.requirements || "",
      decisionMaker: o.decisionMaker || "",
      nextAction: o.nextAction || "",
      notes: o.notes || "",
    });
    setHydrated(true);
  }, [isEdit, currentOpportunity, hydrated]);

  // ------------------------------------------------------------
  // Option arrays (all normalized to {value,label})
  // ------------------------------------------------------------

  const customerOptions = useMemo(
    () =>
      (options.customers || []).map((c) => ({
        value: String(c.id),
        label: c.company_name || c.name || `Customer #${c.id}`,
      })),
    [options.customers],
  );

  const salespersonOptions = useMemo(
    () =>
      (options.salespersons || options.sales_people || []).map((s) => ({
        value: String(s.id),
        label: s.name || s.full_name || `Employee #${s.id}`,
      })),
    [options.salespersons, options.sales_people],
  );

  const salesTeamOptions = useMemo(
    () =>
      (options.sales_teams || []).map((t) =>
        typeof t === "string"
          ? { value: t, label: t }
          : {
              value: String(t.id ?? t.value ?? t),
              label: t.name || t.label || String(t),
            },
      ),
    [options.sales_teams],
  );

  const leadSourceOptions = useMemo(
    () =>
      (options.lead_sources || []).map((s) =>
        typeof s === "string"
          ? { value: s, label: s }
          : { value: s.value || s.name, label: s.label || s.name },
      ),
    [options.lead_sources],
  );

  const productOptions = useMemo(
    () =>
      (options.products || options.products_services || []).map((p) =>
        typeof p === "string"
          ? { value: p, label: p }
          : {
              value: p.name || p.product_name,
              label: p.name || p.product_name,
            },
      ),
    [options.products, options.products_services],
  );

  const stageOptions = useMemo(() => {
    const raw = options.stages || [];
    return raw.map((s) =>
      typeof s === "string"
        ? { value: s, label: s, probability: null }
        : {
            value: s.name || s.stage || s.value,
            label: s.name || s.stage || s.label,
            probability: s.default_probability ?? null,
          },
    );
  }, [options.stages]);

  const priorityOptions = useMemo(
    () =>
      (options.priorities || ["Low", "Medium", "High"]).map((p) =>
        typeof p === "string" ? { value: p, label: p } : p,
      ),
    [options.priorities],
  );

  const currencyOptions = useMemo(
    () =>
      (options.currencies || ["INR", "USD", "AED", "GBP"]).map((c) => ({
        value: c,
        label: c,
      })),
    [options.currencies],
  );

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── Product toggle (multi-select pills) ──
  const toggleProduct = (p) => {
    setForm((prev) => {
      const has = prev.productNames.includes(p.value);
      return {
        ...prev,
        productNames: has
          ? prev.productNames.filter((x) => x !== p.value)
          : [...prev.productNames, p.value],
      };
    });
  };

  // ── Auto-fill probability on stage change ──
  const handleStageChange = (stageValue) => {
    const st = stageOptions.find((s) => s.value === stageValue);
    setForm((f) => ({
      ...f,
      stage: stageValue,
      probability:
        st?.probability !== null && st?.probability !== undefined
          ? String(st.probability)
          : f.probability,
    }));
  };

  // ── Attachments ──
  const handleFile = (e) =>
    setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])]);
  const removeAttachment = (i) =>
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));

  // ── Validation ──
  const validate = () => {
    if (!form.name.trim()) {
      showToast("Opportunity name is required", "error");
      return false;
    }
    if (!form.customerId) {
      showToast("Please select a customer", "error");
      return false;
    }
    if (!form.assignedToId) {
      showToast("Please assign a salesperson", "error");
      return false;
    }
    if (form.productNames.length === 0) {
      showToast("Please select at least one product/service", "error");
      return false;
    }
    return true;
  };

  /**
   * Save the opportunity (create or update) and return its id.
   * Shared step for all three actions.
   */
  const saveOpportunity = async () => {
    if (isEdit) {
      const updated = await dispatch(
        updateOpportunity({
          id: opportunityId,
          data: form,
          files: attachments,
        }),
      ).unwrap();
      return updated?.id ?? opportunityId;
    }
    const created = await dispatch(
      createOpportunity({
        form,
        files: attachments,
      }),
    ).unwrap();
    return created?.id;
  };

  // ── Save only ──
  const handleSave = async () => {
    if (!validate()) return;
    try {
      const savedId = await saveOpportunity();
      showToast(
        isEdit ? "Opportunity updated" : "Opportunity created",
        "success",
      );
      navigate(`/admin/crm/opportunities`);
    } catch (err) {
      showToast(err || "Failed to save opportunity", "error");
    }
  };

  // ── Save + Create Quotation ──
  const handleSaveAndCreateQuotation = async () => {
    if (!validate()) return;
    try {
      const savedId = await saveOpportunity();

      // Call the dedicated backend endpoint that creates the linked quotation
      const result = await dispatch(
        createLinkedQuotationApi({
          id: savedId,
          // Pass any quotation-specific fields your API expects.
          // Most backends auto-populate from the opportunity, so empty payload is fine.
        }),
      ).unwrap();

      showToast("Opportunity saved · Quotation created", "success");

      // If backend returns the new quotation id/number, jump straight to it.
      // Otherwise, land on the opportunity detail page.
      const quotationId =
        result?.quotation?.id ?? result?.id ?? result?.quotation_id;
      navigate(`/admin/crm/opportunities/${savedId}`);
    } catch (err) {
      showToast(err || "Failed to create quotation", "error");
    }
  };

  // ── Save + Schedule Activity ──
  const handleSaveAndScheduleActivity = async () => {
  if (!validate()) return;
  try {
    const savedId = await saveOpportunity();
    setSavedOpportunityId(savedId);
    setScheduleModalOpen(true);      // open the modal
    // Don't toast yet — wait until the modal's submit succeeds
  } catch (err) {
    showToast(err || "Failed to save opportunity", "error");
  }
};

const handleScheduleSubmit = async (payload) => {
  try {
    // Convert camelCase modal payload → snake_case API payload
    const apiPayload = toActivityApi(payload);

    await dispatch(
      scheduleLinkedActivityApi({
        id: savedOpportunityId,
        ...apiPayload,
      }),
    ).unwrap();

    showToast("Opportunity saved · Activity scheduled", "success");
    setScheduleModalOpen(false);
    navigate(`/admin/crm/opportunities/${savedOpportunityId}`);
  } catch (err) {
    showToast(err || "Failed to schedule activity", "error");
  }
};
  // ── Loading ──
  if (isEdit && currentOpportunityLoading && !hydrated) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-gray-500 dark:text-gray-400">
        Loading opportunity…
      </div>
    );
  }

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
            {isEdit ? "Edit Opportunity" : "Add Opportunity"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isEdit
              ? "Update the sales opportunity"
              : `Create a new sales opportunity · Next ID: ${options.next_opportunity_id || "auto"}`}
          </p>
        </div>
      </div>

      {/* ── Basic Information ── */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Opportunity Name" required>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. ABC Traders HRMS Rollout"
            />
          </Field>

          <SearchableSelect
            label="Customer"
            required
            value={form.customerId}
            onChange={(v) => {
              update("customerId", v);
              const c = (options.customers || []).find(
                (x) => String(x.id) === String(v),
              );
              if (c) update("contactPerson", c.contact_person_name || "");
            }}
            options={customerOptions}
            loading={optionsLoading}
            placeholder="Select customer..."
            searchPlaceholder="Search customers..."
            emptyMessage="No customers found"
          />

          <Field label="Contact Person">
            <Input
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              placeholder="Contact person name"
            />
          </Field>

          <SearchableSelect
            label="Lead Source"
            value={form.leadSource}
            onChange={(v) => update("leadSource", v)}
            options={leadSourceOptions}
            loading={optionsLoading}
            placeholder="Select lead source..."
            searchPlaceholder="Search lead sources..."
            emptyMessage="No lead sources found"
          />
        </div>

        {/* Products pills */}
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            Products / Services <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {productOptions.map((p) => {
              const selected = form.productNames.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => toggleProduct(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {selected && "✓ "}
                  {p.label}
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

      {/* ── Sales Information ── */}
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

          <SearchableSelect
            label="Currency"
            value={form.currency}
            onChange={(v) => update("currency", v)}
            options={currencyOptions}
            placeholder="Select currency..."
            searchPlaceholder="Search currencies..."
            emptyMessage="No currencies found"
          />

          <SearchableSelect
            label="Stage"
            value={form.stage}
            onChange={handleStageChange}
            options={stageOptions.map(({ value, label }) => ({ value, label }))}
            placeholder="Select stage..."
            searchPlaceholder="Search stages..."
            emptyMessage="No stages found"
          />

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
            <DateInput
              value={form.expectedClose}
              onChange={(v) => update("expectedClose", v)}
              placeholder="dd/mm/yyyy"
              disablePast={!isEdit}
            />
          </Field>

          <SearchableSelect
            label="Assigned Salesperson"
            required
            value={form.assignedToId}
            onChange={(v) => update("assignedToId", v)}
            options={salespersonOptions}
            loading={optionsLoading}
            placeholder="Select salesperson..."
            searchPlaceholder="Search employees..."
            emptyMessage="No employees found"
          />

          <SearchableSelect
            label="Sales Team"
            value={form.salesTeam}
            onChange={(v) => update("salesTeam", v)}
            options={salesTeamOptions}
            loading={optionsLoading}
            placeholder="Select team..."
            searchPlaceholder="Search teams..."
            emptyMessage="No teams found"
          />

          <SearchableSelect
            label="Priority"
            value={form.priority}
            onChange={(v) => update("priority", v)}
            options={priorityOptions}
            placeholder="Select priority..."
            searchPlaceholder="Search priorities..."
            emptyMessage="No priorities found"
          />
        </div>
      </Section>

      {/* ── Additional Information ── */}
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
                    <FileText
                      size={14}
                      className="text-gray-400 flex-shrink-0"
                    />
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

      {/* ── Actions ── */}
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
          <Save size={15} />{" "}
          {isEdit ? "Update Opportunity" : "Save Opportunity"}
        </button>
      </div>
      <ActivityModal
  isOpen={scheduleModalOpen}
  onClose={() => setScheduleModalOpen(false)}
  activity={null}
  prefillRelated={
    savedOpportunityId
      ? { relatedToType: "Opportunity", relatedToId: savedOpportunityId }
      : null
  }
  prefillDate={null}
  onSubmit={(payload) => handleScheduleSubmit(payload)}
  submitting={submitting}
  employees={employeesLookup}
  employeesLoading={employeesLookupLoading}
  leads={leadsLookup}
  leadsLoading={leadsLookupLoading}
  customers={customersLookup}
  customersLoading={customersLookupLoading}
  opportunities={opportunitiesLookup}
  opportunitiesLoading={opportunitiesLookupLoading}
/>
    </div>
  );
};

export default AddOpportunity;
