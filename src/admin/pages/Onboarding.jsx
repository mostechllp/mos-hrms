import  { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { resetOnboarding } from "../store/slices/onboardingSlice";
import ResumeUpload from "../components/onboarding/ResumeUpload";
import EmployeeDetailsForm from "../components/onboarding/EmployeeDetailsForm";
import OfferLetterPreview from "../components/onboarding/OfferLetterPreview";
import OnboardingReview from "../components/onboarding/OnboardingReview";
import Stepper from "../components/onboarding/Stepper";

const Onboarding = () => {

  const onboardingState = useSelector((state) => state.onboarding) || {};
  const { currentStep = 1, onboardingComplete = false } = onboardingState;
  const dispatch = useDispatch();
  const navigate = useNavigate();



  useEffect(() => {
    if (onboardingComplete) {
      const timer = setTimeout(() => {
        dispatch(resetOnboarding());
        navigate("/admin/employees");
      }, 2000); // Redirect after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [onboardingComplete, dispatch, navigate]);


  const SuccessView = () => (
    <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
      <div className="w-32 h-32 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <FiCheck size={64} strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submitted Successfully!</h2>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Redirecting you back to onboarding...</p>
    </div>
  );

  const renderStep = () => {
    if (onboardingComplete) return <SuccessView />;
    
    switch (currentStep) {
      case 1:
        return <ResumeUpload />;
      case 2:
        return <EmployeeDetailsForm />;
      case 3:
        return <OfferLetterPreview />;
      case 4:
        return <OnboardingReview />;
      default:
        return <ResumeUpload />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Stepper Navigation - Hidden on Success */}
      {!onboardingComplete && (
        <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft">
          <Stepper currentStep={currentStep} />
        </div>
      )}

      {/* Step Content */}
      <div className="relative">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
