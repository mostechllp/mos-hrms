import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../components/common/Toast";
import {
  updateProfile,
  changePassword,
  clearUpdateSuccess,
  fetchUserProfile,
} from "../store/slices/settingsSlice";
import apiClient from "../../utils/apiClient";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading, updateSuccess, error } = useSelector(
    (state) => state.settings,
  );
  const fileInputRef = useRef(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarTempPath, setAvatarTempPath] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    console.log("=== getAvatarUrl called ===");
    console.log("avatarPreview:", avatarPreview);
    console.log("avatarError:", avatarError);
    
    if (avatarPreview) {
      console.log("Returning avatarPreview:", avatarPreview.substring(0, 100));
      return avatarPreview;
    }
    if (avatarError) {
      console.log("Avatar error, returning null");
      return null;
    }
    
    const avatar = user?.avatar || profile?.avatar;
    console.log("Avatar from user/profile:", avatar);
    
    if (!avatar) {
      console.log("No avatar found");
      return null;
    }
    
    // If it's already a full URL, return it
    if (typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
      console.log("Avatar is full URL, returning:", avatar);
      return avatar;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin;
    console.log("Base URL for storage:", baseUrl);
    
    if (typeof avatar === "object" && avatar.path) {
      const fullUrl = `${baseUrl}/storage/${avatar.path}`;
      console.log("Avatar object with path, constructed URL:", fullUrl);
      return fullUrl;
    }
    
    if (typeof avatar === "string") {
      let fullUrl;
      if (avatar.startsWith("/storage/")) {
        fullUrl = `${baseUrl}${avatar}`;
      } else if (avatar.startsWith("storage/")) {
        fullUrl = `${baseUrl}/${avatar}`;
      } else {
        fullUrl = `${baseUrl}/storage/${avatar}`;
      }
      console.log("Avatar string path, constructed URL:", fullUrl);
      return fullUrl;
    }
    
    console.log("No valid avatar found");
    return null;
  };

  // Fetch user profile on component mount
  useEffect(() => {
    console.log("=== Component Mount: Fetching user profile ===");
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Set profile data when user changes
  useEffect(() => {
    if (user) {
      console.log("=== User state updated ===");
      console.log("User data:", user);
      console.log("User avatar:", user?.avatar);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        username: user?.username || "",
      });
    }
  }, [user]);

  // Handle update success
  useEffect(() => {
    if (updateSuccess) {
      console.log("=== Update success, refreshing profile ===");
      showToast("Profile updated successfully!", "success");
      dispatch(clearUpdateSuccess());
      dispatch(fetchUserProfile());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvatarFile(null);
      setAvatarTempPath(null);
      setAvatarError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [updateSuccess, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("=== Error from Redux ===", error);
      showToast(error, "error");
      dispatch(clearUpdateSuccess());
    }
  }, [error, dispatch]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Avatar upload handler with detailed logging
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    console.log("=== Avatar Upload Started ===");
    console.log("Selected file:", file);
    console.log("File name:", file?.name);
    console.log("File type:", file?.type);
    console.log("File size:", file?.size, "bytes", `(${(file?.size / 1024).toFixed(2)} KB)`);
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type);
      showToast("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      console.log("File too large:", file.size, "bytes (max 2MB)");
      showToast("Image size must be less than 2MB", "error");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Preview created successfully");
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    console.log("Starting upload to temp endpoint...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Sending request to: /admin/employees/upload-temp");
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      const response = await apiClient.post("/admin/employees/upload-temp", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("=== Temp Upload Response ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      
      const result = response.data;
      if (result.status && result.path) {
        console.log("Temp upload successful!");
        console.log("Temp path received:", result.path);
        console.log("Full temp path would be:", `${import.meta.env.VITE_API_URL?.replace("/api", "")}/storage/${result.path}`);
        setAvatarTempPath(result.path);
        setAvatarFile(file);
        showToast("Avatar uploaded successfully", "success");
      } else {
        console.error("Temp upload failed - invalid response structure:", result);
        showToast("Failed to upload avatar", "error");
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("=== Temp Upload Error ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      showToast(`Upload failed: ${error.message}`, "error");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      console.log("Upload process completed");
    }
  };

  const handleRemoveAvatar = () => {
    console.log("=== Removing selected avatar ===");
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarTempPath(null);
    setAvatarError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    console.log("=== Profile Update Started ===");
    console.log("Profile data to update:", profileData);
    console.log("Avatar temp path:", avatarTempPath);
    console.log("Has avatar file:", !!avatarFile);
    console.log("Has avatar preview:", !!avatarPreview);

    if (!profileData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    if (!profileData.email.trim()) {
      showToast("Email is required", "error");
      return;
    }

    if (!profileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setProfileLoading(true);

    const formData = new FormData();
    formData.append("name", profileData.name.trim());
    formData.append("email", profileData.email.trim());

    if (profileData.username && profileData.username.trim()) {
      formData.append("username", profileData.username.trim());
    }

    if (avatarTempPath) {
      console.log("Adding avatar temp path to FormData:", avatarTempPath);
      formData.append("avatar", avatarTempPath);
    } else {
      console.log("No avatar temp path to send");
    }

    console.log("Sending request to: /employee/update-profile");
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }

    const result = await dispatch(updateProfile(formData));
    
    console.log("=== Profile Update Result ===");
    console.log("Result type:", result.type);
    console.log("Result status:", result.meta?.requestStatus);
    console.log("Result payload:", result.payload);
    
    if (updateProfile.fulfilled.match(result)) {
      console.log("Profile update successful!");
      console.log("Updated user data:", result.payload);
    } else {
      console.error("Profile update failed:", result.payload);
    }
    
    setProfileLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.current_password) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (!passwordData.password) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (passwordData.password.length < 6) {
      showToast("New password must be at least 6 characters long", "error");
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      showToast("New passwords do not match", "error");
      return;
    }

    setPasswordLoading(true);

    const result = await dispatch(
      changePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      }),
    );

    if (changePassword.fulfilled.match(result)) {
      showToast("Password changed successfully!", "success");
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    }

    setPasswordLoading(false);
  };

  const avatarUrl = getAvatarUrl();
  const userInitials = (profileData.name || "U").charAt(0).toUpperCase();

  // Log current avatar state on each render
  console.log("=== Component Render ===");
  console.log("Current user from auth:", user);
  console.log("Current profile from settings:", profile);
  console.log("avatarUrl computed:", avatarUrl);
  console.log("avatarTempPath:", avatarTempPath);
  console.log("avatarPreview exists:", !!avatarPreview);
  console.log("uploadingAvatar:", uploadingAvatar);

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
          Account Settings
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your profile information and security preferences
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column - Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-soft">
          <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-user text-green-600 dark:text-green-400 text-base md:text-xl"></i>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
              Profile Information
            </h3>
          </div>

          {/* Avatar Section */}
          <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start gap-4">
            <div className="relative">
              {avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-500 shadow-md"
                  onError={() => {
                    console.log("=== Avatar Image Load Error ===");
                    console.log("Failed to load avatar URL:", avatarUrl);
                    setAvatarError(true);
                  }}
                  onLoad={() => {
                    console.log("=== Avatar Image Loaded Successfully ===");
                    console.log("Loaded avatar URL:", avatarUrl);
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {userInitials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full shadow-md hover:bg-green-600 transition-colors disabled:opacity-50"
                title="Change avatar"
              >
                {uploadingAvatar ? (
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                ) : (
                  <i className="fas fa-camera text-xs"></i>
                )}
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <i className="fas fa-info-circle text-green-500 mr-1"></i>
                Supported formats: JPEG, PNG, GIF, WEBP (Max 2MB)
              </div>
              {(avatarPreview || avatarTempPath) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Remove selected image
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <i className="fas fa-user text-green-500 mr-1"></i>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <i className="fas fa-envelope text-green-500 mr-1"></i>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter your email address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <i className="fas fa-at text-green-500 mr-1"></i>
                Username{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter a unique username"
              />
              <p className="text-xs text-gray-400 mt-1">
                <i className="fas fa-info-circle mr-1"></i>
                Username is optional. If left blank, email will be used as
                username.
              </p>
            </div>

            <button
              type="submit"
              disabled={profileLoading || loading}
              className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
            >
              {profileLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>{" "}
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save text-xs md:text-sm"></i>{" "}
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Right Column - Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-soft">
          <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-lock text-green-600 dark:text-green-400 text-base md:text-xl"></i>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
              Change Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="mb-3 md:mb-4">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
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
                  <i
                    className={`fas ${showCurrentPassword ? "fa-eye" : "fa-eye-slash"} text-xs md:text-sm`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="mb-3 md:mb-4">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
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
                  <i
                    className={`fas ${showNewPassword ? "fa-eye" : "fa-eye-slash"} text-xs md:text-sm`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
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
                  <i
                    className={`fas ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"} text-xs md:text-sm`}
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading || loading}
              className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
            >
              {passwordLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>{" "}
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-key text-xs md:text-sm"></i>{" "}
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <i className="fas fa-info-circle text-green-500"></i>
              <span>
                Password must be at least 6 characters long and should not be
                easily guessable.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;