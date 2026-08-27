import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const STEPS = [
  { id: 1, label: "Exit Initiation", subtitle: "Start Process", path: "/admin/employees/offboarding-initiation" },
  { id: 2, label: "Handover", subtitle: "Responsibilities", path: "/admin/employees/offboarding/handover" },
  { id: 3, label: "Leave Check", subtitle: "Encashment", path: "/admin/employees/offboarding/leave-check" },
  { id: 4, label: "Access Removal", subtitle: "Revoke Access", path: "/admin/employees/offboarding/access-removal" },
  { id: 5, label: "FnF Settlement", subtitle: "Final Payment", path: "/admin/employees/final-settlement" },
  { id: 6, label: "Documentation", subtitle: "Letters & Exit", path: "/admin/employees/letters-and-clearance" },
];

const OffboardingHeader = ({ currentStep }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProgress, currentOffboarding } = useSelector((state) => state.offboarding);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getOffboardingId = () => {
    const urlParams = new URLSearchParams(location.search);
    return location.state?.id || urlParams.get('id') || localStorage.getItem("offboarding_id");
  };
  
  const combinedStatus = currentProgress?.status ?? currentOffboarding?.status;
  
  let apiCalculatedStep = null;
  if (combinedStatus) {
     if (combinedStatus === "completed" || currentProgress?.progress_percentage === 100) apiCalculatedStep = 7;
     else if (combinedStatus.includes("initiation")) apiCalculatedStep = 1;
     else if (combinedStatus.includes("handover")) apiCalculatedStep = 2;
     else if (combinedStatus.includes("leave")) apiCalculatedStep = 3;
     else if (combinedStatus.includes("access")) apiCalculatedStep = 4;
     else if (combinedStatus.includes("settlement")) apiCalculatedStep = 5;
     else if (combinedStatus.includes("documentation") || combinedStatus.includes("letter")) apiCalculatedStep = 6;
  }

  const maxAllowedStep = apiCalculatedStep ? apiCalculatedStep : currentStep;

  // Allow clicking any step so users can view fields without filling out the previous step
  const canNavigateToStep = (stepId) => {
    return true; // Used to be: return stepId <= maxAllowedStep;
  };
  
  const handleStepClick = (step) => {
    if (canNavigateToStep(step.id)) {
      const id = getOffboardingId();
      navigate(`${step.path}${id ? `?id=${id}` : ''}`);
    }
  };

  if (!isMobile) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 px-6 py-6 sm:px-8 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/admin/employees/offboarding")}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Offboarding Process
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < maxAllowedStep && step.id !== currentStep;
            const isActive = step.id === currentStep;
            const isClickable = canNavigateToStep(step.id);
            
            return (
              <React.Fragment key={step.id}>
                <div 
                  className="flex flex-col items-center relative z-10"
                  onClick={() => handleStepClick(step)}
                  style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isCompleted
                        ? "bg-green-600 border-green-600 text-white shadow-sm shadow-green-500/20"
                        : isActive
                        ? "bg-white dark:bg-gray-800 border-green-600 text-green-600 ring-4 ring-green-50 dark:ring-green-950/30"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                    } ${isClickable ? 'hover:scale-105 hover:shadow-md' : 'opacity-60'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} strokeWidth={2} />
                    ) : (
                      <span className="font-bold">{step.id}</span>
                    )}
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold transition-colors ${
                      maxAllowedStep >= step.id
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-400"
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 -mt-10 bg-gray-100 dark:bg-gray-700">
                    <div 
                      className="h-full bg-green-600 transition-all duration-500 ease-in-out" 
                      style={{ 
                        width: maxAllowedStep > step.id ? "100%" : "0%" 
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 px-3 py-3 rounded-2xl shadow-soft">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={() => navigate("/admin/employees/offboarding")}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            Offboarding
          </h2>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {currentStep}/{STEPS.length}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-2.5">
          <div 
            className="h-full bg-green-600 rounded-full transition-all duration-500 ease-in-out"
            style={{ 
              width: `${((Math.max(currentStep, maxAllowedStep) - 1) / (STEPS.length - 1)) * 100}%` 
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          {STEPS.map((step) => {
            const isCompleted = step.id < maxAllowedStep && step.id !== currentStep;
            const isActive = step.id === currentStep;
            const isClickable = canNavigateToStep(step.id);

            return (
              <div 
                key={step.id}
                className="flex flex-col items-center relative"
                onClick={() => handleStepClick(step)}
                style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isActive
                      ? "bg-white dark:bg-gray-800 border-green-600 text-green-600 ring-2 ring-green-50 dark:ring-green-950/30"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                  } ${isClickable ? 'hover:scale-105' : 'opacity-60'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={12} strokeWidth={2} />
                  ) : (
                    <span className="font-bold text-[10px]">{step.id}</span>
                  )}
                </div>
                
                <p className={`text-[7px] font-semibold mt-1 text-center leading-tight max-w-[40px] ${
                  maxAllowedStep >= step.id
                    ? "text-gray-900 dark:text-white" 
                    : "text-gray-400"
                }`}>
                  {step.label.length > 8 ? step.label.substring(0, 6) + '…' : step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
            Step {currentStep}
          </span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
            {STEPS.find(s => s.id === currentStep)?.label || ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OffboardingHeader;