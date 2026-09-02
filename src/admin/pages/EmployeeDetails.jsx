// src/admin/pages/EmployeeDetails.js - Full code with Salary Components & Bank Details (No Packages)

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
  FiDollarSign,
  FiSave,
  FiTrash2,
  FiPlus,
  FiX,
  FiCreditCard as FiCreditCardIcon,
  FiGlobe as FiGlobeIcon,
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
import apiClient from "../../utils/apiClient";
import ConfirmModal from "../components/common/ConfirmModal";

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedCountry, setSelectedCountry] = useState("UAE");
  const [countryConfig, setCountryConfig] = useState(getCountryConfig("UAE"));
  
  // ─── Salary Component State ────────────────────────────────────────────
  const [editingComponent, setEditingComponent] = useState(null);
  const [editingBankDetail, setEditingBankDetail] = useState(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newComponent, setNewComponent] = useState({
    component_name: "",
    value: "",
  });
  const [newBank, setNewBank] = useState({
    bank_country: "India",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    iban_number: "",
    swift_code: "",
  });

  // ─── Confirm Modal State ──────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: "",
    message: "",
    loading: false,
  });

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

  // ─── Component Helpers ──────────────────────────────────────────────────
  const getEmployeeComponents = () => {
    return currentEmployee.salary_components || currentEmployee.components || [];
  };

  const getTotalSalary = () => {
    const components = getEmployeeComponents();
    return components.reduce((sum, comp) => sum + parseFloat(comp.value || 0), 0);
  };

  // ─── Delete Handlers ──────────────────────────────────────────────────
  const handleDeleteComponentClick = (componentId, componentName) => {
    setConfirmModal({
      isOpen: true,
      type: "component",
      id: componentId,
      title: "Delete Salary Component",
      message: `Are you sure you want to delete "${componentName}"? This action cannot be undone.`,
      loading: false,
    });
  };

  const handleDeleteBankDetailClick = (bankId, bankName) => {
    setConfirmModal({
      isOpen: true,
      type: "bank",
      id: bankId,
      title: "Delete Bank Account",
      message: `Are you sure you want to delete "${bankName}" bank account? This action cannot be undone.`,
      loading: false,
    });
  };

  // ─── Execute Delete ──────────────────────────────────────────────────
  const executeDelete = async () => {
    const { type, id } = confirmModal;

    setConfirmModal((prev) => ({ ...prev, loading: true }));

    try {
      if (type === "component") {
        const response = await apiClient.delete(
          `/admin/salary-components/${id}`,
        );
        if (response.data.status === "success") {
          showToast("Salary component deleted successfully", "success");
          fetchEmployeeData();
          setConfirmModal({
            isOpen: false,
            type: null,
            id: null,
            title: "",
            message: "",
            loading: false,
          });
        } else {
          showToast(
            response.data.message || "Failed to delete salary component",
            "error",
          );
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      } else if (type === "bank") {
        const response = await apiClient.delete(`/admin/bank-details/${id}`);
        if (response.data.status === "success") {
          showToast("Bank details deleted successfully", "success");
          fetchEmployeeData();
          setConfirmModal({
            isOpen: false,
            type: null,
            id: null,
            title: "",
            message: "",
            loading: false,
          });
        } else {
          showToast(
            response.data.message || "Failed to delete bank details",
            "error",
          );
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast(error.response?.data?.message || "Failed to delete", "error");
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      id: null,
      title: "",
      message: "",
      loading: false,
    });
  };

  // ─── Component CRUD ──────────────────────────────────────────────────
  const handleUpdateComponent = async (componentId, updatedData) => {
    try {
      const employeeId = currentEmployee.id || currentEmployee.employee_id;
      const response = await apiClient.put(
        `/admin/salary-components/${componentId}`,
        {
          employee_id: employeeId,
          component_name: updatedData.component_name,
          value: updatedData.value,
        },
      );
      if (response.data.status === "success") {
        showToast("Salary component updated successfully", "success");
        setEditingComponent(null);
        fetchEmployeeData();
      } else {
        showToast(
          response.data.message || "Failed to update salary component",
          "error",
        );
      }
    } catch (error) {
      console.error("Error updating salary component:", error);
      showToast(
        error.response?.data?.message || "Failed to update salary component",
        "error",
      );
    }
  };

  const handleAddComponent = async () => {
    if (!newComponent.component_name || !newComponent.value) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      const employeeId = currentEmployee.id || currentEmployee.employee_id;

      if (!employeeId) {
        showToast(
          "Employee ID not found. Please refresh and try again.",
          "error",
        );
        return;
      }

      const payload = {
        employee_id: employeeId,
        component_name: newComponent.component_name,
        value: parseFloat(newComponent.value).toFixed(2),
      };

      const response = await apiClient.post(
        "/admin/salary-components",
        payload,
      );

      if (response.data.status === "success") {
        showToast("Salary component added successfully", "success");
        setShowAddComponent(false);
        setNewComponent({
          component_name: "",
          value: "",
        });
        fetchEmployeeData();
      } else {
        showToast(
          response.data.message || "Failed to add salary component",
          "error",
        );
      }
    } catch (error) {
      console.error("Error adding salary component:", error);
      showToast(
        error.response?.data?.message || "Failed to add salary component",
        "error",
      );
    }
  };

  // ─── Bank CRUD ──────────────────────────────────────────────────────
  const handleAddBankDetail = async () => {
    if (!newBank.bank_name || !newBank.account_number) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (newBank.bank_country === "India" && !newBank.ifsc_code) {
      showToast("IFSC Code is required for Indian bank accounts", "error");
      return;
    }
    if (newBank.bank_country === "UAE" && !newBank.iban_number) {
      showToast("IBAN Number is required for UAE bank accounts", "error");
      return;
    }

    try {
      const existingBanks = currentEmployee.bank_details || [];
      const newBankFormatted = {
        bank_country: newBank.bank_country,
        bank_name: newBank.bank_name,
        account_number: newBank.account_number,
        ifsc_code: newBank.bank_country === "India" ? newBank.ifsc_code : null,
        branch_name:
          newBank.bank_country === "India" ? newBank.branch_name : null,
        iban_number:
          newBank.bank_country === "UAE" ? newBank.iban_number : null,
        swift_code: newBank.bank_country === "UAE" ? newBank.swift_code : null,
      };

      const allBanks = [...existingBanks, newBankFormatted];
      const payload = {
        user_id: currentEmployee.user_id || currentEmployee.user?.id,
        bank_details: allBanks,
      };

      const response = await apiClient.post(
        "/admin/employees/onboard/banks",
        payload,
      );

      if (response.data.status === "success") {
        showToast("Bank details added successfully", "success");
        setShowAddBank(false);
        setNewBank({
          bank_country: "India",
          bank_name: "",
          account_number: "",
          ifsc_code: "",
          branch_name: "",
          iban_number: "",
          swift_code: "",
        });
        fetchEmployeeData();
      } else {
        showToast(
          response.data.message || "Failed to add bank details",
          "error",
        );
      }
    } catch (error) {
      console.error("Error adding bank details:", error);
      showToast(
        error.response?.data?.message || "Failed to add bank details",
        "error",
      );
    }
  };

  const handleUpdateBankDetail = async (bankId, updatedData) => {
    try {
      const response = await apiClient.put(
        `/admin/bank-details/${bankId}`,
        updatedData,
      );

      if (response.data.status === "success") {
        showToast("Bank details updated successfully", "success");
        setEditingBankDetail(null);
        fetchEmployeeData();
      } else {
        showToast(
          response.data.message || "Failed to update bank details",
          "error",
        );
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      showToast(
        error.response?.data?.message || "Failed to update bank details",
        "error",
      );
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
      { id: "salary", label: "Salary & Bank", icon: <FiDollarSign /> },
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

          {/* Profile Summary Card */}
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

          {/* Tabs Navigation */}
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

          {/* Tab Content */}
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

            {/* ─── SALARY & BANK DETAILS TAB ────────────────────────────── */}
            {activeTab === "salary" && (
              <div>
                {/* Salary Components Section */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                    <FiDollarSign className="text-green-500" /> Salary Components
                  </h3>
                  <button
                    onClick={() => setShowAddComponent(true)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                  >
                    <FiPlus size={14} /> Add Component
                  </button>
                </div>

                {/* Salary Components List */}
                {getEmployeeComponents().length > 0 ? (
                  <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[var(--border)]">
                        <thead className="bg-[var(--surface2)]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                              Component Name
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                              Amount (INR)
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                          {getEmployeeComponents().map((comp, index) => (
                            <tr key={comp.id || index} className="hover:bg-[var(--surface2)]">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--text)]">
                                {editingComponent === comp.id ? (
                                  <input
                                    type="text"
                                    defaultValue={comp.component_name}
                                    className="px-2 py-1 border border-[var(--border)] rounded bg-[var(--surface)] text-[var(--text)]"
                                    id={`comp-name-${comp.id}`}
                                  />
                                ) : (
                                  comp.component_name
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text)] text-right">
                                {editingComponent === comp.id ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    defaultValue={comp.value}
                                    className="px-2 py-1 border border-[var(--border)] rounded text-right bg-[var(--surface)] text-[var(--text)]"
                                    id={`comp-value-${comp.id}`}
                                  />
                                ) : (
                                  parseFloat(comp.value).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                {editingComponent === comp.id ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        const newName = document.getElementById(
                                          `comp-name-${comp.id}`
                                        ).value;
                                        const newValue = document.getElementById(
                                          `comp-value-${comp.id}`
                                        ).value;
                                        handleUpdateComponent(comp.id, {
                                          component_name: newName,
                                          value: newValue,
                                        });
                                      }}
                                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                                      title="Save"
                                    >
                                      <FiSave size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingComponent(null)}
                                      className="text-[var(--muted)] hover:text-[var(--text)]"
                                      title="Cancel"
                                    >
                                      <FiX size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => setEditingComponent(comp.id)}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                      title="Edit"
                                    >
                                      <FiEdit size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteComponentClick(
                                          comp.id,
                                          comp.component_name
                                        )
                                      }
                                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                      title="Delete"
                                    >
                                      <FiTrash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                          {/* Total Row */}
                          <tr className="bg-[var(--surface2)] font-bold">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[var(--text)]">
                              Total Salary
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400 text-right">
                              INR {getTotalSalary().toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[var(--surface2)] rounded-xl border border-[var(--border)] mb-6">
                    <FiDollarSign className="text-4xl text-[var(--muted)] mx-auto mb-2" />
                    <p className="text-[var(--muted)]">
                      No salary components configured
                    </p>
                  </div>
                )}

                {/* Add Component Modal */}
                {showAddComponent && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface)] rounded-xl max-w-md w-full p-6 border border-[var(--border)]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                          Add Salary Component
                        </h3>
                        <button
                          onClick={() => {
                            setShowAddComponent(false);
                            setNewComponent({
                              component_name: "",
                              value: "",
                            });
                          }}
                          className="text-[var(--muted)] hover:text-[var(--text)]"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text)] mb-1">
                            Component Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Basic Salary"
                            value={newComponent.component_name}
                            onChange={(e) =>
                              setNewComponent({
                                ...newComponent,
                                component_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text)] mb-1">
                            Amount
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            value={newComponent.value}
                            onChange={(e) =>
                              setNewComponent({
                                ...newComponent,
                                value: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                          />
                        </div>
                        <button
                          onClick={handleAddComponent}
                          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Add Component
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Bank Details Section ───────────────────────────────── */}
                <div className="flex justify-between items-center mb-4 mt-8 pt-4 border-t border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                    <FiCreditCardIcon className="text-green-500" /> Bank Details
                  </h3>
                  <button
                    onClick={() => setShowAddBank(true)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                  >
                    <FiPlus size={14} /> Add Bank Account
                  </button>
                </div>

                {/* Add Bank Modal */}
                {showAddBank && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-[var(--surface)] rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-[var(--border)]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                          Add Bank Account
                        </h3>
                        <button
                          onClick={() => setShowAddBank(false)}
                          className="text-[var(--muted)] hover:text-[var(--text)]"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--text)] mb-1">
                            Country
                          </label>
                          <select
                            value={newBank.bank_country}
                            onChange={(e) =>
                              setNewBank({
                                ...newBank,
                                bank_country: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)]"
                          >
                            <option value="India">India</option>
                            <option value="UAE">United Arab Emirates</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text)] mb-1">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            value={newBank.bank_name}
                            onChange={(e) =>
                              setNewBank({
                                ...newBank,
                                bank_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--text)] mb-1">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            value={newBank.account_number}
                            onChange={(e) =>
                              setNewBank({
                                ...newBank,
                                account_number: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                          />
                        </div>
                        {newBank.bank_country === "India" ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                                IFSC Code *
                              </label>
                              <input
                                type="text"
                                value={newBank.ifsc_code}
                                onChange={(e) =>
                                  setNewBank({
                                    ...newBank,
                                    ifsc_code: e.target.value.toUpperCase(),
                                  })
                                }
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                                Branch Name
                              </label>
                              <input
                                type="text"
                                value={newBank.branch_name}
                                onChange={(e) =>
                                  setNewBank({
                                    ...newBank,
                                    branch_name: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                                IBAN Number *
                              </label>
                              <input
                                type="text"
                                value={newBank.iban_number}
                                onChange={(e) =>
                                  setNewBank({
                                    ...newBank,
                                    iban_number: e.target.value.toUpperCase(),
                                  })
                                }
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                                SWIFT/BIC Code
                              </label>
                              <input
                                type="text"
                                value={newBank.swift_code}
                                onChange={(e) =>
                                  setNewBank({
                                    ...newBank,
                                    swift_code: e.target.value.toUpperCase(),
                                  })
                                }
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-green-500 focus:border-green-500 bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]"
                              />
                            </div>
                          </>
                        )}
                        <button
                          onClick={handleAddBankDetail}
                          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Add Bank Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Details List */}
                {currentEmployee.bank_details &&
                currentEmployee.bank_details.length > 0 ? (
                  <div className="space-y-4">
                    {currentEmployee.bank_details.map((bank, index) => (
                      <div
                        key={bank.id || index}
                        className="border border-[var(--border)] rounded-xl overflow-hidden"
                      >
                        <div className="bg-[var(--surface2)] px-6 py-3 border-b border-[var(--border)] flex justify-between items-center">
                          <h4 className="font-semibold text-[var(--text)] flex items-center gap-2">
                            <FiGlobeIcon className="text-green-500" />
                            Bank Account{" "}
                            {currentEmployee.bank_details.length > 1
                              ? `#${index + 1}`
                              : ""}
                            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                              {bank.bank_country}
                            </span>
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingBankDetail(bank.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteBankDetailClick(
                                  bank.id,
                                  bank.bank_name,
                                )
                              }
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-6">
                          {editingBankDetail === bank.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs text-[var(--muted)] mb-1">
                                    Bank Name
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={bank.bank_name}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)]"
                                    id={`bank-name-${bank.id}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-[var(--muted)] mb-1">
                                    Account Number
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={bank.account_number}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)]"
                                    id={`bank-account-${bank.id}`}
                                  />
                                </div>
                                {bank.bank_country === "India" ? (
                                  <>
                                    <div>
                                      <label className="block text-xs text-[var(--muted)] mb-1">
                                        IFSC Code
                                      </label>
                                      <input
                                        type="text"
                                        defaultValue={bank.ifsc_code || ""}
                                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)]"
                                        id={`bank-ifsc-${bank.id}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-[var(--muted)] mb-1">
                                        Branch Name
                                      </label>
                                      <input
                                        type="text"
                                        defaultValue={bank.branch_name || ""}
                                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)]"
                                        id={`bank-branch-${bank.id}`}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <label className="block text-xs text-[var(--muted)] mb-1">
                                        IBAN Number
                                      </label>
                                      <input
                                        type="text"
                                        defaultValue={bank.iban_number || ""}
                                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)]"
                                        id={`bank-iban-${bank.id}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-[var(--muted)] mb-1">
                                        SWIFT Code
                                      </label>
                                      <input
                                        type="text"
                                        defaultValue={bank.swift_code || ""}
                                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)]"
                                        id={`bank-swift-${bank.id}`}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingBankDetail(null)}
                                  className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg hover:bg-[var(--surface2)]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    const updatedData = {
                                      bank_country: bank.bank_country,
                                      bank_name: document.getElementById(
                                        `bank-name-${bank.id}`,
                                      ).value,
                                      account_number: document.getElementById(
                                        `bank-account-${bank.id}`,
                                      ).value,
                                    };
                                    if (bank.bank_country === "India") {
                                      updatedData.ifsc_code =
                                        document.getElementById(
                                          `bank-ifsc-${bank.id}`,
                                        ).value;
                                      updatedData.branch_name =
                                        document.getElementById(
                                          `bank-branch-${bank.id}`,
                                        ).value;
                                    } else {
                                      updatedData.iban_number =
                                        document.getElementById(
                                          `bank-iban-${bank.id}`,
                                        ).value;
                                      updatedData.swift_code =
                                        document.getElementById(
                                          `bank-swift-${bank.id}`,
                                        ).value;
                                    }
                                    handleUpdateBankDetail(
                                      bank.id,
                                      updatedData,
                                    );
                                  }}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                                    Bank Name
                                  </label>
                                  <p className="text-[var(--text)] font-medium mt-1">
                                    {bank.bank_name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                                    Account Number
                                  </label>
                                  <p className="text-[var(--text)] font-medium mt-1 font-mono">
                                    {bank.account_number}
                                  </p>
                                </div>
                                {bank.branch_name && (
                                  <div>
                                    <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                                      Branch Name
                                    </label>
                                    <p className="text-[var(--text)] font-medium mt-1">
                                      {bank.branch_name}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-3">
                                {bank.ifsc_code && (
                                  <div>
                                    <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                                      IFSC Code
                                    </label>
                                    <p className="text-[var(--text)] font-medium mt-1 font-mono">
                                      {bank.ifsc_code}
                                    </p>
                                  </div>
                                )}
                                {bank.iban_number && (
                                  <div>
                                    <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                                      IBAN Number
                                    </label>
                                    <p className="text-[var(--text)] font-medium mt-1 font-mono">
                                      {bank.iban_number}
                                    </p>
                                  </div>
                                )}
                                {bank.swift_code && (
                                  <div>
                                    <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
                                      SWIFT/BIC Code
                                    </label>
                                    <p className="text-[var(--text)] font-medium mt-1 font-mono">
                                      {bank.swift_code}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[var(--surface2)] rounded-xl border border-[var(--border)]">
                    <FiCreditCardIcon className="text-4xl text-[var(--muted)] mx-auto mb-2" />
                    <p className="text-[var(--muted)]">
                      No bank details available
                    </p>
                  </div>
                )}
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

            {/* Documents Tab */}
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

      {/* ─── CONFIRM DELETE MODAL ───────────────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={executeDelete}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmModal.loading}
      />
    </div>
  );
};

export default EmployeeDetails;