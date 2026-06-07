import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { TimeInput } from '../common/TimeInput';
import DateInput from '../common/DateInput';

const ManualAttendanceModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    punch_in: '',
    punch_out: ''
  });
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const { employees, loading: employeesLoading } = useSelector((state) => state.employees);

  useEffect(() => {
    if (isOpen && (!employees || employees.length === 0)) {
      dispatch(fetchEmployees());
    }
  }, [isOpen, dispatch, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dateValue) => {
    setFormData(prev => ({ ...prev, date: dateValue }));
  };

  const handleTimeChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employee_id || !formData.date || !formData.punch_in) {
      return setError('Employee ID, Date, and Punch In are required fields');
    }

    // Validate that punch_out is after punch_in if both are provided
    if (formData.punch_in && formData.punch_out) {
      const punchInTime = formData.punch_in;
      const punchOutTime = formData.punch_out;
      
      if (punchOutTime <= punchInTime) {
        return setError('Punch Out time must be after Punch In time');
      }
    }

    try {
      // Format the data for API - transform to full datetime format
      const formattedData = {
        employee_id: formData.employee_id,
        date: formData.date,
        // Combine date and time into full datetime format (YYYY-MM-DD HH:MM:SS)
        punch_in: `${formData.date} ${formData.punch_in}:00`,
        punch_out: formData.punch_out ? `${formData.date} ${formData.punch_out}:00` : null,
      };
      
      await onSubmit(formattedData);
      handleClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to submit attendance.');
    }
  };

  const handleClose = () => {
    setFormData({
      employee_id: '',
      date: '',
      punch_in: '',
      punch_out: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-[90%] p-7 shadow-soft-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-keyboard text-green-500"></i>
            Add attendance
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
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Employee</option>
              {employeesLoading ? (
                <option value="" disabled>Loading employees...</option>
              ) : (
                employees?.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={formData.date}
              onChange={handleDateChange}
              type="general"
              disableFuture={true}
              className="w-full"
              placeholder="Select date"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: DD/MM/YYYY
            </p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select time (24-hour format)
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Punch Out Time
            </label>
            <TimeInput
              value={formData.punch_out}
              onChange={(e) => handleTimeChange(e, 'punch_out')}
              className="w-full"
              required={false}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional. Select time (24-hour format)
            </p>
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
              className="px-5 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
              ) : (
                <><i className="fas fa-check"></i> Submit</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualAttendanceModal;