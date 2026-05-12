const EmployeesTable = ({
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
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Designation</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Department</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Company</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
        </tr>
      </thead>

      <tbody>
        {pageDocs.map((emp, idx) => (
          <tr key={emp.id} className="border-b">
            <td className="px-4 py-3 text-xs">{start + idx + 1}</td>

            <td className="px-4 py-3 font-semibold text-xs">
              {emp.first_name} {emp.last_name || ""}
            </td>

            <td className="px-4 py-3 text-xs">{emp.user?.designation?.name || "-"}</td>
            <td className="px-4 py-3 text-xs">{emp.user?.department?.name || "-"}</td>
            <td className="px-4 py-3 text-xs">{emp.user?.company?.company_name || "-"}</td>

            <td className="px-4 py-3">
              <div className="flex gap-3">
                <button onClick={() => handleView(emp)}>
                  <i className="fas fa-eye text-blue-500 text-xs"></i>
                </button>
                <button onClick={() => handleEdit(emp)}>
                  <i className="fas fa-edit text-amber-500 text-xs"></i>
                </button>
                <button onClick={() => handleDeleteClick(emp)}>
                  <i className="fas fa-trash text-red-500 text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
        ))}

        {pageDocs.length === 0 && (
          <tr>
            <td colSpan="6" className="text-center py-6 text-gray-400">
              No employees found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default EmployeesTable;
