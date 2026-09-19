// src/admin/components/common/WarningModal.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  AlertTriangle,
  Save,
  Loader,
  Mail,
  Paperclip,
  Trash2,
  FileText,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import { createWarning, updateWarning } from "../../store/slices/warningSlice";
import DateInput from "./DateInput";

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

  // Attachment state
  const [attachment, setAttachment] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  // Hydrate on open
  useEffect(() => {
    if (!isOpen) return;
    setAttachment(null);
    setRemoveAttachment(false);

    if (isEdit) {
      setEmployeeId(warning.employee_id ?? warning.employee?.id ?? "");
      setTitle(warning.title || "");
      setSubject(warning.subject || "");
      setDescription(warning.description || "");
      setIssuedDate(
        warning.issued_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      );
      setExistingAttachment(
        warning.attachment || warning.attachment_url || null,
      );
    } else {
      setEmployeeId("");
      setTitle("");
      setSubject("");
      setDescription("");
      setIssuedDate(new Date().toISOString().split("T")[0]);
      setExistingAttachment(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`File must be under ${MAX_SIZE_MB} MB`, "error");
      e.target.value = "";
      return;
    }

    setAttachment(file);
    setRemoveAttachment(false);
  };

  const clearNewFile = () => setAttachment(null);

  const markExistingForRemoval = () => {
    setExistingAttachment(null);
    setRemoveAttachment(true);
  };

  const getFileNameFromPath = (path) => {
    if (!path) return "";
    return String(path).split("/").pop();
  };

  const getAttachmentUrl = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}/storage/${path}`;
  };

  const isImagePath = (pathOrName) => {
    if (!pathOrName) return false;
    const s = String(pathOrName).toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(s);
  };

  const isImageFile = (file) =>
    file instanceof File && file.type?.startsWith("image/");

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

    const needsFormData = Boolean(attachment) || removeAttachment;

    let payload;
    if (needsFormData) {
      const fd = new FormData();
      fd.append("employee_id", String(Number(employeeId)));
      fd.append("title", title.trim());
      fd.append("subject", subject.trim());
      fd.append("description", description.trim());
      fd.append("issued_date", issuedDate);

      if (attachment) {
        fd.append("attachment", attachment);
      }
      if (removeAttachment) {
        fd.append("remove_attachment", "1");
      }

      payload = fd;
    } else {
      payload = {
        employee_id: Number(employeeId),
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        issued_date: issuedDate,
      };
    }

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

          {/* Issued Date — using shared DateInput */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Issued Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={issuedDate}
              onChange={(val) => setIssuedDate(val)}
              type="general"
              placeholder="dd/mm/yyyy"
              className="!bg-gray-50 dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !rounded-lg !text-sm !px-3 !py-2.5"
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

          {/* Attachment */}
          {/* Attachment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              Attachment{" "}
              <span className="text-gray-400 text-xs font-normal ml-1">
                (Optional)
              </span>
            </label>

            {/* Existing attachment (edit mode) */}
            {isEdit && existingAttachment && !attachment && (
              <div className="mb-2 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <a
                      href={getAttachmentUrl(existingAttachment)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-700 dark:text-gray-300 hover:text-amber-600 truncate underline decoration-dotted"
                    >
                      {getFileNameFromPath(existingAttachment)}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={markExistingForRemoval}
                    disabled={submitting}
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-50"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image preview for existing file */}
                {isImagePath(existingAttachment) && (
                  <a
                    href={getAttachmentUrl(existingAttachment)}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-2"
                  >
                    <img
                      src={getAttachmentUrl(existingAttachment)}
                      alt={getFileNameFromPath(existingAttachment)}
                      className="max-h-40 w-auto rounded-lg border border-gray-200 dark:border-gray-700 object-contain bg-white dark:bg-gray-800"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </a>
                )}
              </div>
            )}

            {/* New file selected — single block, with image preview */}
            {attachment && (
              <div className="mb-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                      {attachment.name}{" "}
                      <span className="text-gray-400">
                        ({Math.round(attachment.size / 1024)} KB)
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearNewFile}
                    disabled={submitting}
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-50"
                    title="Remove selected file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image preview for newly selected file */}
                {isImageFile(attachment) && (
                  <img
                    src={URL.createObjectURL(attachment)}
                    alt={attachment.name}
                    className="mt-2 max-h-40 w-auto rounded-lg border border-amber-200 dark:border-amber-900/40 object-contain bg-white dark:bg-gray-800"
                  />
                )}
              </div>
            )}

            <input
              type="file"
              onChange={handleFileChange}
              disabled={submitting}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-white file:cursor-pointer hover:file:bg-amber-600 disabled:opacity-60"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              PDF, DOC, DOCX, JPG, PNG — max 5 MB
            </p>
          </div>

          {/* Info note */}
          {!isEdit && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-lg">
              <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                The warning will be created but the email will not be sent
                automatically. You can send it from the Warnings list using the
                mail icon.
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
