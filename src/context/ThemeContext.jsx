import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("primaryColor") || "#2ecc71";
  });

  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem("fontSize")) || 13;
  });

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("themeMode") || "light";
  });

  // Helper function to adjust color brightness
  const adjustColor = (color, percent) => {
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }
    
    if (percent > 0) {
      // Lighten towards white (255)
      r = r + (255 - r) * (percent / 100);
      g = g + (255 - g) * (percent / 100);
      b = b + (255 - b) * (percent / 100);
    } else {
      // Darken towards black (0)
      const dec = -percent / 100;
      r = r - r * dec;
      g = g - g * dec;
      b = b - b * dec;
    }
    
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Apply theme mode and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme class
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    if (themeMode === 'dark') {
      root.style.setProperty('--bg', '#0f1412');
      root.style.setProperty('--surface', '#1a241f');
      root.style.setProperty('--surface2', '#1f2c26');
      root.style.setProperty('--border', '#2a3a32');
      root.style.setProperty('--text', '#ecfdf5');
      root.style.setProperty('--text-secondary', '#b8d9cc');
      root.style.setProperty('--muted', '#7e9a8c');
      root.style.setProperty('--sidebar-bg', '#0a100e');
      root.style.setProperty('--sidebar-text', 'rgba(255, 255, 255, 0.65)');
      root.style.setProperty('--shadow', '0 4px 20px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-lg', '0 12px 32px rgba(0, 0, 0, 0.4)');
    } else {
      root.style.setProperty('--bg', '#eef2ef');
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--surface2', '#eef3ef');
      root.style.setProperty('--border', '#d6e2da');
      root.style.setProperty('--text', '#1a2e22');
      root.style.setProperty('--text-secondary', '#4a5f52');
      root.style.setProperty('--muted', '#7a9486');
      root.style.setProperty('--sidebar-bg', '#1a2e22');
      root.style.setProperty('--sidebar-text', 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--shadow', '0 4px 20px rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-lg', '0 12px 32px rgba(0, 0, 0, 0.12)');
    }
    
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Apply primary color
  useEffect(() => {
    const root = document.documentElement;
    
    const darkerShade = adjustColor(primaryColor, -30);
    const lighterShade = adjustColor(primaryColor, 30);
    
    // Calculate YIQ contrast color for text on primary background
    const getContrastColor = (hexColor) => {
      if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? '#111827' : '#ffffff';
    };
    
    // Calculate readable text color based on background
    const getReadablePrimaryTextColor = (hexColor, isDark) => {
      if (!hexColor || !hexColor.startsWith('#')) return hexColor;
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      if (isDark) {
        // Dark mode: make sure text color is bright enough
        return (yiq < 120) ? '#ffffff' : hexColor;
      } else {
        // Light mode: make sure text color is dark enough
        return (yiq > 200) ? '#1a2e22' : hexColor;
      }
    };

    // Calculate a truly light highlight background color for Light Mode
    const getLightHighlightColor = (hexColor) => {
      if (!hexColor || !hexColor.startsWith('#')) return '#f3f4f6';
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      const percent = (yiq < 128) ? 92 : 82;
      return adjustColor(hexColor, percent);
    };

    const primaryContrast = getContrastColor(primaryColor);
    const primaryText = getReadablePrimaryTextColor(primaryColor, themeMode === 'dark');
    const veryLightShade = getLightHighlightColor(primaryColor);

    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-dark', darkerShade);
    root.style.setProperty('--primary-light', lighterShade);
    root.style.setProperty('--primary-very-light', veryLightShade);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor}, ${darkerShade})`);
    root.style.setProperty('--primary-glow', `${primaryColor}20`);
    root.style.setProperty('--primary-contrast', primaryContrast);
    root.style.setProperty('--primary-text', primaryText);
    root.style.setProperty('--primary-contrast-text', primaryContrast);
    
    // Update Tailwind theme
    // eslint-disable-next-line react-hooks/immutability
    updateTailwindTheme(primaryColor, primaryContrast, primaryText);
    
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor, themeMode]);

  const updateTailwindTheme = (color, contrastColor = 'white', primaryText = color) => {
    let styleTag = document.getElementById('dynamic-theme');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme';
      document.head.appendChild(styleTag);
    }
    
    const darkerShade = adjustColor(color, -20);
    
    styleTag.innerHTML = `
      /* Dynamic Theme Classes */
      .bg-primary-custom { 
        background-color: ${color} !important; 
        color: ${contrastColor} !important;
      }
      .text-primary-custom { color: ${primaryText} !important; }
      .text-primary-contrast { color: ${contrastColor} !important; }
      .border-primary-custom { border-color: ${color} !important; }
      .ring-primary-custom { ring-color: ${color} !important; }
      
      .hover\\:bg-primary-custom:hover { background-color: ${adjustColor(color, -10)} !important; }
      .hover\\:text-primary-custom:hover { color: ${primaryText} !important; }
      
      .bg-primary-light-custom { background-color: ${adjustColor(color, 20)} !important; }
      .text-primary-light-custom { color: ${primaryText} !important; }
      
      .bg-gradient-primary-custom { 
        background: linear-gradient(135deg, ${color}, ${darkerShade}) !important; 
        color: ${contrastColor} !important;
      }
      
      /* Button with contrast text */
      .btn-primary-custom {
        background-color: ${color} !important;
        color: ${contrastColor} !important;
      }
      
      .btn-primary-custom:hover {
        background-color: ${adjustColor(color, -10)} !important;
        color: ${contrastColor} !important;
      }
      
      /* Focus rings */
      .focus\\:ring-primary-custom:focus { 
        --tw-ring-color: ${color} !important; 
      }
      
      .focus\\:border-primary-custom:focus { 
        border-color: ${color} !important; 
      }
      
      /* Checkbox and radio accents */
      input[type="checkbox"]:checked,
      input[type="radio"]:checked {
        accent-color: ${color} !important;
      }
      
      /* Custom scrollbar thumb */
      ::-webkit-scrollbar-thumb {
        background-color: ${color} !important;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background-color: ${adjustColor(color, -20)} !important;
      }
      
      /* Selection color */
      ::selection {
        background-color: ${color} !important;
        color: ${contrastColor} !important;
      }
    `;
  };

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const handleColorChange = (color) => {
    setPrimaryColor(color);
  };

  const handleColorSchemeChange = (scheme) => {
    const schemes = {
      green: "#2ecc71",
      blue: "#3498db",
      purple: "#9b59b6",
      orange: "#e67e22",
      red: "#e74c3c",
      teal: "#1abc9c",
      pink: "#e84393",
    };

    if (schemes[scheme]) {
      setPrimaryColor(schemes[scheme]);
    }
  };

  const handleFontSizeChange = (size) => {
    const newSize = Math.min(18, Math.max(11, size));
    setFontSize(newSize);
  };

  const extractColorFromImage = (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0,
          g = 0,
          b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) continue;
          if (data[i] < 50 && data[i + 1] < 50 && data[i + 2] < 50) continue;

          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          resolve(rgbToHex(r, g, b));
        } else {
          resolve("#2ecc71");
        }

        URL.revokeObjectURL(img.src);
      };
    });
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const handleExtractFromLogo = async (file) => {
    if (file) {
      const color = await extractColorFromImage(file);
      setPrimaryColor(color);
    }
  };

  const resetToDefaults = () => {
    setPrimaryColor("#2ecc71");
    setFontSize(13);
    setThemeMode("light");
  };

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        fontSize,
        themeMode,
        setThemeMode,
        handleColorChange,
        handleColorSchemeChange,
        handleFontSizeChange,
        handleExtractFromLogo,
        resetToDefaults,
        fontSizeValue: fontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
