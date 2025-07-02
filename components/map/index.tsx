"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Plus,
  Minus,
  Clock,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react";
import L from "leaflet";
import { Loader2 } from "lucide-react";
import { useLocation } from "@/contexts/divisionContext";
import { cn } from "@/lib/utils";

// Type definitions
type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "heavy-rain"
  | "thunderstorm";

type WeatherData = {
  temp: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
};

type DistrictFeature = {
  type: string;
  properties: {
    name: string;
    id: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
};

type DistrictFeatureCollection = {
  type: string;
  features: DistrictFeature[];
};

type DateWeatherData = {
  [district: string]: WeatherData;
};

type WeatherDataMap = {
  [date: string]: DateWeatherData;
};

// Constants
const ZOOM_LEVELS = {
  country: 7,
  division: 8,
  district: 10,
  upazila: 12,
};

const BANGLADESH_BOUNDS: L.LatLngBoundsLiteral = [
  [20.5, 88.0], // Southwest corner
  [26.5, 92.5], // Northeast corner
];

const weatherIcons: Record<WeatherCondition, string> = {
  sunny: "☀️",
  "partly-cloudy": "⛅",
  cloudy: "☁️",
  rain: "🌧️",
  "heavy-rain": "⛈️",
  thunderstorm: "🌩️",
};

const weatherColors: Record<WeatherCondition, string> = {
  sunny: "#FFD700",
  "partly-cloudy": "#87CEEB",
  cloudy: "#708090",
  rain: "#4682B4",
  "heavy-rain": "#4169E1",
  thunderstorm: "#483D8B",
};

const dates = [
  "18-Oct",
  "19-Nov",
  "19-Dec",
  "19-Jan",
  "19-Feb",
  "19-Mar",
  "19-Apr",
  "19-May",
  "19-Jun",
];

// Fix for Leaflet icons in SSR/Next.js
function FixLeafletIcons() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  return null;
}

// Custom zoom control buttons
function CustomZoomControl() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-[1000]">
      <Button
        size="icon"
        variant="secondary"
        onClick={handleZoomIn}
        className="h-8 w-8 bg-white"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={handleZoomOut}
        className="h-8 w-8 bg-white"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Create a custom weather marker for each district
function createWeatherMarker(
  map: L.Map,
  feature: DistrictFeature,
  currentDate: string
): L.Marker | null {
  const id = feature.properties.id;
  const name = feature.properties.name;
  const coords = feature.geometry.coordinates[0];

  // Skip if no weather data for this district
  if (!weatherData[currentDate][id]) {
    console.warn(`No weather data for ${id} on ${currentDate}`);
    return null;
  }

  // Calculate center of the district
  const lat = coords.reduce((sum, point) => sum + point[1], 0) / coords.length;
  const lng = coords.reduce((sum, point) => sum + point[0], 0) / coords.length;

  // Get weather data for this district
  const data = weatherData[currentDate][id];

  // Create a custom div for the weather marker
  const weatherIcon = document.createElement("div");
  weatherIcon.className = "weather-marker";
  weatherIcon.innerHTML = `
    <div class="weather-icon" style="font-size: 24px; text-align: center;">${
      weatherIcons[data.condition]
    }</div>
    <div class="weather-temp" style="font-weight: bold; text-align: center;">${
      data.temp
    }°C</div>
  `;

  // Create a custom icon
  const customIcon = L.divIcon({
    html: weatherIcon,
    className: "weather-div-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Create marker with the custom icon
  const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

  // Add popup with detailed weather info
  marker.bindPopup(`
    <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${name}</div>
    <div style="font-size: 24px; text-align: center; margin-bottom: 5px;">${
      weatherIcons[data.condition]
    }</div>
    <div style="font-weight: bold; text-align: center; font-size: 18px; margin-bottom: 10px;">${
      data.temp
    }°C</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span>Rainfall:</span>
      <span>${data.rainfall} mm</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span>Humidity:</span>
      <span>${data.humidity}%</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Wind:</span>
      <span>${data.windSpeed} NM</span>
    </div>
  `);

  return marker;
}

// Dynamic Weather Map component
function DynamicWeatherMap({ currentDate }: { currentDate: string }) {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Style function for GeoJSON features
  const style = (feature: any) => {
    const id = feature.properties.id;
    const isSelected = selectedDistrict === id;
    const data = weatherData[currentDate][id];

    if (!data) {
      return {
        fillColor: "#cccccc",
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? "#000" : "white",
        dashArray: isSelected ? "" : "3",
        fillOpacity: isSelected ? 0.7 : 0.5,
      };
    }

    return {
      fillColor: weatherColors[data.condition],
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? "#000" : "white",
      dashArray: isSelected ? "" : "3",
      fillOpacity: isSelected ? 0.7 : 0.5,
    };
  };

  // Handle district click
  const zoomToFeature = (e: L.LeafletMouseEvent) => {
    const layer = e.target;
    const id = layer.feature.properties.id;

    if (selectedDistrict === id) {
      setSelectedDistrict(null);
      map.flyToBounds(geoJsonLayerRef.current?.getBounds() as L.LatLngBounds, {
        duration: 0.8,
      });
    } else {
      setSelectedDistrict(id);
      map.flyToBounds(layer.getBounds(), {
        padding: [50, 50],
        maxZoom: 10,
        duration: 0.8,
      });
    }
  };

  // Add click handler
  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: zoomToFeature,
    });
  };

  useEffect(() => {
    // Remove previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove previous GeoJSON layer
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
    }

    // Add new GeoJSON layer with updated styles
    geoJsonLayerRef.current = L.geoJSON(bangladeshDistricts as any, {
      style: style,
      onEachFeature: onEachFeature,
    }).addTo(map);

    // Add weather markers for each district
    bangladeshDistricts.features.forEach((feature) => {
      const marker = createWeatherMarker(map, feature, currentDate);
      if (marker) {
        markersRef.current.push(marker);
      }
    });

    // Fit bounds to the GeoJSON
    map.fitBounds(geoJsonLayerRef.current.getBounds());

    // Reset selected district when date changes
    setSelectedDistrict(null);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
      }
    };
  }, [map, currentDate]);

  // Update styles when selected district changes
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(style);
    }
  }, [selectedDistrict]);

  return null;
}

// Weather legend component
function WeatherLegend() {
  return (
    <div className="absolute bottom-16 right-2 bg-white p-2 rounded shadow z-[1000] w-48">
      <h4 className="font-bold mb-1 text-center">Weather Conditions</h4>
      {Object.entries(weatherIcons).map(([condition, icon]) => (
        <div key={condition} className="flex items-center gap-2 text-xs mb-1">
          <div className="text-lg">{icon}</div>
          <div className="capitalize">{condition.replace("-", " ")}</div>
        </div>
      ))}
    </div>
  );
}

// Reset View Button component
function ResetViewButton() {
  const map = useMap();
  const { selectedDivision, selectedDistrict, selectedUpazila } = useLocation();

  // Helper function to find polygons in the map by color
  const findPolygonsInMap = (color: string): L.Polygon[] => {
    const polygons: L.Polygon[] = [];

    // Safely iterate through all layers
    map.eachLayer((layer) => {
      // Check if it's a polygon with the specified color
      if (
        layer instanceof L.Polygon &&
        layer.options &&
        layer.options.color === color
      ) {
        polygons.push(layer);
      }
    });

    return polygons;
  };

  const handleResetView = () => {
    if (selectedUpazila) {
      // Zoom to upazila with appropriate bounds if available
      try {
        // Find all polygons in the map
        const polygons = findPolygonsInMap("red");
        if (polygons.length > 0) {
          // Use the first found polygon
          map.flyToBounds(polygons[0].getBounds(), {
            padding: [50, 50],
            maxZoom: ZOOM_LEVELS.upazila,
            duration: 0.8,
          });
          return;
        }
      } catch (error) {
        console.error("Error finding upazila polygon:", error);
      }
      // Fallback to coordinates if polygon not found
      map.flyTo(selectedUpazila.coordinates, ZOOM_LEVELS.upazila, {
        duration: 0.8,
      });
    } else if (selectedDistrict) {
      // Zoom to district with appropriate bounds if available
      try {
        // Find all polygons in the map
        const polygons = findPolygonsInMap("green");
        if (polygons.length > 0) {
          // Use the first found polygon
          map.flyToBounds(polygons[0].getBounds(), {
            padding: [50, 50],
            maxZoom: ZOOM_LEVELS.district,
            duration: 0.8,
          });
          return;
        }
      } catch (error) {
        console.error("Error finding district polygon:", error);
      }
      // Fallback to coordinates if polygon not found
      map.flyTo(selectedDistrict.coordinates, ZOOM_LEVELS.district, {
        duration: 0.8,
      });
    } else if (selectedDivision) {
      // Zoom to division with appropriate bounds if available
      try {
        // Find all polygons in the map
        const polygons = findPolygonsInMap("blue");
        if (polygons.length > 0) {
          // Use the first found polygon
          map.flyToBounds(polygons[0].getBounds(), {
            padding: [50, 50],
            maxZoom: ZOOM_LEVELS.division,
            duration: 0.8,
          });
          return;
        }
      } catch (error) {
        console.error("Error finding division polygon:", error);
      }
      // Fallback to coordinates if polygon not found
      map.flyTo(selectedDivision.coordinates, ZOOM_LEVELS.division, {
        duration: 0.8,
      });
    } else {
      // Zoom to country
      map.flyToBounds(BANGLADESH_BOUNDS, {
        duration: 0.8,
      });
    }
  };

  return (
    <div className="absolute top-12 left-2 z-[1000]">
      <Button
        size="sm"
        variant="secondary"
        onClick={handleResetView}
        className="bg-white"
      >
        Reset View
      </Button>
    </div>
  );
}

// Main component
export default function MapComponent() {
  const [currentDate, setCurrentDate] = useState(dates[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  const mapRef = useRef<L.Map | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const { selectedDivision, selectedDistrict, selectedUpazila } = useLocation();

  const [divisionBoundary, setDivisionBoundary] = useState<
    L.LatLngExpression[][]
  >([]);
  const [districtBoundary, setDistrictBoundary] = useState<
    L.LatLngExpression[][]
  >([]);
  const [upazilaBoundary, setUpazilaBoundary] = useState<
    L.LatLngExpression[][]
  >([]);

  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([
    23.685, 90.3563,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to zoom to a location with boundary - kept for reference
  // const zoomToBoundary = (boundary: L.LatLngExpression[][], level: keyof typeof ZOOM_LEVELS) => {
  //   if (mapRef.current && boundary.length > 0) {
  //     const polygon = L.polygon(boundary);
  //     mapRef.current.flyToBounds(polygon.getBounds(), {
  //       padding: [50, 50],
  //       maxZoom: ZOOM_LEVELS[level],
  //       duration: 0.8, // Faster animation
  //     });
  //     return true;
  //   }
  //   return false;
  // };

  const fetchBoundary = useCallback(
    async (osmId: number, type: "division" | "district" | "upazila") => {
      setIsLoading(true);
      try {
        const apiUrl = `https://polygons.openstreetmap.fr/get_geojson.py?id=${osmId}&params=0`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        let coordinates: L.LatLngExpression[][] = [];

        if (data?.type === "MultiPolygon") {
          coordinates = data.coordinates.map((polygon: number[][][]) =>
            polygon[0].map((coord: number[]) => [coord[1], coord[0]])
          );
        } else if (data?.type === "Polygon") {
          coordinates = [
            data.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
          ];
        } else {
          console.error("Boundary data format not recognized:", data);
          coordinates = [];
        }

        switch (type) {
          case "division":
            setDivisionBoundary(coordinates);
            // Apply zoom directly here after boundary is loaded
            if (mapRef.current && coordinates.length > 0) {
              const polygon = L.polygon(coordinates);
              mapRef.current.flyToBounds(polygon.getBounds(), {
                padding: [50, 50],
                maxZoom: ZOOM_LEVELS.division,
                duration: 0.8,
              });
            }
            break;
          case "district":
            setDistrictBoundary(coordinates);
            // Apply zoom directly here after boundary is loaded
            if (mapRef.current && coordinates.length > 0) {
              const polygon = L.polygon(coordinates);
              mapRef.current.flyToBounds(polygon.getBounds(), {
                padding: [50, 50],
                maxZoom: ZOOM_LEVELS.district,
                duration: 0.8,
              });
            }
            break;
          case "upazila":
            setUpazilaBoundary(coordinates);
            // Apply zoom directly here after boundary is loaded
            if (mapRef.current && coordinates.length > 0) {
              const polygon = L.polygon(coordinates);
              mapRef.current.flyToBounds(polygon.getBounds(), {
                padding: [50, 50],
                maxZoom: ZOOM_LEVELS.upazila,
                duration: 0.8,
              });
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} boundary:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [mapRef]
  );

  // No longer needed since we always fetch boundaries
  // const initialSelectionRef = useRef(true);

  // Effect to clear boundaries when selection changes
  useEffect(() => {
    // When selection changes, clear the boundaries that are no longer relevant
    if (!selectedDivision) {
      setDivisionBoundary([]);
      setDistrictBoundary([]);
      setUpazilaBoundary([]);
    } else if (!selectedDistrict) {
      setDistrictBoundary([]);
      setUpazilaBoundary([]);
    } else if (!selectedUpazila) {
      setUpazilaBoundary([]);
    }
  }, [selectedDivision, selectedDistrict, selectedUpazila]);

  // Effect to handle zooming and boundary fetching
  useEffect(() => {
    if (selectedUpazila) {
      setIsLoading(true);
      setMapCenter(selectedUpazila.coordinates);

      // Always fetch boundary for upazila to ensure we have the latest
      fetchBoundary(selectedUpazila.osmId, "upazila");
    } else if (selectedDistrict) {
      setIsLoading(true);
      setMapCenter(selectedDistrict.coordinates);

      // Always fetch boundary for district to ensure we have the latest
      fetchBoundary(selectedDistrict.osmId, "district");
    } else if (selectedDivision) {
      setIsLoading(true);
      setMapCenter(selectedDivision.coordinates);

      // Always fetch boundary for division to ensure we have the latest
      fetchBoundary(selectedDivision.osmId, "division");
    } else {
      if (mapRef.current) {
        mapRef.current.flyToBounds(BANGLADESH_BOUNDS, {
          duration: 0.8,
        });
      }
    }
  }, [selectedDivision, selectedDistrict, selectedUpazila, fetchBoundary]);

  const dateIndex = dates.indexOf(currentDate);

  const handleDateChange = (value: number[]) => {
    setCurrentDate(dates[value[0]]);
  };

  // Toggle play/pause animation
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Animation effect
  useEffect(() => {
    if (isPlaying) {
      let currentIndex = dateIndex;

      animationRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % dates.length;
        setCurrentDate(dates[currentIndex]);
      }, 1500); // Change every 1.5 seconds
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, dateIndex]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get current weather summary for the selected date
  const getWeatherSummary = (date: string) => {
    const allDistricts = Object.values(weatherData[date]);
    const avgTemp = Math.round(
      allDistricts.reduce((sum, d) => sum + d.temp, 0) / allDistricts.length
    );
    const maxTemp = Math.max(...allDistricts.map((d) => d.temp));
    const minTemp = Math.min(...allDistricts.map((d) => d.temp));
    const totalRainfall = allDistricts.reduce((sum, d) => sum + d.rainfall, 0);
    const avgRainfall = Math.round(totalRainfall / allDistricts.length);

    // Count conditions to find most common
    const conditionCounts: Record<string, number> = {};
    allDistricts.forEach((d) => {
      conditionCounts[d.condition] = (conditionCounts[d.condition] || 0) + 1;
    });

    const mostCommonCondition = Object.entries(conditionCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0] as WeatherCondition;

    return {
      avgTemp,
      maxTemp,
      minTemp,
      avgRainfall,
      mostCommonCondition,
      icon: weatherIcons[mostCommonCondition],
    };
  };

  const weatherSummary = getWeatherSummary(currentDate);

  return (
    <div className="relative h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      {/* BBC-style header */}
      <div className="absolute top-0 left-0 right-0 bg-[#0f0f0f] text-white z-[1001] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="font-bold text-lg">Bangladesh Weather</div>
          <div className="text-sm text-gray-300 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated: {currentTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Thermometer className="h-4 w-4 text-red-400" />
            <span>{weatherSummary.avgTemp}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span>{weatherSummary.avgRainfall} mm</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-4 w-4 text-gray-400" />
            <span>12 NM</span>
          </div>
        </div>
      </div>

      <div className={cn("relative")}>
        <MapContainer
          center={mapCenter}
          zoom={8}
          style={{ height: "600px", width: "100%" }}
          ref={mapRef}
          zoomControl={false}
          dragging={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
        >
          <FixLeafletIcons />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render administrative boundaries based on selection */}
          {selectedDivision && !selectedDistrict && !selectedUpazila && (
            <>
              <Marker position={selectedDivision.coordinates}>
                <Popup>{selectedDivision.name} Division</Popup>
              </Marker>
              {divisionBoundary.length > 0 &&
                divisionBoundary.map((polygon, index) => (
                  <Polygon
                    key={`div-${index}`}
                    positions={polygon}
                    color="blue"
                    fillOpacity={0.1}
                  />
                ))}
            </>
          )}

          {selectedDistrict && !selectedUpazila && (
            <>
              <Marker position={selectedDistrict.coordinates}>
                <Popup>{selectedDistrict.name} District</Popup>
              </Marker>
              {districtBoundary.length > 0 &&
                districtBoundary.map((polygon, index) => (
                  <Polygon
                    key={`dist-${index}`}
                    positions={polygon}
                    color="green"
                    fillOpacity={0.1}
                  />
                ))}
            </>
          )}

          {selectedUpazila && (
            <>
              <Marker position={selectedUpazila.coordinates}>
                <Popup>{selectedUpazila.name} Upazila</Popup>
              </Marker>
              {upazilaBoundary.length > 0 &&
                upazilaBoundary.map((polygon, index) => (
                  <Polygon
                    key={`upa-${index}`}
                    positions={polygon}
                    color="red"
                    fillOpacity={0.1}
                  />
                ))}
            </>
          )}

          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            </div>
          )}

          {/* Only show weather data when viewing Bangladesh or division level */}
          {(!selectedDivision || !selectedDistrict) && (
            <DynamicWeatherMap currentDate={currentDate} />
          )}

          <CustomZoomControl />
          <ResetViewButton />
        </MapContainer>
      </div>

      {/* Weather summary panel */}
      <div className="absolute top-14 right-2 bg-white p-3 rounded shadow z-[1000] w-64">
        <h3 className="font-bold text-lg mb-2">Weather Summary</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="text-4xl">{weatherSummary.icon}</div>
          <div className="text-2xl font-bold">{weatherSummary.avgTemp}°C</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-4 w-4 text-red-500" />
            <span>High: {weatherSummary.maxTemp}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="h-4 w-4 text-blue-500" />
            <span>Low: {weatherSummary.minTemp}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>Rainfall: {weatherSummary.avgRainfall} mm</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-4 w-4 text-gray-500" />
            <span>Wind: 12 NM</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600 capitalize">
          {weatherSummary.mostCommonCondition.replace("-", " ")} conditions
          across most areas
        </div>
      </div>

      <WeatherLegend />

      {/* Timeline controls */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-white p-2 rounded shadow z-[1000]">
        <div className="w-16">{dates[0]}</div>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        <div className="w-16">{dates[dates.length - 1]}</div>
        <div className="flex-1 px-4">
          <Slider
            value={[dateIndex]}
            max={dates.length - 1}
            step={1}
            onValueChange={handleDateChange}
          />
        </div>
        <div className="w-16 text-center">{currentDate}</div>
      </div>

      {/* BBC-style footer */}
      <div className="absolute bottom-14 left-2 right-2 max-w-sm mx-auto bg-amber-100/90 font-semibold p-2 rounded shadow z-[1000] text-xs text-center">
        Weather data is simulated for demonstration purposes. Click on districts
        to zoom in and see detailed weather information.
      </div>
    </div>
  );
}

// Data (move to separate file if preferred)
const bangladeshDistricts: DistrictFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Chittagong", id: "chittagong" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [91.7, 22.3],
            [92.0, 22.3],
            [92.0, 22.6],
            [91.7, 22.6],
            [91.7, 22.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Khulna", id: "khulna" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.5, 22.7],
            [89.7, 22.7],
            [89.7, 22.9],
            [89.5, 22.9],
            [89.5, 22.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Rajshahi", id: "rajshahi" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [88.5, 24.3],
            [88.7, 24.3],
            [88.7, 24.5],
            [88.5, 24.5],
            [88.5, 24.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Sylhet", id: "sylhet" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [91.8, 24.8],
            [92.0, 24.8],
            [92.0, 25.0],
            [91.8, 25.0],
            [91.8, 24.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Barisal", id: "barisal" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [90.3, 22.6],
            [90.5, 22.6],
            [90.5, 22.8],
            [90.3, 22.8],
            [90.3, 22.6],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Rangpur", id: "rangpur" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.2, 25.7],
            [89.4, 25.7],
            [89.4, 25.9],
            [89.2, 25.9],
            [89.2, 25.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Mymensingh", id: "mymensingh" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [90.3, 24.7],
            [90.5, 24.7],
            [90.5, 24.9],
            [90.3, 24.9],
            [90.3, 24.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Dhaka", id: "dhaka" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [90.3, 23.7],
            [90.5, 23.7],
            [90.5, 23.9],
            [90.3, 23.9],
            [90.3, 23.7],
          ],
        ],
      },
    },
  ],
};

// Weather data for each district and date
const weatherData: WeatherDataMap = {
  "18-Oct": {
    dhaka: {
      temp: 28,
      rainfall: 10,
      humidity: 75,
      windSpeed: 12,
      condition: "partly-cloudy",
    },
    chittagong: {
      temp: 27,
      rainfall: 25,
      humidity: 80,
      windSpeed: 15,
      condition: "rain",
    },
    khulna: {
      temp: 29,
      rainfall: 5,
      humidity: 70,
      windSpeed: 10,
      condition: "sunny",
    },
    rajshahi: {
      temp: 30,
      rainfall: 2,
      humidity: 65,
      windSpeed: 8,
      condition: "sunny",
    },
    sylhet: {
      temp: 26,
      rainfall: 40,
      humidity: 85,
      windSpeed: 14,
      condition: "heavy-rain",
    },
    barisal: {
      temp: 28,
      rainfall: 15,
      humidity: 78,
      windSpeed: 11,
      condition: "cloudy",
    },
    rangpur: {
      temp: 27,
      rainfall: 8,
      humidity: 72,
      windSpeed: 9,
      condition: "partly-cloudy",
    },
    mymensingh: {
      temp: 27,
      rainfall: 12,
      humidity: 76,
      windSpeed: 10,
      condition: "cloudy",
    },
  },
  "19-Nov": {
    dhaka: {
      temp: 25,
      rainfall: 5,
      humidity: 70,
      windSpeed: 10,
      condition: "sunny",
    },
    chittagong: {
      temp: 24,
      rainfall: 20,
      humidity: 75,
      windSpeed: 12,
      condition: "cloudy",
    },
    khulna: {
      temp: 26,
      rainfall: 2,
      humidity: 65,
      windSpeed: 8,
      condition: "sunny",
    },
    rajshahi: {
      temp: 27,
      rainfall: 0,
      humidity: 60,
      windSpeed: 7,
      condition: "sunny",
    },
    sylhet: {
      temp: 23,
      rainfall: 30,
      humidity: 80,
      windSpeed: 13,
      condition: "rain",
    },
    barisal: {
      temp: 25,
      rainfall: 10,
      humidity: 72,
      windSpeed: 9,
      condition: "partly-cloudy",
    },
    rangpur: {
      temp: 24,
      rainfall: 3,
      humidity: 68,
      windSpeed: 8,
      condition: "sunny",
    },
    mymensingh: {
      temp: 24,
      rainfall: 8,
      humidity: 71,
      windSpeed: 9,
      condition: "partly-cloudy",
    },
  },
  "19-Dec": {
    dhaka: {
      temp: 22,
      rainfall: 2,
      humidity: 65,
      windSpeed: 8,
      condition: "sunny",
    },
    chittagong: {
      temp: 21,
      rainfall: 15,
      humidity: 70,
      windSpeed: 10,
      condition: "cloudy",
    },
    khulna: {
      temp: 23,
      rainfall: 0,
      humidity: 60,
      windSpeed: 7,
      condition: "sunny",
    },
    rajshahi: {
      temp: 24,
      rainfall: 0,
      humidity: 55,
      windSpeed: 6,
      condition: "sunny",
    },
    sylhet: {
      temp: 20,
      rainfall: 20,
      humidity: 75,
      windSpeed: 11,
      condition: "rain",
    },
    barisal: {
      temp: 22,
      rainfall: 5,
      humidity: 68,
      windSpeed: 8,
      condition: "sunny",
    },
    rangpur: {
      temp: 21,
      rainfall: 1,
      humidity: 62,
      windSpeed: 7,
      condition: "sunny",
    },
    mymensingh: {
      temp: 21,
      rainfall: 3,
      humidity: 66,
      windSpeed: 8,
      condition: "sunny",
    },
  },
  "19-Jan": {
    dhaka: {
      temp: 20,
      rainfall: 0,
      humidity: 60,
      windSpeed: 7,
      condition: "sunny",
    },
    chittagong: {
      temp: 19,
      rainfall: 10,
      humidity: 65,
      windSpeed: 9,
      condition: "partly-cloudy",
    },
    khulna: {
      temp: 21,
      rainfall: 0,
      humidity: 55,
      windSpeed: 6,
      condition: "sunny",
    },
    rajshahi: {
      temp: 22,
      rainfall: 0,
      humidity: 50,
      windSpeed: 5,
      condition: "sunny",
    },
    sylhet: {
      temp: 18,
      rainfall: 15,
      humidity: 70,
      windSpeed: 10,
      condition: "cloudy",
    },
    barisal: {
      temp: 20,
      rainfall: 2,
      humidity: 62,
      windSpeed: 7,
      condition: "sunny",
    },
    rangpur: {
      temp: 19,
      rainfall: 0,
      humidity: 58,
      windSpeed: 6,
      condition: "sunny",
    },
    mymensingh: {
      temp: 19,
      rainfall: 1,
      humidity: 61,
      windSpeed: 7,
      condition: "sunny",
    },
  },
  "19-Feb": {
    dhaka: {
      temp: 23,
      rainfall: 5,
      humidity: 65,
      windSpeed: 8,
      condition: "partly-cloudy",
    },
    chittagong: {
      temp: 22,
      rainfall: 15,
      humidity: 70,
      windSpeed: 10,
      condition: "cloudy",
    },
    khulna: {
      temp: 24,
      rainfall: 2,
      humidity: 60,
      windSpeed: 7,
      condition: "sunny",
    },
    rajshahi: {
      temp: 25,
      rainfall: 3,
      humidity: 55,
      windSpeed: 6,
      condition: "sunny",
    },
    sylhet: {
      temp: 21,
      rainfall: 25,
      humidity: 75,
      windSpeed: 11,
      condition: "rain",
    },
    barisal: {
      temp: 23,
      rainfall: 8,
      humidity: 68,
      windSpeed: 8,
      condition: "partly-cloudy",
    },
    rangpur: {
      temp: 22,
      rainfall: 4,
      humidity: 62,
      windSpeed: 7,
      condition: "sunny",
    },
    mymensingh: {
      temp: 22,
      rainfall: 6,
      humidity: 66,
      windSpeed: 8,
      condition: "partly-cloudy",
    },
  },
  "19-Mar": {
    dhaka: {
      temp: 27,
      rainfall: 15,
      humidity: 70,
      windSpeed: 9,
      condition: "cloudy",
    },
    chittagong: {
      temp: 26,
      rainfall: 30,
      humidity: 75,
      windSpeed: 12,
      condition: "rain",
    },
    khulna: {
      temp: 28,
      rainfall: 10,
      humidity: 65,
      windSpeed: 8,
      condition: "partly-cloudy",
    },
    rajshahi: {
      temp: 29,
      rainfall: 8,
      humidity: 60,
      windSpeed: 7,
      condition: "partly-cloudy",
    },
    sylhet: {
      temp: 25,
      rainfall: 45,
      humidity: 80,
      windSpeed: 13,
      condition: "heavy-rain",
    },
    barisal: {
      temp: 27,
      rainfall: 20,
      humidity: 72,
      windSpeed: 10,
      condition: "rain",
    },
    rangpur: {
      temp: 26,
      rainfall: 12,
      humidity: 68,
      windSpeed: 9,
      condition: "cloudy",
    },
    mymensingh: {
      temp: 26,
      rainfall: 18,
      humidity: 71,
      windSpeed: 10,
      condition: "cloudy",
    },
  },
  "19-Apr": {
    dhaka: {
      temp: 30,
      rainfall: 30,
      humidity: 75,
      windSpeed: 10,
      condition: "rain",
    },
    chittagong: {
      temp: 29,
      rainfall: 50,
      humidity: 80,
      windSpeed: 14,
      condition: "heavy-rain",
    },
    khulna: {
      temp: 31,
      rainfall: 25,
      humidity: 70,
      windSpeed: 9,
      condition: "rain",
    },
    rajshahi: {
      temp: 32,
      rainfall: 20,
      humidity: 65,
      windSpeed: 8,
      condition: "rain",
    },
    sylhet: {
      temp: 28,
      rainfall: 70,
      humidity: 85,
      windSpeed: 15,
      condition: "thunderstorm",
    },
    barisal: {
      temp: 30,
      rainfall: 35,
      humidity: 78,
      windSpeed: 11,
      condition: "rain",
    },
    rangpur: {
      temp: 29,
      rainfall: 28,
      humidity: 72,
      windSpeed: 10,
      condition: "rain",
    },
    mymensingh: {
      temp: 29,
      rainfall: 32,
      humidity: 76,
      windSpeed: 11,
      condition: "rain",
    },
  },
  "19-May": {
    dhaka: {
      temp: 32,
      rainfall: 50,
      humidity: 80,
      windSpeed: 12,
      condition: "heavy-rain",
    },
    chittagong: {
      temp: 31,
      rainfall: 80,
      humidity: 85,
      windSpeed: 16,
      condition: "thunderstorm",
    },
    khulna: {
      temp: 33,
      rainfall: 45,
      humidity: 75,
      windSpeed: 11,
      condition: "heavy-rain",
    },
    rajshahi: {
      temp: 34,
      rainfall: 40,
      humidity: 70,
      windSpeed: 10,
      condition: "rain",
    },
    sylhet: {
      temp: 30,
      rainfall: 100,
      humidity: 90,
      windSpeed: 18,
      condition: "thunderstorm",
    },
    barisal: {
      temp: 32,
      rainfall: 60,
      humidity: 82,
      windSpeed: 13,
      condition: "heavy-rain",
    },
    rangpur: {
      temp: 31,
      rainfall: 48,
      humidity: 78,
      windSpeed: 12,
      condition: "heavy-rain",
    },
    mymensingh: {
      temp: 31,
      rainfall: 55,
      humidity: 80,
      windSpeed: 13,
      condition: "heavy-rain",
    },
  },
  "19-Jun": {
    dhaka: {
      temp: 33,
      rainfall: 80,
      humidity: 85,
      windSpeed: 14,
      condition: "thunderstorm",
    },
    chittagong: {
      temp: 32,
      rainfall: 120,
      humidity: 90,
      windSpeed: 18,
      condition: "thunderstorm",
    },
    khulna: {
      temp: 34,
      rainfall: 70,
      humidity: 80,
      windSpeed: 13,
      condition: "heavy-rain",
    },
    rajshahi: {
      temp: 35,
      rainfall: 65,
      humidity: 75,
      windSpeed: 12,
      condition: "heavy-rain",
    },
    sylhet: {
      temp: 31,
      rainfall: 150,
      humidity: 95,
      windSpeed: 20,
      condition: "thunderstorm",
    },
    barisal: {
      temp: 33,
      rainfall: 90,
      humidity: 87,
      windSpeed: 15,
      condition: "thunderstorm",
    },
    rangpur: {
      temp: 32,
      rainfall: 75,
      humidity: 82,
      windSpeed: 14,
      condition: "heavy-rain",
    },
    mymensingh: {
      temp: 32,
      rainfall: 85,
      humidity: 85,
      windSpeed: 15,
      condition: "thunderstorm",
    },
  },
};
