// locationService.js
// Location comes from the browser's geolocation; the timezone is resolved from
// those coordinates (utils/timezone.js) - never from the device clock/settings.
import {
  getTimezoneFromCoordinates,
  buildTimezonePayload,
} from "../utils/timezone";

// Numeric GeolocationPositionError codes. We compare numbers instead of
// error.PERMISSION_DENIED etc. because some environments (spoofing
// extensions, DevTools overrides, WebViews) return errors without those constants.
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

const requestPosition = (options) =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

const toLocationError = (error) => {
  console.error("Geolocation error:", error?.code, error?.message, error);

  switch (error?.code) {
    case PERMISSION_DENIED:
      return new Error(
        "Location permission is blocked. Allow location for this site in your browser settings (lock icon next to the address bar), then press Try Again.",
      );
    case POSITION_UNAVAILABLE:
      return new Error(
        "Your location is unavailable. Turn on Location Services on your device and try again.",
      );
    case TIMEOUT:
      return new Error("Location request timed out. Please try again.");
    default:
      return new Error(
        `Could not get your location${error?.message ? `: ${error.message}` : ""}. Check that location is allowed for this site and try again.`,
      );
  }
};

export const getCurrentLocation = async () => {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser");
  }
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    throw new Error(
      "Location needs a secure connection (HTTPS). Please open the site over https.",
    );
  }

  let position;
  try {
    // 1st attempt: most accurate (GPS where available)
    position = await requestPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  } catch (error) {
    // Desktops/laptops without GPS often fail the high-accuracy request even
    // though location works. Retry once with network-based location.
    if (error?.code === POSITION_UNAVAILABLE || error?.code === TIMEOUT) {
      try {
        position = await requestPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        });
      } catch (retryError) {
        throw toLocationError(retryError);
      }
    } else {
      throw toLocationError(error);
    }
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
};

// Get location together with the timezone OF THAT PLACE.
export const getLocationWithTimezone = async () => {
  const location = await getCurrentLocation();
  const timezone = getTimezoneFromCoordinates(
    location.latitude,
    location.longitude,
  );

  if (!timezone) {
    throw new Error(
      "Could not determine the timezone for your location. Please select your location manually.",
    );
  }

  return {
    ...location,
    ...buildTimezonePayload(timezone),
  };
};

// Reverse geocoding using OpenStreetMap
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
    );
    const data = await response.json();
    return {
      display_name: data.display_name,
      road: data.address?.road,
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      country: data.address?.country,
      postcode: data.address?.postcode,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};