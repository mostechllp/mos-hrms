import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminProfileAuthReducer from "../admin/store/slices/authSlice";
import employeeReducer from "../admin/store/slices/employeeSlice";
import notificationReducer from "../admin/store/slices/notificationSlice";
import organizationReducer from "../admin/store/slices/organizationSlice";
import companyReducer from "../admin/store/slices/companySlice";
import attendanceReducer from "../admin/store/slices/attendanceSlice";
import leaveReducer from "../admin/store/slices/LeaveSlice";
import designationReducer from "../admin/store/slices/designationSlice";
import taskReportReducer from "../admin/store/slices/taskReportSlice";
import dashboardReducer from "../admin/store/slices/dashboardSlice";
import departmentReducer from "../admin/store/slices/departmentSlice";
import documentsReducer from "../admin/store/slices/documentsSlice";
import wfhReducer from "../admin/store/slices/wfhSlice";
import onboardingReducer from "../admin/store/slices/onboardingSlice";
import offboardingReducer from "../admin/store/slices/offboardingSlice";
import assetReducer from "../admin/store/slices/assetSlice";
import checklistReducer from "../admin/store/slices/checklistSlice";
import roleReducer from "../admin/store/slices/roleSlice";
import settingsReducer from "../admin/store/slices/settingsSlice";
import checklistCategoryReducer from "../admin/store/slices/checklistCategorySlice";
import taskReducer from "../admin/store/slices/tasksSlice";
import projectReducer from "../admin/store/slices/projectsSlice";
import moduleReducer from "../admin/store/slices/moduleSlice";
import reportReducer from "../admin/store/slices/reportSlice";
import payrollReducer from "../admin/store/slices/payrollSlice";
import publicHolidayReducer from "../admin/store/slices/publicHolidaySlice";
import warningReducer from "../admin/store/slices/warningSlice";
import leavePolicyReducer from "../admin/store/slices/leavePolicySlice";
import proposalReducer from "../admin/store/slices/proposalSlice";
import leadReducer from "../admin/store/slices/leadSlice";
import customerReducer from "../admin/store/slices/customerSlice";
import activityReducer from "../admin/store/slices/activitySlice";
import quotationReducer from "../admin/store/slices/quotationSlice";
import opportunityReducer from "../admin/store/slices/opportunitySlice";
import productReducer from "../admin/store/slices/productSlice";
import crmReportReducer from "../admin/store/slices/crmReportSlice";
import crmSettingsReducer from "../admin/store/slices/crmSettingsSlice";
import crmDashboardReducer from "../admin/store/slices/crmDashboardSlice";
import meetingReducer from "../admin/store/slices/meetingSlice";
import accountsReducer from "../admin/store/slices/accounts/accountsSlice";
import itemsReducer from "../admin/store/slices/accounts/itemsSlice";
import customersReducer from "../admin/store/slices/accounts/customersSlice";
import quotesReducer from "../admin/store/slices/accounts/quotesSlice";
import salesOrdersReducer from "../admin/store/slices/accounts/salesOrdersSlice";
import invoicesReducer from "../admin/store/slices/accounts/invoicesSlice";
import recurringInvoicesReducer  from "../admin/store/slices/accounts/recurringInvoicesSlice";
import deliveryChallansReducer  from "../admin/store/slices/accounts/deliveryChallansSlice";
import paymentsReceivedReducer  from "../admin/store/slices/accounts/paymentsReceivedSlice";
import creditNotesReducer  from "../admin/store/slices/accounts/creditNotesSlice";
import vendorsReducer  from "../admin/store/slices/accounts/vendorsSlice";
import expensesReducer  from "../admin/store/slices/accounts/expensesSlice";

// Employee reducers
import leavesReducer from "../employee/store/slices/leavesSlice";
import tasksReducer from "../employee/store/slices/myTasksSlice";
import notesReducer from "../employee/store/slices/notesSlice";
import themeReducer from "../employee/store/slices/themeSlice";
import EmpWfhReducer from "../employee/store/slices/wfhSlice";
import taskReportsReducer from "../employee/store/slices/taskReportsSlice";
import EmpAttendanceReducer from "../employee/store/slices/attendanceSlice";
import EmpAttendanceTypeReducer from "../employee/store/slices/attendanceTypeSlice";
import employeeTasksReducer from "../employee/store/slices/taskSlice";
import myPayrollReducer from "../employee/store/slices/myPayrollSlice";
import employeeWarningReducer from "../employee/store/slices/employeeWarningSlice";
import employeeMeetingReducer from "../employee/store/slices/employeeMeetingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProfileAuth: adminProfileAuthReducer,
    employees: employeeReducer,
    notifications: notificationReducer,
    organizations: organizationReducer,
    companies: companyReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    designations: designationReducer,
    taskReports: taskReportReducer,
    dashboard: dashboardReducer,
    departments: departmentReducer,
    documents: documentsReducer,
    wfh: wfhReducer,
    onboarding: onboardingReducer,
    offboarding: offboardingReducer,
    assets: assetReducer,
    checklist: checklistReducer,
    checklistCategory: checklistCategoryReducer,
    roles: roleReducer,
    modules: moduleReducer,
    tasks: taskReducer,
    projects: projectReducer,
    settings: settingsReducer,
    reports: reportReducer,
    payroll: payrollReducer,
    publicHolidays: publicHolidayReducer,
    warnings: warningReducer,
    leavePolicies: leavePolicyReducer,
    proposals: proposalReducer,
    leads: leadReducer,
    customers: customerReducer,
    activities: activityReducer,
    quotations: quotationReducer,
    opportunities: opportunityReducer,
    products: productReducer,
    crmReports: crmReportReducer,
    crmSettings: crmSettingsReducer,
    crmDashboard: crmDashboardReducer,
    meetings: meetingReducer,
    accounts: accountsReducer,
    items: itemsReducer,
    accountCustomers: customersReducer,
    quotes: quotesReducer,
    salesOrders: salesOrdersReducer,
    invoices: invoicesReducer,
    recurringInvoices: recurringInvoicesReducer,
    deliveryChallans: deliveryChallansReducer,
    paymentsReceived: paymentsReceivedReducer,
    creditNotes: creditNotesReducer,
    vendors: vendorsReducer,
    expenses: expensesReducer,

    // Employee
    EmpLeaves: leavesReducer,
    myTasks: tasksReducer,
    notes: notesReducer,
    theme: themeReducer,
    EmpWfh: EmpWfhReducer,
    EmpTaskReports: taskReportsReducer,
    EmpAttendance: EmpAttendanceReducer,
    EmpAttendanceType: EmpAttendanceTypeReducer,
    employeeTasks: employeeTasksReducer,
    myPayroll: myPayrollReducer,
    employeeWarnings: employeeWarningReducer,
    employeeMeetings: employeeMeetingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
