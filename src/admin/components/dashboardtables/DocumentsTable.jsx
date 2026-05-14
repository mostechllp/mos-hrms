import { useAppTheme } from "../../../context/ThemeContext";

const DocumentsTable = ({
  pageDocs,
  start,
  handleView,
  handleEdit,
  handleDeleteClick,
  formatDate,
  getExpiryClass
}) => {
  const { primaryColor } = useAppTheme();

  return (
    <table className="w-full border-collapse min-w-[600px]">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Sl.No.</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Document Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Folder</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Expiry</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
        </tr>
      </thead>

      <tbody>
        {pageDocs.map((doc, idx) => (
          <tr key={doc.id || idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{start + idx + 1}</td>

            <td className="px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200">
              {doc.name || doc.username || doc.email || "---"}
            </td>

            <td className="px-4 py-3">
              {doc.folder?.name ? (
                <span className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                  <i className="fas fa-folder-open" style={{ color: primaryColor }}></i>
                  {doc.folder.name}
                </span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500 text-xs flex gap-1">
                  <i className="fas fa-folder"></i>
                  No Folder
                </span>
              )}
            </td>

            <td className={`${getExpiryClass(doc.expiry_date)} px-4 py-3 text-xs`}>
              {doc.expiry_date ? formatDate(doc.expiry_date) : "---"}
            </td>

            <td className="px-4 py-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleView(doc)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="View"
                >
                  <i className="fas fa-eye text-blue-500 text-xs"></i>
                </button>
                <button 
                  onClick={() => handleEdit(doc)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit"
                >
                  <i className="fas fa-edit text-amber-500 text-xs"></i>
                </button>
                <button 
                  onClick={() => handleDeleteClick(doc)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Delete"
                >
                  <i className="fas fa-trash text-red-500 text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}

        {pageDocs.length === 0 && (
          <tr>
            <td colSpan="5" className="text-center py-6 text-gray-400 dark:text-gray-500">
              No records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DocumentsTable;