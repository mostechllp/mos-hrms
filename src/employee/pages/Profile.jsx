import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiLock, FiSave, FiRefreshCw, FiEdit2, FiBriefcase, FiCalendar, FiUsers, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import apiClient from '../utils/apiClient';

const Profile = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    personalEmail: '',
    personalNumber: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Get employee data from auth
  const employee = authUser?.employee || authUser;
  
  // Initialize form data from auth
  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.name || '',
        personalEmail: employee.personal_email || '',
        personalNumber: employee.phone || '',
        address: employee.address || '',
      });
    }
    setLoading(false);
  }, [employee]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 2) {
        showToast('Profile photo must be less than 2MB', 'error');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Only JPG, JPEG, and PNG files are allowed', 'error');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    setUpdating(true);
    
    try {
      // Try to update via API if endpoint exists
      const formDataToSend = new FormData();
      
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      formDataToSend.append('first_name', firstName);
      formDataToSend.append('last_name', lastName);
      formDataToSend.append('name', formData.fullName);
      
      if (formData.personalEmail) formDataToSend.append('personal_email', formData.personalEmail);
      if (formData.personalNumber) formDataToSend.append('phone', formData.personalNumber);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (photoFile) formDataToSend.append('avatar', photoFile);
      
      // Try to update profile - if endpoint doesn't exist, save to localStorage
      try {
        await apiClient.post('/employee/profile/update', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast('Profile updated successfully!', 'success');
      } catch (apiError) {
        // If API endpoint doesn't exist, save to localStorage
        const profileData = {
          name: formData.fullName,
          personal_email: formData.personalEmail,
          phone: formData.personalNumber,
          address: formData.address,
          avatar: photoPreview,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('employeeProfile', JSON.stringify(profileData));
        showToast('Profile saved locally! (API endpoint not available)', 'success');
        console.log(apiError)
      }
      
      setPhotoFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      showToast('Please enter current password', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    setUpdating(true);
    
    try {
      // Try to change password via API
      await apiClient.post('/employee/change-password', {
        current_password: passwordData.currentPassword,
        password: passwordData.newPassword,
        password_confirmation: passwordData.confirmPassword,
      });
      
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      // If API endpoint doesn't exist, show message
      if (error.response?.status === 404) {
        showToast('Password change endpoint not available. Please contact administrator.', 'error');
      } else {
        showToast(error.response?.data?.message || 'Failed to change password', 'error');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = () => {
    if (employee) {
      setFormData({
        fullName: employee.name || '',
        personalEmail: employee.personal_email || '',
        personalNumber: employee.phone || '',
        address: employee.address || '',
      });
    }
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    if (photoPreview) return photoPreview;
    
    // Check localStorage for saved avatar
    const savedProfile = localStorage.getItem('employeeProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.avatar) return profile.avatar;
    }
    
    if (authUser?.avatar) return authUser.avatar;
    
    const name = formData.fullName || employee?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2ecc71&color=fff&rounded=true&size=128`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-7">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
          <FiUser /> My Profile
        </h2>
      </div>
      
      <div className="split-container grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7">
        {/* Form */}
        <div className="form-container bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleUpdateProfile}>
            <div className="form-section-title text-lg font-bold text-green-600 mb-6 pb-3 border-b-2 border-green-100 flex items-center gap-2.5">
              <FiEdit2 /> Edit Personal Info
            </div>
            <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="form-field md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiUser className="text-green-500" /> Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiMail className="text-green-500" /> Company Email (read-only)
                </label>
                <input
                  type="email"
                  value={employee?.company_email || authUser?.email || ''}
                  disabled
                  className="py-3 px-3.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiMail className="text-green-500" /> Personal Email
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Enter personal email"
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiPhone className="text-green-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.personalNumber}
                  onChange={(e) => setFormData({ ...formData, personalNumber: e.target.value })}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-field md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiMapPin className="text-green-500" /> Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                  placeholder="Enter your address"
                />
              </div>
            </div>
            
            <div className="form-section-title text-lg font-bold text-green-600 mb-6 pb-3 border-b-2 border-green-100 flex items-center gap-2.5">
              <FiCamera /> Profile Photo
            </div>
            <div className="form-field w-full mb-6">
              <div 
                onClick={() => document.getElementById('profilePhoto').click()}
                className="photo-upload-area border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <FiCamera className="text-3xl text-green-500 mx-auto mb-2" />
                <div className="upload-text text-sm text-gray-600 mb-1">Click to upload profile photo</div>
                <div className="upload-hint text-[11px] text-gray-400">JPG/PNG, max 2MB</div>
              </div>
              <input
                type="file"
                id="profilePhoto"
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <div className="photo-preview flex justify-center mt-3">
                <img 
                  src={getProfilePhotoUrl()} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=2ecc71&color=fff&rounded=true&size=128`;
                  }}
                />
              </div>
            </div>
            
            <div className="form-section-title text-lg font-bold text-green-600 mb-6 pb-3 border-b-2 border-green-100 flex items-center gap-2.5">
              <FiLock /> Change Password
            </div>
            <div className="form-grid grid grid-cols-1 gap-5 mb-6">
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiLock className="text-green-500" /> Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiLock className="text-green-500" /> New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <FiCheckCircle className="text-green-500" /> Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div className="form-field">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={updating}
                  className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {updating ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
            
            <div className="form-actions flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="cancel-btn py-3 px-7 rounded-full font-semibold bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <FiRefreshCw /> Reset
              </button>
              <button
                type="submit"
                disabled={updating}
                className="save-btn py-3 px-8 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? <FiLoader className="animate-spin" /> : <FiSave />}
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Profile Card */}
        <div className="profile-card bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center sticky top-24">
          <div className="profile-avatar-large w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-3 border-green-500 shadow-md">
            <img 
              src={getProfilePhotoUrl()} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=2ecc71&color=fff&rounded=true&size=128`;
              }}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{formData.fullName || employee?.name}</h3>
          <div className="designation text-xs text-gray-500 mb-5">{authUser?.type || 'Employee'}</div>
          
          <div className="info-row flex justify-between py-3 border-b border-gray-200 text-left">
            <span className="info-label text-xs font-semibold text-gray-500 flex items-center gap-1"><FiBriefcase /> Employee ID</span>
            <span className="info-value text-xs font-medium text-gray-800">{employee?.employee_id || '-'}</span>
          </div>
          <div className="info-row flex justify-between py-3 border-b border-gray-200 text-left">
            <span className="info-label text-xs font-semibold text-gray-500 flex items-center gap-1"><FiCalendar /> Joined Date</span>
            <span className="info-value text-xs font-medium text-gray-800">
              {employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="info-row flex justify-between py-3 text-left">
            <span className="info-label text-xs font-semibold text-gray-500 flex items-center gap-1"><FiCheckCircle /> Status</span>
            <span className="info-value text-xs font-medium text-green-500">Active</span>
          </div>
          
          <button
            onClick={() => document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' })}
            className="edit-profile-btn w-full mt-5 py-3 bg-green-500 rounded-full text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 hover:-translate-y-0.5 transition-all"
          >
            <FiEdit2 /> Edit Personal Info
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 bg-white text-gray-800 py-3 px-5 rounded-full text-sm font-medium shadow-lg border-l-4 z-50 flex items-center gap-2 animate-slide-up ${
            toast.type === 'success' ? 'border-green-500' : toast.type === 'error' ? 'border-red-500' : 'border-blue-500'
          }`}
        >
          {toast.type === 'success' ? (
            <FiCheckCircle className="text-green-500" />
          ) : toast.type === 'error' ? (
            <FiAlertCircle className="text-red-500" />
          ) : (
            <FiAlertCircle className="text-blue-500" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Profile;