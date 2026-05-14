import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { markAsRead, markAllRead } from "../../store/slices/notificationSlice";
import { logoutUser } from "../../store/slices/authSlice";
import { fetchNotifications } from "../../store/slices/notificationSlice";
import ConfirmModal from "./ConfirmModal"; // Import the ConfirmModal component
import ThemeCustomizer from "../../../components/common/ThemeCustomizer";

const Header = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications,
  );

  // Get user's avatar URL
  const getUserAvatar = () => {
    if (avatarError) return null;
    if (user?.avatar) return user.avatar;
    // Generate avatar from name if not available
    const name = getUserName();
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&color=ffffff&background=22c55e`;
  };

  // Get user's display name
  const getUserName = () => {
    if (user?.employee?.name) return user.employee.name;
    if (user?.name) return user.name;
    if (user?.username) return user.username;
    return "HR Admin";
  };

  // Get user's email
  const getUserEmail = () => {
    if (user?.email) return user.email;
    if (user?.username) return user.username;
    return "admin@example.com";
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/admin/dashboard" || path === "/") {
      return "Dashboard";
    } else if (path === "/admin/employees") {
      return "Employees";
    } else if (path === "/admin/organizations") {
      return "Organizations";
    } else if (path === "/admin/organizations/add-company") {
      return "Add Company";
    } else if (path === "/admin/organizations/add-organization") {
      return "Add Organization";
    } else if (path === "/admin/agreements") {
      return "Agreements";
    } else if (path === "/admin/agreements/add-agreement") {
      return "Add Agreement";
    } else if (path === "/admin/attendances") {
      return "Attendance";
    } else if (path === "/admin/leaves/leave-types") {
      return "Add Leave Types";
    } else if (path === "/admin/leaves") {
      return "Leaves";
    } else if (path === "/admin/designations") {
      return "Designations";
    } else if (path === "/admin/departments") {
      return "Departments";
    } else if (path === "/admin/task-reports") {
      return "Task Reports";
    } else if (path === "/admin/wfh") {
      return "WFH Requests";
    } else if (path === "/admin/reports") {
      return "Reports";
    } else if (path === "/admin/settings") {
      return "Settings";
    } else if (path.includes("/admin/role-management")) {
      return "Role Management";
    } else if (path.includes("/admin/payroll/add")) {
      return "Add Payroll";
    } else if (path.includes("/admin/employees/add-employee")) {
      return "Add Employee";
    } else if (path.includes("/admin/employees/onboarding")) {
      return "Onboarding";
    } else if (path.includes("/admin/employees/edit")) {
      return "Edit Employee";
    } else if (path.includes("/admin/employees/")) {
      return "Employee Details";
    } else if (path.includes("/admin/reports/employee-details")) {
      return "Employee Details Report";
    } else if (path.includes("/admin/reports/attendance")) {
      return "Attendance Report";
    } else if (path.includes("/admin/reports/leave-requests")) {
      return "Leave Request Reports";
    } else if (path.includes("/admin/reports/pending-leaves")) {
      return "Pending Leaves";
    } else if (path.includes("/admin/reports/employee-near-expiry")) {
      return "Employee Nearest Expiry";
    } else if (path.includes("/admin/reports/employee-upcoming-renewals")) {
      return "Employee Upcoming Renewals";
    } else if (path.includes("/admin/reports/organization-near-expiry")) {
      return "Company Nearest Expiry";
    } else if (path.includes("/admin/reports/organization-upcoming-renewals")) {
      return "Company Upcoming Renewals";
    } else {
      return "HR Management";
    }
  };

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const handleLogoutClick = () => {
    setShowProfile(false);
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await dispatch(logoutUser()).unwrap();
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-2 md:py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <i className="fas fa-bars text-gray-600 dark:text-gray-300 text-lg"></i>
            </button>

            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">
              <i className="far fa-calendar-alt mr-2"></i>
              <span>{currentDate}</span>
            </div>
            <ThemeCustomizer />

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 md:w-10 md:h-10 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center"
              >
                <i className="fas fa-bell text-gray-600 dark:text-gray-300 text-sm md:text-base"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      Notifications
                    </h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-green-500 hover:text-green-600"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <i className="fas fa-bell-slash text-3xl mb-2 opacity-50"></i>
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                            !notification.read
                              ? "bg-green-50 dark:bg-green-900/20"
                              : ""
                          } hover:bg-gray-50 dark:hover:bg-gray-700`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {notification.title}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <small className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                            {notification.time || "Just now"}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-700/50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                      }}
                      className="text-xs text-green-500 hover:text-green-600"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-transparent hover:ring-green-500 transition-all"
              >
                {getUserAvatar() ? (
                  <img
                    src={getUserAvatar()}
                    alt={getUserName()}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {getUserName().charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showProfile && (
                <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 flex gap-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0">
                      {getUserAvatar() ? (
                        <img
                          src={getUserAvatar()}
                          alt={getUserName()}
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {getUserName().charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {getUserName()}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getUserEmail()}
                      </p>
                    </div>
                  </div>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowProfile(false)}
                  >
                    <i className="fas fa-user text-green-500 w-5"></i>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      My Profile
                    </span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowProfile(false)}
                  >
                    <i className="fas fa-gear text-green-500 w-5"></i>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Settings
                    </span>
                  </NavLink>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <i className="fas fa-arrow-right-from-bracket text-red-500 w-5"></i>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Sign out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message={`Are you sure you want to logout, ${getUserName()}? You will need to login again to access your account.`}
        confirmText="Logout"
        cancelText="Cancel"
        loading={logoutLoading}
      />
    </>
  );
};

export default Header;
