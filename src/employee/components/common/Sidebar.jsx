import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";


const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  console.log("User: ", user)
  const navItems = [
    { path: "/employee/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    { path: "/employee/leaves", icon: "fas fa-calendar-check", label: "My Leaves" },
    // { path: "/employee/wfh", icon: "fas fa-home", label: "WFH Requests" },
    { path: "/employee/tasks", icon: "fas fa-tasks", label: "Task Reports" },
    {
      path: "/employee/task-reports",
      icon: "fas fa-clipboard-list",
      label: "Task Reports",
    },
    { path: "/employee/profile", icon: "fas fa-user-circle", label: "My Profile" },
  ];

  const isMyRequestsActive = location.pathname === "/employee/attendance-requests";

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img
            src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
            alt="HMR Logo"
            className="logo-img"
          />
        </div>

        <nav>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Attendance Requests Section */}
          <div className="nav-section">
            {/* My Requests - Main Menu Item that navigates to the page */}
            <Link
              to="/employee/attendance-requests"
              onClick={onClose}
              className={`nav-item ${isMyRequestsActive ? "active" : ""}`}
            >
              <i className="fas fa-clock"></i>
              <span>Requests</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;