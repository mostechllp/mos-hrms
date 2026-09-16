// src/admin/components/common/WarningModal.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertTriangle, Save, Loader, Mail } from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import {
  createWarning,
  updateWarning,
} from "../../store/slices/warningSlice";

const WarningModal = ({ isOpen, onClose, warning = null, employees = [] }) => {
  const dispatch = useDispatch();
  const { submitting } = useSelector((state) => state.warnings);

  const isEdit = Boolean(warning?.id);

  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Hydrate on open
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setEmployeeId(warning.employee_id ?? warning.employee?.id ?? "");
      setTitle(warning.title || "");
      setSubject(warning.subject || "");
      setDescription(warning.description || "");
      setIssuedDate(
        warning.issued_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      );
    } else {
      setEmployeeId("");
      setTitle("");
      setSubject("");
      setDescription("");
      setIssuedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, warning, isEdit]);

  // Esc to close
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!employeeId) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!title.trim()) {
      showToast("Please enter a title", "error");
      return;
    }
    if (!subject.trim()) {
      showToast("Please enter a subject", "error");
      return;
    }
    if (!description.trim()) {
      showToast("Please enter a description", "error");
      return;
    }
    if (!issuedDate) {
      showToast("Please select an issued date", "error");
      return;
    }

    const payload = {
      employee_id: Number(employeeId),
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      issued_date: issuedDate,
      // No send_email flag — email is sent separately from the Warnings list.
    };

    try {
      if (isEdit) {
        await dispatch(
          updateWarning({ id: warning.id, data: payload }),
        ).unwrap();
        showToast("Warning updated successfully", "success");
      } else {
        await dispatch(createWarning(payload)).unwrap();
        showToast(
          "Warning created. Use the mail icon to send it to the employee.",
          "success",
        );
      }
      onClose();
    } catch (error) {
      showToast(error || "Failed to save warning", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEdit ? "Edit Warning" : "New Warning"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit
                  ? "Update warning details"
                  : "Issue a new warning to an employee"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Employee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={submitting || isEdit}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-60"
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                  {emp.employee_id ? ` (${emp.employee_id})` : ""}
                </option>
              ))}
            </select>
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">
                Employee cannot be changed after the warning is created.
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Verbal Warning"
              disabled={submitting}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Regarding repeated late arrivals"
              disabled={submitting}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Issued Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Issued Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the reason for this warning, expected improvements, and any deadlines..."
              disabled={submitting}
              rows={5}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Info note */}
          {!isEdit && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-lg">
              <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                The warning will be created but the email will not be sent
                automatically. You can send it from the Warnings list using
                the mail icon.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update Warning" : "Create Warning"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;