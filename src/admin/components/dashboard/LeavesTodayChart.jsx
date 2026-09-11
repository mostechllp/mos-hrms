// src/admin/components/dashboard/LeavesTodayChart.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LeavesTodayChart = ({ leavesToday = [] }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Calculate leave statistics
  const totalLeaves = leavesToday.length;
  const totalEmployeesOnLeave = leavesToday.length;

  // Get the display list
  const displayLeaves = leavesToday;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <i className="fas fa-calendar-times text-red-500 mr-2"></i>
          Leaves Today
        </h3>
        <span className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
          {totalEmployeesOnLeave} employee{totalEmployeesOnLeave > 1 ? "s" : ""} on leave
        </span>
      </div>

      {totalLeaves === 0 ? (
        <div className="flex items-center justify-center flex-1 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <i className="fas fa-calendar-check text-4xl text-gray-300 dark:text-gray-600 mb-3 block"></i>
            <p>No leaves today</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">All employees are present</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sub-header with count */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Employees on Leave Today
            </h4>
            {displayLeaves.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {expanded ? "Show Less" : `Show All (${displayLeaves.length})`}
              </button>
            )}
          </div>
          
          {/* Scrollable container - takes remaining height */}
          <div 
            className={`space-y-2 pr-2 overflow-y-auto flex-1 ${
              expanded ? '' : ''
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E1 transparent',
              maxHeight: expanded ? 'none' : '280px',
            }}
          >
            <style>{`
              .space-y-2::-webkit-scrollbar {
                width: 4px;
              }
              .space-y-2::-webkit-scrollbar-track {
                background: transparent;
              }
              .space-y-2::-webkit-scrollbar-thumb {
                background: #CBD5E1;
                border-radius: 8px;
              }
              .space-y-2::-webkit-scrollbar-thumb:hover {
                background: #94A3B8;
              }
            `}</style>
            
            {displayLeaves.map((leave) => (
              <div
                key={leave.id}
                onClick={() => {
                  if (leave.employee_id) {
                    navigate(`/admin/employees/${leave.employee_id}`);
                  }
                }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-100 dark:border-gray-600"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-sm flex-shrink-0">
                  {leave.employee_name?.charAt(0)?.toUpperCase() || "E"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {leave.employee_name || "Unknown Employee"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {leave.leave_type || "Leave"}
                    </span>
                    <span className="truncate">{leave.department_name || "N/A"}</span>
                    <span className="truncate">{leave.designation || ""}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {leave.duration_days} day{leave.duration_days > 1 ? "s" : ""}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show count at bottom - fixed */}
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center flex-shrink-0 pt-2 border-t border-gray-100 dark:border-gray-700">
            Showing {displayLeaves.length} of {totalLeaves} employee{totalLeaves > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesTodayChart;