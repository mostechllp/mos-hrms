import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { showToast } from "../../components/common/Toast";
import { addEmployee } from "../../store/slices/employeeSlice";
import { fetchOrganizations } from "../../store/slices/organizationSlice";
import { fetchCompanies } from "../../store/slices/companySlice";
import { fetchDesignations } from "../../store/slices/designationSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import apiClient from "../../utils/apiClient";

const AddEmployee = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [, setVisitedSteps] = useState([0]);
  const [stepErrors, setStepErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  // Document file states
  const [documents, setDocuments] = useState({
    avatar: null,
    passport_size_photo: null,
    passport_1st_page: null,
    passport_2nd_page: null,
    passport_outer_page: null,
    passport_id_page: null,
    visa_page: null,
    labor_card: null,
    labor_contract: null,
    eid_1st_page: null,
    eid_2nd_page: null,
    educational_1st_page: null,
    educational_2nd_page: null,
    home_country_id_proof: null,
  });

  const [documentPreviews, setDocumentPreviews] = useState({});

  // Fetch data from slices
  const { organizations = [] } = useSelector(
    (state) => state.organizations || {},
  );
  const { companies = [] } = useSelector((state) => state.companies || {});
  const { designations = [] } = useSelector(
    (state) => state.designations || {},
  );
  const { departments = [] } = useSelector((state) => state.departments || {});

  // Initialize useForm
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      // Step 1: Basic Info
      first_name: "",
      last_name: "",
      organization_id: "",
      company_id: "",
      designation_id: "",
      department_id: "",
      employee_id: "",
      type: "employee",
      total_leaves_allocated: 30,
      joining_date: "",
      dob: "",
      gender: "male",
      nationality: "",
      marital_status: "",
      special_days: [{ name: "", date: "" }],
      username: "",

      // Step 2: Passport Details
      passport_full_name: "",
      passport_number: "",
      passport_issued_date: "",
      passport_expiry_date: "",
      father_name: "",
      mother_name: "",
      address: "",
      passport_issued_from: "",
      place_of_birth: "",

      // Step 3: Visa & Labor
      visa_number: "",
      visa_type: "",
      visa_issued_date: "",
      visa_expiry_date: "",
      labor_number: "",
      labor_issued_date: "",
      labor_expiry_date: "",

      // Step 4: EID
      eid_number: "",
      eid_issued_date: "",
      eid_expiry_date: "",

      // Step 5: Contact & Others
      dependents: 0,
      company_email: "",
      company_mobile_number: "",
      personal_number: "",
      personal_email: "",
      other_number: "",
      home_country_number: "",
      role: "Employee",
    },
    shouldUnregister: true,
    mode: "onSubmit",
  });

  // UseFieldArray for special days
  const { fields, append, remove } = useFieldArray({
    control,
    name: "special_days",
  });

  const watchOrganizationId = watch("organization_id");
  const passportIssued = watch("passport_issued_date");
  const passportExpiry = watch("passport_expiry_date");
  const visaIssued = watch("visa_issued_date");
  const visaExpiry = watch("visa_expiry_date");
  const laborIssued = watch("labor_issued_date");
  const laborExpiry = watch("labor_expiry_date");
  const eidIssued = watch("eid_issued_date");
  const eidExpiry = watch("eid_expiry_date");

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchDesignations());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Fetch companies when organization changes
  useEffect(() => {
    if (watchOrganizationId) {
      dispatch(fetchCompanies(watchOrganizationId));
    }
  }, [watchOrganizationId, dispatch]);

  const steps = [
    { number: 1, title: "Basic Info", icon: "fas fa-user-circle" },
    { number: 2, title: "Passport", icon: "fas fa-passport" },
    { number: 3, title: "Visa & Labor", icon: "fas fa-file-contract" },
    { number: 4, title: "EID", icon: "fas fa-id-card" },
    { number: 5, title: "Contact", icon: "fas fa-address-card" },
  ];

  const userTypeOptions = [
    "admin",
    "manager",
    "employee",
    "field_employee",
    "driver",
    "remote_employee",
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const nationalityOptions = [
    "Indian",
    "Nepali",
    "Bangladeshi",
    "Pakistani",
    "Sri Lankan",
    "Filipino",
    "Other",
  ];

  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const visaTypeOptions = ["Company Visa", "Family Visa", "Other Visa"];

  const getStepFields = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return [
          "first_name",
          "employee_id",
          "username",
          "organization_id",
          "company_id",
          "designation_id",
          "department_id",
          "type",
          "total_leaves_allocated",
        ];
      case 1:
        return ["passport_issued_date", "passport_expiry_date"];
      case 2:
        return [
          "visa_issued_date",
          "visa_expiry_date",
          "labor_issued_date",
          "labor_expiry_date",
        ];
      case 3:
        return ["eid_issued_date", "eid_expiry_date"];
      case 4:
        return ["company_email", "personal_email", "type"];
      default:
        return [];
    }
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const DateInput = ({ field, hasError, placeholder = "Select date" }) => (
    <DatePicker
      selected={parseDateValue(field.value)}
      onChange={(date) => {
        if (!date) {
          field.onChange("");
          return;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        field.onChange(`${year}-${month}-${day}`);
      }}
      dateFormat="yyyy-MM-dd"
      placeholderText={placeholder}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      autoComplete="off"
      className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${
        hasError
          ? "border-red-500"
          : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"
      }`}
    />
  );

  // Document upload component
  const DocumentUpload = ({
    fieldKey,
    label,
    icon,
    accept = "image/*,.pdf",
  }) => {
    const fileInputId = `doc_${fieldKey}`;
    const isUploading = uploadingFiles[fieldKey];

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <i className={`${icon} text-green-500 mr-2`}></i>
          {label}
          <span className="text-xs text-gray-400 ml-2">(Optional)</span>
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            id={fileInputId}
            accept={accept}
            onChange={(e) => {
              e.stopPropagation();
              handleFileChange(fieldKey, e.target.files[0]);
            }}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => document.getElementById(fileInputId).click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isUploading ? (
              <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
            ) : (
              <><i className="fas fa-upload"></i> Choose File</>
            )}
          </button>
          <span className="text-sm text-gray-500 truncate flex-1">
            {isUploading
              ? "Uploading file..."
              : documents[fieldKey]
              ? "File uploaded ✓"
              : "No file chosen"}
          </span>
        </div>
        {documentPreviews[fieldKey] && documentPreviews[fieldKey] !== "pdf" && (
          <div className="mt-3">
            <img
              src={documentPreviews[fieldKey]}
              alt={label}
              className="h-20 w-20 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setDocuments({ ...documents, [fieldKey]: null });
                setDocumentPreviews({ ...documentPreviews, [fieldKey]: null });
              }}
              className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <i className="fas fa-trash"></i> Remove
            </button>
          </div>
        )}
        {documentPreviews[fieldKey] === "pdf" && (
          <div className="mt-3">
            <div className="h-20 w-20 bg-red-100 rounded-lg flex items-center justify-center border border-gray-200">
              <i className="fas fa-file-pdf text-red-500 text-3xl"></i>
            </div>
            <button
              type="button"
              onClick={() => {
                setDocuments({ ...documents, [fieldKey]: null });
                setDocumentPreviews({ ...documentPreviews, [fieldKey]: null });
              }}
              className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <i className="fas fa-trash"></i> Remove
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          <i className="fas fa-info-circle mr-1"></i> Max size: 5MB. Allowed: JPG, PNG, PDF
        </p>
      </div>
    );
  };

  const handleFileChange = async (fieldKey, file) => {
    if (!file) return;
    
    const fileSize = file.size / 1024 / 1024;
    const maxSize = fieldKey === 'avatar' ? 2 : 5;
    if (fileSize > maxSize) {
      showToast(`File must be less than ${maxSize}MB`, 'error');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews(prev => ({ ...prev, [fieldKey]: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews(prev => ({ ...prev, [fieldKey]: 'pdf' }));
    }

    setUploadingFiles(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/admin/employees/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = response.data;

      if (result.status && result.path) {
        setDocuments(prev => ({ ...prev, [fieldKey]: result.path }));
        showToast(`Uploaded successfully`, 'success');
      } else {
        showToast(`Failed to upload`, 'error');
        setDocumentPreviews(prev => ({ ...prev, [fieldKey]: null }));
      }
    } catch (error) {
      showToast(`Upload failed: ${error.message}`, 'error');
      setDocumentPreviews(prev => ({ ...prev, [fieldKey]: null }));
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getStepFields(currentStep);

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: false }));
      setVisitedSteps((prev) => [...new Set([...prev, currentStep + 1])]);
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStepErrors((prev) => ({ ...prev, [currentStep]: true }));
      showToast("Please fix the errors before proceeding", "error");
    }
  };

  const handleStepClick = async (targetStep) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: true }));
      showToast("Please fix required fields before changing section", "error");
      return;
    }

    setStepErrors((prev) => ({ ...prev, [currentStep]: false }));
    setCurrentStep(targetStep);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    const submitData = { ...data };
    submitData.organization_id = parseInt(data.organization_id);
    submitData.company_id = parseInt(data.company_id);
    if (data.designation_id) submitData.designation_id = parseInt(data.designation_id);
    if (data.department_id) submitData.department_id = parseInt(data.department_id);
    submitData.total_leaves_allocated = parseInt(data.total_leaves_allocated);

    if (data.dependents !== undefined && data.dependents !== '') {
      submitData.dependents = String(data.dependents);
    }

    if (data.special_days && data.special_days.length > 0) {
      const validSpecialDays = data.special_days.filter(day => day.name && day.date);
      submitData.special_days = JSON.stringify(validSpecialDays);
    } else {
      submitData.special_days = null;
    }

    // Include temp paths directly in the main employee save
    const keyMap = {
      avatar: 'avatar_path',
    };

    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        const backendKey = keyMap[key] || key;
        submitData[backendKey] = documents[key];
      }
    });

    const result = await dispatch(addEmployee(submitData));
    setLoading(false);

    if (addEmployee.fulfilled.match(result)) {
      showToast(`✓ Employee "${data.first_name} ${data.last_name || ""}" added successfully!`, "success");
      navigate("/employees");
    } else {
      const errorPayload = result.payload;
      if (errorPayload && errorPayload.errors) {
        const errorMessages = Object.entries(errorPayload.errors).map(
          ([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`
        );
        showToast(errorMessages.join("\n"), "error");
      } else if (typeof errorPayload === "string") {
        showToast(errorPayload, "error");
      } else {
        showToast("Failed to add employee", "error");
      }
    }
  };

  // Validation rules
  const validationRules = {
    first_name: {
      required: "First name is required",
      minLength: {
        value: 2,
        message: "First name must be at least 2 characters",
      },
    },
    employee_id: {
      required: "Employee ID is required",
    },
    organization_id: {
      required: "Organization is required",
    },
    company_id: {
      required: "Company is required",
    },
    designation_id: {
      required: "Designation is required",
    },
    department_id: {
      required: "Department is required",
    },
    type: {
      required: "User type is required",
    },
    company_email: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address format",
      },
    },
    personal_email: {
      required: "Personal email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address format",
      },
    },
    total_leaves_allocated: {
      required: "Leave allocation is required",
      min: { value: 0, message: "Leave allocation cannot be negative" },
      max: { value: 365, message: "Leave allocation cannot exceed 365 days" },
    },
    username: {
      required: "Username is required",
      minLength: {
        value: 3,
        message: "Username must be at least 3 characters",
      },
    },
  };

  // Date validation functions
  const validateIssueDate = (issueDate, expiryDate, fieldName) => {
    if (!issueDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issue = new Date(issueDate);

    if (issue > today) {
      return `${fieldName} cannot be in the future`;
    }

    if (expiryDate && issue >= new Date(expiryDate)) {
      return `Issued date must be before expiry date`;
    }

    return true;
  };

  const validateExpiryDate = (expiryDate, issueDate, fieldName) => {
    if (!expiryDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);

    if (expiry < today) {
      return `${fieldName} cannot be in the past`;
    }

    if (issueDate && expiry <= new Date(issueDate)) {
      return `Expiry date must be after issued date`;
    }

    return true;
  };

  return (
    <div className="w-full overflow-x-hidden px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to="/admin/employees"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Employees
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500">Add Employee</span>
      </div>

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
          <i className="fas fa-user-plus mr-2"></i> Add New Employee
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the employee details below
        </p>
      </div>

      {/* Step Indicator */}
      <div className="overflow-x-auto pb-2 mb-4 md:mb-8 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step.number}
              onClick={() => handleStepClick(index)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                currentStep === index
                  ? "bg-green-500 text-white shadow-md"
                  : stepErrors[index]
                    ? "bg-red-50 text-red-600 border border-red-300"
                    : index < currentStep
                      ? "text-green-500"
                      : "text-gray-500 bg-gray-100"
              }`}
            >
              <i className={`${step.icon} mr-1 text-xs md:text-sm`}></i>
              <span className="hidden sm:inline">
                {step.number}. {step.title}
              </span>
              <span className="sm:hidden">{step.number}</span>
              {stepErrors[index] && (
                <i className="fas fa-exclamation-circle ml-1 text-xs"></i>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 lg:p-8 shadow-soft">
        <form
          onSubmit={(e) => {
            if (currentStep !== steps.length - 1) {
              e.preventDefault();
              return;
            }
            handleSubmit(onSubmit)(e);
          }}
        >
          <div className="space-y-8">
            {stepErrors[currentStep] && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-xs md:text-sm text-red-600">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  Please complete required fields in this section.
                </p>
              </div>
            )}

            {/* Step 0 - Basic Info */}
            <div className={currentStep === 0 ? "block" : "hidden"}>
              <div>
                <div className="form-section-title mb-4 md:mb-6">
                  <i className="fas fa-user-circle text-green-500 mr-2"></i>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Basic Information
                  </h3>
                </div>
                {stepErrors[0] && (
                  <p className="text-xs md:text-sm text-red-500 mb-4">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Please fill all mandatory fields in this section.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user text-green-500 mr-1"></i> First
                      Name *
                    </label>
                    <Controller
                      name="first_name"
                      control={control}
                      rules={validationRules.first_name}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="text"
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.first_name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"}`}
                            placeholder="Enter first name"
                          />
                          {errors.first_name && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.first_name.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user text-green-500 mr-1"></i> Last
                      Name
                    </label>
                    <Controller
                      name="last_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter last name"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-building text-green-500 mr-1"></i>{" "}
                      Organization *
                    </label>
                    <Controller
                      name="organization_id"
                      control={control}
                      rules={validationRules.organization_id}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.organization_id ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                          >
                            <option value="">Select Organization</option>
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                          {errors.organization_id && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.organization_id.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-building text-green-500 mr-1"></i>{" "}
                      Company *
                    </label>
                    <Controller
                      name="company_id"
                      control={control}
                      rules={validationRules.company_id}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            disabled={!watchOrganizationId}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${!watchOrganizationId ? "opacity-50 cursor-not-allowed" : ""} ${errors.company_id ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                          >
                            <option value="">Select Company</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.company_name || company.name}
                              </option>
                            ))}
                          </select>
                          {errors.company_id && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.company_id.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-briefcase text-green-500 mr-1"></i>{" "}
                      Designation *
                    </label>
                    <Controller
                      name="designation_id"
                      control={control}
                      rules={validationRules.designation_id}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:ring-2 ${errors.designation_id ? "border-red-500" : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"}`}
                          >
                            <option value="">Select Designation</option>
                            {designations.map((desig) => (
                              <option key={desig.id} value={desig.id}>
                                {desig.name}
                              </option>
                            ))}
                          </select>
                          {errors.designation_id && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.designation_id.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-diagram-project text-green-500 mr-1"></i>{" "}
                      Department *
                    </label>
                    <Controller
                      name="department_id"
                      control={control}
                      rules={validationRules.department_id}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:ring-2 ${errors.department_id ? "border-red-500" : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"}`}
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          {errors.department_id && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.department_id.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user-tag text-green-500 mr-1"></i>{" "}
                      User Type *
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      rules={validationRules.type}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.type ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                          >
                            {userTypeOptions.map((type) => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() +
                                  type.slice(1).replace("_", " ")}
                              </option>
                            ))}
                          </select>
                          {errors.type && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.type.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-venus-mars text-green-500 mr-1"></i>{" "}
                      Gender
                    </label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map((gender) => (
                            <option key={gender.value} value={gender.value}>
                              {gender.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-globe-asia text-green-500 mr-1"></i>{" "}
                      Nationality
                    </label>
                    <Controller
                      name="nationality"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        >
                          <option value="">Select Nationality</option>
                          {nationalityOptions.map((nationality) => (
                            <option key={nationality} value={nationality}>
                              {nationality}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user-friends text-green-500 mr-1"></i>{" "}
                      Marital Status
                    </label>
                    <Controller
                      name="marital_status"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        >
                          <option value="">Select Marital Status</option>
                          {maritalStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Special Days - Array of name and date */}
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-gift text-green-500 mr-1"></i>{" "}
                      Special Days
                    </label>
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 items-start">
                          <div className="flex-1">
                            <Controller
                              name={`special_days.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="e.g., Birthday / Anniversary"
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                              )}
                            />
                          </div>
                          <div className="flex-1">
                            <Controller
                              name={`special_days.${index}.date`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="date"
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                              )}
                            />
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-500 hover:text-red-600 transition-colors"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => append({ name: "", date: "" })}
                        className="text-green-500 hover:text-green-600 text-sm font-semibold flex items-center gap-2 mt-2"
                      >
                        <i className="fas fa-plus-circle"></i>
                        Add Special Day
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      <i className="fas fa-info-circle mr-1"></i> Add special
                      occasions like birthday, anniversary, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-id-card text-green-500 mr-1"></i>{" "}
                      Employee ID *
                    </label>
                    <Controller
                      name="employee_id"
                      control={control}
                      rules={validationRules.employee_id}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="text"
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.employee_id ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                            placeholder="Enter employee ID"
                          />
                          {errors.employee_id && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.employee_id.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user-circle text-green-500 mr-1"></i>{" "}
                      Username *
                    </label>
                    <Controller
                      name="username"
                      control={control}
                      rules={validationRules.username}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="text"
                            value={field.value || ""}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.username ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                            placeholder="Enter username"
                          />
                          {errors.username && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.username.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar text-green-500 mr-1"></i>{" "}
                      Date of Birth
                    </label>
                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => <DateInput field={field} />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar-alt text-green-500 mr-1"></i>{" "}
                      Joining Date
                    </label>
                    <Controller
                      name="joining_date"
                      control={control}
                      render={({ field }) => <DateInput field={field} />}
                    />
                  </div>

                  {/* Educational Documents in Basic Info */}
                  <div className="md:col-span-2">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30 mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-camera text-green-500 mr-2"></i>
                        Passport Size Photo
                        <span className="text-xs text-gray-400 ml-2">
                          (Optional)
                        </span>
                      </label>
                      <div className="flex items-start gap-4 flex-wrap">
                        <input
                          type="file"
                          id="doc_avatar"
                          accept="image/png,image/jpeg,image/jpg,image/gif"
                          onChange={(e) => {
                            e.stopPropagation();
                            const file = e.target.files[0];
                            if (!file) return;
                            const fileSize = file.size / 1024 / 1024;
                            if (fileSize > 2) {
                              showToast(
                                "Passport size photo must be less than 2MB",
                                "error",
                              );
                              return;
                            }
                            handleFileChange("avatar", file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("doc_avatar").click()
                          }
                          className="h-40 w-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-green-400 transition-colors flex items-center justify-center overflow-hidden"
                          aria-label="Upload passport size photo"
                        >
                          {documentPreviews.avatar ? (
                            <img
                              src={documentPreviews.avatar}
                              alt="Passport size"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-gray-400">
                              <i className="far fa-user text-3xl mb-2"></i>
                              <p className="text-lg leading-none">Photo</p>
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-[220px]">
                          <button
                            type="button"
                            onClick={() =>
                              document.getElementById("doc_avatar").click()
                            }
                            className="px-4 py-2 bg-white border border-green-200 text-green-600 rounded-full text-sm font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
                          >
                            <i className="fas fa-upload"></i> Upload Photo
                          </button>
                          <p className="text-sm text-gray-500 mt-2 truncate">
                            {documents.avatar
                              ? documents.avatar.name || "Photo selected"
                              : "No photo chosen"}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            <i className="fas fa-info-circle mr-1"></i>{" "}
                            Accepted: JPG, PNG, GIF. Max 2MB. Recommended size:
                            35mm x 45mm (passport size).
                          </p>
                        </div>
                      </div>
                      {documentPreviews.avatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setDocuments({ ...documents, avatar: null });
                            setDocumentPreviews({
                              ...documentPreviews,
                              avatar: null,
                            });
                          }}
                          className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-graduation-cap text-green-500 mr-2"></i>
                        Educational Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentUpload
                          fieldKey="educational_1st_page"
                          label="Educational Certificate (Front)"
                          icon="fas fa-graduation-cap"
                        />
                        <DocumentUpload
                          fieldKey="educational_2nd_page"
                          label="Educational Certificate (Back)"
                          icon="fas fa-graduation-cap"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Home Country ID */}
                  <div className="md:col-span-2">
                    <DocumentUpload
                      fieldKey="home_country_id_proof"
                      label="Home Country ID Proof"
                      icon="fas fa-home"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 - Passport */}
            <div className={currentStep === 1 ? "block" : "hidden"}>
              <div>
                <div className="form-section-title mb-4 md:mb-6">
                  <i className="fas fa-passport text-green-500 mr-2"></i>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Passport Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user-tag text-green-500 mr-1"></i>{" "}
                      Passport Full Name
                    </label>
                    <Controller
                      name="passport_full_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter name as per passport"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-hashtag text-green-500 mr-1"></i>{" "}
                      Passport Number
                    </label>
                    <Controller
                      name="passport_number"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter passport number"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-globe text-green-500 mr-1"></i>{" "}
                      Issued From
                    </label>
                    <Controller
                      name="passport_issued_from"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter issuing country/city"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar-plus text-green-500 mr-1"></i>{" "}
                      Issued Date
                    </label>
                    <Controller
                      name="passport_issued_date"
                      control={control}
                      rules={{
                        validate: (value) =>
                          validateIssueDate(
                            value,
                            passportExpiry,
                            "Passport issued date",
                          ),
                      }}
                      render={({ field }) => (
                        <>
                          <DateInput
                            field={field}
                            hasError={!!errors.passport_issued_date}
                          />
                          {errors.passport_issued_date && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.passport_issued_date.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                      Expiry Date
                    </label>
                    <Controller
                      name="passport_expiry_date"
                      control={control}
                      rules={{
                        validate: (value) =>
                          validateExpiryDate(
                            value,
                            passportIssued,
                            "Passport expiry date",
                          ),
                      }}
                      render={({ field }) => (
                        <>
                          <DateInput
                            field={field}
                            hasError={!!errors.passport_expiry_date}
                          />
                          {errors.passport_expiry_date && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.passport_expiry_date.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-map-pin text-green-500 mr-1"></i>{" "}
                      Place of Birth
                    </label>
                    <Controller
                      name="place_of_birth"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter place of birth"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-father text-green-500 mr-1"></i>{" "}
                      Father's Name
                    </label>
                    <Controller
                      name="father_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter father's name"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-mother text-green-500 mr-1"></i>{" "}
                      Mother's Name
                    </label>
                    <Controller
                      name="mother_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter mother's name"
                        />
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-map-marker-alt text-green-500 mr-1"></i>{" "}
                      Address
                    </label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows="2"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter full address"
                        ></textarea>
                      )}
                    />
                  </div>

                  {/* Passport Documents */}
                  <div className="md:col-span-2">
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-passport text-green-500 mr-2"></i>
                        Passport Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentUpload
                          fieldKey="passport_1st_page"
                          label="Passport 1st Page"
                          icon="fas fa-passport"
                        />
                        <DocumentUpload
                          fieldKey="passport_2nd_page"
                          label="Passport 2nd Page"
                          icon="fas fa-passport"
                        />
                        <DocumentUpload
                          fieldKey="passport_outer_page"
                          label="Passport Outer Page"
                          icon="fas fa-passport"
                        />
                        <DocumentUpload
                          fieldKey="passport_id_page"
                          label="Passport ID Page"
                          icon="fas fa-id-card"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Visa & Labor */}
            <div className={currentStep === 2 ? "block" : "hidden"}>
              <div>
                <div className="form-section-title mb-4 md:mb-6">
                  <i className="fas fa-file-contract text-green-500 mr-2"></i>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Visa & Labor Details
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4 md:p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <i className="fas fa-passport text-green-500 mr-2"></i>
                      Visa Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-list text-green-500 mr-1"></i>{" "}
                          Type of Visa
                        </label>
                        <Controller
                          name="visa_type"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            >
                              <option value="">Select Type of Visa</option>
                              {visaTypeOptions.map((visaType) => (
                                <option key={visaType} value={visaType}>
                                  {visaType}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-id-card text-green-500 mr-1"></i>{" "}
                          Visa Number
                        </label>
                        <Controller
                          name="visa_number"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                              placeholder="Enter Visa Number"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-calendar-plus text-green-500 mr-1"></i>{" "}
                          Visa Issued Date
                        </label>
                        <Controller
                          name="visa_issued_date"
                          control={control}
                          rules={{
                            validate: (value) =>
                              validateIssueDate(
                                value,
                                visaExpiry,
                                "Visa issued date",
                              ),
                          }}
                          render={({ field }) => (
                            <>
                              <DateInput
                                field={field}
                                hasError={!!errors.visa_issued_date}
                              />
                              {errors.visa_issued_date && (
                                <p className="mt-1 text-xs text-red-500">
                                  {errors.visa_issued_date.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                          Visa Expiry Date
                        </label>
                        <Controller
                          name="visa_expiry_date"
                          control={control}
                          rules={{
                            validate: (value) =>
                              validateExpiryDate(
                                value,
                                visaIssued,
                                "Visa expiry date",
                              ),
                          }}
                          render={({ field }) => (
                            <>
                              <DateInput
                                field={field}
                                hasError={!!errors.visa_expiry_date}
                              />
                              {errors.visa_expiry_date && (
                                <p className="mt-1 text-xs text-red-500">
                                  {errors.visa_expiry_date.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 md:p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <i className="fas fa-briefcase text-green-500 mr-2"></i>
                      Labor Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-briefcase text-green-500 mr-1"></i>{" "}
                          Labor Number
                        </label>
                        <Controller
                          name="labor_number"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                              placeholder="Enter Labor Number"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-calendar-plus text-green-500 mr-1"></i>{" "}
                          Labor Issued Date
                        </label>
                        <Controller
                          name="labor_issued_date"
                          control={control}
                          rules={{
                            validate: (value) =>
                              validateIssueDate(
                                value,
                                laborExpiry,
                                "Labor issued date",
                              ),
                          }}
                          render={({ field }) => (
                            <>
                              <DateInput
                                field={field}
                                hasError={!!errors.labor_issued_date}
                              />
                              {errors.labor_issued_date && (
                                <p className="mt-1 text-xs text-red-500">
                                  {errors.labor_issued_date.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                          <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                          Labor Expiry Date
                        </label>
                        <Controller
                          name="labor_expiry_date"
                          control={control}
                          rules={{
                            validate: (value) =>
                              validateExpiryDate(
                                value,
                                laborIssued,
                                "Labor expiry date",
                              ),
                          }}
                          render={({ field }) => (
                            <>
                              <DateInput
                                field={field}
                                hasError={!!errors.labor_expiry_date}
                              />
                              {errors.labor_expiry_date && (
                                <p className="mt-1 text-xs text-red-500">
                                  {errors.labor_expiry_date.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visa & Labor Documents */}
                  <div>
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-file-contract text-green-500 mr-2"></i>
                        Supporting Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentUpload
                          fieldKey="visa_page"
                          label="Visa Page Copy"
                          icon="fas fa-file-contract"
                        />
                        <DocumentUpload
                          fieldKey="labor_card"
                          label="Labor Card Copy"
                          icon="fas fa-id-card"
                        />
                        <DocumentUpload
                          fieldKey="labor_contract"
                          label="Attach Labor Contract"
                          icon="fas fa-file-signature"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 - EID */}
            <div className={currentStep === 3 ? "block" : "hidden"}>
              <div>
                <div className="form-section-title mb-4 md:mb-6">
                  <i className="fas fa-id-card text-green-500 mr-2"></i>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Emirates ID (EID)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-qrcode text-green-500 mr-1"></i> EID
                      Number
                    </label>
                    <Controller
                      name="eid_number"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter EID number (e.g., 784-2024-1234567-8)"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar-plus text-green-500 mr-1"></i>{" "}
                      Issued Date
                    </label>
                    <Controller
                      name="eid_issued_date"
                      control={control}
                      rules={{
                        validate: (value) =>
                          validateIssueDate(
                            value,
                            eidExpiry,
                            "EID issued date",
                          ),
                      }}
                      render={({ field }) => (
                        <>
                          <DateInput
                            field={field}
                            hasError={!!errors.eid_issued_date}
                          />
                          {errors.eid_issued_date && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.eid_issued_date.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar-times text-green-500 mr-1"></i>{" "}
                      Expiry Date
                    </label>
                    <Controller
                      name="eid_expiry_date"
                      control={control}
                      rules={{
                        validate: (value) =>
                          validateExpiryDate(
                            value,
                            eidIssued,
                            "EID expiry date",
                          ),
                      }}
                      render={({ field }) => (
                        <>
                          <DateInput
                            field={field}
                            hasError={!!errors.eid_expiry_date}
                          />
                          {errors.eid_expiry_date && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.eid_expiry_date.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* EID Documents */}
                  <div className="md:col-span-2">
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-id-card text-green-500 mr-2"></i>
                        Emirates ID Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentUpload
                          fieldKey="eid_1st_page"
                          label="EID Front Side"
                          icon="fas fa-id-card"
                        />
                        <DocumentUpload
                          fieldKey="eid_2nd_page"
                          label="EID Back Side"
                          icon="fas fa-id-card"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 - Contact */}
            <div className={currentStep === 4 ? "block" : "hidden"}>
              <div>
                <div className="form-section-title mb-4 md:mb-6">
                  <i className="fas fa-address-card text-green-500 mr-2"></i>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Contact Information & Others
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-users text-green-500 mr-1"></i>{" "}
                      Dependents
                    </label>
                    <Controller
                      name="dependents"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Number of dependents"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-phone text-green-500 mr-1"></i>{" "}
                      Company Mobile Number
                    </label>
                    <Controller
                      name="company_mobile_number"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter company mobile number"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-phone text-green-500 mr-1"></i>{" "}
                      Personal Number
                    </label>
                    <Controller
                      name="personal_number"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter personal phone number"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-phone-alt text-green-500 mr-1"></i>{" "}
                      Other Number
                    </label>
                    <Controller
                      name="other_number"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter alternate number"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-globe text-green-500 mr-1"></i> Home
                      Country Number
                    </label>
                    <Controller
                      name="home_country_number"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          placeholder="Enter home country number"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-envelope text-green-500 mr-1"></i>{" "}
                      Company Email
                    </label>
                    <Controller
                      name="company_email"
                      control={control}
                      rules={validationRules.company_email}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="email"
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.company_email ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                            placeholder="name@company.com (Optional)"
                          />
                          {errors.company_email && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.company_email.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-envelope text-green-500 mr-1"></i>{" "}
                      Personal Email *
                    </label>
                    <Controller
                      name="personal_email"
                      control={control}
                      rules={validationRules.personal_email}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="email"
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.personal_email ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                            placeholder="name@gmail.com"
                          />
                          {errors.personal_email && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.personal_email.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-user-tag text-green-500 mr-1"></i>{" "}
                      Role
                    </label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        >
                          <option value="">Select Role</option>
                          {userTypeOptions.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() +
                                role.slice(1).replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Previous</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Employee
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;