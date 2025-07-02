"use client"

import { useEffect, useState } from "react"
import { Map } from "leaflet"
import WindArrowIndicator from "./WindArroe"
import WindFlowTrailAnimation from "./windAnimation"

interface Props {
  map: Map
  visible: boolean
}

const WindArrowOverlay = ({ map, visible }: Props) => {
  const [windData, setWindData] = useState<
    {
      stationId: string
      name: string
      lat: number
      lon: number
      windSpeed: number
      windDirection: number
    }[]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/second-card-data")
      const data = await res.json()

      const parsed = data
        .map((entry: any) => {
          const obs = entry.WeatherObservation?.[0]
          const station = entry.station

          if (!obs || !station) return null

          const speed = parseFloat(obs.windSpeed || "0")
          const dir = parseFloat(obs.windDirection || "0")

          return {
            stationId: station.stationId,
            name: station.name,
            lat: station.latitude,
            lon: station.longitude,
            windSpeed: speed,
            windDirection: dir,
          }
        })
        .filter(Boolean)

      setWindData(parsed)
    }

    fetchData()
    const interval = setInterval(fetchData, 300_000) // refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  if (!visible || windData.length === 0) return null

  return (
    <>
      {windData.map((w) => (
        <WindArrowIndicator
          key={w.stationId}
          windSpeed={w.windSpeed}
          windDirection={w.windDirection}
          position={[w.lat, w.lon]}
          map={map}
        />
      ))}

      {windData.map((w) => (
        <WindFlowTrailAnimation
          visible={visible}
          windSpeed={w.windSpeed}
          windDirection={w.windDirection}
          position={[w.lat, w.lon]}
          map={map}
        />
      ))}
    </>
  )
}

export default WindArrowOverlay



