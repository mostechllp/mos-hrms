import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import { showToast } from "../../../components/common/Toast";
import Pagination from "../common/Paginations";
import { 
  fetchEmployeeDetailsReport,
  exportReport
} from "../../store/slices/reportSlice";
import ExportModal from "../../../components/common/ExportModal";
import { formatDate } from "../../../utils/reportUtils";

const EmployeeDetailsReport = () => {
  const dispatch = useDispatch();
  const { 
    employeeDetails: employees = [],
    employeeDetailsLoading: loading = false,
    employeeDetailsTotalCount: totalCount = 0,
    employeeDetailsLastPage: lastPage = 1,
    exportLoading = false,
  } = useSelector((state) => state.reports || {});

  // Local state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter states
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch employee details report
  useEffect(() => {
    dispatch(
      fetchEmployeeDetailsReport({
        page: currentPage,
        per_page: perPage,
        company: selectedCompany || undefined,
        department: selectedDepartment || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchTerm || undefined,
      })
    );
  }, [dispatch, currentPage, perPage, selectedCompany, selectedDepartment, selectedStatus, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCompany, selectedDepartment, selectedStatus, perPage]);

  // Transform employee data
  const transformEmployee = (emp) => {
    return {
      id: emp.id || emp.employee_id,
      emp_id: emp.employee_id || emp.emp_id || "-",
      name: emp.name || emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || "-",
      company_name: emp.company || emp.company_name || emp.organization || "-",
      department_name: emp.department || emp.department_name || "-",
      designation_name: emp.designation || emp.designation_name || "-",
      passport_no: emp.passport_number || emp.passport_no || "-",
      passport_expiry: emp.passport_expiry_date || emp.passport_expiry,
      visa_no: emp.visa_number || emp.visa_no || "-",
      visa_expiry: emp.visa_expiry_date || emp.visa_expiry,
      labor_no: emp.labor_number || emp.labor_no || "-",
      labor_expiry: emp.labor_expiry_date || emp.labor_expiry,
      eid_no: emp.eid_number || emp.eid_no || "-",
      eid_expiry: emp.eid_expiry_date || emp.eid_expiry,
      joining_date: emp.joining_date,
      email: emp.email || emp.company_email || emp.personal_email || "-",
      phone: emp.phone || emp.company_mobile_number || emp.personal_number || "-",
      status: emp.status || emp.employee_status || "Active",
      dob: emp.dob,
      gender: emp.gender,
    };
  };

  const transformedEmployees = Array.isArray(employees)
    ? employees.map(transformEmployee)
    : [];

  // Get unique companies and departments for filters
  const uniqueCompanies = [
    ...new Set(
      transformedEmployees
        .map((emp) => emp.company_name)
        .filter((c) => c !== "-"),
    ),
  ];
  const uniqueDepartments = [
    ...new Set(
      transformedEmployees
        .map((emp) => emp.department_name)
        .filter((d) => d !== "-"),
    ),
  ];

  // Filter employees (client-side for display)
  const getFilteredEmployees = () => {
    let filtered = [...transformedEmployees];

    if (selectedCompany) {
      filtered = filtered.filter((emp) => emp.company_name === selectedCompany);
    }

    if (selectedDepartment) {
      filtered = filtered.filter(
        (emp) => emp.department_name === selectedDepartment,
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((emp) => emp.status === selectedStatus);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          (emp.emp_id || "").toLowerCase().includes(searchLower) ||
          (emp.name || "").toLowerCase().includes(searchLower) ||
          (emp.company_name || "").toLowerCase().includes(searchLower) ||
          (emp.department_name || "").toLowerCase().includes(searchLower) ||
          (emp.designation_name || "").toLowerCase().includes(searchLower) ||
          (emp.passport_no || "").toLowerCase().includes(searchLower) ||
          (emp.visa_no || "").toLowerCase().includes(searchLower) ||
          (emp.email || "").toLowerCase().includes(searchLower) ||
          (emp.phone || "").toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();
  const totalFiltered = totalCount || filteredEmployees.length;
  const totalPages = lastPage || Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageEmployees = filteredEmployees.slice(start, start + perPage);

  const handleResetFilters = () => {
    setSelectedCompany("");
    setSelectedDepartment("");
    setSelectedStatus("all");
    setSearchTerm("");
    setCurrentPage(1);
    showToast("Filters reset successfully", "success");
  };

  // Handle export using the exportReport thunk
  const handleExport = async (format) => {
    // Build export parameters
    const params = {
      format: format,
    };

    // Add filters
    if (selectedCompany) {
      params.company = selectedCompany;
    }
    if (selectedDepartment) {
      params.department = selectedDepartment;
    }
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }

    // Dispatch the export thunk with report_type: "employee-details"
    const result = await dispatch(exportReport({
      reportType: "employee-details", // This is the report_type for employee details
      params: params,
      format: format,
    }));
    
    if (exportReport.fulfilled.match(result)) {
      const { url, filename } = result.payload;
      
      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL after download
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showToast(`Employee details report exported successfully!`, "success");
    } else {
      showToast(result.payload || "Failed to export report", "error");
    }
  };

  const getExpiryClass = (expiryDate) => {
    if (!expiryDate) return "";
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
      return "text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded";
    if (diffDays <= 30)
      return "text-amber-500 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded";
    return "";
  };

  const activeCount = transformedEmployees.filter(
    (e) => e.status === "Active",
  ).length;
  const inactiveCount = transformedEmployees.filter(
    (e) => e.status === "Inactive",
  ).length;

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
            <Link
              to="/admin/reports"
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Reports
            </Link>
            <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
            <span className="text-gray-500">Employee details report</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
            Employee Details Report
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete employee information including personal, professional, and
            document details
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Employees
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalCount || transformedEmployees.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active Employees
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {activeCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-check text-green-600 dark:text-green-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Inactive Employees
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {inactiveCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-slash text-red-600 dark:text-red-400"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Company Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-building mr-1"></i> Company
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-diagram-project mr-1"></i> Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                <i className="fas fa-circle mr-1"></i> Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <i className="fas fa-undo-alt"></i> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
          <EntriesSelector
            value={perPage}
            onChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SearchBar
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID, company, email, phone..."
            />
            <button
              onClick={() => setShowExportModal(true)}
              disabled={exportLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Exporting...</>
              ) : (
                <><i className="fas fa-download"></i> Export Report</>
              )}
            </button>
          </div>
        </div>

        {/* Employees Table */}
        {loading && pageEmployees.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
            <p className="text-gray-500 dark:text-gray-400">
              Loading employees...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[1200px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      S.No
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Emp ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Company
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Department
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Designation
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Passport No
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Passport Expiry
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Visa No
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Visa Expiry
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Labor No
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Labor Expiry
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      EID No
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      EID Expiry
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Joining Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageEmployees.length > 0 ? (
                    pageEmployees.map((emp, idx) => (
                      <tr
                        key={emp.id || idx}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                          {start + idx + 1}
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                          {emp.emp_id}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {emp.name}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {emp.company_name}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {emp.department_name}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {emp.designation_name}
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {emp.passport_no}
                        </td>
                        <td
                          className={`px-3 py-3 text-sm ${getExpiryClass(emp.passport_expiry)}`}
                        >
                          {formatDate(emp.passport_expiry)}
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {emp.visa_no}
                        </td>
                        <td
                          className={`px-3 py-3 text-sm ${getExpiryClass(emp.visa_expiry)}`}
                        >
                          {formatDate(emp.visa_expiry)}
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {emp.labor_no}
                        </td>
                        <td
                          className={`px-3 py-3 text-sm ${getExpiryClass(emp.labor_expiry)}`}
                        >
                          {formatDate(emp.labor_expiry)}
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {emp.eid_no}
                        </td>
                        <td
                          className={`px-3 py-3 text-sm ${getExpiryClass(emp.eid_expiry)}`}
                        >
                          {formatDate(emp.eid_expiry)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(emp.joining_date)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {emp.email}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {emp.phone}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              emp.status === "Active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : emp.status === "Onboarding"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="18"
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalFiltered > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalFiltered}
            itemsPerPage={perPage}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          if (!exportLoading) {
            setShowExportModal(false);
          }
        }}
        onExport={handleExport}
        title="Export Employee Details"
        totalRecords={totalCount || filteredEmployees.length}
        formats={["csv", "pdf"]}
        defaultFormat="csv"
        loading={exportLoading}
        subtitle={`Exporting ${totalCount || filteredEmployees.length} employee records with current filters`}
      />
    </div>
  );
};

export default EmployeeDetailsReport;