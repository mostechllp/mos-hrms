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

  // Helper function to get photo URL
  const getEmployeePhoto = (emp) => {
    // Check multiple possible photo fields
    const photoValue =
      emp.avatar ||
      emp.avatar_path ||
      emp.passport_size_photo ||
      emp.profile_photo ||
      emp.photo ||
      emp.user?.avatar;

    if (!photoValue) return null;

    // Handle object type avatar
    if (typeof photoValue === "object" && photoValue.path) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
      return `${baseUrl}/storage/${photoValue.path}`;
    }

    // Handle string paths
    if (typeof photoValue === "string") {
      if (photoValue.startsWith("/tmp/")) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/storage/temp/${photoValue.replace("/tmp/", "")}`;
      }
      if (photoValue.startsWith("data:")) return photoValue;
      if (photoValue.startsWith("http")) return photoValue;

      const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
      if (photoValue.startsWith("/storage/")) return `${baseUrl}${photoValue}`;
      return `${baseUrl}/storage/${photoValue}`;
    }

    return null;
  };

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
        {pageDocs.map((emp, idx) => {
          const photoUrl = getEmployeePhoto(emp);
          const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
          
          return (
            <tr key={emp.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{start + idx + 1}</td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Profile Photo */}
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={fullName}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.querySelector(".fallback-avatar").style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="fallback-avatar w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm md:text-base font-semibold"
                    style={{ display: photoUrl ? "none" : "flex" }}
                  >
                    {fullName.charAt(0) || "?"}
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {fullName || "-"}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                {emp.user?.designation?.name || emp.designation || "-"}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                {emp.user?.department?.name || emp.department || "-"}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                {emp.user?.company?.company_name || emp.company || "-"}
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
          );
        })}

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