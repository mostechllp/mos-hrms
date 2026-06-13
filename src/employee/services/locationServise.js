// locationService.js - Simplified version without retry logic

// Get current location with high accuracy options
export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    // Default options for getting location
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location accuracy:", position.coords.accuracy, "meters");
        
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = "Location access denied";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please allow location access to punch in. You can enable it in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your GPS or Wi-Fi.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please check your internet connection.";
            break;
        }
        reject(new Error(errorMessage));
      },
      defaultOptions
    );
  });
};

// Get location - simple version (no retries, just get location once)
export const getLocation = async () => {
  try {
    const location = await getCurrentLocation();
    return location;
  } catch (error) {
    console.error("Error getting location:", error);
    throw error;
  }
};

// Watch position for continuous updates
export const watchCurrentLocation = (onUpdate, onError, options = {}) => {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation is not supported"));
    return null;
  }

  const watchOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    },
    onError,
    watchOptions
  );
};

// Get accurate location - simplified (just get location once, no retries)
export const getAccurateLocation = async () => {
  try {
    const location = await getCurrentLocation();
    console.log(`Location accuracy: ${location.accuracy}m`);
    return location;
  } catch (error) {
    console.error("Failed to get location:", error);
    throw error;
  }
};

// Get IP-based location as fallback (approximate)
export const getIPLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 5000, // IP location is less accurate (~5km)
      city: data.city,
      region: data.region,
      country: data.country_name,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("IP location error:", error);
    return null;
  }
};

// Reverse geocoding using OpenStreetMap (free, no API key needed)
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    );
    const data = await response.json();
    return {
      display_name: data.display_name,
      road: data.address?.road,
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      country: data.address?.country,
      postcode: data.address?.postcode
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Get current timezone from browser
export const getCurrentTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Get timezone offset
export const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  const sign = offset <= 0 ? '+' : '-';
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Get complete timezone info
export const getTimezoneInfo = () => {
  const timezone = getCurrentTimezone();
  const offset = getTimezoneOffset();
  const timestamp = new Date().toISOString();
  
  return {
    name: timezone,
    offset: offset,
    timestamp: timestamp,
    isDST: isDaylightSavingTime()
  };
};

// Check if DST is active
export const isDaylightSavingTime = () => {
  const jan = new Date(new Date().getFullYear(), 0, 1);
  const jul = new Date(new Date().getFullYear(), 6, 1);
  const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const currentOffset = new Date().getTimezoneOffset();
  return currentOffset < stdTimezoneOffset;
};

// Get current location with timezone (simplified)
export const getCurrentLocationWithTimezone = async () => {
  try {
    const location = await getAccurateLocation();
    const address = await getAddressFromCoordinates(location.latitude, location.longitude);
    const timezone = getCurrentTimezone(); // Use browser timezone directly
    
    return {
      ...location,
      address: address?.display_name || `${location.latitude}, ${location.longitude}`,
      timezone: timezone,
      timezoneOffset: getTimezoneOffset(),
      isDST: isDaylightSavingTime()
    };
  } catch (error) {
    console.error("Error getting location with timezone:", error);
    // Fallback with browser timezone only
    return {
      timezone: getCurrentTimezone(),
      timezoneOffset: getTimezoneOffset(),
      isDST: isDaylightSavingTime(),
      error: true
    };
  }
};