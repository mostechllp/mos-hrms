import { useEffect, useRef } from "react";

const LocationViewModal = ({ isOpen, onClose, locationData }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && locationData && locationData.punch_in?.latitude) {
      // Load leaflet dynamically if needed
      const initMap = async () => {
        try {
          const L = await import("leaflet");
          await import("leaflet/dist/leaflet.css");

          if (!mapRef.current) return;

          // Clear previous map
          if (mapRef.current._leaflet_id) {
            mapRef.current.innerHTML = "";
          }

          const latitude = parseFloat(locationData.punch_in.latitude);
          const longitude = parseFloat(locationData.punch_in.longitude);

          const map = L.map(mapRef.current).setView([latitude, longitude], 15);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map);

          // Add marker for punch in location
          L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`
              <b>Punch In Location</b><br/>
              Time: ${locationData.punch_in.time || "N/A"}<br/>
              ${locationData.punch_in.address || `${latitude}, ${longitude}`}
            `)
            .openPopup();

          // Add marker for punch out location if exists
          if (locationData.punch_out?.latitude) {
            const outLat = parseFloat(locationData.punch_out.latitude);
            const outLng = parseFloat(locationData.punch_out.longitude);
            
            L.marker([outLat, outLng])
              .addTo(map)
              .bindPopup(`
                <b>Punch Out Location</b><br/>
                Time: ${locationData.punch_out.time || "N/A"}<br/>
                ${locationData.punch_out.address || `${outLat}, ${outLng}`}
              `);

            // Fit bounds to show both markers
            const bounds = L.latLngBounds([
              [latitude, longitude],
              [outLat, outLng],
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
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

  const hasPunchInLocation = locationData?.punch_in?.latitude;
  const hasPunchOutLocation = locationData?.punch_out?.latitude;
  const googleMapsUrl = hasPunchInLocation
    ? `https://www.google.com/maps?q=${locationData.punch_in.latitude},${locationData.punch_in.longitude}`
    : "#";

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
                      {locationData.punch_in.latitude}, {locationData.punch_in.longitude}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {locationData.punch_in.address || "No address available"}
                  </p>
                </div>
                <a
                  href={googleMapsUrl}
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
                      {locationData.punch_out.latitude}, {locationData.punch_out.longitude}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {locationData.punch_out.address || "No address available"}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${locationData.punch_out.latitude},${locationData.punch_out.longitude}`}
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

          {/* Map View */}
          {hasPunchInLocation && (
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <i className="fas fa-map"></i>
                Map View
              </h4>
              <div
                ref={mapRef}
                style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                className="bg-gray-100 dark:bg-gray-700"
              />
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