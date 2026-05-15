import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { showToast } from "../../components/common/Toast";
import {
  fetchEmployeeById,
  updateEmployee,
} from "../store/slices/employeeSlice";
import { fetchOrganizations } from "../store/slices/organizationSlice";
import { fetchCompanies } from "../store/slices/companySlice";
import { fetchDesignations } from "../store/slices/designationSlice";
import { fetchDepartments } from "../store/slices/departmentSlice";
import { fetchRoles } from "../store/slices/roleSlice";
import apiClient from "../../utils/apiClient";

const EditEmployee = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formInitialized, setFormInitialized] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [, setUploadingFiles] = useState({});

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

  const [existingDocuments, setExistingDocuments] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});
  const [removedDocuments, setRemovedDocuments] = useState({});

  // Fetch data from slices
  const { currentEmployee, loading: employeeLoading } = useSelector(
    (state) => state.employees || {},
  );
  const { organizations = [] } = useSelector(
    (state) => state.organizations || {},
  );
  const { companies = [] } = useSelector((state) => state.companies || {});
  const { designations = [] } = useSelector(
    (state) => state.designations || {},
  );
  const { departments = [] } = useSelector((state) => state.departments || {});
  const { roles = [] } = useSelector((state) => state.roles || {});

  // Initialize useForm
  const {
    control,
    handleSubmit,
    watch,
    setValue,
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
      role: "",
    },
    shouldUnregister: false,
    mode: "onChange",
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
    dispatch(fetchRoles());
  }, [dispatch]);

  // Fetch companies when organization changes
  useEffect(() => {
    if (watchOrganizationId) {
      dispatch(fetchCompanies(watchOrganizationId));
    }
  }, [watchOrganizationId, dispatch]);

  // Fetch employee data
  useEffect(() => {
    if (id && !formInitialized) {
      dispatch(fetchEmployeeById(id)).then(() => {
        setInitialLoading(false);
      });
    }
  }, [dispatch, id, formInitialized]);

  // Set form values when employee data is loaded
  useEffect(() => {
    if (currentEmployee && !formInitialized) {
      console.log("Initializing form with employee data:", currentEmployee);

      // Basic Info
      setValue("first_name", currentEmployee.first_name || "");
      setValue("last_name", currentEmployee.last_name || "");
      setValue(
        "organization_id",
        currentEmployee.organization_id ||
          currentEmployee.organization?.id ||
          "",
      );
      setValue(
        "company_id",
        currentEmployee.company_id || currentEmployee.company?.id || "",
      );
      setValue(
        "designation_id",
        currentEmployee.designation_id || currentEmployee.designation?.id || "",
      );
      setValue(
        "department_id",
        currentEmployee.department_id || currentEmployee.department?.id || "",
      );
      setValue("employee_id", currentEmployee.employee_id || "");
      const userType =
        currentEmployee.user?.type || currentEmployee.type || "employee";
      console.log("Setting type to:", userType);
      setValue("type", userType);
      setValue(
        "total_leaves_allocated",
        currentEmployee.total_leaves_allocated || 30,
      );
      setValue("joining_date", currentEmployee.joining_date || "");
      setValue("dob", currentEmployee.dob || "");
      setValue("gender", currentEmployee.gender || "male");
      setValue("nationality", currentEmployee.nationality || "");
      setValue("marital_status", currentEmployee.marital_status || "");
      setValue(
        "username",
        currentEmployee.username || currentEmployee.user?.username || "",
      );

      // Handle special days (parse JSON if needed)
      try {
        const parsedSpecialDays = currentEmployee.special_days
          ? JSON.parse(currentEmployee.special_days)
          : [{ name: "", date: "" }];
        if (Array.isArray(parsedSpecialDays) && parsedSpecialDays.length > 0) {
          setValue("special_days", parsedSpecialDays);
        } else {
          setValue("special_days", [{ name: "", date: "" }]);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setValue("special_days", [{ name: "", date: "" }]);
      }

      // Passport details
      setValue("passport_full_name", currentEmployee.passport_full_name || "");
      setValue("passport_number", currentEmployee.passport_number || "");
      setValue(
        "passport_issued_date",
        currentEmployee.passport_issued_date || "",
      );
      setValue(
        "passport_expiry_date",
        currentEmployee.passport_expiry_date || "",
      );
      setValue("father_name", currentEmployee.father_name || "");
      setValue("mother_name", currentEmployee.mother_name || "");
      setValue("address", currentEmployee.address || "");
      setValue(
        "passport_issued_from",
        currentEmployee.passport_issued_from || "",
      );
      setValue("place_of_birth", currentEmployee.place_of_birth || "");

      // Visa & Labor
      setValue("visa_number", currentEmployee.visa_number || "");
      setValue("visa_type", currentEmployee.visa_type || "");
      setValue("visa_issued_date", currentEmployee.visa_issued_date || "");
      setValue("visa_expiry_date", currentEmployee.visa_expiry_date || "");
      setValue("labor_number", currentEmployee.labor_number || "");
      setValue("labor_issued_date", currentEmployee.labor_issued_date || "");
      setValue("labor_expiry_date", currentEmployee.labor_expiry_date || "");

      // EID
      setValue("eid_number", currentEmployee.eid_number || "");
      setValue("eid_issued_date", currentEmployee.eid_issued_date || "");
      setValue("eid_expiry_date", currentEmployee.eid_expiry_date || "");

      // Contact & Others
      setValue("dependents", currentEmployee.dependents || 0);
      setValue("company_email", currentEmployee.company_email || "");
      setValue(
        "company_mobile_number",
        currentEmployee.company_mobile_number || "",
      );
      setValue("personal_number", currentEmployee.personal_number || "");
      setValue("personal_email", currentEmployee.personal_email || "");
      setValue("other_number", currentEmployee.other_number || "");
      setValue(
        "home_country_number",
        currentEmployee.home_country_number || "",
      );
      setValue("role", currentEmployee.role || "");

      // Set existing documents
      const docs = {};
      const docFields = [
        "avatar",
        "passport_size_photo",
        "passport_1st_page",
        "passport_2nd_page",
        "passport_outer_page",
        "passport_id_page",
        "visa_page",
        "labor_card",
        "labor_contract",
        "eid_1st_page",
        "eid_2nd_page",
        "educational_1st_page",
        "educational_2nd_page",
        "home_country_id_proof",
      ];

      docFields.forEach((field) => {
        if (currentEmployee[field]) {
          docs[field] = currentEmployee[field];
        }
      });
      setExistingDocuments(docs);

      setFormInitialized(true);
    }
  }, [currentEmployee, setValue, formInitialized]);

  const steps = [
    { number: 1, title: "Basic Info", icon: "fas fa-user-circle" },
    { number: 2, title: "Passport", icon: "fas fa-passport" },
    { number: 3, title: "Visa & Labor", icon: "fas fa-file-contract" },
    { number: 4, title: "EID", icon: "fas fa-id-card" },
    { number: 5, title: "Contact", icon: "fas fa-address-card" },
  ];

  // const userTypeOptions = ["employee", "admin"];

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
        return ["company_email", "personal_email"];
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

  const handleFileChange = async (fieldKey, file) => {
    if (!file) return;

    const fileSize = file.size / 1024 / 1024;
    const maxSize = fieldKey === "avatar" ? 2 : 5;
    if (fileSize > maxSize) {
      showToast(`File must be less than ${maxSize}MB`, "error");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews((prev) => ({
          ...prev,
          [fieldKey]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews((prev) => ({ ...prev, [fieldKey]: "pdf" }));
    }

    setUploadingFiles((prev) => ({ ...prev, [fieldKey]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        "/admin/employees/upload-temp",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const result = response.data;

      if (result.status && result.path) {
        setDocuments((prev) => ({ ...prev, [fieldKey]: result.path }));
        setRemovedDocuments((prev) => ({ ...prev, [fieldKey]: true }));
        showToast(`Uploaded successfully`, "success");
      } else {
        showToast(`Failed to upload`, "error");
        setDocumentPreviews((prev) => ({ ...prev, [fieldKey]: null }));
      }
    } catch (error) {
      showToast(`Upload failed: ${error.message}`, "error");
      setDocumentPreviews((prev) => ({ ...prev, [fieldKey]: null }));
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleRemoveExistingDocument = (fieldKey) => {
    setRemovedDocuments({ ...removedDocuments, [fieldKey]: true });
    setExistingDocuments({ ...existingDocuments, [fieldKey]: null });
  };

  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}/storage/${documentPath}`;
  };

  const handleNext = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: false }));
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

    console.log("=== FORM DATA BEING SUBMITTED ===");
    console.log("Type value:", data.type);
    console.log("Type type:", typeof data.type);

    let typeValue = data.type;
    if (typeValue !== "admin" && typeValue !== "employee") {
      console.warn("Invalid type value detected:", typeValue);
      typeValue = "employee"; // Default fallback
    }

    const submitData = new FormData();

    // Add all form fields
    submitData.append("first_name", data.first_name);
    if (data.last_name) submitData.append("last_name", data.last_name);
    submitData.append("organization_id", parseInt(data.organization_id));
    submitData.append("company_id", parseInt(data.company_id));
    if (data.designation_id)
      submitData.append("designation_id", parseInt(data.designation_id));
    if (data.department_id)
      submitData.append("department_id", parseInt(data.department_id));
    submitData.append("employee_id", data.employee_id);
    const userType = data.type || "employee";
    console.log("Submitting type:", userType);
    submitData.append("type", typeValue);
    submitData.append(
      "total_leaves_allocated",
      parseInt(data.total_leaves_allocated),
    );
    if (data.joining_date) submitData.append("joining_date", data.joining_date);
    if (data.dob) submitData.append("dob", data.dob);
    if (data.gender) submitData.append("gender", data.gender);
    if (data.nationality) submitData.append("nationality", data.nationality);
    if (data.marital_status)
      submitData.append("marital_status", data.marital_status);
    if (data.username) submitData.append("username", data.username);

    console.log("FormData entries:");
    for (let pair of submitData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Handle special days
    if (data.special_days && data.special_days.length > 0) {
      const validSpecialDays = data.special_days.filter(
        (day) => day.name && day.date,
      );
      submitData.append("special_days", JSON.stringify(validSpecialDays));
    }

    // Passport details
    if (data.passport_full_name)
      submitData.append("passport_full_name", data.passport_full_name);
    if (data.passport_number)
      submitData.append("passport_number", data.passport_number);
    if (data.passport_issued_date)
      submitData.append("passport_issued_date", data.passport_issued_date);
    if (data.passport_expiry_date)
      submitData.append("passport_expiry_date", data.passport_expiry_date);
    if (data.father_name) submitData.append("father_name", data.father_name);
    if (data.mother_name) submitData.append("mother_name", data.mother_name);
    if (data.address) submitData.append("address", data.address);
    if (data.passport_issued_from)
      submitData.append("passport_issued_from", data.passport_issued_from);
    if (data.place_of_birth)
      submitData.append("place_of_birth", data.place_of_birth);

    // Visa & Labor
    if (data.visa_number) submitData.append("visa_number", data.visa_number);
    if (data.visa_type) submitData.append("visa_type", data.visa_type);
    if (data.visa_issued_date)
      submitData.append("visa_issued_date", data.visa_issued_date);
    if (data.visa_expiry_date)
      submitData.append("visa_expiry_date", data.visa_expiry_date);
    if (data.labor_number) submitData.append("labor_number", data.labor_number);
    if (data.labor_issued_date)
      submitData.append("labor_issued_date", data.labor_issued_date);
    if (data.labor_expiry_date)
      submitData.append("labor_expiry_date", data.labor_expiry_date);

    // EID
    if (data.eid_number) submitData.append("eid_number", data.eid_number);
    if (data.eid_issued_date)
      submitData.append("eid_issued_date", data.eid_issued_date);
    if (data.eid_expiry_date)
      submitData.append("eid_expiry_date", data.eid_expiry_date);

    // Contact & Others
    if (data.dependents !== undefined)
      submitData.append("dependents", parseInt(data.dependents));
    if (data.company_email)
      submitData.append("company_email", data.company_email);
    if (data.company_mobile_number)
      submitData.append("company_mobile_number", data.company_mobile_number);
    if (data.personal_number)
      submitData.append("personal_number", data.personal_number);
    if (data.personal_email)
      submitData.append("personal_email", data.personal_email);
    if (data.other_number) submitData.append("other_number", data.other_number);
    if (data.home_country_number)
      submitData.append("home_country_number", data.home_country_number);
    if (data.role) submitData.append("role", data.role);

    // Add new documents
    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        submitData.append(key, documents[key]);
      }
    });

    // Add removed documents flag
    Object.keys(removedDocuments).forEach((key) => {
      if (removedDocuments[key] && existingDocuments[key]) {
        submitData.append(`remove_${key}`, "true");
      }
    });

    // Add _method field for PUT request
    submitData.append("_method", "PUT");

    console.log("Updating employee with FormData");

    const result = await dispatch(
      updateEmployee({ id: parseInt(id), data: submitData }),
    );
    setLoading(false);

    if (updateEmployee.fulfilled.match(result)) {
      showToast(
        `✓ Employee "${data.first_name} ${data.last_name || ""}" updated successfully!`,
        "success",
      );
      setTimeout(() => {
        navigate("/employees");
      }, 1200);
    } else {
      const errorPayload = result.payload;
      if (errorPayload && errorPayload.errors) {
        const errorMessages = Object.entries(errorPayload.errors).map(
          ([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages[0] : messages}`;
          },
        );
        showToast(errorMessages.join("\n"), "error");
      } else if (typeof errorPayload === "string") {
        showToast(errorPayload, "error");
      } else {
        showToast("Failed to update employee", "error");
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
    employee_id: { required: "Employee ID is required" },
    organization_id: { required: "Organization is required" },
    company_id: { required: "Company is required" },
    designation_id: { required: "Designation is required" },
    department_id: { required: "Department is required" },
    username: {
      required: "Username is required",
      minLength: {
        value: 3,
        message: "Username must be at least 3 characters",
      },
    },
    company_email: {
      required: "Company email is required",
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
  };

  // Date validation functions
  const validateIssueDate = (issueDate, expiryDate, fieldName) => {
    if (!issueDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const issue = new Date(issueDate);

    if (issue > today) return `${fieldName} cannot be in the future`;
    if (expiryDate && issue >= new Date(expiryDate))
      return `Issued date must be before expiry date`;
    return true;
  };

  const validateExpiryDate = (expiryDate, issueDate, fieldName) => {
    if (!expiryDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);

    if (expiry < today) return `${fieldName} cannot be in the past`;
    if (issueDate && expiry <= new Date(issueDate))
      return `Expiry date must be after issued date`;
    return true;
  };

  if (initialLoading || employeeLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to="/employees"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Employees
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500">Edit Employee</span>
      </div>

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
          <i className="fas fa-user-edit mr-2"></i> Edit Employee
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Update employee information
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
        <form onSubmit={handleSubmit(onSubmit)}>
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
            {currentStep === 0 && (
              <div>
                <div className="form-section-title mb-4 md:mb-6">
                  <i className="fas fa-user-circle text-green-500 mr-2"></i>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Basic Information
                  </h3>
                </div>
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
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.first_name ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
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
                            value={field.value || ""}
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
                            value={field.value || ""}
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
                            value={field.value || ""}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:ring-2 ${errors.designation_id ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
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
                            value={field.value || ""}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:ring-2 ${errors.department_id ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
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
                      rules={{ required: "User type is required" }}
                      render={({ field }) => (
                        <>
                          <select
                            {...field}
                            value={field.value || "employee"}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.type ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                          >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
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

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                      <i className="fas fa-calendar-week text-green-500 mr-1"></i>{" "}
                      Leave Allocation (Days) *
                    </label>
                    <Controller
                      name="total_leaves_allocated"
                      control={control}
                      rules={validationRules.total_leaves_allocated}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            type="number"
                            className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border rounded-lg text-sm md:text-base text-gray-800 transition-all focus:outline-none focus:ring-2 ${errors.total_leaves_allocated ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
                          />
                          {errors.total_leaves_allocated && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.total_leaves_allocated.message}
                            </p>
                          )}
                        </>
                      )}
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
                          id="avatar_edit"
                          accept="image/png,image/jpeg,image/jpg,image/gif"
                          onChange={(e) =>
                            handleFileChange("avatar", e.target.files[0])
                          }
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("avatar_edit").click()
                          }
                          className="h-40 w-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-green-400 transition-colors flex items-center justify-center overflow-hidden"
                        >
                          {documentPreviews.avatar ? (
                            <img
                              src={documentPreviews.avatar}
                              alt="Passport size"
                              className="h-full w-full object-cover"
                            />
                          ) : existingDocuments.avatar &&
                            !removedDocuments.avatar ? (
                            <img
                              src={getDocumentUrl(existingDocuments.avatar)}
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
                              document.getElementById("avatar_edit").click()
                            }
                            className="px-4 py-2 bg-white border border-green-200 text-green-600 rounded-full text-sm font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
                          >
                            <i className="fas fa-upload"></i> Upload Photo
                          </button>
                          <p className="text-sm text-gray-500 mt-2 truncate">
                            {documents.avatar
                              ? "New photo selected"
                              : existingDocuments.avatar &&
                                  !removedDocuments.avatar
                                ? "Current photo available"
                                : "No photo chosen"}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            <i className="fas fa-info-circle mr-1"></i>{" "}
                            Accepted: JPG, PNG, GIF. Max 2MB.
                          </p>
                          {(documents.avatar ||
                            (existingDocuments.avatar &&
                              !removedDocuments.avatar)) && (
                            <button
                              type="button"
                              onClick={() => {
                                setDocuments({ ...documents, avatar: null });
                                setDocumentPreviews({
                                  ...documentPreviews,
                                  avatar: null,
                                });
                                if (existingDocuments.avatar) {
                                  handleRemoveExistingDocument("avatar");
                                }
                              }}
                              className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                            >
                              <i className="fas fa-trash"></i> Remove
                            </button>
                          )}
                        </div>
                      </div>
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
                          existingDocument={
                            existingDocuments.educational_1st_page
                          }
                          removed={removedDocuments.educational_1st_page}
                          preview={documentPreviews.educational_1st_page}
                          newFile={documents.educational_1st_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("educational_1st_page")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              educational_1st_page: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              educational_1st_page: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="educational_2nd_page"
                          label="Educational Certificate (Back)"
                          icon="fas fa-graduation-cap"
                          existingDocument={
                            existingDocuments.educational_2nd_page
                          }
                          removed={removedDocuments.educational_2nd_page}
                          preview={documentPreviews.educational_2nd_page}
                          newFile={documents.educational_2nd_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("educational_2nd_page")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              educational_2nd_page: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              educational_2nd_page: null,
                            });
                          }}
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
                      existingDocument={existingDocuments.home_country_id_proof}
                      removed={removedDocuments.home_country_id_proof}
                      preview={documentPreviews.home_country_id_proof}
                      newFile={documents.home_country_id_proof}
                      onFileChange={handleFileChange}
                      onRemove={() =>
                        handleRemoveExistingDocument("home_country_id_proof")
                      }
                      onCancelNew={() => {
                        setDocuments({
                          ...documents,
                          home_country_id_proof: null,
                        });
                        setDocumentPreviews({
                          ...documentPreviews,
                          home_country_id_proof: null,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 - Passport */}
            {currentStep === 1 && (
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
                          existingDocument={existingDocuments.passport_1st_page}
                          removed={removedDocuments.passport_1st_page}
                          preview={documentPreviews.passport_1st_page}
                          newFile={documents.passport_1st_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("passport_1st_page")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              passport_1st_page: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              passport_1st_page: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="passport_2nd_page"
                          label="Passport 2nd Page"
                          icon="fas fa-passport"
                          existingDocument={existingDocuments.passport_2nd_page}
                          removed={removedDocuments.passport_2nd_page}
                          preview={documentPreviews.passport_2nd_page}
                          newFile={documents.passport_2nd_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("passport_2nd_page")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              passport_2nd_page: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              passport_2nd_page: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="passport_outer_page"
                          label="Passport Outer Page"
                          icon="fas fa-passport"
                          existingDocument={
                            existingDocuments.passport_outer_page
                          }
                          removed={removedDocuments.passport_outer_page}
                          preview={documentPreviews.passport_outer_page}
                          newFile={documents.passport_outer_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("passport_outer_page")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              passport_outer_page: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              passport_outer_page: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="passport_id_page"
                          label="Passport ID Page"
                          icon="fas fa-id-card"
                          existingDocument={existingDocuments.passport_id_page}
                          removed={removedDocuments.passport_id_page}
                          preview={documentPreviews.passport_id_page}
                          newFile={documents.passport_id_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("passport_id_page")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              passport_id_page: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              passport_id_page: null,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - Visa & Labor */}
            {currentStep === 2 && (
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
                          existingDocument={existingDocuments.visa_page}
                          removed={removedDocuments.visa_page}
                          preview={documentPreviews.visa_page}
                          newFile={documents.visa_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("visa_page")
                          }
                          onCancelNew={() => {
                            setDocuments({ ...documents, visa_page: null });
                            setDocumentPreviews({
                              ...documentPreviews,
                              visa_page: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="labor_card"
                          label="Labor Card Copy"
                          icon="fas fa-id-card"
                          existingDocument={existingDocuments.labor_card}
                          removed={removedDocuments.labor_card}
                          preview={documentPreviews.labor_card}
                          newFile={documents.labor_card}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("labor_card")
                          }
                          onCancelNew={() => {
                            setDocuments({ ...documents, labor_card: null });
                            setDocumentPreviews({
                              ...documentPreviews,
                              labor_card: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="labor_contract"
                          label="Labor Contract"
                          icon="fas fa-file-signature"
                          existingDocument={existingDocuments.labor_contract}
                          removed={removedDocuments.labor_contract}
                          preview={documentPreviews.labor_contract}
                          newFile={documents.labor_contract}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("labor_contract")
                          }
                          onCancelNew={() => {
                            setDocuments({
                              ...documents,
                              labor_contract: null,
                            });
                            setDocumentPreviews({
                              ...documentPreviews,
                              labor_contract: null,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - EID */}
            {currentStep === 3 && (
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
                          existingDocument={existingDocuments.eid_1st_page}
                          removed={removedDocuments.eid_1st_page}
                          preview={documentPreviews.eid_1st_page}
                          newFile={documents.eid_1st_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("eid_1st_page")
                          }
                          onCancelNew={() => {
                            setDocuments({ ...documents, eid_1st_page: null });
                            setDocumentPreviews({
                              ...documentPreviews,
                              eid_1st_page: null,
                            });
                          }}
                        />
                        <DocumentUpload
                          fieldKey="eid_2nd_page"
                          label="EID Back Side"
                          icon="fas fa-id-card"
                          existingDocument={existingDocuments.eid_2nd_page}
                          removed={removedDocuments.eid_2nd_page}
                          preview={documentPreviews.eid_2nd_page}
                          newFile={documents.eid_2nd_page}
                          onFileChange={handleFileChange}
                          onRemove={() =>
                            handleRemoveExistingDocument("eid_2nd_page")
                          }
                          onCancelNew={() => {
                            setDocuments({ ...documents, eid_2nd_page: null });
                            setDocumentPreviews({
                              ...documentPreviews,
                              eid_2nd_page: null,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 - Contact */}
            {currentStep === 4 && (
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
                      Company Email *
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
                            placeholder="name@company.com"
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
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
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
                    <i className="fas fa-spinner fa-spin"></i> Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Update Employee
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

// DocumentUpload component for reusability
const DocumentUpload = ({
  fieldKey,
  label,
  icon,
  existingDocument,
  removed,
  preview,
  newFile,
  onFileChange,
  onRemove,
  onCancelNew,
}) => {
  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}/storage/${documentPath}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <i className={`${icon} text-green-500 mr-2`}></i>
        {label}
        <span className="text-xs text-gray-400 ml-2">(Optional)</span>
      </label>

      {/* Existing Document Display */}
      {existingDocument && !removed && !newFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <i className="fas fa-file-alt text-green-500"></i>
              <span className="text-sm text-gray-600">
                Current document uploaded
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href={getDocumentUrl(existingDocument)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
              >
                <i className="fas fa-download"></i> View
              </a>
              <button
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
              >
                <i className="fas fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="file"
          id={`${fieldKey}_edit`}
          accept="image/*,.pdf"
          onChange={(e) => onFileChange(fieldKey, e.target.files[0])}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => document.getElementById(`${fieldKey}_edit`).click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-upload"></i>{" "}
          {existingDocument && !removed && !newFile ? "Replace" : "Choose File"}
        </button>
        {newFile && (
          <span className="text-sm text-gray-500 truncate flex-1">
            {newFile?.name}
          </span>
        )}
        {!newFile && !existingDocument && (
          <span className="text-sm text-gray-400">No file chosen</span>
        )}
      </div>

      {/* Preview for new file */}
      {newFile && preview && preview !== "pdf" && (
        <div className="mt-3">
          <img
            src={preview}
            alt={label}
            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={onCancelNew}
            className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <i className="fas fa-trash"></i> Cancel Upload
          </button>
        </div>
      )}

      {newFile && preview === "pdf" && (
        <div className="mt-3">
          <div className="h-20 w-20 bg-red-100 rounded-lg flex items-center justify-center border border-gray-200">
            <i className="fas fa-file-pdf text-red-500 text-3xl"></i>
          </div>
          <button
            type="button"
            onClick={onCancelNew}
            className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <i className="fas fa-trash"></i> Cancel Upload
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        <i className="fas fa-info-circle mr-1"></i> Max size: 5MB. Allowed: JPG,
        PNG, PDF
      </p>
    </div>
  );
};

export default EditEmployee;
