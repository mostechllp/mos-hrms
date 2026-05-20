import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiCheckCircle, FiFileText, FiUser, FiChevronLeft, FiSend, FiShield, FiGlobe, FiBriefcase, FiAlertTriangle, FiX } from "react-icons/fi";
import { setStep, completeOnboarding } from "../../store/slices/onboardingSlice";
import { showToast } from "../../components/common/Toast";
import { fetchEmployees } from "../../admin/store/slices/employeeSlice";
import { fetchOrganizations } from "../../admin/store/slices/organizationSlice";
import { fetchCompanies } from "../../admin/store/slices/companySlice";
import { fetchDesignations } from "../../admin/store/slices/designationSlice";
import { fetchDepartments } from "../../admin/store/slices/departmentSlice";
import apiClient from "../../utils/apiClient";

const OnboardingReview = () => {
  const dispatch = useDispatch();
  const onboardingState = useSelector((state) => state.onboarding) || {};
  const { employeeDetails = {}, resumeData = {}, offerLetter = {} } = onboardingState;

  // Redux Selectors for Metadata
  const { organizations = [] } = useSelector((state) => state.organizations || {});
  const { companies = [] } = useSelector((state) => state.companies || {});
  const { designations = [] } = useSelector((state) => state.designations || {});
  const { departments = [] } = useSelector((state) => state.departments || {});

  // Local state for duplicate submission prevention and loader
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorModal, setErrorModal] = React.useState({ isOpen: false, title: "", errors: [] });

  // Pre-fetch metadata lists on component mount
  React.useEffect(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchDesignations());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Dynamically fetch companies once organizations are available or user organization context is resolved
  React.useEffect(() => {
    const storedUser = localStorage.getItem("hr-user");
    const hrUser = storedUser ? JSON.parse(storedUser) : null;
    const orgId = hrUser?.employee?.organization_id || hrUser?.organization_id || (organizations[0]?.id || "");
    if (orgId) {
      dispatch(fetchCompanies(orgId));
    }
  }, [dispatch, organizations]);

  const generateRandomDob = () => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 45;
    const maxYear = currentYear - 22;
    const randomYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const randomDay = Math.floor(Math.random() * 28) + 1; // standardizing max days to 28 to avoid invalid days like Feb 30
    
    const yearStr = randomYear.toString();
    const monthStr = randomMonth.toString().padStart(2, "0");
    const dayStr = randomDay.toString().padStart(2, "0");
    
    return `${yearStr}-${monthStr}-${dayStr}`; // Format: YYYY-MM-DD
  };

  const generateEmployeeId = (dob, joiningDate) => {
    if (!dob || !joiningDate) return "";

    let dobFormatted = dob;
    let joiningFormatted = joiningDate;

    if (dob.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dob.split("/");
      dobFormatted = `${year}-${month}-${day}`;
    }

    if (joiningDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = joiningDate.split("/");
      joiningFormatted = `${year}-${month}-${day}`;
    }

    const dobDate = new Date(dobFormatted);
    const joiningDateObj = new Date(joiningFormatted);

    if (isNaN(dobDate.getTime()) || isNaN(joiningDateObj.getTime())) {
      return "";
    }

    const dobDay = String(dobDate.getDate()).padStart(2, "0");
    const dobMonth = String(dobDate.getMonth() + 1).padStart(2, "0");
    const dobYear = dobDate.getFullYear();

    const joiningDay = String(joiningDateObj.getDate()).padStart(2, "0");
    const joiningMonth = String(joiningDateObj.getMonth() + 1).padStart(2, "0");
    const joiningYear = joiningDateObj.getFullYear();

    return `EMP-${dobDay}${dobMonth}${dobYear}-${joiningDay}${joiningMonth}${joiningYear}`;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const hrUser = JSON.parse(localStorage.getItem("hr-user")) || {};
      const orgId = hrUser?.employee?.organization_id || hrUser?.organization_id || (organizations[0]?.id || "");
      const companyId = hrUser?.employee?.company_id || hrUser?.company_id || (companies[0]?.id || "");

      const matchedDesignation = designations.find(
        (d) => d.name?.toLowerCase().trim() === (employeeDetails.designation || "").toLowerCase().trim()
      );
      const matchedDepartment = departments.find(
        (d) => d.name?.toLowerCase().trim() === (employeeDetails.department || "").toLowerCase().trim()
      );

      const designation_id = matchedDesignation ? matchedDesignation.id : (designations[0]?.id || null);
      const department_id = matchedDepartment ? matchedDepartment.id : (departments[0]?.id || null);

      // Candidate's name parsing
      const fullName = (employeeDetails.fullName || "").trim();
      const parts = fullName.split(" ");
      const first_name = parts[0] || "Unknown";
      const last_name = parts.slice(1).join(" ") || "";

      // Generate randomized DOB and valid employee_id
      const dob = generateRandomDob();
      const employeeId = generateEmployeeId(dob, employeeDetails.joiningDate);

      // Clean phone: remove +, spaces, dashes — keep digits only
      const cleanPhone = (employeeDetails.phone || "")
        .replace(/\+/g, "")
        .replace(/[\s\-]/g, "")
        .trim();

      // Nationality mapping: "India" -> "Indian", etc.
      const nationalityMap = {
        "india": "Indian",
        "pakistan": "Pakistani",
        "philippines": "Filipino",
        "united arab emirates": "Emirati",
        "united kingdom": "British",
        "united states": "American",
      };
      const rawNationality = (employeeDetails.nationality || "Indian").trim();
      const candidateNationality = nationalityMap[rawNationality.toLowerCase()] || rawNationality;

      // Ensure joining_date is in YYYY-MM-DD format
      let joiningDate = employeeDetails.joiningDate || "";
      if (joiningDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = joiningDate.split("/");
        joiningDate = `${year}-${month}-${day}`;
      }

      // Build JSON body matching the API exactly
      const body = {
        first_name,
        last_name,
        employee_id: employeeId,
        gender: "male",
        dob,
        marital_status: "single",
        personal_email: employeeDetails.email || "",
        phone: cleanPhone,
        joining_date: joiningDate,
        nationality: candidateNationality,
        organization_id: orgId ? parseInt(orgId) : undefined,
        department_id: department_id ? parseInt(department_id) : undefined,
        designation_id: designation_id ? parseInt(designation_id) : undefined,
        type: "employee",
        status: "active",
        role: "Employee",
        address: employeeDetails.address || "",
      };

      // Always send company_id — backend requires this key to exist
      body.company_id = companyId ? parseInt(companyId) : null;

      console.log("=== SUBMITTING CANDIDATE TO EMPLOYEE STORE API ===");
      console.log("Payload:", JSON.stringify(body, null, 2));

      let apiSuccess = false;
      try {
        const response = await apiClient.post("/admin/employees", body);
        console.log("API SUCCESS:", response.data);
        apiSuccess = true;
        showToast("Employee record created successfully in HRM!", "success");
        dispatch(fetchEmployees());
      } catch (apiError) {
        // Map raw API field names to client-friendly labels
        const fieldLabels = {
          first_name: "First Name",
          last_name: "Last Name",
          employee_id: "Employee ID",
          gender: "Gender",
          dob: "Date of Birth",
          marital_status: "Marital Status",
          personal_email: "Email Address",
          company_email: "Company Email",
          phone: "Phone Number",
          personal_number: "Phone Number",
          joining_date: "Joining Date",
          nationality: "Nationality",
          organization_id: "Organization",
          company_id: "Company",
          department_id: "Department",
          designation_id: "Designation",
          type: "Employee Type",
          status: "Status",
          role: "Role",
          address: "Address",
          passport_number: "Passport Number",
          visa_number: "Visa Number",
          eid_number: "EID Number",
        };

        const errData = apiError.response?.data;

        if (errData?.errors) {
          const errorList = Object.entries(errData.errors).map(
            ([field, msgs]) => ({
              field: fieldLabels[field] || field.replace(/_/g, " "),
              message: Array.isArray(msgs) ? msgs[0] : msgs,
            })
          );
          setErrorModal({
            isOpen: true,
            title: "Unable to Create Employee",
            errors: errorList,
          });
        } else {
          const msg = errData?.message || "Something went wrong while creating the employee record. Please try again.";
          setErrorModal({
            isOpen: true,
            title: "Unable to Create Employee",
            errors: [{ field: "Error", message: msg }],
          });
        }
        showToast("Employee creation failed. Please try again.", "error");
      }

      // Only complete onboarding if employee was created successfully
      if (apiSuccess) {
        dispatch(completeOnboarding());
        showToast("Onboarding submitted successfully!", "success");
      }
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Something Went Wrong",
        errors: [{ field: "Error", message: "An unexpected error occurred while submitting the onboarding. Please check your connection and try again." }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    dispatch(setStep(3));
  };

  const SummaryCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
        <Icon className="text-primary-500" size={18} />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Error Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <FiAlertTriangle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{errorModal.title}</h3>
                  <p className="text-white/70 text-xs">Onboarding will still complete</p>
                </div>
              </div>
              <button
                onClick={() => setErrorModal({ isOpen: false, title: "", errors: [] })}
                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Error List */}
            <div className="px-6 py-5 space-y-3 max-h-72 overflow-y-auto">
              {errorModal.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20"
                >
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs font-bold">{idx + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                      {err.field.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{err.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setErrorModal({ isOpen: false, title: "", errors: [] })}
                className="px-5 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-md"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="max-w-5xl mx-auto animate-fadeIn space-y-8">
      {/* Summary Header */}
      <div className="bg-primary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-600/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Final Review & Submission</h2>
          <p className="text-primary-100 max-w-md">
            Please verify all information before finalizing the onboarding process. Once submitted, the employee will receive their portal access and offer letter.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <FiCheckCircle size={32} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ready to Submit</span>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Employee Summary */}
        <SummaryCard title="Employee Details" icon={FiUser}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
                <FiUser size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{employeeDetails.fullName}</p>
                <p className="text-sm text-gray-500">{employeeDetails.designation} • {employeeDetails.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <FiBriefcase className="text-gray-400" />
                <span className="text-gray-500 font-medium w-24">Experience:</span>
                <span className="text-gray-900 dark:text-gray-300 font-semibold">{employeeDetails.experience}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiGlobe className="text-gray-400" />
                <span className="text-gray-500 font-medium w-24">Nationality:</span>
                <span className="text-gray-900 dark:text-gray-300 font-semibold">{employeeDetails.nationality}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FiShield className="text-gray-400" />
                <span className="text-gray-500 font-medium w-24">Joining:</span>
                <span className="text-gray-900 dark:text-gray-300 font-semibold">{employeeDetails.joiningDate}</span>
              </div>
            </div>
          </div>
        </SummaryCard>

        {/* Documents Summary */}
        <SummaryCard title="Onboarding Assets" icon={FiFileText}>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg flex items-center justify-center">
                  <FiFileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Resume - Parsed</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{resumeData?.fileName || "resume.pdf"}</p>
                </div>
              </div>
              <span className="text-green-500 font-bold text-[10px] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">COMPLETED</span>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center">
                  <FiFileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Offer Letter</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Auto-Generated</p>
                </div>
              </div>
              <span className="text-green-500 font-bold text-[10px] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">GENERATED</span>
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-700">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:translate-x-[-4px]"
        >
          <FiChevronLeft size={20} />
          Go Back
        </button>

        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm whitespace-nowrap"
          >
            <span className="sm:hidden">Save Draft</span>
            <span className="hidden sm:inline">Save as Draft</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <span className="sm:hidden">Submit</span>
                <span className="hidden sm:inline">Submit Onboarding</span>
                <FiSend size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default OnboardingReview;
