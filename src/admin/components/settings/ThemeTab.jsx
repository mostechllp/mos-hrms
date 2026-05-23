import { useState } from "react";
import { useAppTheme } from "../../../context/ThemeContext";

const ThemeTab = () => {
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
    { name: "Green", value: "green", hex: "#2ecc71", description: "Fresh & Natural" },
    { name: "Blue", value: "blue", hex: "#3498db", description: "Professional & Trustworthy" },
    { name: "Purple", value: "purple", hex: "#9b59b6", description: "Creative & Luxurious" },
    { name: "Orange", value: "orange", hex: "#e67e22", description: "Energetic & Warm" },
    { name: "Red", value: "red", hex: "#e74c3c", description: "Bold & Powerful" },
    { name: "Teal", value: "teal", hex: "#1abc9c", description: "Calm & Sophisticated" },
    { name: "Pink", value: "pink", hex: "#e84393", description: "Playful & Modern" },
  ];

  const fontSizes = [
    { value: 12, label: "Small", description: "Compact view" },
    { value: 13, label: "Default", description: "Standard size" },
    { value: 14, label: "Medium", description: "Comfortable reading" },
    { value: 15, label: "Large", description: "Enhanced readability" },
    { value: 16, label: "Extra Large", description: "Maximum visibility" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <i className="fas fa-palette text-green-600 dark:text-green-400 text-base md:text-xl"></i>
        </div>
        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
          Theme Customization
        </h3>
      </div>

      <div className="space-y-8">
        {/* Theme Mode Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <i className="fas fa-adjust text-green-500 mr-2"></i>
            Theme Mode
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                themeMode === 'light'
                  ? 'border-green-500 bg-green-500 text-white shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  themeMode === 'light' ? 'bg-white/20 text-white' : 'bg-yellow-500 text-white'
                }`}>
                  <i className="fas fa-sun text-lg"></i>
                </div>
                <div>
                  <div className={`font-semibold transition-colors duration-200 ${
                    themeMode === 'light'
                      ? 'text-white'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>Light Mode</div>
                  <div className={`text-xs transition-colors duration-200 ${
                    themeMode === 'light'
                      ? 'text-white/80'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>Bright and clean interface</div>
                </div>
                {themeMode === 'light' && (
                  <i className="fas fa-check-circle text-white ml-auto text-xl"></i>
                )}
              </div>
            </button>

            <button
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                themeMode === 'dark'
                  ? 'border-green-500 bg-green-500 text-white shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  themeMode === 'dark' ? 'bg-white/20 text-white' : 'bg-gray-700 text-white'
                }`}>
                  <i className="fas fa-moon text-lg"></i>
                </div>
                <div>
                  <div className={`font-semibold transition-colors duration-200 ${
                    themeMode === 'dark'
                      ? 'text-white'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>Dark Mode</div>
                  <div className={`text-xs transition-colors duration-200 ${
                    themeMode === 'dark'
                      ? 'text-white/80'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>Easy on the eyes, great for night</div>
                </div>
                {themeMode === 'dark' && (
                  <i className="fas fa-check-circle text-white ml-auto text-xl"></i>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Color Schemes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <i className="fas fa-palette text-green-500 mr-2"></i>
            Color Schemes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.value}
                onClick={() => handleColorChange(scheme.hex)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  primaryColor === scheme.hex
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: scheme.hex }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      {scheme.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {scheme.description}
                    </div>
                  </div>
                  {primaryColor === scheme.hex && (
                    <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <i className="fas fa-tint text-green-500 mr-2"></i>
            Custom Color
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-16 h-16 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer overflow-hidden shadow-sm transition-all hover:scale-105"
              style={{ backgroundColor: primaryColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-16 rounded-xl cursor-pointer"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current color: <span className="font-mono font-semibold">{primaryColor}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click the color box to open the color picker
              </p>
            </div>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <i className="fas fa-text-height text-green-500 mr-2"></i>
            Font Size
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => handleFontSizeChange(fontSizeValue - 1)}
                disabled={fontSizeValue <= 11}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              >
                <i className="fas fa-minus text-lg"></i>
              </button>
              <div className="text-center">
                <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                  {fontSizeValue}
                </span>
                <span className="text-sm text-gray-500 ml-1">px</span>
                <div className="text-xs text-gray-400 mt-1">
                  {fontSizes.find(f => f.value === fontSizeValue)?.label || 'Custom'}
                </div>
              </div>
              <button
                onClick={() => handleFontSizeChange(fontSizeValue + 1)}
                disabled={fontSizeValue >= 18}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              >
                <i className="fas fa-plus text-lg"></i>
              </button>
            </div>

            {/* Font Size Presets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleFontSizeChange(size.value)}
                  className={`px-3 py-2 rounded-lg text-center transition-all ${
                    fontSizeValue === size.value
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-sm font-semibold">{size.label}</div>
                  <div className="text-[10px] opacity-75">{size.value}px</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <i className="fas fa-eye text-green-500 mr-2"></i>
            Preview
          </label>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                  style={{ backgroundColor: primaryColor, color: "var(--primary-contrast)" }}
                >
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">Sample Text</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">This is how your text will look</div>
                </div>
              </div>
              <div>
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
                  style={{ backgroundColor: primaryColor, color: "var(--primary-contrast)" }}
                >
                  Sample Button
                </button>
              </div>
              <div className="flex gap-2">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: primaryColor, color: "var(--primary-contrast)" }}
                >
                  Badge
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                  Normal Badge
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all flex items-center gap-2"
          >
            <i className="fas fa-undo-alt"></i>
            Reset to Default Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeTab;