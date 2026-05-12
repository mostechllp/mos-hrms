import React from 'react';

const EntriesSelector = ({ value, onChange, options = [5, 10, 25, 50] }) => {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-sm shadow-sm">
      <span className="text-gray-500 dark:text-gray-400">Show entries</span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="bg-transparent border-none outline-none font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default EntriesSelector;