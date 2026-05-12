const WelcomeBanner = ({ stats, user }) => {
  if (!stats) return null;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="welcome-banner bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-5 md:p-8 mb-6">
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
