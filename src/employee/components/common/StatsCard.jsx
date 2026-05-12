const StatCard = ({ icon, number, label, color = 'green' }) => {
  const bgColors = {
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    amber: 'bg-amber-500/10 text-amber-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };
  
  const textColors = {
    green: 'text-green-600',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="stat-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className={`stat-icon w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 ${bgColors[color]}`}>
        {icon}
      </div>
      <div className={`stat-number text-3xl font-extrabold leading-tight mb-1 ${textColors[color]}`}>
        {number}
      </div>
      <div className="stat-label text-xs text-[var(--muted)] font-medium">{label}</div>
    </div>
  );
};

export default StatCard;