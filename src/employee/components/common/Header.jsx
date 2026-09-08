import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../../context/ThemeContext';
import { logoutUser } from '../../../store/slices/authSlice';
import { markNotificationAsRead, markAllNotificationsAsRead, fetchNotifications } from '../../../admin/store/slices/notificationSlice';

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { themeMode, setThemeMode } = useAppTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setShowProfileMenu(false);
    navigate("/login");
  };

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const getNotificationUI = (notif) => {
    const title = (notif.title || notif.type || "Notification").toLowerCase();
    
    if (title.includes("probation") || title.includes("alert")) {
      return {
        type: notif.title || "Probation Alert",
        typeColor: "text-[#7B61FF] bg-[#F4F0FF]",
        icon: "fas fa-clock",
        iconColor: "text-[#F2994A]",
      };
    } else if (title.includes("document") || title.includes("expiry")) {
      return {
        type: notif.title || "Document Expiry",
        typeColor: "text-[#F2994A] bg-[#FFF6ED]",
        icon: "fas fa-file-alt",
        iconColor: "text-[#F2994A]",
      };
    } else if (title.includes("leave")) {
      return {
        type: "leave_request",
        alertType: notif.title || "Leave Request",
        typeColor: "text-green-500 bg-green-50",
        icon: "fas fa-calendar-alt",
        iconColor: "text-green-500",
      };
    }
    
    return {
      type: notif.title || "Notification",
      typeColor: "text-gray-700 bg-gray-100",
      icon: "fas fa-bell",
      iconColor: "text-gray-500",
    };
  };

  const displayNotifications = (notifications || []).slice(0, 5);

  return (
    <header className="header bg-[var(--surface)] border-b border-[var(--border)] py-3 px-4 md:px-6 sticky top-0 z-40 flex items-center justify-between flex-wrap gap-3">
      <div className="header-left flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="menu-btn md:hidden bg-none border-none text-xl text-[var(--text)] cursor-pointer"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="header-title">
          <h1 className="text-lg font-bold text-[var(--text)]">Employee Portal</h1>
          <p className="text-[11px] text-[var(--muted)]">Welcome back</p>
        </div>
      </div>
      
      <div className="header-right flex items-center gap-3 flex-wrap">
        <div className="date-badge hidden md:flex items-center gap-2 bg-[var(--surface2)] border border-[var(--border)] px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)]">
          <i className="far fa-calendar-alt"></i> {currentDate}
        </div>
        
        <div className="theme-toggle flex bg-[var(--surface2)] border border-[var(--border)] rounded-full p-0.5 gap-0.5">
          <button
            onClick={() => setThemeMode('light')}
            className={`theme-btn w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
              themeMode === 'light' ? 'bg-[var(--surface)] shadow-md text-green-500' : 'text-[var(--text-secondary)]'
            }`}
          >
            <i className="fas fa-sun"></i>
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`theme-btn w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
              themeMode === 'dark' ? 'bg-[var(--surface)] shadow-md text-green-500' : 'text-[var(--text-secondary)]'
            }`}
          >
            <i className="fas fa-moon"></i>
          </button>
        </div>
        
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 md:w-10 md:h-10 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-bell text-gray-600 dark:text-gray-300 text-sm md:text-base"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF5A5F] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center border-2 border-white dark:border-gray-800">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-[420px] bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] z-50 overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
                <div className="flex items-center gap-2">
                  <i className="fas fa-bell text-green-500 text-lg"></i>
                  <h3 className="font-bold text-[var(--text)] text-lg">
                    Notifications
                  </h3>
                  <span className="bg-[#FF5A5F] text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
                    {unreadCount} unread
                  </span>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm font-medium text-green-500 hover:text-green-600"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto bg-[var(--surface)]">
                {displayNotifications.length === 0 ? (
                  <div className="p-8 text-center text-[var(--muted)]">
                    <i className="fas fa-bell-slash text-3xl mb-2 opacity-50"></i>
                    <p>No notifications</p>
                  </div>
                ) : (
                  displayNotifications.map((notification) => {
                    const ui = getNotificationUI(notification);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-[var(--border)] cursor-pointer transition-colors ${
                          !notification.read
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-[var(--surface)]"
                        } hover:bg-[var(--surface2)] flex gap-3`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="mt-0.5">
                          <i className={`${ui.icon} ${ui.iconColor} text-base`}></i>
                        </div>
                        <div className="flex-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2 ${ui.typeColor}`}>
                            {ui.type}
                          </span>
                          <p className="text-[14px] leading-relaxed text-[var(--text)]">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-[var(--muted)]">
                              {notification.time || notification.created_at || "Just now"}
                            </span>
                            {!notification.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 bg-[var(--surface)] text-center rounded-b-2xl border-t border-[var(--border)]">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/employee/notifications");
                  }}
                  className="text-sm font-bold text-green-500 hover:text-green-600"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Fixed dropdown wrapper */}
        <div className="avatar-wrapper relative" ref={menuRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="avatar w-10 h-10 rounded-xl overflow-hidden cursor-pointer shadow-lg"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold">
                {user?.employee?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          {showProfileMenu && (
            <div className="profile-menu absolute top-[calc(100%+8px)] right-0 w-64 bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--border)] overflow-visible z-[9999]">
              <div className="profile-header flex gap-3 p-4 items-center border-b border-[var(--border)]">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                    {user?.employee?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)]">{user?.employee?.name || user?.name || "Employee"}</h4>
                  <p className="text-xs text-[var(--muted)]">Employee</p>
                </div>
              </div>
              <Link 
                to="/employee/profile" 
                className="menu-item flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] text-[var(--text)] no-underline transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <i className="fas fa-user text-green-500 w-5"></i> 
                <span>My Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="menu-item flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] text-[var(--text)] w-full text-left transition-colors cursor-pointer"
              >
                <i className="fas fa-arrow-right-from-bracket text-green-500 w-5"></i> 
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;