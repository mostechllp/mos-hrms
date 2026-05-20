import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/common/Toast";
import { addLeaveType, updateLeaveType } from "../../store/slices/LeaveSlice";

const LeaveTypeModal = ({ isOpen, editingType, onClose }) => {
  const dispatch = useDispatch();
  const { leaveTypes = [] } = useSelector((state) => state.leaves || { leaveTypes: [] });
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(editingType.name);
    } else {
      setName("");
    }
  }, [editingType]);

  // Check if leave type already exists (case insensitive)
  const isDuplicate = (typeName, excludeId = null) => {
    return leaveTypes.some(type => 
      type.name.toLowerCase() === typeName.toLowerCase() && 
      type.id !== excludeId
    );
  };

  // Function to extract error message from the API response
  const extractErrorMessage = (errorPayload) => {
    
    // Check for the errors object with name array
    if (errorPayload?.errors?.name && Array.isArray(errorPayload.errors.name)) {
      return errorPayload.errors.name[0]; // "The name has already been taken."
    }
    
    // Check for message property
    if (errorPayload?.message) {
      return errorPayload.message;
    }
    
    // If it's a string
    if (typeof errorPayload === "string") {
      return errorPayload;
    }
    
    return "Failed to add leave type";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    
    if (!trimmedName) {
      showToast("Please enter leave type name", "error");
      return;
    }

    // Client-side duplicate check (optional - for immediate feedback)
    if (!editingType && isDuplicate(trimmedName)) {
      showToast(`Leave type "${trimmedName}" already exists`, "error");
      return;
    }

    // For editing, check if new name conflicts with other types
    if (editingType && isDuplicate(trimmedName, editingType.id)) {
      showToast(`Leave type "${trimmedName}" already exists`, "error");
      return;
    }

    setLoading(true);

    if (editingType) {
      const result = await dispatch(
        updateLeaveType({
          id: editingType.id,
          data: {
            name: trimmedName,
            status: editingType.status ? 1 : 0,
          },
        }),
      );
      
      if (updateLeaveType.fulfilled.match(result)) {
        showToast(`✏️ "${trimmedName}" updated successfully`, "success");
        onClose();
      } else {
        const errorMessage = extractErrorMessage(result.payload);
        showToast(errorMessage, "error");
      }
    } else {
      const result = await dispatch(
        addLeaveType({
          name: trimmedName,
          status: 1,
        }),
      );
      
      
      if (addLeaveType.fulfilled.match(result)) {
        showToast(`✓ "${trimmedName}" added successfully`, "success");
        onClose();
      } else {
        const errorMessage = extractErrorMessage(result.payload);
        showToast(errorMessage, "error");
      }
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-[90%] p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <i
            className={`fas ${editingType ? "fa-edit" : "fa-plus-circle"} text-green-500`}
          ></i>
          {editingType ? "Edit Leave Type" : "Add New Leave Type"}
        </h3>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Type Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter leave type name (e.g., Sick Leave)"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 mb-5"
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveTypeModal;