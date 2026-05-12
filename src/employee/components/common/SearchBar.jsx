import React from 'react';

const SearchBar = ({ value, onChange, placeholder = 'Search records...' }) => {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm">
      <i className="fas fa-search text-gray-400 text-sm"></i>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 w-full"
      />
    </div>
  );
};

export default SearchBar;