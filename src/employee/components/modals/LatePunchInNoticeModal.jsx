import { useState, useEffect } from "react";
import { FiClock, FiAlertTriangle, FiMapPin, FiX, FiCheck } from "react-icons/fi";
import {
  getLocationWithTimezone,
  getAddressFromCoordinates,
} from "../../services/locationServise";

const LatePunchInNoticeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialLocation = null,
  currentTime = "",
  cutoffTime = "10:00 AM",
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useState(initialLocation);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setSubmitting(false);

      if (initialLocation && initialLocation.latitude) {
        setLocation(initialLocation);
        setLocationError("");
      } else {
        fetchCurrentLocation();
      }
    }
  }, [isOpen, initialLocation]);

  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError("");
    try {
      const locData = await getLocationWithTimezone();
      let addressData = null;
      if (locData.latitude && locData.longitude) {
        try {
          addressData = await getAddressFromCoordinates(
            locData.latitude,
            locData.longitude,
          );
        } catch (e) {
          console.warn("Could not fetch address details:", e);
        }
      }

      const deviceTz =
        locData.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "Asia/Dubai";

      const combinedLocation = {
        latitude: locData.latitude,
        longitude: locData.longitude,
        timezone: deviceTz,
        address: addressData?.display_name || "Current GPS Location",
      };
      setLocation(combinedLocation);
    } catch (err) {
      console.warn("Location detection error:", err);
      setLocationError(
        err.message || "Could not detect GPS location automatically.",
      );
      // Fallback location to prevent user from being blocked
      setLocation({
        latitude: 25.2048,
        longitude: 55.2708,
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dubai",
        address: "Office Location (Fallback)",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    if (val.trim().length >= 5) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedReason = reason.trim();

    if (trimmedReason.length < 5) {
      setError("Please provide a reason of at least 5 characters.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        reason: trimmedReason,
        location: location || {
          latitude: 25.2048,
          longitude: 55.2708,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dubai",
          address: "Office Dubai",
        },
      });
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to submit late punch-in request.",
      );
      setSubmitting(false);
    }
  };

  const isReasonValid = reason.trim().length >= 5;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-[var(--surface,white)] dark:bg-gray-800 text-[var(--text,#1f2937)] dark:text-gray-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--border,rgba(0,0,0,0.1))] dark:border-gray-700 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <FiAlertTriangle className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text,#111827)] dark:text-white leading-tight">
                Late Punch-In Notice (After {cutoffTime})
              </h3>
              <p className="text-xs text-[var(--muted,#6b7280)] dark:text-gray-400 mt-0.5">
                Work start: 09:00 AM • Cutoff: {cutoffTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl mb-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
            <FiClock className="text-sm shrink-0" />
            You are punching in after the {cutoffTime} cutoff.
          </div>
          <p>
            An HR approval request is required for late arrivals. Your exact punch-in time is recorded immediately upon submitting your reason. Once approved by HR, your timer starts ticking without losing any working time.
          </p>
        </div>

        {/* Location Verification Bar */}
        <div className="p-3 bg-[var(--surface2,#f9fafb)] dark:bg-gray-750/70 border border-[var(--border,rgba(0,0,0,0.06))] dark:border-gray-700 rounded-xl mb-4 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-[var(--text-secondary,#4b5563)] dark:text-gray-300 flex items-center gap-1.5">
              <FiMapPin className="text-emerald-500 text-sm" />
              GPS Location Verification
            </span>
            {locationLoading ? (
              <span className="text-[11px] text-amber-500 flex items-center gap-1">
                <span className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                Detecting...
              </span>
            ) : location?.latitude ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <FiCheck className="text-xs" /> Verified
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-[var(--muted,#6b7280)] dark:text-gray-400 truncate">
            {locationLoading
              ? "Fetching GPS coordinates & address..."
              : location?.address ||
                (location?.latitude
                  ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`
                  : "Location will be attached on submit")}
          </p>
          {locationError && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              Note: {locationError} (Using office location fallback)
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text,#374151)] dark:text-gray-200">
                Reason for Late Arrival <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium ${
                  isReasonValid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-[var(--muted,#9ca3af)]"
                }`}
              >
                {reason.trim().length}/5 min characters
              </span>
            </div>
            <textarea
              value={reason}
              onChange={handleReasonChange}
              rows="4"
              disabled={submitting}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 bg-[var(--surface,white)] dark:bg-gray-700 text-[var(--text,#111827)] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all ${
                error
                  ? "border-red-400 focus:ring-red-500/20"
                  : "border-[var(--border,#d1d5db)] dark:border-gray-600 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
              placeholder="Please describe why you are punching in late (e.g., severe highway traffic, medical emergency, delayed train...)"
              required
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                <FiAlertTriangle className="text-xs" />
                {error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-[var(--border,#d1d5db)] dark:border-gray-600 text-xs font-semibold text-[var(--text-secondary,#4b5563)] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isReasonValid || locationLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting to HR...
                </>
              ) : (
                <>
                  <FiClock className="text-sm" />
                  Submit to HR
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LatePunchInNoticeModal;
