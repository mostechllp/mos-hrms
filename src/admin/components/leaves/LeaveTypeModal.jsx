import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../common/Toast";
import { addLeaveType, updateLeaveType } from "../../store/slices/LeaveSlice";

const LeaveTypeModal = ({ isOpen, editingType, onClose }) => {
  const dispatch = useDispatch();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Please enter leave type name", "error");
      return;
    }

    setLoading(true);

    if (editingType) {
      const result = await dispatch(
        updateLeaveType({
          id: editingType.id,
          data: {
            name: name.trim(),
            status: editingType.status ? 1 : 0,
          },
        }),
      );
      if (updateLeaveType.fulfilled.match(result)) {
        showToast(`✏️ "${name}" updated successfully`, "success");
        onClose();
      } else {
        showToast("Failed to update leave type", "error");
      }
    } else {
      const result = await dispatch(
        addLeaveType({
          name: name.trim(),
          status: 1,
        }),
      );
      if (addLeaveType.fulfilled.match(result)) {
        showToast(`✓ "${name}" added successfully`, "success");
        onClose();
      } else {
        showToast("Failed to add leave type", "error");
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
