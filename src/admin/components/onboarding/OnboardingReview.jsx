/* eslint-disable react-hooks/static-components */
import { useDispatch, useSelector } from "react-redux";
import { FiCheckCircle, FiFileText, FiUser, FiChevronLeft, FiSend, FiShield, FiGlobe, FiBriefcase } from "react-icons/fi";
import { setStep, completeOnboarding } from "../../store/slices/onboardingSlice";
import { showToast } from "../common/Toast";

const OnboardingReview = () => {
  const dispatch = useDispatch();
  const onboardingState = useSelector((state) => state.onboarding) || {};
  const { employeeDetails = {}, resumeData = {} } = onboardingState;

  const handleSubmit = () => {
    dispatch(completeOnboarding());
    showToast("Onboarding submitted successfully!", "success");
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
            className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <span className="sm:hidden">Submit</span>
            <span className="hidden sm:inline">Submit Onboarding</span>
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingReview;
