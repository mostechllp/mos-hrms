// src/components/common/CustomizeColumnsModal.jsx
import React, { useState } from "react";
import { Columns, GripVertical, Lock, Search, X } from "lucide-react";

const CustomizeColumnsModal = ({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredColumns = columns.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Columns size={18} className="text-gray-500" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Customize Columns
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">
              {selectedCount} of {columns.length} Selected
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredColumns.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No columns match "{searchQuery}"
            </div>
          ) : (
            filteredColumns.map((col) => (
              <div
                key={col.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  col.locked
                    ? "bg-gray-50 dark:bg-gray-700/30 opacity-70"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <GripVertical
                  size={16}
                  className="text-gray-300 dark:text-gray-600 cursor-grab"
                />

                {col.locked ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Lock size={12} className="text-gray-400" />
                  </div>
                ) : (
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.id]}
                    onChange={() => onToggleColumn(col.id)}
                    className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400 cursor-pointer"
                  />
                )}

                <label
                  className={`flex-1 text-sm ${
                    col.locked
                      ? "text-gray-500"
                      : "text-gray-700 dark:text-gray-200 cursor-pointer"
                  }`}
                  onClick={() => !col.locked && onToggleColumn(col.id)}
                >
                  {col.label}
                </label>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeColumnsModal;