const FoldersTable = ({
  pageDocs,
  start,
  handleView,
  handleEdit,
  handleDeleteClick
}) => {
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
          <tr key={folder.id} className="border-b">
            <td className="px-4 py-3 text-xs">{start + idx + 1}</td>
            <td className="px-4 py-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-xs">
                  <i className="fas fa-folder-open text-primary"></i>
                  {folder.name}
              </span>
            </td>

            <td className="px-4 py-3">
              <div className="flex gap-3">
                <button onClick={() => handleView(folder)}>
                  <i className="fas fa-eye text-blue-500 text-xs"></i>
                </button>
                <button onClick={() => handleEdit(folder)}>
                  <i className="fas fa-edit text-amber-500 text-xs"></i>
                </button>
                <button onClick={() => handleDeleteClick(folder)}>
                  <i className="fas fa-trash text-red-500 text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}

        {pageDocs.length === 0 && (
          <tr>
            <td colSpan="3" className="text-center py-6 text-gray-400">
              No folders found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default FoldersTable;
