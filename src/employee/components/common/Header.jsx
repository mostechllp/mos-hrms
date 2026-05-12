import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTheme } from '../../store/slices/themeSlice';
import { Link } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
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
        
        <div className="theme-toggle flex bg-[var(--surface2)] border border-[var(--border)] rounded-full p-0.5 gap-0.5">
          <button
            onClick={() => dispatch(setTheme('light'))}
            className={`theme-btn w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
              theme === 'light' ? 'bg-[var(--surface)] shadow-md text-green-500' : 'text-[var(--text-secondary)]'
            }`}
          >
            <i className="fas fa-sun"></i>
          </button>
          <button
            onClick={() => dispatch(setTheme('dark'))}
            className={`theme-btn w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
              theme === 'dark' ? 'bg-[var(--surface)] shadow-md text-green-500' : 'text-[var(--text-secondary)]'
            }`}
          >
            <i className="fas fa-moon"></i>
          </button>
        </div>
        
        <div className="avatar-wrapper relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="avatar w-10 h-10 rounded-xl overflow-hidden cursor-pointer shadow-lg"
          >
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          {showProfileMenu && (
            <div className="profile-menu absolute top-[55px] right-0 w-64 bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden z-999">
              <div className="profile-header flex gap-3 p-4 items-center border-b border-[var(--border)]">
                <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)]">{user.name}</h4>
                  <p className="text-xs text-[var(--muted)]">{user.role}</p>
                </div>
              </div>
              <Link to="/profile" className="menu-item flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] text-[var(--text)] no-underline">
                <i className="fas fa-user text-green-500"></i> <span>My Profile</span>
              </Link>
              <Link to="/" className="menu-item flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] text-[var(--text)] no-underline">
                <i className="fas fa-arrow-right-from-bracket text-green-500"></i> <span>Sign out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;