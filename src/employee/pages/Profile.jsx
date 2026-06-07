import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { fetchUserProfile, updateProfile, clearUpdateSuccess } from "../../admin/store/slices/settingsSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { profile, loading: profileLoading, updateSuccess, error } = useSelector((state) => state.settings);
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarTempPath, setAvatarTempPath] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    personalNumber: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("personal");

  // Get employee data from auth
  const employee = authUser?.employee || authUser;

  // Get avatar URL
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (avatarError) return null;
    
    const avatar = authUser?.avatar || profile?.avatar;
    if (!avatar) return null;
    
    if (typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
      return avatar;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin;
    
    if (typeof avatar === "object" && avatar.path) {
      return `${baseUrl}/storage/${avatar.path}`;
    }
    
    if (typeof avatar === "string") {
      if (avatar.startsWith("/storage/")) return `${baseUrl}${avatar}`;
      if (avatar.startsWith("storage/")) return `${baseUrl}/${avatar}`;
      return `${baseUrl}/storage/${avatar}`;
    }
    
    return null;
  };

  // Helper function to parse full name into first and last name
  const parseFullName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    
    const trimmedName = fullName.trim();
    const firstSpaceIndex = trimmedName.indexOf(" ");
    
    if (firstSpaceIndex > 0) {
      return {
        firstName: trimmedName.substring(0, firstSpaceIndex),
        lastName: trimmedName.substring(firstSpaceIndex + 1)
      };
    }
    
    return {
      firstName: trimmedName,
      lastName: ""
    };
  };

  // Fetch user profile on mount
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Initialize form data from auth
  useEffect(() => {
    if (authUser) {
      let firstName = authUser.first_name || "";
      let lastName = authUser.last_name || "";
      
      if (!firstName && !lastName && authUser.name) {
        const parsed = parseFullName(authUser.name);
        firstName = parsed.firstName;
        lastName = parsed.lastName;
      }
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        personalEmail: authUser.personal_email || "",
        personalNumber: authUser.personal_number || authUser.phone || "",
        address: authUser.address || "",
      });
    }
  }, [authUser]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle update success
  useEffect(() => {
    if (updateSuccess) {
      showToast("Profile updated successfully!", "success");
      dispatch(clearUpdateSuccess());
      dispatch(fetchUserProfile());
      setAvatarPreview(null);
      setAvatarTempPath(null);
      setAvatarError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearUpdateSuccess());
    }
  }, [error, dispatch]);

  // Handle avatar upload to temp endpoint first
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size must be less than 2MB", "error");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to temp endpoint
    setUploadingAvatar(true);
    try {
      const tempFormData = new FormData();
      tempFormData.append("file", file);

      const tempResponse = await apiClient.post("/admin/employees/upload-temp", tempFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = tempResponse.data;
      if (result.status && result.path) {
        setAvatarTempPath(result.path);
        showToast("Photo uploaded successfully", "success");
      } else {
        showToast("Failed to upload photo", "error");
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      showToast(`Upload failed: ${error.message}`, "error");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarTempPath(null);
    setAvatarError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formDataToSend = new FormData();

    formDataToSend.append("first_name", formData.firstName.trim());
    formDataToSend.append("last_name", formData.lastName.trim());
    
    if (formData.personalEmail) {
      formDataToSend.append("personal_email", formData.personalEmail);
    }
    if (formData.personalNumber) {
      formDataToSend.append("personal_number", formData.personalNumber);
    }
    if (formData.address) {
      formDataToSend.append("address", formData.address);
    }
    
    // Send the temp path for avatar if uploaded
    if (avatarTempPath) {
      formDataToSend.append("avatar", avatarTempPath);
    }

    await dispatch(updateProfile(formDataToSend));
    setUpdating(false);
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
      const response = await apiClient.post("/employee/change-password", {
        current_password: passwordData.currentPassword,
        password: passwordData.newPassword,
        password_confirmation: passwordData.confirmPassword,
      });

      if (response.data && response.data.status === "success") {
        showToast("Password changed successfully!", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showToast(response.data?.message || "Failed to change password", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      
      let errorMessage = "Failed to change password";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat()[0];
      }
      
      showToast(errorMessage, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = () => {
    if (authUser) {
      let firstName = authUser.first_name || "";
      let lastName = authUser.last_name || "";
      
      if (!firstName && !lastName && authUser.name) {
        const parsed = parseFullName(authUser.name);
        firstName = parsed.firstName;
        lastName = parsed.lastName;
      }
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        personalEmail: authUser.personal_email || "",
        personalNumber: authUser.personal_number || authUser.phone || "",
        address: authUser.address || "",
      });
    }
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setAvatarPreview(null);
    setAvatarTempPath(null);
  };

  // Get full name for display
  const getFullName = () => {
    if (formData.firstName || formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`.trim();
    }
    return authUser?.name || "User Name";
  };

  const avatarUrl = getAvatarUrl();
  const userInitials = getFullName().charAt(0).toUpperCase();

  if (profileLoading && !authUser) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 px-2 sm:px-4">
      {/* Top Header Card */}
      <div className="bg-[var(--surface)] rounded-3xl shadow-sm border border-[var(--border)] overflow-hidden mb-6">
        {/* Green Banner */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-[#22c55e] to-[#10b981] w-full"></div>

        {/* White Area */}
        <div className="relative px-6 md:px-12 pb-8 bg-[var(--surface)] flex flex-col md:flex-row justify-between md:items-end">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-24 group z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-black flex items-center justify-center overflow-hidden shadow-lg relative">
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-5xl font-bold">
                    {userInitials}
                  </div>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <FiLoader className="text-white text-3xl animate-spin" />
                  ) : (
                    <FiCamera className="text-white text-3xl" />
                  )}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-[3px] border-white rounded-full z-20"></div>
              <input
                ref={fileInputRef}
                type="file"
                id="profilePhoto"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>

            {/* Name and Designation */}
            <div className="text-center md:text-left mb-2 md:mb-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                {getFullName()}
              </h2>
              <div className="text-green-600 font-bold text-sm flex items-center justify-center md:justify-start gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {authUser?.type || "employee"}
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-green-600">
                  {employee?.employee_id || authUser?.employee_id || "1"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats on Right */}
          <div className="flex justify-center md:justify-end gap-10 mt-6 md:mt-0 mb-2">
            <div className="text-center">
              <div className="text-[var(--text)] font-extrabold text-xl">Active</div>
              <div className="text-gray-400 text-xs font-semibold tracking-wide uppercase mt-0.5">Status</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900 dark:text-gray-200 font-extrabold text-xl">
                {employee?.joining_date
                  ? new Date(employee.joining_date).getFullYear()
                  : new Date().getFullYear()}
              </div>
              <div className="text-gray-400 text-xs font-semibold tracking-wide uppercase mt-0.5">Joined</div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar remove button - only show if preview exists */}
      {(avatarPreview || avatarTempPath) && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <i className="fas fa-trash"></i> Remove uploaded photo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--surface)] rounded-3xl shadow-sm border border-[var(--border)] p-6">
            <h3 className="text-xs font-bold text-[var(--muted)] mb-5 tracking-wider uppercase ml-2">
              SETTINGS MENU
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "personal"
                    ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                }`}
              >
                <FiUser className="text-lg" /> Personal Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === "security"
                    ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                }`}
              >
                <FiLock className="text-lg" /> Security & Password
              </button>
            </div>

            <div className="mt-8 bg-[var(--surface2)] rounded-2xl p-5 border border-[var(--border)]">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--muted)]">
                  <FiCheckCircle className="text-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text)] text-sm mb-1.5">Profile Complete</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    Your profile is up to date and verified by the HR administration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="bg-[var(--surface)] rounded-3xl shadow-sm border border-[var(--border)] p-6 md:p-10">
          {activeTab === "personal" && (
            <form onSubmit={handleUpdateProfile}>
              <h3 className="text-xl font-bold text-[var(--text)] flex items-center gap-2 mb-2">
                <FiEdit2 className="text-green-500" /> Personal Information
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">
                Update your personal details, email, and home address.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Company Email{" "}
                    <span className="text-gray-400 font-medium">(Read-only)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="email"
                      value={authUser?.email || ""}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)]/70 border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--muted)] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Personal Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, personalEmail: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter personal email"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="tel"
                      value={formData.personalNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, personalNumber: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Home Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                      <FiMapPin className="text-gray-400 text-lg" />
                    </div>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows="3"
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-none"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3 px-8 rounded-full font-bold bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)] transition-all flex items-center justify-center gap-2"
                >
                  <FiRefreshCw /> Reset
                </button>
                <button
                  type="submit"
                  disabled={updating || profileLoading}
                  className="py-3 px-10 rounded-full font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <FiLoader className="animate-spin" /> : <FiSave />}
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword}>
              <h3 className="text-xl font-bold text-[var(--text)] flex items-center gap-2 mb-2">
                <FiLock className="text-green-500" /> Security & Password
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">
                Update your account password to stay secure.
              </p>

              <div className="grid grid-cols-1 gap-6 mb-8 max-w-lg">
                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                </div>

                <div className="form-field flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] ml-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiCheckCircle className="text-gray-400 text-lg" />
                    </div>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border)]">
                <button
                  type="submit"
                  disabled={updating}
                  className="py-3 px-10 rounded-full font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
          className={`fixed bottom-6 right-6 bg-[var(--surface)] text-[var(--text)] py-3.5 px-6 rounded-full text-sm font-bold shadow-xl border-l-4 z-50 flex items-center gap-3 animate-slide-up ${
            toast.type === "success"
              ? "border-green-500"
              : toast.type === "error"
              ? "border-red-500"
              : "border-yellow-500"
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
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
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