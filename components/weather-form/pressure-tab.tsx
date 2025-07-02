"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function PressureTab() {
  const { values, setFieldValue } = useFormikContext<{
    pressure: {
      subIndicator?: string
      alteredThermometer?: string
      barAsRead?: string
      correctedForIndex?: string
      heightDifference?: string
      correctionForTemp?: string
      stationLevelPressure?: string
      seaLevelReduction?: string
      correctedSeaLevelPressure?: string
      altimeterSetting?: string
      pressureChange24h?: string
    }
  }>()

  // Initialize pressure object if it doesn't exist
  const pressure = values.pressure || {}

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-indigo-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2">
          <BarChart3 className="h-4 w-4" />
        </span>
        Bar Pressure Measurements
      </h2>

      <Card className="border-indigo-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-indigo-50">
          <CardTitle className="text-sm font-medium text-indigo-700">Pressure Data</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="subIndicator">1st Card Indicator</Label>
            <Input
              id="subIndicator"
              value={pressure.subIndicator || ""}
              onChange={(e) => setFieldValue("pressure.subIndicator", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alteredThermometer">Altered Thermometer</Label>
            <Input
              id="alteredThermometer"
              value={pressure.alteredThermometer || ""}
              onChange={(e) => setFieldValue("pressure.alteredThermometer", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barAsRead">Bar As Read(hPa)</Label>
            <Input
              id="barAsRead"
              value={pressure.barAsRead || ""}
              onChange={(e) => setFieldValue("pressure.barAsRead", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctedForIndex">Corrected for Index Temp-gravity(hPa)</Label>
            <Input
              id="correctedForIndex"
              value={pressure.correctedForIndex || ""}
              onChange={(e) => setFieldValue("pressure.correctedForIndex", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heightDifference">Height Difference Correction(hPa)</Label>
            <Input
              id="heightDifference"
              value={pressure.heightDifference || ""}
              onChange={(e) => setFieldValue("pressure.heightDifference", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctionForTemp">Correction for Temp</Label>
            <Input
              id="correctionForTemp"
              value={pressure.correctionForTemp || ""}
              onChange={(e) => setFieldValue("pressure.correctionForTemp", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stationLevelPressure">Station Level Pressure (P.P.P.P.hpa)</Label>
            <Input
              id="stationLevelPressure"
              value={pressure.stationLevelPressure || ""}
              onChange={(e) => setFieldValue("pressure.stationLevelPressure", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seaLevelReduction">Sea Level Reduction Constant</Label>
            <Input
              id="seaLevelReduction"
              value={pressure.seaLevelReduction || ""}
              onChange={(e) => setFieldValue("pressure.seaLevelReduction", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctedSeaLevelPressure">Sea-Level Pressure(PPPP)hpa</Label>
            <Input
              id="correctedSeaLevelPressure"
              value={pressure.correctedSeaLevelPressure || ""}
              onChange={(e) => setFieldValue("pressure.correctedSeaLevelPressure", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="altimeterSetting">Altimeter setting(QNH)</Label>
            <Input
              id="altimeterSetting"
              value={pressure.altimeterSetting || ""}
              onChange={(e) => setFieldValue("pressure.altimeterSetting", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pressureChange24h">24-Hour Pressure Change</Label>
            <Input
              id="pressureChange24h"
              value={pressure.pressureChange24h || ""}
              onChange={(e) => setFieldValue("pressure.pressureChange24h", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
