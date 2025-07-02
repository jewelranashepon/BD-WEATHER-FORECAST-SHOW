"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { utcToHour } from "@/lib/utils"
import { getDailySummary } from "@/app/actions/daily-summary"

interface Data {
  id: string
  utcTime: string
  localTime: string
  station: {
    stationId: string
    stationName: string
  }
  MeteorologicalEntry: Array<{
    id: string
    stationLevelPressure: string
    correctedSeaLevelPressure: string
    dryBulbAsRead: string
    wetBulbAsRead: string
    maxMinTempAsRead: string
    Td: string
    relativeHumidity: string
    horizontalVisibility: string
  }>
  WeatherObservation: Array<{
    id: string
    windSpeed: string
    windDirection: string
    totalCloudAmount: string
    rainfallLast24Hours: string
    rainfallTimeStart: string
    rainfallTimeEnd: string
  }>
  DailySummary: {
    id: string
    dataType: string
    avStationPressure: string
    avSeaLevelPressure: string
    avDryBulbTemperature: string
    avWetBulbTemperature: string
    maxTemperature: string
    minTemperature: string
    totalPrecipitation: string
    avDewPointTemperature: string
    avRelativeHumidity: string
    windSpeed: string
    windDirectionCode: string
    maxWindSpeed: string
    maxWindDirection: string
    avTotalCloud: string
    lowestVisibility: string
    totalRainDuration: string
    ObservingTime: {
      utcTime: string
      station: {
        stationId: string
        stationName: string
      }
    }
  }
}

// State types
type ObservationState = {
  firstCardData: Data["MeteorologicalEntry"][]
  secondCardData: Data["WeatherObservation"][]
  dailySummary: Data["DailySummary"] | null
}

// Column definitions matching the 16 measurements from daily summary form
const columnDefinitions = [
  {
    key: "time",
    label: "Time (UTC)",
    category: "time",
    width: "w-24",
    sticky: true,
  },
  {
    key: "avStationPressure",
    label: "Av. Station Pressure",
    unit: "hPa",
    category: "pressure",
    width: "w-32",
    range: "14-18",
  },
  {
    key: "avSeaLevelPressure",
    label: "Av. Sea-Level Pressure",
    unit: "hPa",
    category: "pressure",
    width: "w-32",
    range: "19-23",
  },
  {
    key: "avDryBulbTemperature",
    label: "Av. Dry-Bulb Temperature",
    unit: "°C",
    category: "temperature",
    width: "w-32",
    range: "24-26",
  },
  {
    key: "avWetBulbTemperature",
    label: "Av. Wet Bulb Temperature",
    unit: "°C",
    category: "temperature",
    width: "w-32",
    range: "27-29",
  },
  {
    key: "maxTemperature",
    label: "Max. Temperature",
    unit: "°C",
    category: "temperature",
    width: "w-28",
    range: "30-32",
  },
  {
    key: "minTemperature",
    label: "Min Temperature",
    unit: "°C",
    category: "temperature",
    width: "w-28",
    range: "33-35",
  },
  {
    key: "totalPrecipitation",
    label: "Total Precipitation",
    unit: "mm",
    category: "precipitation",
    width: "w-32",
    range: "36-39",
  },
  {
    key: "avDewPointTemperature",
    label: "Av. Dew Point Temperature",
    unit: "°C",
    category: "temperature",
    width: "w-32",
    range: "40-42",
  },
  {
    key: "avRelativeHumidity",
    label: "Av. Rel Humidity",
    unit: "%",
    category: "humidity",
    width: "w-28",
    range: "43-45",
  },
  {
    key: "avWindSpeed",
    label: "Av. Wind Speed",
    unit: "m/s",
    category: "wind",
    width: "w-28",
    range: "46-48",
  },
  {
    key: "prevailingWindDirection",
    label: "Prevailing Wind Direction",
    unit: "16Pts",
    category: "wind",
    width: "w-32",
    range: "49-50",
  },
  {
    key: "maxWindSpeed",
    label: "Max Wind Speed",
    unit: "m/s",
    category: "wind",
    width: "w-28",
    range: "51-53",
  },
  {
    key: "directionOfMaxWind",
    label: "Direction of Max Wind",
    unit: "16Pts",
    category: "wind",
    width: "w-32",
    range: "54-55",
  },
  {
    key: "avTotalCloud",
    label: "Av. Total Cloud",
    unit: "octas",
    category: "cloud",
    width: "w-28",
    range: "56",
  },
  {
    key: "lowestVisibility",
    label: "Lowest visibility",
    unit: "km",
    category: "visibility",
    width: "w-28",
    range: "57-59",
  },
  {
    key: "totalDurationOfRain",
    label: "Total Duration of Rain",
    unit: "H-M",
    category: "precipitation",
    width: "w-32",
    range: "60-63",
  },
]

const categoryColors = {
  time: "bg-slate-50 text-slate-700 border-slate-200",
  pressure: "bg-blue-50 text-blue-700 border-blue-200",
  temperature: "bg-amber-50 text-amber-700 border-amber-200",
  precipitation: "bg-cyan-50 text-cyan-700 border-cyan-200",
  humidity: "bg-indigo-50 text-indigo-700 border-indigo-200",
  wind: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cloud: "bg-slate-50 text-slate-700 border-slate-200",
  visibility: "bg-yellow-50 text-yellow-700 border-yellow-200",
}

export function WeatherDataTable() {
  const [observations, setObservations] = useState<ObservationState>({
    firstCardData: [],
    secondCardData: [],
    dailySummary: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [firstCardPromise, secondCardPromise] = await Promise.all([
        fetch("/api/first-card-data"),
        fetch("/api/second-card-data"),
      ])

      const [firstCardData, secondCardData, dailySummary] = await Promise.all([
        firstCardPromise.json(),
        secondCardPromise.json(),
        getDailySummary(selectedDate),
      ])

      setObservations({
        firstCardData: firstCardData.entries,
        secondCardData,
        dailySummary: dailySummary.data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const formatValue = (value: string | null | undefined, unit?: string) => {
    if (!value || value === "" || value === "null") return "--"
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return value

    // Format number to remove trailing zeros
    const formattedNumber = numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1)
    return `${formattedNumber}${unit ? ` ${unit}` : ""}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={fetchData} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const maxRows = Math.max(observations.firstCardData.length, observations.secondCardData.length)

  return (
    <div className="space-y-6">
     

      {/* Data Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-gray-50">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Hourly Weather Observations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  {columnDefinitions.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-3 text-center font-medium text-xs uppercase tracking-wider ${
                        categoryColors[col.category]
                      } ${col.width} ${col.sticky ? "sticky left-0 z-10" : ""}`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span>{col.label}</span>
                        {col.unit && <span className="text-xs font-normal opacity-75">({col.unit})</span>}
                        {col.range && (
                          <span className="text-xs font-mono bg-white bg-opacity-50 px-1 rounded">{col.range}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Hourly Data Rows */}
                {Array.from({ length: maxRows }).map((_, index) => {
                  const firstData = observations.firstCardData[index]
                  const secondData = observations.secondCardData[index]

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                    >
                      {/* Time Column */}
                      <td className="px-3 py-3 text-center font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 z-10">
                        {firstData ? utcToHour(firstData?.utcTime) : "--"}
                      </td>

                      {/* 1. Av. Station Pressure */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.stationLevelPressure)
                          : "--"}
                      </td>

                      {/* 2. Av. Sea-Level Pressure */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.correctedSeaLevelPressure)
                          : "--"}
                      </td>

                      {/* 3. Av. Dry-Bulb Temperature */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.dryBulbAsRead)
                          : "--"}
                      </td>

                      {/* 4. Av. Wet Bulb Temperature */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.wetBulbAsRead)
                          : "--"}
                      </td>

                      {/* 5. Max. Temperature */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.maxMinTempAsRead)
                          : "--"}
                      </td>

                      {/* 6. Min Temperature */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.maxMinTempAsRead)
                          : "--"}
                      </td>

                      {/* 7. Total Precipitation */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0]
                          ? formatValue(secondData.WeatherObservation[0]?.rainfallLast24Hours)
                          : "--"}
                      </td>

                      {/* 8. Av. Dew Point Temperature */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0] ? formatValue(firstData.MeteorologicalEntry[0]?.Td) : "--"}
                      </td>

                      {/* 9. Av. Rel Humidity */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.relativeHumidity)
                          : "--"}
                      </td>

                      {/* 10. Av. Wind Speed */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0]
                          ? formatValue(secondData.WeatherObservation[0]?.windSpeed)
                          : "--"}
                      </td>

                      {/* 11. Prevailing Wind Direction */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0]
                          ? formatValue(secondData.WeatherObservation[0]?.windDirection)
                          : "--"}
                      </td>

                      {/* 12. Max Wind Speed */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0]
                          ? formatValue(secondData.WeatherObservation[0]?.windSpeed)
                          : "--"}
                      </td>

                      {/* 13. Direction of Max Wind */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0]
                          ? formatValue(secondData.WeatherObservation[0]?.windDirection)
                          : "--"}
                      </td>

                      {/* 14. Av. Total Cloud */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0]
                          ? formatValue(secondData.WeatherObservation[0]?.totalCloudAmount)
                          : "--"}
                      </td>

                      {/* 15. Lowest visibility */}
                      <td className="px-3 py-3 text-center">
                        {firstData?.MeteorologicalEntry?.[0]
                          ? formatValue(firstData.MeteorologicalEntry[0]?.horizontalVisibility)
                          : "--"}
                      </td>

                      {/* 16. Total Duration of Rain */}
                      <td className="px-3 py-3 text-center">
                        {secondData?.WeatherObservation?.[0] &&
                        secondData.WeatherObservation[0]?.rainfallTimeStart &&
                        secondData.WeatherObservation[0]?.rainfallTimeEnd
                          ? (() => {
                              const start = new Date(secondData.WeatherObservation[0].rainfallTimeStart)
                              const end = new Date(secondData.WeatherObservation[0].rainfallTimeEnd)
                              const diffMs = end.getTime() - start.getTime()
                              const hours = Math.floor(diffMs / (1000 * 60 * 60))
                              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                              return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                            })()
                          : "--"}
                      </td>
                    </tr>
                  )
                })}

                {/* Daily Summary Row */}
                {observations.dailySummary && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200 font-medium">
                    <td className="px-3 py-4 text-center font-semibold text-blue-900 sticky left-0 bg-blue-50 border-r border-blue-200 z-10">
                      Daily Summary
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avStationPressure)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avSeaLevelPressure)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avDryBulbTemperature)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avWetBulbTemperature)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.maxTemperature)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.minTemperature)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.totalPrecipitation)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avDewPointTemperature)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avRelativeHumidity)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.windSpeed)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.windDirectionCode)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.maxWindSpeed)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.maxWindDirection)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.avTotalCloud)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.lowestVisibility)}
                    </td>
                    <td className="px-3 py-4 text-center text-blue-800">
                      {formatValue(observations.dailySummary?.totalRainDuration)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

     
      {/* No Data Message */}
      {observations.firstCardData.length === 0 &&
        observations.secondCardData.length === 0 &&
        !observations.dailySummary && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h3>
              <p className="text-yellow-700">
                No weather observations or daily summary found for {selectedDate}. Please ensure both first card and
                second card data have been submitted.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

