// src/components/common/FeatureAnnouncement.jsx
import { useState, useEffect } from "react";
import { X, KeyRound } from "lucide-react";

const FeatureAnnouncement = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already seen this specific announcement
    const hasSeen = localStorage.getItem("has_seen_otp_announcement");
    if (!hasSeen) {
      // Small delay to let the page settle before popping up
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Save to local storage so it never shows again
    localStorage.setItem("has_seen_otp_announcement", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <KeyRound size={24} className="text-green-600 dark:text-green-400" />
        </div>

        {/* Content */}
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          New Feature: Login with OTP
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          We've added a faster, passwordless way to sign in! You can now log in securely using a One-Time Password (OTP) sent directly to your email. 
          <br /><br />
          <strong>It is fully integrated and you can start using it today.</strong>
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-600 hover:shadow-lg transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
      
      {/* Inline styles for the animation */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default FeatureAnnouncement;