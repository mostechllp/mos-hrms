import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../common/Toast";
import BaseModal from "./BaseModal";
import { 
  updateAttendanceRequest, 
  updateAttendanceRequestAdmin,
  fetchAttendanceRequests 
} from "../../store/slices/attendanceTypeSlice";
import DateInput from "../../../admin/components/common/DateInput";
import { TimeInput } from "../common/TimeInput";

const EditAttendanceRequestModal = ({ isOpen, onClose, request, isAdmin = false }) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const formatTimeForApi = (timeStr) => {
    if (!timeStr) return "";
    // If time is "14:30:00", split by ":" and take the first two parts
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  useEffect(() => {
    if (request && isOpen) {
      setFormData({
        date: request.request_date || request.date || "",
        time: formatTimeForApi(request.request_time || request.time || ""),
        reason: request.reason || "",
      });
    }
  }, [request, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.reason) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const data = {
        type: request.type,
        request_date: formData.date,
        request_time: formatTimeForApi(formData.time),
        reason: formData.reason,
      };
      
      if (isAdmin) {
        await dispatch(updateAttendanceRequestAdmin({ id: request.id, data })).unwrap();
      } else {
        await dispatch(updateAttendanceRequest({ id: request.id, data })).unwrap();
      }
      
      showToast("Attendance request updated successfully", "success");
      onClose();
      // Reload requests to reflect updated data
      dispatch(fetchAttendanceRequests(isAdmin));
    } catch (error) {
      showToast(error || "Failed to update request", "error");
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeLabel = (type) => {
    const types = {
      early_check_in: "Early Check-in",
      late_check_in: "Late Check-in",
      missed_punch_in: "Missed Punch In",
      missed_punch_out: "Missed Punch Out",
      early_checkin: "Early Check-in",
      late_checkin: "Late Check-in",
    };
    return types[type] || type?.replace(/_/g, ' ') || type;
  };

  if (!request) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${getRequestTypeLabel(request.type)} Request`}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <DateInput
          value={formData.date}
          onChange={(date) => setFormData({ ...formData, date })}
          placeholder="dd/mm/yyyy"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Time <span className="text-red-500">*</span>
        </label>
        <TimeInput
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Provide a valid reason..."
          required
        />
      </div>
    </BaseModal>
  );
};

export default EditAttendanceRequestModal;
