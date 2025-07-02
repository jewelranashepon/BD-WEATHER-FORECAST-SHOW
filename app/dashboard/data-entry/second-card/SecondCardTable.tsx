"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, CloudSun, Filter, Loader2 } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/lib/auth-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { utcToHour } from "@/lib/utils"
import moment from "moment"

// Define the structure of weather observation data
interface WeatherObservation {
  id: string
  observingTimeId: string
  tabActive: string
  observerInitial: string | null
  lowCloudForm: string | null
  lowCloudHeight: string | null
  lowCloudAmount: string | null
  lowCloudDirection: string | null
  mediumCloudForm: string | null
  mediumCloudHeight: string | null
  mediumCloudAmount: string | null
  mediumCloudDirection: string | null
  highCloudForm: string | null
  highCloudHeight: string | null
  highCloudAmount: string | null
  highCloudDirection: string | null
  totalCloudAmount: string | null
  layer1Form: string | null
  layer1Height: string | null
  layer1Amount: string | null
  layer2Form: string | null
  layer2Height: string | null
  layer2Amount: string | null
  layer3Form: string | null
  layer3Height: string | null
  layer3Amount: string | null
  layer4Form: string | null
  layer4Height: string | null
  layer4Amount: string | null
  rainfallTimeStart: string | null
  rainfallTimeEnd: string | null
  rainfallSincePrevious: string | null
  rainfallDuringPrevious: string | null
  rainfallLast24Hours: string | null
  windFirstAnemometer: string | null
  windSecondAnemometer: string | null
  windSpeed: string | null
  windDirection: string | null
  submittedAt: string | null
  [key: string]: any
}

interface MeteorologicalEntry {
  id: string
  observingTimeId: string
  dataType: string
  subIndicator: string
  barAsRead: string
  heightDifference: string
  stationLevelPressure: string
  seaLevelReduction: string
  correctedSeaLevelPressure: string
  dryBulbAsRead: string
  wetBulbAsRead: string
  maxMinTempAsRead: string
  Td: string
  relativeHumidity: string
  squallConfirmed: string
  horizontalVisibility: string
  miscMeteors: string
  pastWeatherW1: string
  pastWeatherW2: string
  presentWeatherWW: string
  submittedAt: string | null
  [key: string]: any
}

interface ObservationData {
  id: string
  userId: string
  stationId: string
  utcTime: string
  localTime: string
  createdAt: string
  updatedAt: string
  station: {
    id: string
    stationId: string
    name: string
    latitude: number
    longitude: number
  }
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  MeteorologicalEntry: MeteorologicalEntry[]
  WeatherObservation: WeatherObservation[]
}

interface SecondCardTableProps {
  refreshTrigger?: number
}

// Helper function to determine if a user can edit an observation
function canEditObservation(record: ObservationData, sessionUser: any) {
  if (!sessionUser || !record.WeatherObservation?.[0]?.createdAt) return false;

  try {
    // createdAt is already a Date object from Prisma
    const observationDate = new Date(record.WeatherObservation[0].createdAt);
    const now = new Date();
    const daysDifference = differenceInDays(now, observationDate);

    const role = sessionUser.role;
    const userId = sessionUser.id;
    const userStationId = sessionUser.station?.stationId;
    const recordStationId = record.station?.stationId;
    const recordUserId = record.user?.id;

    if (role === "super_admin") return daysDifference <= 365;
    if (role === "station_admin") {
      return daysDifference <= 30 && userStationId === recordStationId;
    }
    if (role === "observer") {
      return daysDifference <= 1 && userId === recordUserId;
    }

    return false;
  } catch (e) {
    console.warn("Error in canEditObservation:", e);
    return false;
  }
}

// Helper function to get cloud status color
function getCloudStatusColor(amount: string | null) {
  if (!amount || amount === "--") return "bg-gray-400"

  const numAmount = Number.parseInt(amount)
  if (isNaN(numAmount)) return "bg-gray-400"

  if (numAmount <= 2) return "bg-sky-500"
  if (numAmount <= 4) return "bg-blue-500"
  if (numAmount <= 6) return "bg-indigo-500"
  if (numAmount <= 8) return "bg-purple-500"
  return "bg-slate-700"
}

export function SecondCardTable({ refreshTrigger = 0 }: SecondCardTableProps) {
  const [data, setData] = useState<ObservationData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [stationFilter, setStationFilter] = useState("all")
  const [stations, setStations] = useState<{ id: string; stationId: string; name: string }[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data: session } = useSession()
  const user = session?.user

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ObservationData | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<WeatherObservation>>({})
  const [isSaving, setIsSaving] = useState(false)
  const today = format(new Date(), "yyyy-MM-dd")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [dateError, setDateError] = useState<string | null>(null)

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true)

      // Build the URL with query parameters
      const url = new URL("/api/save-observation", window.location.origin)
      url.searchParams.append("startDate", startDate)
      url.searchParams.append("endDate", endDate)

      if (stationFilter !== "all") {
        url.searchParams.append("stationId", stationFilter)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error("Failed to fetch observation data")
      }

      const result = await response.json()
      setData(result.data)

      // Fetch stations if not already loaded
      if (stations.length === 0) {
        const stationsResponse = await fetch("/api/stations")
        if (!stationsResponse.ok) {
          throw new Error("Failed to fetch stations")
        }
        const stationsResult = await stationsResponse.json()
        setStations(stationsResult)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch weather observation data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount and when filters or refreshTrigger changes
  useEffect(() => {
    fetchData()
  }, [selectedDate, startDate, endDate, stationFilter, refreshTrigger])

  // Navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = new Date(currentDate)
    previousDay.setDate(currentDate.getDate() - 1)
    setSelectedDate(format(previousDay, "yyyy-MM-dd"))
  }

  // Navigate to next day
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = new Date(currentDate)
    nextDay.setDate(currentDate.getDate() + 1)
    setSelectedDate(format(nextDay, "yyyy-MM-dd"))
  }

  // Handle opening the edit dialog
  const handleEditClick = (record: ObservationData) => {
    if (!record.WeatherObservation || record.WeatherObservation.length === 0) {
      toast.error("No weather observation data found for this record");
      return;
    }

    if (!canEditObservation(record, session?.user)) {
      toast.error("You don't have permission to edit this record");
      return;
    }

    setSelectedRecord(record);
    setEditFormData({ ...record.WeatherObservation[0] });
    setIsEditDialogOpen(true);
  };

  // Handle input changes in the edit form
  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle saving the edited data
  const handleSaveEdit = async () => {
    if (!selectedRecord || !selectedRecord.WeatherObservation?.[0]) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/save-observation", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRecord.WeatherObservation[0].id,
          type: "weather", // Add this parameter
          ...editFormData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to update record");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      // Update the local state
      setData((prevData) =>
        prevData.map((item) => {
          if (item.id === selectedRecord.id) {
            return {
              ...item,
              WeatherObservation: [
                {
                  ...item.WeatherObservation[0],
                  ...editFormData,
                  submittedAt: new Date().toISOString(),
                },
              ],
            };
          }
          return item;
        })
      );

      toast.success("Weather observation updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error(`Failed to update record: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter data to only show records with WeatherObservation entries
  const filteredData = data.filter((record) => record.WeatherObservation && record.WeatherObservation.length > 0)

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

  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate)
    const otherDate = type === "start" ? new Date(endDate) : new Date(startDate)

    if (isNaN(date.getTime())) {
      setDateError("Invalid date format")
      return
    }

    // Reset error if dates are valid
    setDateError(null)

    if (type === "start") {
      if (date > otherDate) {
        setDateError("Start date cannot be after end date")
        return
      }
      setStartDate(newDate)
    } else {
      if (date < otherDate) {
        setDateError("End date cannot be before start date")
        return
      }
      setEndDate(newDate)
    }
  }


  const getStationNameById = (stationId: string): string => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : stationId;
  };


  return (
    <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-6">
        {/* Date and Station Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-slate-100 p-4 rounded-lg">

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="hover:bg-slate-200">
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
              <Button variant="outline" size="icon" onClick={goToNextWeek} className="hover:bg-slate-200">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {session?.user?.role === "super_admin" && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-sky-500" />
              <Label htmlFor="stationFilter" className="whitespace-nowrap font-medium text-slate-700">
                Station:
              </Label>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-[200px] border-slate-300 focus:ring-sky-500">
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

        {/* Form View */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
            <div className="flex justify-around gap-4">
              <div className="flex flex-col">
                <Label htmlFor="dataType" className="text-sm font-medium text-slate-900 mb-2">
                  DATA TYPE
                </Label>
                <div className="flex gap-1">
                  {["W", "O"].map((char, i) => (
                    <Input
                      key={`dataType-${i}`}
                      id={`dataType-${i}`}
                      className="w-12 text-center p-2 bg-slate-100 border border-slate-400 shadow-sm"
                      defaultValue={char}
                      readOnly
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600 ">STATION NO</div>
                <div className="flex h-10 border border-slate-400 rounded-lg p-2 mx-auto">
                  {user?.station?.stationId || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600">STATION NAME</div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-cente font-mono rounded-md">
                  {user?.station?.name || "N/A"}
                </div>
              </div>

              <div>
                <div className="font-bold uppercase text-slate-600">DATE</div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-center justify-center font-mono rounded-md">
                  {format(new Date(selectedDate), "dd/MM/yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="p-4">
            <div className="text-center font-bold text-xl border-b-2 border-sky-600 pb-2 mb-4 text-sky-800">
              WEATHER OBSERVATION DATA
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th colSpan={2} className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                      TIME & Date
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                      STATION
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                      TOTAL CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      LOW CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      MEDIUM CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      HIGH CLOUD
                    </th>
                    <th
                      colSpan={12}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      SIGNIFICANT CLOUD
                    </th>
                    <th
                      colSpan={5}
                      className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                    >
                      RAINFALL
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                    >
                      WIND
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      OBSERVER
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      ACTIONS
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Time of Observation (UTC)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Observation Date</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Station ID</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Amount (N)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Height (H)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Form (CL)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Amount</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Height (H)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Form (CM)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Amount</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Height (H)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Form (CH)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Amount</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 1</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 1</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 1</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 3</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 3</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 3</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 4</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 4</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 4</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Start Time</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">End Time</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Since Previous</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">During Previous</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Last 24 Hours</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">1st Anemometer</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">2nd Anemometer</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Speed</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
                      <div className="h-16 text-gray-800">Initial</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
                      <div className="h-16 text-gray-800">Edit</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={38} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                          <span className="ml-3 text-sky-600 font-medium">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={38} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CloudSun size={48} className="text-slate-400 mb-3" />
                          <p className="text-lg font-medium">No weather observations found</p>
                          <p className="text-sm">Try selecting a different date or station</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => {
                      const weatherObs = record.WeatherObservation[0]
                      const totalCloudAmount = weatherObs?.totalCloudAmount || "--"
                      const cloudClass = getCloudStatusColor(totalCloudAmount)
                      const rowClass = index % 2 === 0 ? "bg-white" : "bg-slate-50"

                      return (
                        <tr
                          key={record.id || index}
                          className={`text-center font-mono hover:bg-blue-50 transition-colors ${rowClass}`}
                        >
                          <td className="border border-slate-300 p-1 font-medium text-sky-700">
                            <div className="flex flex-col">
                              {utcToHour(record.utcTime.toString())}
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1">
                          {new Date(record.utcTime).toLocaleDateString()}
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="font-mono">
                              {record.station?.stationId || "--"}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className={`${cloudClass} text-white`}>
                              {totalCloudAmount}
                            </Badge>
                          </td>

                          {/* Low Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudDirection || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudHeight ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudHeight || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudAmount || "--"}
                          </td>

                          {/* Medium Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudDirection || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudHeight ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudHeight || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudAmount || "--"}
                          </td>

                          {/* High Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudDirection || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudHeight ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudHeight || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudAmount || "--"}
                          </td>

                          {/* Significant Clouds */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer1Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer1Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer1Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer1Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer1Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer1Height || "--"}
                          </td>
                        
                          {/* 2nd Layer */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer2Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer2Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer2Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer2Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer2Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer2Height || "--"}
                          </td>
                          
                         
                          {/* 3rd Layer */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer3Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer3Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer3Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer3Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer3Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer3Height || "--"}
                          </td>
                          
                          {/* 4th Layer */}
                           <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer4Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer4Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer4Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer4Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer4Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer4Height || "--"}
                          </td>
                         

                          {/* Rainfall */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallTimeStart ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {moment(weatherObs?.rainfallTimeStart || "--").format("LLL")}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallTimeEnd ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {moment(weatherObs?.rainfallTimeEnd || "--").format("LLL")}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallSincePrevious ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallSincePrevious || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallDuringPrevious ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallDuringPrevious || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallLast24Hours ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallLast24Hours || "--"}
                          </td>

                          {/* Wind */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windFirstAnemometer ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windFirstAnemometer || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windSecondAnemometer ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windSecondAnemometer || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windSpeed ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windSpeed || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windDirection ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windDirection || "--"}
                          </td>

                          {/* Observer */}
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="bg-gray-100">
                              {weatherObs?.observerInitial || "--"}
                            </Badge>
                          </td>

                          {/* Edit Button */}
                          <td className="border border-slate-300 p-1">
                            {canEditObservation(record, session?.user) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditClick(record)}
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
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </Button>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-500" />
                <span className="text-sm text-slate-600">
                  Date:{" "}
                  <span className="font-medium text-slate-800">{format(new Date(selectedDate), "MMMM d, yyyy")}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-100 text-sky-800 hover:bg-sky-200">
                  {filteredData.length} record(s)
                </Badge>
                {stationFilter !== "all" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Station: {getStationNameById(stationFilter)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[50vw] !max-w-[90vw] rounded-xl border-0 bg-gradient-to-br from-sky-50 to-blue-50 p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-sky-800">
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
                  Edit Weather Observation
                </div>
              </DialogTitle>
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-sky-400 to-blue-400 mt-2"></div>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                {/* Total Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-sky-50 border border-white shadow-sm">
                  <Label htmlFor="totalCloudAmount" className="text-sm font-medium text-gray-700">
                    Total Cloud Amount
                  </Label>
                  <Input
                    id="totalCloudAmount"
                    value={editFormData.totalCloudAmount || ""}
                    onChange={(e) => handleEditInputChange("totalCloudAmount", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                {/* Low Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Low Cloud Direction</Label>
                  <Input
                    value={editFormData.lowCloudDirection || ""}
                    onChange={(e) => handleEditInputChange("lowCloudDirection", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Low Cloud Height</Label>
                  <Input
                    value={editFormData.lowCloudHeight || ""}
                    onChange={(e) => handleEditInputChange("lowCloudHeight", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Low Cloud Form</Label>
                  <Input
                    value={editFormData.lowCloudForm || ""}
                    onChange={(e) => handleEditInputChange("lowCloudForm", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Low Cloud Amount</Label>
                  <Input
                    value={editFormData.lowCloudAmount || ""}
                    onChange={(e) => handleEditInputChange("lowCloudAmount", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Medium Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Medium Cloud Direction</Label>
                  <Input
                    value={editFormData.mediumCloudDirection || ""}
                    onChange={(e) => handleEditInputChange("mediumCloudDirection", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Medium Cloud Height</Label>
                  <Input
                    value={editFormData.mediumCloudHeight || ""}
                    onChange={(e) => handleEditInputChange("mediumCloudHeight", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Medium Cloud Form</Label>
                  <Input
                    value={editFormData.mediumCloudForm || ""}
                    onChange={(e) => handleEditInputChange("mediumCloudForm", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Medium Cloud Amount</Label>
                  <Input
                    value={editFormData.mediumCloudAmount || ""}
                    onChange={(e) => handleEditInputChange("mediumCloudAmount", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* High Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">High Cloud Direction</Label>
                  <Input
                    value={editFormData.highCloudDirection || ""}
                    onChange={(e) => handleEditInputChange("highCloudDirection", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">High Cloud Height</Label>
                  <Input
                    value={editFormData.highCloudHeight || ""}
                    onChange={(e) => handleEditInputChange("highCloudHeight", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">High Cloud Form</Label>
                  <Input
                    value={editFormData.highCloudForm || ""}
                    onChange={(e) => handleEditInputChange("highCloudForm", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">High Cloud Amount</Label>
                  <Input
                    value={editFormData.highCloudAmount || ""}
                    onChange={(e) => handleEditInputChange("highCloudAmount", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Rainfall */}
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Rainfall Start Time</Label>
                  <Input
                    value={editFormData.rainfallTimeStart || ""}
                    onChange={(e) => handleEditInputChange("rainfallTimeStart", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Rainfall End Time</Label>
                  <Input
                    value={editFormData.rainfallTimeEnd || ""}
                    onChange={(e) => handleEditInputChange("rainfallTimeEnd", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Rainfall Since Previous</Label>
                  <Input
                    value={editFormData.rainfallSincePrevious || ""}
                    onChange={(e) => handleEditInputChange("rainfallSincePrevious", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Rainfall During Previous</Label>
                  <Input
                    value={editFormData.rainfallDuringPrevious || ""}
                    onChange={(e) => handleEditInputChange("rainfallDuringPrevious", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Rainfall Last 24 Hours</Label>
                  <Input
                    value={editFormData.rainfallLast24Hours || ""}
                    onChange={(e) => handleEditInputChange("rainfallLast24Hours", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* Wind */}
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">First Anemometer</Label>
                  <Input
                    value={editFormData.windFirstAnemometer || ""}
                    onChange={(e) => handleEditInputChange("windFirstAnemometer", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Second Anemometer</Label>
                  <Input
                    value={editFormData.windSecondAnemometer || ""}
                    onChange={(e) => handleEditInputChange("windSecondAnemometer", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Wind Speed</Label>
                  <Input
                    value={editFormData.windSpeed || ""}
                    onChange={(e) => handleEditInputChange("windSpeed", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Wind Direction</Label>
                  <Input
                    value={editFormData.windDirection || ""}
                    onChange={(e) => handleEditInputChange("windDirection", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* Observer */}
                <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Observer Initial</Label>
                  <Input
                    value={editFormData.observerInitial || ""}
                    onChange={(e) => handleEditInputChange("observerInitial", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                {/* Significant Clouds */}
                <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Layer 1 Height</Label>
                  <Input
                    value={editFormData.layer1Height || ""}
                    onChange={(e) => handleEditInputChange("layer1Height", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Layer 1 Form</Label>
                  <Input
                    value={editFormData.layer1Form || ""}
                    onChange={(e) => handleEditInputChange("layer1Form", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">Layer 1 Amount</Label>
                  <Input
                    value={editFormData.layer1Amount || ""}
                    onChange={(e) => handleEditInputChange("layer1Amount", e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
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
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md transition-all"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
