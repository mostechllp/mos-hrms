import { useAppTheme } from "../../../context/ThemeContext";

const FoldersTable = ({
  pageDocs,
  start,
  handleView,
  handleEdit,
  handleDeleteClick
}) => {
  const { primaryColor } = useAppTheme();

  return (
    <table className="w-full border-collapse min-w-[800px]">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Sl.No.</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Folder Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
        </tr>
      </thead>

      <tbody>
        {pageDocs.map((folder, idx) => (
          <tr key={folder.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{start + idx + 1}</td>
            <td className="px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <span className="flex items-center gap-1 text-xs">
                <i className="fas fa-folder-open" style={{ color: primaryColor }}></i>
                {folder.name}
              </span>
            </td>

            <td className="px-4 py-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleView(folder)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="View"
                >
                  <i className="fas fa-eye text-blue-500 text-xs"></i>
                </button>
                <button 
                  onClick={() => handleEdit(folder)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit"
                >
                  <i className="fas fa-edit text-amber-500 text-xs"></i>
                </button>
                <button 
                  onClick={() => handleDeleteClick(folder)}
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
            <td colSpan="3" className="text-center py-6 text-gray-400 dark:text-gray-500">
              No folders found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default FoldersTable;