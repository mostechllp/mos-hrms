import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchEmployeeById } from "@admin/store/slices/employeeSlice";
import { fetchLeaveBalances } from "@admin/store/slices/LeaveSlice";

const EditLeaveAllocation = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentEmployee } = useSelector((state) => state.employees || {});

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [photoError, setPhotoError] = useState(false);
  const [fetchingBalances, setFetchingBalances] = useState(true);

  // Helper: employee photo URL
  const getEmployeePhoto = () => {
    if (!currentEmployee) return null;

    const photoValue =
      currentEmployee.avatar ||
      currentEmployee.avatar_path ||
      currentEmployee.passport_size_photo ||
      currentEmployee.profile_photo ||
      currentEmployee.photo ||
      currentEmployee.user?.avatar;

    if (!photoValue || photoError) return null;

    if (typeof photoValue === "object" && photoValue.path) {
      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") || "";
      return `${baseUrl}/storage/${photoValue.path}`;
    }

    if (typeof photoValue === "string") {
      if (photoValue.startsWith("/tmp/")) {
        const baseUrl =
          import.meta.env.VITE_API_URL?.replace("/api", "") || "";
        return `${baseUrl}/storage/temp/${photoValue.replace("/tmp/", "")}`;
      }
      if (photoValue.startsWith("data:")) return photoValue;
      if (photoValue.startsWith("http")) return photoValue;

      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") || "";
      if (photoValue.startsWith("/storage/"))
        return `${baseUrl}${photoValue}`;
      return `${baseUrl}/storage/${photoValue}`;
    }

    return null;
  };

  // Fetch employee
  useEffect(() => {
    if (id) dispatch(fetchEmployeeById(id));
  }, [dispatch, id]);

  // Fetch leave balances + types for this employee (read-only)
  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setFetchingBalances(true);
      try {
        const result = await dispatch(
          fetchLeaveBalances({ employee_id: parseInt(id) }),
        ).unwrap();

        // Leave types come with the response
        const types = Array.isArray(result?.leave_types)
          ? result.leave_types
          : [];
        setLeaveTypes(types);

        // Build a per-type view model: { allocated, used, balance }
        const byType = {};
        const rawAllocations = result?.allocations || {};

        // Allocations may be an object keyed by leave_type_id OR an array
        const allocationsArray = Array.isArray(rawAllocations)
          ? rawAllocations
          : Object.values(rawAllocations);

        types.forEach((t) => {
          const row = allocationsArray.find(
            (a) =>
              String(a.leave_type_id) === String(t.id) ||
              String(a.leave_type?.id) === String(t.id),
          );

          const allocated = row
            ? parseFloat(row.allocated_days ?? row.allocated ?? 0)
            : 0;

          // The API returns `used` at the top level for the primary
          // leave type; for others we fall back to a per-row value.
          const used =
            row?.used != null
              ? parseFloat(row.used)
              : String(result?.leave_types?.[0]?.id) === String(t.id)
                ? parseFloat(result?.used ?? 0)
                : 0;

          byType[t.id] = {
            allocated,
            used,
            balance: allocated - used,
          };
        });

        setAllocations(byType);
      } catch (err) {
        console.error("Failed to fetch leave balances:", err);
        setLeaveTypes([]);
        setAllocations({});
      } finally {
        setFetchingBalances(false);
      }
    };

    run();
  }, [dispatch, id]);

  // ── Loading / not-found states ──
  if (fetchingBalances) {
    return (
      <div className="w-full px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="w-full px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="fas fa-user-slash text-gray-400 text-4xl mb-2"></i>
            <p className="text-gray-500">Employee not found</p>
            <Link
              to="/admin/leaves/allocations"
              className="mt-3 inline-block text-green-500"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const photoUrl = getEmployeePhoto();
  const employeeInitials = `${currentEmployee?.first_name?.charAt(0) || ""}${
    currentEmployee?.last_name?.charAt(0) || ""
  }`;

  return (
    <div className="w-full px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <Link
          to="/admin/leaves"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Leaves
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <Link
          to="/admin/leaves/allocations"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Leave Allocations
        </Link>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">
          Allocation Details
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
          <i className="fas fa-chart-line mr-2"></i> Leave Allocation Details
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Leave balances for {new Date().getFullYear()}
        </p>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Employee Details */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
            <i className="fas fa-user-circle text-green-500 text-sm"></i>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Employee Information
            </h3>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${currentEmployee.first_name} ${currentEmployee.last_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-500 shadow-sm"
                onError={() => setPhotoError(true)}
              />
            ) : null}

            {(!photoUrl || photoError) && (
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm">
                {employeeInitials || "?"}
              </div>
            )}

            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {currentEmployee.first_name} {currentEmployee.last_name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentEmployee?.user?.designation?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {currentEmployee.user?.department?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-xs text-gray-500">Employee ID</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {currentEmployee.employee_id || "-"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">Company</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {currentEmployee.user?.company?.company_name || "-"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                {currentEmployee.personal_email || "-"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">Phone</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {currentEmployee.personal_number || "-"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">Joining Date</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {currentEmployee.joining_date
                  ? new Date(currentEmployee.joining_date).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">Year</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column — Leave Balances (read-only) */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
            <i className="fas fa-calendar-alt text-green-500 text-sm"></i>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Leave Balance for {new Date().getFullYear()}
            </h3>
          </div>

          {leaveTypes.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
              No leave allocation records found
            </p>
          ) : (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[10px] uppercase tracking-wide text-gray-400">
                  Leave Type
                </span>
                <span className="text-[10px] uppercase tracking-wide text-gray-400 text-center">
                  Allocated
                </span>
                <span className="text-[10px] uppercase tracking-wide text-gray-400 text-center">
                  Used
                </span>
                <span className="text-[10px] uppercase tracking-wide text-gray-400 text-center">
                  Balance
                </span>
              </div>

              {leaveTypes.map((type) => {
                const row = allocations[type.id] || {
                  allocated: 0,
                  used: 0,
                  balance: 0,
                };
                return (
                  <div
                    key={type.id}
                    className="grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-100 dark:border-gray-700/70"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-suitcase text-green-500 text-xs"></i>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {type.name}
                      </span>
                    </div>
                    <div className="text-center text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {row.allocated}
                    </div>
                    <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                      {row.used}
                    </div>
                    <div
                      className={`text-center text-xs font-semibold ${
                        row.balance < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {row.balance}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/admin/leaves/allocations"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <i className="fas fa-arrow-left text-xs mr-1"></i>
              Back to Allocations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveAllocation;