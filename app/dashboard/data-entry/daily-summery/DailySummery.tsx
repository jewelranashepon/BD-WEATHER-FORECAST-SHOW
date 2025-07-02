"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { AlertCircle, Loader2 } from "lucide-react"
import moment from "moment"

// Daily Summary Form Values Interface
interface DailySummaryFormValues {
  measurements: string[]
  dataType: string
  stationNo: string
  year: string
  month: string
  day: string
}

// Measurements configuration for daily summary
const measurements = [
  { id: 0, label: "Av. Station Pressure", range: "14-18", unit: "hPa", category: "pressure" },
  { id: 1, label: "Av. Sea-Level Pressure", range: "19-23", unit: "hPa", category: "pressure" },
  { id: 2, label: "Av. Dry-Bulb Temperature", range: "24-26", unit: "°C", category: "temperature" },
  { id: 3, label: "Av. Wet Bulb Temperature", range: "27-29", unit: "°C", category: "temperature" },
  { id: 4, label: "Max. Temperature", range: "30-32", unit: "°C", category: "temperature" },
  { id: 5, label: "Min Temperature", range: "33-35", unit: "°C", category: "temperature" },
  { id: 6, label: "Total Precipitation", range: "36-39", unit: "mm", category: "precipitation" },
  { id: 7, label: "Av. Dew Point Temperature", range: "40-42", unit: "°C", category: "temperature" },
  { id: 8, label: "Av. Rel Humidity", range: "43-45", unit: "%", category: "humidity" },
  { id: 9, label: "Av. Wind Speed", range: "46-48", unit: "m/s", category: "wind" },
  { id: 10, label: "Prevailing Wind Direction", range: "49-50", unit: "16Pts", category: "wind" },
  { id: 11, label: "Max Wind Speed", range: "51-53", unit: "m/s", category: "wind" },
  { id: 12, label: "Direction of Max Wind", range: "54-55", unit: "16Pts", category: "wind" },
  { id: 13, label: "Av. Total Cloud", range: "56", unit: "octas", category: "cloud" },
  { id: 14, label: "Lowest visibility", range: "57-59", unit: "km", category: "visibility" },
  { id: 15, label: "Total Duration of Rain", range: "60-63", unit: "H-M", category: "precipitation" },
]

const categoryColors = {
  pressure: "bg-blue-50 text-blue-700",
  temperature: "bg-amber-50 text-amber-700",
  precipitation: "bg-cyan-50 text-cyan-700",
  humidity: "bg-indigo-50 text-indigo-700",
  wind: "bg-emerald-50 text-emerald-700",
  cloud: "bg-slate-50 text-slate-700",
  visibility: "bg-yellow-50 text-yellow-700",
}

export function DailySummaryForm() {
  const { values, setFieldValue } = useFormikContext<DailySummaryFormValues>()
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [dataStatus, setDataStatus] = useState<{
    hasToday: boolean
    message: string
    isLoading: boolean
    error?: string
  }>({
    hasToday: true,
    message: "",
    isLoading: true,
  })

  useEffect(() => {
    const fetchDailySummaryData = async () => {
      try {
        setDataStatus((prev) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }))

        // Fetch meteorological data
        const firstCardResponse = await fetch("/api/first-card-data")
        const formatedFirstCardData = await firstCardResponse.json()
        const todayFirstCardData = await formatedFirstCardData.entries.flatMap((item: any) => item.MeteorologicalEntry)

        // Fetch weather observations
        const observationsResponse = await fetch("/api/second-card-data")
        const formatedObservationsData = await observationsResponse.json()
        const todayWeatherObservations = formatedObservationsData.flatMap((item: any) => item.WeatherObservation)

        const calculatedMeasurements = Array(16).fill("")

        // Helper function to process meteorological data
        const processFirstCard = (key: string, id: number, reducer: (arr: number[]) => number) => {
          const values = todayFirstCardData
            .map((item: any) => Number.parseFloat(item[key]))
            .filter((val: number) => !isNaN(val))
          if (values.length > 0) calculatedMeasurements[id] = Math.round(reducer(values)).toString()
        }

        // Calculate pressure measurements
        processFirstCard("stationLevelPressure", 0, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)
        processFirstCard("correctedSeaLevelPressure", 1, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)

        // Calculate temperature measurements
        processFirstCard("dryBulbAsRead", 2, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)
        processFirstCard("wetBulbAsRead", 3, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)
        processFirstCard("maxMinTempAsRead", 4, (arr) => Math.max(...arr))
        processFirstCard("maxMinTempAsRead", 5, (arr) => Math.min(...arr))
        const rainfallLast24Hours = todayWeatherObservations.map((item: any) => Number.parseFloat(item.rainfallLast24Hours))
        processFirstCard("Td", 7, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)

        // Calculate humidity
        processFirstCard("relativeHumidity", 8, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)

        // Calculate visibility
        processFirstCard("horizontalVisibility", 14, (arr) => Math.min(...arr))

        // Calculate precipitation
        const totalPrecip = rainfallLast24Hours.reduce((sum: number, item: number) => isNaN(item) ? sum : sum + item, 0)
        if (totalPrecip > 0) calculatedMeasurements[6] = totalPrecip.toString()

        // Calculate wind measurements
        const windSpeeds = todayWeatherObservations
          .map((item: any) => Number.parseFloat(item.windSpeed))
          .filter((val) => !isNaN(val))
        if (windSpeeds.length > 0) {
          calculatedMeasurements[9] = Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length).toString()
        }

        // Calculate prevailing wind direction
        const directions = todayWeatherObservations.map((item: any) => item.windDirection)
        if (directions.length > 0) {
          const dirCount = directions.reduce((acc: Record<string, number>, dir: string) => {
            acc[dir] = (acc[dir] || 0) + 1
            return acc
          }, {})
          calculatedMeasurements[10] = Object.entries(dirCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        }

        // Calculate max wind speed and direction
        const windData = todayWeatherObservations
          .map((item: any) => ({
            speed: Number.parseFloat(item.windSpeed),
            direction: item.windDirection,
          }))
          .filter((item) => !isNaN(item.speed))
        if (windData.length > 0) {
          const maxWind = windData.reduce((max, item) => (item.speed > max.speed ? item : max))
          calculatedMeasurements[11] = Math.round(maxWind.speed).toString()
          calculatedMeasurements[12] = maxWind.direction
        }

        // Calculate cloud amount
        const cloudAmounts = todayWeatherObservations
          .map((item: any) => Number.parseFloat(item.totalCloudAmount))
          .filter((val) => !isNaN(val))
        if (cloudAmounts.length > 0) {
          calculatedMeasurements[13] = Math.round(
            cloudAmounts.reduce((a, b) => a + b, 0) / cloudAmounts.length,
          ).toString()
        }

        // Calculate rain duration
        const totalRainDuration = todayWeatherObservations.reduce((totalMinutes: number, item: any) => {
          if (item.rainfallTimeStart && item.rainfallTimeEnd) {
            const startTime = moment(item.rainfallTimeStart, 'YYYY-MM-DD HH:mm:ss');
            const endTime = moment(item.rainfallTimeEnd, 'YYYY-MM-DD HH:mm:ss');
            
            let duration = moment.duration(endTime.diff(startTime)).asMinutes();
            
            if (duration < 0) {
              duration += 1440; // add 24 hours if crossed midnight
            }
            
            return totalMinutes + duration;
          }
          return totalMinutes;
        }, 0);
        
        // Convert total minutes to H:MM format
        const hours = Math.floor(totalRainDuration / 60);
        const minutes = Math.round(totalRainDuration % 60);
        const formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}`;
        
        if (totalRainDuration > 0) {
          const hours = Math.floor(totalRainDuration / 60);
          const minutes = totalRainDuration % 60;
          calculatedMeasurements[15] = `${hours.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}`;
        }

        // Check if today's date matches the selected date
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
          today.getDate(),
        ).padStart(2, "0")}`
        const isToday = todayStr === selectedDate

        setDataStatus({
          hasToday: isToday,
          message: isToday ? "Using today's weather data" : "No data available for today, using most recent data",
          isLoading: false,
        })

        // Update form fields
        setFieldValue("measurements", calculatedMeasurements)
        setFieldValue("stationNo", session?.user?.station?.stationId || "41953")
        setFieldValue("dataType", "SY")
        setFieldValue("year", new Date(selectedDate).getFullYear().toString())
        setFieldValue("month", (new Date(selectedDate).getMonth() + 1).toString().padStart(2, "0"))
        setFieldValue("day", new Date(selectedDate).getDate().toString().padStart(2, "0"))
      } catch (error) {
        console.error("Error fetching daily summary data:", error)
        setDataStatus({
          hasToday: false,
          message: "Error loading weather data",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })

        // Set default values on error
        const now = new Date(selectedDate)
        setFieldValue("measurements", Array(16).fill(""))
        setFieldValue("stationNo", session?.user?.station?.stationId || "41953")
        setFieldValue("dataType", "SY")
        setFieldValue("year", now.getFullYear().toString())
        setFieldValue("month", String(now.getMonth() + 1).padStart(2, "0"))
        setFieldValue("day", String(now.getDate()).padStart(2, "0"))
      }
    }

    fetchDailySummaryData()
  }, [selectedDate, setFieldValue, session])

  if (dataStatus.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading daily summary data...</p>
        </div>
      </div>
    )
  }

  // const handleSubmit = async () => {
  //   try {
  //     const payload = {
  //       dataType: values.dataType || "SY",
  //       measurements: values.measurements,
  //       windDirection: values.measurements[10] || "",
  //     }

  //     const response = await fetch("/api/daily-summary", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     })

  //     const result = await response.json()

  //     if (!result.success) {
  //       return toast.error(result.error)
  //     }

  //     if (!response.ok) {
  //       return toast.error(result.error)
  //     }

  //     if (result.success) {
  //       toast.success(result.message)
  //     }
  //   } catch (error) {
  //     console.error("Submit error:", error)
  //     toast.error("❌ Something went wrong")
  //   }
  // }

  const handleMeasurementChange = (index: number, value: string) => {
    const newMeasurements = [...values.measurements]
    newMeasurements[index] = value
    setFieldValue("measurements", newMeasurements)
  }

  return (
    <div className="space-y-6">

      {/* Status Messages */}
      {dataStatus.error ? (
        <div className="p-3 rounded-md bg-red-100 text-red-800 text-sm">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Error: {dataStatus.error}
          </div>
        </div>
      ) : (
        dataStatus.message && (
          <div
            className={`p-3 rounded-md text-sm ${dataStatus.hasToday ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
              }`}
          >
            <div className="flex items-center">
              {dataStatus.hasToday ? (
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
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}
              {dataStatus.message}
            </div>
          </div>
        )
      )}

      {/* Measurement Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <CardTitle className="text-sm font-medium text-blue-700">Measurements 1-8</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
                      {item.label}
                    </Label>
                    <div className={`text-xs px-1 py-0.5 rounded mt-1 ${categoryColors[item.category]}`}>
                      {item.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-4">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      onChange={(e) => handleMeasurementChange(item.id, e.target.value)}
                      className="border-blue-200 bg-white cursor-text disabled:opacity-80 disabled:font-semibold"
                      placeholder="--"
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <CardTitle className="text-sm font-medium text-blue-700">Measurements 9-16</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
                      {item.label}
                    </Label>
                    <div className={`text-xs px-1 py-0.5 rounded mt-1 ${categoryColors[item.category]}`}>
                      {item.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-4">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      onChange={(e) => handleMeasurementChange(item.id, e.target.value)}
                      className="border-blue-200 bg-white cursor-text disabled:opacity-80 disabled:font-semibold"
                      placeholder="--"
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      {/* <div className="flex justify-end mt-6">
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md shadow-sm text-lg"
          onClick={handleSubmit}
        >
          Submit Daily Summary
        </Button>
      </div> */}
    </div>
  )
}


