import { useAppTheme } from "../../../context/ThemeContext";

const EmployeesTable = ({
  pageDocs,
  start,
  handleView,
  handleEdit,
  handleDeleteClick
}) => {
  // eslint-disable-next-line no-unused-vars
  const { primaryColor } = useAppTheme();

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
          <tr key={emp.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{start + idx + 1}</td>

            <td className="px-4 py-3 font-semibold text-xs text-gray-800 dark:text-gray-200">
              {emp.first_name} {emp.last_name || ""}
            </td>

            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
              {emp.user?.designation?.name || "-"}
            </td>
            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
              {emp.user?.department?.name || "-"}
            </td>
            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
              {emp.user?.company?.company_name || "-"}
            </td>

            <td className="px-4 py-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleView(emp)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="View"
                >
                  <i className="fas fa-eye text-blue-500 text-xs"></i>
                </button>
                <button 
                  onClick={() => handleEdit(emp)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit"
                >
                  <i className="fas fa-edit text-amber-500 text-xs"></i>
                </button>
                <button 
                  onClick={() => handleDeleteClick(emp)}
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
            <td colSpan="6" className="text-center py-6 text-gray-400 dark:text-gray-500">
              No employees found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default EmployeesTable;