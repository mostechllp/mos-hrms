import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import {
  FiLink,
  FiCheckSquare,
  FiChevronRight,
  FiChevronLeft,
  FiSave,
  FiInfo,
} from "react-icons/fi";
import {
  setStep,
  updateProfessionalVerification,
  fetchProfessionalVerification,
  createProfessionalVerification,
  updateProfessionalVerificationApi,
  fetchOnboardingProgress, // <── ADD
} from "../../store/slices/onboardingSlice";
import { showToast } from "../../components/common/Toast";

const ProfessionalVerificationForm = () => {
  const dispatch = useDispatch();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");

  const onboardingState = useSelector((state) => state.onboarding) || {};
  const {
    professionalVerification = {},
    employeeDetails = {},
    verificationSaving = false,
    verificationExists = false,
    verificationId = null,
  } = onboardingState;

  const storedUserId = (() => {
    try {
      return localStorage.getItem("onboarding_user_id");
    } catch (_) {
      return null;
    }
  })();

  const resolvedUserId =
    routeId ||
    queryId ||
    verificationId ||
    employeeDetails?.userId ||
    storedUserId ||
    null;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: professionalVerification,
  });

  useEffect(() => {
    if (resolvedUserId) {
      try {
        localStorage.setItem("onboarding_user_id", String(resolvedUserId));
      } catch (_) {
        /* ignore */
      }
    }
  }, [resolvedUserId]);

  useEffect(() => {
    if (resolvedUserId) {
      dispatch(fetchProfessionalVerification(resolvedUserId));
    }
  }, [dispatch, resolvedUserId]);

  useEffect(() => {
    if (
      professionalVerification &&
      Object.keys(professionalVerification).length > 0
    ) {
      reset(professionalVerification);
    }
  }, [professionalVerification, reset]);

  const onSubmit = async (data) => {
    try {
      if (verificationExists && resolvedUserId) {
        await dispatch(
          updateProfessionalVerificationApi({
            userId: resolvedUserId,
            data,
          }),
        ).unwrap();
      } else if (resolvedUserId) {
        await dispatch(
          createProfessionalVerification({
            userId: resolvedUserId,
            data,
          }),
        ).unwrap();
      } else {
        dispatch(updateProfessionalVerification(data));
      }

      dispatch(updateProfessionalVerification(data));

      // ── Refresh onboarding progress ──
      if (resolvedUserId) {
        dispatch(fetchOnboardingProgress(resolvedUserId));
      }

      dispatch(setStep(4));
      showToast("Professional verification saved", "success");
    } catch (error) {
      console.error("Save professional verification error:", error);
      showToast(error || "Failed to save professional verification", "error");
    }
  };

  const handleBack = () => {
    dispatch(setStep(2));
  };

  const handleSaveDraft = async () => {
    const currentData = getValues();
    try {
      if (verificationExists && resolvedUserId) {
        await dispatch(
          updateProfessionalVerificationApi({
            userId: resolvedUserId,
            data: currentData,
          }),
        ).unwrap();
      } else if (resolvedUserId) {
        await dispatch(
          createProfessionalVerification({
            userId: resolvedUserId,
            data: currentData,
          }),
        ).unwrap();
      }

      dispatch(updateProfessionalVerification(currentData));

      // ── Refresh onboarding progress ──
      if (resolvedUserId) {
        dispatch(fetchOnboardingProgress(resolvedUserId));
      }

      showToast("Draft saved successfully!", "success");
    } catch (error) {
      console.error("Save draft to server failed:", error);
      const draftState = {
        ...onboardingState,
        professionalVerification: {
          ...onboardingState.professionalVerification,
          ...currentData,
        },
      };
      try {
        localStorage.setItem("onboarding-draft", JSON.stringify(draftState));
      } catch (_) {
        /* ignore */
      }
      showToast("Server save failed. Draft saved locally instead.", "warning");
    }
  };

  const InputField = ({ label, name, placeholder }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <FiLink size={16} />
        </div>
        <input
          type="url"
          placeholder={placeholder}
          {...register(name)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
        />
      </div>
    </div>
  );

  const CheckboxField = ({ label, name, description }) => (
    <label className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <div className="relative flex items-center justify-center mt-0.5">
        <input type="checkbox" {...register(name)} className="peer sr-only" />
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-all">
          <FiCheckSquare className="text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
                <FiCheckSquare size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Professional Verification
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Verify employee backgrounds and links
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={verificationSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSave size={16} />
              {verificationSaving ? "Saving..." : "Save Draft"}
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Professional URLs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField
                  label="LinkedIn URL"
                  name="linkedInUrl"
                  placeholder="https://linkedin.com/in/..."
                />
                <InputField
                  label="GitHub URL"
                  name="githubUrl"
                  placeholder="https://github.com/..."
                />
                <InputField
                  label="Portfolio URL"
                  name="portfolioUrl"
                  placeholder="https://yourportfolio.com"
                />
                <InputField
                  label="Other Professional URL"
                  name="otherUrl"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Verification Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckboxField
                  label="Identity Verified"
                  name="identityVerified"
                  description="Candidate identity documents and ID proofs have been checked and verified."
                />
                <CheckboxField
                  label="Credentials Verified"
                  name="credentialsVerified"
                  description="Educational degrees and certifications have been verified."
                />
                <CheckboxField
                  label="Employment Info Verified"
                  name="employmentInfoVerified"
                  description="Past employment records and references have been checked."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Verification Notes
              </label>
              <textarea
                {...register("verificationNotes")}
                rows="4"
                placeholder="Enter any additional notes regarding the candidate's verification process..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiChevronLeft size={20} />
              Back
            </button>

            <button
              type="submit"
              disabled={verificationSaving}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verificationSaving ? "Saving..." : "Continue"}
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalVerificationForm;