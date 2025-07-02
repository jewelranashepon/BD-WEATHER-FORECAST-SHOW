"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { utcToHour } from "@/lib/utils";

interface Station {
  id: string;
  stationId: string;
  name: string;
  securityCode: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface MeteorologicalEntry {
  id: string;
  observingTimeId: string;
  dataType: string;
  subIndicator: string;
  alteredThermometer: string;
  barAsRead: string;
  correctedForIndex: string;
  heightDifference: string;
  correctionForTemp: string;
  stationLevelPressure: string;
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
  afternoonReading: string;
  pressureChange24h: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  dryBulbCorrected: string;
  wetBulbCorrected: string;
  maxMinTempCorrected: string;
  Td: string;
  relativeHumidity: string;
  squallConfirmed: string;
  squallForce: string;
  squallDirection: string;
  squallTime: string;
  horizontalVisibility: string;
  miscMeteors: string;
  pastWeatherW1: string;
  pastWeatherW2: string;
  presentWeatherWW: string;
  c2Indicator: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ObservingTimeEntry {
  id: string;
  userId: string;
  stationId: string;
  utcTime: string;
  localTime: string;
  createdAt: string;
  updatedAt: string;
  station: Station;
  MeteorologicalEntry: MeteorologicalEntry[];
}

interface FirstCardTableProps {
  refreshTrigger?: number;
}

// Update the canEditRecord function to use ObservingTime instead of observingTime
const canEditRecord = (record: MeteorologicalEntry, user: any): boolean => {
  if (!user) return false;
  if (!record.createdAt) return true;

  try {
    const submissionDate = parseISO(record.createdAt);
    if (!isValid(submissionDate)) return true;

    const now = new Date();
    const daysDifference = differenceInDays(now, submissionDate);
    const role = user.role;
    const userId = user.id;
    const userStationId = user.station?.id;
    
    // Access ObservingTime instead of observingTime
    const recordStationId = record.ObservingTime?.stationId;
    const recordUserId = record.ObservingTime?.userId;

    if (role === "super_admin") return daysDifference <= 365;
    if (role === "station_admin") {
      return daysDifference <= 30 && userStationId === recordStationId;
    }
    if (role === "observer") {
      return daysDifference <= 2 && userId === recordUserId;
    }
    return false;
  } catch (e) {
    console.warn("Error in canEditRecord:", e);
    return false;
  }
};

export function FirstCardTable({ refreshTrigger = 0 }: FirstCardTableProps) {
  const [data, setData] = useState<ObservingTimeEntry[]>([]);
  const [flattenedData, setFlattenedData] = useState<MeteorologicalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize with today's date by default
  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dateError, setDateError] = useState<string | null>(null);
  const [stationFilter, setStationFilter] = useState("all");
  const [stations, setStations] = useState<Station[]>([]);
  const { data: session } = useSession();
  const user = session?.user;
  const isSuperAdmin = user?.role === "super_admin";
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MeteorologicalEntry | null>(null);
  const [selectedObservingTime, setSelectedObservingTime] =
    useState<ObservingTimeEntry | null>(null);
  const [editFormData, setEditFormData] = useState<
    Partial<MeteorologicalEntry>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch meteorological data with date range
      const response = await fetch(
        `/api/first-card-data?startDate=${startDate}&endDate=${endDate}${stationFilter !== "all" ? `&stationId=${stationFilter}` : ""}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result.entries || []);

      // Flatten the data for easier display
      const flattened: MeteorologicalEntry[] = [];
      result.entries.forEach((observingTime: ObservingTimeEntry) => {
        observingTime.MeteorologicalEntry.forEach(
          (entry: MeteorologicalEntry) => {
            flattened.push({
              ...entry,
              observingTimeId: observingTime.id,
              stationId: observingTime.stationId,
            });
          }
        );
      });
      setFlattenedData(flattened);

      // Fetch stations if super admin
      if (isSuperAdmin) {
        const stationsResponse = await fetch("/api/stations");
        if (!stationsResponse.ok) {
          throw new Error("Failed to fetch stations");
        }
        const stationsResult = await stationsResponse.json();
        setStations(stationsResult);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch meteorological data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, startDate, endDate, stationFilter]);

  const goToPreviousWeek = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInRange = differenceInDays(end, start);

    // Calculate the new date range
    const newStart = new Date(start);
    newStart.setDate(start.getDate() - (daysInRange + 1));

    const newEnd = new Date(start);
    newEnd.setDate(start.getDate() - 1);

    // Always update the dates when going back
    setStartDate(format(newStart, "yyyy-MM-dd"));
    setEndDate(format(newEnd, "yyyy-MM-dd"));
    setDateError(null);
  };

  const goToNextWeek = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInRange = differenceInDays(end, start);
    
    // Calculate the new date range
    const newStart = new Date(start);
    newStart.setDate(start.getDate() + (daysInRange + 1));
    
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + daysInRange);
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If the new range would go beyond today, adjust it
    if (newEnd > today) {
      // If we're already at or beyond today, don't go further
      if (end >= today) {
        return;
      }
      // Otherwise, set the end to today and adjust the start accordingly
      const adjustedEnd = new Date(today);
      const adjustedStart = new Date(adjustedEnd);
      adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);
      
      setStartDate(format(adjustedStart, "yyyy-MM-dd"));
      setEndDate(format(adjustedEnd, "yyyy-MM-dd"));
    } else {
      // Update to the new range if it's valid
      setStartDate(format(newStart, "yyyy-MM-dd"));
      setEndDate(format(newEnd, "yyyy-MM-dd"));
    }
    
    setDateError(null);
  };

  const getWeatherStatusColor = (humidity: string) => {
    const humidityValue = Number.parseInt(humidity || "0");
    if (humidityValue >= 80) return "bg-blue-500";
    if (humidityValue >= 60) return "bg-green-500";
    if (humidityValue >= 40) return "bg-yellow-500";
    if (humidityValue >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const handleEditClick = (
    record: MeteorologicalEntry,
    observingTime: ObservingTimeEntry
  ) => {
    if (user && canEditRecord(record, user)) {
      setSelectedRecord(record);
      setSelectedObservingTime(observingTime);
      setEditFormData(record);
      setIsEditDialogOpen(true);
    } else {
      setIsPermissionDeniedOpen(true);
    }
  };

  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate);
    const otherDate =
      type === "start" ? new Date(endDate) : new Date(startDate);

    if (isNaN(date.getTime())) {
      setDateError("Invalid date format");
      return;
    }

    // Reset error if dates are valid
    setDateError(null);

    if (type === "start") {
      if (date > otherDate) {
        setDateError("Start date cannot be after end date");
        return;
      }
      setStartDate(newDate);
    } else {
      if (date < otherDate) {
        setDateError("End date cannot be before start date");
        return;
      }
      setEndDate(newDate);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };


  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
  
    setIsSaving(true);
    try {
      const payload = {
        id: selectedRecord.id,
        ...editFormData,
      };
  
      console.log("Sending payload:", payload); // Debug log
  
      const response = await fetch("/api/first-card-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Debug log
        throw new Error(errorData.message || "Failed to update record");
      }
  
      const result = await response.json();
      console.log("Update successful:", result); // Debug log
  
      // Update the local state
      setFlattenedData((prevData) =>
        prevData.map((item) =>
          item.id === selectedRecord.id ? { ...item, ...editFormData } : item
        )
      );
  
      setData((prevData) =>
        prevData.map((observingTime) => ({
          ...observingTime,
          MeteorologicalEntry: observingTime.MeteorologicalEntry.map((entry) =>
            entry.id === selectedRecord.id
              ? { ...entry, ...editFormData }
              : entry
          ),
        }))
      );
  
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error(`Failed to update record: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getStationNameById = (stationId: string): string => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : stationId;
  };

  return (
    <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousWeek}
                  className="hover:bg-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    max={endDate}
                    className="text-xs p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    min={startDate}
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="text-xs p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextWeek}
                  className="hover:bg-slate-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-purple-500" />
                <Label
                  htmlFor="stationFilter"
                  className="whitespace-nowrap font-medium text-slate-700"
                >
                  Station:
                </Label>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger className="w-[200px] border-slate-300 focus:ring-purple-500">
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name} ({station.stationId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
            <div className="flex justify-around gap-4">
              <div className="flex flex-col">
                <Label className="text-sm font-medium text-slate-900 mb-2">
                  DATA TYPE
                </Label>
                <div className="flex gap-1">
                  {["S", "Y"].map((char, i) => (
                    <Input
                      key={`dataType-${i}`}
                      className="w-12 text-center p-2 bg-slate-100 border border-slate-400 shadow-sm"
                      defaultValue={char}
                      readOnly
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600">
                  STATION NO
                </div>
                <div className="flex h-10 border border-slate-400 rounded-lg p-2 mx-auto">
                  {user?.station?.stationId || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600">
                  STATION NAME
                </div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-cente font-mono rounded-md">
                  {user?.station?.name || "N/A"}
                </div>
              </div>

              <div>
                <div className="font-bold uppercase text-slate-600">YEAR</div>
                <div className="flex mt-1">
                  <div className="w-12 h-10 border border-slate-400 flex items-center justify-center p-2 font-mono rounded-l-md">
                    {new Date().getFullYear().toString().slice(-2, -1)}
                  </div>
                  <div className="w-12 h-10 border-t border-r border-b border-slate-400 flex items-center justify-center p-2 font-mono rounded-r-md">
                    {new Date().getFullYear().toString().slice(-1)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                      GG
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                      CI
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                      Date
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                      Station
                    </th>
                    <th
                      colSpan={9}
                      className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
                    >
                      BAR PRESSURE
                    </th>
                    <th
                      colSpan={6}
                      className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 p-1 text-cyan-800"
                    >
                      TEMPERATURE
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                    >
                      Td
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                    >
                      R.H.
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                    >
                      SQUALL
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      VV
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    ></th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                    >
                      WEATHER
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      Actions
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">
                        Time of Observation (UTC)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Indicator</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Date</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Station ID</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Attached Thermometer (°C)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Bar As Read (hPa)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Corrected for Index
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Height Difference Correction (hPa)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Station Level Pressure (QFE)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Sea Level Reduction
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Sea Level Pressure (QNH)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Afternoon Reading
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">24-Hour Change</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                      <div className="h-16 text-teal-800">
                        Dew Point Temperature (°C)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                      <div className="h-16 text-teal-800">
                        Relative Humidity (%)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Force (KTS)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Direction (dq)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Time (q1)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">
                        Horizontal Visibility (km)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">
                        Misc. Meteors (Code)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Past W₁</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Past W2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Present ww</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
                      <div className="h-16 text-gray-800">Edit</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={27} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <span className="ml-3 text-indigo-600 font-medium">
                            Loading data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={27} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CloudSun size={48} className="text-slate-400 mb-3" />
                          <p className="text-lg font-medium">
                            No first card data found
                          </p>
                          <p className="text-sm">
                            Try selecting a different date or station
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.flatMap((observingTime, obsIndex) =>
                      observingTime.MeteorologicalEntry.map(
                        (record, entryIndex) => {
                          const humidityClass = getWeatherStatusColor(
                            record.relativeHumidity
                          );
                          const canEdit = user && canEditRecord(record, user);
                          const rowIndex =
                            obsIndex *
                              observingTime.MeteorologicalEntry.length +
                            entryIndex;

                          return (
                            <tr
                              key={record.id}
                              className={`text-center font-mono hover:bg-slate-50 transition-colors ${
                                rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                              }`}
                            >
                              <td className="border border-slate-300 p-1 font-medium text-indigo-700">
                                {utcToHour(observingTime.utcTime.toString())}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.subIndicator || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-indigo-700 whitespace-nowrap">
                              {new Date(observingTime.utcTime).toLocaleDateString()}
                              </td>
                              <td className="border border-slate-300 p-1">
                                <Badge variant="outline" className="font-mono">
                                  {observingTime.station.stationId || "--"}
                                </Badge>
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.alteredThermometer || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                {record.barAsRead || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.correctedForIndex || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.heightDifference || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                {record.stationLevelPressure || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.seaLevelReduction || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                {record.correctedSeaLevelPressure || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.afternoonReading || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.pressureChange24h || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                                {record.dryBulbAsRead || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.wetBulbAsRead || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.maxMinTempAsRead || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                                {record.dryBulbCorrected || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.wetBulbCorrected || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.maxMinTempCorrected || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-teal-700">
                                {record.Td || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                <Badge
                                  variant="outline"
                                  className={`${humidityClass} text-white`}
                                >
                                  {record.relativeHumidity || "--"}
                                </Badge>
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-amber-700">
                                {record.squallForce || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.squallDirection || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.squallTime || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-blue-700">
                                {record.horizontalVisibility || "--"}
                              </td>

                              <td className="border border-slate-300 p-1">
                                {record.miscMeteors || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.pastWeatherW1 || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                {record.pastWeatherW2 || "--"}
                              </td>
                              <td className="border border-slate-300 p-1 font-medium text-emerald-700">
                                {record.presentWeatherWW || "--"}
                              </td>
                              <td className="border border-slate-300 p-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() =>
                                          handleEditClick(record, observingTime)
                                        }
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                          />
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {canEdit
                                        ? "Edit this record"
                                        : "You don't have permission to edit this record"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-500" />
                <span className="text-sm text-slate-600">
                  Date Range:{" "}
                  <div className="text-center text-lg font-semibold text-slate-600">
                    {`${format(parseISO(startDate), "MMM d")} - ${format(parseISO(endDate), "MMM d, yyyy")}`}
                  </div>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-sky-100 text-sky-800 hover:bg-sky-200"
                >
                  {data.reduce(
                    (count, item) => count + item.MeteorologicalEntry.length,
                    0
                  )}{" "}
                  record(s)
                </Badge>
                {stationFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Station: {getStationNameById(stationFilter)} 
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[50vw] !max-w-[90vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-800">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit First Card Data
                </div>
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Editing record from{" "}
                {selectedObservingTime?.station?.name || "Unknown Station"} (
                {selectedObservingTime?.station?.stationId || "Unknown"}) on{" "}
                {selectedObservingTime?.utcTime
                  ? format(
                      new Date(selectedObservingTime.utcTime),
                      "MMMM d, yyyy"
                    )
                  : "Unknown Date"}
              </DialogDescription>
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 mt-2"></div>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                {/* Input Fields */}
                {[
                  {
                    id: "subIndicator",
                    label: "Indicator",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "alteredThermometer",
                    label: "Attached Thermometer (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "barAsRead",
                    label: "Bar As Read (hPa)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "correctedForIndex",
                    label: "Corrected for Index",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "heightDifference",
                    label: "Height Difference Correction (hPa)",
                    bg: "bg-indigo-50",
                    readOnly: true,
                  },
                  {
                    id: "stationLevelPressure",
                    label: "Station Level Pressure (QFE)",
                    bg: "bg-blue-50",
                    readOnly: true,
                  },
                  {
                    id: "seaLevelReduction",
                    label: "Sea Level Reduction",
                    bg: "bg-indigo-50",
                    readOnly: true,
                  },
                  {
                    id: "correctedSeaLevelPressure",
                    label: "Sea Level Pressure (QNH)",
                    bg: "bg-blue-50",
                    readOnly: true,
                  },
                  {
                    id: "afternoonReading",
                    label: "Afternoon Reading",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "pressureChange24h",
                    label: "24-Hour Pressure Change",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "dryBulbAsRead",
                    label: "Dry Bulb As Read (°C)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "wetBulbAsRead",
                    label: "Wet Bulb As Read (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "maxMinTempAsRead",
                    label: "MAX/MIN Temp As Read (°C)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "dryBulbCorrected",
                    label: "Dry Bulb Corrected (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "wetBulbCorrected",
                    label: "Wet Bulb Corrected (°C)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "maxMinTempCorrected",
                    label: "MAX/MIN Temp Corrected (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "Td",
                    label: "Dew Point Temperature (°C)",
                    bg: "bg-indigo-50",
                    readOnly: true,
                  },
                  {
                    id: "relativeHumidity",
                    label: "Relative Humidity (%)",
                    bg: "bg-blue-50",
                    readOnly: true,
                  },
                  {
                    id: "squallForce",
                    label: "Squall Force (KTS)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "squallDirection",
                    label: "Squall Direction (°)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "squallTime",
                    label: "Squall Time",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "horizontalVisibility",
                    label: "Horizontal Visibility (km)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "miscMeteors",
                    label: "Misc Meteors (Code)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "pastWeatherW1",
                    label: "Past Weather (W₁)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "pastWeatherW2",
                    label: "Past Weather (W₂)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "presentWeatherWW",
                    label: "Present Weather (ww)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "c2Indicator",
                    label: "C2 Indicator",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                ].map((field) => (
                  <div
                    key={field.id}
                    className={`space-y-1 p-3 rounded-lg ${field.bg} border border-white shadow-sm`}
                  >
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      value={
                        editFormData[field.id as keyof typeof editFormData] ||
                        ""
                      }
                      onChange={handleEditInputChange}
                      readOnly={field.readOnly}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${field.readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permission Denied Dialog */}
        <Dialog
          open={isPermissionDeniedOpen}
          onOpenChange={setIsPermissionDeniedOpen}
        >
          <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Permission Denied
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-700">
                You don't have permission to edit this record. This could be
                because:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>The record is too old to edit</li>
                <li>The record belongs to a different station</li>
                <li>You don't have the required role permissions</li>
              </ul>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsPermissionDeniedOpen(false)}
                className="bg-slate-200 text-slate-800 hover:bg-slate-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
