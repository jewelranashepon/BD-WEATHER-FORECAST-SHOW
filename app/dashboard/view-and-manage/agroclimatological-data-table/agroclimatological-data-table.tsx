"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Calendar, MapPin, Thermometer, Droplets, ChevronLeft, ChevronRight, Filter, Download } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO, differenceInDays, isValid } from "date-fns"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "@/lib/auth-client"


interface AgroclimatologicalData {
  id: string
  createdAt: string
  updatedAt: string
  elevation: number
  date: string;
  solarRadiation: number
  sunShineHour: number
  airTempDry05m: number
  airTempWet05m: number
  airTempDry12m: number
  airTempWet12m: number
  airTempDry22m: number
  airTempWet22m: number
  minTemp: number
  maxTemp: number
  meanTemp: number | null
  grassMinTemp: number
  soilTemp5cm: number
  soilTemp10cm: number
  soilTemp20cm: number
  soilTemp30cm: number
  soilTemp50cm: number
  soilMoisture0to20cm: number
  soilMoisture20to50cm: number
  panWaterEvap: number
  relativeHumidity: number | null
  evaporation: number
  dewPoint: number
  windSpeed: number
  duration: number
  rainfall: number
  userId: string
  stationId: string
  user: {
    id: string
    name: string
    email: string
  }
  station: {
    id: string
    name: string
  }
}

interface ApiResponse {
  success: boolean
  data: AgroclimatologicalData[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface Station {
  id: string
  name: string
}

export default function AgroclimatologicalDataTable() {
  const [data, setData] = useState<AgroclimatologicalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [stationFilter, setStationFilter] = useState("all")
  const { data: session } = useSession()
  const user = session?.user

  // Date range state
  const today = format(new Date(), "yyyy-MM-dd")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [dateError, setDateError] = useState<string | null>(null)

  // const fetchData = async () => {
  //   try {
  //     setLoading(true)
  //     setError(null)

  //     let url = `http://localhost:7999/api/agroclimatological-data?startDate=${startDate}&endDate=${endDate}`
  //     if (stationFilter !== "all") {
  //       url += `&stationId=${stationFilter}`
  //     }

  //     const response = await fetch(url)

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }

  //     const result: ApiResponse = await response.json()

  //     if (result.success) {
  //       setData(result.data)
  //     } else {
  //       throw new Error("API returned unsuccessful response")
  //     }
  //   } catch (err) {
  //     console.error("Error fetching data:", err)
  //     setError(err instanceof Error ? err.message : "Failed to fetch data")
  //     toast.error("Failed to load agroclimatological data")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Only add date filters if they have values
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (stationFilter !== "all") params.append('stationId', stationFilter);

      const url = `http://localhost:7999/api/agroclimatological-data?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result: ApiResponse = await response.json();
      setData(result.data || []);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      toast.error("Failed to load agroclimatological data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch("http://localhost:7999/api/stations")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setStations(result)
    } catch (err) {
      console.error("Error fetching stations:", err)
      toast.error("Failed to load stations")
    }
  }

  useEffect(() => {
    fetchStations();
    fetchData();
  }, []);

  // Update the useEffect for filters to only run when needed
  useEffect(() => {
    if (startDate || endDate || stationFilter !== "all") {
      fetchData();
    }
  }, [startDate, endDate, stationFilter]);

  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "--"
    return value.toString()
  }

  const goToPreviousWeek = () => {
    try {
      if (!startDate || !endDate) return;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setDateError("Invalid date range");
        return;
      }

      const daysInRange = differenceInDays(end, start);

      // Calculate the new date range
      const newStart = new Date(start);
      newStart.setDate(start.getDate() - (daysInRange + 1));

      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() - 1);

      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        setDateError("Invalid date calculation");
        return;
      }

      setStartDate(format(newStart, "yyyy-MM-dd"));
      setEndDate(format(newEnd, "yyyy-MM-dd"));
      setDateError(null);
    } catch (error) {
      console.error("Error in goToPreviousWeek:", error);
      setDateError("Failed to navigate to previous period");
    }
  }

  const goToNextWeek = () => {
    try {
      if (!startDate || !endDate) return;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setDateError("Invalid date range");
        return;
      }

      const daysInRange = differenceInDays(end, start);

      // Calculate the new date range
      const newStart = new Date(start);
      newStart.setDate(start.getDate() + (daysInRange + 1));

      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + daysInRange);

      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        setDateError("Invalid date calculation");
        return;
      }

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
    } catch (error) {
      console.error("Error in goToNextWeek:", error);
      setDateError("Failed to navigate to next period");
    }
  }

  const handleDateChange = (type: "start" | "end", newDate: string) => {
    // Allow clearing the date
    if (!newDate) {
      if (type === "start") setStartDate("");
      else setEndDate("");
      setDateError(null);
      return;
    }

    try {
      const date = parseISO(newDate);
      if (!isValid(date)) {
        setDateError("Invalid date format");
        return;
      }

      setDateError(null);

      if (type === "start") {
        if (endDate && date > parseISO(endDate)) {
          setDateError("Start date cannot be after end date");
          return;
        }
        setStartDate(newDate);
      } else {
        if (startDate && date < parseISO(startDate)) {
          setDateError("End date cannot be before start date");
          return;
        }
        setEndDate(newDate);
      }
    } catch (e) {
      setDateError("Invalid date value");
    }
  };

  const getStationNameById = (stationId: string): string => {
    const station = stations.find((s) => s.id === stationId)
    return station ? station.name : stationId
  }

  function exportToCSV(data: AgroclimatologicalData[], filename = "agroclimatological_data.csv") {
    if (!data.length) {
      toast.warning("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).filter(k => typeof data[0][k as keyof AgroclimatologicalData] !== "object");
    const rows = data.map(row =>
      headers.map(key => {
        const val = row[key as keyof AgroclimatologicalData];
        return typeof val === "number" || typeof val === "string" ? `"${val}"` : "";
      }).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  function exportToTXT(data: AgroclimatologicalData[], filename = "agroclimatological_data.txt") {
    if (!data.length) {
      toast.warning("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).filter(k => typeof data[0][k as keyof AgroclimatologicalData] !== "object");
    const rows = data.map(row =>
      headers.map(key => {
        const val = row[key as keyof AgroclimatologicalData];
        return typeof val === "number" || typeof val === "string" ? `${val}` : "";
      }).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 text-center">
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-blue-800">
            BANGLADESH METEOROLOGICAL DEPARTMENT
          </CardTitle>
          <div className="text-center space-y-1">
            <p className="text-xl font-bold text-blue-800">AGROCLIMATOLOGICAL DATA</p>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
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
                  className="text-xs p-2 border border-slate-300 focus:ring-blue-500 focus:ring-2 rounded"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  min={startDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="text-xs p-2 border border-slate-300 focus:ring-blue-500 focus:ring-2 rounded"
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

          {user?.role === "super_admin" && (

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(data)}
                  className="flex items-center gap-2 hover:bg-green-50 border-green-200 text-green-700 w-full sm:w-auto justify-center sm:justify-start"
                  disabled={data.length === 0}
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Export CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToTXT(data)}
                  className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 w-full sm:w-auto justify-center sm:justify-start"
                  disabled={data.length === 0}
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Export TXT</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-blue-500" />
                <Label
                  htmlFor="stationFilter"
                  className="whitespace-nowrap font-medium text-slate-700"
                >
                  Station:
                </Label>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger className="w-[200px] border-slate-300 focus:ring-blue-500">
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        {dateError && (
          <div className="mt-2 text-sm text-red-600">{dateError}</div>
        )}
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              {/* Header Section */}
              <thead>
                {/* First Header Row */}
                <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-blue-50 text-blue-800 font-semibold min-w-[80px]"
                  >
                    Date
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-blue-50 text-blue-800 font-semibold min-w-[100px]"
                  >
                    Hour
                  </th>
                  <th rowSpan={2} className="border border-slate-400 p-2 bg-yellow-50 text-yellow-800 font-semibold">
                    Solar Radiation (Langley day⁻¹)
                  </th>
                  <th rowSpan={2} className="border border-slate-400 p-2 bg-orange-50 text-orange-800 font-semibold">
                    Sun Shine Hour
                  </th>
                  <th colSpan={6} className="border border-slate-400 p-2 bg-red-50 text-red-800 font-semibold">
                    Air Temperature (°C) at
                  </th>
                  <th colSpan={2} className="border border-slate-400 p-2 bg-pink-50 text-pink-800 font-semibold">
                    Min/Max Temp (°C)
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-purple-50 text-purple-800 font-semibold min-w-[100px]"
                  >
                    Grass Min Temp (°C)
                  </th>
                  <th colSpan={5} className="border border-slate-400 p-2 bg-green-50 text-green-800 font-semibold">
                    Soil Temperature (°C) at
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-teal-50 text-teal-800 font-semibold min-w-[100px]"
                  >
                    Pan Water Temp (°C)
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-cyan-50 text-cyan-800 font-semibold min-w-[100px]"
                  >
                    Elevation (mm)
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-sky-50 text-sky-800 font-semibold min-w-[120px]"
                  >
                    Evapotranspiration (mm)
                  </th>
                  <th colSpan={2} className="border border-slate-400 p-2 bg-indigo-50 text-indigo-800 font-semibold">
                    Soil Moisture % Between
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-violet-50 text-violet-800 font-semibold min-w-[120px]"
                  >
                    Wind Run at 2m ht (KM)
                  </th>
                  <th colSpan={2} className="border border-slate-400 p-2 bg-amber-50 text-amber-800 font-semibold">
                    Dew
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 bg-blue-50 text-blue-800 font-semibold min-w-[120px]"
                  >
                    Rain Amount (mm)
                  </th>
                </tr>

                {/* Second Header Row */}
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="border border-slate-400 p-1 bg-red-100 text-red-700 text-xs">0.5m Dry</th>
                  <th className="border border-slate-400 p-1 bg-red-100 text-red-700 text-xs">0.5m Wet</th>
                  <th className="border border-slate-400 p-1 bg-red-100 text-red-700 text-xs">1.2m Dry</th>
                  <th className="border border-slate-400 p-1 bg-red-100 text-red-700 text-xs">1.2m Wet</th>
                  <th className="border border-slate-400 p-1 bg-red-100 text-red-700 text-xs">2.2m Dry</th>
                  <th className="border border-slate-400 p-1 bg-red-100 text-red-700 text-xs">2.2m Wet</th>

                  <th className="border border-slate-400 p-1 bg-pink-100 text-pink-700 text-xs">Min</th>
                  <th className="border border-slate-400 p-1 bg-pink-100 text-pink-700 text-xs">Max</th>

                  <th className="border border-slate-400 p-1 bg-green-100 text-green-700 text-xs">5cm</th>
                  <th className="border border-slate-400 p-1 bg-green-100 text-green-700 text-xs">10cm</th>
                  <th className="border border-slate-400 p-1 bg-green-100 text-green-700 text-xs">20cm</th>
                  <th className="border border-slate-400 p-1 bg-green-100 text-green-700 text-xs">30cm</th>
                  <th className="border border-slate-400 p-1 bg-green-100 text-green-700 text-xs">50cm</th>

                  <th className="border border-slate-400 p-1 bg-indigo-100 text-indigo-700 text-xs">0-20cm</th>
                  <th className="border border-slate-400 p-1 bg-indigo-100 text-indigo-700 text-xs">20-50cm</th>

                  <th className="border border-slate-400 p-1 bg-amber-100 text-amber-700 text-xs">Amount (MM)</th>
                  <th className="border border-slate-400 p-1 bg-amber-100 text-amber-700 text-xs">Duration (hrs)</th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={27} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="text-lg font-medium text-slate-600">Loading agroclimatological data...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={26} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                        <p className="text-sm text-slate-500 mb-4">No agroclimatological data found for the selected criteria.</p>
                        <Button onClick={fetchData} variant="outline" className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (data.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    {/* Date */}
                    <td className="border border-slate-300 p-2 text-center font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-blue-700">
                          {format(parseISO(record.date), "MMM d, yyyy")}
                        </span>
                        <Badge variant="outline" className="text-xs mt-1">
                          {record.station.name}
                        </Badge>
                      </div>
                    </td>

                    {/* Hour */}
                    <td className="border border-slate-300 p-2 text-center">
                      <Badge variant="secondary" className="font-mono">
                        24:00
                      </Badge>
                    </td>

                    {/* Solar Radiation */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-yellow-700">
                      {formatValue(record.solarRadiation)}
                    </td>

                    {/* Sun Shine Hour */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-orange-700">
                      {formatValue(record.sunShineHour)}
                    </td>

                    {/* Air Temperature */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-red-700">
                      {formatValue(record.airTempDry05m)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-red-600">
                      {formatValue(record.airTempWet05m)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-red-700">
                      {formatValue(record.airTempDry12m)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-red-600">
                      {formatValue(record.airTempWet12m)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-red-700">
                      {formatValue(record.airTempDry22m)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-red-600">
                      {formatValue(record.airTempWet22m)}
                    </td>

                    {/* Min/Max Temperature */}
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3 text-blue-500" />
                        <span className="font-medium text-blue-700">{formatValue(record.minTemp)}</span>
                      </div>
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Thermometer className="h-3 w-3 text-red-500" />
                        <span className="font-medium text-red-700">{formatValue(record.maxTemp)}</span>
                      </div>
                    </td>

                    {/* Grass Min Temp */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-purple-700">
                      {formatValue(record.grassMinTemp)}
                    </td>

                    {/* Soil Temperature */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-green-700">
                      {formatValue(record.soilTemp5cm)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-green-700">
                      {formatValue(record.soilTemp10cm)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-green-700">
                      {formatValue(record.soilTemp20cm)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-green-700">
                      {formatValue(record.soilTemp30cm)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-green-700">
                      {formatValue(record.soilTemp50cm)}
                    </td>

                    {/* Pan Water Temp */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-teal-700">
                      {formatValue(record.panWaterEvap)}
                    </td>

                    {/* Elevation */}
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3 text-cyan-500" />
                        <span className="font-medium text-cyan-700">{formatValue(record.elevation)}</span>
                      </div>
                    </td>

                    {/* Evapotranspiration */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-sky-700">
                      {formatValue(record.evaporation)}
                    </td>

                    {/* Soil Moisture */}
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3 text-indigo-500" />
                        <span className="font-medium text-indigo-700">{formatValue(record.soilMoisture0to20cm)}%</span>
                      </div>
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3 text-indigo-500" />
                        <span className="font-medium text-indigo-700">{formatValue(record.soilMoisture20to50cm)}%</span>
                      </div>
                    </td>

                    {/* Wind Speed */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-violet-700">
                      {formatValue(record.windSpeed)}
                    </td>

                    {/* Dew */}
                    <td className="border border-slate-300 p-2 text-center font-medium text-amber-700">
                      {formatValue(record.dewPoint)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium text-amber-600">
                      {formatValue(record.duration)}
                    </td>

                    {/* Rainfall */}
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span className="font-bold text-blue-700">{formatValue(record.rainfall)}</span>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                {startDate && endDate ? (
                  `${format(parseISO(startDate), "MMM d")} - ${format(parseISO(endDate), "MMM d, yyyy")}`
                ) : "All Dates"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                Total Records: {data.length}
              </Badge>
              {stationFilter !== "all" && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  Station: {getStationNameById(stationFilter)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}