import { useAppTheme } from '../../../context/ThemeContext';

const WelcomeBanner = ({ stats, user }) => {
  const { primaryColor, primaryDark } = useAppTheme();
  
  if (!stats) return null;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Helper function to adjust color brightness - MOVE THIS BEFORE USING IT
  const adjustColor = (color, percent) => {
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }
    
    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));
    
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // Create gradient based on primary color - NOW USE adjustColor AFTER it's defined
  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor}, ${primaryDark || adjustColor(primaryColor, -20)})`
  };

  return (
    <div 
      className="welcome-banner rounded-xl p-5 md:p-8 mb-6"
      style={gradientStyle}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="welcome-text">
          <h2 className="text-xl md:text-2xl font-bold text-white">{greeting}, {user?.employee?.name}! 👋</h2>
          <p className="text-green-50 text-sm mt-1">Here's what's happening today.</p>
        </div>
        
        {/* Mobile stats - 3 columns */}
        <div className="welcome-stats flex gap-3 w-full md:hidden">
          <div className="wstat flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
            <div className="text-xl font-bold text-white">{stats.totalEmployees}</div>
            <div className="text-xs text-white/80">Total Staff</div>
          </div>
          <div className="wstat flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
            <div className="text-xl font-bold text-white">{stats.punchedInToday}</div>
            <div className="text-xs text-white/80">Punched In</div>
          </div>
          <div className="wstat flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
            <div className="text-xl font-bold text-white">{stats.absentToday}</div>
            <div className="text-xs text-white/80">Absent</div>
          </div>
        </div>
        
        {/* Desktop stats */}
        <div className="hidden md:flex gap-4">
          <div className="wstat text-center bg-white/15 backdrop-blur-sm px-5 py-2 rounded-xl min-w-[90px]">
            <div className="text-2xl font-bold text-white">{stats.totalEmployees}</div>
            <div className="text-xs text-white/70">Total Staff</div>
          </div>
          <div className="wstat text-center bg-white/15 backdrop-blur-sm px-5 py-2 rounded-xl min-w-[90px]">
            <div className="text-2xl font-bold text-white">{stats.punchedInToday}</div>
            <div className="text-xs text-white/70">Punched In</div>
          </div>
          <div className="wstat text-center bg-white/15 backdrop-blur-sm px-5 py-2 rounded-xl min-w-[90px]">
            <div className="text-2xl font-bold text-white">{stats.absentToday}</div>
            <div className="text-xs text-white/70">Absent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;