import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProject, updateProject } from "../../../store/slices/accounts/projectsSlice";
import { X, Plus, Trash2, Search, Info, Upload } from "lucide-react";
import { inputCls } from "../ui";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Time tracking · Projects</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{title}</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update project details, budget, and tasks" : "Create a project to track time and bill clients"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/time-tracking/projects")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ---- Error banner ---- */}
          {submitError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 text-[12.5px] text-rose-700 dark:text-rose-300">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ---- Basic details ---- */}
          <Surface title="Basic details" description="The essentials that identify this project">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Project name" required>
                <input type="text" className={inputCls} value={formData.projectName} onChange={(e) => setField("projectName", e.target.value)} />
              </Field>
              <Field label="Project code">
                <input type="text" className={inputCls} value={formData.projectCode} onChange={(e) => setField("projectCode", e.target.value)} />
              </Field>

              <Field label="Customer" required>
                <div className="flex gap-2">
                  <select className={`${inputCls} flex-1`} value={formData.customerName} onChange={(e) => setField("customerName", e.target.value)}>
                    <option value="">Select customer…</option>
                    {customers.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </Field>

              <Field label="Billing method" required>
                <select className={inputCls} value={formData.billingMethod} onChange={(e) => setField("billingMethod", e.target.value)}>
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
          </Surface>

          {/* ---- Budget ---- */}
          <Surface title="Budget" description="Cost and revenue guardrails for this project">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Cost budget">
                <CurrencyInput value={formData.budget.costBudget} onChange={(e) => handleBudgetChange("costBudget", e.target.value)} />
              </Field>
              <Field label="Revenue budget">
                <CurrencyInput value={formData.budget.revenueBudget} onChange={(e) => handleBudgetChange("revenueBudget", e.target.value)} />
              </Field>
            </div>
            <button type="button" className="mt-3 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Add budget for project hours
            </button>
          </Surface>

          {/* ---- Users ---- */}
          <Surface title="Users" description="Who can log time against this project">
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                    <th className="text-left font-medium py-2.5 px-3 w-12">#</th>
                    <th className="text-left font-medium py-2.5 px-3">Name</th>
                    <th className="text-left font-medium py-2.5 px-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {formData.users?.map((user, idx) => (
                    <tr key={user.id}>
                      <td className="py-3 px-3 text-slate-400 tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-slate-100 font-medium">{user.name}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Plus size={13} /> Add user
            </button>
          </Surface>

          {/* ---- Project tasks ---- */}
          <Surface
            title="Project tasks"
            description="Break down work into trackable tasks"
            action={
              <button type="button" className="text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1">
                <Upload size={12} /> Import
              </button>
            }
            className="!py-0"
          >
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="w-full min-w-[700px] text-[12.5px]">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                    <th className="text-left  font-medium py-2.5 px-3 w-12">#</th>
                    <th className="text-left  font-medium py-2.5 px-3">Task name</th>
                    <th className="text-left  font-medium py-2.5 px-3">Description</th>
                    <th className="text-center font-medium py-2.5 px-3 w-24">Billable</th>
                    <th className="w-10 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {formData.tasks.map((task, idx) => (
                    <tr key={task.id} className="align-top group">
                      <td className="py-3 px-3 text-slate-400 tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Task name"
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                          value={task.name}
                          onChange={(e) => handleTaskChange(idx, "name", e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Description"
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                          value={task.description}
                          onChange={(e) => handleTaskChange(idx, "description", e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={task.billable}
                          onChange={(e) => handleTaskChange(idx, "billable", e.target.checked)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeTask(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
            <div className="pt-3 pb-5">
              <button
                type="button"
                onClick={addTask}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={13} /> Add task
              </button>
            </div>
          </Surface>

          {/* ---- Watchlist ---- */}
          <Surface>
            <label className="inline-flex items-center gap-2 text-[12.5px] text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.watchlist}
                onChange={(e) => setField("watchlist", e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              Add to dashboard watchlist
            </label>
          </Surface>

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate("/admin/accounts/time-tracking/projects")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : id ? "Save changes" : "Create project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;