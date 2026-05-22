import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../components/common/Toast";
import { changePassword } from "../../store/slices/settingsSlice";

const SecurityTab = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.settings);
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <i className="fas fa-lock text-green-600 dark:text-green-400 text-base md:text-xl"></i>
          </div>
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
            Change Password
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-key text-green-500 mr-2"></i>
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all pr-12"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className={`fas ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"} text-base`}></i>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ">
              <i className="fas fa-lock text-green-500 mr-2"></i>
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all pr-12"
                placeholder="Enter new password (min. 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"} text-base`}></i>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all pr-12"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-base`}></i>
              </button>
            </div>
          </div>

          {/* Password Requirements Card */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-start justify-center gap-3">
              <div className="">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ">
                  Password Requirements:
                </p>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-center justify-center gap-2">
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
                    <span>Minimum 6 characters long</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
                    <span>Should not be easily guessable</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <i className="fas fa-check-circle text-green-500 text-xs"></i>
                    <span>Use a combination of letters, numbers, and special characters</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Update Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={passwordLoading || loading}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70 min-w-[160px]"
            >
              {passwordLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> <span>Updating...</span></>
              ) : (
                <><i className="fas fa-key text-sm"></i> <span>Update Password</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityTab;