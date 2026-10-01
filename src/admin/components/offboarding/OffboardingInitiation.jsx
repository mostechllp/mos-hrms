// src/admin/components/offboarding/OffboardingInitiation.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Save, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import DateInput from "../common/DateInput";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import { fetchActiveEmployees } from "../../store/slices/employeeSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchDesignations } from "../../store/slices/designationSlice";
import {
  initiateOffboarding,
  fetchOffboardingProgress,
  fetchOffboardingById,
  updateOffboarding,
  clearCurrentOffboarding,
} from "../../store/slices/offboardingSlice";
import apiClient from "../../../utils/apiClient";

// ----------------------------------------------------
// ZOD RESOLVER SCHEMA
// ----------------------------------------------------
const offboardingSchema = z
  .object({
    employeeId: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .pipe(z.string().min(1, "Employee ID is required")),
    backendEmployeeId: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val ? String(val) : "")),
    employeeName: z.string().min(1, "Employee name is required"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    reportingManager: z.string().min(1, "Reporting manager is required"),
    reportingManagerId: z.union([z.string(), z.number()]).optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    joiningDate: z.string().optional(),

    exitType: z.string().min(1, "Exit Type is required"),
    exitInitiationDate: z.string().min(1, "Exit initiation date is required"),
    lastWorkingDay: z.string().min(1, "Last working day is required"),
    noticePeriodDays: z.coerce.number().optional(),
    reasonForLeaving: z
      .string()
      .min(5, "Please enter a reason for leaving (min 5 chars)"),

    resignationSubmissionDate: z.string().optional(),
    resignationAcceptanceStatus: z.string().optional(),
    resignationReason: z.string().optional(),

    terminationDiscussionDate: z.string().optional(),
    discussionCompleted: z.string().optional(),
    terminationReason: z.string().optional(),
    managementRemarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.exitType === "Resignation") {
      if (!data.resignationSubmissionDate) {
        ctx.addIssue({
          path: ["resignationSubmissionDate"],
          message: "Required for resignation",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.resignationReason) {
        ctx.addIssue({
          path: ["resignationReason"],
          message: "Required for resignation",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (data.exitType === "Termination") {
      if (!data.terminationDiscussionDate) {
        ctx.addIssue({
          path: ["terminationDiscussionDate"],
          message: "Required for termination",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.terminationReason) {
        ctx.addIssue({
          path: ["terminationReason"],
          message: "Required for termination",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------
const normalizeArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const pickManagerName = (m) =>
  m?.full_name ||
  m?.name ||
  `${m?.first_name || ""} ${m?.last_name || ""}`.trim();

const OffboardingInitiation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: paramId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const offboardingId = paramId || location.state?.id || searchParams.get("id");
  const isEditMode =
    !!offboardingId ||
    !!location.state?.offboardingData ||
    !!location.state?.isEdit;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [reportingManagers, setReportingManagers] = useState([]);
  const [offboardingEmployees, setOffboardingEmployees] = useState([]);
  const [offboardingEmployeesLoading, setOffboardingEmployeesLoading] =
    useState(true);

  // Redux state
  const { loading: offboardingLoading, error: offboardingError, currentProgress } =
    useSelector((state) => state.offboarding);
  const { departments, loading: departmentsLoading } = useSelector(
    (state) => state.departments,
  );
  const { designations, loading: designationsLoading } = useSelector(
    (state) => state.designations,
  );
  const { employees } = useSelector((state) => state.employees);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(offboardingSchema),
    mode: "onChange",
    defaultValues: {
      employeeId: "",
      backendEmployeeId: "",
      employeeName: "",
      department: "",
      designation: "",
      reportingManager: "",
      reportingManagerId: "",
      email: "",
      joiningDate: "",

      exitType: "Resignation",
      exitInitiationDate: new Date().toISOString().split("T")[0],
      lastWorkingDay: "",
      noticePeriodDays: 30,
      reasonForLeaving: "",

      resignationSubmissionDate: "",
      resignationAcceptanceStatus: "Pending",
      resignationReason: "",

      terminationDiscussionDate: "",
      discussionCompleted: "Yes",
      terminationReason: "",
      managementRemarks: "",
    },
  });

  // ─────────────────────────────────────────────────────
  // Initial fetch
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchActiveEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());

    const fetchOffboardingEmployees = async () => {
      try {
        setOffboardingEmployeesLoading(true);
        const response = await apiClient.get("/admin/offboarding/employees");
        setOffboardingEmployees(normalizeArray(response.data));
      } catch (error) {
        console.error("Failed to fetch offboarding employees:", error);
      } finally {
        setOffboardingEmployeesLoading(false);
      }
    };
    fetchOffboardingEmployees();

    const fetchManagers = async () => {
      try {
        const response = await apiClient.get(
          "/admin/offboarding/reporting-managers",
        );
        setReportingManagers(normalizeArray(response.data));
      } catch (error) {
        console.error("Failed to fetch reporting managers:", error);
      }
    };
    fetchManagers();
  }, [dispatch]);

  // ─────────────────────────────────────────────────────
  // Load existing offboarding data (edit mode)
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadExistingOffboarding = async () => {
      setLoadingData(true);

      const resolveEmployees = async () => {
        if (employees && employees.length > 0) return employees;
        try {
          const payload = await dispatch(fetchActiveEmployees()).unwrap();
          return normalizeArray(payload);
        } catch (e) {
          console.error("Failed to fetch employees", e);
          return [];
        }
      };

      if (location.state?.offboardingData) {
        const data = location.state.offboardingData;
        const emps = await resolveEmployees();
        populateFormWithData(data, emps);
        if (data.id) dispatch(fetchOffboardingProgress(data.id));
        setLoadingData(false);
        return;
      }

      if (offboardingId) {
        try {
          const result = await dispatch(
            fetchOffboardingById(offboardingId),
          ).unwrap();
          if (result) {
            const emps = await resolveEmployees();
            populateFormWithData(result, emps);
            await dispatch(fetchOffboardingProgress(offboardingId));
          }
        } catch (error) {
          console.error("Failed to load offboarding data:", error);
          showToast("Failed to load offboarding data", "error");
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    };

    if (isEditMode) {
      loadExistingOffboarding();
    } else {
      dispatch(clearCurrentOffboarding());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offboardingId, location.state, isEditMode, dispatch]);

  // ─────────────────────────────────────────────────────
  // Populate form with existing data
  // ─────────────────────────────────────────────────────
  const populateFormWithData = (data, currentEmployees = employees) => {
    let employeeData = data.employee || {};
    let foundFullEmployee = null;

    if (currentEmployees && currentEmployees.length > 0) {
      foundFullEmployee = currentEmployees.find(
        (emp) =>
          emp.id === employeeData.id ||
          emp.id === data.employee_id ||
          String(emp.employee_id) === String(data.employee_id) ||
          String(emp.user_id) === String(employeeData.user_id),
      );
      if (foundFullEmployee) {
        employeeData = { ...foundFullEmployee, ...employeeData };
      }
    }

    setValue("employeeId", employeeData.employee_id || data.employee_id || "", {
      shouldValidate: true,
    });

    const backendEmpId = String(
      employeeData.id || data.employee_id || data.backend_employee_id || "",
    );
    setValue("backendEmployeeId", backendEmpId, { shouldValidate: true });

    const employeeName =
      employeeData.first_name && employeeData.last_name
        ? `${employeeData.first_name} ${employeeData.last_name}`
        : data.employee_name || "";
    setValue("employeeName", employeeName, { shouldValidate: true });

    // Department
    const departmentName =
      data.employee?.user?.department?.name ||
      data.employee?.department?.name ||
      (typeof data.employee?.department === "string"
        ? data.employee.department
        : null) ||
      employeeData.user?.department?.name ||
      employeeData.department?.name ||
      (typeof employeeData.department === "string"
        ? employeeData.department
        : null) ||
      foundFullEmployee?.user?.department?.name ||
      foundFullEmployee?.department?.name ||
      (typeof foundFullEmployee?.department === "string"
        ? foundFullEmployee.department
        : null) ||
      data.department?.name ||
      (typeof data.department === "string" ? data.department : null) ||
      "";

    if (departmentName) {
      setValue("department", departmentName, { shouldValidate: true });
    }

    // Designation
    const designationName =
      data.employee?.user?.designation?.name ||
      data.employee?.designation?.name ||
      (typeof data.employee?.designation === "string"
        ? data.employee.designation
        : null) ||
      employeeData.user?.designation?.name ||
      employeeData.designation?.name ||
      (typeof employeeData.designation === "string"
        ? employeeData.designation
        : null) ||
      foundFullEmployee?.user?.designation?.name ||
      foundFullEmployee?.designation?.name ||
      (typeof foundFullEmployee?.designation === "string"
        ? foundFullEmployee.designation
        : null) ||
      data.designation?.name ||
      (typeof data.designation === "string" ? data.designation : null) ||
      "";

    if (designationName) {
      setValue("designation", designationName, { shouldValidate: true });
    }

    const emailAddress =
      employeeData.company_email || employeeData.email || data.email || "";
    setValue("email", emailAddress, { shouldValidate: true });

    const joiningDate =
      employeeData.joining_date || employeeData.hire_date || "";
    setValue("joiningDate", joiningDate, { shouldValidate: true });

    // Reporting Manager
    let reportingManagerName =
      data.reporting_manager?.name ||
      data.reporting_manager?.full_name ||
      (data.reporting_manager?.first_name
        ? `${data.reporting_manager.first_name} ${
            data.reporting_manager.last_name || ""
          }`.trim()
        : data.reporting_manager) ||
      data.reportingManager?.name ||
      data.reportingManager ||
      employeeData.reporting_manager?.name ||
      employeeData.reporting_manager ||
      employeeData.reportingManager?.name ||
      employeeData.reportingManager ||
      "";

    if (typeof reportingManagerName === "object" && reportingManagerName) {
      reportingManagerName =
        reportingManagerName?.name ||
        reportingManagerName?.full_name ||
        (reportingManagerName?.first_name
          ? `${reportingManagerName.first_name} ${
              reportingManagerName.last_name || ""
            }`.trim()
          : "");
    }

    if (
      !reportingManagerName &&
      (data.reporting_manager_id || employeeData.reporting_manager_id)
    ) {
      const managerId =
        data.reporting_manager_id || employeeData.reporting_manager_id;
      if (currentEmployees && currentEmployees.length > 0) {
        const foundManager = currentEmployees.find(
          (emp) =>
            String(emp.id) === String(managerId) ||
            String(emp.employee_id) === String(managerId),
        );
        if (foundManager) {
          reportingManagerName =
            foundManager.name ||
            foundManager.full_name ||
            `${foundManager.first_name || ""} ${
              foundManager.last_name || ""
            }`.trim();
        }
      }
    }

    setValue("reportingManager", reportingManagerName || "", {
      shouldValidate: true,
    });

    // reportingManagerId should always be a string for SearchableSelect
    const mgrId =
      data.reporting_manager_id ??
      data.reportingManagerId ??
      employeeData.reporting_manager_id ??
      "";
    setValue("reportingManagerId", mgrId !== "" ? String(mgrId) : "", {
      shouldValidate: true,
    });

    // Exit details
    const exitType = data.separation_type
      ? data.separation_type.charAt(0).toUpperCase() +
        data.separation_type.slice(1)
      : data.exitType || data.separationType || "Resignation";
    setValue("exitType", exitType, { shouldValidate: true });

    setValue(
      "exitInitiationDate",
      data.exit_initiation_date ||
        data.created_at?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      { shouldValidate: true },
    );
    setValue(
      "lastWorkingDay",
      data.last_working_day || data.lastWorkingDay || "",
      { shouldValidate: true },
    );
    setValue(
      "noticePeriodDays",
      data.notice_period_days || data.noticePeriodDays || 30,
      { shouldValidate: true },
    );
    setValue(
      "reasonForLeaving",
      data.reason_for_leaving || data.reasonForLeaving || "",
      { shouldValidate: true },
    );

    setValue(
      "resignationSubmissionDate",
      data.resignation_date || data.resignationSubmissionDate || "",
      { shouldValidate: true },
    );
    setValue(
      "resignationAcceptanceStatus",
      data.resignation_acceptance_status ||
        data.resignationAcceptanceStatus ||
        "Pending",
      { shouldValidate: true },
    );
    setValue(
      "resignationReason",
      data.resignation_reason ||
        data.resignationReason ||
        data.reason_for_leaving ||
        "",
      { shouldValidate: true },
    );

    setValue(
      "terminationDiscussionDate",
      data.termination_discussion_date || data.terminationDiscussionDate || "",
      { shouldValidate: true },
    );
    setValue(
      "discussionCompleted",
      data.discussion_completed || data.discussionCompleted || "Yes",
      { shouldValidate: true },
    );
    setValue(
      "terminationReason",
      data.termination_reason ||
        data.terminationReason ||
        data.reason_for_leaving ||
        "",
      { shouldValidate: true },
    );
    setValue(
      "managementRemarks",
      data.management_remarks || data.managementRemarks || "",
      { shouldValidate: true },
    );

    showToast("Offboarding data loaded successfully", "success");
  };

  // ─────────────────────────────────────────────────────
  // Offboarding error toast
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    if (offboardingError) showToast(offboardingError, "error");
  }, [offboardingError]);

  // ─────────────────────────────────────────────────────
  // Auto-redirect after progress is fetched
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    if (currentProgress && currentProgress.offboarding_id && showProgress) {
      const timer = setTimeout(() => {
        navigate(
          `/admin/employees/offboarding/handover?id=${currentProgress.offboarding_id}`,
        );
        setShowProgress(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentProgress, showProgress, navigate]);

  useEffect(() => {
    let fallbackTimer;
    if (showProgress && !currentProgress) {
      fallbackTimer = setTimeout(() => {
        const storedId = localStorage.getItem("offboarding_id");
        if (storedId) {
          navigate(`/admin/employees/offboarding/handover?id=${storedId}`);
          setShowProgress(false);
        }
      }, 3000);
    }
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [showProgress, currentProgress, navigate]);

  // ─────────────────────────────────────────────────────
  // Auto-calculate last working day
  // ─────────────────────────────────────────────────────
  const watchedNoticePeriodDays = watch("noticePeriodDays");
  const watchedExitInitiationDate = watch("exitInitiationDate");

  useEffect(() => {
    if (
      watchedExitInitiationDate &&
      watchedNoticePeriodDays !== undefined &&
      watchedNoticePeriodDays !== null &&
      watchedNoticePeriodDays >= 0
    ) {
      const [year, month, day] = watchedExitInitiationDate
        .split("-")
        .map(Number);
      const startDate = new Date(year, month - 1, day);
      if (isNaN(startDate.getTime())) return;

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Number(watchedNoticePeriodDays));

      const y = endDate.getFullYear();
      const m = String(endDate.getMonth() + 1).padStart(2, "0");
      const d = String(endDate.getDate()).padStart(2, "0");
      setValue("lastWorkingDay", `${y}-${m}-${d}`, {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedExitInitiationDate, watchedNoticePeriodDays, setValue]);

  // ─────────────────────────────────────────────────────
  // Option arrays for SearchableSelect
  // ─────────────────────────────────────────────────────
  const employeeOptions = useMemo(
    () =>
      (Array.isArray(offboardingEmployees) ? offboardingEmployees : [])
        .filter((emp) => emp && emp.id)
        .map((emp) => ({
          value: String(emp.id),
          label: emp.employee_id
            ? `${emp.full_name || "Unnamed"} (${emp.employee_id})`
            : emp.full_name || "Unnamed",
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
        ),
    [offboardingEmployees],
  );

  const managerOptions = useMemo(
    () =>
      (Array.isArray(reportingManagers) ? reportingManagers : [])
        .filter((m) => m && m.id)
        .map((m) => ({
          value: String(m.id),
          label: pickManagerName(m) || "Unnamed",
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
        ),
    [reportingManagers],
  );

  const departmentOptions = useMemo(
    () =>
      (Array.isArray(departments) ? departments : [])
        .filter((d) => d && d.name)
        .map((d) => ({ value: d.name, label: d.name }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
        ),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      (Array.isArray(designations) ? designations : [])
        .filter((d) => d && d.name)
        .map((d) => ({ value: d.name, label: d.name }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
        ),
    [designations],
  );

  // Lookup maps
  const employeeById = useMemo(() => {
    const map = {};
    (offboardingEmployees || []).forEach((emp) => {
      if (emp?.id) map[String(emp.id)] = emp;
    });
    return map;
  }, [offboardingEmployees]);

  const managerById = useMemo(() => {
    const map = {};
    (reportingManagers || []).forEach((m) => {
      if (m?.id) map[String(m.id)] = m;
    });
    return map;
  }, [reportingManagers]);

  // ─────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────
  const onError = (formErrors) => {
    console.error("Form validation errors:", formErrors);
    showToast("Please fill all required fields correctly.", "error");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        employee_id: data.backendEmployeeId
          ? parseInt(data.backendEmployeeId, 10)
          : null,
        reporting_manager_id: data.reportingManagerId
          ? parseInt(data.reportingManagerId, 10)
          : null,
        department: data.department ? String(data.department).trim() : null,
        designation: data.designation ? String(data.designation).trim() : null,
        last_working_day: data.lastWorkingDay || null,
        separation_type: data.exitType?.toLowerCase() || null,
        exit_initiation_date: data.exitInitiationDate || null,
        notice_period_days: data.noticePeriodDays
          ? parseInt(data.noticePeriodDays, 10)
          : 0,
        reason_for_leaving: data.reasonForLeaving,
        ...(data.exitType === "Resignation"
          ? {
              resignation_date: data.resignationSubmissionDate || null,
              resignation_acceptance_status: data.resignationAcceptanceStatus,
              resignation_reason: data.resignationReason,
            }
          : {
              termination_discussion_date:
                data.terminationDiscussionDate || null,
              discussion_completed: data.discussionCompleted,
              termination_reason: data.terminationReason,
              management_remarks: data.managementRemarks,
            }),
        is_draft: 0,
      };

      let result;

      if (isEditMode && offboardingId) {
        result = await dispatch(
          updateOffboarding({ id: offboardingId, data: payload }),
        ).unwrap();
        showToast(
          <div className="text-sm">
            <span className="font-bold block text-green-800 dark:text-green-300">
              Offboarding Updated
            </span>
            <span>
              Successfully updated offboarding for {data.employeeName}
            </span>
          </div>,
          "success",
        );
      } else {
        result = await dispatch(initiateOffboarding(payload)).unwrap();

        if (result && result.id) {
          localStorage.setItem("offboarding_id", result.id);
          localStorage.setItem(
            "offboarding_employee_id",
            data.backendEmployeeId,
          );
          localStorage.setItem("offboarding_employee_name", data.employeeName);

          try {
            await dispatch(fetchOffboardingProgress(result.id)).unwrap();
          } catch (progressError) {
            console.log("Progress fetch failed:", progressError);
          }
          setShowProgress(true);
        }

        showToast(
          <div className="text-sm">
            <span className="font-bold block text-green-800 dark:text-green-300">
              Offboarding Initiated
            </span>
            <span>
              Successfully triggered offboarding workflows for{" "}
              {data.employeeName}
            </span>
          </div>,
          "success",
        );
      }

      localStorage.removeItem("offboarding_draft");
      reset();

      setTimeout(() => {
        const targetId = (result && result.id) || offboardingId;
        if (targetId) {
          navigate(`/admin/employees/offboarding/handover?id=${targetId}`);
        }
      }, 1000);
    } catch (error) {
      console.error("Offboarding submission error:", error);
      showToast(
        error || "Failed to process offboarding. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const data = watch();
    if (!data.backendEmployeeId || !data.reportingManagerId) {
      showToast("Please select Employee and Manager first.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        employee_id: data.backendEmployeeId
          ? parseInt(data.backendEmployeeId, 10)
          : null,
        reporting_manager_id: data.reportingManagerId
          ? parseInt(data.reportingManagerId, 10)
          : null,
        department: data.department ? String(data.department).trim() : null,
        designation: data.designation ? String(data.designation).trim() : null,
        last_working_day: data.lastWorkingDay || null,
        separation_type: data.exitType ? data.exitType.toLowerCase() : null,
        exit_initiation_date: data.exitInitiationDate || null,
        notice_period_days: data.noticePeriodDays
          ? parseInt(data.noticePeriodDays, 10)
          : 0,
        reason_for_leaving: data.reasonForLeaving,
        ...(data.exitType === "Resignation"
          ? {
              resignation_date: data.resignationSubmissionDate || null,
              resignation_acceptance_status: data.resignationAcceptanceStatus,
              resignation_reason: data.resignationReason,
            }
          : {
              termination_discussion_date:
                data.terminationDiscussionDate || null,
              discussion_completed: data.discussionCompleted,
              termination_reason: data.terminationReason,
              management_remarks: data.managementRemarks,
            }),
        is_draft: 1,
      };

      if (isEditMode && offboardingId) {
        await dispatch(
          updateOffboarding({ id: offboardingId, data: payload }),
        ).unwrap();
        showToast("Draft updated successfully", "success");
      } else {
        const result = await dispatch(initiateOffboarding(payload)).unwrap();
        if (result && result.id) {
          localStorage.setItem("offboarding_id", result.id);
          localStorage.setItem(
            "offboarding_employee_id",
            data.backendEmployeeId,
          );
          localStorage.setItem("offboarding_employee_name", data.employeeName);

          navigate(`/admin/employees/offboarding-initiation?id=${result.id}`, {
            replace: true,
          });
        }
        showToast("Draft saved successfully", "success");
      }
      localStorage.removeItem("offboarding_draft");
    } catch (error) {
      console.error("Save draft error:", error);
      localStorage.setItem("offboarding_draft", JSON.stringify(data));
      showToast(
        "Failed to save draft to server. Data saved locally.",
        "warning",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // Restore local draft (new offboarding only)
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) {
      const draft = localStorage.getItem("offboarding_draft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          Object.keys(parsedDraft).forEach((key) => {
            if (parsedDraft[key] !== undefined && parsedDraft[key] !== null) {
              setValue(key, parsedDraft[key]);
            }
          });
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [setValue, isEditMode]);

  // ─────────────────────────────────────────────────────
  // Progress modal
  // ─────────────────────────────────────────────────────
  const ProgressModal = () => {
    if (!showProgress) return null;

    const hasProgress = currentProgress && currentProgress.offboarding_id;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Offboarding Initiated!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Redirecting to next step...
              </p>
            </div>

            {hasProgress ? (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Overall Progress
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {currentProgress.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${currentProgress.progress_percentage || 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
                    <span>
                      Completed Steps: {currentProgress.completed_steps || 0}
                    </span>
                    <span>Total Steps: {currentProgress.total_steps || 7}</span>
                  </div>
                </div>

                {currentProgress.steps && currentProgress.steps.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Steps Status
                    </p>
                    <div className="space-y-2">
                      {currentProgress.steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {step.name}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : step.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {step.status === "completed"
                              ? "Completed"
                              : step.status === "in_progress"
                                ? "In Progress"
                                : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Loading offboarding progress...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={1} />

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {isEditMode ? "Edit Offboarding" : "Initiate offboarding"}
              </h1>
              {!isEditMode && (
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 rounded text-xs font-bold uppercase tracking-wider">
                  Draft
                </span>
              )}
            </div>

            {/* Section 1: Employee Information */}
            <div className="mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Employee Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* Employee Name — SearchableSelect bound to backendEmployeeId */}
              <div className="space-y-1.5">
                <Controller
                  name="backendEmployeeId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Employee name"
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        const emp = employeeById[val];
                        if (emp) {
                          setValue(
                            "employeeId",
                            emp.employee_id || String(emp.id),
                            { shouldValidate: true },
                          );
                          setValue("employeeName", emp.full_name || "", {
                            shouldValidate: true,
                          });
                          setValue("department", emp.department || "", {
                            shouldValidate: true,
                          });
                          setValue("designation", emp.designation || "", {
                            shouldValidate: true,
                          });
                          setValue("email", emp.email || "", {
                            shouldValidate: true,
                          });
                          setValue(
                            "joiningDate",
                            emp.joining_date || emp.hire_date || "",
                            { shouldValidate: true },
                          );
                        } else {
                          setValue("employeeId", "", { shouldValidate: true });
                          setValue("employeeName", "", {
                            shouldValidate: true,
                          });
                          setValue("department", "", { shouldValidate: true });
                          setValue("designation", "", {
                            shouldValidate: true,
                          });
                          setValue("email", "", { shouldValidate: true });
                          setValue("joiningDate", "", {
                            shouldValidate: true,
                          });
                        }
                      }}
                      options={employeeOptions}
                      loading={offboardingEmployeesLoading}
                      error={errors.employeeName?.message}
                      disabled={isEditMode}
                      required
                      placeholder="Search or select employee..."
                      searchPlaceholder="Search by name, ID or email..."
                      emptyMessage="No employees found"
                      clearable={!isEditMode}
                    />
                  )}
                />
              </div>

              {/* Employee ID (read-only text derived from selection) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Employee ID
                </label>
                <input
                  type="text"
                  placeholder="Auto-populated from selection"
                  value={watch("employeeId") || ""}
                  onChange={(e) =>
                    setValue("employeeId", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
                    errors.employeeId
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                />
                {errors.employeeId && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Department"
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      options={departmentOptions}
                      loading={departmentsLoading}
                      error={errors.department?.message}
                      placeholder="Search or select department..."
                      searchPlaceholder="Search departments..."
                      emptyMessage="No departments found"
                      clearable
                    />
                  )}
                />
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Designation"
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      options={designationOptions}
                      loading={designationsLoading}
                      error={errors.designation?.message}
                      placeholder="Search or select designation..."
                      searchPlaceholder="Search designations..."
                      emptyMessage="No designations found"
                      clearable
                    />
                  )}
                />
              </div>

              {/* Reporting Manager */}
              <div className="space-y-1.5">
                <Controller
                  name="reportingManagerId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Reporting manager"
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        const mgr = managerById[val];
                        if (mgr) {
                          setValue(
                            "reportingManager",
                            pickManagerName(mgr) || "",
                            { shouldValidate: true },
                          );
                        } else {
                          setValue("reportingManager", "", {
                            shouldValidate: true,
                          });
                        }
                      }}
                      options={managerOptions}
                      error={errors.reportingManager?.message}
                      required
                      placeholder="Search or select reporting manager..."
                      searchPlaceholder="Search managers..."
                      emptyMessage="No managers found"
                      clearable
                    />
                  )}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Auto-populated or enter manually"
                  value={watch("email") || ""}
                  onChange={(e) =>
                    setValue("email", e.target.value, { shouldValidate: true })
                  }
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                />
                {errors.email && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Joining Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Joining Date
                </label>
                <Controller
                  name="joiningDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...field}
                      placeholder="Select date"
                      error={!!errors.joiningDate}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  )}
                />
              </div>
            </div>

            {/* Section 2: Exit Information */}
            <div className="mt-8 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Exit Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Exit Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("exitType")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
                >
                  <option value="Resignation">Resignation</option>
                  <option value="Termination">Termination</option>
                </select>
                {errors.exitType && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.exitType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Exit Initiation Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="exitInitiationDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...field}
                      placeholder="Select date"
                      error={!!errors.exitInitiationDate}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  )}
                />
                {errors.exitInitiationDate && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.exitInitiationDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Last Working Day <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="lastWorkingDay"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...field}
                      placeholder="Select or auto-calculated"
                      error={!!errors.lastWorkingDay}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  )}
                />
                {errors.lastWorkingDay && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.lastWorkingDay.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  {...register("noticePeriodDays")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Reason for Leaving / Exit Reason{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief reason for the exit..."
                  {...register("reasonForLeaving")}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold ${
                    errors.reasonForLeaving
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                ></textarea>
                {errors.reasonForLeaving && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.reasonForLeaving.message}
                  </p>
                )}
              </div>
            </div>

            {/* Conditional Section: Resignation */}
            {watch("exitType") === "Resignation" && (
              <>
                <div className="mt-8 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Resignation Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Resignation Submission Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="resignationSubmissionDate"
                      control={control}
                      render={({ field }) => (
                        <DateInput
                          {...field}
                          placeholder="Select date"
                          error={!!errors.resignationSubmissionDate}
                          className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        />
                      )}
                    />
                    {errors.resignationSubmissionDate && (
                      <p className="text-xxs font-bold text-red-500 mt-1">
                        {errors.resignationSubmissionDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Acceptance Status
                    </label>
                    <select
                      {...register("resignationAcceptanceStatus")}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Resignation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed resignation reason..."
                      {...register("resignationReason")}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold ${
                        errors.resignationReason
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    ></textarea>
                    {errors.resignationReason && (
                      <p className="text-xxs font-bold text-red-500 mt-1">
                        {errors.resignationReason.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Conditional Section: Termination */}
            {watch("exitType") === "Termination" && (
              <>
                <div className="mt-8 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Termination Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Termination Discussion Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="terminationDiscussionDate"
                      control={control}
                      render={({ field }) => (
                        <DateInput
                          {...field}
                          placeholder="Select date"
                          error={!!errors.terminationDiscussionDate}
                          className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        />
                      )}
                    />
                    {errors.terminationDiscussionDate && (
                      <p className="text-xxs font-bold text-red-500 mt-1">
                        {errors.terminationDiscussionDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Discussion Completed?
                    </label>
                    <select
                      {...register("discussionCompleted")}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Termination Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed termination reason..."
                      {...register("terminationReason")}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold ${
                        errors.terminationReason
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    ></textarea>
                    {errors.terminationReason && (
                      <p className="text-xxs font-bold text-red-500 mt-1">
                        {errors.terminationReason.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      HR / Management Remarks
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any additional remarks..."
                      {...register("managementRemarks")}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold"
                    ></textarea>
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={offboardingLoading}
                  className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  Save draft
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || offboardingLoading}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || offboardingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditMode ? "Updating..." : "Initiating..."}
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    {isEditMode ? "Update Offboarding" : "Save & Continue"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {!isEditMode && <ProgressModal />}
    </div>
  );
};

export default OffboardingInitiation;