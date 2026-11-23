// src/context/MenuVisibilityContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const MenuVisibilityContext = createContext();

export const useMenuVisibility = () => {
  const context = useContext(MenuVisibilityContext);
  if (!context) {
    throw new Error("useMenuVisibility must be used within MenuVisibilityProvider");
  }
  return context;
};

export const MenuVisibilityProvider = ({ children }) => {
  // Store hidden slugs as an array. Default empty means everything is visible.
  const [hiddenSlugs, setHiddenSlugs] = useState(() => {
    try {
      const stored = localStorage.getItem("hidden_accounts_menus");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("hidden_accounts_menus", JSON.stringify(hiddenSlugs));
  }, [hiddenSlugs]);

  const toggleMenuVisibility = (slug) => {
    setHiddenSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug) // Show it (remove from hidden)
        : [...prev, slug] // Hide it (add to hidden)
    );
  };

  const isMenuVisible = (slug) => !hiddenSlugs.includes(slug);

  return (
    <MenuVisibilityContext.Provider
      value={{ hiddenSlugs, toggleMenuVisibility, isMenuVisible }}
    >
      {children}
    </MenuVisibilityContext.Provider>
  );
};