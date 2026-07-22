// Tasks.jsx - With department fetching and working filters
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/common/Toast";
import ConfirmModal from "../components/common/ConfirmModal";
import TaskModal from "../components/tasks/TaskModal";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Paginations";
import {
  fetchTasks,
  deleteTask,
  updateTaskStatus,
  clearError,
} from "../store/slices/tasksSlice";
import { fetchProjects } from "../store/slices/projectsSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { fetchDepartments } from "../store/slices/departmentSlice"; // Add this import

const Tasks = () => {
  const dispatch = useDispatch();
  const {
    tasks = [],
    loading,
    error,
    totalCount,
    currentPage,
    lastPage,
    perPage,
  } = useSelector((state) => state.tasks || {});
  const { projects = [] } = useSelector((state) => state.projects || {});
  const { employees = [] } = useSelector((state) => state.employees || {});
  const { departments = [] } = useSelector((state) => state.departments || {}); // Add this
  const { user: authUser } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [perPageState, setPerPageState] = useState(15);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [expandedStatuses, setExpandedStatuses] = useState({});

  // Get base URL from environment
  const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchEmployees());
    dispatch(fetchDepartments()); // Add this
  }, [dispatch]);

  // Fetch tasks with filters
  useEffect(() => {
    const params = {
      page: currentPageState,
      per_page: perPageState,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      project_id: projectFilter !== "all" ? projectFilter : undefined,
      department_id: departmentFilter !== "all" ? departmentFilter : undefined,
    };
    dispatch(fetchTasks(params));
  }, [
    dispatch,
    currentPageState,
    perPageState,
    searchTerm,
    statusFilter,
    projectFilter,
    departmentFilter,
  ]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    const params = {
      page: currentPageState,
      per_page: perPageState,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      project_id: projectFilter !== "all" ? projectFilter : undefined,
      department_id: departmentFilter !== "all" ? departmentFilter : undefined,
    };
    await dispatch(fetchTasks(params));
    setRefreshLoading(false);
    showToast("Tasks refreshed!", "success");
  };

  const handleDelete = (task) => {
    setConfirmDelete(task);
  };

  const confirmDeleteTask = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    const result = await dispatch(deleteTask(confirmDelete.id));
    if (deleteTask.fulfilled.match(result)) {
      showToast("Task deleted successfully!", "success");
      setConfirmDelete(null);
      handleRefresh();
    } else {
      showToast(result.payload || "Failed to delete task", "error");
    }
    setActionLoading(false);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleModalClose = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleTaskSuccess = () => {
    handleRefresh();
  };

  const toggleStatusExpand = (taskId) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getTaskStatus = (task) => {
    if (task.status) return task.status;
    if (task.task_status) return task.task_status;
    if (
      task.assigned_to &&
      task.assigned_to.length > 0 &&
      task.assigned_to[0].pivot?.status
    ) {
      return task.assigned_to[0].pivot.status;
    }
    return "pending";
  };

  const getEmployeeStatus = (emp) => {
    if (emp.pivot?.status) return emp.pivot.status;
    if (emp.status) return emp.status;
    return "assigned";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      in_progress: {
        label: "In Progress",
        class:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
      completed: {
        label: "Completed",
        class:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      done: {
        label: "Completed",
        class:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      on_hold: {
        label: "On Hold",
        class:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      },
      pending: {
        label: "Pending",
        class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
      assigned: {
        label: "Assigned",
        class:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      },
    };
    const s = statusMap[status] || {
      label: status || "Unknown",
      class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.class}`}
      >
        {s.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: {
        label: "High",
        class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
      medium: {
        label: "Medium",
        class:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      low: {
        label: "Low",
        class:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
    };
    const p = priorityMap[priority] || priorityMap.medium;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.class}`}
      >
        {p.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isTaskOverdue = (task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const status = getTaskStatus(task);
    return dueDate < today && status !== "completed" && status !== "done";
  };

  // Get employee avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("data:")) return avatar;
    if (avatar.startsWith("/tmp/")) {
      return `${baseUrl}/storage/temp/${avatar.replace("/tmp/", "")}`;
    }
    if (avatar.startsWith("/storage/")) {
      return `${baseUrl}${avatar}`;
    }
    return `${baseUrl}/storage/${avatar}`;
  };

  const totalPages = lastPage || Math.ceil(totalCount / perPageState);

  // Calculate stats from tasks
  const stats = {
    total: tasks.length || 0,
    completed: tasks.filter((t) => {
      const status = getTaskStatus(t);
      return status === "completed" || status === "done";
    }).length,
    inProgress: tasks.filter((t) => {
      const status = getTaskStatus(t);
      return status === "in_progress";
    }).length,
    onHold: tasks.filter((t) => {
      const status = getTaskStatus(t);
      return status === "on_hold";
    }).length,
    pending: tasks.filter((t) => {
      const status = getTaskStatus(t);
      return status === "pending" || status === "assigned";
    }).length,
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-tasks text-purple-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-purple-600">
            {stats.total}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">
            Total Tasks
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-check-circle text-green-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-spinner text-blue-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {stats.inProgress}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">
            In Progress
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-pause-circle text-yellow-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-yellow-600">
            {stats.onHold}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">On Hold</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-hourglass-half text-gray-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-600">
            {stats.pending}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">Pending</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
          <i className="fas fa-tasks text-green-500"></i>
          Tasks
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPageState(1);
          }}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-full text-xs md:text-sm"
        >
          <option value="all">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => {
            setProjectFilter(e.target.value);
            setCurrentPageState(1);
          }}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-full text-xs md:text-sm"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_name || project.name}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPageState(1);
          }}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-full text-xs md:text-sm"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <div className="flex-1"></div>

        <button
          onClick={handleRefresh}
          disabled={refreshLoading}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <i
            className={`fas fa-sync-alt ${refreshLoading ? "fa-spin" : ""}`}
          ></i>
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          onClick={handleAddTask}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
        >
          <i className="fas fa-plus-circle"></i> New Task
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPageState(1);
          }}
          placeholder="Search tasks by name, description, or assigned to..."
        />
      </div>

      {/* Tasks Table */}
      {loading && tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
          <div className="min-w-[1200px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task, idx) => {
                    const taskProject =
                      task.project ||
                      projects.find((p) => p.id === task.project_id);
                    const assignedEmployees = task.assigned_to || [];
                    const taskStatus = getTaskStatus(task);
                    const isOverdue = isTaskOverdue(task);
                    // Get department name from task's project or directly from task
                    const deptName =
                      taskProject?.department?.name ||
                      task.department?.name ||
                      departments.find((d) => d.id === task.department_id)
                        ?.name ||
                      "-";
                    const isStatusExpanded = expandedStatuses[task.id] || false;
                    const hasMultipleEmployees = assignedEmployees.length > 1;

                    return (
                      <React.Fragment key={task.id}>
                        {/* Main task row */}
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {(currentPageState - 1) * perPageState + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {task.title}
                              </p>
                              {task.task_description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                  {task.task_description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {taskProject?.project_name ||
                                taskProject?.name ||
                                "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {assignedEmployees.length > 0 ? (
                                assignedEmployees.map((emp, i) => {
                                  const avatarUrl = getAvatarUrl(emp.avatar);
                                  const empName =
                                    emp.first_name ||
                                    emp.employee_name ||
                                    emp.name ||
                                    "Unknown";
                                  return (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      {avatarUrl ? (
                                        <img
                                          src={avatarUrl}
                                          alt={empName}
                                          className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            const fallback =
                                              e.target.parentElement.querySelector(
                                                ".fallback-avatar",
                                              );
                                            if (fallback)
                                              fallback.style.display = "flex";
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className="fallback-avatar w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold"
                                        style={{
                                          display: avatarUrl ? "none" : "flex",
                                        }}
                                      >
                                        {empName.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-sm text-gray-700 dark:text-gray-200">
                                        {empName}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-gray-400">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {deptName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {task.due_date ? (
                              <span
                                className={
                                  isOverdue
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-600"
                                }
                              >
                                {formatDate(task.due_date)}
                                {isOverdue && (
                                  <span className="ml-1 text-xs text-red-500">
                                    <i className="fas fa-exclamation-circle"></i>
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="px-4 py-3">
                            {hasMultipleEmployees ? (
                              <button
                                onClick={() => toggleStatusExpand(task.id)}
                                className="text-xs text-blue-500 hover:text-blue-600 focus:outline-none flex items-center gap-1"
                              >
                                <span>
                                  {isStatusExpanded
                                    ? "Hide Statuses"
                                    : "Show Statuses"}
                                </span>
                                <i
                                  className={`fas fa-chevron-${isStatusExpanded ? "up" : "down"} text-[10px] transition-transform duration-200`}
                                ></i>
                              </button>
                            ) : (
                              getStatusBadge(taskStatus)
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(task)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
                                title="Edit Task"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(task)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                                title="Delete Task"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded dropdown row - compact like second image */}
                        {isStatusExpanded && hasMultipleEmployees && (
                          <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                            <td colSpan="9" className="px-4 py-2">
                              <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                                {assignedEmployees.map((emp, i) => {
                                  const empStatus = getEmployeeStatus(emp);
                                  const empName =
                                    emp.first_name ||
                                    emp.employee_name ||
                                    emp.name ||
                                    "Unknown";
                                  const avatarUrl = getAvatarUrl(emp.avatar);
                                  return (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2.5"
                                    >
                                      {avatarUrl ? (
                                        <img
                                          src={avatarUrl}
                                          alt={empName}
                                          className="w-5 h-5 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
                                        />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                          {empName.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="text-sm text-gray-700 dark:text-gray-200">
                                        {empName}
                                      </span>
                                      {getStatusBadge(empStatus)}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <i className="fas fa-tasks text-3xl mb-2 block"></i>
                      <p>No tasks found</p>
                      <button
                        onClick={handleAddTask}
                        className="mt-3 text-green-500 hover:text-green-600 text-sm font-medium"
                      >
                        + Add your first task
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalCount > 0 && (
        <Pagination
          currentPage={currentPageState}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPageState(page)}
          totalItems={totalCount}
          itemsPerPage={perPageState}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleModalClose}
        task={selectedTask}
        onSuccess={handleTaskSuccess}
        employees={employees}
        projects={projects}
        authUser={authUser}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmText="Delete"
        loading={actionLoading}
        variant="danger"
      />
    </div>
  );
};

export default Tasks;
