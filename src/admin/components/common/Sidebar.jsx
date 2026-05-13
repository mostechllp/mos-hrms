import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  console.log("user: ", user)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsOpen]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile, setIsOpen]);

  const navItems = [
    { path: "/admin/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    { path: "/admin/employees", icon: "fas fa-users", label: "Employees" },
    {
      path: "/admin/employees/onboarding",
      icon: "fas fa-user-plus",
      label: "Onboarding",
    },

    {
      path: "/admin/organizations",
      icon: "fas fa-briefcase",
      label: "Organizations",
    },
    { path: "/admin/agreements", icon: "fas fa-file-signature", label: "Agreements" },
    { path: "/admin/attendances", icon: "fas fa-fingerprint", label: "Attendance" },
    { path: "/admin/leaves", icon: "fas fa-calendar-check", label: "Leaves" },
    { path: "/admin/payroll/add", icon: "fas fa-money-bill-wave", label: "Payroll" },
    { path: "/admin/designations", icon: "fas fa-tags", label: "Designations" },
    { path: "/admin/departments", icon: "fas fa-building", label: "Departments" },
    { path: "/admin/task-reports", icon: "fas fa-tasks", label: "Task Reports" },
    { path: "/admin/wfh", icon: "fas fa-home", label: "WFH Requests" },
    { path: "/admin/reports", icon: "fas fa-chart-line", label: "Reports" },
    {
      path: "/admin/role-management",
      icon: "fas fa-user-shield",
      label: "Roles",
    },
    { path: "/admin/settings", icon: "fas fa-gear", label: "Settings" },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Get user's display name
  const getUserName = () => {
    if (user?.employee?.name) return user.employee.name;
    if (user?.name) return user.name;
    if (user?.username) return user.username;
    return "HR Admin";
  };

  // Get user's avatar URL
  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar;
    // Generate avatar from name if not available
    const name = getUserName();
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&color=ffffff&background=22c55e`;
  };

  // Get user's role
  const getUserRole = () => {
    if (user?.type) return user.type.charAt(0).toUpperCase() + user.type.slice(1);
    if (user?.role) return user.role;
    if (user?.roles && user.roles.length > 0) return user.roles[0];
    return "Administrator";
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 z-50 transition-all duration-300
          flex flex-col
          ${isMobile
            ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-64`
            : "w-[72px] hover:w-64 group"
          }
        `}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        {/* Logo Section - Fixed at top */}
        <div className="flex-shrink-0 py-5 px-4 border-b border-white/10 flex justify-center items-center">
          <img
            src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
            alt="HMR Logo"
            className={`object-contain rounded-lg bg-white p-1 transition-all duration-300 ${!isMobile && !isOpen ? "w-10 h-10" : "w-12 h-12"
              }`}
          />
        </div>

        {/* Navigation Section - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/employees" || item.path === "/admin/dashboard"}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden ${isActive
                  ? "bg-green-500/20 text-white border-l-4 border-green-500"
                  : "text-gray-400 hover:text-white hover:bg-white/10 border-l-4 border-transparent"
                }`
              }
            >
              <i className={item.icon + " w-6 text-lg flex-shrink-0"}></i>


              <span
                className={`transition-opacity duration-200 ${!isMobile && !isOpen
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-100"
                  }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}




        </nav>


        {/* User Section - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Avatar Image */}
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600">
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = getUserName().charAt(0).toUpperCase();
                  e.target.parentElement.classList.add("flex", "items-center", "justify-center", "font-bold", "text-white");
                }}
              />
            </div>
            <div
              className={`transition-opacity duration-200 flex-1 min-w-0 ${!isMobile && !isOpen
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100"
                }`}
            >
              <h4 className="text-sm font-semibold text-white truncate">
                {getUserName()}
              </h4>
              <p className="text-xs text-white/50 truncate">
                {getUserRole()}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors flex items-center gap-1"
              >
                <i className="fas fa-sign-out-alt text-[10px]"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;