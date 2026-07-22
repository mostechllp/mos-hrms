import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/common/Toast";
import ConfirmModal from "../common/ConfirmModal";
import { TimeInput } from "../../components/common/TimeInput";
import {
  updateBreak,
  deleteBreak,
} from "../../store/slices/attendanceSlice";

const BreakEditModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  breakData, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
    duration_minutes: "",
  });
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  // Update form data when breakData changes
  useEffect(() => {
    if (breakData) {
      // Extract only the time part from ISO string (HH:MM)
      const extractTime = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        } catch (e) {
          return "";
        }
      };

      setFormData({
        start_time: extractTime(breakData.start_time),
        end_time: breakData.end_time ? extractTime(breakData.end_time) : "",
        duration_minutes: breakData.duration_minutes || "",
      });
    }
  }, [breakData]);

  // Calculate duration when start_time or end_time changes
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    
    try {
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      let startTotalMinutes = startHour * 60 + startMin;
      let endTotalMinutes = endHour * 60 + endMin;
      
      // If end time is before start time, assume it's the next day
      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60;
      }
      
      const duration = endTotalMinutes - startTotalMinutes;
      return duration > 0 ? String(duration) : "";
    } catch (e) {
      return "";
    }
  };

  // Calculate end_time when start_time and duration change
  const calculateEndTime = (start, durationMinutes) => {
    if (!start || !durationMinutes) return "";
    
    try {
      const [startHour, startMin] = start.split(':').map(Number);
      const duration = parseInt(durationMinutes);
      
      if (isNaN(duration) || duration < 0) return "";
      
      let totalMinutes = startHour * 60 + startMin + duration;
      
      // If duration exceeds 24 hours, wrap around
      if (totalMinutes >= 24 * 60) {
        totalMinutes = totalMinutes % (24 * 60);
      }
      
      const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const minutes = String(totalMinutes % 60).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return "";
    }
  };

  // Handle start time change - update duration if end time exists
  const handleStartTimeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, start_time: value };
      // If end time exists, recalculate duration
      if (newData.end_time) {
        const duration = calculateDuration(value, newData.end_time);
        if (duration) {
          newData.duration_minutes = duration;
        }
      }
      return newData;
    });
  };

  // Handle end time change - update duration
  const handleEndTimeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, end_time: value };
      // If start time exists, recalculate duration
      if (newData.start_time) {
        const duration = calculateDuration(newData.start_time, value);
        if (duration) {
          newData.duration_minutes = duration;
        }
      }
      return newData;
    });
  };

  // Handle duration change - update end time
  const handleDurationChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, duration_minutes: value };
      // If start time exists, recalculate end time
      if (newData.start_time && value) {
        const endTime = calculateEndTime(newData.start_time, value);
        if (endTime) {
          newData.end_time = endTime;
        }
      }
      return newData;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the date from the original break data
    const getDateFromISO = (isoString) => {
      if (!isoString) return "";
      try {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) {
        return "";
      }
    };

    // Build full datetime strings with the original date and new time
    const dateStr = getDateFromISO(breakData.start_time);
    
    // Ensure duration is calculated if not set
    let finalDuration = formData.duration_minutes;
    if (!finalDuration && formData.start_time && formData.end_time) {
      finalDuration = calculateDuration(formData.start_time, formData.end_time);
    }

    const payload = {
      start_time: formData.start_time ? `${dateStr} ${formData.start_time}:00` : "",
      end_time: formData.end_time ? `${dateStr} ${formData.end_time}:00` : "",
      duration_minutes: finalDuration || formData.duration_minutes,
    };

    onSave(breakData.id, payload);
  };

  const handleDelete = () => {
    if (isDeleteConfirm) {
      onDelete(breakData.id);
    } else {
      setIsDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Edit Break
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {breakData?.start_time ? new Date(breakData.start_time).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              }) : "-"}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Date cannot be edited. Only time can be changed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <TimeInput
              value={formData.start_time}
              onChange={handleStartTimeChange}
              required={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <TimeInput
              value={formData.end_time}
              onChange={handleEndTimeChange}
            />
            {formData.start_time && formData.end_time && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Duration: {calculateDuration(formData.start_time, formData.end_time) || 0} minutes
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleDurationChange}
              placeholder="e.g., 30"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {formData.duration_minutes && formData.start_time && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                End time will be: {calculateEndTime(formData.start_time, formData.duration_minutes) || "-"}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {breakData?.id && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isDeleteConfirm
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                }`}
              >
                {isDeleteConfirm ? "Confirm Delete" : "Delete"}
              </button>
            )}
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                "Save Break"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main BreakDetailsModal component
const BreakDetailsModal = ({ 
  isOpen, 
  onClose, 
  onRefresh, // Add this prop
  initialBreaks, 
  employeeName, 
  date, 
  attendanceId 
}) => {
  const dispatch = useDispatch();
  const { actionLoading, breaksMap } = useSelector(
    (state) => state.attendance || { 
      actionLoading: false, 
      breaksMap: {}
    }
  );
  
  const [breaks, setBreaks] = useState(initialBreaks || []);
  const [editingBreak, setEditingBreak] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBreakId, setDeletingBreakId] = useState(null);

  // Load breaks from Redux if available, otherwise use initialBreaks
  useEffect(() => {
    if (attendanceId && breaksMap && breaksMap[attendanceId]) {
      setBreaks(breaksMap[attendanceId]);
    } else if (initialBreaks) {
      setBreaks(initialBreaks);
    }
  }, [attendanceId, breaksMap, initialBreaks]);

  // Custom close handler that triggers refresh
  const handleClose = () => {
    onClose();
    // Refresh the attendance data
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!isOpen) return null;

  // Helper function to format ISO time (HH:MM AM/PM)
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "-";
    }
  };

  const handleEditBreak = (breakItem) => {
    setEditingBreak(breakItem);
    setShowEditModal(true);
  };

  const handleSaveBreak = async (breakId, formData) => {
    try {
      const result = await dispatch(updateBreak({ breakId, data: formData })).unwrap();
      // Update the breaks in state
      setBreaks(breaks.map(b => 
        b.id === breakId ? { ...b, ...result } : b
      ));
      showToast("Break updated successfully!", "success");
      setShowEditModal(false);
      setEditingBreak(null);
      // Refresh after save
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      showToast(typeof error === 'string' ? error : "Failed to update break", "error");
    }
  };

  const handleDeleteBreak = (breakId) => {
    setDeletingBreakId(breakId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBreak = async () => {
    try {
      await dispatch(deleteBreak(deletingBreakId)).unwrap();
      setBreaks(breaks.filter(b => b.id !== deletingBreakId));
      showToast("Break deleted successfully!", "success");
      setShowDeleteConfirm(false);
      setDeletingBreakId(null);
      // Refresh after delete
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      showToast(typeof error === 'string' ? error : "Failed to delete break", "error");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Break History
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {employeeName} • {date}
              </p>
            </div>
            <button
              onClick={handleClose} // Use handleClose instead of onClose directly
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {(!breaks || breaks.length === 0) ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-coffee text-2xl"></i>
                </div>
                <p>No breaks recorded for this day.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {breaks.map((b, index) => {
                  const breakData = b.break || b;
                  return (
                    <div
                      key={breakData.id || index}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {formatTime(breakData.start_time)}
                            <i className="fas fa-arrow-right text-xs text-gray-400"></i>
                            {breakData.end_time ? formatTime(breakData.end_time) : "Ongoing"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {breakData.duration_minutes ? `${breakData.duration_minutes} mins` : "-"}
                        </div>
                        
                        {/* Action Buttons */}
                        {breakData.id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditBreak(breakData)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 hover:text-blue-600 transition-colors"
                              title="Edit break"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteBreak(breakData.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors"
                              title="Delete break"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
            <button
              onClick={handleClose} // Use handleClose instead of onClose directly
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Break Modal */}
      <BreakEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBreak(null);
        }}
        onSave={handleSaveBreak}
        onDelete={handleDeleteBreak}
        breakData={editingBreak}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingBreakId(null);
        }}
        onConfirm={confirmDeleteBreak}
        title="Delete Break"
        message="Are you sure you want to delete this break? This action cannot be undone."
        confirmText="Delete Break"
        cancelText="Cancel"
        loading={actionLoading}
        variant="danger"
      />
    </>
  );
};

export default BreakDetailsModal;