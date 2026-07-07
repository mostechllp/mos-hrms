// src/admin/components/common/CountrySelect.jsx

import { useState, useRef, useEffect } from "react";
import { countries, getCountryFlag } from "../../utils/countries";

const CountrySelect = ({ value, onChange, placeholder = "Select Country", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = countries.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (countryCode) => {
    onChange(countryCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer flex items-center justify-between bg-white dark:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCountry ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
          {selectedCountry ? (
            <>
              <span className="mr-2">{getCountryFlag(selectedCountry.code)}</span>
              {selectedCountry.name}
            </>
          ) : (
            placeholder
          )}
        </span>
        <i className={`fas fa-chevron-down text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}></i>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className={`px-4 py-2 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2 transition-colors ${
                    value === country.code ? "bg-green-50 dark:bg-green-900/30" : ""
                  }`}
                >
                  <span className="text-lg">{getCountryFlag(country.code)}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{country.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
                  {value === country.code && (
                    <i className="fas fa-check text-green-500 ml-1"></i>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;