"use client"

import { useEffect, useState } from "react"
import WindArrowIndicator from "./windAnimation"
import { Map } from "leaflet"

interface Props {
  map: Map
}

const DhakaWindOverlay = ({ map }: Props) => {
  const [wind, setWind] = useState<{
    windSpeed: number
    windDirection: number
    position: [number, number]
  } | null>(null)

  useEffect(() => {
    const fetchWind = async () => {
      const res = await fetch("/api/second-card-data")
      const data = await res.json()

      const dhakaEntry = data.find((entry: any) => entry.station?.name === "Dhaka")
      const obs = dhakaEntry?.WeatherObservation?.[0]

      if (obs && dhakaEntry?.station) {
        setWind({
          windSpeed: parseFloat(obs.windSpeed || "0"),
          windDirection: parseFloat(obs.windDirection || "0"),
          position: [dhakaEntry.station.latitude, dhakaEntry.station.longitude],
        })
      }
    }

    fetchWind()
    const interval = setInterval(fetchWind, 5 * 60 * 1000) // refresh every 5 min

    return () => clearInterval(interval)
  }, [])

  if (!wind) return null

  return (
    <WindArrowIndicator
      windSpeed={wind.windSpeed}
      windDirection={wind.windDirection}
      position={wind.position}
      map={map}
      visible={true}
    />
  )
}

export default DhakaWindOverlay
