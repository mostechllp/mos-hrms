const DocumentsTable = ({
  pageDocs,
  start,
  handleView,
  handleEdit,
  handleDeleteClick,
  formatDate,
  getExpiryClass
}) => {
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
          <tr key={doc.id || idx} className="border-b">
            <td className="px-4 py-3 text-xs">{start + idx + 1}</td>

            <td className="px-4 py-3 text-xs font-semibold">
              {doc.name || doc.username || doc.email || "---"}
            </td>

            <td className="px-4 py-3">
              {doc.folder?.name ? (
                <span className="flex items-center gap-1 text-xs">
                  <i className="fas fa-folder-open text-primary"></i>
                  {doc.folder.name}
                </span>
              ) : (
                <span className="text-gray-400 text-xs flex gap-1">
                  <i className="fas fa-folder"></i>
                  No Folder
                </span>
              )}
            </td>

            <td className={getExpiryClass(doc.expiry_date) + " px-4 py-3 text-xs"}>
              {doc.expiry_date ? formatDate(doc.expiry_date) : "---"}
            </td>

            <td className="px-4 py-3">
              <div className="flex gap-3">
                <button onClick={() => handleView(doc)}>
                  <i className="fas fa-eye text-blue-500 text-xs"></i>
                </button>
                <button onClick={() => handleEdit(doc)}>
                  <i className="fas fa-edit text-amber-500 text-xs"></i>
                </button>
                <button onClick={() => handleDeleteClick(doc)}>
                  <i className="fas fa-trash text-red-500 text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}

        {pageDocs.length === 0 && (
          <tr>
            <td colSpan="5" className="text-center py-6 text-gray-400">
              No records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DocumentsTable;
