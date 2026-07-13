import React from "react";

const BreakDetailsModal = ({ isOpen, onClose, initialBreaks, employeeName, date }) => {
  const breaks = initialBreaks || [];

  if (!isOpen) return null;

  // Helper function to format ISO time
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Break History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {employeeName} • {date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {(!breaks || breaks.length === 0) ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-coffee text-2xl"></i>
              </div>
              <p>No breaks recorded for this day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breaks.map((b, index) => (
                <div key={b.id || index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {formatTime(b.start_time)}
                        <i className="fas fa-arrow-right text-xs text-gray-400"></i>
                        {b.end_time ? formatTime(b.end_time) : "Ongoing"}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {b.duration_minutes ? `${b.duration_minutes} mins` : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakDetailsModal;
