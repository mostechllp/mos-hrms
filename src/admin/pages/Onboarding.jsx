// src/admin/pages/Onboarding.jsx
import { useState, useEffect, useMemo } from "react";
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
  Search,
} from "lucide-react";
import { updateEmployeeStatus, fetchEmployees } from "../store/slices/employeeSlice";
import {
  deleteOnboardingEmployee,
  resetOnboarding,
} from "../store/slices/onboardingSlice";
import ConfirmModal from "../components/common/ConfirmModal";
import { showToast } from "../../components/common/Toast";
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

  // Where the wizard lives
  const onboardingBase = isEmployee
    ? "/employee/onboarding"
    : "/admin/employees/onboarding";

  const [stats, setStats] = useState({
    activeOnboarding: 0,
    pendingTasks: 0,
    completedThisMonth: 0,
    pendingDocuments: 0,
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [deletingId, setDeletingId] = useState(null);

  const [activateModal, setActivateModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [activatingId, setActivatingId] = useState(null);

  // Fetch candidates from onboarding-specific endpoint
  const loadOnboardingData = async () => {
    setLoading(true);
    try {
      let rawList = [];
      try {
        const res = await apiClient.get(`${base}/onboarding-employees`);
        rawList = res.data?.data ?? res.data ?? [];
      } catch (err) {
        // Fallback to employees with status=onboarding
        const res = await apiClient.get(`${base}/employees`, {
          params: { status: "onboarding", per_page: 100 },
        });
        rawList = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      }

      if (!Array.isArray(rawList)) {
        rawList = [];
      }

      // STRICTLY keep only candidates whose status is 'onboarding'
      const onboardingList = rawList.filter((emp) => {
        const rawStatus = (
          emp.user?.status ||
          emp.status ||
          "onboarding"
        ).toLowerCase();
        return rawStatus === "onboarding";
      });

      // Fetch progress for each candidate
      setProgressLoading(true);
      const progressPairs = await Promise.allSettled(
        onboardingList.map((emp) => {
          const userId = emp.userId || emp.user_id || emp.id;
          return apiClient
            .get(`${base}/employees/onboard/progress/${userId}`)
            .then((res) => res.data?.data ?? res.data)
            .then((data) => ({ empId: emp.id, progress: data }))
            .catch(() => ({ empId: emp.id, progress: null }));
        }),
      );
      setProgressLoading(false);

      const progressMap = new Map();
      progressPairs.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.progress) {
          progressMap.set(result.value.empId, result.value.progress);
        }
      });

      let activeCount = onboardingList.length;
      let pendingTasksCount = 0;
      let pendingDocsCount = 0;

      const formatted = onboardingList.map((emp) => {
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

        const remaining = totalSteps - completedSteps;
        pendingTasksCount += Math.max(remaining, 0);

        const checklistStep = steps.find((s) => s.key === "checklist");
        if (checklistStep && !checklistStep.completed) {
          pendingDocsCount += 1;
        }

        return {
          id: emp.id,
          userId: emp.userId || emp.user_id || emp.id,
          name:
            emp.name ||
            `${emp.firstName || emp.first_name || ""} ${
              emp.lastName || emp.last_name || ""
            }`.trim() ||
            "Unnamed Candidate",
          email:
            emp.company_email ||
            emp.personal_email ||
            emp.user?.email ||
            "No email provided",
          employeeId: emp.employeeId || emp.employee_id || `OB-${emp.id}`,
          department:
            emp.department?.name ||
            emp.user?.department?.name ||
            emp.department ||
            "Not Assigned",
          designation:
            emp.designation?.name ||
            emp.user?.designation?.name ||
            emp.designation ||
            "Not Assigned",
          joiningDate:
            emp.joiningDate || emp.joining_date || emp.created_at || emp.createdAt,
          status: "onboarding",
          percentage,
          completedSteps,
          totalSteps,
          stepLabel: currentStepEntry?.label || "Initiation",
          currentStepKey: currentStepEntry?.key || "details",
          apiStepNumber: firstIncomplete?.step ?? null,
          steps,
        };
      });

      setStats({
        activeOnboarding: activeCount,
        pendingTasks: pendingTasksCount,
        completedThisMonth: 0,
        pendingDocuments: pendingDocsCount,
      });

      setCandidates(formatted);
    } catch (err) {
      console.error("Failed to load onboarding candidates:", err);
      showToast("Failed to load onboarding candidates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // Handle status slide toggle (Slide from Onboarding -> Active)
  const handleToggleClick = (candidate) => {
    setActivateModal({
      isOpen: true,
      employee: candidate,
    });
  };

  const confirmStatusChange = async () => {
    const { employee } = activateModal;
    if (!employee) return;

    setActivatingId(employee.id);
    try {
      const result = await dispatch(
        updateEmployeeStatus({
          id: employee.id,
          status: "active",
        }),
      );

      if (updateEmployeeStatus.fulfilled.match(result)) {
        showToast(
          `${employee.name} activated successfully and moved to Employee Directory!`,
          "success",
        );
        // Immediately remove candidate from this table so they go to the Employee Directory table
        setCandidates((prev) => prev.filter((e) => e.id !== employee.id));
        setStats((prev) => ({
          ...prev,
          activeOnboarding: Math.max(0, prev.activeOnboarding - 1),
        }));
        // Update employee slice so the Employee Directory immediately has the active employee
        dispatch(fetchEmployees());
      } else {
        showToast(
          result.error?.message || "Failed to update candidate status",
          "error",
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      showToast("Failed to update status", "error");
    } finally {
      setActivatingId(null);
      setActivateModal({ isOpen: false, employee: null });
    }
  };

  const cancelStatusChange = () => {
    if (activatingId) return;
    setActivateModal({ isOpen: false, employee: null });
  };

  const handleStartFreshOnboarding = () => {
    dispatch(resetOnboarding());
    try {
      localStorage.removeItem("onboarding_user_id");
      localStorage.removeItem("onboarding-draft");
    } catch {
      /* ignore */
    }
    navigate(`${onboardingBase}/initiate`);
  };

  // Resume wizard where candidate left off
  const handleContinue = (employee) => {
    if (employee.percentage >= 100) {
      navigate(`${onboardingBase}/review?id=${employee.userId}`);
      return;
    }

    let wizardStep = null;
    if (employee.apiStepNumber != null) {
      wizardStep = API_STEP_TO_WIZARD_STEP[employee.apiStepNumber] ?? null;
    }

    if (!wizardStep && employee.currentStepKey) {
      wizardStep = STEP_KEY_TO_WIZARD_STEP[employee.currentStepKey] ?? null;
    }

    if (employee.completedSteps === 0 || !wizardStep) wizardStep = 2;

    const section = WIZARD_STEP_TO_SECTION[wizardStep] || "initiate";
    navigate(`${onboardingBase}/${section}?id=${employee.userId}`);
  };

  const handleViewDetails = (employee) => {
    const targetId = employee.id || employee.userId;
    navigate(`${base}/employees/${targetId}`);
  };

  const handleDeleteClick = (employee) => {
    setDeleteModal({ isOpen: true, employee });
  };

  const confirmDelete = async () => {
    const employee = deleteModal.employee;
    if (!employee) return;

    setDeletingId(employee.id);
    try {
      await dispatch(deleteOnboardingEmployee(employee.id)).unwrap();
      showToast("Onboarding candidate deleted successfully", "success");
      setCandidates((prev) => prev.filter((e) => e.id !== employee.id));
      setDeleteModal({ isOpen: false, employee: null });
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete onboarding record", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    if (deletingId) return;
    setDeleteModal({ isOpen: false, employee: null });
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
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

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        cand.name?.toLowerCase().includes(q) ||
        cand.email?.toLowerCase().includes(q) ||
        cand.employeeId?.toLowerCase().includes(q) ||
        cand.department?.toLowerCase().includes(q) ||
        cand.designation?.toLowerCase().includes(q)
      );
    });
  }, [candidates, searchQuery]);

  const quickStats = [
    {
      label: "Active Onboarding",
      value: stats.activeOnboarding,
      icon: <Users size={20} />,
      bgClass: "bg-amber-100 dark:bg-amber-900/30",
      textClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: <Clock size={20} />,
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Completed (Month)",
      value: stats.completedThisMonth,
      icon: <CheckCircle2 size={20} />,
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-400",
    },
    {
      label: "Documents Pending",
      value: stats.pendingDocuments,
      icon: <FileText size={20} />,
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-600 dark:text-red-400",
    },
  ];

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
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen && !!deleteModal.employee}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Onboarding Record"
        message={`Are you sure you want to delete the onboarding record for ${
          deleteModal.employee?.name || "this candidate"
        }? All saved documents, salary, and verification details collected so far will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={!!deletingId}
        variant="danger"
      />

      {/* Status Activation Confirmation Modal */}
      <ConfirmModal
        isOpen={activateModal.isOpen && !!activateModal.employee}
        onClose={cancelStatusChange}
        onConfirm={confirmStatusChange}
        title="Activate Employee"
        message={`Are you sure you want to activate ${
          activateModal.employee?.name || "this candidate"
        }? Their status will change to Active, and they will be transferred immediately to the Employee Directory.`}
        confirmText="Activate & Move"
        cancelText="Cancel"
        loading={!!activatingId}
        variant="primary"
      />

      <div className="w-full overflow-x-hidden space-y-6">
        {/* Quick Stats Grid */}
        <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
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

        {/* Page Header with Action Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
              Onboarding Candidates
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage candidates in the onboarding pipeline. When activated, candidates
              automatically leave this table and move to the Employee Directory.
            </p>
          </div>

          <button
            onClick={handleStartFreshOnboarding}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-xs md:text-sm shadow-md hover:shadow-lg transition-all"
          >
            <UserPlus size={16} />
            <span>Initiate Onboarding</span>
          </button>
        </div>

        {/* Main Onboarding Candidates Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Filters & Search Toolbar */}
          <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Header Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Candidates in Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                {filteredCandidates.length}
              </span>
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search candidate, role, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs md:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
              <button
                onClick={loadOnboardingData}
                disabled={loading || progressLoading}
                title="Refresh list"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
              >
                <RefreshCw
                  size={15}
                  className={loading || progressLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    S.L.NO.
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    NAME
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    DESIGNATION
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    DEPARTMENT
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    STATUS
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-2xl flex items-center justify-center mb-3">
                          <Users size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          No Onboarding Candidates Found
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 text-center">
                          {searchQuery
                            ? "No candidates matched your search criteria."
                            : "There are currently no candidates in the onboarding pipeline."}
                        </p>
                        <button
                          onClick={handleStartFreshOnboarding}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs shadow-sm transition-all"
                        >
                          <UserPlus size={14} />
                          <span>Initiate Candidate</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate, idx) => {
                    const isDeleting = deletingId === candidate.id;
                    const isActivating = activatingId === candidate.id;

                    return (
                      <tr
                        key={candidate.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* S.L.NO. */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center w-16">
                          {idx + 1}
                        </td>

                        {/* NAME */}
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] md:text-xs font-bold uppercase">
                                {getInitials(candidate.name)}
                              </div>
                            </div>
                            <span className="text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {candidate.name}
                            </span>
                          </div>
                        </td>

                        {/* DESIGNATION */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {candidate.designation}
                        </td>

                        {/* DEPARTMENT */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {candidate.department}
                        </td>

                        {/* STATUS */}
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <label
                            className={`inline-flex items-center gap-1 md:gap-2 cursor-pointer ${
                              isActivating ? "opacity-50 pointer-events-none" : ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            title="Slide to activate candidate and move to Employee Directory"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={false}
                                disabled={isActivating}
                                onChange={() => handleToggleClick(candidate)}
                              />
                              <div className="w-9 h-5 md:w-11 md:h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            </div>
                            <span className="text-[10px] md:text-xs font-semibold text-amber-600 dark:text-amber-400">
                              Onboarding
                            </span>
                          </label>
                        </td>

                        {/* ACTION */}
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div
                            className="flex gap-1 md:gap-2 items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* View / Progress icon (blue) */}
                            <button
                              onClick={() => handleContinue(candidate)}
                              disabled={isDeleting || isActivating}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
                              title="View Onboarding Progress"
                            >
                              <i className="fas fa-compass text-xs md:text-sm"></i>
                            </button>

                            {/* Edit / Resume wizard (amber) */}
                            <button
                              onClick={() => handleContinue(candidate)}
                              disabled={isDeleting || isActivating}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors"
                              title="Edit / Resume Onboarding"
                            >
                              <i className="fas fa-edit text-xs md:text-sm"></i>
                            </button>

                            {/* Delete (red) */}
                            <button
                              onClick={() => handleDeleteClick(candidate)}
                              disabled={isDeleting || isActivating}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors disabled:opacity-40"
                              title="Delete Candidate"
                            >
                              {isDeleting ? (
                                <i className="fas fa-spinner fa-spin text-xs md:text-sm"></i>
                              ) : (
                                <i className="fas fa-trash text-xs md:text-sm"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Guidance Footer */}
        <div className="p-4 bg-green-50/70 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/40 flex items-start gap-3">
          <Building2
            size={18}
            className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
          />
          <div className="text-xs text-green-800 dark:text-green-300">
            <span className="font-bold">Onboarding & Activation Policy:</span>{" "}
            Candidates remain in this separate Onboarding list until their onboarding
            details and documents are verified. Sliding the toggle to{" "}
            <span className="font-semibold text-green-700 dark:text-green-200">
              Active
            </span>{" "}
            confirms them as an official company employee and immediately unlocks
            them in the Employee Directory, attendance, and payroll modules.
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingDashboard;
