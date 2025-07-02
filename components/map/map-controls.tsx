"use client";

import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";

interface Station {
  id: string;
  stationId: string;
  name: string;
  latitude: number;
  longitude: number;
  securityCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function MapControls({
  selectedRegion,
  setSelectedRegion,
  selectedPeriod,
  setSelectedPeriod,
  selectedIndex,
  setSelectedIndex,
  selectedStation,
  setSelectedStation,
}: {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
}) {
  const { data: session } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stations based on user role
  // useEffect(() => {
  //   const fetchStations = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await fetch("/api/stationlocation");
  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       setStations(data);

  //       // If user is station_admin or observer, auto-select their station
  //       if (
  //         session?.user?.role === "station_admin" ||
  //         session?.user?.role === "observer"
  //       ) {
  //         const userStation = data.find(
  //           (station: Station) => station.stationId === session?.user?.station?.stationId
  //         );
  //         if (userStation) {
  //           setSelectedStation(userStation);
  //           setSelectedRegion("station");
  //         }
  //       }
  //     } catch (err) {
  //       setError("Failed to fetch stations");
  //       console.error("Error fetching stations:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchStations();
  // }, [session, setSelectedStation, setSelectedRegion]);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stationlocation");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setStations(data);

        const userStation = data.find(
          (station: Station) =>
            station.stationId === session?.user?.station?.stationId
        );

        // Handle all roles (station_admin, observer, super_admin)
        if (userStation) {
          setSelectedStation(userStation);
          setSelectedRegion("station");
        }
      } catch (err) {
        setError("Failed to fetch stations");
        console.error("Error fetching stations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.station?.stationId) {
      fetchStations();
    }
  }, [session, setSelectedStation, setSelectedRegion]);

  // Filter stations based on user role
  const permittedStations =
    session?.user.role === "super_admin"
      ? stations
      : stations.filter(
        (station) => station.stationId === session?.user?.station?.stationId
      );

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">
        Map Controls
      </h3>

      <label className="block text-sm font-medium text-gray-700 mb-1.5">Stations</label>
      <Select
        value={selectedStation?.stationId || ""}
        onValueChange={(value) => {
          const station = stations.find((s) => s.stationId === value);
          setSelectedStation(station || null);
        }}
        disabled={loading || permittedStations.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              loading
                ? "Loading..."
                : permittedStations.length === 0
                  ? "No stations"
                  : "Select Station"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {permittedStations.map((station) => (
            <SelectItem key={station.id} value={station.stationId}>
              {station.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <div className="mt-4 text-red-600 text-sm">Error: {error}</div>}
    </div>
  );
}
