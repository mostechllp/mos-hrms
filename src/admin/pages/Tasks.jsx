import React from 'react'
import UnderDevelopment from '../../components/common/UnderDevelopment';

const Tasks = () => {
  return (
    <UnderDevelopment pageName='Tasks' />
  )
}

export default Tasks

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import SearchBar from "../components/common/SearchBar";
// import EntriesSelector from "../components/common/EntriesSelector";
// import Pagination from "../components/common/Paginations";
// import TaskModal from "../components/tasks/TaskModal";
// import ConfirmModal from "../components/common/ConfirmModal";
// import { showToast } from "../../components/common/Toast";
// import {
//   fetchTasks,
//   deleteTask,
//   updateTaskStatus,
//   clearError,
//   setPagination,
// } from "../store/slices/tasksSlice";
// import { fetchProjects } from "../store/slices/projectsSlice";
// import { fetchEmployees } from "../store/slices/employeeSlice";

// const Tasks = () => {
//   const dispatch = useDispatch();
//   const { tasks, loading, error, totalCount, currentPage, lastPage, perPage, stats } =
//     useSelector((state) => state.tasks || {});
//   const { projects = [] } = useSelector((state) => state.projects || {});
//   const { employees = [] } = useSelector((state) => state.employees || {});
//   const { user: authUser } = useSelector((state) => state.auth);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [projectFilter, setProjectFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [currentPageState, setCurrentPageState] = useState(1);
//   const [perPageState, setPerPageState] = useState(15);
//   const [showTaskModal, setShowTaskModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [refreshLoading, setRefreshLoading] = useState(false);

//   useEffect(() => {
//     dispatch(fetchEmployees());
//     dispatch(fetchProjects());
//   }, [dispatch]);

//   useEffect(() => {
//     const params = {
//       page: currentPageState,
//       per_page: perPageState,
//       search: searchTerm || undefined,
//       project_id: projectFilter !== "all" ? projectFilter : undefined,
//       status: statusFilter !== "all" ? statusFilter : undefined,
//     };
//     dispatch(fetchTasks(params));
//   }, [dispatch, currentPageState, perPageState, searchTerm, projectFilter, statusFilter]);

//   useEffect(() => {
//     if (error) {
//       showToast(error, "error");
//       dispatch(clearError());
//     }
//   }, [error, dispatch]);

//   const handleRefresh = async () => {
//     setRefreshLoading(true);
//     const params = {
//       page: currentPageState,
//       per_page: perPageState,
//       search: searchTerm || undefined,
//       project_id: projectFilter !== "all" ? projectFilter : undefined,
//       status: statusFilter !== "all" ? statusFilter : undefined,
//     };
//     await dispatch(fetchTasks(params));
//     setRefreshLoading(false);
//     showToast("Tasks refreshed!", "success");
//   };

//   const handleDelete = (task) => {
//     setConfirmDelete(task);
//   };

//   const confirmDeleteTask = async () => {
//     if (!confirmDelete) return;
//     setActionLoading(true);
//     const result = await dispatch(deleteTask(confirmDelete.id));
//     if (deleteTask.fulfilled.match(result)) {
//       showToast("Task deleted successfully!", "success");
//       setConfirmDelete(null);
//       handleRefresh();
//     } else {
//       showToast(result.payload || "Failed to delete task", "error");
//     }
//     setActionLoading(false);
//   };

//   const handleStatusChange = async (taskId, newStatus) => {
//     const result = await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
//     if (updateTaskStatus.fulfilled.match(result)) {
//       showToast(`Task marked as ${newStatus}`, "success");
//       handleRefresh();
//     } else {
//       showToast(result.payload || "Failed to update status", "error");
//     }
//   };

//   const handleEdit = (task) => {
//     setSelectedTask(task);
//     setShowTaskModal(true);
//   };

//   const handleAddTask = () => {
//     setSelectedTask(null);
//     setShowTaskModal(true);
//   };

//   const handleModalClose = () => {
//     setShowTaskModal(false);
//     setSelectedTask(null);
//   };

//   const handleTaskSuccess = () => {
//     handleRefresh();
//   };

//   const totalTasks = stats?.total || totalCount || tasks.length;
//   const pendingTasks = stats?.pending || tasks.filter(t => t.status === "pending").length;
//   const inProgressTasks = stats?.inProgress || tasks.filter(t => t.status === "in_progress").length;
//   const completedTasks = stats?.completed || tasks.filter(t => t.status === "completed").length;
//   const overdueTasks = stats?.overdue || tasks.filter(t => t.status === "overdue").length;

//   const getStatusBadge = (status) => {
//     const statusMap = {
//       pending: { label: "Pending", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
//       in_progress: { label: "In Progress", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
//       completed: { label: "Completed", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
//       overdue: { label: "Overdue", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
//     };
//     const s = statusMap[status] || statusMap.pending;
//     return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.class}`}>{s.label}</span>;
//   };

//   const getPriorityBadge = (priority) => {
//     const priorityMap = {
//       high: { label: "High", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
//       medium: { label: "Medium", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
//       low: { label: "Low", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
//     };
//     const p = priorityMap[priority] || priorityMap.medium;
//     return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.class}`}>{p.label}</span>;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const start = (currentPageState - 1) * perPageState;
//   const totalPages = lastPage || Math.ceil((searchTerm || projectFilter !== "all" || statusFilter !== "all" ? tasks.length : totalCount) / perPageState);

//   return (
//     <div className="w-full overflow-x-hidden">
//       {/* Stats Cards */}
//       <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
//           <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
//             <i className="fas fa-tasks text-purple-600 dark:text-purple-400 text-sm md:text-lg"></i>
//           </div>
//           <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{totalTasks}</div>
//           <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Total Tasks</div>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
//           <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
//             <i className="fas fa-clock text-amber-600 dark:text-amber-400"></i>
//           </div>
//           <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingTasks}</div>
//           <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Pending</div>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
//           <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
//             <i className="fas fa-spinner text-blue-600 dark:text-blue-400"></i>
//           </div>
//           <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</div>
//           <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">In Progress</div>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
//           <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
//             <i className="fas fa-check-circle text-green-600 dark:text-green-400"></i>
//           </div>
//           <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
//           <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Completed</div>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700">
//           <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-1 md:mb-2">
//             <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
//           </div>
//           <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{overdueTasks}</div>
//           <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Overdue</div>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
//         <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
//           <i className="fas fa-tasks text-green-500"></i>
//           Task Management
//           <span className="text-[10px] md:text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
//             <i className="fas fa-calendar-check mr-1"></i> Manage Tasks
//           </span>
//         </h2>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
//         <select
//           value={projectFilter}
//           onChange={(e) => { setProjectFilter(e.target.value); setCurrentPageState(1); }}
//           className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
//         >
//           <option value="all">All Projects</option>
//           {projects.map((project) => (
//             <option key={project.id} value={project.id}>{project.name}</option>
//           ))}
//         </select>

//         <select
//           value={statusFilter}
//           onChange={(e) => { setStatusFilter(e.target.value); setCurrentPageState(1); }}
//           className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
//         >
//           <option value="all">All Status</option>
//           <option value="pending">Pending</option>
//           <option value="in_progress">In Progress</option>
//           <option value="completed">Completed</option>
//           <option value="overdue">Overdue</option>
//         </select>

//         <div className="flex-1"></div>

//         <button
//           onClick={handleRefresh}
//           disabled={refreshLoading}
//           className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//         >
//           <i className={`fas fa-sync-alt ${refreshLoading ? "fa-spin" : ""}`}></i>
//           Refresh
//         </button>
//         <Link
//           to="/admin/projects"
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
//         >
//           <i className="fas fa-project-diagram"></i> Manage Projects
//         </Link>
//         <button
//           onClick={handleAddTask}
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
//         >
//           <i className="fas fa-plus-circle"></i> Assign Task
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-5">
//         <SearchBar
//           value={searchTerm}
//           onChange={(value) => { setSearchTerm(value); setCurrentPageState(1); }}
//           placeholder="Search tasks by name, project, client..."
//         />
//       </div>

//       {/* Tasks Table */}
//       {loading && tasks.length === 0 ? (
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
//           <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
//           <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
//         </div>
//       ) : (
//         <>
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
//             <div className="min-w-[1000px] lg:min-w-0">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Task Name</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Project / Client</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Assigned To</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Due Date</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Priority</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
//                     <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tasks.length > 0 ? (
//                     tasks.map((task, idx) => (
//                       <tr key={task.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                         <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">{start + idx + 1}</td>
//                         <td className="px-3 md:px-4 py-2 md:py-3">
//                           <div>
//                             <p className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">{task.name}</p>
//                             {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">{task.description}</p>}
//                           </div>
//                         </td>
//                         <td className="px-3 md:px-4 py-2 md:py-3">
//                           <div>
//                             <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{task.project?.name || "-"}</p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">{task.project?.client_name || "-"}</p>
//                           </div>
//                         </td>
//                         <td className="px-3 md:px-4 py-2 md:py-3">
//                           <div className="flex flex-wrap gap-1">
//                             {task.assigned_to?.map((emp, i) => (
//                               <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
//                                 {emp.name}
//                               </span>
//                             ))}
//                           </div>
//                          </td>
//                         <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm whitespace-nowrap">
//                           {task.due_date ? (
//                             <span className={new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-600 font-semibold" : "text-gray-600 dark:text-gray-400"}>
//                               {formatDate(task.due_date)}
//                             </span>
//                           ) : "-"}
//                          </td>
//                         <td className="px-3 md:px-4 py-2 md:py-3">{getPriorityBadge(task.priority)}</td>
//                         <td className="px-3 md:px-4 py-2 md:py-3">
//                           <select
//                             value={task.status}
//                             onChange={(e) => handleStatusChange(task.id, e.target.value)}
//                             className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700"
//                           >
//                             <option value="pending">Pending</option>
//                             <option value="in_progress">In Progress</option>
//                             <option value="completed">Completed</option>
//                             <option value="overdue">Overdue</option>
//                           </select>
//                         </td>
//                         <td className="px-3 md:px-4 py-2 md:py-3">
//                           <div className="flex gap-1 md:gap-2">
//                             <button onClick={() => handleEdit(task)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500" title="Edit Task">
//                               <i className="fas fa-edit text-xs md:text-sm"></i>
//                             </button>
//                             <button onClick={() => handleDelete(task)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500" title="Delete Task">
//                               <i className="fas fa-trash text-xs md:text-sm"></i>
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
//                         <i className="fas fa-tasks text-3xl mb-2 block"></i>
//                         <p>No tasks found</p>
//                         <button onClick={handleAddTask} className="mt-3 text-green-500 hover:text-green-600 text-sm font-medium">
//                           + Assign a new task
//                         </button>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {totalCount > 0 && (
//             <Pagination
//               currentPage={currentPageState}
//               totalPages={totalPages}
//               onPageChange={(page) => setCurrentPageState(page)}
//               totalItems={totalCount}
//               itemsPerPage={perPageState}
//             />
//           )}
//         </>
//       )}

//       <TaskModal
//         isOpen={showTaskModal}
//         onClose={handleModalClose}
//         task={selectedTask}
//         onSuccess={handleTaskSuccess}
//         employees={employees}
//         projects={projects}
//         authUser={authUser}
//       />

//       <ConfirmModal
//         isOpen={!!confirmDelete}
//         onClose={() => setConfirmDelete(null)}
//         onConfirm={confirmDeleteTask}
//         title="Delete Task"
//         message={`Are you sure you want to delete "${confirmDelete?.name}"?`}
//         confirmText="Delete"
//         loading={actionLoading}
//       />
//     </div>
//   );
// };

// export default Tasks;