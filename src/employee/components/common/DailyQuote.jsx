import React, { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "../../../context/ThemeContext"; // adjust path if needed
import { WORK_QUOTES } from "../../utils/workQuotes";

const SEEN_KEY = "daily-quote-seen";

// Malayalam script block, used only to set the correct lang attribute
export const isMalayalam = (text) => /[\u0D00-\u0D7F]/.test(text);

// "2026-11-19" -> same index for everyone on that date; cycles through all quotes
const dayIndex = (dateStr, length) => {
  const [y, m, d] = (dateStr || "").split("-").map(Number);
  if (!y || !m || !d || !length) return 0;
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000) % length;
};

// Shared helper: the quote for a given day (used by the popup and the banner)
export const getDailyQuote = (dateStr) =>
  WORK_QUOTES[dayIndex(dateStr, WORK_QUOTES.length)] || "";

const wasSeenToday = (dateStr) => {
  try {
    return localStorage.getItem(SEEN_KEY) === dateStr;
  } catch {
    return false;
  }
};

const markSeen = (dateStr) => {
  try {
    localStorage.setItem(SEEN_KEY, dateStr);
  } catch {}
};

/**
 * Popup that appears once, the first time the dashboard is opened each day.
 * Props: dateStr ("YYYY-MM-DD" in the work timezone), name (optional first name)
 */
const DailyQuote = ({ dateStr, name }) => {
  const { primaryColor, primaryDark } = useAppTheme();
  const [open, setOpen] = useState(false);

  const quote = useMemo(() => getDailyQuote(dateStr), [dateStr]);

  const gradient = `linear-gradient(135deg, ${primaryColor || "#2ecc71"}, ${primaryDark || "#1e9e57"})`;
  const lang = isMalayalam(quote) ? "ml" : "en";

  useEffect(() => {
    if (dateStr && quote) setOpen(!wasSeenToday(dateStr));
  }, [dateStr, quote]);

  const close = () => {
    setOpen(false);
    markSeen(dateStr);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dateStr]);

  if (!open || !quote) return null;

  return (
    <>
      <style>{`
        @keyframes dq-backdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dq-pop {
          0%   { opacity: 0; transform: translateY(24px) scale(0.92); }
          60%  { opacity: 1; transform: translateY(-4px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dq-backdrop { animation: dq-backdrop .25s ease-out both; }
        .dq-card { animation: dq-pop .45s cubic-bezier(.2,.9,.3,1.2) both; }
        @media (prefers-reduced-motion: reduce) {
          .dq-backdrop, .dq-card { animation: none; }
        }
      `}</style>

      <div
        className="dq-backdrop fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
        onClick={close}
        role="dialog"
        aria-modal="true"
        aria-label="Quote of the day"
      >
        <div
          className="dq-card relative w-full max-w-md rounded-3xl overflow-hidden bg-[var(--surface)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative px-6 pt-7 pb-12 text-white"
            style={{ background: gradient }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute top-10 -left-6 w-20 h-20 rounded-full bg-white/10" />
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
            <p className="relative text-xs font-medium text-white/80">
              {name ? `Hi ${name},` : "Hello,"}
            </p>
            <h3 className="relative text-xl font-bold mt-1">
              Today's inspiration
            </h3>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 top-[88px] w-14 h-14 rounded-full border-4 border-[var(--surface)] flex items-center justify-center text-white shadow-lg"
            style={{ background: gradient }}
          >
            <i className="fas fa-quote-left text-lg"></i>
          </div>

          <div className="px-7 pt-12 pb-7 text-center">
            <p
              lang={lang}
              className="text-lg md:text-xl font-semibold text-[var(--text)] leading-relaxed"
            >
              {quote}
            </p>
            <button
              onClick={close}
              className="mt-6 px-8 py-3 rounded-full text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
              style={{ background: gradient }}
            >
              Let's start the day
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyQuote;