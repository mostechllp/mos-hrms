// src/admin/components/onboarding/Onboarding.jsx
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  resetOnboarding,
  restoreDraft,
  setStep,
  fetchOnboardingProgress,
  fetchEmployeeDetails,
} from "../../store/slices/onboardingSlice";
import ResumeUpload from "./ResumeUpload";
import EmployeeDetailsForm from "./EmployeeDetailsForm";
import ProfessionalVerificationForm from "./ProfessionalVerificationForm";
import SalaryBankDetailsForm from "./SalaryBankDetailsForm";
import OfferLetterPreview from "./OfferLetterPreview";
import PreOnboardingChecklist from "./PreOnboardingChecklist";
import OnboardingReview from "./OnboardingReview";
import Stepper from "./Stepper";

const PATH_SLUG_TO_WIZARD_STEP = {
  initiate: 1,
  details: 2,
  verification: 3,
  salary: 4,
  offer: 5,
  checklist: 6,
  review: 7,
};

const WIZARD_STEP_TO_SECTION = {
  1: "initiate",
  2: "details",
  3: "verification",
  4: "salary",
  5: "offer",
  6: "checklist",
  7: "review",
};

const readStoredId = () => {
  try {
    return localStorage.getItem("onboarding_user_id");
  } catch {
    return null;
  }
};

const Onboarding = () => {
  const { section } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isEmployee = location.pathname.startsWith("/employee");
  const onboardingBase = isEmployee
    ? "/employee/onboarding"
    : "/admin/employees/onboarding";

  const onboardingState = useSelector((state) => state.onboarding) || {};
  const {
    currentStep = 1,
    onboardingComplete = false,
  } = onboardingState;

  const searchParams = new URLSearchParams(window.location.search);
  const idFromUrl = searchParams.get("id");

  const didHydrateRef = useRef(false);
  // The wizard step most recently *confirmed* to match the URL.
  const lastAppliedStepRef = useRef(null);
  // Set right when we dispatch setStep() from a URL sync, cleared once
  // currentStep actually catches up. While this is non-null, Effect 6 must
  // NOT try to mirror currentStep back to the URL — currentStep is stale
  // relative to the dispatch we just fired, in THIS render's effect phase
  // (this matters especially under React StrictMode's double-invoke on
  // mount, where effects run twice before any dispatch is reflected).
  const pendingStepRef = useRef(null);

  // ── 1. Hydrate id (URL → localStorage) and fetch data ──
  useEffect(() => {
    if (section === "initiate" && !idFromUrl) return;
    const id = idFromUrl || readStoredId();
    if (!id) return;

    if (idFromUrl && idFromUrl !== readStoredId()) {
      try {
        localStorage.setItem("onboarding_user_id", String(idFromUrl));
      } catch {
        /* ignore */
      }
      didHydrateRef.current = false;
    }

    if (didHydrateRef.current) return;

    dispatch(fetchEmployeeDetails(id));
    dispatch(fetchOnboardingProgress(id));
    didHydrateRef.current = true;
  }, [dispatch, idFromUrl, section]);

  // ── 2. Sync Redux step to the URL section ──
  useEffect(() => {
    const stepFromPath = section ? PATH_SLUG_TO_WIZARD_STEP[section] : null;

    if (!stepFromPath) {
      if (lastAppliedStepRef.current != null) return;

      const storedId = readStoredId();
      if (storedId) {
        dispatch(fetchOnboardingProgress(storedId));
        return;
      }

      lastAppliedStepRef.current = 1;
      pendingStepRef.current = 1;
      dispatch(setStep(1));
      navigate(`${onboardingBase}/initiate`, { replace: true });
      return;
    }

    if (lastAppliedStepRef.current === stepFromPath) return;

    lastAppliedStepRef.current = stepFromPath;
    pendingStepRef.current = stepFromPath;
    dispatch(setStep(stepFromPath));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ── 3. Bare URL + progress loaded → jump to derived section ──
  useEffect(() => {
    if (section) return;
    if (lastAppliedStepRef.current != null) return;

    const steps = Array.isArray(onboardingState?.onboardingProgress?.steps)
      ? onboardingState.onboardingProgress.steps
      : [];
    if (steps.length === 0) return;

    const firstIncomplete =
      steps.find((s) => !(s.completed === true || s.completed === "true")) ||
      steps[steps.length - 1];

    const map = {
      details: "details",
      verification: "verification",
      salary: "salary",
      banks: "salary",
      checklist: "checklist",
      complete: "review",
    };
    const slug = map[firstIncomplete?.key] || "initiate";
    const step = PATH_SLUG_TO_WIZARD_STEP[slug];

    lastAppliedStepRef.current = step;
    pendingStepRef.current = step;
    dispatch(setStep(step));

    const id = readStoredId();
    navigate(`${onboardingBase}/${slug}${id ? `?id=${id}` : ""}`, {
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, onboardingState?.onboardingProgress]);

  // ── 4. Restore draft only on a fresh /initiate with nothing else ──
  useEffect(() => {
    if (section !== "initiate") return;
    if (idFromUrl || readStoredId()) return;

    const draft = localStorage.getItem("onboarding-draft");
    if (draft && !onboardingState.resumeData) {
      try {
        dispatch(restoreDraft(JSON.parse(draft)));
      } catch (err) {
        console.error("Failed to restore onboarding draft:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 5. Completion ──
  useEffect(() => {
    if (onboardingComplete) {
      localStorage.removeItem("onboarding-draft");
      localStorage.removeItem("onboarding_user_id");
      dispatch(resetOnboarding());
      navigate(isEmployee ? "/employee" : "/admin/employees");
    }
  }, [onboardingComplete, dispatch, navigate, isEmployee]);

  // ── 6. Mirror Redux currentStep → URL section ──
  useEffect(() => {
    if (onboardingComplete) return;

    // A URL-driven setStep dispatch is still in flight for this step —
    // currentStep hasn't caught up yet, so don't reason about it.
    if (pendingStepRef.current !== null) {
      if (currentStep === pendingStepRef.current) {
        // Caught up now — clear the pending marker. Nothing to mirror,
        // since this step originated from the URL in the first place.
        pendingStepRef.current = null;
      }
      return;
    }

    const targetSection = WIZARD_STEP_TO_SECTION[currentStep];
    if (!targetSection) return;

    if (section === targetSection) return;

    // Don't override the very first mount — effects 2/3 handle that
    if (lastAppliedStepRef.current == null) return;

    // currentStep genuinely diverged (a form advanced/rewound the step) —
    // push the URL to match, and record that we've now applied it so a
    // subsequent Effect 2 run (triggered by the navigate below) treats it
    // as already-synced rather than re-dispatching.
    lastAppliedStepRef.current = currentStep;

    const id = readStoredId() || idFromUrl;
    navigate(
      `${onboardingBase}/${targetSection}${id ? `?id=${id}` : ""}`,
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, section, onboardingComplete]);

  const handleSkipResume = () => {
    dispatch(setStep(2));
    const id = readStoredId() || idFromUrl;
    navigate(`${onboardingBase}/details${id ? `?id=${id}` : ""}`);
  };

  const renderStep = () => {
    if (onboardingComplete) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading employee directory...
          </p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <ResumeUpload onSkip={handleSkipResume} />;
      case 2:
        return <EmployeeDetailsForm />;
      case 3:
        return <ProfessionalVerificationForm />;
      case 4:
        return <SalaryBankDetailsForm />;
      case 5:
        return <OfferLetterPreview />;
      case 6:
        return <PreOnboardingChecklist />;
      case 7:
        return <OnboardingReview />;
      default:
        return <ResumeUpload onSkip={handleSkipResume} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {!onboardingComplete && (
        <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft">
          <Stepper currentStep={currentStep} />
        </div>
      )}
      <div className="relative">{renderStep()}</div>
    </div>
  );
};

export default Onboarding;