import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../../store/slices/authSlice';
import ThemeCustomizer from '../../../components/common/ThemeCustomizer';

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

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
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const wrapper = document.querySelector('.avatar-wrapper');
      if (showProfileMenu && wrapper && !wrapper.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setShowProfileMenu(false);
    navigate("/login");
  };

  return (
    <header className="header bg-[var(--surface)] border-b border-[var(--border)] py-3 px-4 md:px-6 sticky top-0 z-100 flex items-center justify-between flex-wrap gap-3">
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
        
        <ThemeCustomizer />
        
        <div className="avatar-wrapper relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="avatar w-10 h-10 rounded-xl overflow-hidden cursor-pointer shadow-lg"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>

          {showProfileMenu && (
            <div className="profile-menu absolute top-[55px] right-0 w-64 bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden z-999">
              <div className="profile-header flex gap-3 p-4 items-center border-b border-[var(--border)]">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)]">{user?.name || "Employee"}</h4>
                  <p className="text-xs text-[var(--muted)]">{user?.role?.name || "Employee"}</p>
                </div>
              </div>
              <Link
                to="/employee/profile"
                className="menu-item flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] text-[var(--text)] no-underline transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <i className="fas fa-user text-green-500"></i>
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="menu-item flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] text-[var(--text)] w-full text-left transition-colors"
              >
                <i className="fas fa-arrow-right-from-bracket text-green-500"></i>
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