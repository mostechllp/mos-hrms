import { useState } from "react";
import { showToast } from "./Toast";

const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  title = "Export Report",
  totalRecords = 0,
  formats = ["csv", "pdf"],
  defaultFormat = "csv",
  additionalOptions = null,
}) => {
  const [exportFormat, setExportFormat] = useState(defaultFormat);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (totalRecords === 0) {
      showToast("No data to export", "warning");
      return;
    }

    setExporting(true);
    try {
      await onExport(exportFormat);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      showToast(`Failed to export as ${exportFormat.toUpperCase()}`, "error");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-download text-green-500"></i>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
            disabled={exporting}
          >
            &times;
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <i className="fas fa-file-export text-green-500 mr-1"></i> Export Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            disabled={exporting}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500 disabled:opacity-50"
          >
            {formats.includes("csv") && <option value="csv">CSV</option>}
            {formats.includes("pdf") && <option value="pdf">PDF</option>}
            {formats.includes("excel") && <option value="excel">Excel (XLSX) - Coming Soon</option>}
          </select>
        </div>

        {additionalOptions && additionalOptions}

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <i className="fas fa-info-circle mr-1"></i>
            Export will include all {totalRecords} records with current filters applied.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {exporting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Exporting...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i> Export Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;