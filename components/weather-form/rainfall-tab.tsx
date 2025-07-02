"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain } from "lucide-react"

export default function RainfallTab() {
  const { values, setFieldValue } = useFormikContext<{
    rainfall: {
      timeStart?: string
      timeEnd?: string
      sincePrevious?: string
      duringPrevious?: string
      last24Hours?: string
    }
  }>()

  // Initialize rainfall object if it doesn't exist
  const rainfall = values.rainfall || {}

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-violet-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center mr-2">
          <CloudRain className="h-4 w-4" />
        </span>
        Rainfall Measurement (mm)
      </h2>

      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
          <CardTitle className="text-sm font-medium text-violet-700">Rainfall Data</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="time-start">Time of Start (HH:MM UTC)</Label>
              <Input
                id="time-start"
                value={rainfall.timeStart || ""}
                onChange={(e) => setFieldValue("rainfall.timeStart", e.target.value)}
                className="border-violet-200 focus:border-violet-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time-end">Time of Ending (HH:MM UTC)</Label>
              <Input
                id="time-end"
                value={rainfall.timeEnd || ""}
                onChange={(e) => setFieldValue("rainfall.timeEnd", e.target.value)}
                className="border-violet-200 focus:border-violet-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="since-previous">Since Previous Observation</Label>
              <Input
                id="since-previous"
                value={rainfall.sincePrevious || ""}
                onChange={(e) => setFieldValue("rainfall.sincePrevious", e.target.value)}
                className="border-violet-200 focus:border-violet-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="during-previous">During Previous 6 Hours (At 00, 06, 12, 18 UTC)</Label>
              <Input
                id="during-previous"
                value={rainfall.duringPrevious || ""}
                onChange={(e) => setFieldValue("rainfall.duringPrevious", e.target.value)}
                className="border-violet-200 focus:border-violet-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-24-hours">Last 24 Hours Precipitation</Label>
              <Input
                id="last-24-hours"
                value={rainfall.last24Hours || ""}
                onChange={(e) => setFieldValue("rainfall.last24Hours", e.target.value)}
                className="border-violet-200 focus:border-violet-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
