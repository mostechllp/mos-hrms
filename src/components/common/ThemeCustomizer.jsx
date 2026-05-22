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

  // Function to check if a color is light or dark
  const isLightColor = (hexColor) => {
    let r, g, b;
    if (hexColor.startsWith("#")) {
      r = parseInt(hexColor.slice(1, 3), 16);
      g = parseInt(hexColor.slice(3, 5), 16);
      b = parseInt(hexColor.slice(5, 7), 16);
    } else {
      return true;
    }
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Function to adjust color brightness
  const adjustColorBrightness = (hexColor, percent) => {
    let r, g, b;
    if (hexColor.startsWith("#")) {
      r = parseInt(hexColor.slice(1, 3), 16);
      g = parseInt(hexColor.slice(3, 5), 16);
      b = parseInt(hexColor.slice(5, 7), 16);
    } else {
      return hexColor;
    }

    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));

    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
  };

  // Get only appropriate colors based on theme mode
  const getFilteredColorSchemes = () => {
    const allSchemes = [
      { name: "Green", value: "green", hex: "#2ecc71", lightHex: "#2ecc71", darkHex: "#1a9e52" },
      { name: "Blue", value: "blue", hex: "#3498db", lightHex: "#3498db", darkHex: "#2478b5" },
      { name: "Purple", value: "purple", hex: "#9b59b6", lightHex: "#9b59b6", darkHex: "#7d3c98" },
      { name: "Orange", value: "orange", hex: "#e67e22", lightHex: "#e67e22", darkHex: "#c0392b" },
      { name: "Red", value: "red", hex: "#e74c3c", lightHex: "#e74c3c", darkHex: "#c0392b" },
      { name: "Teal", value: "teal", hex: "#1abc9c", lightHex: "#1abc9c", darkHex: "#148f77" },
      { name: "Pink", value: "pink", hex: "#e84393", lightHex: "#e84393", darkHex: "#c2185b" },
    ];

    if (themeMode === "light") {
      // In light mode, show light/bright colors only
      return allSchemes.map(scheme => ({
        ...scheme,
        hex: scheme.lightHex
      }));
    } else {
      // In dark mode, show darker/muted colors only
      return allSchemes.map(scheme => ({
        ...scheme,
        hex: scheme.darkHex
      }));
    }
  };

  // Handle color change with validation
  const handleValidatedColorChange = (color) => {
    if (themeMode === "light" && !isLightColor(color)) {
      // If in light mode and color is too dark, adjust it to be lighter
      const adjustedColor = adjustColorBrightness(color, 40);
      handleColorChange(adjustedColor);
      // Show warning (optional)
      console.warn("Dark colors are not recommended in light mode. Adjusted to lighter shade.");
    } else if (themeMode === "dark" && isLightColor(color)) {
      // If in dark mode and color is too light, adjust it to be darker
      const adjustedColor = adjustColorBrightness(color, -40);
      handleColorChange(adjustedColor);
      console.warn("Light colors are not recommended in dark mode. Adjusted to darker shade.");
    } else {
      handleColorChange(color);
    }
  };

  // Custom color picker change handler
  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    handleValidatedColorChange(newColor);
  };

  const filteredSchemes = getFilteredColorSchemes();

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
            {/* Theme Mode with warning */}
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
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
                <i className="fas fa-info-circle mr-1"></i>
                {themeMode === 'light' 
                  ? "Light mode works best with bright colors" 
                  : "Dark mode works best with darker colors"}
              </p>
            </div>

            {/* Quick Color Schemes - Filtered by theme mode */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quick Colors {themeMode === 'light' ? '(Bright)' : '(Dark)'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {filteredSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => {
                      handleValidatedColorChange(scheme.hex);
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110 shadow-sm"
                    style={{ backgroundColor: scheme.hex }}
                    title={`${scheme.name} (${themeMode === 'light' ? 'bright' : 'dark'} version)`}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker with theme-based restrictions */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Custom Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer overflow-hidden transition-all hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={handleCustomColorChange}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                    list={themeMode === 'light' ? "light-colors" : "dark-colors"}
                  />
                )}
                <div className="flex-1">
                  <span className="text-xs text-gray-500 font-mono block">
                    {primaryColor}
                  </span>
                  {themeMode === 'light' && !isLightColor(primaryColor) && (
                    <p className="text-[10px] text-amber-500 mt-1">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Dark color may reduce visibility in light mode
                    </p>
                  )}
                  {themeMode === 'dark' && isLightColor(primaryColor) && (
                    <p className="text-[10px] text-amber-500 mt-1">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Bright color may cause eye strain in dark mode
                    </p>
                  )}
                </div>
              </div>
              
              {/* Recommended color ranges */}
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  <i className="fas fa-lightbulb mr-1 text-amber-500"></i>
                  {themeMode === 'light' 
                    ? "Recommended: Green, Blue, Teal, Purple - Bright and vibrant colors work best" 
                    : "Recommended: Dark Green, Navy Blue, Deep Purple, Maroon - Muted and darker colors work best"}
                </p>
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