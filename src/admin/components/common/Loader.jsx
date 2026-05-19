const Loader = ({ size = 'md', fullScreen = false, message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} border-green-500 border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      {spinner}
    </div>
  );
};

export default Loader;
