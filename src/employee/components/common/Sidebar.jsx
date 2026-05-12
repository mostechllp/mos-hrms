import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { path: "/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    { path: "/leaves", icon: "fas fa-calendar-check", label: "My Leaves" },
    { path: "/wfh", icon: "fas fa-home", label: "WFH Requests" },
    {
      path: "/task-reports",
      icon: "fas fa-clipboard-list",
      label: "Task Reports",
    },
    { path: "/profile", icon: "fas fa-user-circle", label: "My Profile" },
  ];

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
        <Link to="/" className="nav-item" onClick={onClose}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Sign Out</span>
        </Link>

        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-details">
            <h4>{user.name}</h4>
            <p>{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
