// src/admin/components/crm/ProposalModal.jsx
import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Save,
  Loader,
  AlertCircle,
  User,
  Link as LinkIcon,
  Hash,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import DateInput from "../common/DateInput";

const emptyForm = {
  sno: "",
  date: new Date().toISOString().split("T")[0],
  customer: "",
  proposal_reference: "",
  drive_link: "",
  status: "Preparing",
};

const ProposalModal = ({
  isOpen,
  onClose,
  proposal = null,
  onSave,
  submitting = false,
  statuses = ["Preparing", "Pending", "Sent", "Approved", "Reject"],
  isSnoTaken = () => false,
}) => {
  const isEdit = Boolean(proposal?.id);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    if (isEdit && proposal) {
      setForm({
        sno: proposal.sno ?? "",
        date:
          proposal.date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        customer: proposal.customer || "",
        proposal_reference: proposal.proposal_reference || "",
        drive_link: proposal.drive_link || "",
        status: proposal.status || "Preparing",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, isEdit, proposal]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const errs = {};

    // S.No — required, integer, > 0, unique
    const snoStr = String(form.sno ?? "").trim();
    if (!snoStr) {
      errs.sno = "S.No is required";
    } else if (!/^\d+$/.test(snoStr)) {
      errs.sno = "S.No must be a positive number";
    } else if (Number(snoStr) < 1) {
      errs.sno = "S.No must be at least 1";
    } else if (isSnoTaken(Number(snoStr), proposal?.id)) {
      errs.sno = `S.No ${snoStr} is already in use`;
    }

    if (!form.date) errs.date = "Date is required";
    if (!form.customer.trim()) errs.customer = "Customer is required";
    if (!form.proposal_reference.trim())
      errs.proposal_reference = "Proposal reference # is required";
    if (!form.drive_link.trim()) {
      errs.drive_link = "Drive link is required";
    } else if (!/^https?:\/\//i.test(form.drive_link.trim())) {
      errs.drive_link = "Drive link must start with http:// or https://";
    }
    if (!form.status) errs.status = "Status is required";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast(Object.values(errs)[0], "error");
      return;
    }
    onSave?.({ ...form, sno: Number(form.sno) });
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
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEdit ? "Edit Proposal" : "New Proposal"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit
                  ? "Update the proposal details"
                  : "Add a new proposal record"}
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
          {/* S.No */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              S.No <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="number"
                min="1"
                step="1"
                value={form.sno}
                onChange={(e) => setField("sno", e.target.value)}
                placeholder="e.g. 1"
                disabled={submitting}
                className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono ${
                  errors.sno
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.sno && (
              <p className="text-xs text-red-500 mt-1">{errors.sno}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              The table sorts by S.No. Each row must use a unique number.
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={form.date}
              onChange={(val) => setField("date", val)}
              type="general"
              placeholder="dd/mm/yyyy"
              className={`!bg-gray-50 dark:!bg-gray-900 !rounded-lg !text-sm !px-3 !py-2.5 ${
                errors.date
                  ? "!border-red-500"
                  : "!border-gray-200 dark:!border-gray-700"
              }`}
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={form.customer}
                onChange={(e) => setField("customer", e.target.value)}
                placeholder="e.g. Emirates NBD"
                disabled={submitting}
                className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.customer
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.customer && (
              <p className="text-xs text-red-500 mt-1">{errors.customer}</p>
            )}
          </div>

          {/* Proposal Reference # */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Proposal Reference # <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.proposal_reference}
              onChange={(e) =>
                setField("proposal_reference", e.target.value)
              }
              placeholder="e.g. PR-2026-0042"
              disabled={submitting}
              className={`w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono ${
                errors.proposal_reference
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
              }`}
            />
            {errors.proposal_reference && (
              <p className="text-xs text-red-500 mt-1">
                {errors.proposal_reference}
              </p>
            )}
          </div>

          {/* Drive Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Drive Link <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="url"
                value={form.drive_link}
                onChange={(e) => setField("drive_link", e.target.value)}
                placeholder="https://drive.google.com/..."
                disabled={submitting}
                className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.drive_link
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.drive_link && (
              <p className="text-xs text-red-500 mt-1">{errors.drive_link}</p>
            )}
            {form.drive_link && !errors.drive_link && (
              <a
                href={form.drive_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                <LinkIcon size={11} />
                Open link
              </a>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              disabled={submitting}
              className={`w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.status
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
              }`}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">{errors.status}</p>
            )}
          </div>

          {!isEdit && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Enter a unique S.No to control the row order in the table.
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
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update Proposal" : "Create Proposal"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;