import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";   
import { useTheme } from "./hooks/useTheme";
import RouteChangeLoader from "./components/common/RouteChangeLoader";
import { useSelector } from "react-redux";
import GlobalUploadStatus from "./components/common/GlobalUploadStatus";

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const AddEmployee = lazy(() => import("./pages/AddEmployee"));
const EditEmployee = lazy(() => import("./pages/EditEmployee"));
const EmployeeDetails = lazy(() => import("./pages/EmployeeDetails"));
const Organizations = lazy(() => import("./pages/Organizations"));
const AddOrganization = lazy(() => import("./pages/AddOrganization"));
const EditOrganization = lazy(() => import("./pages/EditOrganization"));
const Companies = lazy(() => import("./pages/Companies"));
const AddCompany = lazy(() => import("./pages/AddCompany"));
const EditCompany = lazy(() => import("./pages/EditCompany"));
const Agreements = lazy(() => import("./pages/Agreements"));
const AddAgreement = lazy(() => import("./pages/AddAgreement"));
const AddDocument = lazy(() => import("./pages/AddDocument"));
const Attendances = lazy(() => import("./pages/Attendances"));
const Leaves = lazy(() => import("./pages/Leaves"));
const LeaveTypeManagement = lazy(() => import("./pages/LeaveTypeManagement"));
const Designations = lazy(() => import("./pages/Designations"));
const Departments = lazy(() => import("./pages/Departments"))
const TaskReports = lazy(() => import("./pages/TaskReports"));
const Reports = lazy(() => import('./pages/Reports'));
const EmployeeDetailsReport = lazy(() => import('./components/reports/EmployeeDetailsReport'));
const AttendanceReport = lazy(() => import('./components/reports/AttendanceReport'));
const LeaveRequestReport = lazy(() => import('./components/reports/LeaveRequestsReports'));
const PendingLeaveReport = lazy(() => import('./components/reports/PendingLeavesReport'));
const EmployeeNearestExpiryReport = lazy(() => import('./components/reports/EmployeeNearestExpiryReport'));
const EmployeeUpcomingRenewalReport = lazy(() => import('./components/reports/EmployeeUpcomingRenewalsReport'));
const OrgNearestExpiryReport = lazy(() => import('./components/reports/CompanyNearestExpiryReport'));
const OrgUpcomingRenewalReport = lazy(() => import('./components/reports/CompanyUpcomingRenewalsReport'));
const AdminWFH = lazy(() => import('./pages/WFH'));
const Settings = lazy(() => import("./pages/Settings"));

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader fullScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <RouteChangeLoader>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <PrivateRoute>
              <Employees />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees/add-employee"
          element={
            <PrivateRoute>
              <AddEmployee />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees/edit/:id"
          element={
            <PrivateRoute>
              <EditEmployee />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <PrivateRoute>
              <EmployeeDetails />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizations"
          element={
            <PrivateRoute>
              <Organizations />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations/add-organization"
          element={
            <PrivateRoute>
              <AddOrganization />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations/edit-organization/:id"
          element={
            <PrivateRoute>
              <EditOrganization />
            </PrivateRoute>
          }
        />
          <Route
            path="/organizations/:organizationId/companies"
            element={
              <PrivateRoute>
                <Companies />
              </PrivateRoute>
            }
          />
        <Route
          path="/organizations/:organizationId/add-company"
          element={
            <PrivateRoute>
              <AddCompany />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations/:organizationId/edit-company/:id"
          element={
            <PrivateRoute>
              <EditCompany />
            </PrivateRoute>
          }
        />
        <Route
          path="/agreements"
          element={
            <PrivateRoute>
              <Agreements />
            </PrivateRoute>
          }
        />
        <Route
          path="/agreements/add-agreement"
          element={
            <PrivateRoute>
              <AddAgreement />
            </PrivateRoute>
          }
        />
        <Route
          path="/agreements/add-document"
          element={
            <PrivateRoute>
              <AddDocument />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendances"
          element={
            <PrivateRoute>
              <Attendances />
            </PrivateRoute>
          }
        />
        <Route
          path="/designations"
          element={
            <PrivateRoute>
              <Designations />
            </PrivateRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <PrivateRoute>
              <Departments />
            </PrivateRoute>
          }
        />
        <Route
          path="/task-reports"
          element={
            <PrivateRoute>
              <TaskReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/employee-details"
          element={
            <PrivateRoute>
              <EmployeeDetailsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/attendance-reports"
          element={
            <PrivateRoute>
              <AttendanceReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/leave-requests-reports"
          element={
            <PrivateRoute>
              <LeaveRequestReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/pending-leaves-reports"
          element={
            <PrivateRoute>
              <PendingLeaveReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/employee-near-expiry"
          element={
            <PrivateRoute>
              <EmployeeNearestExpiryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/employee-upcoming-renewals"
          element={
            <PrivateRoute>
              <EmployeeUpcomingRenewalReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/organization-near-expiry"
          element={
            <PrivateRoute>
              <OrgNearestExpiryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/organization-upcoming-renewals"
          element={
            <PrivateRoute>
              <OrgUpcomingRenewalReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <PrivateRoute>
              <Leaves />
            </PrivateRoute>
          }
        />
        <Route
          path="/leaves/leave-types"
          element={
            <PrivateRoute>
              <LeaveTypeManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/wfh"
          element={
            <PrivateRoute>
              <AdminWFH />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
      </Routes>
      <GlobalUploadStatus />
    </RouteChangeLoader>
  );
}

export default App;
