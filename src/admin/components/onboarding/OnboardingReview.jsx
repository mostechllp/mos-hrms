/* eslint-disable react-hooks/static-components */
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiCheckCircle,
  FiFileText,
  FiUser,
  FiChevronLeft,
  FiSend,
  FiShield,
  FiGlobe,
  FiBriefcase,
  FiAlertTriangle,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiCheckSquare,
  FiLink,
} from "react-icons/fi";
import {
  setStep,
  completeOnboarding,
  completeOnboardingApi,
  fetchOnboardingProgress,
} from "../../store/slices/onboardingSlice";
import { showToast } from "../../components/common/Toast";
import { fetchEmployees } from "../../store/slices/employeeSlice";

const OnboardingReview = () => {
  const dispatch = useDispatch();
  const onboardingState = useSelector((state) => state.onboarding) || {};
  const {
    employeeDetails = {},
    resumeData = {},
    professionalVerification = {},
    detailsId = null,
  } = onboardingState;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorModal, setErrorModal] = React.useState({
    isOpen: false,
    title: "",
    errors: [],
  });

  // ── Derived display values ──
  const displayFullName =
    employeeDetails.fullName ||
    [employeeDetails.firstName, employeeDetails.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "—";

  const displayDesignation =
    employeeDetails.designation ||
    employeeDetails.designationName ||
    employeeDetails.jobTitle ||
    employeeDetails.user?.designation?.name ||
    "—";

  const displayDepartment =
    employeeDetails.department ||
    employeeDetails.departmentName ||
    employeeDetails.user?.department?.name ||
    "—";

  const resolvedCompleteId =
    detailsId ||
    employeeDetails.userId ||
    employeeDetails.id ||
    (() => {
      try {
        return localStorage.getItem("onboarding_user_id");
      } catch {
        return null;
      }
    })();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!resolvedCompleteId) {
      setErrorModal({
        isOpen: true,
        title: "Cannot Complete Onboarding",
        errors: [
          {
            field: "Missing ID",
            message:
              "We couldn't find the onboarding record id. Please make sure all previous steps were saved, then try again.",
          },
        ],
      });
      showToast("Missing onboarding id", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(completeOnboardingApi(resolvedCompleteId)).unwrap();
      dispatch(completeOnboarding());
      dispatch(fetchOnboardingProgress(resolvedCompleteId));
      showToast("Onboarding completed successfully!", "success");
      dispatch(fetchEmployees());
    } catch (err) {
      const rawMsg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to complete onboarding";

      setErrorModal({
        isOpen: true,
        title: "Unable to Complete Onboarding",
        errors: [{ field: "Error", message: rawMsg }],
      });
      showToast("Onboarding completion failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => dispatch(setStep(6));

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        "onboarding-draft",
        JSON.stringify(onboardingState),
      );
      showToast("Draft saved successfully!", "success");
    } catch {
      showToast("Failed to save draft", "error");
    }
  };

  const SummaryCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
        <Icon
          size={18}
          style={{ color: "var(--primary-color)" }}
        />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <>
      {/* Error Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slideUp">
            {/* Modal header uses theme gradient */}
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{
                backgroundImage: "var(--primary-gradient)",
                color: "var(--primary-contrast)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <FiAlertTriangle
                    size={22}
                    style={{ color: "var(--primary-contrast)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold text-base leading-tight"
                    style={{ color: "var(--primary-contrast)" }}
                  >
                    {errorModal.title}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: "var(--primary-contrast)",
                      opacity: 0.8,
                    }}
                  >
                    Please review and fix the issue below
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setErrorModal({ isOpen: false, title: "", errors: [] })
                }
                className="transition-colors p-1.5 hover:bg-white/15 rounded-lg"
                style={{ color: "var(--primary-contrast)", opacity: 0.8 }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3 max-h-72 overflow-y-auto">
              {errorModal.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border"
                  style={{
                    backgroundColor: "var(--primary-very-light)",
                    borderColor: "var(--primary-light)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--primary-contrast)",
                    }}
                  >
                    <span className="text-xs font-bold">{idx + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--primary-text)" }}
                    >
                      {err.field.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                      {err.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() =>
                  setErrorModal({ isOpen: false, title: "", errors: [] })
                }
                className="px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--primary-contrast)",
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto animate-fadeIn space-y-8">
        {/* Summary Header — themed banner */}
        <div
          className="rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative animate-fadeIn"
          style={{
            backgroundImage: "var(--primary-gradient)",
            color: "var(--primary-contrast)",
            boxShadow: "0 20px 40px -20px var(--primary-glow)",
          }}
        >
          <div className="relative z-10">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--primary-contrast)" }}
            >
              Final Review & Submission
            </h2>
            <p
              className="max-w-md text-sm leading-relaxed"
              style={{ color: "var(--primary-contrast)", opacity: 0.85 }}
            >
              Please verify all information before finalizing the onboarding
              process. Once submitted, the employee will receive their portal
              access and offer letter.
            </p>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <FiCheckCircle
                size={32}
                style={{ color: "var(--primary-contrast)" }}
              />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--primary-contrast)", opacity: 0.8 }}
            >
              Ready to Submit
            </span>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div
            className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--primary-glow)" }}
          ></div>
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
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {displayFullName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {displayDesignation} • {displayDepartment}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <FiBriefcase className="text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400 font-medium w-24">
                    Experience:
                  </span>
                  <span className="text-gray-900 dark:text-gray-300 font-semibold">
                    {employeeDetails.experience || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiGlobe className="text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400 font-medium w-24">
                    Nationality:
                  </span>
                  <span className="text-gray-900 dark:text-gray-300 font-semibold">
                    {employeeDetails.nationality || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiShield className="text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400 font-medium w-24">
                    Joining:
                  </span>
                  <span className="text-gray-900 dark:text-gray-300 font-semibold">
                    {employeeDetails.joiningDate?.match(/^\d{4}-\d{2}-\d{2}$/)
                      ? (() => {
                          const [year, month, day] =
                            employeeDetails.joiningDate.split("-");
                          return `${day}/${month}/${year}`;
                        })()
                      : employeeDetails.joiningDate || "—"}
                  </span>
                </div>
                {employeeDetails.specialDayEvent &&
                  employeeDetails.specialDayDate && (
                    <div className="flex items-center gap-3 text-sm">
                      <FiCalendar className="text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 font-medium w-24">
                        {employeeDetails.specialDayEvent}:
                      </span>
                      <span className="text-gray-900 dark:text-gray-300 font-semibold">
                        {employeeDetails.specialDayDate
                          ?.split("-")
                          .reverse()
                          .join("/")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </SummaryCard>

          {/* Documents Summary */}
          <SummaryCard title="Onboarding Assets" icon={FiFileText}>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--primary-very-light)",
                      color: "var(--primary-color)",
                    }}
                  >
                    <FiFileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      Resume - Parsed
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                      {resumeData?.fileName || "resume.pdf"}
                    </p>
                  </div>
                </div>
                <span
                  className="font-bold text-[10px] px-2 py-1 rounded"
                  style={{
                    backgroundColor: "var(--primary-very-light)",
                    color: "var(--primary-text)",
                  }}
                >
                  COMPLETED
                </span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center">
                    <FiFileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      Offer Letter
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                      Auto-Generated
                    </p>
                  </div>
                </div>
                <span
                  className="font-bold text-[10px] px-2 py-1 rounded"
                  style={{
                    backgroundColor: "var(--primary-very-light)",
                    color: "var(--primary-text)",
                  }}
                >
                  GENERATED
                </span>
              </div>
            </div>
          </SummaryCard>

          {/* Salary & Bank Details */}
          <div className="md:col-span-2">
            <SummaryCard title="Salary & Bank Details" icon={FiDollarSign}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Basic Salary
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {employeeDetails.currency || "INR"}{" "}
                      {parseFloat(
                        employeeDetails.basicSalary || 0,
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Other Allowance
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {employeeDetails.currency || "INR"}{" "}
                      {parseFloat(
                        employeeDetails.otherAllowance || 0,
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Total Monthly Salary
                    </p>
                    <p
                      className="text-sm font-extrabold px-3 py-1 rounded-lg inline-block"
                      style={{
                        backgroundColor: "var(--primary-very-light)",
                        color: "var(--primary-text)",
                      }}
                    >
                      {employeeDetails.currency || "INR"}{" "}
                      {parseFloat(
                        employeeDetails.totalMonthlySalary || 0,
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Payment Cycle
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {employeeDetails.paymentCycle || "Monthly"}
                    </p>
                  </div>
                </div>

                {Array.isArray(employeeDetails.salaryComponents) &&
                  employeeDetails.salaryComponents.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
                        Salary Components Breakdown
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {employeeDetails.salaryComponents.map((comp, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 dark:bg-gray-900/35 rounded-xl border border-gray-100 dark:border-gray-800/80 flex items-center justify-between"
                          >
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                              {comp.name}
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                              {employeeDetails.currency || "INR"}{" "}
                              {comp.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="border-t border-gray-100 dark:border-gray-700/60 pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Bank Name
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {employeeDetails.bankName || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Account Number
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                        {employeeDetails.accountNumber || "-"}
                      </p>
                    </div>
                    {employeeDetails.bankIfsc && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          IFSC Code
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                          {employeeDetails.bankIfsc}
                        </p>
                      </div>
                    )}
                    {employeeDetails.bankBranch && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Branch Name
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {employeeDetails.bankBranch}
                        </p>
                      </div>
                    )}
                  </div>

                  {Array.isArray(employeeDetails.customBankFields) &&
                    employeeDetails.customBankFields.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-50 dark:border-gray-700/30">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                          Additional Bank Information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {employeeDetails.customBankFields.map(
                            (field, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                  {field.key}
                                </p>
                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                  {field.value}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </SummaryCard>
          </div>
        </div>

        {/* Professional Verification */}
        <div className="md:col-span-2">
          <SummaryCard title="Professional Verification" icon={FiCheckSquare}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    label: "LinkedIn",
                    value: professionalVerification.linkedInUrl,
                  },
                  {
                    label: "GitHub",
                    value: professionalVerification.githubUrl,
                  },
                  {
                    label: "Portfolio",
                    value: professionalVerification.portfolioUrl,
                  },
                  {
                    label: "Other URL",
                    value: professionalVerification.otherUrl,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FiLink size={12} /> {label}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {value ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                          style={{ color: "var(--primary-text)" }}
                        >
                          {value}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Verification Status
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Identity Verified",
                      checked: professionalVerification.identityVerified,
                    },
                    {
                      label: "Credentials Verified",
                      checked: professionalVerification.credentialsVerified,
                    },
                    {
                      label: "Employment Info Verified",
                      checked: professionalVerification.employmentInfoVerified,
                    },
                  ].map(({ label, checked }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={
                          checked
                            ? {
                                backgroundColor: "var(--primary-color)",
                                color: "var(--primary-contrast)",
                              }
                            : {
                                backgroundColor: "rgb(229 231 235)",
                                color: "transparent",
                              }
                        }
                      >
                        <FiCheckSquare size={14} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {professionalVerification.verificationNotes && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Verification Notes
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    {professionalVerification.verificationNotes}
                  </p>
                </div>
              )}
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
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm whitespace-nowrap"
            >
              <span className="sm:hidden">Save Draft</span>
              <span className="hidden sm:inline">Save as Draft</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--primary-contrast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--primary-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--primary-color)";
              }}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--primary-contrast)" }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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