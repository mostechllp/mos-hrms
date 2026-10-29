// src/utils/timezone.js
//
// Single source of truth for timezone handling in attendance.
//
// Rule: the timezone of a punch is the timezone of the PLACE where the punch
// happened (resolved from GPS coordinates). It is never taken from the device
// clock/settings and never from a hardcoded country list.

import tzlookup from "tz-lookup";

const WORK_TZ_KEY = "attendance-timezone";

/* ------------------------------------------------------------------ */
/* Validation + resolving a timezone                                   */
/* ------------------------------------------------------------------ */

export const isValidTimezone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolve the IANA timezone (e.g. "Asia/Dubai") for a lat/lng.
 * Works offline (bundled boundary data) and handles countries that span
 * several timezones (US, Canada, Russia, Brazil, Australia, ...).
 * Returns null if the coordinates are invalid.
 */
export const getTimezoneFromCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  try {
    const tz = tzlookup(lat, lng);
    return isValidTimezone(tz) ? tz : null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/* Offsets                                                             */
/* ------------------------------------------------------------------ */

const zonedParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
};

/** UTC offset of `timeZone` at `date`, in minutes (Dubai = 240, India = 330). */
export const getUtcOffsetMinutes = (timeZone, date = new Date()) => {
  if (!isValidTimezone(timeZone)) return null;
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const realUtc = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUtc - realUtc) / 60000);
};

/** "+04:00" style string for an offset in minutes. */
export const formatUtcOffset = (offsetMinutes) => {
  if (offsetMinutes === null || offsetMinutes === undefined) return "Unknown";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
};

/** Everything the backend needs to know about a timezone. */
export const buildTimezonePayload = (timeZone, date = new Date()) => {
  const minutes = getUtcOffsetMinutes(timeZone, date);
  return {
    timezone: timeZone,
    timezone_offset: formatUtcOffset(minutes),
    timezone_offset_minutes: minutes,
  };
};

/* ------------------------------------------------------------------ */
/* Wall-clock <-> instant conversion in a given timezone               */
/* ------------------------------------------------------------------ */

/**
 * Convert a wall-clock time that was read in `timeZone` into a real instant.
 * (e.g. "10:32 in Asia/Dubai" -> the exact moment that is 06:32 UTC)
 */
export const wallClockToDate = (
  { year, month, day, hour = 0, minute = 0, second = 0 },
  timeZone,
) => {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  if (!isValidTimezone(timeZone)) {
    // No timezone known: interpret in the device zone (last resort).
    return new Date(year, month - 1, day, hour, minute, second);
  }
  let result = guess - getUtcOffsetMinutes(timeZone, new Date(guess)) * 60000;
  // Re-check once in case the guess crossed a DST boundary.
  const offset2 = getUtcOffsetMinutes(timeZone, new Date(result));
  result = guess - offset2 * 60000;
  return new Date(result);
};

/** Today's date as YYYY-MM-DD in `timeZone`. */
export const getTodayInTimezone = (timeZone) => {
  const tz = isValidTimezone(timeZone) ? timeZone : undefined;
  const p = zonedParts(new Date(), tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
};

/** YYYY-MM-DD of an ISO instant / Date, as seen in `timeZone`. */
export const getDatePartInTimezone = (input, timeZone) => {
  if (!input) return null;
  const hasExplicitZone =
    input instanceof Date ||
    (typeof input === "string" && /(Z|[+-]\d{2}:?\d{2})$/.test(input));
  if (!hasExplicitZone) {
    // Naive string - the date part is already the wall-clock date.
    return String(input).slice(0, 10);
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  const tz = isValidTimezone(timeZone) ? timeZone : undefined;
  const p = zonedParts(d, tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Parsing + formatting punch times                                    */
/* ------------------------------------------------------------------ */

/**
 * Parse any punch time the API may return into a real Date (instant).
 *
 *  - "10:32 AM", "10:32", "10:32:15"   -> wall-clock today, read in `timeZone`
 *  - "2026-10-29 10:32:15"             -> wall-clock, read in `timeZone`
 *  - "2026-10-29T06:32:15Z" / "+04:00" -> already an exact instant
 */
export const parseAttendanceTime = (time, timeZone) => {
  if (!time) return null;
  if (time instanceof Date) return time;
  if (typeof time !== "string") return new Date(time);

  const value = time.trim();

  // "hh:mm AM/PM"
  let m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (m) {
    let hour = parseInt(m[1], 10);
    const ampm = m[4].toUpperCase();
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const [y, mo, d] = getTodayInTimezone(timeZone).split("-").map(Number);
    return wallClockToDate(
      { year: y, month: mo, day: d, hour, minute: parseInt(m[2], 10), second: parseInt(m[3] || "0", 10) },
      timeZone,
    );
  }

  // "HH:mm" or "HH:mm:ss"
  m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const [y, mo, d] = getTodayInTimezone(timeZone).split("-").map(Number);
    return wallClockToDate(
      { year: y, month: mo, day: d, hour: parseInt(m[1], 10), minute: parseInt(m[2], 10), second: parseInt(m[3] || "0", 10) },
      timeZone,
    );
  }

  // Full datetime
  const hasExplicitZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  if (hasExplicitZone) return new Date(value);

  m = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    return wallClockToDate(
      {
        year: +m[1],
        month: +m[2],
        day: +m[3],
        hour: +m[4],
        minute: +m[5],
        second: +(m[6] || 0),
      },
      timeZone,
    );
  }

  const fallback = new Date(value);
  return isNaN(fallback.getTime()) ? null : fallback;
};

/** Format an instant in a specific timezone (12-hour "10:32 AM"). */
export const formatTimeInTimezone = (
  input,
  timeZone,
  options = { hour: "2-digit", minute: "2-digit", hour12: true },
) => {
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "";
  const tz = isValidTimezone(timeZone) ? timeZone : undefined;
  return date.toLocaleTimeString("en-US", { ...options, timeZone: tz });
};

export const formatDateInTimezone = (
  input,
  timeZone,
  options = { weekday: "long", year: "numeric", month: "long", day: "numeric" },
) => {
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "";
  const tz = isValidTimezone(timeZone) ? timeZone : undefined;
  return date.toLocaleDateString("en-US", { ...options, timeZone: tz });
};

/* ------------------------------------------------------------------ */
/* Remember the timezone of the last punch (used for display only)     */
/* ------------------------------------------------------------------ */

export const setStoredWorkTimezone = (timeZone) => {
  try {
    if (isValidTimezone(timeZone)) localStorage.setItem(WORK_TZ_KEY, timeZone);
  } catch {
    /* storage unavailable */
  }
};

export const getStoredWorkTimezone = () => {
  try {
    const tz = localStorage.getItem(WORK_TZ_KEY);
    return isValidTimezone(tz) ? tz : null;
  } catch {
    return null;
  }
};