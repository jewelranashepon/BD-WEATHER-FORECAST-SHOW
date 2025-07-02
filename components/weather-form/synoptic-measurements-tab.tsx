"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function SynopticMeasurementsTab() {
  const { values, errors, touched, setFieldValue } = useFormikContext<{
    weatherRemark: string
  }>()

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-amber-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-2">
          <BarChart3 className="h-4 w-4" />
        </span>
        Synoptic Measurements
      </h2>

      <Card className="border-amber-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-amber-50">
          <CardTitle className="text-sm font-medium text-amber-700">Weather Remarks</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label htmlFor="weatherRemark">Weather Remark</Label>
            <Textarea
              id="weatherRemark"
              value={values.weatherRemark || ""}
              onChange={(e) => setFieldValue("weatherRemark", e.target.value)}
              className="min-h-[150px] border-amber-200 focus:border-amber-500"
              placeholder="Enter detailed weather remarks here..."
            />
            {errors.weatherRemark && touched.weatherRemark && (
              <p className="text-sm text-destructive mt-1">{errors.weatherRemark}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
