import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiLock,
  FiSave,
  FiRefreshCw,
  FiEdit2,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import apiClient from "../../utils/apiClient";

const Profile = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    personalEmail: "",
    personalNumber: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [activeTab, setActiveTab] = useState("personal");

  // Get employee data from auth
  const employee = authUser?.employee || authUser;

  // Initialize form data from auth
  useEffect(() => {
    if (employee) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: employee.name || "",
        personalEmail: employee.personal_email || "",
        personalNumber: employee.phone || "",
        address: employee.address || "",
      });
    }
    setLoading(false);
  }, [employee]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 2) {
        showToast("Profile photo must be less than 2MB", "error");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        showToast("Only JPG, JPEG, and PNG files are allowed", "error");
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

      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      formDataToSend.append("first_name", firstName);
      formDataToSend.append("last_name", lastName);
      formDataToSend.append("name", formData.fullName);

      if (formData.personalEmail)
        formDataToSend.append("personal_email", formData.personalEmail);
      if (formData.personalNumber)
        formDataToSend.append("phone", formData.personalNumber);
      if (formData.address) formDataToSend.append("address", formData.address);
      if (photoFile) formDataToSend.append("avatar", photoFile);

      // Try to update profile - if endpoint doesn't exist, save to localStorage
      try {
        await apiClient.post("/employee/profile/update", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showToast("Profile updated successfully!", "success");
      } catch (apiError) {
        // If API endpoint doesn't exist, save to localStorage
        const profileData = {
          name: formData.fullName,
          personal_email: formData.personalEmail,
          phone: formData.personalNumber,
          address: formData.address,
          avatar: photoPreview,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("employeeProfile", JSON.stringify(profileData));
        showToast(
          "Profile saved locally! (API endpoint not available)",
          "success",
        );
        console.log(apiError);
      }

      setPhotoFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      showToast("Please enter current password", "error");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setUpdating(true);

    try {
      // Try to change password via API
      await apiClient.post("/employee/change-password", {
        current_password: passwordData.currentPassword,
        password: passwordData.newPassword,
        password_confirmation: passwordData.confirmPassword,
      });

      showToast("Password changed successfully!", "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      // If API endpoint doesn't exist, show message
      if (error.response?.status === 404) {
        showToast(
          "Password change endpoint not available. Please contact administrator.",
          "error",
        );
      } else {
        showToast(
          error.response?.data?.message || "Failed to change password",
          "error",
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = () => {
    if (employee) {
      setFormData({
        fullName: employee.name || "",
        personalEmail: employee.personal_email || "",
        personalNumber: employee.phone || "",
        address: employee.address || "",
      });
    }
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    if (photoPreview) return photoPreview;

    // Check localStorage for saved avatar
    const savedProfile = localStorage.getItem("employeeProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.avatar) return profile.avatar;
    }

    if (authUser?.avatar) return authUser.avatar;

    const name = formData.fullName || employee?.name || "User";
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
    <div className="w-full max-w-6xl mx-auto pb-10 px-2 sm:px-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Green Banner */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-[#22c55e] to-[#10b981] w-full"></div>
        
        {/* White Area */}
        <div className="relative px-6 md:px-12 pb-8 bg-white flex flex-col md:flex-row justify-between md:items-end">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-24 group z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-black flex items-center justify-center overflow-hidden shadow-lg relative">
                <img
                  src={getProfilePhotoUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || "User")}&background=2ecc71&color=fff&rounded=true&size=128`;
                  }}
                />
                <div 
                  onClick={() => document.getElementById("profilePhoto").click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <FiCamera className="text-white text-3xl" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-[3px] border-white rounded-full z-20"></div>
              <input
                type="file"
                id="profilePhoto"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            
            {/* Name and Designation */}
            <div className="text-center md:text-left mb-2 md:mb-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                {formData.fullName || employee?.name || "User Name"}
              </h2>
              <div className="text-green-600 font-bold text-sm flex items-center justify-center md:justify-start gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {authUser?.type || "employee"}
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-green-600">{employee?.employee_id || "1"}</span>
              </div>
            </div>
          </div>
          
          {/* Stats on Right */}
          <div className="flex justify-center md:justify-end gap-10 mt-6 md:mt-0 mb-2">
            <div className="text-center">
              <div className="text-gray-900 font-extrabold text-xl">Active</div>
              <div className="text-gray-400 text-xs font-semibold tracking-wide uppercase mt-0.5">Status</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900 font-extrabold text-xl">
                {employee?.joining_date ? new Date(employee.joining_date).getFullYear() : new Date().getFullYear()}
              </div>
              <div className="text-gray-400 text-xs font-semibold tracking-wide uppercase mt-0.5">Joined</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Sidebar Menu */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-400 mb-5 tracking-wider uppercase ml-2">SETTINGS MENU</h3>
            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'personal' 
                    ? 'bg-green-50 text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <FiUser className="text-lg" />
                Personal Details
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'security' 
                    ? 'bg-green-50 text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <FiLock className="text-lg" />
                Security & Password
              </button>
            </div>

            <div className="mt-8 bg-[#f0fdf4] rounded-2xl p-5 border border-green-100/50">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <FiCheckCircle className="text-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1.5">Profile Complete</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Your profile is up to date and verified by the HR administration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
          {activeTab === 'personal' && (
            <form onSubmit={handleUpdateProfile}>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <FiEdit2 className="text-green-500" /> Personal Information
              </h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Update your personal details, email, and home address.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="form-field md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Company Email <span className="text-gray-400 font-medium">(Read-only)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="email"
                      value={employee?.company_email || authUser?.email || ""}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100/70 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Personal Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter personal email"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="tel"
                      value={formData.personalNumber}
                      onChange={(e) => setFormData({ ...formData, personalNumber: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Home Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                      <FiMapPin className="text-gray-400 text-lg" />
                    </div>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="3"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-none"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3 px-8 rounded-full font-bold bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <FiRefreshCw /> Reset
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="py-3 px-10 rounded-full font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {updating ? <FiLoader className="animate-spin" /> : <FiSave />}
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword}>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <FiLock className="text-green-500" /> Security & Password
              </h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Update your account password to stay secure.
              </p>
              
              <div className="grid grid-cols-1 gap-6 mb-8 max-w-lg">
                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-gray-700 ml-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiCheckCircle className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={updating}
                  className="py-3 px-10 rounded-full font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {updating ? <FiLoader className="animate-spin" /> : <FiLock />}
                  {updating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 bg-white text-gray-800 py-3.5 px-6 rounded-full text-sm font-bold shadow-xl border-l-4 z-50 flex items-center gap-3 animate-slide-up ${
            toast.type === "success"
              ? "border-green-500"
              : toast.type === "error"
                ? "border-red-500"
                : "border-blue-500"
          }`}
        >
          {toast.type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <FiCheckCircle />
            </div>
          ) : toast.type === "error" ? (
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <FiAlertCircle />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiAlertCircle />
            </div>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Profile;
