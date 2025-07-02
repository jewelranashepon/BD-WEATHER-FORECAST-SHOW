"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Thermometer, Wind, BarChart3, ChevronRight, ChevronLeft, Sun, MapPin, Calendar, Droplets } from "lucide-react"
import { toast } from "sonner"
import { useFormik } from "formik"
import { motion } from "framer-motion"
import * as Yup from "yup"
import { useSession } from "@/lib/auth-client"

// // Enhanced validation schema with all fields
// const validationSchema = Yup.object({
//   stationInfo: Yup.object({
//     stationName: Yup.string().required("Station name is required"),
//     latitude: Yup.number().min(-90).max(90).required("Latitude is required"),
//     longitude: Yup.number().min(-180).max(180).required("Longitude is required"),
//     elevation: Yup.number().min(0).required("Elevation is required"),
//     year: Yup.number().min(1900).max(2100).required("Year is required"),
//     month: Yup.number().min(1).max(12).required("Month is required"),
//   }),
// })

export interface AgroclimatologicalFormData {
  stationInfo: {
    stationName: string
    latitude: string
    longitude: string
    elevation: string
    date: string
    utcHour: 0 | 12
  }
  solarRadiation: string
  sunShineHour: string
  airTemperature: {
    dry05m: string
    wet05m: string
    dry12m: string
    wet12m: string
    dry22m: string
    wet22m: string
  }
  minTemp: string
  maxTemp: string
  meanTemp: string
  grassMinTemp: string
  soilTemperature: {
    depth5cm: string
    depth10cm: string
    depth20cm: string
    depth30cm: string
    depth50cm: string
  }
  panWaterEvap: string
  relativeHumidity: string
  evaporation: string
  soilMoisture: {
    depth0to20cm: string
    depth20to50cm: string
  }
  dewPoint: string
  windSpeed: string
  duration: string
  rainfall: string
  userId?: string
}

export function AgroclimatologicalForm() {
  const [activeTab, setActiveTab] = useState("station")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.station) {
      formik.setFieldValue("stationInfo.stationName", session.user.station.name)
      formik.setFieldValue("stationInfo.latitude", session.user.station.latitude.toString())
      formik.setFieldValue("stationInfo.longitude", session.user.station.longitude.toString())
    }
  }, [session])


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch sunshine data (working)
        const sunshineResponse = await fetch("/api/sunshine");
        if (sunshineResponse.ok) {
          const sunshineData = await sunshineResponse.json();
          if (sunshineData.length > 0) {
            const latestSunshine = sunshineData[0];
            formik.setFieldValue("sunShineHour", latestSunshine.total?.toString() || "");
          }
        }

        // Fetch soil moisture data - improved error handling
        const soilResponse = await fetch("/api/soil-moisture");
        if (soilResponse.ok) {
          const { data: soilData } = await soilResponse.json(); // extract .data

          if (Array.isArray(soilData) && soilData.length > 0) {
            const validEntries = soilData.filter(
              (entry) => typeof entry.depth === "number" && typeof entry.Sm === "number"
            );

            if (validEntries.length > 0) {
              const depthMap = new Map<number, number>();
              validEntries.forEach((entry) => depthMap.set(entry.depth, entry.Sm));

              const calculateAverage = (depths: number[]) => {
                const values = depths
                  .map((d) => depthMap.get(d))
                  .filter((v): v is number => v !== undefined);

                return values.length > 0
                  ? (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2)
                  : "";
              };

              const avg0to20 = calculateAverage([5, 10, 20]);
              const avg20to50 = calculateAverage([20, 30, 50]);

              if (avg0to20) formik.setFieldValue("soilMoisture.depth0to20cm", avg0to20);
              if (avg20to50) formik.setFieldValue("soilMoisture.depth20to50cm", avg20to50);
            }
          }
        }

        const rainfallResponse = await fetch("/api/save-observation");
        if (rainfallResponse.ok) {
          const rainfallJson = await rainfallResponse.json();

          const latestObservation = rainfallJson?.data?.[0];
          const weatherObs = latestObservation?.WeatherObservation?.[0];

          if (weatherObs?.rainfallLast24Hours) {
            formik.setFieldValue("rainfall", weatherObs.rainfallLast24Hours.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching auto-fill data:", error);
        toast.error("Failed to load some auto-fill data");
      }
    };

    fetchAllData();
  }, []);

  // Enhanced tab order with new sections
  const tabOrder = ["station", "solar", "temperature", "soil", "humidity", "weather", "summary"]

  // Updated waterdrop tab styles with new sections
  const tabStyles = {
    station: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-violet-50 via-white to-purple-50 border-l-4 border-violet-400 shadow-xl shadow-violet-500/10",
      icon: <MapPin className="size-5 mr-2 text-violet-600" />,
      header: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
      color: "violet",
    },
    solar: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-l-4 border-amber-400 shadow-xl shadow-amber-500/10",
      icon: <Sun className="size-5 mr-2 text-amber-600" />,
      header: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      color: "amber",
    },
    temperature: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-rose-50 via-white to-pink-50 border-l-4 border-rose-400 shadow-xl shadow-rose-500/10",
      icon: <Thermometer className="size-5 mr-2 text-rose-600" />,
      header: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
      color: "rose",
    },
    soil: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-l-4 border-emerald-400 shadow-xl shadow-emerald-500/10",
      icon: <BarChart3 className="size-5 mr-2 text-emerald-600" />,
      header: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      color: "emerald",
    },
    humidity: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-l-4 border-cyan-400 shadow-xl shadow-cyan-500/10",
      icon: <Droplets className="size-5 mr-2 text-cyan-600" />,
      header: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
      color: "cyan",
    },
    weather: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-l-4 border-sky-400 shadow-xl shadow-sky-500/10",
      icon: <Wind className="size-5 mr-2 text-sky-600" />,
      header: "bg-gradient-to-r from-sky-500 to-indigo-500 text-white",
      color: "sky",
    },
    summary: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-green-50 via-white to-lime-50 border-l-4 border-green-400 shadow-xl shadow-green-500/10",
      icon: <Calendar className="size-5 mr-2 text-green-600" />,
      header: "bg-gradient-to-r from-green-500 to-lime-500 text-white",
      color: "green",
    },
  }

  // Initialize Formik with simplified structure - no dailyData array
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const formik = useFormik<AgroclimatologicalFormData>({
    initialValues: {
      stationInfo: {
        stationName: "",
        latitude: "",
        longitude: "",
        elevation: "",
        date: new Date().toISOString().split("T")[0], // Default to today
        utcHour: 0,
      },
      // Direct fields instead of dailyData array
      solarRadiation: "",
      sunShineHour: "",
      airTemperature: {
        dry05m: "",
        wet05m: "",
        dry12m: "",
        wet12m: "",
        dry22m: "",
        wet22m: "",
      },
      minTemp: "",
      maxTemp: "",
      meanTemp: "",
      grassMinTemp: "",
      soilTemperature: {
        depth5cm: "",
        depth10cm: "",
        depth20cm: "",
        depth30cm: "",
        depth50cm: "",
      },
      panWaterEvap: "",
      relativeHumidity: "",
      evaporation: "",
      soilMoisture: {
        depth0to20cm: "",
        depth20to50cm: "",
      },
      dewPoint: "",
      windSpeed: "",
      duration: "",
      rainfall: "",
    },
    onSubmit: handleSubmit,
  })
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName)
  }

  async function handleSubmit(values: AgroclimatologicalFormData) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    console.log("Submitting values:", values);

    try {
      // Create a date object from year and month (first day of the month)
      const dateParts = values.stationInfo.date.split("-").map(Number)
      const [year, month, day] = dateParts

      const utcTime = new Date(Date.UTC(year, month - 1, day, values.stationInfo.utcHour))
      const dateOnly = new Date(Date.UTC(year, month - 1, day))

      const submissionData = {
        ...values,
        stationInfo: {
          ...values.stationInfo,
          elevation: parseFloat(values.stationInfo.elevation) || 0,
        },
        utcTime,
        date: dateOnly,
        userId: session?.user?.id,
        stationId: session?.user?.station?.id,
      }

      const response = await fetch("/api/agroclimatological-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit data");
      }

      const result = await response.json();
      console.log("Result:", result);

      if (!result.success) {
        throw new Error(result.message || "Server returned unsuccessful response");
      }

      toast.success(result.message || "Data submitted successfully!");
      formik.resetForm();
      setActiveTab("station");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }


  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (!/^\d*\.?\d*$/.test(value)) return
    formik.setFieldValue(name, value)
  }

  const nextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={formik.handleSubmit}
          className="w-full mx-auto"
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Waterdrop Navigation */}
            <div className="relative mb-8 p-4">
              <div className="relative p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 max-w-max mx-auto">
                <div className="relative flex flex-wrap justify-center items-center gap-1 p-1.5 rounded-full bg-gray-100/50">
                  {Object.entries(tabStyles).map(([key, style], index) => {
                    const isActive = activeTab === key

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => handleTabChange(key)}
                        className={cn(
                          "relative flex items-center justify-center px-6 py-2 rounded-full transition-all duration-300 transform",
                          "focus:outline-none min-w-[80px]",
                          isActive
                            ? "bg-white shadow shadow-blue-300 text-gray-900 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-white/50",
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: isActive ? 1.05 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: index * 0.05,
                        }}
                      >
                        <div className="relative z-10 flex items-center gap-1">
                          <div
                            className={cn("transition-transform duration-200", {
                              "scale-110": isActive,
                            })}
                          >
                            {style.icon}
                          </div>
                          <span className="text-base capitalize font-medium">{key}</span>
                        </div>

                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-white rounded-full border border-gray-200 z-0"
                            layoutId="activePill"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Station Information Tab */}
            <TabsContent value="station">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.station.card)}>
                <div className={cn("p-6", tabStyles.station.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <MapPin className="mr-3 w-6 h-6" /> Station Information
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="stationName" className="text-slate-700 font-semibold">
                      Station Name *
                    </Label>
                    <Input
                      id="stationName"
                      name="stationInfo.stationName"
                      value={session?.user?.station?.name}
                      onChange={formik.handleChange}
                      className="border border-slate-300 h-12 rounded-xl font-semibold"
                      placeholder="Enter station name"
                      readOnly
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="latitude" className="text-slate-700 font-semibold">
                      Latitude (°) *
                    </Label>
                    <Input
                      id="latitude"
                      name="stationInfo.latitude"
                      type="number"
                      step="0.0001"
                      value={session?.user.station?.latitude}
                      onChange={formik.handleChange}
                      className="border border-slate-300 h-12 rounded-xl font-semibold"
                      placeholder="e.g., 23.7104"
                      readOnly
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="longitude" className="text-slate-700 font-semibold">
                      Longitude (°) *
                    </Label>
                    <Input
                      id="longitude"
                      name="stationInfo.longitude"
                      type="number"
                      step="0.0001"
                      value={session?.user.station?.longitude}
                      onChange={formik.handleChange}
                      className="border border-slate-300 h-12 rounded-xl font-semibold"
                      placeholder="e.g., 90.4074"
                      readOnly
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="elevation" className="text-slate-700 font-semibold">
                      Elevation (m) *
                    </Label>
                    <Input
                      id="elevation"
                      name="stationInfo.elevation"
                      type="number"
                      step="0.01"
                      value={formik.values.stationInfo.elevation}
                      onChange={formik.handleChange}
                      className="border border-slate-300 h-12 rounded-xl font-semibold"
                      placeholder="e.g., 21.95"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-slate-700 font-semibold">
                      Observation Date *
                    </Label>
                    <Input
                      id="date"
                      name="stationInfo.date"
                      type="date"
                      value={formik.values.stationInfo.date}
                      onChange={formik.handleChange}
                      className="border border-slate-300 h-12 rounded-xl font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="utcHour" className="text-slate-700 font-semibold">
                      UTC Hour *
                    </Label>
                    <select
                      id="utcHour"
                      name="stationInfo.utcHour"
                      value={formik.values.stationInfo.utcHour}
                      onChange={formik.handleChange}
                      className="border border-slate-300 h-12 rounded-xl font-semibold px-3"
                      required
                    >
                      <option value="">Select UTC</option>
                      <option value={0}>00 UTC</option>
                      <option value={12}>12 UTC</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end px-8 pb-8">
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Solar & Sunshine Tab */}
            <TabsContent value="solar">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.solar.card)}>
                <div className={cn("p-6", tabStyles.solar.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Sun className="mr-3 w-6 h-6" /> Solar Radiation & Sunshine Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                      <Label className="text-slate-700 font-semibold">Solar Radiation (Langley day⁻¹)</Label>
                      <Input
                        name="solarRadiation"
                        type="number"
                        step="0.1"
                        value={formik.values.solarRadiation}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-12 rounded-xl"
                        placeholder="Enter solar radiation"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-200">
                      <Label className="text-slate-700 font-semibold">Sun Shine Hour (Auto-filled)</Label>
                      <Input
                        name="sunShineHour"
                        type="number"
                        step="0.1"
                        max="24"
                        value={formik.values.sunShineHour}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-12 rounded-xl"
                        placeholder="Enter sunshine hours"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button type="button" variant="outline" onClick={prevTab} className="px-8 py-3 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Temperature Tab */}
            <TabsContent value="temperature">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.temperature.card)}>
                <div className={cn("p-6", tabStyles.temperature.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Thermometer className="mr-3 w-6 h-6" /> Air Temperature Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="space-y-8">
                    {/* Air Temperature at Different Heights */}
                    <div className="p-6 bg-rose-50/50 rounded-xl border border-rose-200">
                      <h4 className="font-bold text-rose-700 text-lg mb-4">
                        Air Temperature (°C) at Different Heights
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          {
                            height: "0.5m",
                            dryKey: "dry05m",
                            wetKey: "wet05m",
                          },
                          {
                            height: "1.2m",
                            dryKey: "dry12m",
                            wetKey: "wet12m",
                          },
                          {
                            height: "2.2m",
                            dryKey: "dry22m",
                            wetKey: "wet22m",
                          },
                        ].map(({ height, dryKey, wetKey }) => (
                          <div key={height} className="space-y-3 p-4 bg-white rounded-lg border">
                            <h5 className="font-semibold text-rose-600">{height}</h5>
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">Dry Bulb</Label>
                              <Input
                                name={`airTemperature.${dryKey}`}
                                type="number"
                                step="0.1"
                                value={
                                  formik.values.airTemperature[dryKey as keyof typeof formik.values.airTemperature] ||
                                  ""
                                }
                                onChange={handleNumericInput}
                                className="border border-slate-300 h-10 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">Wet Bulb</Label>
                              <Input
                                name={`airTemperature.${wetKey}`}
                                type="number"
                                step="0.1"
                                value={
                                  formik.values.airTemperature[wetKey as keyof typeof formik.values.airTemperature] ||
                                  ""
                                }
                                onChange={handleNumericInput}
                                className="border border-slate-300 h-10 rounded-lg"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Summary */}
                    <div className="p-6 bg-pink-50/50 rounded-xl border border-pink-200">
                      <h4 className="font-bold text-pink-700 text-lg mb-4">Temperature Summary</h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Min Temp (°C)</Label>
                          <Input
                            name="minTemp"
                            type="number"
                            step="0.1"
                            value={formik.values.minTemp}
                            onChange={handleNumericInput}
                            className="border border-slate-300 h-10 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Max Temp (°C)</Label>
                          <Input
                            name="maxTemp"
                            type="number"
                            step="0.1"
                            value={formik.values.maxTemp}
                            onChange={handleNumericInput}
                            className="border border-slate-300 h-10 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Grass Min Temp (°C)</Label>
                          <Input
                            name="grassMinTemp"
                            type="number"
                            step="0.1"
                            value={formik.values.grassMinTemp}
                            onChange={handleNumericInput}
                            className="border border-slate-300 h-10 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button type="button" variant="outline" onClick={prevTab} className="px-8 py-3 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Soil Temperature Tab */}
            <TabsContent value="soil">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.soil.card)}>
                <div className={cn("p-6", tabStyles.soil.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <BarChart3 className="mr-3 w-6 h-6" /> Soil Temperature & Moisture Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="space-y-8">
                    {/* Soil Temperature */}
                    <div className="p-6 bg-emerald-50/50 rounded-xl border border-emerald-200">
                      <h4 className="font-bold text-emerald-700 text-lg mb-4">
                        Soil Temperature (°C) at Different Depths
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                          { depth: "5 Cm", key: "depth5cm" },
                          { depth: "10 Cm", key: "depth10cm" },
                          { depth: "20 Cm", key: "depth20cm" },
                          { depth: "30 Cm", key: "depth30cm" },
                          { depth: "50 Cm", key: "depth50cm" },
                        ].map(({ depth, key }) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-slate-700 font-semibold">{depth}</Label>
                            <Input
                              name={`soilTemperature.${key}`}
                              type="number"
                              step="0.1"
                              value={
                                formik.values.soilTemperature[key as keyof typeof formik.values.soilTemperature] || ""
                              }
                              onChange={handleNumericInput}
                              className="border border-slate-300 h-10 rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Soil Moisture */}
                    <div className="p-6 bg-teal-50/50 rounded-xl border border-teal-200">
                      <h4 className="font-bold text-teal-700 text-lg mb-4">Soil Moisture % Between (Auto-filled)</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">0-20 Cm</Label>
                          <Input
                            name="soilMoisture.depth0to20cm"
                            type="number"
                            step="0.1"
                            max="100"
                            value={formik.values.soilMoisture.depth0to20cm}
                            onChange={handleNumericInput}
                            className="border border-slate-300 h-10 rounded-lg"
                            placeholder="0-100%"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">20-50 Cm</Label>
                          <Input
                            name="soilMoisture.depth20to50cm"
                            type="number"
                            step="0.1"
                            max="100"
                            value={formik.values.soilMoisture.depth20to50cm}
                            onChange={handleNumericInput}
                            className="border border-slate-300 h-10 rounded-lg"
                            placeholder="0-100%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button type="button" variant="outline" onClick={prevTab} className="px-8 py-3 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Humidity & Evaporation Tab */}
            <TabsContent value="humidity">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.humidity.card)}>
                <div className={cn("p-6", tabStyles.humidity.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Droplets className="mr-3 w-6 h-6" /> Humidity & Evaporation Data
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3 p-4 bg-cyan-50/50 rounded-xl border border-cyan-200">
                      <Label className="text-slate-700 font-semibold">Pan Water temp(°C)</Label>
                      <Input
                        name="panWaterEvap"
                        type="number"
                        step="0.1"
                        value={formik.values.panWaterEvap}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                      <Label className="text-slate-700 font-semibold">Evaporation (mm)</Label>
                      <Input
                        name="evaporation"
                        type="number"
                        step="0.1"
                        value={formik.values.evaporation}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                      <Label className="text-slate-700 font-semibold">Evapotranspiration (mm)</Label>
                      <Input
                        name="dewPoint"
                        type="number"
                        step="0.1"
                        value={formik.values.dewPoint}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button type="button" variant="outline" onClick={prevTab} className="px-8 py-3 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Weather Measurements Tab */}
            <TabsContent value="weather">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.weather.card)}>
                <div className={cn("p-6", tabStyles.weather.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Wind className="mr-3 w-6 h-6" /> Weather Measurements
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-3 p-4 bg-sky-50/50 rounded-xl border border-sky-200">
                      <Label className="text-slate-700 font-semibold">Wind run at 2m. ht. (km/hr)</Label>
                      <Input
                        name="windSpeed"
                        type="number"
                        step="0.1"
                        value={formik.values.windSpeed}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                      <Label className="text-slate-700 font-semibold">Dew Amount (mm)</Label>
                      <Input
                        name="dewPoint"
                        type="number"
                        step="0.1"
                        value={formik.values.dewPoint}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                      <Label className="text-slate-700 font-semibold">Duration (Dew) (hrs.)</Label>
                      <Input
                        name="duration"
                        type="number"
                        step="0.1"
                        max="24"
                        value={formik.values.duration}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                      <Label className="text-slate-700 font-semibold">Rain amount (mm)</Label>
                      <Input
                        name="rainfall"
                        type="number"
                        step="0.1"
                        value={formik.values.rainfall}
                        onChange={handleNumericInput}
                        className="border border-slate-300 h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button type="button" variant="outline" onClick={prevTab} className="px-8 py-3 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextTab}
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-8 py-3 rounded-xl"
                  >
                    Next <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.summary.card)}>
                <div className={cn("p-6", tabStyles.summary.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Calendar className="mr-3 w-6 h-6" /> Data Summary & Submission
                  </h3>
                </div>
                <CardContent className="pt-8 pb-6 px-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border-2 border-violet-200 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50">
                      <h4 className="font-bold text-sm text-violet-600 mb-2">Station</h4>
                      <p className="text-lg font-bold text-violet-800">
                        {formik.values.stationInfo.stationName || "Not set"}
                      </p>
                    </div>
                    <div className="p-6 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-lime-50">
                      <h4 className="font-bold text-sm text-green-600 mb-2">Period</h4>
                      <p className="text-lg font-bold text-green-800">
                        {new Date(formik.values.stationInfo.date).toLocaleString('default', { month: 'long' })} {formik.values.stationInfo.date}
                      </p>
                    </div>
                    <div className="p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50">
                      <h4 className="font-bold text-sm text-blue-600 mb-2">Location</h4>
                      <p className="text-lg font-bold text-blue-800">
                        {formik.values.stationInfo.latitude}°, {formik.values.stationInfo.longitude}°
                      </p>
                    </div>
                    <div className="p-6 border-2 border-cyan-200 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50">
                      <h4 className="font-bold text-sm text-cyan-600 mb-2">Elevation</h4>
                      <p className="text-lg font-bold text-cyan-800">{formik.values.stationInfo.elevation} m</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                    <h4 className="font-bold text-amber-800 mb-4 text-lg">Data Completion Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 mr-3"></div>
                        <span className="font-medium">Station: Complete</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full mr-3",
                            formik.values.solarRadiation ? "bg-emerald-500" : "bg-gray-300",
                          )}
                        ></div>
                        <span className="font-medium">
                          Solar: {formik.values.solarRadiation ? "Complete" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full mr-3",
                            formik.values.minTemp ? "bg-emerald-500" : "bg-gray-300",
                          )}
                        ></div>
                        <span className="font-medium">
                          Temperature: {formik.values.minTemp ? "Complete" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full mr-3",
                            formik.values.soilTemperature.depth5cm ? "bg-emerald-500" : "bg-gray-300",
                          )}
                        ></div>
                        <span className="font-medium">
                          Soil: {formik.values.soilTemperature.depth5cm ? "Complete" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full mr-3",
                            formik.values.evaporation ? "bg-emerald-500" : "bg-gray-300",
                          )}
                        ></div>
                        <span className="font-medium">
                          Humidity: {formik.values.evaporation ? "Complete" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full mr-3",
                            formik.values.windSpeed ? "bg-emerald-500" : "bg-gray-300",
                          )}
                        ></div>
                        <span className="font-medium">Weather: {formik.values.windSpeed ? "Complete" : "Pending"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between px-8 pb-8">
                  <Button type="button" variant="outline" onClick={prevTab} className="px-8 py-3 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                  </Button>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        formik.resetForm()
                        setActiveTab("station")
                        toast.info("Form has been reset")
                      }}
                      className="px-8 py-3 rounded-xl"
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Data"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.form>
      </div>
    </div>
  )
}
