import React, { useState } from 'react';
import { TimeInput } from '../common/TimeInput';

const PendingPunchOutModal = ({ isOpen, onClose, onSubmit, loading, pendingDate }) => {
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [planTomorrow, setPlanTomorrow] = useState('');
  const [pendingWorks, setPendingWorks] = useState('');
  const [punchOutTime, setPunchOutTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tasksCompleted.trim()) {
      return setError('Please describe the tasks completed');
    }
    if (!planTomorrow.trim()) {
      return setError('Please describe your plan for tomorrow');
    }
    if (!punchOutTime) {
      return setError('Please select punch out time');
    }

    // Validate punch out time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(punchOutTime)) {
      return setError('Please enter a valid time in HH:MM format (24-hour)');
    }

    await onSubmit({ 
      tasks_completed: tasksCompleted, 
      plan_tomorrow: planTomorrow,
      pending_works: pendingWorks,
      punch_out_time: punchOutTime
    });
  };

  // Get default time (current time)
  const getDefaultTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-[90%] p-7 shadow-soft-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-clock text-amber-500"></i>
            Complete Previous Day
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
            &times;
          </button>
        </div>

        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="font-medium">Pending Punch Out</span>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            You forgot to punch out on <strong>{pendingDate}</strong>. 
            Please complete your punch out for that day before punching in today.
          </p>
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
              Punch Out Time <span className="text-red-500">*</span>
            </label>
            <TimeInput
              value={punchOutTime}
              onChange={(e) => setPunchOutTime(e.target.value)}
              className="w-full"
              required={true}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the time you left work on {pendingDate}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tasks Completed on {pendingDate} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="What tasks did you complete on this day?"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pending Works <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={pendingWorks}
              onChange={(e) => setPendingWorks(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Any tasks that are still pending from that day?"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              List any incomplete tasks that need to be carried forward
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Plan for Tomorrow <span className="text-red-500">*</span>
            </label>
            <textarea
              value={planTomorrow}
              onChange={(e) => setPlanTomorrow(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="What are your plans for tomorrow?"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              className="px-5 py-2 rounded-full font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Processing...</>
              ) : (
                <><i className="fas fa-check"></i> Complete Punch Out</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PendingPunchOutModal;