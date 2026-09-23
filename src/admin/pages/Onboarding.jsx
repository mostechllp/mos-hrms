// src/admin/pages/Onboarding.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  UserPlus,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Briefcase,
  Calendar,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  UserCheck,
  Building2,
  RefreshCw,
  Play,
  Trash2,
  Eye,
} from "lucide-react";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { deleteOnboardingEmployee, resetOnboarding } from "../store/slices/onboardingSlice";
import ConfirmModal from "../components/common/ConfirmModal";
import apiClient from "../../utils/apiClient";

// API step key → wizard step number
const STEP_KEY_TO_WIZARD_STEP = {
  details: 2,
  verification: 3,
  salary: 4,
  checklist: 6,
  complete: 7,
};

// API step number → wizard step number
const API_STEP_TO_WIZARD_STEP = {
  1: 2, // details
  2: 3, // verification
  3: 4, // salary
  4: 6, // checklist
  5: 7, // complete
};

// Wizard step number → URL section slug
const WIZARD_STEP_TO_SECTION = {
  2: "details",
  3: "verification",
  4: "salary",
  5: "offer",
  6: "checklist",
  7: "review",
};

const OnboardingDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isEmployee = location.pathname.startsWith("/employee");
  const base = isEmployee ? "/employee" : "/admin";

  // Where the wizard lives — different parent for admin vs employee
  const onboardingBase = isEmployee
    ? "/employee/onboarding"
    : "/admin/employees/onboarding";

  const [stats, setStats] = useState({
    activeOnboarding: 0,
    pendingTasks: 0,
    completedThisMonth: 0,
    pendingDocuments: 0,
  });

  const [recentOnboarding, setRecentOnboarding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [deletingId, setDeletingId] = useState(null);

  const { employees, loading: employeesLoading } = useSelector(
    (state) => state.employees,
  );

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const fetchProgressForEmployees = async (onboardingEmployees) => {
    if (!onboardingEmployees.length) return [];

    setProgressLoading(true);
    try {
      const results = await Promise.allSettled(
        onboardingEmployees.map((emp) => {
          const userId = emp.userId || emp.user_id || emp.id;
          return apiClient
            .get(`${base}/employees/onboard/progress/${userId}`)
            .then((res) => res.data?.data ?? res.data)
            .then((data) => ({ emp, progress: data }))
            .catch(() => ({ emp, progress: null }));
        }),
      );

      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (employeesLoading || !employees) return;

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const isOnboarding = (emp) =>
        emp.status === "Onboarding" || emp.status === "onboarding";

      const onboardingEmployees = employees.filter(isOnboarding);
      const onboardingCount = onboardingEmployees.length;

      const completedCount = employees.filter((emp) => {
        if (emp.status === "Active" || emp.status === "active") {
          const completionDate = emp.completionDate || emp.updatedAt;
          if (completionDate) {
            const date = new Date(completionDate);
            return (
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
            );
          }
        }
        return false;
      }).length;

      const progressPairs =
        await fetchProgressForEmployees(onboardingEmployees);

      const progressMap = new Map();
      progressPairs.forEach(({ emp, progress }) => {
        if (progress) {
          progressMap.set(emp.id, progress);
        }
      });

      let pendingTasksCount = 0;
      let pendingDocsCount = 0;

      onboardingEmployees.forEach((emp) => {
        const p = progressMap.get(emp.id);
        if (p) {
          const remaining = (Number(p.total_steps) || 5) - (Number(p.completed_steps) || 0);
          pendingTasksCount += Math.max(remaining, 0);

          const checklistStep = (p.steps || []).find(
            (s) => s.key === "checklist",
          );
          if (checklistStep && !checklistStep.completed) {
            pendingDocsCount += 1;
          }
        } else {
          pendingTasksCount += 4
          pendingDocsCount += 2;
        }
      });

      setStats({
        activeOnboarding: onboardingCount,
        pendingTasks: pendingTasksCount,
        completedThisMonth: completedCount,
        pendingDocuments: pendingDocsCount,
      });

      const sorted = [...onboardingEmployees]
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.joiningDate || 0) -
            new Date(a.createdAt || a.joiningDate || 0),
        )
        .slice(0, 5);

      const recentData = sorted.map((emp) => {
        const p = progressMap.get(emp.id);
        const percentage = p ? Number(p.percentage) || 0 : 0;
        const completedSteps = p ? Number(p.completed_steps) || 0 : 0;
        const totalSteps = p ? Number(p.total_steps) || 5 : 5;
        const steps = Array.isArray(p?.steps) ? p.steps : [];

        const isStepCompleted = (s) =>
          s?.completed === true || s?.completed === "true";

        const firstIncomplete = steps.find((s) => !isStepCompleted(s));
        const currentStepEntry =
          firstIncomplete || steps[steps.length - 1] || null;

        return {
          id: emp.id,
          userId: emp.userId || emp.user_id || emp.id,
          name:
            emp.name ||
            `${emp.firstName || emp.first_name || ""} ${
              emp.lastName || emp.last_name || ""
            }`.trim(),
          employeeId: emp.employeeId || emp.employee_id,
          department: emp.department || "Not Assigned",
          joiningDate: emp.joiningDate || emp.joining_date || emp.createdAt,
          status:
            percentage >= 100
              ? "completed"
              : percentage > 0
                ? "in-progress"
                : "initiated",
          percentage,
          completedSteps,
          totalSteps,
          stepLabel: currentStepEntry?.label || "Initiation",
          currentStepKey: currentStepEntry?.key || "details",
          apiStepNumber: firstIncomplete?.step ?? null,
          steps,
        };
      });

      setRecentOnboarding(recentData);
      setLoading(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, employeesLoading, base]);

  const handleStartFreshOnboarding = () => {
  // Wipe any stale wizard state
  dispatch(resetOnboarding());

  // Wipe persisted keys so the mount effects can't reload them
  try {
    localStorage.removeItem("onboarding_user_id");
    localStorage.removeItem("onboarding-draft");
  } catch {
    /* ignore */
  }

  // Navigate to a clean initiate URL (no ?id=)
  navigate(`${onboardingBase}/initiate`);
};

  // ── Continue: resume where the user left off ──
  const handleContinue = (employee) => {
    if (employee.percentage >= 100) {
      navigate(`${onboardingBase}/review?id=${employee.userId}`);
      return;
    }

    // 1. Prefer numeric API step
    let wizardStep = null;
    if (employee.apiStepNumber != null) {
      wizardStep = API_STEP_TO_WIZARD_STEP[employee.apiStepNumber] ?? null;
    }

    // 2. Fall back to key map
    if (!wizardStep && employee.currentStepKey) {
      wizardStep = STEP_KEY_TO_WIZARD_STEP[employee.currentStepKey] ?? null;
    }

    // 3. Never started → details
    if (employee.completedSteps === 0 || !wizardStep) wizardStep = 2;

    const section = WIZARD_STEP_TO_SECTION[wizardStep] || "initiate";
    navigate(`${onboardingBase}/${section}?id=${employee.userId}`);
  };

  // ── View details (for completed onboarding) ──
  const handleViewDetails = (employee) => {
    const targetId = employee.id || employee.userId;
    navigate(`${base}/employees/${targetId}`);
  };

  // ── Delete handlers ──
  const handleDeleteClick = (employee) => {
    setDeleteModal({ isOpen: true, employee });
  };

  const confirmDelete = async () => {
    const employee = deleteModal.employee;
    if (!employee) return;

    setDeletingId(employee.id);
    try {
      await dispatch(deleteOnboardingEmployee(employee.id)).unwrap();
      setRecentOnboarding((prev) => prev.filter((e) => e.id !== employee.id));
      dispatch(fetchEmployees());
      setDeleteModal({ isOpen: false, employee: null });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    if (deletingId) return;
    setDeleteModal({ isOpen: false, employee: null });
  };

  const onboardingCards = [
    {
      id: "initiate",
      title: "Initiate Onboarding",
      description:
        "Start the onboarding process for a new employee. Fill in personal details, job information, and visa requirements.",
      icon: <UserPlus size={28} />,
      path: `${onboardingBase}/initiate`,
      color: "blue",
      bgClass:
        "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      buttonClass:
        "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
      stats: `${stats.activeOnboarding} in progress`,
      buttonText: "Initiate Now",
    },
    {
      id: "addEmployee",
      title: "Add Employee",
      description:
        "Manually add employee details including personal information, contact details, and employment terms.",
      icon: <PlusCircle size={28} />,
      path: `${base}/employees/add-employee`,
      color: "purple",
      bgClass:
        "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
      buttonClass:
        "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50",
      stats: `${employees?.length || 0} total employees`,
      buttonText: "Add Employee",
    },
  ];

  const quickStats = [
    {
      label: "Active Onboarding",
      value: stats.activeOnboarding,
      icon: <Users size={20} />,
      color: "blue",
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: <Clock size={20} />,
      color: "orange",
      bgClass: "bg-orange-100 dark:bg-orange-900/30",
      textClass: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Completed (Month)",
      value: stats.completedThisMonth,
      icon: <CheckCircle2 size={20} />,
      color: "green",
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-400",
    },
    {
      label: "Documents Pending",
      value: stats.pendingDocuments,
      icon: <FileText size={20} />,
      color: "red",
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-600 dark:text-red-400",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "initiated":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "in-progress":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "completed":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={deleteModal.isOpen && !!deleteModal.employee}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Onboarding"
        message={`Are you sure you want to delete the onboarding record for ${
          deleteModal.employee?.name || "this employee"
        }? All progress, documents, salary, and bank details collected so far will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={!!deletingId}
        variant="danger"
      />

      <div className="w-full overflow-x-hidden">
        {/* Stats Cards */}
        <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 mb-6">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgClass} rounded-xl flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
                <span
                  className={`text-2xl md:text-3xl font-extrabold ${stat.textClass}`}
                >
                  {stat.value}
                </span>
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Onboarding
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage employee onboarding process, document collection, and
            orientation
          </p>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {onboardingCards.map((card) => (
            <div
              key={card.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-soft transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(card.path)}
            >
              <div className="p-4 md:p-6">
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 ${card.bgClass} rounded-xl flex items-center justify-center mb-3 md:mb-4`}
                >
                  {card.icon}
                </div>

                <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3 md:mb-4">
                  {card.description}
                </p>

                <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {card.stats}
                  </span>
                  <button
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg ${card.buttonClass} font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all group-hover:gap-2 md:group-hover:gap-3`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(card.path);
                    }}
                  >
                    {card.buttonText}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Onboarding Section */}
        {recentOnboarding.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                    Recent Onboarding
                  </h3>
                  {progressLoading && (
                    <RefreshCw
                      size={14}
                      className="text-gray-400 animate-spin"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {recentOnboarding.map((employee) => {
                  const isDeleting = deletingId === employee.id;
                  const isCompleted = employee.percentage >= 100;

                  return (
                    <div
                      key={employee.id}
                      className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserCheck
                              size={18}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                {employee.name}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {employee.employeeId}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Briefcase size={12} />
                                {employee.department}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(employee.joiningDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              employee.status,
                            )}`}
                          >
                            {employee.status === "completed"
                              ? "Completed"
                              : employee.status === "in-progress"
                                ? "In Progress"
                                : "Initiated"}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <ShieldCheck size={12} />
                            {employee.stepLabel}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {employee.completedSteps}/{employee.totalSteps}{" "}
                            steps • {employee.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              employee.percentage >= 100
                                ? "bg-green-500"
                                : employee.percentage >= 50
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                            }`}
                            style={{ width: `${employee.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {isCompleted ? (
                          <button
                            onClick={() => handleViewDetails(employee)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Eye size={12} />
                            View Details
                          </button>
                        ) : (
                          <button
                            onClick={() => handleContinue(employee)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Play size={12} />
                            {employee.completedSteps === 0
                              ? "Start"
                              : "Continue"}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClick(employee)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all border border-red-100 dark:border-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips Section */}
        <div className="mt-6 p-3 md:p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900/50">
          <div className="flex items-start gap-2 md:gap-3">
            <Building2
              size={18}
              className="text-green-600 dark:text-green-400 mt-0.5"
            />
            <div>
              <h4 className="text-xs md:text-sm font-bold text-green-900 dark:text-green-300">
                Onboarding Best Practices
              </h4>
              <p className="text-[10px] md:text-xs text-green-700 dark:text-green-400 mt-1">
                Ensure all documents are collected before joining date. Complete
                visa processing at least 2 weeks prior to start date. Schedule
                orientation and IT setup in advance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingDashboard;
