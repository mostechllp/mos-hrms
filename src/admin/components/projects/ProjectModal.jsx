import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createProject, updateProject } from "../../store/slices/projectsSlice";
import { showToast } from "../../../components/common/Toast";

const ProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    website_url: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "active",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        client_name: project.client_name || "",
        website_url: project.website_url || "",
        description: project.description || "",
        start_date: project.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        end_date: project.end_date?.split("T")[0] || "",
        status: project.status || "active",
      });
    } else {
      setFormData({
        name: "",
        client_name: "",
        website_url: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "active",
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Project name is required", "error");
      return;
    }
    if (!formData.client_name.trim()) {
      showToast("Client name is required", "error");
      return;
    }

    setLoading(true);

    let result;
    if (project) {
      result = await dispatch(updateProject({ id: project.id, data: formData }));
    } else {
      result = await dispatch(createProject(formData));
    }

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
            <i className="fas fa-project-diagram text-green-500"></i>
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
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