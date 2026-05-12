import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import SearchBar from "../components/common/SearchBar";
import EntriesSelector from "../components/common/EntriesSelector";
import Pagination from "../components/common/Paginations";
import { showToast } from "../components/common/Toast";
import {
  fetchDesignations,
  deleteDesignation,
} from "../store/slices/designationSlice";
import DesignationModal from "../components/designations/designationModal";
import ConfirmModal from "../components/common/ConfirmModal";

const Designations = () => {
  const dispatch = useDispatch();
  const { designations = [] } = useSelector(
    (state) => state.designations || {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    dispatch(fetchDesignations());
  }, [dispatch]);

  const getFilteredDesignations = () => {
    let filtered = designations;
    if (searchTerm) {
      filtered = filtered.filter((des) =>
        des.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return filtered;
  };

  const filteredDesignations = getFilteredDesignations();
  const totalFiltered = filteredDesignations.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageDesignations = filteredDesignations.slice(start, start + perPage);

  const handleDeleteClick = (designation) => {
    setSelectedDesignation(designation);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!selectedDesignation) return;

    setDeleteLoading(true);

    const result = await dispatch(deleteDesignation(selectedDesignation.id));

    if (deleteDesignation.fulfilled.match(result)) {
      showToast(`${selectedDesignation.name} deleted successfully`, "success");
      setConfirmOpen(false);
      setSelectedDesignation(null);
    } else {
      showToast("Failed to delete designation", "error");
    }

    setDeleteLoading(false);
  };

  const handleEdit = (designation) => {
    setEditingDesignation(designation);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDesignation(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingDesignation(null);
  };

  return (
    <div className="app flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div
        className={`flex-1 min-w-0 w-full overflow-x-hidden ${!isMobile ? "md:ml-[72px]" : ""}`}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
          {/* Stats Cards */}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <i className="fas fa-briefcase text-green-600 dark:text-green-400 text-base md:text-xl"></i>
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-green-600 dark:text-green-400">
                {designations.length}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                Total Designations
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <i className="fas fa-fingerprint text-blue-600 dark:text-blue-400 text-base md:text-xl"></i>
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {
                  designations.filter((d) => d.defaultPunchAccess === true)
                    .length
                }
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                Default Punch Access
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
              Designations
            </h2>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
            <EntriesSelector value={perPage} onChange={setPerPage} />
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name..."
              />
              <button
                onClick={handleAdd}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <i className="fas fa-plus-circle"></i> Add Designation
              </button>
            </div>
          </div>

          {/* Designations Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[600px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Sl.No.
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Default Punch Access
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageDesignations.map((des, idx) => (
                    <tr
                      key={des.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {start + idx + 1}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {des.name}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        {des.defaultPunchAccess ? (
                          <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <i className="fas fa-check-circle text-[10px] md:text-xs"></i>
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            <i className="fas fa-times-circle text-[10px] md:text-xs"></i>
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleEdit(des)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-500 transition-colors"
                            title="Edit"
                          >
                            <i className="fas fa-edit text-xs md:text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(des)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <i className="fas fa-trash text-xs md:text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageDesignations.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No designations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalFiltered}
            itemsPerPage={perPage}
          />
        </main>
      </div>

      {/* Add/Edit Designation Modal */}
      <DesignationModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingDesignation={editingDesignation}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Designation"
        message={`Are you sure you want to delete "${selectedDesignation?.name}"?`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Designations;
