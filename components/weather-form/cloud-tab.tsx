"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud } from "lucide-react"

export default function CloudTab() {
  const { values, setFieldValue } = useFormikContext<{
    cloud: {
      totalAmount?: string
      lowCloud?: {
        direction?: string
        height?: string
        form?: string
        amount?: string
      }
      mediumCloud?: {
        direction?: string
        height?: string
        form?: string
        amount?: string
      }
      highCloud?: {
        direction?: string
        height?: string
        form?: string
        amount?: string
      }
      significantCloud?: {
        layer1?: {
          height?: string
          form?: string
          amount?: string
        }
        layer2?: {
          height?: string
          form?: string
          amount?: string
        }
        layer3?: {
          height?: string
          form?: string
          amount?: string
        }
        layer4?: {
          height?: string
          form?: string
          amount?: string
        }
      }
    }
  }>()

  // Initialize cloud object if it doesn't exist
  const cloud = values.cloud || {}

  const handleCloudChange = (section, field, value) => {
    setFieldValue(`cloud.${section}.${field}`, value)
  }

  const handleSignificantCloudChange = (layer, field, value) => {
    setFieldValue(`cloud.significantCloud.${layer}.${field}`, value)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-violet-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center mr-2">
          <Cloud className="h-4 w-4" />
        </span>
        Cloud Observation
      </h2>

      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
          <CardTitle className="text-sm font-medium text-violet-700">Total Cloud Amount</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-2">
            <Label htmlFor="total-cloud-amount">Total Cloud Amount (Octa)</Label>
            <Input
              id="total-cloud-amount"
              value={cloud.totalAmount || ""}
              onChange={(e) => setFieldValue("cloud.totalAmount", e.target.value)}
              className="border-violet-200 focus:border-violet-500"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="low" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="low" className="data-[state=active]:bg-violet-400 data-[state=active]:text-white">
            LOW
          </TabsTrigger>
          <TabsTrigger value="medium" className="data-[state=active]:bg-violet-400 data-[state=active]:text-white">
            MEDIUM
          </TabsTrigger>
          <TabsTrigger value="high" className="data-[state=active]:bg-violet-400 data-[state=active]:text-white">
            HIGH
          </TabsTrigger>
        </TabsList>

        <TabsContent value="low">
          <Card className="border-violet-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
              <CardTitle className="text-sm font-medium text-violet-700">Low Cloud</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="low-cloud-direction">Direction (Code)</Label>
                  <Input
                    id="low-cloud-direction"
                    value={cloud.lowCloud?.direction || ""}
                    onChange={(e) => handleCloudChange("lowCloud", "direction", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="low-cloud-height">Height of Base (Code)</Label>
                  <Input
                    id="low-cloud-height"
                    value={cloud.lowCloud?.height || ""}
                    onChange={(e) => handleCloudChange("lowCloud", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="low-cloud-form">Form (Code)</Label>
                  <Input
                    id="low-cloud-form"
                    value={cloud.lowCloud?.form || ""}
                    onChange={(e) => handleCloudChange("lowCloud", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="low-cloud-amount">Amount (Octa)</Label>
                  <Input
                    id="low-cloud-amount"
                    value={cloud.lowCloud?.amount || ""}
                    onChange={(e) => handleCloudChange("lowCloud", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medium">
          <Card className="border-violet-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
              <CardTitle className="text-sm font-medium text-violet-700">Medium Cloud</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="medium-cloud-direction">Direction (Code)</Label>
                  <Input
                    id="medium-cloud-direction"
                    value={cloud.mediumCloud?.direction || ""}
                    onChange={(e) => handleCloudChange("mediumCloud", "direction", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medium-cloud-height">Height of Base (Code)</Label>
                  <Input
                    id="medium-cloud-height"
                    value={cloud.mediumCloud?.height || ""}
                    onChange={(e) => handleCloudChange("mediumCloud", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medium-cloud-form">Form (Code)</Label>
                  <Input
                    id="medium-cloud-form"
                    value={cloud.mediumCloud?.form || ""}
                    onChange={(e) => handleCloudChange("mediumCloud", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medium-cloud-amount">Amount (Octa)</Label>
                  <Input
                    id="medium-cloud-amount"
                    value={cloud.mediumCloud?.amount || ""}
                    onChange={(e) => handleCloudChange("mediumCloud", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high">
          <Card className="border-violet-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
              <CardTitle className="text-sm font-medium text-violet-700">High Cloud</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="high-cloud-direction">Direction (Code)</Label>
                  <Input
                    id="high-cloud-direction"
                    value={cloud.highCloud?.direction || ""}
                    onChange={(e) => handleCloudChange("highCloud", "direction", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="high-cloud-height">Height of Base (Code)</Label>
                  <Input
                    id="high-cloud-height"
                    value={cloud.highCloud?.height || ""}
                    onChange={(e) => handleCloudChange("highCloud", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="high-cloud-form">Form (Code)</Label>
                  <Input
                    id="high-cloud-form"
                    value={cloud.highCloud?.form || ""}
                    onChange={(e) => handleCloudChange("highCloud", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="high-cloud-amount">Amount (Octa)</Label>
                  <Input
                    id="high-cloud-amount"
                    value={cloud.highCloud?.amount || ""}
                    onChange={(e) => handleCloudChange("highCloud", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
          <CardTitle className="text-sm font-medium text-violet-700">Significant Cloud</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="layer1" className="w-full">
            <TabsList className="flex flex-wrap w-full mb-4">
              <TabsTrigger
                value="layer1"
                className="flex-1 data-[state=active]:bg-violet-400 data-[state=active]:text-white"
              >
                1st Layer
              </TabsTrigger>
              <TabsTrigger
                value="layer2"
                className="flex-1 data-[state=active]:bg-violet-400 data-[state=active]:text-white"
              >
                2nd Layer
              </TabsTrigger>
              <TabsTrigger
                value="layer3"
                className="flex-1 data-[state=active]:bg-violet-400 data-[state=active]:text-white"
              >
                3rd Layer
              </TabsTrigger>
              <TabsTrigger
                value="layer4"
                className="flex-1 data-[state=active]:bg-violet-400 data-[state=active]:text-white"
              >
                4th Layer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layer1">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="layer1-height">Height of Base (Code)</Label>
                  <Input
                    id="layer1-height"
                    value={cloud.significantCloud?.layer1?.height || ""}
                    onChange={(e) => handleSignificantCloudChange("layer1", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer1-form">Form (Code)</Label>
                  <Input
                    id="layer1-form"
                    value={cloud.significantCloud?.layer1?.form || ""}
                    onChange={(e) => handleSignificantCloudChange("layer1", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer1-amount">Amount (Octa)</Label>
                  <Input
                    id="layer1-amount"
                    value={cloud.significantCloud?.layer1?.amount || ""}
                    onChange={(e) => handleSignificantCloudChange("layer1", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layer2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="layer2-height">Height of Base (Code)</Label>
                  <Input
                    id="layer2-height"
                    value={cloud.significantCloud?.layer2?.height || ""}
                    onChange={(e) => handleSignificantCloudChange("layer2", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer2-form">Form (Code)</Label>
                  <Input
                    id="layer2-form"
                    value={cloud.significantCloud?.layer2?.form || ""}
                    onChange={(e) => handleSignificantCloudChange("layer2", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer2-amount">Amount (Octa)</Label>
                  <Input
                    id="layer2-amount"
                    value={cloud.significantCloud?.layer2?.amount || ""}
                    onChange={(e) => handleSignificantCloudChange("layer2", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layer3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="layer3-height">Height of Base (Code)</Label>
                  <Input
                    id="layer3-height"
                    value={cloud.significantCloud?.layer3?.height || ""}
                    onChange={(e) => handleSignificantCloudChange("layer3", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer3-form">Form (Code)</Label>
                  <Input
                    id="layer3-form"
                    value={cloud.significantCloud?.layer3?.form || ""}
                    onChange={(e) => handleSignificantCloudChange("layer3", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer3-amount">Amount (Octa)</Label>
                  <Input
                    id="layer3-amount"
                    value={cloud.significantCloud?.layer3?.amount || ""}
                    onChange={(e) => handleSignificantCloudChange("layer3", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layer4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="layer4-height">Height of Base (Code)</Label>
                  <Input
                    id="layer4-height"
                    value={cloud.significantCloud?.layer4?.height || ""}
                    onChange={(e) => handleSignificantCloudChange("layer4", "height", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer4-form">Form (Code)</Label>
                  <Input
                    id="layer4-form"
                    value={cloud.significantCloud?.layer4?.form || ""}
                    onChange={(e) => handleSignificantCloudChange("layer4", "form", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="layer4-amount">Amount (Octa)</Label>
                  <Input
                    id="layer4-amount"
                    value={cloud.significantCloud?.layer4?.amount || ""}
                    onChange={(e) => handleSignificantCloudChange("layer4", "amount", e.target.value)}
                    className="border-violet-200 focus:border-violet-500"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
