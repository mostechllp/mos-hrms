import React, { useState, useRef } from "react";
import { Loader2, UploadCloud, X, FileSpreadsheet, AlertCircle } from "lucide-react";

const ImportModal = ({
  isOpen,
  onClose,
  onImport, // Function that returns a promise (e.g., dispatch(importCustomers(formData)))
  title = "Import Data",
  subtitle = "Upload an Excel or CSV file",
  expectedColumns = [], // Array of strings to show in the warning
  onSuccess,
}) => {
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    const fileExtension = selected.name.split(".").pop().toLowerCase();
    
    if (!validTypes.includes(selected.type) && !["xlsx", "xls", "csv"].includes(fileExtension)) {
      setError("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.");
      setFile(null);
      return;
    }

    setError(null);
    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await onImport(formData);
      setFile(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err || "Failed to import data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <UploadCloud className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 pr-1">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Expected Columns Warning */}
          {expectedColumns.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-400">
                    Required Column Headings
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1 mb-2">
                    For best results, ensure your file contains the following exact column headings in the first row:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {expectedColumns.map((col, i) => (
                      <span key={i} className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-[10px] font-medium rounded">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4
              ${file ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={32} className="text-green-500" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={32} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">Only .xlsx, .xls, and .csv files are supported</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isSubmitting}
            className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Importing...</>
            ) : (
              <><UploadCloud size={16} /> Import Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;