import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../components/common/SearchBar";
import EntriesSelector from "../components/common/EntriesSelector";
import Pagination from "../components/common/Paginations";
import ProjectModal from "../components/projects/ProjectModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { showToast } from "../../components/common/Toast";
import { FolderKanban } from "lucide-react";
import StatusDropdown from "../components/common/StatusDropdown";
import {
  fetchProjects,
  fetchProjectStatuses,
  deleteProject,
  updateProjectStatus,
  clearError,
  setPagination,
} from "../store/slices/projectsSlice";

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, statuses, loading, error, totalCount, currentPage, lastPage, perPage, stats } =
    useSelector((state) => state.projects || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [perPageState, setPerPageState] = useState(15);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectStatuses());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: currentPageState,
      per_page: perPageState,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    };
    dispatch(fetchProjects(params));
  }, [dispatch, currentPageState, perPageState, searchTerm, statusFilter]);

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
    };
    await dispatch(fetchProjects(params));
    setRefreshLoading(false);
    showToast("Projects refreshed!", "success");
  };

  const handleDelete = (project) => {
    setConfirmDelete(project);
  };

  const confirmDeleteProject = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    const result = await dispatch(deleteProject(confirmDelete.id));
    if (deleteProject.fulfilled.match(result)) {
      showToast("Project deleted successfully!", "success");
      setConfirmDelete(null);
      handleRefresh();
    } else {
      showToast(result.payload || "Failed to delete project", "error");
    }
    setActionLoading(false);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  // Helper function to check if project is overdue
  const isProjectOverdue = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  };

  // Helper function to get days remaining or overdue
  const getProjectDateStatus = (endDate) => {
    if (!endDate) return { status: 'no_date', label: 'No end date', className: 'text-gray-400' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return { 
        status: 'overdue', 
        label: `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`, 
        className: 'text-red-600 dark:text-red-400 font-semibold'
      };
    } else if (diffDays === 0) {
      return { 
        status: 'due_today', 
        label: 'Due today', 
        className: 'text-orange-600 dark:text-orange-400 font-semibold'
      };
    } else if (diffDays <= 7) {
      return { 
        status: 'ending_soon', 
        label: `${diffDays} day${diffDays > 1 ? 's' : ''} left`, 
        className: 'text-yellow-600 dark:text-yellow-400'
      };
    } else {
      return { 
        status: 'ok', 
        label: `${diffDays} days left`, 
        className: 'text-gray-500 dark:text-gray-400'
      };
    }
  };

  // Check if project should show as overdue (end date passed AND not completed)
  const shouldShowOverdue = (project) => {
    return isProjectOverdue(project.end_date) && project.status !== 'Completed';
  };

  const getStatusBadge = (status, endDate) => {
    const statusMap = {
      active: { label: "Active", class: "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400" },
      completed: { label: "Completed", class: "bg-[#f0f4ff] text-[#3b82f6] dark:bg-blue-900/30 dark:text-blue-400" },
      on_hold: { label: "On Hold", class: "bg-[#fff8e6] text-[#f59e0b] dark:bg-amber-900/30 dark:text-amber-400" },
      in_progress: { label: "In Progress", class: "bg-[#f0f4ff] text-[#3b82f6] dark:bg-blue-900/30 dark:text-blue-400" },
      not_started: { label: "Not Started", class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    };
    const normalized = String(status || "").toLowerCase().replace("-", "_").replace(" ", "_");
    const s = statusMap[normalized] || { label: status || "Active", class: "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400" };
    
    // Check if overdue (only for non-completed projects)
    const isOverdue = shouldShowOverdue({ status, end_date: endDate });
    
    return (
      <div className="flex flex-col gap-1 items-end">
        <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${s.class}`}>
          {s.label}
        </span>
        {isOverdue && (
          <span className="px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
            Overdue
          </span>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const start = (currentPageState - 1) * perPageState;
  const totalPages = lastPage || Math.ceil((searchTerm || statusFilter !== "all" ? projects.length : totalCount) / perPageState);

  // Calculate overdue count (only non-completed projects with passed end date)
  const overdueCount = projects?.filter(p => shouldShowOverdue(p)).length || 0;

  return (
    <div className="w-full overflow-x-hidden space-y-5 pb-8">

      {/* Stat Cards Row */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">

        {/* Total Projects Card */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f4f0fd] dark:bg-purple-900/30 text-[#7c5cfc] dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <FolderKanban className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{stats?.total || totalCount}</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Total Projects</div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#7c5cfc] rounded-r-full"></div>
        </div>

        {/* Active Projects Card */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#eafaf1] dark:bg-green-900/30 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0 text-sm md:text-lg">
            <i className="far fa-play-circle"></i>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{stats?.active || 0}</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Active</div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#10b981] rounded-r-full"></div>
        </div>

        {/* Completed Projects Card */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f0f4ff] dark:bg-blue-900/30 text-[#3b82f6] dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-sm md:text-lg">
            <i className="far fa-check-circle"></i>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{stats?.completed || 0}</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Completed</div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#3b82f6] rounded-r-full"></div>
        </div>

        {/* Overdue Projects Card */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#fee2e2] dark:bg-red-900/30 text-[#ef4444] dark:text-red-400 flex items-center justify-center flex-shrink-0 text-sm md:text-lg">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {overdueCount}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Overdue</div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#ef4444] rounded-r-full"></div>
        </div>

      </div>

      {/* Page Heading & View Switcher */}
      <div className="flex justify-between items-center my-2">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
          <FolderKanban className="text-[#10b981] w-5 h-5 md:w-6 md:h-6" />
          Projects
        </h2>

        {/* View Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Grid View"
          >
            <i className="fas fa-th-large"></i> Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="List View"
          >
            <i className="fas fa-list"></i> List
          </button>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center mb-5">

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-60 flex-shrink-0 z-50">
            <StatusDropdown
              name="status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPageState(1); }}
              statuses={statuses}
              includeAll={true}
            />
          </div>

          <div className="w-full sm:w-72">
            <SearchBar
              value={searchTerm}
              onChange={(value) => { setSearchTerm(value); setCurrentPageState(1); }}
              placeholder="Search projects..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshLoading}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg w-full sm:w-auto"
            title="Refresh"
          >
            <i className={`fas fa-sync-alt ${refreshLoading ? "fa-spin text-green-500" : ""}`}></i> Refresh
          </button>

          <button
            onClick={handleAddProject}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <i className="fas fa-plus-circle"></i> New Project
          </button>
        </div>

      </div>

      {/* Projects Grid / List Area */}
      <div className="min-h-[400px]">
        {loading && projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-[#10b981] mb-3"></i>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">No projects found</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mb-4">Try clearing filters or search terms.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {projects.map((project) => {
              const dateStatus = getProjectDateStatus(project.end_date);
              const isOverdue = shouldShowOverdue(project);
              
              return (
                <div
                  key={project.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border ${
                    isOverdue 
                      ? 'border-red-400 dark:border-red-600 shadow-red-100 dark:shadow-red-900/20 bg-red-50/10 dark:bg-red-900/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  } p-4 md:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${
                          isOverdue 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                            : 'bg-[#eafaf1] dark:bg-green-900/20 text-[#10b981] dark:text-green-400'
                        } flex items-center justify-center flex-shrink-0`}>
                          <FolderKanban className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base leading-tight truncate" title={project.project_name || project.name}>
                            {project.project_name || project.name}
                          </h3>
                          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate">
                            {project.client_name || project.project_name || project.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {getStatusBadge(project.status, project.end_date)}
                      </div>
                    </div>


                    {project.website_url && (
                      <a
                        href={project.website_url.startsWith('http') ? project.website_url : `https://${project.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] md:text-xs text-blue-500 hover:underline block mb-2 truncate"
                      >
                        {project.website_url}
                      </a>
                    )}

                    {project.description && (
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {project.description || project.Project_descriptions}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700/60 mt-2">
                    <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <i className="far fa-calendar text-gray-400"></i>
                        <span>{formatDate(project.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="far fa-calendar-check text-gray-400"></i>
                        <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : dateStatus.className}>
                          {formatDate(project.end_date)}
                          {!isOverdue && dateStatus.status !== 'no_date' && dateStatus.status !== 'ok' && (
                            <span className="ml-1 text-[8px] font-bold">
                              ({dateStatus.label})
                            </span>
                          )}
                          {isOverdue && (
                            <span className="ml-1 text-[8px] font-bold text-red-600 dark:text-red-400">
                              (Overdue)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <i className="fas fa-edit text-xs md:text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                      >
                        <i className="fas fa-trash text-xs md:text-sm"></i>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* List View Table */
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-xs">
            <div className="min-w-[750px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">S.L.NO.</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">PROJECT NAME</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">CLIENT NAME</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">DATES</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">STATUS</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {projects.map((project, index) => {
                    const dateStatus = getProjectDateStatus(project.end_date);
                    const isOverdue = shouldShowOverdue(project);
                    
                    return (
                      <tr key={project.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {start + index + 1}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl ${
                              isOverdue 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                                : 'bg-[#eafaf1] dark:bg-green-900/20 text-[#10b981] dark:text-green-400'
                            } flex items-center justify-center flex-shrink-0`}>
                              <FolderKanban className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200 text-xs md:text-sm">{project.project_name || project.name}</p>
                              {isOverdue && (
                                <span className="text-[8px] md:text-[10px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                  <i className="fas fa-exclamation-circle"></i> Overdue
                                </span>
                              )}
                              {project.website_url && (
                                <a href={project.website_url.startsWith('http') ? project.website_url : `https://${project.website_url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs text-blue-500 hover:underline">
                                  {project.website_url}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {project.client_name || "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs">
                              Start: {formatDate(project.start_date)}
                            </span>
                            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : dateStatus.className}>
                              End: {formatDate(project.end_date)}
                              {isOverdue && (
                                <span className="ml-1 text-[8px] font-bold text-red-600 dark:text-red-400">
                                  (Overdue)
                                </span>
                              )}
                              {!isOverdue && dateStatus.status !== 'no_date' && dateStatus.status !== 'ok' && (
                                <span className="ml-1 text-[8px] font-bold">
                                  ({dateStatus.label})
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {getStatusBadge(project.status, project.end_date)}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(project)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                              title="Edit"
                            >
                              <i className="fas fa-edit text-xs md:text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(project)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                              title="Delete"
                            >
                              <i className="fas fa-trash text-xs md:text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <Pagination currentPage={currentPageState} totalPages={totalPages} onPageChange={(page) => setCurrentPageState(page)} totalItems={totalCount} itemsPerPage={perPageState} />
      )}

      <ProjectModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} project={selectedProject} onSuccess={handleRefresh} />
      <ConfirmModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={confirmDeleteProject} title="Delete Project" message={`Delete "${confirmDelete?.project_name || confirmDelete?.name}"?`} confirmText="Delete" loading={actionLoading} variant="danger" />
    </div>
  );
};

export default Projects;