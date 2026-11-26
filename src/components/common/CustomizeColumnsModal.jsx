// src/components/common/CustomizeColumnsModal.jsx

import React, { useState } from "react";
import { Columns, GripVertical, Lock, Search, X } from "lucide-react";

const CustomizeColumnsModal = ({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn,
  onReorderColumns,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [overId, setOverId] = useState(null);

  if (!isOpen) return null;

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = Object.values(visibleColumns).filter(Boolean).length;

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setOverId(null);
      return;
    }

    const reordered = [...columns];

    const fromIndex = reordered.findIndex((col) => col.id === draggedId);
    const toIndex = reordered.findIndex((col) => col.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedColumn] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, movedColumn);

      onReorderColumns(reordered);
    }

    setDraggedId(null);
    setOverId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
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

            <button onClick={onClose}>
              <X
                size={18}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              />
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
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
        </div>

        {/* Column List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredColumns.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No columns match "{searchQuery}"
            </div>
          ) : (
            filteredColumns.map((col) => (
  <div
    key={col.id}
    onClick={() => {
      if (!col.locked) {
        onToggleColumn(col.id);
      }
    }}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all
      ${
        draggedId === col.id
          ? "opacity-40 bg-green-50 dark:bg-green-900/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }
      ${
        overId === col.id && draggedId !== col.id
          ? "border-t-2 border-green-500"
          : "border-t-2 border-transparent"
      }
      ${
        col.locked
          ? "bg-gray-50 dark:bg-gray-700/30 cursor-default"
          : "cursor-pointer"
      }`}
    >
      {/* Drag Handle */}
      <div
        draggable={!col.locked}
        onDragStart={(e) => {
          e.stopPropagation();
          setDraggedId(col.id);
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", col.id);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOverId(col.id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(col.id);
        }}
        onDragEnd={() => {
          setDraggedId(null);
          setOverId(null);
        }}
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center ${
          col.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <GripVertical
          size={17}
          className="text-gray-400 dark:text-gray-500 shrink-0"
        />
      </div>

      {/* Checkbox / Lock */}
      {col.locked ? (
        <div className="w-4 h-4 flex items-center justify-center">
          <Lock size={12} className="text-gray-400" />
        </div>
      ) : (
        <input
          type="checkbox"
          checked={!!visibleColumns[col.id]}
          onChange={() => onToggleColumn(col.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400 cursor-pointer"
        />
      )}

      {/* Column Name */}
      <span
        className={`flex-1 text-sm ${
          col.locked
            ? "text-gray-500"
            : "text-gray-700 dark:text-gray-200"
        }`}
      >
        {col.label}
      </span>
    </div>
))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50"
          >
            Close
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeColumnsModal;