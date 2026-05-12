import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import { addTaskReport, updateTaskReport } from "../../store/slices/taskReportSlice";

const TaskReportModal = ({ isOpen, onClose, editingReport }) => {
  const dispatch = useDispatch();
  const { employees = [] } = useSelector((state) => state.employees || {});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employee: "",
    tasksCompleted: "",
    planForTomorrow: "",
    remarks: "",
  });

  useEffect(() => {
    if (editingReport) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        date: editingReport.date,
        employee: editingReport.employee,
        tasksCompleted: editingReport.tasksCompleted,
        planForTomorrow: editingReport.planForTomorrow,
        remarks: editingReport.remarks || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        employee: "",
        tasksCompleted: "",
        planForTomorrow: "",
        remarks: "",
      });
    }
  }, [editingReport]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date) {
      showToast("Date is required", "error");
      return;
    }
    if (!formData.employee) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!formData.tasksCompleted.trim()) {
      showToast("Tasks completed is required", "error");
      return;
    }
    if (!formData.planForTomorrow.trim()) {
      showToast("Plan for tomorrow is required", "error");
      return;
    }

    setLoading(true);

    if (editingReport) {
      const result = await dispatch(
        updateTaskReport({
          id: editingReport.id,
          data: formData,
        })
      );
      if (updateTaskReport.fulfilled.match(result)) {
        showToast(`Task report for ${formData.employee} updated successfully`, "success");
        onClose();
      } else {
        showToast("Failed to update task report", "error");
      }
    } else {
      const result = await dispatch(addTaskReport(formData));
      if (addTaskReport.fulfilled.match(result)) {
        showToast(`Task report for ${formData.employee} added successfully`, "success");
        onClose();
      } else {
        showToast("Failed to add task report", "error");
      }
    }

    setLoading(false);
  };

  // Get unique employee names from employees list or use default list
  const employeeOptions = employees.length > 0 
    ? employees.map(emp => emp.name)
    : ["JITHIN", "FAWZY", "FAHEEM", "ASLAN", "ABHILASH", "AKSHAY", "VIJAY", "SUNEEL"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className={`fas ${editingReport ? 'fa-edit' : 'fa-plus-circle'} text-green-500`}></i>
            {editingReport ? "Edit Task Report" : "Add Task Report"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-calendar-alt text-green-500 mr-1"></i>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              required
            />
          </div>

          {/* Employee Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-user text-green-500 mr-1"></i>
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              required
            >
              <option value="">Select Employee</option>
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Tasks Completed Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-check-circle text-green-500 mr-1"></i>
              Tasks Completed <span className="text-red-500">*</span>
            </label>
            <textarea
              name="tasksCompleted"
              value={formData.tasksCompleted}
              onChange={handleChange}
              rows="3"
              placeholder="List the tasks completed today..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical"
              required
            />
          </div>

          {/* Plan for Tomorrow Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-calendar-day text-green-500 mr-1"></i>
              Plan for Tomorrow <span className="text-red-500">*</span>
            </label>
            <textarea
              name="planForTomorrow"
              value={formData.planForTomorrow}
              onChange={handleChange}
              rows="3"
              placeholder="What are your plans for tomorrow?"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical"
              required
            />
          </div>

          {/* Remarks Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-comment text-green-500 mr-1"></i>
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              placeholder="Any additional remarks or notes..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-vertical"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 text-sm disabled:opacity-70"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> {editingReport ? "Update" : "Save"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskReportModal;
