import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { fetchOrganizations } from "../store/slices/organizationSlice";
import { fetchAttendanceRecords } from "../store/slices/attendanceSlice";
import { fetchLeaves } from "../store/slices/LeaveSlice";
import { 
  fetchTaskReports, 
  fetchPendingLeavesReport,
  fetchEmployeeNearestExpiryReport,
  fetchEmployeeUpcomingRenewalsReport,
  fetchCompanyNearestExpiryReport,
  fetchCompanyUpcomingRenewalsReport
} from "../store/slices/reportSlice";

const Reports = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { organizations = [] } = useSelector(
    (state) => state.organizations || {},
  );
  const { employees = [] } = useSelector((state) => state.employees || {});
  const { records: attendanceRecords = [] } = useSelector(
    (state) => state.attendance || {},
  );
  const { leaves: leaveRecords = [] } = useSelector(
    (state) => state.leaves || {},
  );
  const { 
    taskReports = [], 
    taskReportsTotalCount = 0,
    pendingLeaves = [],
    pendingLeavesTotalCount = 0,
    employeeNearestExpiry = [],
    employeeNearestExpiryTotalCount = 0,
    employeeUpcomingRenewals = [],
    employeeUpcomingRenewalsTotalCount = 0,
    companyNearestExpiry = [],
    companyNearestExpiryTotalCount = 0,
    companyUpcomingRenewals = [],
    companyUpcomingRenewalsTotalCount = 0,
  } = useSelector((state) => state.reports || {});

  // Get user role from auth
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.type || "admin";

  // Determine the base path based on user role
  const basePath = userRole === "admin" ? "/admin" : "/employee";

  // State to track if data is loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch basic data
      await Promise.all([
        dispatch(fetchOrganizations()),
        dispatch(fetchEmployees()),
        dispatch(fetchAttendanceRecords()),
        dispatch(fetchLeaves()),
      ]);

      // Fetch report data with specific parameters
      await Promise.all([
        // Task reports - fetch current month
        dispatch(fetchTaskReports({
          page: 1,
          per_page: 1,
          date_range: "custom",
          from_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
          to_date: new Date().toISOString().split("T")[0],
        })),
        
        // Pending leaves - fetch all pending
        dispatch(fetchPendingLeavesReport({
          page: 1,
          per_page: 100,
        })),
        
        // Employee nearest expiry (within 30 days)
        dispatch(fetchEmployeeNearestExpiryReport({
          page: 1,
          per_page: 100,
          expiry_days: 30,
        })),
        
        // Employee upcoming renewals (31-90 days)
        dispatch(fetchEmployeeUpcomingRenewalsReport({
          page: 1,
          per_page: 100,
          min_days: 31,
          max_days: 90,
        })),
        
        // Company nearest expiry (within 30 days)
        dispatch(fetchCompanyNearestExpiryReport({
          page: 1,
          per_page: 100,
          expiry_days: 30,
        })),
        
        // Company upcoming renewals (31-90 days)
        dispatch(fetchCompanyUpcomingRenewalsReport({
          page: 1,
          per_page: 100,
          min_days: 31,
          max_days: 90,
        })),
      ]);

      setDataLoaded(true);
    };

    fetchAllData();
  }, [dispatch]);

  // Calculate statistics
  const totalEmployees = employees.length;
  
  // Pending leaves - use API count
  const pendingLeavesCount = pendingLeavesTotalCount || pendingLeaves.length;
  
  // Total task reports
  const totalTaskReports = taskReportsTotalCount || taskReports.length;
  
  // Employee nearest expiry - use API count
  const employeeNearExpiryCount = employeeNearestExpiryTotalCount || employeeNearestExpiry.length;
  
  // Employee upcoming renewals - use API count
  const employeeUpcomingRenewalsCount = employeeUpcomingRenewalsTotalCount || employeeUpcomingRenewals.length;
  
  // Company nearest expiry - use API count
  const companyNearExpiryCount = companyNearestExpiryTotalCount || companyNearestExpiry.length;
  
  // Company upcoming renewals - use API count
  const companyUpcomingRenewalsCount = companyUpcomingRenewalsTotalCount || companyUpcomingRenewals.length;

  const reportCards = [
    {
      id: "employee-details",
      title: "Employee Details",
      description: "Full employee data view",
      icon: "fas fa-users",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: `${basePath}/reports/employee-details`,
      count: totalEmployees,
    },
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Detailed punch logs",
      icon: "fas fa-fingerprint",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      link: `${basePath}/reports/attendance-reports`,
      count: attendanceRecords.length,
    },
    {
      id: "task-reports",
      title: "Task Reports",
      description: "Employee task reports",
      icon: "fas fa-tasks",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      link: `${basePath}/reports/task-reports`,
      count: totalTaskReports,
    },
    {
      id: "leave-requests",
      title: "Leave Requests",
      description: "History of leave requests",
      icon: "fas fa-calendar-check",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      link: `${basePath}/reports/leave-requests-reports`,
      count: leaveRecords.length,
    },
    {
      id: "pending-leaves",
      title: "Pending Leaves",
      description: "Awaiting approval",
      icon: "fas fa-clock",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      link: `${basePath}/reports/pending-leaves-reports`,
      count: pendingLeavesCount,
      highlight: pendingLeavesCount > 0,
    },
    {
      id: "emp-near-expiry",
      title: "Employee Nearest Expiry",
      description: "Critical expiry alerts",
      icon: "fas fa-exclamation-triangle",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      link: `${basePath}/reports/employee-near-expiry`,
      count: employeeNearExpiryCount,
      highlight: employeeNearExpiryCount > 0,
    },
    {
      id: "emp-upcoming-renewals",
      title: "Employee Upcoming Renewals",
      description: "Renewal pipeline",
      icon: "fas fa-calendar-alt",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      link: `${basePath}/reports/employee-upcoming-renewals`,
      count: employeeUpcomingRenewalsCount,
    },
    {
      id: "org-near-expiry",
      title: "Company Nearest Expiry",
      description: "Company document alerts",
      icon: "fas fa-building",
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      link: `${basePath}/reports/organization-near-expiry`,
      count: companyNearExpiryCount,
      highlight: companyNearExpiryCount > 0,
    },
    {
      id: "org-upcoming-renewals",
      title: "Company Upcoming Renewals",
      description: "Planned compliance",
      icon: "fas fa-chart-line",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      link: `${basePath}/reports/organization-upcoming-renewals`,
      count: companyUpcomingRenewalsCount,
    },
  ];

  // Show loading state
  if (!dataLoaded) {
    return (
      <div className="w-full overflow-x-hidden">
        <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Reports
          </h2>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {reportCards.map((card) => (
            <Link key={card.id} to={card.link} className="group block">
              <div
                className={`
                  bg-white dark:bg-gray-800 rounded-xl border 
                  ${
                    card.highlight
                      ? "border-red-300 dark:border-red-700 shadow-lg ring-2 ring-red-300 dark:ring-red-700/50"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                  } 
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg overflow-hidden
                `}
              >
                {/* Card Header with Icon */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}
                    >
                      <i
                        className={`${card.icon} ${card.iconColor} text-xl`}
                      ></i>
                    </div>
                    {card.count !== undefined && (
                      <div
                        className={`
                          text-2xl font-bold 
                          ${card.highlight ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}
                        `}
                      >
                        {card.count}
                      </div>
                    )}
                  </div>

                  {/* Card Title */}
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-1">
                    {card.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Reports;