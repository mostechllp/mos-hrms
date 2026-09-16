// src/admin/components/crm/SendQuotationModal.jsx

import { useEffect, useState } from "react";
import { X, Send, Loader, Paperclip } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

const SendQuotationModal = ({ isOpen, onClose, quotation, onSend }) => {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !quotation) return;
    setTo("billing@acmecorp.com");
    setCc("");
    setSubject(`Quotation ${quotation.number} from Mostech`);
    setMessage(
      `Dear ${quotation.customer} team,\n\nPlease find attached our quotation ${quotation.number} dated ${new Date(quotation.issueDate).toLocaleDateString("en-GB")}.\n\nThe quotation is valid until ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}.\n\nKindly review and revert at your earliest convenience.\n\nBest regards,\nMostech Business Solutions`,
    );
    setAttachPdf(true);
    setSubmitting(false);
  }, [isOpen, quotation]);

  if (!isOpen || !quotation) return null;

  const handleSubmit = async () => {
    if (!to.trim()) {
      showToast("Please enter a recipient email", "error");
      return;
    }
    if (!subject.trim()) {
      showToast("Please enter a subject", "error");
      return;
    }
    setSubmitting(true);
    try {
      onSend?.({ to, cc, subject, message, attachPdf });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Send Quotation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {quotation.number} · {quotation.customer}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <Field label="To" required>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
          <Field label="CC">
            <input
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              disabled={submitting}
              placeholder="Optional"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
          <Field label="Subject" required>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>
          <Field label="Message">
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </Field>

          <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40">
            <input
              type="checkbox"
              checked={attachPdf}
              onChange={(e) => setAttachPdf(e.target.checked)}
              disabled={submitting}
              className="accent-blue-500"
            />
            <Paperclip size={14} className="text-gray-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Attach quotation PDF
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {quotation.number}.pdf will be attached to the email
              </p>
            </div>
          </label>
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
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Quotation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default SendQuotationModal;