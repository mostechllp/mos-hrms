// src/admin/components/crm/ConvertLeadModal.jsx

import { useEffect, useState } from "react";
import { X, UserCheck, Loader } from "lucide-react";
import { showToast } from "../../../components/common/Toast";

const ConvertLeadModal = ({ isOpen, onClose, lead, onSubmit }) => {
  const [mode, setMode] = useState("create"); // create | existing
  const [existingCustomerId, setExistingCustomerId] = useState("");
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [opportunityName, setOpportunityName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode("create");
    setExistingCustomerId("");
    setCreateOpportunity(true);
    setOpportunityName(
      lead?.company
        ? `${lead.company} — Opportunity`
        : lead?.name
          ? `${lead.name} — Opportunity`
          : "",
    );
    setSubmitting(false);
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async () => {
    if (mode === "existing" && !existingCustomerId) {
      showToast("Please select a customer", "error");
      return;
    }
    if (createOpportunity && !opportunityName.trim()) {
      showToast("Please enter an opportunity name", "error");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: dispatch(convertLead({ leadId, mode, existingCustomerId, createOpportunity, opportunityName }))
      console.log("Convert lead:", {
        leadId: lead.id,
        mode,
        existingCustomerId,
        createOpportunity,
        opportunityName,
      });
      onSubmit({ createOpportunity });
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Convert Lead
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lead.name} · {lead.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Mode */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Customer
            </p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <input
                  type="radio"
                  checked={mode === "create"}
                  onChange={() => setMode("create")}
                  disabled={submitting}
                  className="mt-0.5 accent-green-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Create new customer
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    A new customer will be created using this lead's details.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <input
                  type="radio"
                  checked={mode === "existing"}
                  onChange={() => setMode("existing")}
                  disabled={submitting}
                  className="mt-0.5 accent-green-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Link to existing customer
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Select an existing customer to avoid duplicates.
                  </p>
                  {mode === "existing" && (
                    <select
                      value={existingCustomerId}
                      onChange={(e) => setExistingCustomerId(e.target.value)}
                      disabled={submitting}
                      className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    >
                      <option value="">Select customer...</option>
                      <option value="1">Acme Corp</option>
                      <option value="2">Globex Ltd</option>
                      <option value="3">Initech</option>
                    </select>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Opportunity */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Opportunity
            </p>
            <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
              <input
                type="checkbox"
                checked={createOpportunity}
                onChange={(e) => setCreateOpportunity(e.target.checked)}
                disabled={submitting}
                className="mt-0.5 accent-green-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Create an opportunity
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Track this deal as an opportunity in the pipeline.
                </p>
                {createOpportunity && (
                  <input
                    type="text"
                    value={opportunityName}
                    onChange={(e) => setOpportunityName(e.target.value)}
                    disabled={submitting}
                    placeholder="Opportunity name"
                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                )}
              </div>
            </label>
          </div>
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
            className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Converting...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" /> Convert Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertLeadModal;