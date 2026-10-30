import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProject, updateProject } from "../../../store/slices/accounts/projectsSlice";
import { X, Plus, Trash2, Search, Info, Upload, ChevronDown, Check } from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white";

const ProjectForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingProject = useSelector((state) => state.accountProjects.projects.find((p) => p.id === id));
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
    users: [{ id: Date.now().toString(), name: "Fidha Fathima", email: "fidh3549@gmail.com" }],
    tasks: [{ id: Date.now().toString(), name: "", description: "", billable: true }],
    watchlist: true,
  });

  useEffect(() => {
    if (existingProject) {
      setFormData({ ...existingProject });
    }
  }, [existingProject]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  
  const handleBudgetChange = (key, value) => {
    setFormData(prev => ({ ...prev, budget: { ...prev.budget, [key]: value } }));
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index][field] = value;
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), name: "", description: "", billable: true }]
    }));
  };

  const removeTask = (index) => {
    const newTasks = formData.tasks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          transactions: { expenses: [], bills: [], purchaseOrders: [], vendorCredits: [], invoices: [], quotes: [], salesOrders: [], creditNotes: [] }
        })).unwrap();
      }
      navigate("/admin/accounts/time-tracking/projects");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-gray-800">{id ? "Edit Project" : "New Project"}</h1>
        <button onClick={() => navigate("/admin/accounts/time-tracking/projects")} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-8">
        {submitError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{submitError}</div>}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-8">
          
          {/* Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
             <div className="flex flex-col gap-1.5">
                <label className="text-sm text-red-500 font-medium">Project Name*</label>
                <input type="text" className={inputCls} value={formData.projectName} onChange={(e) => setField("projectName", e.target.value)} />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 font-medium">Project Code</label>
                <input type="text" className={inputCls} value={formData.projectCode} onChange={(e) => setField("projectCode", e.target.value)} />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-sm text-red-500 font-medium">Customer Name*</label>
                <div className="flex">
                   <select className={`${inputCls} rounded-r-none border-r-0`} value={formData.customerName} onChange={(e) => setField("customerName", e.target.value)}>
                     <option value="">Select customer</option>
                     {customers.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                   <button type="button" className="bg-blue-500 text-white px-3 border border-blue-500 rounded-r-md hover:bg-blue-600"><Search size={16}/></button>
                </div>
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-sm text-red-500 font-medium">Billing Method*</label>
                <select className={inputCls} value={formData.billingMethod} onChange={(e) => setField("billingMethod", e.target.value)}>
                  <option value="">Select method</option>
                  <option value="Hourly Rate Per Project">Hourly Rate Per Project</option>
                  <option value="Fixed Cost">Fixed Cost</option>
                  <option value="Hourly Rate Per Task">Hourly Rate Per Task</option>
                </select>
             </div>
             <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm text-gray-700 font-medium">Description</label>
                <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none h-24" placeholder="Max. 2000 characters" value={formData.description} onChange={(e) => setField("description", e.target.value)} />
             </div>
          </div>

          {/* Budget */}
          <div className="border-t border-gray-100 pt-6">
             <h3 className="text-lg font-medium text-gray-800 mb-4">Budget</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex items-center gap-4">
                   <label className="text-sm text-gray-700 w-32 flex items-center gap-1">Cost Budget <Info size={14} className="text-gray-400"/></label>
                   <div className="flex w-full">
                      <span className="border border-r-0 border-gray-300 bg-gray-50 rounded-l-md px-3 py-1.5 text-sm text-gray-600">INR</span>
                      <input type="number" className={`${inputCls} rounded-l-none`} value={formData.budget.costBudget} onChange={(e) => handleBudgetChange("costBudget", e.target.value)} />
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <label className="text-sm text-gray-700 w-32 flex items-center gap-1">Revenue Budget <Info size={14} className="text-gray-400"/></label>
                   <div className="flex w-full">
                      <span className="border border-r-0 border-gray-300 bg-gray-50 rounded-l-md px-3 py-1.5 text-sm text-gray-600">INR</span>
                      <input type="number" className={`${inputCls} rounded-l-none`} value={formData.budget.revenueBudget} onChange={(e) => handleBudgetChange("revenueBudget", e.target.value)} />
                   </div>
                </div>
             </div>
             <button type="button" className="text-blue-600 text-sm hover:underline mt-3">Add budget for project hours.</button>
          </div>

          {/* Users */}
          <div className="border-t border-gray-100 pt-6">
             <h3 className="text-lg font-medium text-gray-800 mb-4">Users</h3>
             <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                      <tr>
                         <th className="px-4 py-2 w-16">S.NO</th>
                         <th className="px-4 py-2">USER</th>
                         <th className="px-4 py-2">EMAIL</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {formData.users.map((user, idx) => (
                         <tr key={user.id}>
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-gray-800">{user.name}</td>
                            <td className="px-4 py-3 text-gray-500">{user.email}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <button type="button" className="mt-3 text-blue-600 text-sm flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                <Plus size={14}/> Add User
             </button>
          </div>

          {/* Project Tasks */}
          <div className="border-t border-gray-100 pt-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Project Tasks</h3>
                <button type="button" className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                   <Upload size={14}/> Import project tasks from existing projects.
                </button>
             </div>
             <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                      <tr>
                         <th className="px-4 py-2 w-16">S.NO</th>
                         <th className="px-4 py-2 w-1/3">TASK NAME</th>
                         <th className="px-4 py-2">DESCRIPTION</th>
                         <th className="px-4 py-2 w-24 text-center">BILLABLE</th>
                         <th className="px-4 py-2 w-10"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {formData.tasks.map((task, idx) => (
                         <tr key={task.id}>
                            <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-2">
                               <input type="text" className="w-full border-none focus:ring-0 text-sm p-0 bg-transparent" placeholder="Task Name" value={task.name} onChange={(e) => handleTaskChange(idx, 'name', e.target.value)} />
                            </td>
                            <td className="px-4 py-2">
                               <input type="text" className="w-full border-none focus:ring-0 text-sm p-0 bg-transparent" placeholder="Description" value={task.description} onChange={(e) => handleTaskChange(idx, 'description', e.target.value)} />
                            </td>
                            <td className="px-4 py-2 text-center">
                               <input type="checkbox" checked={task.billable} onChange={(e) => handleTaskChange(idx, 'billable', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-2 text-center">
                               <button type="button" onClick={() => removeTask(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <button type="button" onClick={addTask} className="mt-3 text-blue-600 text-sm flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                <Plus size={14}/> Add Project Task
             </button>
          </div>

          {/* Watchlist */}
          <div className="border-t border-gray-100 pt-6">
             <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={formData.watchlist} onChange={(e) => setField("watchlist", e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Add to the watchlist on my dashboard <Info size={14} className="text-gray-400"/>
             </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
               {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button type="button" disabled={isSubmitting} onClick={() => navigate("/admin/accounts/time-tracking/projects")} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
               Cancel
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;