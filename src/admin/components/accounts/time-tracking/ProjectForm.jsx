// src/admin/pages/accounts/ProjectForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProject, updateProject } from "../../../store/slices/accounts/projectsSlice";
import { X, Plus, Trash2, Search, Info, Upload, ChevronRight, Sparkles } from "lucide-react";
import { inputCls } from "../ui";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
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
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
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

/* ---------- page ---------- */

const ProjectForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingProject = useSelector((state) =>
    state.accountProjects.projects.find((p) => p.id === id)
  );
  const customers = [{ name: "Mrs. sss www" }, { name: "Acme Corp" }];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    projectName: "",
    projectCode: "",
    customerName: "",
    billingMethod: "",
    description: "",
    budget: { costBudget: "", revenueBudget: "" },
    users: [{ id: Date.now().toString(), name: "Joe Doe", email: "fidh3549@gmail.com" }],
    tasks: [{ id: Date.now().toString(), name: "", description: "", billable: true }],
    watchlist: true,
  });

  useEffect(() => {
    if (existingProject) setFormData({ ...existingProject });
  }, [existingProject]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleBudgetChange = (key, value) =>
    setFormData((prev) => ({ ...prev, budget: { ...prev.budget, [key]: value } }));

  const handleTaskChange = (index, field, value) => {
    const next = [...formData.tasks];
    next[index][field] = value;
    setFormData((prev) => ({ ...prev, tasks: next }));
  };

  const addTask = () =>
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), name: "", description: "", billable: true }],
    }));

  const removeTask = (index) =>
    setFormData((prev) => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.projectName.trim() || !formData.customerName) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) {
        await dispatch(updateProject({ id, ...formData })).unwrap();
      } else {
        await dispatch(addProject({
          ...formData,
          stats: { loggedHours: "00:00", billableHours: "00:00", billedHours: "00:00", unbilledHours: "00:00" },
          transactions: {
            expenses: [], bills: [], purchaseOrders: [], vendorCredits: [],
            invoices: [], quotes: [], salesOrders: [], creditNotes: [],
          },
        })).unwrap();
      }
      navigate("/admin/accounts/time-tracking/projects");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = id ? "Edit project" : "New project";

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* ---- Header ---- */}
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
              to="/admin/accounts/time-tracking/projects"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Projects
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
              {id ? existingProject?.projectName || "Edit" : "New"}
            </span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {id
              ? "Update project details, budget, and tasks"
              : "Create a project to track time and bill clients"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/accounts/time-tracking/projects")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* ---- Info banner ---- */}
      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
        <Sparkles size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Projects help you track time and bill customers accurately.{" "}
          <a
            href="#"
            className="font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
          >
            Learn more →
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ---- Error banner ---- */}
        {submitError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-xs md:text-[12.5px] text-red-700 dark:text-red-300">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* ---- Basic details ---- */}
        <Card title="Basic details" description="The essentials that identify this project">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Project name" required>
              <input
                type="text"
                className={inputCls}
                value={formData.projectName}
                onChange={(e) => setField("projectName", e.target.value)}
              />
            </Field>
            <Field label="Project code">
              <input
                type="text"
                className={inputCls}
                value={formData.projectCode}
                onChange={(e) => setField("projectCode", e.target.value)}
              />
            </Field>

            <Field label="Customer" required>
              <div className="flex gap-2">
                <select
                  className={`${inputCls} flex-1`}
                  value={formData.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                >
                  <option value="">Select customer…</option>
                  {customers.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Search size={14} />
                </button>
              </div>
            </Field>

            <Field label="Billing method" required>
              <select
                className={inputCls}
                value={formData.billingMethod}
                onChange={(e) => setField("billingMethod", e.target.value)}
              >
                <option value="">Select method…</option>
                <option value="Hourly Rate Per Project">Hourly rate per project</option>
                <option value="Fixed Cost">Fixed cost</option>
                <option value="Hourly Rate Per Task">Hourly rate per task</option>
              </select>
            </Field>

            <Field label="Description" className="md:col-span-2">
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Max. 2000 characters"
                value={formData.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        {/* ---- Budget ---- */}
        <Card title="Budget" description="Cost and revenue guardrails for this project">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Cost budget">
              <CurrencyInput
                value={formData.budget.costBudget}
                onChange={(e) => handleBudgetChange("costBudget", e.target.value)}
              />
            </Field>
            <Field label="Revenue budget">
              <CurrencyInput
                value={formData.budget.revenueBudget}
                onChange={(e) => handleBudgetChange("revenueBudget", e.target.value)}
              />
            </Field>
          </div>
          <button
            type="button"
            className="mt-3 text-xs md:text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            + Add budget for project hours
          </button>
        </Card>

        {/* ---- Users ---- */}
        <Card title="Users" description="Who can log time against this project">
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full border-collapse text-xs md:text-[12.5px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3 w-12">#</th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3">Name</th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {formData.users?.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="py-3 px-3 text-gray-400 tabular-nums">{idx + 1}</td>
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-medium">{user.name}</td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Plus size={13} /> Add user
          </button>
        </Card>

        {/* ---- Project tasks ---- */}
        <Card
          title="Project tasks"
          description="Break down work into trackable tasks"
          action={
            <button
              type="button"
              className="text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1"
            >
              <Upload size={12} /> Import
            </button>
          }
        >
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full min-w-[700px] border-collapse text-xs md:text-[12.5px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3 w-12">#</th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3">Task name</th>
                  <th className="text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3">Description</th>
                  <th className="text-center text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 md:py-2.5 px-3 w-24">Billable</th>
                  <th className="w-10 py-2 md:py-2.5" />
                </tr>
              </thead>
              <tbody>
                {formData.tasks.map((task, idx) => (
                  <tr key={task.id} className="align-top group border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-3 text-gray-400 tabular-nums">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Task name"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                        value={task.name}
                        onChange={(e) => handleTaskChange(idx, "name", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Description"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                        value={task.description}
                        onChange={(e) => handleTaskChange(idx, "description", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={task.billable}
                        onChange={(e) => handleTaskChange(idx, "billable", e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeTask(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove task"
                        aria-label="Remove task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-3">
            <button
              type="button"
              onClick={addTask}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Plus size={13} /> Add task
            </button>
          </div>
        </Card>

        {/* ---- Watchlist ---- */}
        <Card>
          <label className="inline-flex items-center gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.watchlist}
              onChange={(e) => setField("watchlist", e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
            />
            Add to dashboard watchlist
          </label>
        </Card>

        {/* ---- Sticky footer ---- */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/admin/accounts/time-tracking/projects")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : id ? "Save changes" : "Create project"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;