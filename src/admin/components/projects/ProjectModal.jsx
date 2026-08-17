import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProject, updateProject } from "../../store/slices/projectsSlice";
import { showToast } from "../../../components/common/Toast";
import apiClient from "../../../utils/apiClient";
import { FolderKanban } from "lucide-react";

const ProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const dispatch = useDispatch();
  const { statuses } = useSelector((state) => state.projects || {});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customDates, setCustomDates] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    client_contact: "",
    website_url: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "Active",
    department_id: "",
    project_manager_id: "",
    team_lead_id: "",
    website_live_date: "",
    client_contacted_date: "",
    domain_name: "",
    domain_purchased_date: "",
    domain_expiry_date: "",
    domain_purchased_from: "",
    is_email_purchased: false,
    purchased_emails: [{ email_name: "", email_purchase_date: "", email_expiry_date: "" }],
  });

  useEffect(() => {
    if (project) {
      console.log("🚀 ProjectModal received project data:", project);
      setFormData({
        name: project.project_name || project.name || "",
        client_name: project.client_name || "",
        client_contact: project.client_contact || "",
        website_url: project.website_url || "",
        description: project.description || "",
        start_date: project.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        end_date: project.end_date?.split("T")[0] || "",
        status: project.status || "Active",
        department_id: project.department_id || "",
        project_manager_id: project.project_manager_id || "",
        team_lead_id: project.team_lead_id || "",
        website_live_date: project.website_live_date?.split("T")[0] || "",
        client_contacted_date: project.client_contacted_date?.split("T")[0] || "",
        domain_name: project.domain_name || "",
        domain_purchased_date: project.domain_purchased_date?.split("T")[0] || "",
        domain_expiry_date: project.domain_expiry_date?.split("T")[0] || "",
        domain_purchased_from: project.domain_purchased_from || "",
        is_email_purchased: Boolean(project.is_email_purchased),
        purchased_emails: (project.emails && Array.isArray(project.emails) && project.emails.length > 0)
          ? project.emails.map(e => ({
              email_name: e.email_name || "",
              email_purchase_date: (e.purchase_date || e.email_purchase_date || "")?.split("T")[0] || "",
              email_expiry_date: (e.expiry_date || e.email_expiry_date || "")?.split("T")[0] || ""
            }))
          : (project.purchased_emails?.length
              ? project.purchased_emails.map(e => ({
                  email_name: e.email_name || "",
                  email_purchase_date: (e.purchase_date || e.email_purchase_date || "")?.split("T")[0] || "",
                  email_expiry_date: (e.expiry_date || e.email_expiry_date || "")?.split("T")[0] || ""
                }))
              : (project.email_name 
                  ? [{ email_name: project.email_name, email_purchase_date: project.email_purchase_date?.split("T")[0] || "", email_expiry_date: project.email_expiry_date?.split("T")[0] || "" }] 
                  : [{ email_name: "", email_purchase_date: "", email_expiry_date: "" }])),
      });

      let existingDates = [];
      let parsedSpecialDates = null;
      if (project.special_dates) {
        if (typeof project.special_dates === "string") {
          try {
            parsedSpecialDates = JSON.parse(project.special_dates);
          } catch (e) {
            console.error("Failed to parse special_dates string", e);
          }
        } else if (Array.isArray(project.special_dates)) {
          parsedSpecialDates = project.special_dates;
        }
      }

      if (parsedSpecialDates && Array.isArray(parsedSpecialDates)) {
        existingDates = parsedSpecialDates.map(d => ({
          label: d.name || d.label || d.title || "",
          date: d.date ? d.date.split("T")[0] : ""
        }));
      } else if (project.special_dates_name && Array.isArray(project.special_dates_name)) {
        existingDates = project.special_dates_name.map((name, i) => ({
          label: name || "",
          date: project.special_dates_date?.[i] ? project.special_dates_date[i].split("T")[0] : ""
        }));
      } else if (project.otherImportantDates || project.other_important_dates) {
        const dates = project.otherImportantDates || project.other_important_dates || [];
        existingDates = dates.map(d => ({
          label: d.label || d.title || d.name || "",
          date: d.date ? d.date.split("T")[0] : ""
        }));
      }
      setCustomDates(existingDates);
    } else {
      setFormData({
        name: "",
        client_name: "",
        client_contact: "",
        website_url: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "Active",
        department_id: "",
        project_manager_id: "",
        team_lead_id: "",
        website_live_date: "",
        client_contacted_date: "",
        domain_name: "",
        domain_purchased_date: "",
        domain_expiry_date: "",
        domain_purchased_from: "",
        is_email_purchased: false,
        purchased_emails: [{ email_name: "", email_purchase_date: "", email_expiry_date: "" }],
      });
      setCustomDates([]);
    }
  }, [project]);

  useEffect(() => {
    if (isOpen) {
      const loadDepartments = async () => {
        try {
          const response = await apiClient.get("/admin/departments");
          setDepartments(response.data.data || []);
        } catch (error) {
          console.error("Failed to fetch departments", error);
        }
      };
      const loadEmployees = async () => {
        try {
          const response = await apiClient.get("/admin/employees");
          setEmployees(response.data.data?.data || response.data.data || response.data || []);
        } catch (error) {
          console.error("Failed to fetch employees", error);
        }
      };
      loadDepartments();
      loadEmployees();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEmailChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedEmails = [...prev.purchased_emails];
      updatedEmails[index] = { ...updatedEmails[index], [field]: value };
      return { ...prev, purchased_emails: updatedEmails };
    });
  };

  const addEmailField = () => {
    setFormData((prev) => ({
      ...prev,
      purchased_emails: [
        ...prev.purchased_emails,
        { email_name: "", email_purchase_date: "", email_expiry_date: "" },
      ],
    }));
  };

  const removeEmailField = (index) => {
    setFormData((prev) => ({
      ...prev,
      purchased_emails: prev.purchased_emails.filter((_, i) => i !== index),
    }));
  };

  const addCustomDate = () => {
    setCustomDates((prev) => [...prev, { label: "", date: "" }]);
  };

  const removeCustomDate = (index) => {
    setCustomDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomDateChange = (index, field, value) => {
    setCustomDates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Project name is required", "error");
      return;
    }

    setLoading(true);

    if (formData.is_email_purchased) {
      const hasValidEmail = formData.purchased_emails.some(e => e.email_name && e.email_name.trim() !== "");
      if (!hasValidEmail) {
        showToast("Please enter an Email Name, or uncheck 'Email Purchased'", "error");
        setLoading(false);
        return;
      }
    }

    const validSpecialDates = customDates.filter(d => d.label && d.label.trim() !== "");

    const submitData = {
      project_name: formData.name.trim(),
      description: formData.description || null,
      client_name: formData.client_name || null,
      client_contact: formData.client_contact || null,
      department_id: formData.department_id ? parseInt(formData.department_id) : null,
      project_manager_id: formData.project_manager_id ? parseInt(formData.project_manager_id) : null,
      team_lead_id: formData.team_lead_id ? parseInt(formData.team_lead_id) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      website_live_date: formData.website_live_date || null,
      client_contacted_date: formData.client_contacted_date || null,
      domain_name: formData.domain_name || null,
      domain_purchased_date: formData.domain_purchased_date || null,
      website_url: formData.website_url || null,
      domain_expiry_date: formData.domain_expiry_date || null,
      domain_purchased_from: formData.domain_purchased_from || null,
      is_email_purchased: formData.is_email_purchased ? true : false,
      status: formData.status || null,
      emails: formData.is_email_purchased ? formData.purchased_emails
        .filter(e => e.email_name && e.email_name.trim() !== "")
        .map(e => ({
          email_name: e.email_name.trim(),
          purchase_date: e.email_purchase_date || null,
          expiry_date: e.email_expiry_date || null
        })) : [],
      // 1. Array of objects (for backend models that accept JSON array of objects)
      special_dates: validSpecialDates.map(d => ({
        name: d.label.trim(),
        date: d.date || null
      })),
      // 2. Parallel arrays (required by Laravel validation rules: special_dates_name.* & special_dates_date.*)
      special_dates_name: validSpecialDates.map(d => d.label.trim()),
      special_dates_date: validSpecialDates.map(d => d.date || null)
    };

    console.log("📤 Submitting Project Form Payload (submitData):", submitData);

    let result;
    if (project) {
      result = await dispatch(updateProject({ id: project.id, data: submitData }));
    } else {
      result = await dispatch(createProject(submitData));
    }

    console.log("📥 Project Dispatch Result:", result);

    if ((project && updateProject.fulfilled.match(result)) || (!project && createProject.fulfilled.match(result))) {
      showToast(project ? "Project updated successfully!" : "Project created successfully!", "success");
      onSuccess();
      onClose();
    } else {
      showToast(result.payload || "Failed to save project", "error");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-soft-lg border border-gray-200 dark:border-gray-700">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-5 md:p-6 pb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FolderKanban className="text-green-500 w-6 h-6" />
            {project ? "Edit Project" : "Create New Project"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <form id="projectForm" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Client Contact
                </label>
                <input
                  type="text"
                  name="client_contact"
                  value={formData.client_contact}
                  onChange={handleChange}
                  placeholder="e.g. +1-555-0198"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  {statuses && statuses.length > 0 ? (
                    statuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="On-hold">On-hold</option>
                      <option value="In-progress">In-progress</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Project Manager
                </label>
                <select
                  name="project_manager_id"
                  value={formData.project_manager_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Project Manager</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name ? `${emp.first_name} ${emp.last_name || ""}` : emp.name || `Employee #${emp.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Team Lead
                </label>
                <select
                  name="team_lead_id"
                  value={formData.team_lead_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Team Lead</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name ? `${emp.first_name} ${emp.last_name || ""}` : emp.name || `Employee #${emp.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Client Contacted Date
                </label>
                <input
                  type="date"
                  name="client_contacted_date"
                  value={formData.client_contacted_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Website Live Date
                </label>
                <input
                  type="date"
                  name="website_live_date"
                  value={formData.website_live_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  name="domain_name"
                  value={formData.domain_name}
                  onChange={handleChange}
                  placeholder="Enter domain name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Domain Purchased Date
                </label>
                <input
                  type="date"
                  name="domain_purchased_date"
                  value={formData.domain_purchased_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Domain Expiry Date
                </label>
                <input
                  type="date"
                  name="domain_expiry_date"
                  value={formData.domain_expiry_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Domain Purchased From
                </label>
                <input
                  type="text"
                  name="domain_purchased_from"
                  value={formData.domain_purchased_from}
                  onChange={handleChange}
                  placeholder="e.g. GoDaddy, Namecheap"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex items-center mt-2 mb-2">
                <input
                  type="checkbox"
                  id="is_email_purchased"
                  name="is_email_purchased"
                  checked={formData.is_email_purchased}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="is_email_purchased" className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Email Purchased
                </label>
              </div>

              {formData.is_email_purchased && (
                <div className="md:col-span-2 space-y-4">
                  {formData.purchased_emails.map((email, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative bg-gray-50 dark:bg-gray-800/50">
                      {formData.purchased_emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Email Name
                          </label>
                          <input
                            type="text"
                            value={email.email_name}
                            onChange={(e) => handleEmailChange(index, "email_name", e.target.value)}
                            placeholder="e.g. info@domain.com"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Purchase Date
                          </label>
                          <input
                            type="date"
                            value={email.email_purchase_date}
                            onChange={(e) => handleEmailChange(index, "email_purchase_date", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={email.email_expiry_date}
                            onChange={(e) => handleEmailChange(index, "email_expiry_date", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addEmailField}
                    className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-1"
                  >
                    <i className="fas fa-plus-circle"></i> Add Another Email
                  </button>
                </div>
              )}

              <div className="md:col-span-2 space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Other Important Dates
                </label>
                <div className="space-y-3">
                  {customDates.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative bg-gray-50 dark:bg-gray-800/50">
                      <button
                        type="button"
                        onClick={() => removeCustomDate(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Field Name
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleCustomDateChange(index, "label", e.target.value)}
                            placeholder="Field Name, e.g., Invoice Generated Date"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => handleCustomDateChange(index, "date", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCustomDate}
                  className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-1"
                >
                  <i className="fas fa-plus-circle"></i> Add Custom Date
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Project description..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 p-5 md:p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="projectForm"
            disabled={loading}
            className="px-5 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> {project ? "Updating..." : "Creating..."}</>
            ) : (
              <><i className="fas fa-check"></i> {project ? "Update Project" : "Create Project"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;