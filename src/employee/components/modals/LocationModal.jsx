// LocationModal.jsx - COMPLETE FIXED VERSION
import { useState, useEffect, useRef } from "react";
import {
  getLocationWithTimezone,
  getAddressFromCoordinates,
} from "../../services/locationServise";
import { getCountryFromTimezone } from "../../utils/timezoneCountryMap";
import { getTimezoneFromCountry } from "../../utils/countryTimezoneMap";

// Simple Map Component using Leaflet (or you can use Google Maps)
import MapPicker from "./MapPicker";

const LocationModal = ({ isOpen, onClose, onConfirm, type = "punch-in" }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countrySource, setCountrySource] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [rawAddressData, setRawAddressData] = useState(null);

  // Manual edit fields
  const [manualAddress, setManualAddress] = useState("");
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [manualCountry, setManualCountry] = useState("");
  const [manualTimezone, setManualTimezone] = useState("");

  // Get current timezone from browser (only as fallback)
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Helper function to get timezone from country
  const getTimezoneForCountry = (countryName) => {
    if (!countryName) return null;
    const timezone = getTimezoneFromCountry(countryName);
    console.log(`🌐 Country "${countryName}" -> Timezone: "${timezone}"`);
    return timezone;
  };

  // Helper to extract country from address data with multiple fallbacks
  const extractCountryFromAddress = (addressData) => {
    if (!addressData) return null;

    console.log("🔍 Extracting country from address data:", addressData);

    // Try multiple ways to extract country
    const possibleCountry = 
      addressData.address?.country ||
      addressData.address?.country_name ||
      addressData.country ||
      addressData.country_name ||
      addressData.display_name?.split(",").pop()?.trim();

    console.log(`📍 Extracted country: "${possibleCountry}"`);
    return possibleCountry || null;
  };

  useEffect(() => {
    if (isOpen) {
      fetchLocation();
    }
  }, [isOpen]);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    setRawAddressData(null);

    try {
      // Get location with timezone
      const locationData = await getLocationWithTimezone();
      setLocation(locationData);

      // Populate manual fields with detected data
      setManualLatitude(locationData.latitude?.toString() || "");
      setManualLongitude(locationData.longitude?.toString() || "");

      // Try to get address and country from coordinates
      let countryFromAddress = null;
      let addressData = null;

      if (locationData.latitude && locationData.longitude) {
        try {
          console.log(`📍 Fetching address for: ${locationData.latitude}, ${locationData.longitude}`);
          addressData = await getAddressFromCoordinates(
            locationData.latitude,
            locationData.longitude,
          );
          
          console.log("📦 Raw address data from API:", addressData);
          setRawAddressData(addressData);
          setAddress(addressData);
          setManualAddress(addressData?.display_name || "");

          // Extract country using the helper
          countryFromAddress = extractCountryFromAddress(addressData);
          console.log(`📍 Country from address: "${countryFromAddress}"`);

        } catch (err) {
          console.warn("Could not fetch address:", err);
        }
      }

      // If country is still not found, try to get it from timezone
      let finalCountry = countryFromAddress;
      let source = "address";

      if (!finalCountry || finalCountry === "Unknown" || finalCountry === "") {
        // Try to get country from timezone as fallback
        const countryFromTimezone = getCountryFromTimezone(locationData.timezone || browserTimezone);
        if (countryFromTimezone && countryFromTimezone !== "Unknown") {
          finalCountry = countryFromTimezone;
          source = "timezone-fallback";
          console.log(`🔄 Fallback: Using timezone for country: "${finalCountry}"`);
        } else {
          finalCountry = "Unknown";
          source = "fallback";
        }
      }

      console.log(`✅ Final country: "${finalCountry}" (from ${source})`);
      setCountry(finalCountry);
      setCountrySource(source);
      setManualCountry(finalCountry);

      // 🎯 CRITICAL FIX: Derive timezone from country, not from browser
      let timezoneFromCountry = null;
      if (finalCountry && finalCountry !== "Unknown") {
        timezoneFromCountry = getTimezoneForCountry(finalCountry);
      }

      // If we got a timezone from country, use it; otherwise fallback to browser
      const finalTimezone = timezoneFromCountry || browserTimezone;
      console.log(`⏰ Final timezone: "${finalTimezone}" (source: ${timezoneFromCountry ? 'country' : 'browser-fallback'})`);

      // Update location with correct timezone
      setLocation((prev) => ({
        ...prev,
        timezone: finalTimezone,
        timezone_offset: getTimezoneOffsetFormatted(finalTimezone),
        timezone_offset_minutes: getTimezoneOffsetMinutes(finalTimezone),
      }));

      setManualTimezone(finalTimezone);

    } catch (err) {
      console.error("❌ Location fetch error:", err);
      setError(err.message || "Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  // Handle map location selection
  const handleMapLocationSelect = (selectedLocation) => {
    console.log("📍 Map selected location:", selectedLocation);

    setManualLatitude(selectedLocation.lat.toString());
    setManualLongitude(selectedLocation.lng.toString());
    setManualAddress(selectedLocation.address || "");

    // 🎯 CRITICAL FIX: Derive timezone from the selected country
    let timezoneFromCountry = null;
    let selectedCountry = selectedLocation.country || selectedLocation.country_name;
    
    if (selectedCountry) {
      timezoneFromCountry = getTimezoneForCountry(selectedCountry);
    }

    const finalTimezone = timezoneFromCountry || browserTimezone;
    console.log(`⏰ Map selection timezone: "${finalTimezone}"`);

    setManualCountry(selectedCountry || manualCountry);
    setManualTimezone(finalTimezone);

    // Update the location object with selected coordinates and timezone
    setLocation({
      ...location,
      latitude: parseFloat(selectedLocation.lat),
      longitude: parseFloat(selectedLocation.lng),
      timezone: finalTimezone,
      timezone_offset: getTimezoneOffsetFormatted(finalTimezone),
      timezone_offset_minutes: getTimezoneOffsetMinutes(finalTimezone),
    });

    // Update address
    setAddress({
      ...address,
      display_name: selectedLocation.address || address?.display_name || "",
    });

    // Update country
    if (selectedCountry) {
      setCountry(selectedCountry);
      setCountrySource("map-selection");
    }

    setShowMapPicker(false);
    setIsEditing(true);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isEditing) {
      // Entering edit mode - populate fields with current data
      setManualAddress(address?.display_name || manualAddress || "");
      setManualLatitude(location?.latitude?.toString() || manualLatitude || "");
      setManualLongitude(
        location?.longitude?.toString() || manualLongitude || "",
      );
      setManualCountry(country || manualCountry || "");
      setManualTimezone(
        location?.timezone || manualTimezone || browserTimezone,
      );
    }
    setIsEditing(!isEditing);
  };

  // Handle manual field changes
  const handleManualFieldChange = (field, value) => {
    switch (field) {
      case "address":
        setManualAddress(value);
        break;
      case "latitude":
        setManualLatitude(value);
        break;
      case "longitude":
        setManualLongitude(value);
        break;
      case "country":
        setManualCountry(value);
        // 🎯 When country is manually changed, update timezone accordingly
        if (value && value !== "Unknown") {
          const timezoneFromCountry = getTimezoneForCountry(value);
          if (timezoneFromCountry) {
            setManualTimezone(timezoneFromCountry);
            console.log(`🔄 Manual country change: "${value}" -> timezone: "${timezoneFromCountry}"`);
          }
        }
        break;
      case "timezone":
        setManualTimezone(value);
        break;
      default:
        break;
    }
  };

  // Validate and confirm location
  const handleConfirm = () => {
    let finalLat = parseFloat(manualLatitude);
    let finalLng = parseFloat(manualLongitude);

    // If in edit mode, use manual values
    if (isEditing) {
      // Validate coordinates
      if (isNaN(finalLat) || isNaN(finalLng)) {
        setError("Please enter valid coordinates (latitude and longitude)");
        return;
      }

      if (finalLat < -90 || finalLat > 90) {
        setError("Latitude must be between -90 and 90");
        return;
      }

      if (finalLng < -180 || finalLng > 180) {
        setError("Longitude must be between -180 and 180");
        return;
      }

      // 🎯 CRITICAL FIX: Ensure timezone is derived from country if not manually set
      let finalTimezone = manualTimezone;
      if (!finalTimezone || finalTimezone === "") {
        const timezoneFromCountry = getTimezoneForCountry(manualCountry);
        finalTimezone = timezoneFromCountry || browserTimezone;
        setManualTimezone(finalTimezone);
      }

      // If country is set but timezone doesn't match, update timezone to match country
      if (manualCountry && manualCountry !== "Unknown") {
        const correctTimezone = getTimezoneForCountry(manualCountry);
        if (correctTimezone && correctTimezone !== finalTimezone) {
          console.log(`🔄 Updating timezone from "${finalTimezone}" to "${correctTimezone}" to match country "${manualCountry}"`);
          finalTimezone = correctTimezone;
          setManualTimezone(finalTimezone);
        }
      }

      const locationPayload = {
        latitude: finalLat,
        longitude: finalLng,
        address: manualAddress || `${finalLat}, ${finalLng}`,
        accuracy: location?.accuracy || null,
        timestamp: new Date().toISOString(),
        timezone: finalTimezone,
        timezone_offset: getTimezoneOffsetFormatted(finalTimezone),
        timezone_offset_minutes: getTimezoneOffsetMinutes(finalTimezone),
        work_location: manualCountry || "Unknown",
        country_source: "manual-edit",
      };

      console.log("📍 Confirming manually edited location:", locationPayload);
      onConfirm(locationPayload);
    } else {
      // Use detected location
      if (!location) {
        setError("Location not detected. Please try again or edit manually.");
        return;
      }

      // 🎯 CRITICAL FIX: Ensure timezone is derived from country
      let finalTimezone = location.timezone;
      let finalCountry = country || "Unknown";
      
      // If country is set, try to get correct timezone
      if (finalCountry && finalCountry !== "Unknown") {
        const timezoneFromCountry = getTimezoneForCountry(finalCountry);
        if (timezoneFromCountry) {
          finalTimezone = timezoneFromCountry;
          console.log(`🔄 Using timezone "${finalTimezone}" from country "${finalCountry}"`);
        }
      }

      const locationPayload = {
        latitude: location.latitude,
        longitude: location.longitude,
        address:
          address?.display_name ||
          address?.address?.road ||
          address?.address?.neighbourhood ||
          address?.address?.city ||
          `${location.latitude}, ${location.longitude}`,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        timezone: finalTimezone,
        timezone_offset: getTimezoneOffsetFormatted(finalTimezone),
        timezone_offset_minutes: getTimezoneOffsetMinutes(finalTimezone),
        work_location: finalCountry,
        country_source: countrySource || "detected",
      };

      console.log("📍 Confirming detected location:", locationPayload);
      onConfirm(locationPayload);
    }
  };

  // Helper to get timezone offset formatted
  const getTimezoneOffsetFormatted = (timezone) => {
    try {
      if (!timezone) return "Unknown";
      const date = new Date();
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "longOffset",
      });
      const parts = formatter.formatToParts(date);
      const offsetPart = parts.find((p) => p.type === "timeZoneName");
      return offsetPart?.value || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  // Helper to get timezone offset in minutes
  const getTimezoneOffsetMinutes = (timezone) => {
    try {
      if (!timezone) return -new Date().getTimezoneOffset();
      const date = new Date();
      const utcDate = new Date(
        date.toLocaleString("en-US", { timeZone: "UTC" }),
      );
      const tzDate = new Date(
        date.toLocaleString("en-US", { timeZone: timezone }),
      );
      return Math.round((tzDate - utcDate) / 60000);
    } catch {
      return -new Date().getTimezoneOffset();
    }
  };

  const getAccuracyColor = () => {
    if (!location?.accuracy) return "text-gray-500";
    if (location.accuracy <= 50) return "text-green-500";
    if (location.accuracy <= 200) return "text-yellow-500";
    return "text-red-500";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {isEditing ? "Edit Location" : "Verify Your Location"}
          </h3>
          {!loading && (
            <button
              onClick={toggleEditMode}
              className={`text-sm flex items-center gap-1 transition-colors ${
                isEditing
                  ? "text-red-500 hover:text-red-600"
                  : "text-green-500 hover:text-green-600"
              }`}
            >
              <i className={`fas ${isEditing ? "fa-times" : "fa-pen"}`}></i>
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-[var(--muted)]">
              Getting your location and timezone...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 my-4">
            <p className="text-red-500 text-sm">{error}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={fetchLocation}
                className="text-sm text-green-500 hover:underline"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setIsEditing(true);
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                Edit Manually
              </button>
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <button
              onClick={() => setShowMapPicker(true)}
              className="w-full mb-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-map"></i>
              {isEditing ? "Select Location on Map" : "View on Map"}
            </button>

            <div className="bg-[var(--surface2)] rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <i
                  className={`fas ${isEditing ? "fa-edit" : "fa-map-marker-alt"} text-green-500 mt-1`}
                ></i>
                <div className="flex-1 space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                          <i className="fas fa-map-pin mr-1"></i> Address
                        </label>
                        <input
                          type="text"
                          value={manualAddress}
                          onChange={(e) =>
                            handleManualFieldChange("address", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                            <i className="fas fa-arrows-alt-h mr-1"></i> Latitude
                          </label>
                          <input
                            type="text"
                            value={manualLatitude}
                            onChange={(e) =>
                              handleManualFieldChange("latitude", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
                            placeholder="0.000000"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                            <i className="fas fa-arrows-alt-v mr-1"></i> Longitude
                          </label>
                          <input
                            type="text"
                            value={manualLongitude}
                            onChange={(e) =>
                              handleManualFieldChange("longitude", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
                            placeholder="0.000000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                            <i className="fas fa-flag mr-1"></i> Country
                          </label>
                          <input
                            type="text"
                            value={manualCountry}
                            onChange={(e) =>
                              handleManualFieldChange("country", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
                            placeholder="Country"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                            <i className="fas fa-clock mr-1"></i> Timezone
                          </label>
                          <input
                            type="text"
                            value={manualTimezone}
                            onChange={(e) =>
                              handleManualFieldChange("timezone", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
                            placeholder="Asia/Riyadh"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold mb-1">
                        📍 Location Detected
                      </p>
                      <p className="text-xs text-[var(--muted)] mb-2">
                        {address?.display_name ||
                          address?.address?.road ||
                          address?.address?.neighbourhood ||
                          address?.address?.city ||
                          (location?.latitude && location?.longitude
                            ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                            : "Location not available")}
                      </p>
                      <div className="text-xs text-[var(--muted)] space-y-1">
                        {location?.latitude && location?.longitude && (
                          <p>
                            Coordinates: {location.latitude.toFixed(6)},{" "}
                            {location.longitude.toFixed(6)}
                          </p>
                        )}
                        {location?.accuracy && (
                          <p
                            className={`${getAccuracyColor()} flex items-center gap-1`}
                          >
                            <i className="fas fa-chart-line text-xs"></i>
                            Accuracy: {Math.round(location.accuracy)}m
                          </p>
                        )}
                        {/* 🎯 Display timezone derived from country/address */}
                        <p className="text-blue-500 flex items-center gap-1">
                          <i className="fas fa-clock text-xs"></i>
                          Timezone: {location?.timezone || manualTimezone || "Detecting..."}
                          {country && country !== "Unknown" && country !== "" && (
                            <span className="text-xs text-green-500 ml-1">
                              (from {country})
                            </span>
                          )}
                        </p>
                        <p className="text-purple-500 flex items-center gap-1">
                          <i className="fas fa-globe text-xs"></i>
                          UTC Offset: {location?.timezone_offset || "Unknown"}
                        </p>
                        {country && country !== "Unknown" && country !== "" && (
                          <p className="text-green-500 flex items-center gap-1">
                            <i className="fas fa-flag text-xs"></i>
                            Country: {country}
                            {countrySource && countrySource !== "fallback" && (
                              <span className="text-xs text-gray-400 ml-1">
                                (from {countrySource})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={!location && !isEditing}
              >
                Confirm {type === "punch-in" ? "Punch In" : "Punch Out"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onSelect={handleMapLocationSelect}
          initialLat={parseFloat(manualLatitude) || location?.latitude || 0}
          initialLng={parseFloat(manualLongitude) || location?.longitude || 0}
        />
      )}
    </div>
  );
};

export default LocationModal;