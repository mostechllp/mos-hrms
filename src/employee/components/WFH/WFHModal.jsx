import { useState } from "react";
import { useDispatch } from "react-redux";
import { FiHome, FiX, FiSend, FiCalendar, FiMessageSquare, FiFileText, FiLoader } from "react-icons/fi";
import { addWFHRequest, fetchWFHRequests } from "../../store/slices/wfhSlice";
import DateInput from "../../../admin/components/common/DateInput";

const WFHModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
    notes: "",
  });
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    if (!formData.date) {
      setLocalError("Please select a date");
      return false;
    }
    if (!formData.reason.trim()) {
      setLocalError("Please provide a reason");
      return false;
    }
    if (formData.reason.trim().length < 5) {
      setLocalError("Reason must be at least 5 characters");
      return false;
    }
    return true;
  };

  const handleDateChange = (dateValue) => {
    setFormData({ ...formData, date: dateValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await dispatch(
        addWFHRequest({
          date: formData.date,
          reason: formData.reason.trim(),
          notes: formData.notes.trim() || null,
        })
      );

      if (addWFHRequest.fulfilled.match(result)) {
        setSuccessMessage("WFH request submitted successfully!");
        setTimeout(() => {
          handleClose();
          dispatch(fetchWFHRequests());
        }, 1500);
      } else {
        setLocalError(result.payload || "Failed to submit request");
        setSubmitting(false);
      }
    } catch (error) {
      setLocalError("Failed to submit request", error);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ date: "", reason: "", notes: "" });
    setLocalError("");
    setSuccessMessage("");
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="modal-card bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiHome className="text-green-500" /> Submit WFH Request
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={submitting}
          >
            <FiX className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {localError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field mb-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FiCalendar className="inline mr-1 text-green-500" /> Date{" "}
              <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={formData.date}
              onChange={handleDateChange}
              type="general"
              minDate={new Date()}
              className="w-full"
              placeholder="Select date"
            />
          </div>

          <div className="form-field mb-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FiMessageSquare className="inline mr-1 text-green-500" /> Reason{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows="3"
              placeholder="Why do you need to work from home?"
              className="w-full py-3 px-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-field mb-6">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FiFileText className="inline mr-1 text-green-500" /> Additional
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="2"
              placeholder="Any extra information?"
              className="w-full py-3 px-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              disabled={submitting}
            />
          </div>

          <div className="modal-buttons flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full font-medium text-sm bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full font-medium text-sm bg-green-500 text-white hover:bg-green-600 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <FiSend /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WFHModal;