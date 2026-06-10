import React from 'react'
import UnderDevelopment from '../../components/common/UnderDevelopment'

const Tasks = () => {
  return (
    <UnderDevelopment pageName='Tasks' />
  )
}

export default Tasks

// import React from "react";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import {
//   FiSearch,
//   FiChevronLeft,
//   FiChevronRight,
//   FiCalendar,
//   FiClock,
//   FiFlag,
//   FiUser,
//   FiBriefcase,
//   FiGlobe,
//   FiMessageSquare,
//   FiCheckCircle,
//   FiAlertCircle,
//   FiTrendingUp,
//   FiStar,
//   FiBarChart2,
//   FiTarget,
//   FiChevronUp,
//   FiChevronDown,
// } from "react-icons/fi";
// import {
//   fetchMyTasks,
//   updateTaskStatus,
//   getTaskDetails,
//   clearError,
//   setPagination,
// } from "../store/slices/taskSlice";
// import { showToast } from "../../components/common/Toast";

// const EmployeeTasks = () => {
//   const dispatch = useDispatch();
//   const { tasks, loading, error, stats, pagination } = useSelector(
//     (state) => state.employeeTasks || {}
//   );
//   const { user } = useSelector((state) => state.auth);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showTaskModal, setShowTaskModal] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(null);
//   const [expandedRows, setExpandedRows] = useState({});

//   const perPage = pagination?.perPage || 10;
//   const currentPage = pagination?.currentPage || 1;
//   const totalPages = pagination?.lastPage || 1;
//   const totalItems = pagination?.total || 0;

//   // Performance calculations
//   const totalTasks = stats?.total || 0;
//   const completionRate = totalTasks > 0 
//     ? Math.round(((stats?.completed || 0) / totalTasks) * 100) 
//     : 0;
//   const productivityScore = totalTasks > 0 
//     ? Math.round(((stats?.completed || 0) + (stats?.in_progress || 0) * 0.5) / totalTasks * 100) 
//     : 0;

//   useEffect(() => {
//     fetchTasks();
//   }, [currentPage, perPage, statusFilter, searchTerm]);

//   useEffect(() => {
//     if (error) {
//       showToast(error, "error");
//       dispatch(clearError());
//     }
//   }, [error, dispatch]);

//   const fetchTasks = () => {
//     const params = {
//       page: currentPage,
//       per_page: perPage,
//       status: statusFilter !== "all" ? statusFilter : undefined,
//       search: searchTerm || undefined,
//     };
//     dispatch(fetchMyTasks(params));
//   };

//   const handleStatusChange = async (taskId, newStatus) => {
//     setUpdatingStatus(taskId);
//     const result = await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
//     if (updateTaskStatus.fulfilled.match(result)) {
//       showToast(`Task marked as ${newStatus.replace("_", " ")}`, "success");
//       fetchTasks();
//     } else {
//       showToast(result.payload || "Failed to update status", "error");
//     }
//     setUpdatingStatus(null);
//   };

//   const handleViewTask = async (taskId) => {
//     const result = await dispatch(getTaskDetails(taskId));
//     if (getTaskDetails.fulfilled.match(result)) {
//       const taskData = result.payload?.data || result.payload;
//       setSelectedTask(taskData);
//       setShowTaskModal(true);
//     }
//   };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       dispatch(setPagination({ currentPage: page }));
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleEntriesChange = (value) => {
//     dispatch(setPagination({ perPage: parseInt(value), currentPage: 1 }));
//   };

//   const toggleRowExpand = (taskId) => {
//     setExpandedRows((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
//   };

//   // Helper function to get client name from task (handles both direct and nested project object)
//   const getClientName = (task) => {
//     return task.client_name || task.project?.client_name || "-";
//   };

//   // Helper function to get website URL from task
//   const getWebsiteUrl = (task) => {
//     return task.website_url || task.project?.website_url || null;
//   };

//   // Helper function to get project name
//   const getProjectName = (task) => {
//     return task.project?.name || "-";
//   };

//   const getStatusBadge = (status) => {
//     const config = {
//       pending: { icon: <FiClock />, text: "Pending", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
//       in_progress: { icon: <FiFlag />, text: "In Progress", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
//       completed: { icon: <FiCheckCircle />, text: "Completed", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
//       overdue: { icon: <FiAlertCircle />, text: "Overdue", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
//     };
//     const s = config[status] || config.pending;
//     return (
//       <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.class}`}>
//         {s.icon} {s.text}
//       </span>
//     );
//   };

//   const getPriorityBadge = (priority) => {
//     const config = {
//       high: { text: "High", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
//       medium: { text: "Medium", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
//       low: { text: "Low", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
//     };
//     const p = config[priority] || config.medium;
//     return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.class}`}>{p.text}</span>;
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

//   const formatDateTime = (dateString) => {
//     if (!dateString) return "-";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleString("en-US", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });
//     } catch {
//       return "-";
//     }
//   };

//   const start = (currentPage - 1) * perPage;

//   return (
//     <div className="task-reports-container">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6">
//         <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--text)] to-green-600 bg-clip-text text-transparent">
//           My Tasks
//         </h2>
//       </div>

//       {/* Stats Cards + Performance Overview - Side by Side */}
//       <div className="flex flex-col lg:flex-row gap-5 mb-6">
//         {/* Left: Stats Cards - 2x2 Grid */}
//         <div className="lg:w-1/2">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
//             <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
//                   <FiBriefcase className="text-purple-600 dark:text-purple-400 text-lg" />
//                 </div>
//                 <span className="text-xs text-[var(--muted)] font-medium">All Tasks</span>
//               </div>
//               <div className="text-2xl font-bold text-[var(--text)] mb-1">{stats?.total || 0}</div>
//               <div className="text-xs text-[var(--muted)]">
//                 Total assigned tasks
//               </div>
//             </div>

//             <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
//                   <FiClock className="text-amber-600 dark:text-amber-400 text-lg" />
//                 </div>
//                 <span className="text-xs text-[var(--muted)] font-medium">Pending</span>
//               </div>
//               <div className="text-2xl font-bold text-[var(--text)] mb-1">{stats?.pending || 0}</div>
//               <div className="text-xs text-[var(--muted)]">
//                 Tasks awaiting action
//               </div>
//             </div>

//             <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                   <FiCheckCircle className="text-green-600 dark:text-green-400 text-lg" />
//                 </div>
//                 <span className="text-xs text-[var(--muted)] font-medium">Completed</span>
//               </div>
//               <div className="text-2xl font-bold text-[var(--text)] mb-1">{stats?.completed || 0}</div>
//               <div className="text-xs text-[var(--muted)]">
//                 Successfully finished
//               </div>
//             </div>

//             <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] transition-all hover:-translate-y-0.5 hover:shadow-md">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
//                   <FiAlertCircle className="text-red-600 dark:text-red-400 text-lg" />
//                 </div>
//                 <span className="text-xs text-[var(--muted)] font-medium">Overdue</span>
//               </div>
//               <div className="text-2xl font-bold text-[var(--text)] mb-1">{stats?.overdue || 0}</div>
//               <div className="text-xs text-[var(--muted)]">
//                 Past due date
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right: Performance Overview Card */}
//         <div className="lg:w-1/2 bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft">
//           <div className="flex items-center gap-2 mb-4">
//             <FiTrendingUp className="text-[#10B981] text-base" />
//             <h3 className="font-bold text-[var(--text)] text-base">My Performance Overview</h3>
//           </div>
          
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
//             <div className="relative w-32 h-32 flex items-center justify-center">
//               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
//                 <path
//                   className="text-gray-100 dark:text-gray-700"
//                   strokeWidth="4"
//                   stroke="currentColor"
//                   fill="none"
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                 />
//                 <path
//                   className="text-green-500"
//                   strokeDasharray={`${completionRate}, 100`}
//                   strokeWidth="4"
//                   stroke="currentColor"
//                   fill="none"
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                 />
//                 <path
//                   className="text-blue-500"
//                   strokeDasharray={`${productivityScore}, 100`}
//                   strokeDashoffset={-completionRate}
//                   strokeWidth="4"
//                   stroke="currentColor"
//                   fill="none"
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                 />
//               </svg>
//               <div className="absolute flex flex-col items-center justify-center">
//                 <span className="text-[var(--muted)] text-[9px] uppercase font-bold tracking-wider">
//                   TOTAL
//                 </span>
//                 <span className="text-2xl font-extrabold text-[#10B981]">
//                   {totalTasks}
//                 </span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-2.5">
//               <div className="flex items-center gap-3">
//                 <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
//                 <span className="text-sm text-[var(--text-secondary)] w-28">Completed</span>
//                 <span className="font-bold text-[var(--text)] text-base">{stats?.completed || 0}</span>
//                 <span className="text-xs text-[var(--muted)]">({completionRate}%)</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
//                 <span className="text-sm text-[var(--text-secondary)] w-28">In Progress</span>
//                 <span className="font-bold text-[var(--text)] text-base">{stats?.in_progress || 0}</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
//                 <span className="text-sm text-[var(--text-secondary)] w-28">Pending</span>
//                 <span className="font-bold text-[var(--text)] text-base">{stats?.pending || 0}</span>
//               </div>
//               <div className="flex items-center gap-3 mt-1 pt-1 border-t border-[var(--border)]">
//                 <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
//                 <span className="text-sm text-[var(--text-secondary)] w-28">Productivity</span>
//                 <span className="font-bold text-base text-green-600">{productivityScore}%</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action Bar */}
//       <div className="files-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
//         <div className="entries-select flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 text-sm text-[var(--text-secondary)]">
//           <span>Show entries</span>
//           <select
//             value={perPage}
//             onChange={(e) => handleEntriesChange(e.target.value)}
//             className="border-none outline-none bg-transparent font-semibold text-[var(--text)] cursor-pointer text-sm"
//           >
//             <option value="5">5</option>
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//           </select>
//         </div>
//         <div className="search-wrapper flex items-center gap-3 flex-wrap">
//           <div className="search-box flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-2">
//             <FiSearch className="text-[var(--muted)] text-sm" />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search tasks by name, project, client..."
//               className="border-none outline-none bg-transparent text-sm text-[var(--text)] w-48 sm:w-64"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Status Tabs */}
//       <div className="flex flex-wrap gap-2 mb-6 pb-3 border-b border-[var(--border)]">
//         {["all", "pending", "in_progress", "completed", "overdue"].map((status) => (
//           <button
//             key={status}
//             onClick={() => setStatusFilter(status)}
//             className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
//               statusFilter === status
//                 ? "bg-green-500 text-white shadow-md"
//                 : "bg-[var(--surface2)] text-[var(--text-secondary)] hover:bg-green-100 hover:text-green-600"
//             }`}
//           >
//             {status === "all" ? "All Tasks" : status === "in_progress" ? "In Progress" : status}
//           </button>
//         ))}
//       </div>

//       {/* Tasks Table */}
//       {loading && tasks.length === 0 ? (
//         <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
//           <p className="mt-4 text-[var(--muted)]">Loading tasks...</p>
//         </div>
//       ) : tasks.length === 0 ? (
//         <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
//           <FiCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
//           <p className="text-[var(--text)] font-medium">No tasks found</p>
//           <p className="text-sm text-[var(--muted)] mt-1">
//             {searchTerm || statusFilter !== "all" ? "Try changing your filters" : "When tasks are assigned, they'll appear here"}
//           </p>
//         </div>
//       ) : (
//         <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
//           <table className="w-full border-collapse text-sm min-w-[1000px]">
//             <thead>
//               <tr className="bg-[var(--surface2)] border-b border-[var(--border)]">
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)] w-10">#</th>
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Task Name</th>
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Project / Client</th>
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Assigned Date</th>
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Due Date</th>
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Priority</th>
//                 <th className="text-left py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Status</th>
//                 <th className="text-center py-3.5 px-4 text-sm font-semibold text-[var(--muted)]">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tasks.map((task, idx) => {
//                 const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
//                 return (
//                   <React.Fragment key={task.id}>
//                     <tr className="hover:bg-[var(--surface2)] transition-colors border-b border-[var(--border)]">
//                       <td className="py-3.5 px-4 text-[var(--text-secondary)] text-sm">{start + idx + 1}</td>
//                       <td className="py-3.5 px-4">
//                         <div>
//                           <p className="font-semibold text-[var(--text)]">{task.name}</p>
//                           {task.description && (
//                             <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">{task.description}</p>
//                           )}
//                         </div>
//                        </td>
//                       <td className="py-3.5 px-4">
//                         <div>
//                           <p className="text-sm font-medium text-[var(--text)]">{getProjectName(task)}</p>
//                           <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
//                             <FiUser className="text-xs" /> {getClientName(task)}
//                           </p>
//                           {getWebsiteUrl(task) && (
//                             <a href={getWebsiteUrl(task)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
//                               <FiGlobe className="text-xs" /> {getWebsiteUrl(task)}
//                             </a>
//                           )}
//                         </div>
//                        </td>
//                       <td className="py-3.5 px-4 text-sm whitespace-nowrap">{formatDate(task.assigned_date)}</td>
//                       <td className="py-3.5 px-4">
//                         <span className={`whitespace-nowrap text-sm ${isOverdue ? "text-red-500 font-semibold" : "text-[var(--text-secondary)]"}`}>
//                           {formatDate(task.due_date)}
//                         </span>
//                        </td>
//                       <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>
//                       <td className="py-3.5 px-4">
//                         <select
//                           value={task.status}
//                           onChange={(e) => handleStatusChange(task.id, e.target.value)}
//                           disabled={updatingStatus === task.id}
//                           className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 focus:outline-none focus:border-green-500"
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="in_progress">In Progress</option>
//                           <option value="completed">Completed</option>
//                         </select>
//                        </td>
//                       <td className="py-3.5 px-4 text-center">
//                         <button
//                           onClick={() => handleViewTask(task.id)}
//                           className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
//                           title="View Details"
//                         >
//                           <FiMessageSquare className="text-sm" />
//                         </button>
//                        </td>
//                      </tr>
//                   </React.Fragment>
//                 );
//               })}
//             </tbody>
//            </table>
//         </div>
//       )}

//       {/* Pagination */}
//       {totalItems > 0 && totalPages > 1 && (
//         <div className="pagination-container flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
//           <div className="text-sm text-[var(--muted)]">
//             Showing {start + 1} to {Math.min(start + perPage, totalItems)} of {totalItems} entries
//           </div>
//           <div className="page-buttons flex gap-1.5 flex-wrap">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
//             >
//               <FiChevronLeft className="mx-auto" />
//             </button>
//             {[...Array(Math.min(totalPages, 10))].map((_, i) => {
//               const pageNum = i + 1;
//               return (
//                 <button
//                   key={i}
//                   onClick={() => handlePageChange(pageNum)}
//                   className={`w-9 h-9 rounded-lg border text-sm transition-all ${
//                     currentPage === pageNum
//                       ? "bg-green-500 border-green-500 text-white"
//                       : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"
//                   }`}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}
//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
//             >
//               <FiChevronRight className="mx-auto" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Task Details Modal */}
//       {showTaskModal && selectedTask && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
//           <div className="bg-[var(--surface)] rounded-2xl max-w-2xl w-full shadow-soft-lg border border-[var(--border)] flex flex-col max-h-[90vh]">
//             <div className="px-6 py-4 flex justify-between items-center border-b border-[var(--border)] bg-[var(--surface)] rounded-t-2xl">
//               <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2.5">
//                 <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shadow-sm">
//                   <FiBriefcase />
//                 </span>
//                 Task Details
//               </h3>
//               <button onClick={() => setShowTaskModal(false)} className="text-[var(--muted)] hover:text-red-500 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface2)]">
//                 &times;
//               </button>
//             </div>
//             <div className="p-6 overflow-y-auto space-y-5">
//               <div>
//                 <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">TASK NAME</label>
//                 <p className="text-lg font-bold text-[var(--text)]">{selectedTask.name}</p>
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">PROJECT</label>
//                   <span className="text-sm font-bold text-[var(--text)]">{getProjectName(selectedTask)}</span>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">CLIENT</label>
//                   <span className="text-sm font-bold text-[var(--text)]">{getClientName(selectedTask)}</span>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">ASSIGNED BY</label>
//                   <span className="text-sm font-bold text-[var(--text)]">{selectedTask.assigned_by?.name || "Admin"}</span>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">ASSIGNED DATE</label>
//                   <span className="text-sm font-bold text-[var(--text)]">{formatDate(selectedTask.assigned_date)}</span>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">DUE DATE</label>
//                   <span className={`text-sm font-bold ${selectedTask.due_date && new Date(selectedTask.due_date) < new Date() && selectedTask.status !== "completed" ? "text-red-500" : "text-[var(--text)]"}`}>
//                     {formatDate(selectedTask.due_date)}
//                   </span>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">PRIORITY</label>
//                   <div>{getPriorityBadge(selectedTask.priority)}</div>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">STATUS</label>
//                   <div>{getStatusBadge(selectedTask.status)}</div>
//                 </div>
//               </div>
              
//               {selectedTask.description && (
//                 <div>
//                   <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">DESCRIPTION</label>
//                   <div className="px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl">
//                     <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{selectedTask.description}</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="px-6 py-4 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-2xl">
//               <button
//                 onClick={() => setShowTaskModal(false)}
//                 className="px-5 py-2 rounded-full font-semibold bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)] transition-colors text-sm shadow-sm"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeTasks;