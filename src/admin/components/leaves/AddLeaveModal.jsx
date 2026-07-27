import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../store/slices/employeeSlice";
import { addLeave, fetchLeaveBalances, fetchLeaveTypes, fetchLeaves } from "../../store/slices/LeaveSlice";
import { showToast } from "../../../components/common/Toast";
import DateInput from "../common/DateInput";
import {
  FiCalendar,
  FiMessageSquare,
  FiPaperclip,
  FiSend,
  FiX,
  FiAlertCircle,
  FiList,
  FiClock,
  FiUser
} from "react-icons/fi";
import { MdCalculate } from "react-icons/md";

const AddLeaveModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const { employees = [] } = useSelector((state) => state.employees || {});
  const { leaveTypes = [] } = useSelector((state) => state.leaves || {});

  const [employeeId, setEmployeeId] = useState("");
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loadingBalances, setLoadingBalances] = useState(false);

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    claim_salary: "0",
    start_session: "morning",
    end_session: "afternoon",
  });
  
  const [totalDays, setTotalDays] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchEmployees());
      dispatch(fetchLeaveTypes());
      // reset state
      setEmployeeId("");
      setLeaveBalances({});
      setFormData({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: "",
        claim_salary: "0",
        start_session: "morning",
        end_session: "afternoon",
      });
      setTotalDays(0);
      setSelectedFile(null);
      setLocalError("");
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const loadBalances = async () => {
      if (employeeId) {
        setLoadingBalances(true);
        try {
          const result = await dispatch(fetchLeaveBalances({ employee_id: employeeId })).unwrap();
          // The result usually is an array or object containing allocations.
          // In admin we might need to parse it similar to employee side.
          // The admin fetchLeaveBalances returns an array of allocations usually or an object.
          // Let's assume it returns an array of { leave_type_id, allocated_days, used_days, remaining_days }
          // We will store it by leave_type_id
          const balances = {};
          if (Array.isArray(result?.allocations)) {
            result.allocations.forEach(alloc => {
                balances[alloc.leave_type_id] = {
                    remaining: parseFloat(alloc.allocated_days) - (parseFloat(alloc.used_days) || 0)
                };
            });
          } else if (result?.allocations) {
            Object.values(result.allocations).forEach(alloc => {
                balances[alloc.leave_type_id] = {
                    remaining: parseFloat(alloc.allocated_days) - (parseFloat(alloc.used_days) || 0)
                };
            });
          }
          setLeaveBalances(balances);
        } catch (error) {
          console.error("Failed to fetch balances", error);
        } finally {
          setLoadingBalances(false);
        }
      } else {
        setLeaveBalances({});
      }
    };
    loadBalances();
  }, [employeeId, dispatch]);

  // Set first leave type as default
  useEffect(() => {
    if (leaveTypes.length > 0 && !formData.leave_type_id) {
      setFormData(prev => ({
        ...prev,
        leave_type_id: leaveTypes[0].id.toString()
      }));
    }
  }, [leaveTypes, formData.leave_type_id]);

  useEffect(() => {
    calculateDays();
  }, [formData.start_date, formData.end_date, formData.start_session, formData.end_session]);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const getWorkingDaysExcludingSundays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    try {
      const from = new Date(startDate);
      const to = new Date(endDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);
      if (from > to) return 0;
      let count = 0;
      const current = new Date(from);
      while (current <= to) {
        if (current.getDay() !== 0) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    } catch (error) {
      return 0;
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const from = parseDate(formData.start_date);
      const to = parseDate(formData.end_date);
      if (!from || !to) {
        setTotalDays(0);
        return;
      }
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);
      if (to >= from) {
        let days = getWorkingDaysExcludingSundays(from, to);
        if (days === 0) {
          setTotalDays(0);
          return;
        }
        if (formData.start_session === "afternoon") days -= 0.5;
        if (formData.end_session === "morning") days -= 0.5;
        if (days < 0.5 && days > 0) days = 0.5;
        setTotalDays(days);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  };

  const handleStartDateChange = (dateValue) => {
    setFormData({ ...formData, start_date: dateValue });
    if (formData.end_date && dateValue && parseDate(formData.end_date) < parseDate(dateValue)) {
      setFormData(prev => ({ ...prev, end_date: "" }));
    }
  };

  const handleEndDateChange = (dateValue) => {
    setFormData({ ...formData, end_date: dateValue });
  };

  const validateForm = () => {
    if (!employeeId) {
      setLocalError("Please select an employee");
      return false;
    }
    if (!formData.leave_type_id) {
      setLocalError("Please select a leave type");
      return false;
    }
    if (!formData.start_date || !formData.end_date) {
      setLocalError("Please select valid dates");
      return false;
    }
    if (totalDays <= 0) {
      setLocalError("End date must be after start date");
      return false;
    }
    if (formData.reason.length < 10) {
      setLocalError("Please provide a reason (minimum 10 characters)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!validateForm()) return;

    const balance = leaveBalances[formData.leave_type_id] || { remaining: 0 };
    if (totalDays > balance.remaining && balance.remaining >= 0) {
        // Just a warning for admin? Or block it? Let's show a toast warning but allow?
        // Actually, employee is blocked. Let's block admin too or show a warning.
        // We'll block it to be consistent with employee logic, unless admin bypass is needed.
        // Actually let's just warn but proceed or block. We'll block.
        setLocalError(`Requested days (${totalDays}) exceed available balance (${balance.remaining} days)`);
        return;
    }

    setSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append("employee_id", employeeId);
    
    const startDateFormatted = formData.start_date.includes('/') ? formData.start_date.split('/').reverse().join('-') : formData.start_date;
    const endDateFormatted = formData.end_date.includes('/') ? formData.end_date.split('/').reverse().join('-') : formData.end_date;
      
    formDataToSend.append("leave_type_id", formData.leave_type_id);
    formDataToSend.append("start_date", startDateFormatted);
    formDataToSend.append("end_date", endDateFormatted);
    formDataToSend.append("reason", formData.reason);
    formDataToSend.append("claim_salary", formData.claim_salary);
    formDataToSend.append("session1", formData.start_session);
    formDataToSend.append("session2", formData.end_session);
    formDataToSend.append("year", new Date().getFullYear().toString());

    if (selectedFile) formDataToSend.append("document", selectedFile);

    const result = await dispatch(addLeave(formDataToSend));

    if (addLeave.fulfilled.match(result)) {
      showToast("Leave request added successfully", "success");
      dispatch(fetchLeaves());
      onClose();
    } else {
      setLocalError(result.payload || "Failed to add leave request");
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-soft-lg border border-gray-200 dark:border-gray-700 my-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FiCalendar className="text-green-500" /> Apply Leave for Employee
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <FiX className="text-2xl" />
          </button>
        </div>

        {localError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3 text-red-600">
            <FiAlertCircle className="text-xl" />
            <span className="text-sm">{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Employee Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiUser className="text-green-500" /> Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiList className="text-green-500" /> Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leave_type_id}
                onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500"
              >
                {leaveTypes.map((type) => {
                  const balance = leaveBalances[type.id] || { remaining: 0 };
                  return (
                    <option key={type.id} value={type.id}>
                      {type.name} {employeeId && !loadingBalances ? `(Available: ${balance.remaining})` : ''}
                    </option>
                  );
                })}
              </select>
              {loadingBalances && <p className="text-[10px] text-gray-400">Loading balances...</p>}
            </div>

            {/* Start Date & Session */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiCalendar className="text-green-500" /> Start Date <span className="text-red-500">*</span>
              </label>
              <DateInput
                value={formData.start_date}
                onChange={handleStartDateChange}
                type="general"
                className="w-full"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiClock className="text-green-500" /> Start Session
              </label>
              <select
                value={formData.start_session}
                onChange={(e) => setFormData({ ...formData, start_session: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>

            {/* End Date & Session */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiCalendar className="text-green-500" /> End Date <span className="text-red-500">*</span>
              </label>
              <DateInput
                value={formData.end_date}
                onChange={handleEndDateChange}
                type="general"
                className="w-full"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiClock className="text-green-500" /> End Session
              </label>
              <select
                value={formData.end_session}
                onChange={(e) => setFormData({ ...formData, end_session: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MdCalculate className="text-green-500" /> Total Days
              </label>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold text-gray-800 dark:text-gray-200 text-sm">
                {totalDays} <span className="text-xs font-normal text-gray-500 ml-1">Days</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FiPaperclip className="text-green-500" /> Document <span className="text-gray-400 text-[10px] ml-1">(Optional)</span>
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-500 file:text-white file:cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <FiMessageSquare className="text-green-500" /> Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows="3"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 resize-none"
              placeholder="Reason for leave (min 10 chars)..."
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Claim Salary</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="1" checked={formData.claim_salary === "1"} onChange={() => setFormData({ ...formData, claim_salary: "1" })} className="text-green-500" />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="0" checked={formData.claim_salary === "0"} onChange={() => setFormData({ ...formData, claim_salary: "0" })} className="text-green-500" />
              <span className="text-sm">No</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2">
              {submitting ? "Submitting..." : <><FiSend /> Submit</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveModal;
