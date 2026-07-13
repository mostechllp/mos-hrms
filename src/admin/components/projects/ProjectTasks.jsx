import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../common/ConfirmModal";
import TaskModal from "../tasks/TaskModal";
import {
  fetchTasksByProject,
  deleteTask,
  updateTaskStatus,
  clearError,
} from "../../store/slices/tasksSlice";
import { fetchProjectById } from "../../store/slices/projectsSlice";
import { fetchEmployees } from "../../store/slices/employeeSlice";

const ProjectTasks = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { projectTasks = [], loading, error } = useSelector((state) => state.tasks || {});
  const { currentProject } = useSelector((state) => state.projects || {});
  const { employees = [] } = useSelector((state) => state.employees || {});
  const { user: authUser } = useSelector((state) => state.auth);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    // Fetch project details and its tasks
    dispatch(fetchProjectById(id));
    dispatch(fetchTasksByProject(id));
    dispatch(fetchEmployees());
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calculate project stats when tasks change
  useEffect(() => {
    if (projectTasks.length > 0) {
      const stats = {
        total: projectTasks.length,
        completed: projectTasks.filter(t => {
          const rawStatus = t.status || t.task_status || t.assigned_to?.[0]?.pivot?.status || "";
          const s = String(rawStatus).toLowerCase();
          return s === "completed" || s === "done";
        }).length,
        inProgress: projectTasks.filter(t => {
          const rawStatus = t.status || t.task_status || t.assigned_to?.[0]?.pivot?.status || "";
          const s = String(rawStatus).toLowerCase();
          return s === "in_progress" || s === "in progress" || s === "progress";
        }).length,
        onHold: projectTasks.filter(t => {
          const rawStatus = t.status || t.task_status || t.assigned_to?.[0]?.pivot?.status || "";
          const s = String(rawStatus).toLowerCase();
          return s === "on_hold" || s === "on hold" || s === "hold";
        }).length,
      };
      setProjectStats(stats);
    }
  }, [projectTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    const result = await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
    if (updateTaskStatus.fulfilled.match(result)) {
      showToast(`Task marked as ${newStatus}`, "success");
      dispatch(fetchTasksByProject(id));
    } else {
      showToast(result.payload || "Failed to update status", "error");
    }
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
      dispatch(fetchTasksByProject(id));
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
    dispatch(fetchTasksByProject(id));
    dispatch(fetchProjectById(id));
  };

  const getStatusBadge = (rawStatus) => {
    if (!rawStatus) return <span className="text-gray-400">-</span>;
    const status = String(rawStatus).toLowerCase().replace(/\s+/g, '_');
    
    const statusMap = {
      in_progress: { label: "In Progress", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      progress: { label: "In Progress", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      completed: { label: "Completed", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      done: { label: "Completed", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      on_hold: { label: "On Hold", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
      hold: { label: "On Hold", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
      pending: { label: "Pending", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" }
    };
    const s = statusMap[status] || { label: rawStatus, class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.class}`}>{s.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: { label: "High", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
      medium: { label: "Medium", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      low: { label: "Low", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    };
    const p = priorityMap[priority] || priorityMap.medium;
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.class}`}>{p.label}</span>;
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

  const calculateProgress = () => {
    if (projectStats.total === 0) return 0;
    return Math.round((projectStats.completed / projectStats.total) * 100);
  };

  if (loading && !currentProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-folder-open text-5xl text-gray-400 mb-3"></i>
        <p className="text-gray-500">Project not found</p>
        <Link to="/admin/projects" className="text-green-500 hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/admin/projects" className="text-green-500 hover:underline">Projects</Link>
        <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
        <span className="text-gray-500">{currentProject.project_name || currentProject.name}</span>
        <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
        <span className="text-gray-500">Tasks</span>
      </div>

      {/* Project Header Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{currentProject.project_name || currentProject.name}</h1>
            <p className="text-white/90 text-sm mb-3">{currentProject.client_name}</p>
            {currentProject.website_url && (
              <a href={currentProject.website_url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white text-sm inline-flex items-center gap-1">
                <i className="fas fa-globe"></i> {currentProject.website_url}
              </a>
            )}
          </div>
          <button
            onClick={handleAddTask}
            className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all"
          >
            <i className="fas fa-plus-circle"></i> Add Task
          </button>
        </div>
        {currentProject.description && (
          <p className="text-white/80 text-sm mt-3 max-w-2xl">{currentProject.description}</p>
        )}
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{projectStats.total}</div>
          <div className="text-xs text-gray-500">Total Tasks</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{projectStats.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{projectStats.inProgress}</div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-amber-600">{projectStats.onHold || 0}</div>
          <div className="text-xs text-gray-500">On Hold</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Progress</span>
          <span className="text-sm font-bold text-green-600">{calculateProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks Table */}
      {loading && projectTasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Task Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectTasks.length > 0 ? (
                  projectTasks.map((task, idx) => (
                    <tr key={task.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{task.title}</p>
                          {task.task_description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{task.task_description}</p>}
                        </div>
                       </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(task.assignedTo || task.assigned_to)?.map((empItem, i) => {
                            const empId = typeof empItem === 'object' ? empItem.id : empItem;
                            const emp = employees?.find(e => e.id === empId) || (typeof empItem === 'object' ? empItem : null);
                            if (!emp) return null;
                            return (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                                {emp.name || emp.employee_name || emp.first_name}
                              </span>
                            );
                          })}
                        </div>
                       </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {task.due_date ? (
                          <span className={new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-600 font-semibold" : "text-gray-600"}>
                            {formatDate(task.due_date)}
                          </span>
                        ) : "-"}
                       </td>
                      <td className="px-4 py-3">{getPriorityBadge(task.priority)}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(task.status || task.task_status || task.assigned_to?.[0]?.pivot?.status)}
                       </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(task)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500" title="Edit Task">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => handleDelete(task)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500" title="Delete Task">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <i className="fas fa-tasks text-3xl mb-2 block"></i>
                      <p>No tasks found for this project</p>
                      <button onClick={handleAddTask} className="mt-3 text-green-500 hover:text-green-600 text-sm font-medium">
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

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleModalClose}
        task={selectedTask}
        onSuccess={handleTaskSuccess}
        employees={employees}
        projects={[currentProject]}
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
      />
    </div>
  );
};

export default ProjectTasks;