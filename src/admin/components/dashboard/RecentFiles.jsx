import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../common/SearchBar";
import EntriesSelector from "../common/EntriesSelector";
import Pagination from "../common/Paginations";
import ConfirmModal from "../common/ConfirmModal";
import { showToast } from "../common/Toast";
import EmployeesTable from "../dashboardtables/EmployeesTable";
import DocumentsTable from "../dashboardtables/DocumentsTable";
import FoldersTable from "../dashboardtables/FoldersTable";
import AddFolderModal from "../documents/AddFolderModal";
import AddFileModal from "../documents/AddFileModal";
import { fetchDashboard } from "../../store/slices/dashboardSlice";
import { deleteDocumentFolder } from "../../store/slices/documentsSlice";

const RecentFiles = () => {
  const dispatch = useDispatch();
  const { recentData } = useSelector((state) => state.dashboard);
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  const documents = [
    ...(recentData?.organization_files || []),
    ...(recentData?.agreements || []),
    ...(recentData?.hr || []),
    ...(recentData?.others || []),
  ];

  const folders = [
    { name: "All Files", value: "all", icon: "fas fa-folder-open", route: null },
    { name: "Organization Files", value: "organizations", icon: "fas fa-building", route: "/agreements/add-agreement" },
    { name: "Agreements", value: "agreements", icon: "fas fa-file-signature", route: "/agreements/add-agreement" },
    { name: "HR", value: "hr", icon: "fas fa-user-tie", route: "/agreements/add-agreement" },
    { name: "Employees", value: "employees", icon: "fas fa-users", route: "/employees/add-employee" },
    { name: "Folders", value: "folders", icon: "fas fa-folder", route: "create-folder" },
    { name: "Others", value: "others", icon: "fas fa-ellipsis-h", route: "create-file" },
  ];

  // Refresh dashboard data
  const refreshDashboard = async () => {
    await dispatch(fetchDashboard());
  };

  const renderTable = () => {
    switch (activeFolder) {
      case "folders":
        return (
          <FoldersTable
            pageDocs={pageDocs}
            start={start}
            handleView={null} // Disable view for folders
            handleEdit={handleEditFolder}
            handleDeleteClick={handleDeleteClick}
          />
        );

      case "employees":
        return (
          <EmployeesTable
            pageDocs={pageDocs}
            start={start}
            handleView={handleView}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
          />
        );

      default:
        return (
          <DocumentsTable
            pageDocs={pageDocs}
            start={start}
            handleView={handleView}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
            formatDate={formatDate}
            getExpiryClass={getExpiryClass}
          />
        );
    }
  };

  const getFilteredDocs = () => {
    // eslint-disable-next-line no-useless-assignment
    let filtered = [];

    if (activeFolder === "all") {
      filtered = [
        ...(recentData?.organization_files || []),
        ...(recentData?.agreements || []),
        ...(recentData?.hr || []),
        ...(recentData?.others || []),
      ];
    } else if (activeFolder === "organizations") {
      filtered = recentData?.organization_files || [];
    } else if (activeFolder === "agreements") {
      filtered = recentData?.agreements || [];
    } else if (activeFolder === "hr") {
      filtered = recentData?.hr || [];
    } else if (activeFolder === "employees") {
      filtered = recentData?.employees || [];
    } else if (activeFolder === "folders") {
      filtered = recentData?.folders || [];
    } else if (activeFolder === "others") {
      filtered = recentData?.others || [];
    } else {
      filtered = documents.filter((doc) => doc.type === activeFolder);
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        (item.name || item.username || item.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredDocs = getFilteredDocs();
  const totalPages = Math.ceil(filteredDocs.length / perPage);
  const start = (currentPage - 1) * perPage;
  const pageDocs = filteredDocs.slice(start, start + perPage);

  const handleAddClick = () => {
    switch (activeFolder) {
      case "folders":
        setEditingFolder(null); // Reset editing folder for add mode
        setIsFolderModalOpen(true);
        break;
      case "others":
        setIsFileModalOpen(true);
        break;
      case "all":
        navigate("/admin/agreements/add-document");
        break;
      case "agreements":
        navigate("/admin/agreements/add-agreement");
        break;
      case "hr":
        navigate("/admin/agreements/add-document");
        break;
      case "employees":
        navigate("/admin/employees/add-employee");
        break;
      default:
        navigate("/admin/agreements/add-agreement");
    }
  };

  const handleFolderAdded = async (updatedFolder) => {
    await refreshDashboard(); // Refresh to get updated folder list
    showToast(updatedFolder ? "Folder updated successfully" : "Folder created successfully", "success");
  };

  const handleFileAdded = async () => {
    await refreshDashboard(); // Refresh to get updated file list
    showToast("File added successfully", "success");
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setIsFolderModalOpen(true);
  };

  const handleView = (doc) => {
    if (doc.file_path) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || window.location.origin;
      const fileUrl = `${baseUrl}/storage/${doc.file_path.replace(/^\/+/, '')}`;
      window.open(fileUrl, '_blank');
    } else {
      showToast("No document file available", "info");
    }
  };

  const handleEdit = (doc) => {
    if (doc.type === 'agreements') {
      navigate(`/admin/agreements/edit-agreement/${doc.id}`);
    } else if (doc.type === 'hr') {
      navigate(`/admin/agreements/edit-agreement/${doc.id}`);
    } else if (doc.type === 'employee') {
      navigate(`/admin/employees/edit/${doc.employee_id || doc.id}`);
    }
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocument(doc);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    
    try {
      // Check if it's a folder being deleted
      if (activeFolder === "folders" && selectedDocument.id) {
        // API call to delete folder
        const result = await dispatch(deleteDocumentFolder(selectedDocument.id));
        if (deleteDocumentFolder.fulfilled.match(result)) {
          showToast(`${selectedDocument.name} deleted successfully`, "success");
          await refreshDashboard(); // Refresh data after deletion
          setConfirmOpen(false);
          setSelectedDocument(null);
        } else {
          showToast(result.payload || "Failed to delete folder", "error");
        }
      } else {
        // For documents/employees deletion
        // TODO: Add specific API call for documents
        showToast(`${selectedDocument.name} deleted successfully`, "success");
        await refreshDashboard(); // Refresh data after deletion
        setConfirmOpen(false);
        setSelectedDocument(null);
      }
    } catch (error) {
      showToast("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Expiry';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getExpiryClass = (expiryDate) => {
    if (!expiryDate) return '';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'text-red-500 font-semibold';
    if (diffDays <= 30) return 'text-amber-500 font-semibold';
    return '';
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
            <i className="fas fa-folder-open mr-2 text-green-500"></i>
            {folders.find((f) => f.value === activeFolder)?.name || "All Files"}
          </h3>

          <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
            {folders.map((folder) => (
              <button
                key={folder.value}
                onClick={() => {
                  setActiveFolder(folder.value);
                  setCurrentPage(1); // Reset to first page when changing folders
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFolder === folder.value
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                  }`}
              >
                <i className={`${folder.icon} mr-1 text-xs`}></i>
                {folder.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <EntriesSelector value={perPage} onChange={setPerPage} />
            <div className="flex gap-3">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search records..."
              />
              <button
                onClick={handleAddClick}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <i className="fas fa-plus"></i>
                {activeFolder === "agreements"
                  ? "Add Agreement"
                  : activeFolder === "hr"
                    ? "Add HR Document"
                    : activeFolder === "employees"
                      ? "Add Employee"
                      : activeFolder === "folders"
                        ? "Create Folder"
                        : activeFolder === "others"
                          ? "Add Other File"
                          : "Add Document"}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {renderTable()}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredDocs.length}
            itemsPerPage={perPage}
          />
        </div>

        <ConfirmModal
          isOpen={confirmOpen}
          onClose={() => {
            if (!isDeleting) {
              setConfirmOpen(false);
              setSelectedDocument(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          title={`Delete ${activeFolder === "folders" ? "Folder" : "Document"}`}
          message={`Are you sure you want to delete "${selectedDocument?.name}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          confirmDisabled={isDeleting}
        />
      </div>

      {/* Add/Edit Folder Modal */}
      <AddFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
        }}
        onFolderAdded={handleFolderAdded}
        editingFolder={editingFolder}
      />

      {/* Add File Modal */}
      <AddFileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFileAdded={handleFileAdded}
      />
    </>
  );
};

export default RecentFiles;