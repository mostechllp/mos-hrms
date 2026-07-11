import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { createTask, updateTask } from "../../store/slices/tasksSlice";
import { showToast } from "../../../components/common/Toast";

const TaskModal = ({ isOpen, onClose, task, onSuccess, employees, projects, authUser }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const employeeDropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    project_id: "",
    assigned_to_ids: [],
    assigned_date: new Date().toISOString().split("T")[0],
    due_date: "",
    priority: "medium",
    status: "pending",
    description: "",
    assigned_by_name: authUser?.name || authUser?.username || "Admin",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setShowEmployeeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.title || "",
        project_id: task.project_id || (projects?.length === 1 ? projects[0].id : ""),
        assigned_to_ids: (task.assignedTo || task.assigned_to)?.map(a => typeof a === 'object' ? a.id : a) || [],
        assigned_date: task.assigned_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        due_date: task.due_date?.split("T")[0] || "",
        priority: task.priority || "medium",
        status: task.status || "pending",
        description: task.task_description || "",
        assigned_by_name: task.assign_by || task.assignedBy?.name || task.assigned_by?.name || authUser?.name || authUser?.username || "Admin",
      });
    } else {
      setFormData({
        name: "",
        project_id: projects?.length === 1 ? projects[0].id : "",
        assigned_to_ids: [],
        assigned_date: new Date().toISOString().split("T")[0],
        due_date: "",
        priority: "medium",
        status: "pending",
        description: "",
        assigned_by_name: authUser?.name || authUser?.username || "Admin",
      });
    }
  }, [task, projects, authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle employee selection
  const toggleEmployee = (employeeId) => {
    if (formData.assigned_to_ids.includes(employeeId)) {
      setFormData(prev => ({
        ...prev,
        assigned_to_ids: prev.assigned_to_ids.filter(id => id !== employeeId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assigned_to_ids: [...prev.assigned_to_ids, employeeId]
      }));
    }
  };

  // Remove employee from selected list
  const removeEmployee = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      assigned_to_ids: prev.assigned_to_ids.filter(id => id !== employeeId)
    }));
  };

  // Filter employees based on search
  const filteredEmployees = employees?.filter(emp => 
    emp.name?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  // Select/Deselect all
  const selectAll = () => {
    const allEmployeeIds = employees?.map(emp => emp.id) || [];
    setFormData(prev => ({ ...prev, assigned_to_ids: allEmployeeIds }));
  };

  const deselectAll = () => {
    setFormData(prev => ({ ...prev, assigned_to_ids: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Task name is required", "error");
      return;
    }
    if (!formData.project_id) {
      showToast("Please select a project", "error");
      return;
    }
    if (formData.assigned_to_ids.length === 0) {
      showToast("Please select at least one employee to assign", "error");
      return;
    }

    setLoading(true);

    const submitData = {
      title: formData.name,
      project_id: formData.project_id,
      assigned_date: formData.assigned_date,
      due_date: formData.due_date || null,
      priority: formData.priority,
      status: formData.status,
      task_description: formData.description || null,
      assign_by: formData.assigned_by_name,
      assigned_to: formData.assigned_to_ids,
    };

    let result;
    if (task) {
      result = await dispatch(updateTask({ id: task.id, data: submitData }));
    } else {
      result = await dispatch(createTask(submitData));
    }

    if ((task && updateTask.fulfilled.match(result)) || (!task && createTask.fulfilled.match(result))) {
      showToast(task ? "Task updated successfully!" : "Task assigned successfully!", "success");
      onSuccess();
      onClose();
    } else {
      showToast(result.payload || "Failed to save task", "error");
    }

    setLoading(false);
  };

  // Get selected project details
  const selectedProject = projects?.find(p => p.id === parseInt(formData.project_id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-soft-lg border border-gray-200 dark:border-gray-700">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-5 md:p-6 pb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-tasks text-green-500"></i>
            {task ? "Edit Task" : "Assign New Task"}
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
          <form id="taskForm" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Project Selection / Display */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {projects?.length === 1 ? "Project" : "Select Project"} <span className="text-red-500">*</span>
                </label>
                {projects?.length === 1 ? (
                  <input
                    type="text"
                    disabled
                    value={`${projects[0].project_name || projects[0].name} ${projects[0].client_name ? `- ${projects[0].client_name}` : ''}`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                ) : (
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_name || project.name} - {project.client_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Project Details Display */}
              {selectedProject && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Details:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Client:</span> {selectedProject.client_name}</div>
                    <div><span className="text-gray-500">Website:</span> {selectedProject.website_url || "-"}</div>
                    <div className="md:col-span-2"><span className="text-gray-500">Timeline:</span> {selectedProject.start_date} to {selectedProject.end_date || "Ongoing"}</div>
                  </div>
                </div>
              )}

              {/* Assigned To - Checkbox List with Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assign To (Multiple) <span className="text-red-500">*</span>
                </label>
                
                {/* Selected Employees Tags */}
                {formData.assigned_to_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.assigned_to_ids.map(id => {
                      const emp = employees?.find(e => e.id === id);
                      return emp ? (
                        <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                          <i className="fas fa-user text-xs"></i>
                          {emp.name}
                          <button
                            type="button"
                            onClick={() => removeEmployee(id)}
                            className="hover:text-red-500 transition-colors ml-1"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                {/* Search and Selection Area */}
                <div className="relative" ref={employeeDropdownRef}>
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                      type="text"
                      value={searchEmployee}
                      onChange={(e) => {
                        setSearchEmployee(e.target.value);
                        setShowEmployeeDropdown(true);
                      }}
                      onFocus={() => setShowEmployeeDropdown(true)}
                      placeholder="Search employees by name, ID or email..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Dropdown with Checkbox List */}
                  {showEmployeeDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {/* Action Buttons */}
                      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-2">
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={deselectAll}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                      
                      {/* Employee List */}
                      {filteredEmployees?.length > 0 ? (
                        filteredEmployees.map(emp => {
                          const isSelected = formData.assigned_to_ids.includes(emp.id);
                          return (
                            <label
                              key={emp.id}
                              className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleEmployee(emp.id)}
                                className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                              />
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                                {emp.name?.charAt(0) || "U"}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{emp.name}</p>
                                
                              </div>
                              {isSelected && (
                                <i className="fas fa-check-circle text-green-500 text-sm"></i>
                              )}
                            </label>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <i className="fas fa-user-slash text-2xl mb-1 block"></i>
                          <p className="text-sm">No employees found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Selected: <span className="font-semibold text-green-600">{formData.assigned_to_ids.length}</span> employee(s)
                </p>
              </div>

              {/* Assigned By (Editable) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assigned By
                </label>
                <input
                  type="text"
                  name="assigned_by_name"
                  value={formData.assigned_by_name}
                  onChange={handleChange}
                  placeholder="Enter assigner name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Assigned Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="assigned_date"
                  value={formData.assigned_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Status (only for edit) */}
              {task && (
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
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Task Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter task details..."
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
            form="taskForm"
            disabled={loading}
            className="px-5 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> {task ? "Updating..." : "Assigning..."}</>
            ) : (
              <><i className="fas fa-check"></i> {task ? "Update Task" : "Assign Task"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;