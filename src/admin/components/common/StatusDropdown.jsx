import React, { useState, useEffect, useRef } from "react";

const StatusDropdown = ({ value, onChange, statuses, name = "status", includeAll = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allStatuses = statuses && statuses.length > 0 
    ? [...statuses] 
    : ["Active", "Completed", "On-hold", "In-progress"];

  const groupStatuses = (list) => {
    const groups = {
      General: [],
      Proposal: [],
      Quotation: [],
      Invoice: [],
      Payment: [],
      Project: [],
      Other: [],
    };

    const options = [
      ...(includeAll ? [{ value: "all", label: "All Status" }] : []),
      { value: "not_started", label: "Not Started" },
      ...list.map(s => typeof s === 'string' ? { value: s, label: s } : s)
    ];

    options.forEach((opt) => {
      const lower = opt.label.toLowerCase();
      if (opt.value === "all") {
        groups.General.push(opt);
      } else if (lower.includes("proposal")) {
        groups.Proposal.push(opt);
      } else if (lower.includes("quotation")) {
        groups.Quotation.push(opt);
      } else if (lower.includes("invoice")) {
        groups.Invoice.push(opt);
      } else if (lower.includes("payment")) {
        groups.Payment.push(opt);
      } else if (lower.includes("project") && !lower.includes("project modal")) {
        groups.Project.push(opt);
      } else if (
        lower.includes("active") || lower.includes("completed") || 
        lower.includes("on-hold") || lower.includes("in-progress") || lower.includes("not started")
      ) {
        groups.General.push(opt);
      } else {
        groups.Other.push(opt);
      }
    });

    return groups;
  };

  const grouped = groupStatuses(allStatuses);

  const getSelectedLabel = () => {
    if (value === "all") return "All Status";
    if (value === "not_started") return "Not Started";
    return value || "Select Status";
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 dark:bg-gray-700 dark:text-white flex justify-between items-center cursor-pointer bg-white shadow-sm transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate font-medium">{getSelectedLabel()}</span>
        <i className={`fas fa-chevron-down text-sm text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}></i>
      </div>

      {isOpen && (
        <div className="absolute z-[1050] w-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {Object.entries(grouped).map(([groupName, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={groupName} className="py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 backdrop-blur-sm">
                  {groupName}
                </div>
                {items.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 transition-colors flex items-center justify-between ${
                        isSelected 
                          ? 'bg-green-50/50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold' 
                          : 'text-gray-700 dark:text-gray-300 font-medium'
                      }`}
                      onClick={() => {
                        onChange({ target: { name, value: opt.value } });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                        )}
                        {opt.label}
                      </div>
                      {isSelected && <i className="fas fa-check text-green-500 text-xs"></i>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
