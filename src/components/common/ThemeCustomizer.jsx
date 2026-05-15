import { useState, useRef, useEffect } from "react";
import { useAppTheme } from "../../context/ThemeContext";

const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    primaryColor,
    fontSizeValue,
    themeMode,
    setThemeMode,
    handleColorChange,
    handleFontSizeChange,
    resetToDefaults,
  } = useAppTheme();

  const [showColorPicker, setShowColorPicker] = useState(false);

  // Predefined color schemes
  const colorSchemes = [
    { name: "Green", value: "green", hex: "#2ecc71" },
    { name: "Blue", value: "blue", hex: "#3498db" },
    { name: "Purple", value: "purple", hex: "#9b59b6" },
    { name: "Orange", value: "orange", hex: "#e67e22" },
    { name: "Red", value: "red", hex: "#e74c3c" },
    { name: "Teal", value: "teal", hex: "#1abc9c" },
    { name: "Pink", value: "pink", hex: "#e84393" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Customizer Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 md:w-10 md:h-10 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        title="Customize Theme"
      >
        <i className="fas fa-palette text-gray-600 dark:text-gray-300 text-sm md:text-base"></i>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  <i className="fas fa-palette mr-2 text-green-500"></i>
                  Customize Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Make the app look your way
                </p>
              </div>
              <button
                onClick={resetToDefaults}
                className="text-xs text-amber-500 hover:text-amber-600"
                title="Reset to defaults"
              >
                <i className="fas fa-undo-alt"></i> Reset
              </button>
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto space-y-4">
            {/* Theme Mode */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Theme Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setThemeMode('light')}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    themeMode === 'light'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <i className="fas fa-sun mr-1 text-xs"></i> Light
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    themeMode === 'dark'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <i className="fas fa-moon mr-1 text-xs"></i> Dark
                </button>
              </div>
            </div>

            {/* Quick Color Schemes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quick Colors
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => {
                      handleColorChange(scheme.hex);
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110 shadow-sm"
                    style={{ backgroundColor: scheme.hex }}
                    title={scheme.name}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Custom Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                )}
                <span className="text-xs text-gray-500 font-mono flex-1">
                  {primaryColor}
                </span>
              </div>
            </div>

            {/* Font Size - Simplified */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Font Size: {fontSizeValue}px
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleFontSizeChange(fontSizeValue - 1)}
                  disabled={fontSizeValue <= 11}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <i className="fas fa-minus text-sm"></i>
                </button>
                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {fontSizeValue}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">px</span>
                </div>
                <button
                  onClick={() => handleFontSizeChange(fontSizeValue + 1)}
                  disabled={fontSizeValue >= 18}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                {fontSizeValue <= 12 && "Small"}
                {fontSizeValue === 13 && "Default"}
                {fontSizeValue >= 14 && fontSizeValue <= 15 && "Medium"}
                {fontSizeValue >= 16 && "Large"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;