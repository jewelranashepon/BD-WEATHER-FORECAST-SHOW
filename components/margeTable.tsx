"use client"
import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, CloudSun, Filter } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { utcToHour } from "@/lib/utils"
import { Download } from "lucide-react"
import moment from "moment"

interface Station {
  id: string
  stationId: string
  name: string
  securityCode: string
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
}

interface MeteorologicalEntry {
  id: string
  observingTimeId: string
  stationId?: string
  dataType: string
  subIndicator: string
  alteredThermometer: string
  barAsRead: string
  correctedForIndex: string
  heightDifference: string
  correctionForTemp: string
  stationLevelPressure: string
  seaLevelReduction: string
  correctedSeaLevelPressure: string
  afternoonReading: string
  pressureChange24h: string
  dryBulbAsRead: string
  wetBulbAsRead: string
  maxMinTempAsRead: string
  dryBulbCorrected: string
  wetBulbCorrected: string
  maxMinTempCorrected: string
  Td: string
  relativeHumidity: string
  squallConfirmed: string
  squallForce: string
  squallDirection: string
  squallTime: string
  horizontalVisibility: string
  miscMeteors: string
  pastWeatherW1: string
  pastWeatherW2: string
  presentWeatherWW: string
  c2Indicator: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
  ObservingTime?: {
    stationId: string
    userId: string
    utcTime: string
    station: Station
  }
}

interface ObservingTimeEntry {
  id: string
  userId: string
  stationId: string
  utcTime: string
  localTime: string
  createdAt: string
  updatedAt: string
  station: Station
  MeteorologicalEntry: MeteorologicalEntry[]
}

interface WeatherObservation {
  id: string
  observingTimeId: string
  cardIndicator: string
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
  createdAt: string
  updatedAt: string
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

interface MargeTableProps {
  refreshTrigger?: number
}

// Combined data structure for merged display
interface MergedDataEntry {
  observingTimeId: string
  utcTime: string
  localTime: string
  station: Station
  meteorologicalEntry?: MeteorologicalEntry
  weatherObservation?: WeatherObservation
}

const MargeTable = forwardRef(({ refreshTrigger = 0 }: MargeTableProps, ref) => {
  const [firstCardData, setFirstCardData] = useState<ObservingTimeEntry[]>([])
  const [secondCardData, setSecondCardData] = useState<ObservationData[]>([])
  const [mergedData, setMergedData] = useState<MergedDataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), "yyyy-MM-dd")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [dateError, setDateError] = useState<string | null>(null)
  const [stationFilter, setStationFilter] = useState("all")
  const [stations, setStations] = useState<Station[]>([])
  const { data: session } = useSession()
  const user = session?.user
  const isSuperAdmin = user?.role === "super_admin"
  const isStationAdmin = user?.role === "station_admin"

  // Expose getData method via ref
  useImperativeHandle(ref, () => ({
    getData: () => {
      return mergedData
    },
  }))

  const exportToCSV = () => {
    if (mergedData.length === 0) {
      toast.error("No data to export")
      return
    }

    // Create CSV header - combining both first and second card headers
    const headers = [
      "Time (GMT)",
      "Indicator",
      "Date",
      "Station Name & ID",
      "Station Name",
      "Attached Thermometer (°C)",
      "Bar As Read (hPa)",
      "Corrected for Index",
      "Height Difference Correction (hPa)",
      "Station Level Pressure (QFE)",
      "Sea Level Reduction",
      "Sea Level Pressure (QNH)",
      "Afternoon Reading",
      "24-Hour Pressure Change",
      "Dry Bulb As Read (°C)",
      "Wet Bulb As Read (°C)",
      "MAX/MIN Temp As Read (°C)",
      "Dry Bulb Corrected (°C)",
      "Wet Bulb Corrected (°C)",
      "MAX/MIN Temp Corrected (°C)",
      "Dew Point Temperature (°C)",
      "Relative Humidity (%)",
      "Squall Force (KTS)",
      "Squall Direction (°)",
      "Squall Time",
      "Horizontal Visibility (km)",
      "Misc Meteors (Code)",
      "Past Weather (W₁)",
      "Past Weather (W₂)",
      "Present Weather (ww)",
      "C2 Indicator",
      "Low Cloud Form",
      "Low Cloud Amount",
      "Low Cloud Direction",
      "Low Cloud Height",
      "Medium Cloud Form",
      "Medium Cloud Amount",
      "Medium Cloud Direction",
      "Medium Cloud Height",
      "High Cloud Form",
      "High Cloud Amount",
      "High Cloud Direction",
      "Total Cloud Amount",
      "Layer1 Form",
      "Layer1 Amount",
      "Layer1 Height",
      "Layer2 Form",
      "Layer2 Amount",
      "Layer2 Height",
      "Layer3 Form",
      "Layer3 Amount",
      "Layer3 Height",
      "Layer4 Form",
      "Layer4 Amount",
      "Layer4 Height",
      "Rainfall Time Start",
      "Rainfall Time End",
      "Rainfall Since Previous",
      "Rainfall During Previous",
      "Rainfall Last 24 Hours",
      "Wind First Anemometer",
      "Wind Second Anemometer",
      "Wind Speed",
      "Wind Direction",
      "Observer Initial",
    ]

    // Create CSV rows
    const rows = mergedData.map((record) => {
      const metEntry = record.meteorologicalEntry
      const weatherObs = record.weatherObservation

      return [
        // First card data
        utcToHour(record.utcTime || ""),
        metEntry?.subIndicator || "--",
        record.utcTime ? format(new Date(record.utcTime), "yyyy-MM-dd") : "--",
        record.station?.name + " " + record.station?.stationId || "--",
        record.station?.name || "--",
        metEntry?.alteredThermometer || "--",
        metEntry?.barAsRead || "--",
        metEntry?.correctedForIndex || "--",
        metEntry?.heightDifference || "--",
        metEntry?.stationLevelPressure || "--",
        metEntry?.seaLevelReduction || "--",
        metEntry?.correctedSeaLevelPressure || "--",
        metEntry?.afternoonReading || "--",
        metEntry?.pressureChange24h || "--",
        metEntry?.dryBulbAsRead || "--",
        metEntry?.wetBulbAsRead || "--",
        metEntry?.maxMinTempAsRead || "--",
        metEntry?.dryBulbCorrected || "--",
        metEntry?.wetBulbCorrected || "--",
        metEntry?.maxMinTempCorrected || "--",
        metEntry?.Td || "--",
        metEntry?.relativeHumidity || "--",
        metEntry?.squallForce || "--",
        metEntry?.squallDirection || "--",
        metEntry?.squallTime || "--",
        metEntry?.horizontalVisibility || "--",
        metEntry?.miscMeteors || "--",
        metEntry?.pastWeatherW1 || "--",
        metEntry?.pastWeatherW2 || "--",
        metEntry?.presentWeatherWW || "--",
        // Second card data
        weatherObs?.cardIndicator || "--",
        weatherObs?.lowCloudForm || "--",
        weatherObs?.lowCloudAmount || "--",
        weatherObs?.lowCloudDirection || "--",
        weatherObs?.lowCloudHeight || "--",
        weatherObs?.mediumCloudForm || "--",
        weatherObs?.mediumCloudAmount || "--",
        weatherObs?.mediumCloudDirection || "--",
        weatherObs?.mediumCloudHeight || "--",
        weatherObs?.highCloudForm || "--",
        weatherObs?.highCloudAmount || "--",
        weatherObs?.highCloudDirection || "--",
        weatherObs?.totalCloudAmount || "--",
        weatherObs?.layer1Form || "--",
        weatherObs?.layer1Amount || "--",
        weatherObs?.layer1Height || "--",
        weatherObs?.layer2Form || "--",
        weatherObs?.layer2Amount || "--",
        weatherObs?.layer2Height || "--",
        weatherObs?.layer3Form || "--",
        weatherObs?.layer3Amount || "--",
        weatherObs?.layer3Height || "--",
        weatherObs?.layer4Form || "--",
        weatherObs?.layer4Amount || "--",
        weatherObs?.layer4Height || "--",
        weatherObs?.rainfallTimeStart ? moment(weatherObs.rainfallTimeStart).format("MMMM Do YYYY, h:mm") : "--",
        weatherObs?.rainfallTimeEnd ? moment(weatherObs.rainfallTimeEnd).format("MMMM Do YYYY, h:mm") : "--",
        weatherObs?.rainfallSincePrevious || "--",
        weatherObs?.rainfallDuringPrevious || "--",
        weatherObs?.rainfallLast24Hours || "--",
        weatherObs?.windFirstAnemometer || "--",
        weatherObs?.windSecondAnemometer || "--",
        weatherObs?.windSpeed || "--",
        weatherObs?.windDirection || "--",
        weatherObs?.observerInitial || "--",
      ]
    })

    // Combine header and rows
    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `merged_meteorological_data_${startDate}_to_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("CSV export started")
  }

  // Add this function alongside your exportToCSV function
  const exportToTXT = () => {
    if (mergedData.length === 0) {
      toast.error("No data to export")
      return
    }

    // Create TXT content
    const headers = [
      "Time (GMT)",
      "Indicator",
      "Date",
      "Station Name & ID",
      "Station Name",
      "Attached Thermometer (°C)",
      "Bar As Read (hPa)",
      "Corrected for Index",
      "Height Difference Correction (hPa)",
      "Station Level Pressure (QFE)",
      "Sea Level Reduction",
      "Sea Level Pressure (QNH)",
      "Afternoon Reading",
      "24-Hour Pressure Change",
      "Dry Bulb As Read (°C)",
      "Wet Bulb As Read (°C)",
      "MAX/MIN Temp As Read (°C)",
      "Dry Bulb Corrected (°C)",
      "Wet Bulb Corrected (°C)",
      "MAX/MIN Temp Corrected (°C)",
      "Dew Point Temperature (°C)",
      "Relative Humidity (%)",
      "Squall Force (KTS)",
      "Squall Direction (°)",
      "Squall Time",
      "Horizontal Visibility (km)",
      "Misc Meteors (Code)",
      "Past Weather (W₁)",
      "Past Weather (W₂)",
      "Present Weather (ww)",
      "C2 Indicator",
      "Low Cloud Form",
      "Low Cloud Amount",
      "Low Cloud Direction",
      "Low Cloud Height",
      "Medium Cloud Form",
      "Medium Cloud Amount",
      "Medium Cloud Direction",
      "Medium Cloud Height",
      "High Cloud Form",
      "High Cloud Amount",
      "High Cloud Direction",
      "Total Cloud Amount",
      "Layer1 Form",
      "Layer1 Amount",
      "Layer1 Height",
      "Layer2 Form",
      "Layer2 Amount",
      "Layer2 Height",
      "Layer3 Form",
      "Layer3 Amount",
      "Layer3 Height",
      "Layer4 Form",
      "Layer4 Amount",
      "Layer4 Height",
      "Rainfall Time Start",
      "Rainfall Time End",
      "Rainfall Since Previous",
      "Rainfall During Previous",
      "Rainfall Last 24 Hours",
      "Wind First Anemometer",
      "Wind Second Anemometer",
      "Wind Speed",
      "Wind Direction",
      "Observer Initial",
    ].join("\t")

    // Create TXT rows
    const rows = mergedData.map((record) => {
      const metEntry = record.meteorologicalEntry
      const weatherObs = record.weatherObservation

      return [
        // First card data
        utcToHour(record.utcTime || ""),
        metEntry?.subIndicator || "--",
        record.utcTime ? format(new Date(record.utcTime), "yyyy-MM-dd") : "--",
        record.station?.name + " " + record.station?.stationId || "--",
        record.station?.name || "--",
        metEntry?.alteredThermometer || "--",
        metEntry?.barAsRead || "--",
        metEntry?.correctedForIndex || "--",
        metEntry?.heightDifference || "--",
        metEntry?.stationLevelPressure || "--",
        metEntry?.seaLevelReduction || "--",
        metEntry?.correctedSeaLevelPressure || "--",
        metEntry?.afternoonReading || "--",
        metEntry?.pressureChange24h || "--",
        metEntry?.dryBulbAsRead || "--",
        metEntry?.wetBulbAsRead || "--",
        metEntry?.maxMinTempAsRead || "--",
        metEntry?.dryBulbCorrected || "--",
        metEntry?.wetBulbCorrected || "--",
        metEntry?.maxMinTempCorrected || "--",
        metEntry?.Td || "--",
        metEntry?.relativeHumidity || "--",
        metEntry?.squallForce || "--",
        metEntry?.squallDirection || "--",
        metEntry?.squallTime || "--",
        metEntry?.horizontalVisibility || "--",
        metEntry?.miscMeteors || "--",
        metEntry?.pastWeatherW1 || "--",
        metEntry?.pastWeatherW2 || "--",
        metEntry?.presentWeatherWW || "--",
        // Second card data
        weatherObs?.cardIndicator || "--",
        weatherObs?.lowCloudForm || "--",
        weatherObs?.lowCloudAmount || "--",
        weatherObs?.lowCloudDirection || "--",
        weatherObs?.lowCloudHeight || "--",
        weatherObs?.mediumCloudForm || "--",
        weatherObs?.mediumCloudAmount || "--",
        weatherObs?.mediumCloudDirection || "--",
        weatherObs?.mediumCloudHeight || "--",
        weatherObs?.highCloudForm || "--",
        weatherObs?.highCloudAmount || "--",
        weatherObs?.highCloudDirection || "--",
        weatherObs?.totalCloudAmount || "--",
        weatherObs?.layer1Form || "--",
        weatherObs?.layer1Amount || "--",
        weatherObs?.layer1Height || "--",
        weatherObs?.layer2Form || "--",
        weatherObs?.layer2Amount || "--",
        weatherObs?.layer2Height || "--",
        weatherObs?.layer3Form || "--",
        weatherObs?.layer3Amount || "--",
        weatherObs?.layer3Height || "--",
        weatherObs?.layer4Form || "--",
        weatherObs?.layer4Amount || "--",
        weatherObs?.layer4Height || "--",
        weatherObs?.rainfallTimeStart ? moment(weatherObs.rainfallTimeStart).format("MMMM Do YYYY, h:mm") : "--",
        weatherObs?.rainfallTimeEnd ? moment(weatherObs.rainfallTimeEnd).format("MMMM Do YYYY, h:mm") : "--",
        weatherObs?.rainfallSincePrevious || "--",
        weatherObs?.rainfallDuringPrevious || "--",
        weatherObs?.rainfallLast24Hours || "--",
        weatherObs?.windFirstAnemometer || "--",
        weatherObs?.windSecondAnemometer || "--",
        weatherObs?.windSpeed || "--",
        weatherObs?.windDirection || "--",
        weatherObs?.observerInitial || "--",
      ].join("\t")
    })

    // Combine header and rows
    const txtContent = [headers, ...rows].join("\n")

    // Create download link
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `merged_meteorological_data_${startDate}_to_${endDate}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("TXT export started")
  }

  // Add this button next to your CSV export button in the JSX
  <Button
    variant="outline"
    size="sm"
    onClick={exportToTXT}
    className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 w-full sm:w-auto justify-center sm:justify-start"
    disabled={mergedData.length === 0}
  >
    <Download className="h-4 w-4 flex-shrink-0" />
    <span className="whitespace-nowrap">Export TXT</span>
  </Button>

  // Fetch data function for first card
  const firstCardFetchData = async () => {
    try {
      const response = await fetch(
        `/api/first-card-data?startDate=${startDate}&endDate=${endDate}${stationFilter !== "all" ? `&stationId=${stationFilter}` : ""}`,
      )
      if (!response.ok) {
        throw new Error("Failed to fetch first card data")
      }
      const result = await response.json()
      setFirstCardData(result.entries || [])
      return result.entries || []
    } catch (error) {
      console.error("Error fetching first card data:", error)
      toast.error("Failed to fetch meteorological data")
      return []
    }
  }

  // Fetch data function for second card
  const secondCardFetchData = async () => {
    try {
      const url = new URL("/api/save-observation", window.location.origin)
      url.searchParams.append("startDate", startDate)
      url.searchParams.append("endDate", endDate)

      if (stationFilter !== "all") {
        url.searchParams.append("stationId", stationFilter)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error("Failed to fetch second card data")
      }

      const result = await response.json()
      setSecondCardData(result.data || [])
      return result.data || []
    } catch (error) {
      console.error("Error fetching second card data:", error)
      toast.error("Failed to fetch weather observation data")
      return []
    }
  }

  // Merge data from both sources
  const mergeData = (firstData: ObservingTimeEntry[], secondData: ObservationData[]) => {
    const merged: MergedDataEntry[] = []
    const processedObservingTimes = new Set<string>()

    // Process first card data
    firstData.forEach((observingTime) => {
      observingTime.MeteorologicalEntry.forEach((metEntry) => {
        // Find matching weather observation from second card data
        const matchingSecondCard = secondData.find(
          (obs) => obs.id === observingTime.id || obs.utcTime === observingTime.utcTime,
        )

        const weatherObs = matchingSecondCard?.WeatherObservation?.[0]

        merged.push({
          observingTimeId: observingTime.id,
          utcTime: observingTime.utcTime,
          localTime: observingTime.localTime,
          station: observingTime.station,
          meteorologicalEntry: metEntry,
          weatherObservation: weatherObs,
        })

        processedObservingTimes.add(observingTime.id)
      })
    })

    // Process second card data that doesn't have matching first card data
    secondData.forEach((obsData) => {
      if (!processedObservingTimes.has(obsData.id) && obsData.WeatherObservation?.length > 0) {
        obsData.WeatherObservation.forEach((weatherObs) => {
          merged.push({
            observingTimeId: obsData.id,
            utcTime: obsData.utcTime,
            localTime: obsData.localTime,
            station: obsData.station,
            meteorologicalEntry: undefined,
            weatherObservation: weatherObs,
          })
        })
      }
    })

    // Sort by UTC time
    merged.sort((a, b) => new Date(a.utcTime).getTime() - new Date(b.utcTime).getTime())

    setMergedData(merged)
  }

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch both datasets concurrently
      const [firstData, secondData] = await Promise.all([firstCardFetchData(), secondCardFetchData()])

      // Merge the data
      mergeData(firstData, secondData)

      // Fetch stations if super admin and not already loaded
      if (isSuperAdmin && stations.length === 0) {
        const stationsResponse = await fetch("/api/stations")
        if (stationsResponse.ok) {
          const stationsResult = await stationsResponse.json()
          setStations(stationsResult)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [refreshTrigger, startDate, endDate, stationFilter])

  const goToPreviousWeek = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange = differenceInDays(end, start)

    const newStart = new Date(start)
    newStart.setDate(start.getDate() - (daysInRange + 1))

    const newEnd = new Date(start)
    newEnd.setDate(start.getDate() - 1)

    setStartDate(format(newStart, "yyyy-MM-dd"))
    setEndDate(format(newEnd, "yyyy-MM-dd"))
    setDateError(null)
  }

  const goToNextWeek = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange = differenceInDays(end, start)

    const newStart = new Date(start)
    newStart.setDate(start.getDate() + (daysInRange + 1))

    const newEnd = new Date(newStart)
    newEnd.setDate(newStart.getDate() + daysInRange)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (newEnd > today) {
      if (end >= today) {
        return
      }
      const adjustedEnd = new Date(today)
      const adjustedStart = new Date(adjustedEnd)
      adjustedStart.setDate(adjustedEnd.getDate() - daysInRange)

      setStartDate(format(adjustedStart, "yyyy-MM-dd"))
      setEndDate(format(adjustedEnd, "yyyy-MM-dd"))
    } else {
      setStartDate(format(newStart, "yyyy-MM-dd"))
      setEndDate(format(newEnd, "yyyy-MM-dd"))
    }

    setDateError(null)
  }

  const getWeatherStatusColor = (humidity: string) => {
    const humidityValue = Number.parseInt(humidity || "0")
    if (humidityValue >= 80) return "bg-blue-500"
    if (humidityValue >= 60) return "bg-green-500"
    if (humidityValue >= 40) return "bg-yellow-500"
    if (humidityValue >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  const getCloudStatusColor = (amount: string | null) => {
    if (!amount || amount === "--") return "bg-gray-400"
    const numAmount = Number.parseInt(amount)
    if (isNaN(numAmount)) return "bg-gray-400"
    if (numAmount <= 2) return "bg-sky-500"
    if (numAmount <= 4) return "bg-blue-500"
    if (numAmount <= 6) return "bg-indigo-500"
    if (numAmount <= 8) return "bg-purple-500"
    return "bg-slate-700"
  }

  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate)
    const otherDate = type === "start" ? new Date(endDate) : new Date(startDate)

    if (isNaN(date.getTime())) {
      setDateError("Invalid date format")
      return
    }

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

  return (
    <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
      <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
        Merged Meteorological Data Table
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg">
          {/* Date Navigation Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full xs:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousWeek}
                  className="hover:bg-slate-200 flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    max={endDate}
                    className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                  />
                  <span className="text-sm text-slate-600 whitespace-nowrap">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    min={startDate}
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextWeek}
                  className="hover:bg-slate-200 flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions and Filters Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
            {/* Export Button */}
            {(isSuperAdmin || isStationAdmin) && (
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-2 hover:bg-green-50 border-green-200 text-green-700 w-full sm:w-auto justify-center sm:justify-start"
                  disabled={mergedData.length === 0}
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Export CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToTXT}
                  className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 w-full sm:w-auto justify-center sm:justify-start"
                  disabled={mergedData.length === 0}
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Export TXT</span>
                </Button>
              </div>
            )}

            {/* Station Filter - Super Admin Only */}
            {isSuperAdmin && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-purple-500 flex-shrink-0" />
                  <Label htmlFor="stationFilter" className="whitespace-nowrap font-medium text-slate-700 text-sm">
                    Station:
                  </Label>
                </div>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger className="w-full xs:w-[180px] sm:w-[200px] border-slate-300 focus:ring-purple-500 text-sm">
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        <span className="block truncate">
                          {station.name} ({station.stationId})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex flex-col md:flex-row md:justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300 gap-3 sm:gap-4">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center min-w-[100px]">
                <Label className="text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2 text-center">
                  DATA TYPE
                </Label>
                <div className="flex gap-1">
                  {["S", "Y"].map((char, i) => (
                    <Input
                      key={`dataType-${i}`}
                      className="w-8 sm:w-10 h-8 sm:h-9 text-center p-1 bg-slate-100 border border-slate-400 shadow-sm text-xs sm:text-sm"
                      defaultValue={char}
                      readOnly
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center min-w-[100px]">
                <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                  STATION NO
                </div>
                <div className="flex h-8 sm:h-9 w-full min-w-[80px] sm:min-w-[100px] border border-slate-400 rounded-lg px-2 items-center justify-center bg-white text-xs sm:text-sm font-mono truncate">
                  {user?.station?.stationId || "N/A"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                  YEAR
                </div>
                <div className="flex">
                  <div className="w-8 sm:w-10 h-8 sm:h-9 border border-slate-400 flex items-center justify-center p-1 font-mono rounded-l-md bg-white text-xs sm:text-sm">
                    {new Date().getFullYear().toString().slice(-2, -1)}
                  </div>
                  <div className="w-8 sm:w-10 h-8 sm:h-9 border-t border-r border-b border-slate-400 flex items-center justify-center p-1 font-mono rounded-r-md bg-white text-xs sm:text-sm">
                    {new Date().getFullYear().toString().slice(-1)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
                <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                  STATION
                </div>
                <div className="h-8 sm:h-9 w-full border border-slate-400 px-2 flex items-center justify-center font-mono rounded-md bg-white text-xs sm:text-sm text-center truncate">
                  {user?.station?.name || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      colSpan={29}
                      className="border border-sky-400 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                    >
                      First Card
                    </th>
                    <th
                      colSpan={35}
                      className="border border-purple-500 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
                    >
                      Second Card
                    </th>
                  </tr>
                  <tr>
                    <th
                      rowSpan={2}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      GG
                    </th>
                    <th
                      rowSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      C1 Indicator
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      Date
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      Station
                    </th>
                    <th
                      rowSpan={2}
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
                      rowSpan={2}
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                    >
                      Td
                    </th>
                    <th
                      rowSpan={2}
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                    >
                      R.H.
                    </th>
                    <th
                      rowSpan={2}
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                    >
                      SQUALL
                    </th>
                    <th
                      rowSpan={2}
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      VV
                    </th>
                    <th
                      rowSpan={2}
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    ></th>
                    <th
                      rowSpan={2}
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                    >
                      WEATHER
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                    >
                      C2 Indicator
                    </th>
                    <th
                      colSpan={11}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      CLOUD
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                    >
                      TOTAL CLOUD Amount (Octa)
                    </th>
                    <th
                      colSpan={12}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      SIGNIFICANT CLOUD
                    </th>
                    <th
                      colSpan={5}
                      rowSpan={2}
                      className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                    >
                      RAINFALL
                    </th>
                    <th
                      colSpan={4}
                      rowSpan={2}
                      className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                    >
                      WIND
                    </th>
                    <th
                      rowSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      OBSERVER
                    </th>
                  </tr>
                  <tr>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
                    >
                      As Read
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
                    >
                      Corrected
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      LOW
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      MEDIUM
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      HIGH
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      1st Layer
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      2nd Layer
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      3rd Layer
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      4th Layer
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Time of Observation (UTC)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Date</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Station Name & ID</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Attached Thermometer (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Bar As Read (hPa)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Corrected for Index</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Height Difference Correction (hPa)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Station Level Pressure (QFE)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Sea Level Reduction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Sea Level Pressure (QNH)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">Altimeter setting (QNH)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">24-Hour Pressure Change</div>
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
                      <div className="h-16 text-teal-800">Dew Point Temperature (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                      <div className="h-16 text-teal-800">Relative Humidity (%)</div>
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
                      <div className="h-16 text-blue-800">Horizontal Visibility (km)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Misc. Meteors (Code)</div>
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

                    {/* Second Card Headers */}
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Direction (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Height Of Base (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Direction (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Height Of Base (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                      Direction (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Height of Base (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Height of Base (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Height of Base (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Form (Code)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Amount (Octa)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                      Height of Base (Code)
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                      Time Of Start
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                      Time Of End
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                      Since Previous
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                      During Previous
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                      Last 24 Hours
                    </th>

                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                      First Anemometer Reading
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                      Second Anemometer Reading
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                      Speed (KTS)
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                      Direction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={61} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <span className="ml-3 text-indigo-600 font-medium">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : mergedData.length === 0 ? (
                    <tr>
                      <td colSpan={61} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CloudSun size={48} className="text-slate-400 mb-3" />
                          <p className="text-lg font-medium">No meteorological data found</p>
                          <p className="text-sm">Try selecting a different date or station</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mergedData.map((record, index) => {
                      const metEntry = record.meteorologicalEntry
                      const weatherObs = record.weatherObservation
                      const humidityClass = getWeatherStatusColor(metEntry?.relativeHumidity || "")
                      const cloudClass = getCloudStatusColor(weatherObs?.totalCloudAmount)
                      const rowClass = index % 2 === 0 ? "bg-white" : "bg-slate-50"

                      return (
                        <tr
                          key={`${record.observingTimeId}-${index}`}
                          className={`text-center font-mono hover:bg-slate-50 transition-colors ${rowClass}`}
                        >
                          {/* First Card Data */}
                          <td className="border border-slate-300 p-1 font-medium text-indigo-700">
                            {utcToHour(record.utcTime)}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.subIndicator || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-indigo-700 whitespace-nowrap">
                            {new Date(record.utcTime).toLocaleDateString()}
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="font-mono">
                              {record.station?.name + " " + record.station?.stationId || "--"}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.alteredThermometer || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-purple-700">
                            {metEntry?.barAsRead || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.correctedForIndex || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.heightDifference || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-purple-700">
                            {metEntry?.stationLevelPressure || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.seaLevelReduction || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-purple-700">
                            {metEntry?.correctedSeaLevelPressure || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.afternoonReading || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.pressureChange24h || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                            {metEntry?.dryBulbAsRead || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.wetBulbAsRead || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.maxMinTempAsRead || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                            {metEntry?.dryBulbCorrected || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.wetBulbCorrected || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.maxMinTempCorrected || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-teal-700">
                            {metEntry?.Td || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className={`${humidityClass} text-white`}>
                              {metEntry?.relativeHumidity || "--"}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-amber-700">
                            {metEntry?.squallForce || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.squallDirection || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.squallTime || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-blue-700">
                            {metEntry?.horizontalVisibility
                              ? Number.parseInt(metEntry.horizontalVisibility) % 10 === 0
                                ? Number.parseInt(metEntry.horizontalVisibility, 10) / 10
                                : (Number.parseInt(metEntry.horizontalVisibility, 10) / 10).toFixed(1)
                              : "--"}
                          </td>
                          <td className="border border-slate-300 p-1">{metEntry?.miscMeteors || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.pastWeatherW1 || "--"}</td>
                          <td className="border border-slate-300 p-1">{metEntry?.pastWeatherW2 || "--"}</td>
                          <td className="border border-slate-300 p-1 font-medium text-emerald-700">
                            {metEntry?.presentWeatherWW || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-sky-700">
                            {weatherObs?.cardIndicator || "--"}
                          </td>

                          {/* Second Card Data - Cloud Information */}
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
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudAmount || "--"}
                          </td>
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
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudAmount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudDirection || "--"}
                          </td>

                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className={`${cloudClass} text-white`}>
                              {weatherObs?.totalCloudAmount || "--"}
                            </Badge>
                          </td>

                          {/* Significant Cloud Layers */}
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

                          {/* Rainfall Data */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallTimeStart ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallTimeStart
                              ? moment(weatherObs.rainfallTimeStart).format("MMMM Do YYYY, h:mm")
                              : "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallTimeEnd ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallTimeEnd
                              ? moment(weatherObs.rainfallTimeEnd).format("MMMM Do YYYY, h:mm")
                              : "--"}
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

                          {/* Wind Data */}
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
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

MargeTable.displayName = "MargeTable"
export default MargeTable
