import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LeavesByDepartment = ({ leavesByDepartment = {}, userType = "hr" }) => {
  const navigate = useNavigate();
  const [expandedDepartments, setExpandedDepartments] = useState([]);

  // Get all departments that have leaves
  const departments = Object.keys(leavesByDepartment).filter(
    (dept) => leavesByDepartment[dept] && leavesByDepartment[dept].length > 0,
  );

  const canViewEmployee = userType === "hr";

  // Get all employees on leave (flattened list for team lead view)
  const allEmployees = departments.flatMap(
    (dept) => leavesByDepartment[dept] || [],
  );

  // Calculate total leaves
  const totalLeaves = departments.reduce(
    (sum, dept) => sum + leavesByDepartment[dept].length,
    0,
  );

  // Toggle department expansion
  const toggleDepartment = (deptName) => {
    setExpandedDepartments((prev) => {
      const isExpanded = prev.includes(deptName);

      if (isExpanded) {
        return prev.filter((dept) => dept !== deptName);
      }

      return [...prev, deptName];
    });
  };

  const formatSession = (session1, session2) => {
    const s1 = (session1 || "").toLowerCase().trim();
    const s2 = (session2 || "").toLowerCase().trim();

    // Both present and different → full day (covers morning + afternoon)
    if (s1 && s2 && s1 !== s2) return "Full Day";
    // Both present and same
    if (s1 && s2 && s1 === s2) {
      return s1.charAt(0).toUpperCase() + s1.slice(1);
    }
    // Only one present
    if (s1) return s1.charAt(0).toUpperCase() + s1.slice(1);
    if (s2) return s2.charAt(0).toUpperCase() + s2.slice(1);
    // Neither present
    return "Full Day";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper to get the correct navigation path
  const getNavigatePath = (employeeId) => {
    if (userType === "hr") {
      return `/admin/employees/${employeeId}`;
    }

    return `/employee/employees/${employeeId}`;
  };

  // Navigate to employee profile
  const handleEmployeeClick = (employeeId, e) => {
    e.stopPropagation();
    if (!canViewEmployee) return; // no navigation for non-HR
    if (employeeId) {
      navigate(`/admin/employees/${employeeId}`);
    }
  };

  // No leaves
  if (departments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            <i className="fas fa-calendar-times text-red-500 mr-2"></i>
            Leaves Today
          </h3>

          <span className="text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            0 employees on leave
          </span>
        </div>

        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <i className="fas fa-calendar-check text-4xl text-gray-300 dark:text-gray-600 mb-3 block"></i>

            <p>No leaves today</p>

            <p className="text-sm text-gray-400 dark:text-gray-500">
              All employees are present
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <i className="fas fa-calendar-times text-red-500 mr-2"></i>

          {userType === "hr" ? "Leaves Today by Department" : "Leaves Today"}
        </h3>

        <span className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
          {totalLeaves} employee{totalLeaves > 1 ? "s" : ""} on leave
        </span>
      </div>

      {/* HR View - Grouped by Department */}
      {userType === "hr" ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {departments.map((deptName) => {
            const leaves = leavesByDepartment[deptName];

            const isExpanded = expandedDepartments.includes(deptName);

            const displayLeaves = isExpanded ? leaves : leaves.slice(0, 2);

            const hasMore = leaves.length > 2;

            return (
              <div
                key={deptName}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Department Header */}
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => toggleDepartment(deptName)}
                >
                  {/* Left side */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {/* Department Initial */}
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-sm flex-shrink-0">
                      {deptName.charAt(0).toUpperCase()}
                    </div>

                    {/* Department Name */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {deptName}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {leaves.length} employee{leaves.length > 1 ? "s" : ""}{" "}
                        on leave
                      </span>
                    </div>
                  </div>

                  {/* Right side - Count + Chevron */}
                  <div className="flex items-center gap-2 ml-3">
                    {/* Employee Count */}
                    <span className="text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                      {leaves.length}
                    </span>

                    {/* Chevron */}
                    {hasMore && (
                      <i
                        className={`fas fa-chevron-${
                          isExpanded ? "up" : "down"
                        } text-gray-400 text-xs transition-transform duration-200`}
                      ></i>
                    )}
                  </div>
                </div>

                {/* Employee List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {displayLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      onClick={
                        canViewEmployee
                          ? (e) => handleEmployeeClick(leave.employee_id, e)
                          : undefined
                      }
                      className={`flex items-center gap-3 p-3 transition-colors ${
                        canViewEmployee
                          ? "hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer"
                          : ""
                      }`}
                    >
                      {/* Employee Avatar */}
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-xs flex-shrink-0">
                        {leave.employee_name?.charAt(0)?.toUpperCase() || "E"}
                      </div>

                      {/* Employee Information */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {leave.employee_name || "Unknown Employee"}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {leave.leave_type || "Leave"}
                          </span>

                          <span className="truncate">
                            {leave.designation || ""}
                          </span>
                        </div>
                      </div>

                      {/* Leave Details */}
                      <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 text-right">
                        <div>
                          {leave.duration_days} day
                          {leave.duration_days > 1 ? "s" : ""}
                        </div>

                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {formatDate(leave.start_date)}
                          {leave.end_date && leave.end_date !== leave.start_date
                            ? ` - ${formatDate(leave.end_date)}`
                            : ""}
                        </div>

                        {/* Session badge */}
                        <div className="mt-1">
                          <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                            <i className="fas fa-clock mr-1 text-[8px]"></i>
                            {formatSession(leave.session1, leave.session2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* View More / Show Less */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // PREVENT BUBBLING
                        toggleDepartment(deptName);
                      }}
                      className="w-full p-2 text-center text-xs text-blue-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <i className="fas fa-chevron-up mr-1"></i>
                          Show Less
                        </>
                      ) : (
                        <>
                          <i className="fas fa-chevron-down mr-1"></i>
                          View {leaves.length - 2} more...
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Team Lead View - Flat list WITHOUT grouping */
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {allEmployees.map((leave) => (
            <div
              key={leave.id}
              onClick={(e) => handleEmployeeClick(leave.employee_id, e)}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-100 dark:border-gray-600"
            >
              {/* Employee Avatar */}
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-sm flex-shrink-0">
                {leave.employee_name?.charAt(0)?.toUpperCase() || "E"}
              </div>

              {/* Employee Information */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {leave.employee_name || "Unknown Employee"}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {leave.leave_type || "Leave"}
                  </span>

                  <span className="truncate">{leave.designation || ""}</span>
                </div>
              </div>

              {/* Leave Details */}
              <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 text-right">
                <div>
                  {leave.duration_days} day
                  {leave.duration_days > 1 ? "s" : ""}
                </div>

                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                  {formatDate(leave.start_date)}

                  {leave.end_date && leave.end_date !== leave.start_date
                    ? ` - ${formatDate(leave.end_date)}`
                    : ""}
                </div>
              </div>

              {/* Right Chevron */}
              <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default LeavesByDepartment;
