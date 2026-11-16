import React, { useState } from "react";
import { X, Settings, Info, Plus, ArrowRight } from "lucide-react";

const TransactionNumberSettingsModal = ({
  isOpen,
  onClose,
  title = "Configure Number Preferences",
  initialData = { autoGenerate: true, prefix: "QT-", nextNumber: "000002", restartFiscalYear: false },
  onSave,
}) => {
  const [formData, setFormData] = useState(initialData);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[100] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
          <h2 className="text-lg font-normal text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>


        {/* Body */}
        <div className="px-5 py-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Your transaction numbers are set on auto-generate mode to save your time.<br />
              Are you sure about changing this setting?
            </p>

            <div className="space-y-4 pt-2">
              {/* Auto-generate Option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="numberMode"
                  checked={formData.autoGenerate}
                  onChange={() => handleChange("autoGenerate", true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Continue auto-generating transaction numbers
                </span>
                <Info size={14} className="text-gray-400" />
              </label>

              {/* Auto-generate Inputs */}
              {formData.autoGenerate && (
                <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Prefix</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.prefix}
                        onChange={(e) => handleChange("prefix", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Next Number</label>
                    <input
                      type="text"
                      value={formData.nextNumber}
                      onChange={(e) => handleChange("nextNumber", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Restart Fiscal Year Checkbox */}
              <div className="pl-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.restartFiscalYear}
                    onChange={(e) => handleChange("restartFiscalYear", e.target.checked)}
                    disabled={!formData.autoGenerate}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className={`text-sm ${formData.autoGenerate ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    Restart numbering for transactions at the start of each fiscal year.
                  </span>
                </label>
              </div>

              {/* Manual Option */}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="radio"
                  name="numberMode"
                  checked={!formData.autoGenerate}
                  onChange={() => handleChange("autoGenerate", false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Enter transaction numbers manually
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionNumberSettingsModal;