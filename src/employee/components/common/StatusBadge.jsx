const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();

  const styles = {
    pending: 'bg-amber-500/15 text-amber-500',
    approved: 'bg-green-500/15 text-green-600',
    rejected: 'bg-red-500/15 text-red-500',
  };

  const defaultStyle = 'bg-gray-500/15 text-gray-500';

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${
        styles[normalizedStatus] || defaultStyle
      }`}
    >
      {normalizedStatus || 'pending'}
    </span>
  );
};

export default StatusBadge;