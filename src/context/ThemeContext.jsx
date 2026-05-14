import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#2ecc71';
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('fontSize')) || 13;
  });
  
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  // Apply colors globally using CSS custom properties and inline styles
useEffect(() => {
  // Set CSS custom properties on root element
  const root = document.documentElement;

  // Set gray colors based on theme mode
  if (themeMode === 'dark') {
    root.style.setProperty('--gray-800', '#1f2937');
    root.style.setProperty('--gray-700', '#374151');
    root.style.setProperty('--gray-200', '#e5e7eb');
    root.style.setProperty('--gray-100', '#f3f4f6');
  } else {
    root.style.setProperty('--gray-800', '#1f2937');
    root.style.setProperty('--gray-700', '#374151');
    root.style.setProperty('--gray-200', '#e5e7eb');
    root.style.setProperty('--gray-100', '#f3f4f6');
  }
  
  // Calculate darker and lighter shades
  // eslint-disable-next-line react-hooks/immutability
  const darkerShade = adjustColor(primaryColor, -30);
  const lighterShade = adjustColor(primaryColor, 30);
  const veryLightShade = adjustColor(primaryColor, 60);
  
  root.style.setProperty('--primary-color', primaryColor);
  root.style.setProperty('--primary-dark', darkerShade);
  root.style.setProperty('--primary-light', lighterShade);
  root.style.setProperty('--primary-very-light', veryLightShade);
  
  // Generate gradient
  root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor}, ${darkerShade})`);
  
  // Generate glow
  root.style.setProperty('--primary-glow', `${primaryColor}20`);
  
  // Also create specific theme classes for Tailwind
  // eslint-disable-next-line react-hooks/immutability
  updateTailwindTheme(primaryColor);
  
  localStorage.setItem('primaryColor', primaryColor);
}, [primaryColor, themeMode]); // Add themeMode to dependency array

  // Helper function to adjust color brightness
  const adjustColor = (color, percent) => {
    // Convert hex to RGB
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }
    
    // Adjust
    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));
    
    // Convert back to hex
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // Update dynamic Tailwind theme
  const updateTailwindTheme = (color) => {
    // Inject a style tag with dynamic classes
    let styleTag = document.getElementById('dynamic-theme');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme';
      document.head.appendChild(styleTag);
    }
    
    styleTag.innerHTML = `
      /* Dynamic Theme Classes */
      .bg-primary-custom { background-color: ${color} !important; }
      .text-primary-custom { color: ${color} !important; }
      .border-primary-custom { border-color: ${color} !important; }
      .ring-primary-custom { ring-color: ${color} !important; }
      
      .hover\\:bg-primary-custom:hover { background-color: ${adjustColor(color, -10)} !important; }
      .hover\\:text-primary-custom:hover { color: ${adjustColor(color, -10)} !important; }
      
      .bg-primary-light-custom { background-color: ${adjustColor(color, 20)} !important; }
      .text-primary-light-custom { color: ${adjustColor(color, 20)} !important; }
      
      .bg-gradient-primary-custom { 
        background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)}) !important; 
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
        color: white !important;
      }
      
      /* Links */
      a:not([class*="text-"]):not([class*="hover:"]) {
        color: ${color} !important;
      }
      
      a:not([class*="text-"]):not([class*="hover:"]):hover {
        color: ${adjustColor(color, -20)} !important;
      }
      
      /* Buttons with no explicit color */
      button:not([class*="bg-"]):not([class*="text-"]):not([class*="border-"]):not([class*="hover:"]):not([class*="focus:"]) {
        background-color: ${color} !important;
      }
      
      button:not([class*="bg-"]):not([class*="text-"]):not([class*="border-"]):not([class*="hover:"]):not([class*="focus:"]):hover {
        background-color: ${adjustColor(color, -10)} !important;
      }
    `;
  };

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Apply theme mode (light/dark)
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const handleColorChange = (color) => {
    setPrimaryColor(color);
  };

  const handleColorSchemeChange = (scheme) => {
    const schemes = {
      green: '#2ecc71',
      blue: '#3498db',
      purple: '#9b59b6',
      orange: '#e67e22',
      red: '#e74c3c',
      teal: '#1abc9c',
      pink: '#e84393',
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
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 200 && data[i+1] > 200 && data[i+2] > 200) continue;
          if (data[i] < 50 && data[i+1] < 50 && data[i+2] < 50) continue;
          
          r += data[i];
          g += data[i+1];
          b += data[i+2];
          count++;
        }
        
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          resolve(rgbToHex(r, g, b));
        } else {
          resolve('#2ecc71');
        }
        
        URL.revokeObjectURL(img.src);
      };
    });
  };

  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const handleExtractFromLogo = async (file) => {
    if (file) {
      const color = await extractColorFromImage(file);
      setPrimaryColor(color);
    }
  };

  const resetToDefaults = () => {
    setPrimaryColor('#2ecc71');
    setFontSize(13);
    setThemeMode('light');
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