// src/employee/components/common/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../../store/slices/authSlice";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { path: "/employee/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    { path: "/employee/leaves", icon: "fas fa-calendar-check", label: "My Leaves" },
    { path: "/employee/request-leave", icon: "fas fa-plus-circle", label: "Request Leave" },
    { path: "/employee/wfh", icon: "fas fa-home", label: "WFH Requests" },
    { path: "/employee/task-reports", icon: "fas fa-clipboard-list", label: "Task Reports" },
    { path: "/employee/profile", icon: "fas fa-user-circle", label: "My Profile" },
  ];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    onClose();
    navigate("/login");
  };

  return (
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
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item w-full text-left">
          <i className="fas fa-sign-out-alt"></i>
          <span>Sign Out</span>
        </button>

        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || "U"}</div>
          <div className="user-details">
            <h4>{user?.name || "Employee"}</h4>
            <p>{user?.role || "Employee"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;