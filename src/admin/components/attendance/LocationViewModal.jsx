import { useEffect, useRef } from "react";

const LocationViewModal = ({ isOpen, onClose, locationData }) => {
  const mapRef = useRef(null);

  // Helper function to check if location has data (either coordinates OR address)
  const hasLocationData = (location) => {
    if (!location) return false;
    return !!(location.latitude || location.longitude || location.address);
  };

  // Helper to get display location text
  const getLocationDisplay = (location) => {
    if (!location) return "No location recorded";
    if (location.address) return location.address;
    if (location.latitude && location.longitude) {
      return `${location.latitude}, ${location.longitude}`;
    }
    return "No location recorded";
  };

  // Helper to get Google Maps URL
  const getGoogleMapsUrl = (location) => {
    if (!location) return "#";
    if (location.latitude && location.longitude) {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
    if (location.address) {
      return `https://www.google.com/maps?q=${encodeURIComponent(location.address)}`;
    }
    return "#";
  };

  // Helper to check if location has coordinates for map
  const hasCoordinates = (location) => {
    return !!(location?.latitude && location?.longitude);
  };

  useEffect(() => {
    // Only try to load map if we have coordinates
    const hasInCoords = hasCoordinates(locationData?.punch_in);
    const hasOutCoords = hasCoordinates(locationData?.punch_out);
    
    if (isOpen && (hasInCoords || hasOutCoords)) {
      const initMap = async () => {
        try {
          const L = await import("leaflet");
          await import("leaflet/dist/leaflet.css");

          if (!mapRef.current) return;

          // Clear previous map
          if (mapRef.current._leaflet_id) {
            mapRef.current.innerHTML = "";
          }

          // Get coordinates for map center
          let lat, lng;
          if (hasInCoords) {
            lat = parseFloat(locationData.punch_in.latitude);
            lng = parseFloat(locationData.punch_in.longitude);
          } else if (hasOutCoords) {
            lat = parseFloat(locationData.punch_out.latitude);
            lng = parseFloat(locationData.punch_out.longitude);
          } else {
            return; // No coordinates to show on map
          }

          const map = L.map(mapRef.current).setView([lat, lng], 15);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map);

          // Add marker for punch in location if coordinates exist
          if (hasInCoords) {
            const inLat = parseFloat(locationData.punch_in.latitude);
            const inLng = parseFloat(locationData.punch_in.longitude);
            L.marker([inLat, inLng])
              .addTo(map)
              .bindPopup(`
                <b>📍 Punch In Location</b><br/>
                Time: ${locationData.punch_in.time || "N/A"}<br/>
                ${locationData.punch_in.address || `${inLat}, ${inLng}`}
              `)
              .openPopup();
          }

          // Add marker for punch out location if coordinates exist
          if (hasOutCoords) {
            const outLat = parseFloat(locationData.punch_out.latitude);
            const outLng = parseFloat(locationData.punch_out.longitude);
            L.marker([outLat, outLng])
              .addTo(map)
              .bindPopup(`
                <b>📍 Punch Out Location</b><br/>
                Time: ${locationData.punch_out.time || "N/A"}<br/>
                ${locationData.punch_out.address || `${outLat}, ${outLng}`}
              `);
          }

          // Fit bounds to show all markers
          const markers = [];
          if (hasInCoords) {
            markers.push([parseFloat(locationData.punch_in.latitude), parseFloat(locationData.punch_in.longitude)]);
          }
          if (hasOutCoords) {
            markers.push([parseFloat(locationData.punch_out.latitude), parseFloat(locationData.punch_out.longitude)]);
          }

          if (markers.length > 1) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50] });
          } else if (markers.length === 1) {
            map.setView(markers[0], 15);
          }

          mapRef.current._leaflet_map = map;
        } catch (error) {
          console.error("Failed to load map:", error);
        }
      };

      initMap();

      return () => {
        if (mapRef.current?._leaflet_map) {
          mapRef.current._leaflet_map.remove();
        }
      };
    }
  }, [isOpen, locationData]);

  if (!isOpen) return null;

  const hasPunchInLocation = hasLocationData(locationData?.punch_in);
  const hasPunchOutLocation = hasLocationData(locationData?.punch_out);
  const hasInCoords = hasCoordinates(locationData?.punch_in);
  const hasOutCoords = hasCoordinates(locationData?.punch_out);
  const showMap = hasInCoords || hasOutCoords;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-soft-lg">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-blue-500"></i>
            Location Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Employee Info */}
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block">
                  Employee
                </label>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {locationData?.employeeName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block">
                  Date
                </label>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {locationData?.date || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Punch In Location */}
          <div className="mb-5">
            <h4 className="text-base font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
              <i className="fas fa-sign-in-alt"></i>
              Punch In Location
            </h4>
            {hasPunchInLocation ? (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block">
                      Time
                    </label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {locationData.punch_in.time || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block">
                      Coordinates
                    </label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {locationData.punch_in.latitude && locationData.punch_in.longitude 
                        ? `${locationData.punch_in.latitude}, ${locationData.punch_in.longitude}`
                        : "Not available"}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                    {locationData.punch_in.address || "No address available"}
                  </p>
                </div>
                <a
                  href={getGoogleMapsUrl(locationData.punch_in)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-external-link-alt"></i>
                  Open in Google Maps
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center text-gray-500">
                <i className="fas fa-map-marker-alt text-2xl mb-2 block"></i>
                <p>No punch in location recorded</p>
              </div>
            )}
          </div>

          {/* Punch Out Location */}
          <div className="mb-5">
            <h4 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
              <i className="fas fa-sign-out-alt"></i>
              Punch Out Location
            </h4>
            {hasPunchOutLocation ? (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block">
                      Time
                    </label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {locationData.punch_out.time || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block">
                      Coordinates
                    </label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {locationData.punch_out.latitude && locationData.punch_out.longitude 
                        ? `${locationData.punch_out.latitude}, ${locationData.punch_out.longitude}`
                        : "Not available"}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                    {locationData.punch_out.address || "No address available"}
                  </p>
                </div>
                <a
                  href={getGoogleMapsUrl(locationData.punch_out)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-external-link-alt"></i>
                  Open in Google Maps
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center text-gray-500">
                <i className="fas fa-map-marker-alt text-2xl mb-2 block"></i>
                <p>No punch out location recorded</p>
              </div>
            )}
          </div>

          {/* Map View - Only show if we have coordinates */}
          {showMap && (
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <i className="fas fa-map"></i>
                Map View
                {!hasInCoords && hasPunchInLocation && (
                  <span className="text-xs text-amber-500 font-normal ml-2">
                    (Address-only location - map not available)
                  </span>
                )}
              </h4>
              <div
                ref={mapRef}
                style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                className="bg-gray-100 dark:bg-gray-700"
              />
            </div>
          )}

          {/* Show address-only message if no coordinates */}
          {!showMap && (hasPunchInLocation || hasPunchOutLocation) && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-amber-500 text-lg mt-0.5"></i>
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Location Address Available
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    The location address is recorded but coordinates are not available for map display.
                    You can still view the address above and open it in Google Maps.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationViewModal;