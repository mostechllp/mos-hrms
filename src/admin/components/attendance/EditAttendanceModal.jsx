import { useState, useEffect } from "react";
import DateInput from "../common/DateInput";
import { TimeInput } from "../common/TimeInput";

const EditAttendanceModal = ({ isOpen, onClose, onSubmit, submitting, attendance }) => {
  const [formData, setFormData] = useState({
    log_date: "",
    punch_in: "",
    punch_out: "",
    attendance_status: "present",
  });
  const [error, setError] = useState("");

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
  const convertToYMD = (dateStr) => {
    if (!dateStr) return "";
    // Check if it's in DD/MM/YYYY format
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  // Helper function to convert YYYY-MM-DD to DD/MM/YYYY
  const convertToDMY = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  useEffect(() => {
    if (attendance && isOpen) {
      console.log("Editing attendance:", attendance);
      
      // Get the date - use the 'date' field from the attendance object
      let dateForDisplay = attendance.date || "";
      
      // Get punch in time from 'punchIn' field (format: "02:05 PM")
      let punchIn = "";
      if (attendance.punchIn && attendance.punchIn !== "--") {
        // Convert from "02:05 PM" to "14:05" format for time input
        punchIn = convertTo24HourFormat(attendance.punchIn);
      }
      
      // Get punch out time from 'punchOut' field
      let punchOut = "";
      if (attendance.punchOut && attendance.punchOut !== null && attendance.punchOut !== "--") {
        punchOut = convertTo24HourFormat(attendance.punchOut);
      }
      
      // Determine attendance status from 'status' field
      const status = attendance.status === "Present" ? "present" : "absent";
      
      console.log("Setting form data:", {
        log_date: dateForDisplay,
        punch_in: punchIn,
        punch_out: punchOut,
        attendance_status: status
      });
      
      setFormData({
        log_date: dateForDisplay,
        punch_in: punchIn,
        punch_out: punchOut,
        attendance_status: status,
      });
    }
  }, [attendance, isOpen]);

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24HourFormat = (time12h) => {
    if (!time12h) return "";
    
    // Check if it's already in 24-hour format
    if (time12h.match(/^\d{2}:\d{2}$/) && !time12h.includes("AM") && !time12h.includes("PM")) {
      return time12h;
    }
    
    // Parse the time
    const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time12h;
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleDateChange = (dateValue) => {
    console.log("Date changed to:", dateValue);
    setFormData(prev => ({ ...prev, log_date: dateValue }));
  };

  const handleTimeChange = (e, fieldName) => {
    const { value } = e.target;
    console.log(`Time changed for ${fieldName}:`, value);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.log_date || !formData.punch_in) {
      return setError("Date and Punch In time are required fields");
    }

    // Validate that punch_out is after punch_in if both are provided
    if (formData.punch_in && formData.punch_out) {
      if (formData.punch_out <= formData.punch_in) {
        return setError("Punch Out time must be after Punch In time");
      }
    }

    try {
      // Convert date from DD/MM/YYYY to YYYY-MM-DD for the API
      const dateForApi = convertToYMD(formData.log_date);
      
      // Validate date conversion
      if (!dateForApi || dateForApi.length !== 10) {
        return setError("Invalid date format. Please select a valid date.");
      }
      
      const formattedData = {
        log_date: dateForApi, // Send YYYY-MM-DD format
        punch_in: `${dateForApi} ${formData.punch_in}:00`,
        punch_out: formData.punch_out ? `${dateForApi} ${formData.punch_out}:00` : null,
        attendance_status: formData.attendance_status,
      };
      
      console.log("Submitting edit:", formattedData);
      
      await onSubmit(attendance.id, formattedData);
      handleClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to update attendance.');
    }
  };

  const handleClose = () => {
    setFormData({
      log_date: "",
      punch_in: "",
      punch_out: "",
      attendance_status: "present",
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-[90%] p-7 shadow-soft-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-edit text-blue-500"></i>
            Edit Attendance
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={formData.log_date}
              onChange={handleDateChange}
              type="general"
              className="w-full"
              placeholder="Select date"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Punch In Time <span className="text-red-500">*</span>
            </label>
            <TimeInput
              value={formData.punch_in}
              onChange={(e) => handleTimeChange(e, 'punch_in')}
              className="w-full"
              required={true}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Punch Out Time
            </label>
            <TimeInput
              value={formData.punch_out}
              onChange={(e) => handleTimeChange(e, 'punch_out')}
              className="w-full"
              required={false}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Attendance Status
            </label>
            <select
              value={formData.attendance_status}
              onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-full font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><i className="fas fa-spinner fa-spin"></i> Updating...</>
              ) : (
                <><i className="fas fa-save"></i> Update</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendanceModal;