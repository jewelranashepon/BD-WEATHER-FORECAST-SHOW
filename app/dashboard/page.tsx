"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Station } from "@prisma/client";
import WeatherDashboard from "@/components/msn-weather";

const MapComponent = dynamic(
  () => import("@/components/map/MapComponent"),
  { ssr: false }
);

const MapControls = dynamic(() => import("@/components/map/map-controls"), {
  ssr: false,
});

export default function DroughtDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Bangladesh");
  const [selectedPeriod, setSelectedPeriod] = useState("1 Month");
  const [selectedIndex, setSelectedIndex] = useState("Rainfall");
  const [currentDate, setCurrentDate] = useState("18-Oct");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  return (
    <div className="flex flex-col h-screen">
      {/* Responsive Layout for Controls and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-5 rounded-lg shadow mb-4">
        {/* MapControls: Full width on mobile, 1 col on lg */}
        <div className="order-1 lg:order-1 lg:col-span-1 p-4">
          <MapControls
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
          />
        </div>

        {/* MapComponent: Full width on mobile, 4 col on lg */}
        <div className="order-2 lg:order-2 lg:col-span-4 p-4">
          <MapComponent
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            selectedStation={selectedStation}
            onStationSelect={setSelectedStation}
          />
        </div>
      </div>

      {/* Weather Dashboard always full width */}
      <div className="grid grid-cols-1 gap-4 md:p-4 ">
        <WeatherDashboard selectedStation={selectedStation} />
      </div>
    </div>
  );
}
