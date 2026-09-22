/* eslint-disable react-hooks/static-components */
import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  FiEdit3,
  FiInfo,
  FiChevronRight,
  FiChevronLeft,
  FiSave,
} from "react-icons/fi";
import {
  setStep,
  updateEmployeeDetails,
  resetOnboarding,
  fetchEmployeeDetails,
  createEmployeeDetails,
  updateEmployeeDetailsApi,
  fetchOnboardingProgress,
} from "../../store/slices/onboardingSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchDesignations } from "../../store/slices/designationSlice";
import { showToast } from "../../components/common/Toast";
import DateInput from "../common/DateInput";

const EmployeeDetailsForm = () => {
  const dispatch = useDispatch();
  const { id: routeId } = useParams();

  const onboardingState = useSelector((state) => state.onboarding) || {};
  const {
    employeeDetails = {},
    detailsId = null,
    detailsSaving = false,
  } = onboardingState;

  const { departments = [], loading: departmentsLoading } = useSelector(
    (state) => state.departments || {},
  );
  const { designations = [], loading: designationsLoading } = useSelector(
    (state) => state.designations || {},
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: employeeDetails,
  });

  // ────────────────────────────────────────────────────────────
  // Fetch from server when the route has an id
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (routeId) {
      dispatch(fetchEmployeeDetails(routeId));
    }
  }, [dispatch, routeId]);

  // Re-initialize form whenever Redux data changes
  // (from AI parse, from server fetch, from earlier edit)
  useEffect(() => {
    if (employeeDetails && Object.keys(employeeDetails).length > 0) {
      reset(employeeDetails);
    }
  }, [employeeDetails, reset]);

  useEffect(() => {
    if (routeId) {
      dispatch(fetchEmployeeDetails(routeId));
    }
    // Load dropdown sources once
    if (!departments.length) dispatch(fetchDepartments());
    if (!designations.length) dispatch(fetchDesignations());
  }, [dispatch, routeId, departments.length, designations.length]);

  // ────────────────────────────────────────────────────────────
  // Submit — PUT if we already have an id, POST otherwise
  // ────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const existingId = detailsId || routeId || null;
      let resolvedId = existingId;

      if (existingId) {
        await dispatch(
          updateEmployeeDetailsApi({ id: existingId, data }),
        ).unwrap();
      } else {
        const result = await dispatch(
          createEmployeeDetails({ id: null, data }),
        ).unwrap();
        resolvedId = result?.id; // { id, api, form }
        if (resolvedId) {
  localStorage.setItem("onboarding_user_id", String(resolvedId)); // fixed key
}
      }

      dispatch(updateEmployeeDetails(data));

      // ── Refresh onboarding progress ──
      if (resolvedId) {
        dispatch(fetchOnboardingProgress(resolvedId));
      }

      dispatch(setStep(3));
      showToast("Employee details saved successfully", "success");
    } catch (error) {
      console.error("Save employee details error:", error);
      showToast(error || "Failed to save employee details", "error");
    }
  };

  const handleBack = () => {
    dispatch(resetOnboarding());
  };

  // ────────────────────────────────────────────────────────────
  // Save draft — same server-first logic, local fallback on error
  // ────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    const currentData = getValues();
    const existingId = detailsId || routeId || null;

    try {
      let resolvedId = existingId;

      if (existingId) {
        await dispatch(
          updateEmployeeDetailsApi({ id: existingId, data: currentData }),
        ).unwrap();
      } else {
        const result = await dispatch(
          createEmployeeDetails({ id: null, data: currentData }),
        ).unwrap();

        resolvedId = result?.id;
        if (resolvedId) {
  localStorage.setItem("onboarding_user_id", String(resolvedId)); // fixed key
}
      }

      dispatch(updateEmployeeDetails(currentData));

      // ── Refresh onboarding progress ──
      if (resolvedId) {
        dispatch(fetchOnboardingProgress(resolvedId));
      }

      showToast("Draft saved successfully!", "success");
    } catch (error) {
      console.error("Save draft to server failed:", error);
      const draftState = {
        ...onboardingState,
        employeeDetails: {
          ...onboardingState.employeeDetails,
          ...currentData,
        },
      };
      localStorage.setItem("onboarding-draft", JSON.stringify(draftState));
      showToast("Server save failed. Draft saved locally instead.", "warning");
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    options = null,
  }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        {options ? (
          <select
            {...register(name, { required: `${label} is required` })}
            className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none ${
              errors[name]
                ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
            }`}
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            {...register(name, { required: `${label} is required` })}
            className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none ${
              errors[name]
                ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
            }`}
          />
        )}
      </div>
      {errors[name] && (
        <p className="text-xs font-medium text-red-500 mt-1">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  const SelectField = ({
    label,
    name,
    options = [], // [{ value, label }]
    loading = false,
    required = true,
  }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <select
          {...register(name, {
            required: required ? `${label} is required` : false,
          })}
          disabled={loading}
          className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none appearance-none disabled:opacity-60 ${
            errors[name]
              ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
          }`}
        >
          <option value="">
            {loading ? `Loading ${label.toLowerCase()}...` : `Select ${label}`}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FiChevronRight
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
        />
      </div>
      {errors[name] && (
        <p className="text-xs font-medium text-red-500 mt-1">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  const departmentOptions = useMemo(
    () =>
      (Array.isArray(departments) ? departments : [])
        .filter((d) => d && d.name)
        .map((d) => ({ value: String(d.id), label: d.name })),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      (Array.isArray(designations) ? designations : [])
        .filter((d) => d && d.name)
        .map((d) => ({ value: String(d.id), label: d.name })),
    [designations],
  );

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
                <FiInfo size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Verify Employee Details
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Data auto-extracted from resume
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={detailsSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSave size={16} />
              {detailsSaving ? "Saving..." : "Save Draft"}
            </button>
          </div>

          {/* Form Body */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField
              label="First Name"
              name="firstName"
              placeholder="Enter first name"
            />
            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Enter last name"
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="email@example.com"
            />
            <InputField
              label="Phone Number"
              name="phone"
              placeholder="+91 ----- -----"
            />
            <InputField
              label="Nationality"
              name="nationality"
              options={[
                "United Arab Emirates",
                "India",
                "Pakistan",
                "United Kingdom",
                "United States",
                "Philippines",
              ]}
            />
            <div className="md:col-span-2">
              <InputField
                label="Current Address"
                name="address"
                placeholder="Residential address"
              />
            </div>
            <SelectField
              label="Designation"
              name="designationId"
              options={designationOptions}
              loading={designationsLoading}
            />
            <SelectField
              label="Department"
              name="departmentId"
              options={departmentOptions}
              loading={departmentsLoading}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Joining Date
              </label>
              <Controller
                name="joiningDate"
                control={control}
                rules={{ required: "Joining Date is required" }}
                render={({ field }) => (
                  <DateInput
                    {...field}
                    type="joining"
                    placeholder="dd/mm/yyyy"
                    error={!!errors.joiningDate}
                    className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-xl !text-gray-900 dark:!text-white !px-4 !py-2.5 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                )}
              />
              {errors.joiningDate && (
                <p className="text-xs font-medium text-red-500 mt-1">
                  {errors.joiningDate.message}
                </p>
              )}
            </div>
            <InputField
              label="Experience Level"
              name="experience"
              placeholder="e.g. 5 Years"
            />
            <div className="md:col-span-2">
              <InputField
                label="Key Skills"
                name="skills"
                placeholder="React, Tailwind, Node.js etc."
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Highest Education"
                name="education"
                placeholder="University Degree etc."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Special Day Event
              </label>
              <input
                type="text"
                placeholder="e.g. Birthday, Work Anniversary"
                {...register("specialDayEvent")}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                list="special-days-suggestions"
              />
              <datalist id="special-days-suggestions">
                <option value="Birthday" />
                <option value="Work Anniversary" />
                <option value="Wedding Anniversary" />
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Special Day Date
              </label>
              <Controller
                name="specialDayDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    {...field}
                    type="special_day"
                    placeholder="dd/mm/yyyy"
                    error={!!errors.specialDayDate}
                    className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-xl !text-gray-900 dark:!text-white !px-4 !py-2.5 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                )}
              />
              {errors.specialDayDate && (
                <p className="text-xs font-medium text-red-500 mt-1">
                  {errors.specialDayDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Footer */}
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
              disabled={detailsSaving}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {detailsSaving ? "Saving..." : "Continue"}
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeDetailsForm;
