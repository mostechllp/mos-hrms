import { useState, useEffect, useCallback } from "react";

export const SIDEBAR_EXPANDED = 268; // w-72
export const SIDEBAR_COLLAPSED = 72;
const STORAGE_KEY = "sidebar-collapsed";

const useSidebar = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true"; // default: expanded
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((p) => !p), []);

  // Header hamburger: drawer on mobile, collapse/expand on desktop
  const toggleSidebar = useCallback(() => {
    if (isMobile) setMobileOpen((o) => !o);
    else setCollapsed((p) => !p);
  }, [isMobile]);

  const sidebarWidth = isMobile
    ? 0
    : collapsed
      ? SIDEBAR_COLLAPSED
      : SIDEBAR_EXPANDED;

  return {
    isMobile,
    mobileOpen,
    setMobileOpen,
    collapsed,
    toggleCollapsed,
    toggleSidebar,
    sidebarWidth,
  };
};

export default useSidebar;