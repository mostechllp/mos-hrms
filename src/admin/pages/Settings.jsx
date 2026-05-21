import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showToast } from '../components/common/Toast';
import apiClient from '../../utils/apiClient';
import { fetchOrganizations } from '../store/slices/organizationSlice';

// Helper to parse "HH:MM" (24h) to { hour: "01"-"12", minute: "00"-"59", period: "AM"|"PM" }
const parseTimeTo12Hour = (time24) => {
  if (!time24) return { hour: '09', minute: '00', period: 'AM' };
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 should be 12
  const hour = h.toString().padStart(2, '0');
  return { hour, minute: m, period };
};

// Helper to convert { hour: "01"-"12", minute: "00"-"59", period: "AM"|"PM" } to "HH:MM" (24h)
const formatTimeTo24Hour = (hour, minute, period) => {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  const hStr = h.toString().padStart(2, '0');
  return `${hStr}:${minute}`;
};

const CustomTimePicker = ({ value, onChange, disabled, isOpen, onToggle, placement = 'bottom' }) => {
  const { hour, minute, period } = parseTimeTo12Hour(value);
  const formattedTime = `${hour}:${minute} ${period}`;
  
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  
  const getMinuteOptions = (currentMinute) => {
    const baseMinutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
    if (currentMinute && !baseMinutes.includes(currentMinute)) {
      return [...baseMinutes, currentMinute].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }
    return baseMinutes;
  };
  
  const minuteOptions = getMinuteOptions(minute);
  
  const handleSelect = (field, newValue) => {
    let newHour = hour;
    let newMinute = minute;
    let newPeriod = period;
    
    if (field === 'hour') newHour = newValue;
    if (field === 'minute') newMinute = newValue;
    if (field === 'period') newPeriod = newValue;
    
    const time24 = formatTimeTo24Hour(newHour, newMinute, newPeriod);
    onChange(time24);
  };
  
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (hoursRef.current) {
          const selectedHourEl = hoursRef.current.querySelector('[data-selected="true"]');
          if (selectedHourEl) {
            selectedHourEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
          }
        }
        if (minutesRef.current) {
          const selectedMinuteEl = minutesRef.current.querySelector('[data-selected="true"]');
          if (selectedMinuteEl) {
            selectedMinuteEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  return (
    <div className="relative">
      <style>{`
        .custom-time-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-time-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-time-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-time-scroll::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
      `}</style>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900 transition-colors hover:border-gray-300 dark:hover:border-gray-500 text-left font-medium"
      >
        <span>{formattedTime}</span>
        <i className="far fa-clock text-gray-400 dark:text-gray-500"></i>
      </button>
      
      {isOpen && (
        <div className={`absolute left-0 ${placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} z-50 flex gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-48 h-56 animate-fade-in`}>
          {/* Hours */}
          <div 
            ref={hoursRef}
            className="flex-1 overflow-y-auto custom-time-scroll flex flex-col gap-1 pr-1"
          >
            {hours.map(h => {
              const isSelected = h === hour;
              return (
                <button
                  key={h}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleSelect('hour', h)}
                  className={`py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center text-gray-400 dark:text-gray-500 font-bold select-none">:</div>
          
          {/* Minutes */}
          <div 
            ref={minutesRef}
            className="flex-1 overflow-y-auto custom-time-scroll flex flex-col gap-1 pr-1"
          >
            {minuteOptions.map(m => {
              const isSelected = m === minute;
              return (
                <button
                  key={m}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleSelect('minute', m)}
                  className={`py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          
          {/* AM/PM */}
          <div className="w-12 border-l border-gray-100 dark:border-gray-700 pl-2 flex flex-col justify-center gap-2">
            {['AM', 'PM'].map(p => {
              const isSelected = p === period;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelect('period', p)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const defaultWorkingHours = [
  { id: 1, day: 'Monday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { id: 2, day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { id: 3, day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { id: 4, day: 'Thursday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { id: 5, day: 'Friday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { id: 6, day: 'Saturday', enabled: false, startTime: '09:00', endTime: '18:00' },
];

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const { organizations } = useSelector((state) => state.organizations);
  const dispatch = useDispatch();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const [, setProfileData] = useState({
    fullName: user?.employee?.name || user?.name || 'HR Admin',
    email: user?.email || 'hr@thesay.ae',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '', 
    password: '',         
    password_confirmation: '', 
  });

  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false);
  const [activePicker, setActivePicker] = useState(null); // { id: number, field: 'startTime' | 'endTime' } | null

  // Get the first organization (or find the current user's organization)
  const currentOrganization = organizations?.[0] || null;

  // Get organization logo URL - same logic as Header component
  const getOrganizationLogo = () => {
    if (avatarError) return null;
    if (currentOrganization?.logo) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || window.location.origin;
      return `${baseUrl}/storage/${currentOrganization.logo}`;
    }
    return null;
  };

  // Get organization name
  const getOrganizationName = () => {
    return currentOrganization?.name || "Organization";
  };
  const organizationLogo = getOrganizationLogo();
  const organizationName = getOrganizationName();

  // Fetch organizations on component mount
  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({
        fullName: user?.employee?.name || user?.name || 'HR Admin',
        email: user?.email || 'hr@thesay.ae',
      });
    }
  }, [user]);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.current_password) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (!passwordData.password) {
      showToast('Please enter a new password', 'error');
      return;
    }
    if (passwordData.password.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      // Make POST request to change password endpoint
      const response = await apiClient.post('/employee/change-password', {
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      
      console.log('Password change response:', response.data);
      
      if (response.data.status === 'success' || response.status === 200) {
        showToast('Password changed successfully!', 'success');
        // Reset form
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      } else {
        showToast(response.data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle different error scenarios
      if (error.response?.status === 422) {
        // Validation errors
        const errors = error.response.data.errors;
        if (errors) {
          // Get the first error message
          const firstError = Object.values(errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          showToast(errorMessage || 'Validation error', 'error');
        } else {
          showToast(error.response.data.message || 'Invalid input', 'error');
        }
      } else if (error.response?.status === 401) {
        showToast('Current password is incorrect', 'error');
      } else if (error.response?.status === 400) {
        showToast(error.response.data.message || 'Bad request', 'error');
      } else {
        showToast(error.response?.data?.message || 'Failed to change password. Please try again.', 'error');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleWorkingDay = (id) => {
    setWorkingHours(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleChangeWorkingTime = (id, field, value) => {
    setWorkingHours(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleTogglePicker = (id, field) => {
    setActivePicker(prev => 
      prev && prev.id === id && prev.field === field ? null : { id, field }
    );
  };

  const validateWorkingHours = () => {
    for (let item of workingHours) {
      if (item.enabled) {
        if (!item.startTime || !item.endTime) {
          showToast(`Both start and end times are required for ${item.day}`, 'error');
          return false;
        }
        if (item.startTime >= item.endTime) {
          showToast(`End time must be greater than start time for ${item.day}`, 'error');
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveWorkingHours = async () => {
    if (!validateWorkingHours()) return;
    
    setLoadingWorkingHours(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saved working hours:', workingHours);
      showToast('Working hours saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save working hours', 'error');
    } finally {
      setLoadingWorkingHours(false);
    }
  };

  return (
    <>
      {activePicker && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setActivePicker(null)} 
        />
      )}
      <div className="max-w-7xl mx-auto w-full">
            
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
                Account Settings
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Update your security preferences
              </p>
            </div>

            {/* Two Column Layout - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              
              {/* Left Column - Organization Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-soft">
                <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <i className="fas fa-building text-green-600 dark:text-green-400 text-base md:text-xl"></i>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">Organization Details</h3>
                </div>

                {/* Organization Logo Section - Display Only */}
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
                  <div className="text-center">
                    {organizationLogo ? (
                      <img
                        src={organizationLogo}
                        alt={organizationName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-4 border-green-500 shadow-md mx-auto"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-2xl sm:text-3xl shadow-md mx-auto">
                        <i className="fas fa-building"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      <i className="fas fa-info-circle text-green-500 mr-1"></i>
                      Organization logo is managed in Organization Settings
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => window.location.href = '/admin/organizations'}
                        className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        <i className="fas fa-edit text-xs md:text-sm"></i> 
                        <span>Change Organization Logo</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                    Organization Name
                  </label>
                  <div className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 cursor-not-allowed">
                    {organizationName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <i className="fas fa-info-circle text-green-500 mr-1"></i>
                    Organization name can be updated from the Organizations tab
                  </div>
                </div>
              </div>

              {/* Right Column - Change Password */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-soft">
                <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <i className="fas fa-lock text-green-600 dark:text-green-400 text-base md:text-xl"></i>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">Change Password</h3>
                </div>

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3 md:mb-4">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 pr-8 md:pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fas ${showCurrentPassword ? 'fa-eye' : 'fa-eye-slash'} text-xs md:text-sm`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3 md:mb-4">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 pr-8 md:pr-10"
                        placeholder="Enter new password (min. 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fas ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'} text-xs md:text-sm`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4 md:mb-6">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="password_confirmation"
                        value={passwordData.password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 pr-8 md:pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} text-xs md:text-sm`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
                  >
                    {passwordLoading ? (
                      <><i className="fas fa-spinner fa-spin"></i> <span>Updating...</span></>
                    ) : (
                      <><i className="fas fa-key text-xs md:text-sm"></i> <span>Update Password</span></>
                    )}
                  </button>
                </form>

                {/* Password Requirements Info */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <i className="fas fa-info-circle text-green-500"></i>
                    <span>Password must be at least 6 characters long and should not be easily guessable.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours Section - Full Width */}
            <div className="mt-4 md:mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-soft">
              <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <i className="fas fa-clock text-green-600 dark:text-green-400 text-base md:text-xl"></i>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">Working Hours Settings</h3>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure working hours for each day of the week</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {workingHours.map((item, index) => {
                  const placement = index >= workingHours.length - 2 ? 'top' : 'bottom';
                  return (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600/50 transition-all hover:border-green-200 dark:hover:border-green-900/50">
                      
                      <div className="flex items-center justify-between md:w-1/3">
                        <span className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300 min-w-[100px]">
                          {item.day}
                        </span>
                        
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.enabled}
                              onChange={() => handleToggleWorkingDay(item.id)}
                            />
                            <div className="w-9 h-5 md:w-11 md:h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                          </div>
                          <span className={`text-xs md:text-sm font-semibold w-16 ${item.enabled ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                            {item.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4 flex-1">
                        <div className="flex-1">
                          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Start Time</label>
                          <CustomTimePicker
                            disabled={!item.enabled}
                            value={item.startTime}
                            onChange={(val) => handleChangeWorkingTime(item.id, 'startTime', val)}
                            isOpen={activePicker?.id === item.id && activePicker?.field === 'startTime'}
                            onToggle={() => handleTogglePicker(item.id, 'startTime')}
                            placement={placement}
                          />
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 font-medium mt-5">to</div>
                        <div className="flex-1">
                          <label className="block text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">End Time</label>
                          <CustomTimePicker
                            disabled={!item.enabled}
                            value={item.endTime}
                            onChange={(val) => handleChangeWorkingTime(item.id, 'endTime', val)}
                            isOpen={activePicker?.id === item.id && activePicker?.field === 'endTime'}
                            onToggle={() => handleTogglePicker(item.id, 'endTime')}
                            placement={placement}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={handleSaveWorkingHours}
                  disabled={loadingWorkingHours}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70 shadow-md hover:shadow-lg"
                >
                  {loadingWorkingHours ? (
                    <><i className="fas fa-spinner fa-spin"></i> <span>Saving...</span></>
                  ) : (
                    <><i className="fas fa-save text-sm"></i> <span>Save Working Hours</span></>
                  )}
                </button>
              </div>
            </div>

          </div>
    </>
  );
};

export default Settings;