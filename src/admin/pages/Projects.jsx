// import React from 'react'
// import UnderDevelopment from '../../components/common/UnderDevelopment';

// const Projects = () => {
//   return (
//     <UnderDevelopment pageName='Porjects' />
//   )
// }

// export default Projects

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../components/common/SearchBar";
import EntriesSelector from "../components/common/EntriesSelector";
import Pagination from "../components/common/Paginations";
import ProjectModal from "../components/projects/ProjectModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { showToast } from "../../components/common/Toast";
import {
  fetchProjects,
  deleteProject,
  updateProjectStatus,
  clearError,
  setPagination,
} from "../store/slices/projectsSlice";

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading, error, totalCount, currentPage, lastPage, perPage, stats } =
    useSelector((state) => state.projects || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPageState, setCurrentPageState] = useState(1);
  const [perPageState, setPerPageState] = useState(15);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

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

  const handleStatusChange = async (projectId, newStatus) => {
    const result = await dispatch(updateProjectStatus({ id: projectId, status: newStatus }));
    if (updateProjectStatus.fulfilled.match(result)) {
      showToast(`Project marked as ${newStatus}`, "success");
      handleRefresh();
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      completed: { label: "Completed", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      on_hold: { label: "On Hold", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    };
    const s = statusMap[status] || statusMap.active;
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.class}`}>{s.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const start = (currentPageState - 1) * perPageState;
  const totalPages = lastPage || Math.ceil((searchTerm || statusFilter !== "all" ? projects.length : totalCount) / perPageState);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-project-diagram text-purple-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-purple-600">{stats?.total || totalCount}</div>
          <div className="text-[10px] md:text-xs text-gray-500">Total Projects</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-check-circle text-green-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.active || 0}</div>
          <div className="text-[10px] md:text-xs text-gray-500">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-check-double text-blue-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600">{stats?.completed || 0}</div>
          <div className="text-[10px] md:text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-1">
            <i className="fas fa-pause-circle text-yellow-600"></i>
          </div>
          <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats?.onHold || 0}</div>
          <div className="text-[10px] md:text-xs text-gray-500">On Hold</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
          <i className="fas fa-project-diagram text-green-500"></i>
          Projects
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPageState(1); }}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-full text-xs md:text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <div className="flex-1"></div>
        <button onClick={handleRefresh} disabled={refreshLoading} className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-full text-sm flex items-center gap-2">
          <i className={`fas fa-sync-alt ${refreshLoading ? "fa-spin" : ""}`}></i> Refresh
        </button>
        <button onClick={handleAddProject} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          <i className="fas fa-plus-circle"></i> New Project
        </button>
      </div>

      <div className="mb-5">
        <SearchBar value={searchTerm} onChange={(value) => { setSearchTerm(value); setCurrentPageState(1); }} placeholder="Search projects..." />
      </div>

      {loading && projects.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i>
          <p>Loading projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{project.name}</h3>
                {getStatusBadge(project.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.client_name}</p>
              {project.website_url && (
                <a href={project.website_url} target="_blank" className="text-xs text-blue-500 hover:underline block mb-2">{project.website_url}</a>
              )}
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {formatDate(project.start_date)} - {formatDate(project.end_date) || "Ongoing"}
                </div>
                <div className="flex gap-2">
                  <Link to={`/admin/projects/${project.id}/tasks`} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg" title="View Tasks">
                    <i className="fas fa-tasks"></i>
                  </Link>
                  <button onClick={() => handleEdit(project)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(project)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <Pagination currentPage={currentPageState} totalPages={totalPages} onPageChange={(page) => setCurrentPageState(page)} totalItems={totalCount} itemsPerPage={perPageState} />
      )}

      <ProjectModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} project={selectedProject} onSuccess={handleRefresh} />
      <ConfirmModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={confirmDeleteProject} title="Delete Project" message={`Delete "${confirmDelete?.name}"?`} confirmText="Delete" loading={actionLoading} />
    </div>
  );
};

export default Projects;