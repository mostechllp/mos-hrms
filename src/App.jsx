import { lazy, useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "./admin/hooks/useTheme";
import { useSelector } from "react-redux";
import GlobalUploadStatus from "./admin/components/common/GlobalUploadStatus";
import Loader from "./admin/components/common/Loader";

// Import shared components
import ProtectedRoute from "./shared/components/ProtectedRoute";
import RouteChangeLoader from "./components/common/RouteChangeLoader";

// Lazy load layouts
const AdminLayout = lazy(() => import("./shared/layouts/AdminLayout"));
const EmployeeLayout = lazy(() => import("./shared/layouts/EmployeeLayout"));

// Lazy load pages - Admin
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./admin/pages/Dashboard"));
const Employees = lazy(() => import("./admin/pages/Employees"));
const AddEmployee = lazy(() => import("./admin/pages/AddEmployee"));
const EditEmployee = lazy(() => import("./admin/pages/EditEmployee"));
const EmployeeDetails = lazy(() => import("./admin/pages/EmployeeDetails"));
const Organizations = lazy(() => import("./admin/pages/Organizations"));
const AddOrganization = lazy(() => import("./admin/pages/AddOrganization"));
const EditOrganization = lazy(() => import("./admin/pages/EditOrganization"));
const Companies = lazy(() => import("./admin/pages/Companies"));
const AddCompany = lazy(() => import("./admin/pages/AddCompany"));
const EditCompany = lazy(() => import("./admin/pages/EditCompany"));
const Agreements = lazy(() => import("./admin/pages/Agreements"));
const AddAgreement = lazy(() => import("./admin/pages/AddAgreement"));
const AddDocument = lazy(() => import("./admin/pages/AddDocument"));
const Attendances = lazy(() => import("./admin/pages/Attendances"));
const Leaves = lazy(() => import("./admin/pages/Leaves"));
const LeaveTypeManagement = lazy(() => import("./admin/pages/LeaveTypeManagement"));
const LeaveAllocations = lazy(() => import("./admin/pages/LeaveAllocations"));
const EditLeaveAllocation = lazy(() => import("./admin/pages/EditLeaveAllocation"));
const Designations = lazy(() => import("./admin/pages/Designations"));
const Departments = lazy(() => import("./admin/pages/Departments"));
const TaskReports = lazy(() => import("./admin/pages/TaskReports"));
const Reports = lazy(() => import("./admin/pages/Reports"));
const EmployeeDetailsReport = lazy(() => import("./admin/components/reports/EmployeeDetailsReport"));
const AttendanceReport = lazy(() => import("./admin/components/reports/AttendanceReport"));
const LeaveRequestReport = lazy(() => import("./admin/components/reports/LeaveRequestsReports"));
const PendingLeaveReport = lazy(() => import("./admin/components/reports/PendingLeavesReport"));
const EmployeeNearestExpiryReport = lazy(() => import("./admin/components/reports/EmployeeNearestExpiryReport"));
const EmployeeUpcomingRenewalReport = lazy(() => import("./admin/components/reports/EmployeeUpcomingRenewalsReport"));
const OrgNearestExpiryReport = lazy(() => import("./admin/components/reports/CompanyNearestExpiryReport"));
const OrgUpcomingRenewalReport = lazy(() => import("./admin/components/reports/CompanyUpcomingRenewalsReport"));
const AdminWFH = lazy(() => import("./admin/pages/WFH"));
const Settings = lazy(() => import("./admin/pages/Settings"));
const RoleManagement = lazy(() => import("./admin/pages/RoleManagement"));
const AddPayroll = lazy(() => import("./admin/pages/AddPayroll"));

// Lazy load pages - Employee
const EmployeeDashboard = lazy(() => import("./employee/pages/Dashboard"));
const EmployeeLeaves = lazy(() => import("./employee/pages/Leaves"));
const RequestLeave = lazy(() => import("./employee/pages/RequestLeave"));
const EmployeeProfile = lazy(() => import("./employee/pages/Profile"));
const EmployeeWFH = lazy(() => import("./employee/pages/WFH"));
const EmployeeTaskReports = lazy(() => import("./employee/pages/TaskReports"));
const AttendanceRequests = lazy(() => import("./employee/pages/AttendanceRequests"));

function App() {
  const { theme } = useTheme();
  const { isAuthenticated, userType, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <RouteChangeLoader>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - with AdminLayout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/add-employee" element={<AddEmployee />} />
            <Route path="employees/edit/:id" element={<EditEmployee />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/add-organization" element={<AddOrganization />} />
            <Route path="organizations/edit-organization/:id" element={<EditOrganization />} />
            <Route path="organizations/:organizationId/companies" element={<Companies />} />
            <Route path="organizations/:organizationId/add-company" element={<AddCompany />} />
            <Route path="organizations/:organizationId/edit-company/:id" element={<EditCompany />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="agreements/add-agreement" element={<AddAgreement />} />
            <Route path="agreements/add-document" element={<AddDocument />} />
            <Route path="attendances" element={<Attendances />} />
            <Route path="designations" element={<Designations />} />
            <Route path="departments" element={<Departments />} />
            <Route path="task-reports" element={<TaskReports />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/employee-details" element={<EmployeeDetailsReport />} />
            <Route path="reports/attendance-reports" element={<AttendanceReport />} />
            <Route path="reports/leave-requests-reports" element={<LeaveRequestReport />} />
            <Route path="reports/pending-leaves-reports" element={<PendingLeaveReport />} />
            <Route path="reports/employee-near-expiry" element={<EmployeeNearestExpiryReport />} />
            <Route path="reports/employee-upcoming-renewals" element={<EmployeeUpcomingRenewalReport />} />
            <Route path="reports/organization-near-expiry" element={<OrgNearestExpiryReport />} />
            <Route path="reports/organization-upcoming-renewals" element={<OrgUpcomingRenewalReport />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="leaves/leave-types" element={<LeaveTypeManagement />} />
            <Route path="leaves/allocations" element={<LeaveAllocations />} />
            <Route path="leaves/allocations/:id" element={<EditLeaveAllocation />} />
            <Route path="payroll/add" element={<AddPayroll />} />
            <Route path="wfh" element={<AdminWFH />} />
            <Route path="settings" element={<Settings />} />
            <Route path="role-management" element={<RoleManagement />} />
          </Route>

          {/* Employee Routes - with EmployeeLayout */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute requiredType="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="leaves" element={<EmployeeLeaves />} />
            <Route path="request-leave" element={<RequestLeave />} />
            <Route path="wfh" element={<EmployeeWFH />} />
            <Route path="task-reports" element={<EmployeeTaskReports />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="attendance-requests" element={<AttendanceRequests />} />
          </Route>

          {/* Default redirect based on user type */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={userType === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <GlobalUploadStatus />
    </RouteChangeLoader>
  );
}

export default App;