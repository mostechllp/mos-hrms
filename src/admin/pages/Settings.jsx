import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showToast } from '../components/common/Toast';
import apiClient from '../../utils/apiClient';
import { fetchOrganizations } from '../store/slices/organizationSlice';

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

  return (
    
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
          </div>
  );
};

export default Settings;