import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiSave, FiUserCheck } from "react-icons/fi";
import { addDesignation } from "../../store/slices/designationSlice";
import { showToast } from "../common/Toast";

const AddDesignationModal = ({ isOpen, onClose, onCreated }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.designations || {});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", default_punch_access: 0 },
  });

  useEffect(() => {
    if (isOpen) reset({ name: "", default_punch_access: 0 });
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        default_punch_access: Number(data.default_punch_access) || 0,
      };
      const result = await dispatch(addDesignation(payload)).unwrap();
      showToast(`Designation "${result.name}" added`, "success");
      onCreated?.(result);
      onClose();
    } catch (err) {
      showToast(
        typeof err === "string" ? err : "Failed to add designation",
        "error",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <FiUserCheck size={16} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Add Designation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Designation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Senior Software Engineer"
              {...register("name", {
                required: "Designation name is required",
              })}
              className={`w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all ${
                errors.name
                  ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Default Punch Access
            </label>
            <select
              {...register("default_punch_access")}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <FiSave size={14} />
                  Add Designation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDesignationModal;