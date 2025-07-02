"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Thermometer } from "lucide-react"

export default function TemperatureTab() {
  const { values, setFieldValue } = useFormikContext<{
    temperature: {
      asRead?: {
        dryBulb?: string
        wetBulb?: string
        maxMin?: string
      }
      corrected?: {
        dryBulb?: string
        wetBulb?: string
        maxMin?: string
      }
      dewPoint?: string
      relativeHumidity?: string
    }
  }>()

  // Initialize temperature object if it doesn't exist
  const temperature = values.temperature || {}
  const asRead = temperature.asRead || {}
  const corrected = temperature.corrected || {}

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-indigo-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2">
          <Thermometer className="h-4 w-4" />
        </span>
        Temperature Measurements
      </h2>

      <Card className="border-indigo-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-indigo-50">
          <CardTitle className="text-sm font-medium text-indigo-700">Temperature Data</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="as-read" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-indigo-50 rounded-lg">
              <TabsTrigger
                value="as-read"
                className="data-[state=active]:bg-indigo-200 data-[state=active]:text-indigo-800"
              >
                As Read
              </TabsTrigger>
              <TabsTrigger
                value="corrected"
                className="data-[state=active]:bg-indigo-200 data-[state=active]:text-indigo-800"
              >
                Corrected
              </TabsTrigger>
            </TabsList>

            {/* As Read Temperature Values */}
            <TabsContent value="as-read" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dryBulbAsRead">Dry-bulb (°C)</Label>
                  <Input
                    id="dryBulbAsRead"
                    value={asRead.dryBulb || ""}
                    onChange={(e) => setFieldValue("temperature.asRead.dryBulb", e.target.value)}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wetBulbAsRead">Wet-bulb (°C)</Label>
                  <Input
                    id="wetBulbAsRead"
                    value={asRead.wetBulb || ""}
                    onChange={(e) => setFieldValue("temperature.asRead.wetBulb", e.target.value)}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMinTempAsRead">MAX/MIN (°C)</Label>
                  <Input
                    id="maxMinTempAsRead"
                    value={asRead.maxMin || ""}
                    onChange={(e) => setFieldValue("temperature.asRead.maxMin", e.target.value)}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Corrected Temperature Values */}
            <TabsContent value="corrected" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dryBulbCorrected">Dry-bulb (°C)</Label>
                  <Input
                    id="dryBulbCorrected"
                    value={corrected.dryBulb || ""}
                    onChange={(e) => setFieldValue("temperature.corrected.dryBulb", e.target.value)}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wetBulbCorrected">Wet-bulb (°C)</Label>
                  <Input
                    id="wetBulbCorrected"
                    value={corrected.wetBulb || ""}
                    onChange={(e) => setFieldValue("temperature.corrected.wetBulb", e.target.value)}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMinTempCorrected">MAX/MIN (°C)</Label>
                  <Input
                    id="maxMinTempCorrected"
                    value={corrected.maxMin || ""}
                    onChange={(e) => setFieldValue("temperature.corrected.maxMin", e.target.value)}
                    className="border-indigo-200 focus:border-indigo-500"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-indigo-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-indigo-50">
          <CardTitle className="text-sm font-medium text-indigo-700">Additional Temperature Data</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dewPoint">Dew-Point Temperature (°C)</Label>
            <Input
              id="dewPoint"
              value={temperature.dewPoint || ""}
              onChange={(e) => setFieldValue("temperature.dewPoint", e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relativeHumidity">Relative Humidity (%)</Label>
            <Input
              id="relativeHumidity"
              value={temperature.relativeHumidity || ""}
              onChange={(e) => setFieldValue("temperature.relativeHumidity", e.target.value)}
              type="number"
              min="0"
              max="100"
              className="border-indigo-200 focus:border-indigo-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
