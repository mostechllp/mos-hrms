// src/admin/pages/EmployeeDetails.js - Full code with dark theme support

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/common/Toast";
import { fetchEmployeeById } from "@admin/store/slices/employeeSlice";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiFileText,
  FiDownload,
  FiEdit,
  FiArrowLeft,
  FiXCircle,
  FiCreditCard,
  FiPhoneCall,
  FiFlag,
  FiHeart,
  FiHome,
  FiCalendar,
  FiAward,
  FiMapPin,
} from "react-icons/fi";
import { FaIdCard, FaVenusMars, FaPassport, FaBuilding } from "react-icons/fa";
import { fetchOrganizations } from "../store/slices/organizationSlice";
import { fetchCompanies } from "../store/slices/companySlice";
import { fetchRoles } from "../store/slices/roleSlice";
import {
  getCountryConfig,
  INDIA_EMPLOYEE_TYPES,
  UAE_EMPLOYEE_TYPES,
} from "../utils/countryConfig";

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedCountry, setSelectedCountry] = useState("UAE");
  const [countryConfig, setCountryConfig] = useState(getCountryConfig("UAE"));

  const { currentEmployee } = useSelector((state) => state.employees || {});
  const { organizations = [] } = useSelector(
    (state) => state.organizations || {},
  );
  const { roles = [] } = useSelector((state) => state.roles || {});
  const { companies = [] } = useSelector((state) => state.companies || {});

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchCompanies());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (currentEmployee && companies.length > 0) {
      const companyId = currentEmployee.user?.company?.id || currentEmployee.user?.company_id;
      if (companyId) {
        const company = companies.find((comp) => comp.id === parseInt(companyId));
        if (company) {
          const companyCountry = company?.country || company?.raw?.country || "UAE";
          let normalizedCountry = companyCountry;
          if (companyCountry === "AE") {
            normalizedCountry = "UAE";
          } else if (companyCountry === "IN" || companyCountry === "India") {
            normalizedCountry = "India";
          }
          setSelectedCountry(normalizedCountry);
          setCountryConfig(getCountryConfig(normalizedCountry));
        }
      }
    }
  }, [currentEmployee, companies]);

  const getOrganizationName = (organizationId) => {
    if (!organizationId) return "N/A";
    const org = organizations.find(
      (org) => org.id === parseInt(organizationId),
    );
    return org?.name || "N/A";
  };

  const getRoleName = (roleId) => {
    if (!roleId) return "N/A";
    const role = roles.find((role) => role.id === parseInt(roleId));
    return role?.name || `Role ID: ${roleId}`;
  };

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchEmployeeById(id));
    } catch (error) {
      showToast("Failed to load employee details", error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}/storage/${documentPath}`;
  };

  const getPhotoUrl = (photoValue) => {
    if (!photoValue) return null;

    if (photoValue.startsWith("/tmp/")) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
      return `${baseUrl}/storage/temp/${photoValue.replace("/tmp/", "")}`;
    }

    if (photoValue.startsWith("data:")) return photoValue;
    if (photoValue.startsWith("http://") || photoValue.startsWith("https://"))
      return photoValue;

    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

    if (photoValue.startsWith("/storage/")) return `${baseUrl}${photoValue}`;

    if (!photoValue.includes("/")) {
      return `${baseUrl}/storage/avatars/${photoValue}`;
    }

    return `${baseUrl}/storage/${photoValue}`;
  };

  const getEmployeePhoto = () => {
    const possiblePhotoFields = [
      currentEmployee?.avatar,
      currentEmployee?.avatar_path,
      currentEmployee?.passport_size_photo,
      currentEmployee?.profile_photo,
      currentEmployee?.photo,
      currentEmployee?.user?.avatar,
      currentEmployee?.user?.avatar_path,
    ];

    for (const fieldValue of possiblePhotoFields) {
      if (fieldValue && typeof fieldValue === "string") {
        const resolvedPhoto = getPhotoUrl(fieldValue);
        if (resolvedPhoto) return resolvedPhoto;
      }
    }

    if (currentEmployee?.avatar && typeof currentEmployee.avatar === "object") {
      if (currentEmployee.avatar.path) {
        return getPhotoUrl(currentEmployee.avatar.path);
      }
    }

    return null;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString("en-GB");
      }

      if (typeof dateValue === "string") {
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateValue.split("-");
          return `${day}/${month}/${year}`;
        }

        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-GB");
        }
      }

      return dateValue;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const formatSpecialDays = (specialDays) => {
    if (!specialDays) return null;

    try {
      let days = specialDays;

      if (typeof specialDays === "string") {
        try {
          days = JSON.parse(specialDays);
        } catch (e) {
          console.error("Failed to parse special days string:", e);
          return null;
        }
      }

      if (Array.isArray(days) && days.length > 0) {
        return days.map((day) => ({
          name: day.name,
          date: day.date ? formatDate(day.date) : "No date",
        }));
      }

      if (days && days.special_days && Array.isArray(days.special_days)) {
        return days.special_days.map((day) => ({
          name: day.name,
          date: day.date ? formatDate(day.date) : "No date",
        }));
      }

      return null;
    } catch (e) {
      console.error("Error formatting special days:", e);
      return null;
    }
  };

  const isSkilled = () => {
    return (
      currentEmployee?.is_skilled === 1 || currentEmployee?.is_skilled === true
    );
  };

  const getTabs = () => {
    const baseTabs = [
      { id: "basic", label: "Basic Info", icon: <FiUser /> },
    ];

    if (selectedCountry === "UAE") {
      baseTabs.push(
        { id: "passport", label: "Passport", icon: <FaPassport /> },
        { id: "visa", label: "Visa & Labor", icon: <FiCreditCard /> },
        { id: "eid", label: "EID", icon: <FaIdCard /> }
      );
    } else {
      baseTabs.push(
        { id: "identity", label: "Identity Docs", icon: <FaIdCard /> }
      );
    }

    baseTabs.push(
      { id: "contact", label: "Contact", icon: <FiPhoneCall /> },
      { id: "documents", label: "Documents", icon: <FiFileText /> }
    );

    return baseTabs;
  };

  const tabs = getTabs();

  const getDocumentFields = () => {
    if (selectedCountry === "UAE") {
      return [
        { key: "passport_1st_page", label: "Passport 1st Page", icon: "fas fa-passport" },
        { key: "passport_2nd_page", label: "Passport 2nd Page", icon: "fas fa-passport" },
        { key: "passport_outer_page", label: "Passport Outer", icon: "fas fa-passport" },
        { key: "passport_id_page", label: "Passport ID", icon: "fas fa-id-card" },
        { key: "visa_page", label: "Visa Page", icon: "fas fa-file-contract" },
        { key: "labor_card", label: "Labor Card", icon: "fas fa-id-card" },
        { key: "labor_contract", label: "Labor Contract", icon: "fas fa-file-signature" },
        { key: "eid_1st_page", label: "EID Front Side", icon: "fas fa-id-card" },
        { key: "eid_2nd_page", label: "EID Back Side", icon: "fas fa-id-card" },
        { key: "educational_1st_page", label: "Educational Certificate (Front)", icon: "fas fa-graduation-cap" },
        { key: "educational_2nd_page", label: "Educational Certificate (Back)", icon: "fas fa-graduation-cap" },
        { key: "home_country_id_proof", label: "Home Country ID Proof", icon: "fas fa-home" },
      ];
    } else {
      return [
        { key: "aadhar_photo", label: "Aadhaar Card Photo", icon: "fas fa-id-card" },
        { key: "pan_photo", label: "PAN Card Photo", icon: "fas fa-id-card" },
        { key: "voter_id", label: "Voter ID", icon: "fas fa-id-card" },
        { key: "driving_license", label: "Driving License", icon: "fas fa-id-card" },
        { key: "passport_india", label: "Passport (India)", icon: "fas fa-passport" },
        { key: "educational_1st_page", label: "Educational Certificate (Front)", icon: "fas fa-graduation-cap" },
        { key: "educational_2nd_page", label: "Educational Certificate (Back)", icon: "fas fa-graduation-cap" },
        { key: "home_country_id_proof", label: "Home Country ID Proof", icon: "fas fa-home" },
      ];
    }
  };

  const documentFields = getDocumentFields();

  const getIdentityFields = () => {
    return [
      { key: "aadhar_number", label: "Aadhaar Number", icon: <FaIdCard /> },
      { key: "pan_number", label: "PAN Number", icon: <FaIdCard /> },
      { key: "voter_id_number", label: "Voter ID Number", icon: <FaIdCard /> },
      { key: "driving_license_number", label: "Driving License Number", icon: <FaIdCard /> },
      { key: "passport_india_number", label: "Passport Number", icon: <FaPassport /> },
    ];
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-hidden">
        <main className="content px-4 py-4 md:px-6 md:py-6">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="w-full overflow-x-hidden">
        <main className="content px-4 py-4 md:px-6 md:py-6">
          <div className="text-center py-12">
            <FiUser className="text-6xl text-[var(--muted)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text)]">
              Employee not found
            </h3>
            <button
              onClick={() => navigate("/admin/employees")}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Back to Employees
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/admin/employees")}
                  className="p-2 hover:bg-[var(--surface2)] rounded-lg transition-colors"
                  title="Back to Employees"
                >
                  <FiArrowLeft className="text-[var(--text)] text-xl" />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
                    Employee Details
                  </h1>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    View complete employee information
                  </p>
                </div>
              </div>
              <Link
                to={`/admin/employees/edit/${currentEmployee.id}`}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FiEdit /> Edit Employee
              </Link>
            </div>
          </div>

          {/* Profile Summary Card - FIXED DARK THEME */}
          <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {getEmployeePhoto() ? (
                <img
                  src={getEmployeePhoto()}
                  alt={`${currentEmployee.first_name || "Employee"} photo`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-green-100 dark:border-green-800 shadow-md"
                  onError={(e) => {
                    console.error("Failed to load image:", getEmployeePhoto());
                    e.target.style.display = "none";
                    e.target.parentElement.querySelector(
                      ".fallback-avatar",
                    ).style.display = "flex";
                  }}
                />
              ) : null}
              {!getEmployeePhoto() && (
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md fallback-avatar">
                  {currentEmployee.first_name?.charAt(0)}
                  {currentEmployee.last_name?.charAt(0)}
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  {currentEmployee.first_name} {currentEmployee.last_name}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                    {currentEmployee.user?.type?.toUpperCase() || "EMPLOYEE"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      currentEmployee.user?.status === "active"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : currentEmployee.user?.status === "onboarding"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {currentEmployee.user?.status === "active"
                      ? "Active"
                      : currentEmployee.user?.status === "onboarding"
                      ? "Onboarding"
                      : "Inactive"}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                    ID: {currentEmployee.employee_id}
                  </span>
                  {isSkilled() && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                      <FiAward className="inline mr-1" /> Skilled
                    </span>
                  )}
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold">
                    <FiMapPin className="inline mr-1" /> {selectedCountry}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 justify-center md:justify-start text-sm text-[var(--text)]">
                  <div className="flex items-center gap-1">
                    <FiMail className="text-green-500" />{" "}
                    {currentEmployee.personal_email || "N/A"}
                  </div>
                  <div className="flex items-center gap-1">
                    <FiPhone className="text-green-500" />{" "}
                    {currentEmployee.personal_number || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation - FIXED DARK THEME */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-6 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 flex items-center gap-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-[var(--surface2)]"
                      : "text-[var(--text)] hover:text-green-600 dark:hover:text-green-400 hover:bg-[var(--surface2)]"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - FIXED DARK THEME */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FiUser className="text-green-500" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.first_name} {currentEmployee.last_name}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Employee ID
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.employee_id}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Username
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.user?.username || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        User Type
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1 capitalize">
                        {currentEmployee.user?.type || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Employee Category
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {isSkilled() ? "Skilled" : "Unskilled"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Country
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {selectedCountry}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FaVenusMars /> Gender
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1 capitalize">
                        {currentEmployee.gender || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Date of Birth
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.dob
                          ? formatDate(currentEmployee.dob)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Joining Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.joining_date
                          ? formatDate(currentEmployee.joining_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiFlag /> Nationality
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.nationality || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiHeart /> Marital Status
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1 capitalize">
                        {currentEmployee.marital_status || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Dependents
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.dependents || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[var(--text)] mt-6 mb-4 flex items-center gap-2">
                  <FiBriefcase className="text-green-500" /> Organization
                  Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Organization
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {getOrganizationName(
                          currentEmployee.user?.organization_id,
                        )}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Company
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.user?.company?.company_name ||
                          currentEmployee.user?.company?.name ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Trade License Type
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1 capitalize">
                        {currentEmployee.user?.company?.trade_license || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Designation
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.user?.designation?.name || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Department
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.user?.department?.name || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Role
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {getRoleName(currentEmployee.user?.role_id)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Timeline & Dates Section */}
                <h3 className="text-lg font-semibold text-[var(--text)] mt-6 mb-4 flex items-center gap-2">
                  <FiCalendar className="text-green-500" /> Employment Timeline & Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Probation Start Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.probation_start_date
                          ? formatDate(currentEmployee.probation_start_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Probation End Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.probation_end_date
                          ? formatDate(currentEmployee.probation_end_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Confirmation Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.confirmation_date
                          ? formatDate(currentEmployee.confirmation_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Contract Start Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.contract_start_date
                          ? formatDate(currentEmployee.contract_start_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Contract End Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.contract_end_date
                          ? formatDate(currentEmployee.contract_end_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Resignation Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.resignation_date
                          ? formatDate(currentEmployee.resignation_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Notice Period Start Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.notice_period_start_date
                          ? formatDate(currentEmployee.notice_period_start_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Last Working Day (LWD)
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.last_working_day
                          ? formatDate(currentEmployee.last_working_day)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        <FiCalendar /> Relieving Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.relieving_date
                          ? formatDate(currentEmployee.relieving_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Days Section */}
                <h3 className="text-lg font-semibold text-[var(--text)] mt-6 mb-4 flex items-center gap-2">
                  <FiHeart className="text-green-500" /> Special Days
                </h3>
                <div className="border-t border-[var(--border)] pt-4">
                  {(() => {
                    const formattedSpecialDays = formatSpecialDays(
                      currentEmployee.special_days,
                    );
                    if (
                      !formattedSpecialDays ||
                      formattedSpecialDays.length === 0
                    ) {
                      return (
                        <p className="text-[var(--muted)]">
                          No special days recorded
                        </p>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formattedSpecialDays.map((day, index) => (
                          <div
                            key={index}
                            className="bg-[var(--surface2)] rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text)]">
                                {day.name}
                              </p>
                              <p className="text-sm text-[var(--muted)]">
                                {day.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Passport Information Tab (UAE only) */}
            {activeTab === "passport" && selectedCountry === "UAE" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FaPassport className="text-green-500" /> Passport Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Passport Full Name
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.passport_full_name || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Passport Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.passport_number || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Issued From
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.passport_issued_from || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Issued Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.passport_issued_date
                          ? formatDate(currentEmployee.passport_issued_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Expiry Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.passport_expiry_date
                          ? formatDate(currentEmployee.passport_expiry_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Place of Birth
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.place_of_birth || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Father's Name
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.father_name || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Mother's Name
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.mother_name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="border-b border-[var(--border)] pb-3">
                    <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                      <FiHome /> Address
                    </label>
                    <p className="text-[var(--text)] font-medium mt-1">
                      {currentEmployee.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Identity Documents Tab (India only) */}
            {activeTab === "identity" && selectedCountry === "India" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FaIdCard className="text-green-500" /> Identity Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getIdentityFields().map((field) => (
                    <div key={field.key} className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                        {field.icon} {field.label}
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee[field.key] || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa & Labor Tab (UAE only) */}
            {activeTab === "visa" && selectedCountry === "UAE" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-green-500" /> Visa Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Visa Type
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1 capitalize">
                        {currentEmployee.visa_type?.replace("_", " ") || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Visa Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.visa_number || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Visa Issued Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.visa_issued_date
                          ? formatDate(currentEmployee.visa_issued_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Visa Expiry Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.visa_expiry_date
                          ? formatDate(currentEmployee.visa_expiry_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Labor Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.labor_number || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Labor Issued Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.labor_issued_date
                          ? formatDate(currentEmployee.labor_issued_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Labor Expiry Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.labor_expiry_date
                          ? formatDate(currentEmployee.labor_expiry_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EID Tab (UAE only) */}
            {activeTab === "eid" && selectedCountry === "UAE" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FaIdCard className="text-green-500" /> Emirates ID Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        EID Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.eid_number || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        EID Issued Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.eid_issued_date
                          ? formatDate(currentEmployee.eid_issued_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        EID Expiry Date
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.eid_expiry_date
                          ? formatDate(currentEmployee.eid_expiry_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === "contact" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FiPhoneCall className="text-green-500" /> Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Company Email
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.company_email || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Personal Email
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.personal_email || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Company Mobile Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.company_mobile_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Personal Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.personal_number || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Other Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.other_number || "N/A"}
                      </p>
                    </div>
                    <div className="border-b border-[var(--border)] pb-3">
                      <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Home Country Number
                      </label>
                      <p className="text-[var(--text)] font-medium mt-1">
                        {currentEmployee.home_country_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab - FIXED DARK THEME */}
            {activeTab === "documents" && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <FiFileText className="text-green-500" /> Employee Documents
                  <span className="text-xs text-[var(--muted)] font-normal ml-2">
                    ({selectedCountry})
                  </span>
                </h3>

                {(currentEmployee.avatar || currentEmployee.avatar_path) && (
                  <div className="mb-6 p-4 bg-[var(--surface2)] rounded-lg">
                    <h4 className="font-semibold text-[var(--text)] mb-3">
                      Profile Photo
                    </h4>
                    <a
                      href={getEmployeePhoto()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <FiDownload /> View Profile Photo
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentFields.map((doc) => {
                    const documentPath = currentEmployee[doc.key];
                    const hasDocument =
                      documentPath && !currentEmployee[`remove_${doc.key}`];

                    return (
                      <div
                        key={doc.key}
                        className="border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <i
                              className={`${doc.icon} text-green-600 dark:text-green-400 text-lg`}
                            ></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[var(--text)] text-sm">
                              {doc.label}
                            </h4>
                            <p className="text-xs text-[var(--muted)]">
                              {hasDocument ? "Uploaded" : "Not Uploaded"}
                            </p>
                          </div>
                        </div>
                        {hasDocument ? (
                          <a
                            href={getDocumentUrl(documentPath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors w-full justify-center"
                          >
                            <FiDownload /> View Document
                          </a>
                        ) : (
                          <div className="text-center py-2 text-[var(--muted)] text-sm">
                            <FiXCircle className="inline mr-1" /> No document
                            uploaded
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDetails;