"use client";

import * as Yup from "yup";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronRight, ChevronLeft, Layers } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";

// Validation schema
const validationSchema = Yup.object({
  date: Yup.date().required("Date is required"),
  w1: Yup.number().required("W₁ is required").positive(),
  w2: Yup.number().required("W₂ is required").positive(),
  w3: Yup.number().required("W₃ is required").positive(),
});

interface SoilMoistureData {
  date: string;
  depth: string;
  w1: string;
  w2: string;
  w3: string;
  Ws: string;
  Ds: string;
  Sm: string;
}

export function SoilMoistureForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("5");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const depths = ["5", "10", "20", "30", "50"];

  const formik = useFormik({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      depth: '5',
      w1: '',
      w2: '',
      w3: '',
      Ws: '',
      Ds: '',
      Sm: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Tab styles
  const tabStyles = {
    "5": {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-violet-50 via-white to-purple-50 border-l-4 border-violet-400 shadow-xl shadow-violet-500/10",
      icon: <Layers className="size-5 mr-2 text-violet-600" />,
      header: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
      color: "violet",
    },
    "10": {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-l-4 border-amber-400 shadow-xl shadow-amber-500/10",
      icon: <Layers className="size-5 mr-2 text-amber-600" />,
      header: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      color: "amber",
    },
    "20": {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-rose-50 via-white to-pink-50 border-l-4 border-rose-400 shadow-xl shadow-rose-500/10",
      icon: <Layers className="size-5 mr-2 text-rose-600" />,
      header: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
      color: "rose",
    },
    "30": {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-l-4 border-emerald-400 shadow-xl shadow-emerald-500/10",
      icon: <Layers className="size-5 mr-2 text-emerald-600" />,
      header: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      color: "emerald",
    },
    "50": {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-l-4 border-cyan-400 shadow-xl shadow-cyan-500/10",
      icon: <Layers className="size-5 mr-2 text-cyan-600" />,
      header: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
      color: "cyan",
    },
  };

  // Calculate derived values whenever inputs change
  useEffect(() => {
    if (formik.values.w1 && formik.values.w2 && formik.values.w3) {
      const w1 = parseFloat(formik.values.w1);
      const w2 = parseFloat(formik.values.w2);
      const w3 = parseFloat(formik.values.w3);

      const Ws = w2 - w1;
      const Ds = w3 - w1;
      const Sm = ((Ws - Ds) * 100) / Ds;

      formik.setValues({
        ...formik.values,
        Ws: Ws.toFixed(3),
        Ds: Ds.toFixed(3),
        Sm: Sm.toFixed(3),
      });
    }
  }, [formik.values.w1, formik.values.w2, formik.values.w3]);

  // Check submission eligibility
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await fetch('/api/soil-moisture');
        if (!response.ok) {
          throw new Error('Failed to fetch last submission');
        }
        const data = await response.json();

        if (data.lastSubmission) {
          const lastSubDate = new Date(data.lastSubmission);
          setLastSubmission(lastSubDate);

          // Check if 7 days have passed
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          setCanSubmit(lastSubDate < sevenDaysAgo);
        } else {
          setCanSubmit(true);
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
        setCanSubmit(true);
      }
    };

    if (session) {
      checkSubmissionStatus();
    }
  }, [session]);

  async function handleSubmit(values: SoilMoistureData) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/soil-moisture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          stationId: session?.user?.station?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      toast.success('Data submitted successfully');

      // Move to next depth tab if available
      const currentIndex = depths.indexOf(activeTab);
      if (currentIndex < depths.length - 1) {
        const nextDepth = depths[currentIndex + 1];
        setActiveTab(nextDepth);
        formik.resetForm({
          values: {
            ...formik.initialValues,
            date: formik.values.date,
            depth: nextDepth,
          }
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit data', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Only allow numeric input for certain fields
    if (['w1', 'w2', 'w3'].includes(name)) {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }

    formik.setFieldValue(name, value);
  };

  const handleTabChange = (depth: string) => {
    setActiveTab(depth);
    formik.setFieldValue("depth", depth);
  };

  const nextTab = () => {
    const currentIndex = depths.indexOf(activeTab);
    if (currentIndex < depths.length - 1) {
      const nextDepth = depths[currentIndex + 1];
      setActiveTab(nextDepth);
      formik.setFieldValue("depth", nextDepth);
    }
  };

  const prevTab = () => {
    const currentIndex = depths.indexOf(activeTab);
    if (currentIndex > 0) {
      const prevDepth = depths[currentIndex - 1];
      setActiveTab(prevDepth);
      formik.setFieldValue("depth", prevDepth);
    }
  };

  // if (!canSubmit && lastSubmission) {
  //   const nextSubmissionDate = new Date(lastSubmission);
  //   nextSubmissionDate.setDate(nextSubmissionDate.getDate() + 7);

  //   return (
  //     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
  //       <h2 className="text-2xl font-bold mb-4 text-center">Submission Limit Reached</h2>
  //       <p className="mb-4 text-center">
  //         Soil moisture data can only be submitted once every 7 days.
  //       </p>
  //       <p className="text-center">
  //         Your next submission will be available on: {' '}
  //         <span className="font-semibold">
  //           {nextSubmissionDate.toLocaleDateString()}
  //         </span>
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Soil Moisture Data Collection
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div> */}

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
                  {depths.map((depth, index) => {
                    const isActive = activeTab === depth;

                    return (
                      <motion.button
                        key={depth}
                        type="button"
                        onClick={() => handleTabChange(depth)}
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
                            <Layers className="size-5 mr-2" />
                          </div>
                          <span className="text-base capitalize font-medium">{depth} cm</span>
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

            {/* Station Information */}
            <Card className="mb-6 border border-gray-200 shadow-sm">
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Station Name</Label>
                  <Input
                    value={session?.user?.station?.name || "N/A"}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Latitude</Label>
                  <Input
                    value={session?.user?.station?.latitude || "N/A"}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Longitude</Label>
                  <Input
                    value={session?.user?.station?.longitude || "N/A"}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Elevation (m)</Label>
                  <Input
                    value={session?.user?.station?.stationId || "N/A"}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tab Content */}
            {depths.map((depth) => (
              <TabsContent key={depth} value={depth}>
                <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles[depth as keyof typeof tabStyles].card)}>
                  <div className={cn("p-6", tabStyles[depth as keyof typeof tabStyles].header)}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center">
                        <Layers className="mr-3 w-6 h-6" /> Soil Moisture Data - {depth} cm Depth
                      </h3>

                      <div className="space-y-2 flex items-center justify-between">
                        <p className="text-slate-700 font-bold w-full text-white mb-0 mr-2">Select Date</p>
                        <div className="relative w-full">
                          <Input
                            type="date"
                            id="date"
                            name="date"
                            value={formik.values.date}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                            className={cn( 
                              "appearance-none", 
                              {
                                "border-red-500": formik.touched.date && formik.errors.date,
                              }
                            )}
                          />
                        </div>
                        {formik.touched.date && formik.errors.date && (
                          <div className="text-red-500 text-sm mt-1 flex items-start">
                            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{formik.errors.date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-8 pb-6 px-8 grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="w1">W₁ (Weight of empty can)</Label>
                        <Input
                          id="w1"
                          name="w1"
                          value={formik.values.w1}
                          onChange={handleChange}
                          onBlur={formik.handleBlur}
                          className={cn({
                            'border-red-500': formik.touched.w1 && formik.errors.w1,
                          })}
                        />
                        {formik.touched.w1 && formik.errors.w1 && (
                          <div className="text-red-500 text-sm mt-1 flex items-start">
                            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{formik.errors.w1}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="w2">W₂ (Weight of can + wet soil)</Label>
                        <Input
                          id="w2"
                          name="w2"
                          value={formik.values.w2}
                          onChange={handleChange}
                          onBlur={formik.handleBlur}
                          className={cn({
                            'border-red-500': formik.touched.w2 && formik.errors.w2,
                          })}
                        />
                        {formik.touched.w2 && formik.errors.w2 && (
                          <div className="text-red-500 text-sm mt-1 flex items-start">
                            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{formik.errors.w2}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="w3">W₃ (Weight of can + dry soil)</Label>
                        <Input
                          id="w3"
                          name="w3"
                          value={formik.values.w3}
                          onChange={handleChange}
                          onBlur={formik.handleBlur}
                          className={cn({
                            'border-red-500': formik.touched.w3 && formik.errors.w3,
                          })}
                        />
                        {formik.touched.w3 && formik.errors.w3 && (
                          <div className="text-red-500 text-sm mt-1 flex items-start">
                            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{formik.errors.w3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <Card className="border border-gray-200 shadow-sm mx-8 mb-6">
                    <div className="p-4 bg-gray-100">
                      <h3 className="text-lg font-semibold">Calculated Values</h3>
                    </div>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Ws (W₂ - W₁)</Label>
                        <Input
                          value={formik.values.Ws}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ds (W₃ - W₁)</Label>
                        <Input
                          value={formik.values.Ds}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sm (Moisture %)</Label>
                        <Input
                          value={formik.values.Sm}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <CardFooter className="flex justify-between px-8 pb-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevTab}
                      disabled={activeTab === depths[0]}
                      className="px-8 py-3 rounded-xl"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" /> Previous Depth
                    </Button>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => formik.resetForm({
                          values: {
                            ...formik.initialValues,
                            date: formik.values.date,
                            depth: activeTab,
                          }
                        })}
                        className="px-8 py-3 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !formik.isValid}
                        className={cn(
                          "px-8 py-3 rounded-xl font-semibold",
                          `bg-gradient-to-r from-${tabStyles[depth as keyof typeof tabStyles].color}-500 to-${tabStyles[depth as keyof typeof tabStyles].color}-600 text-white`
                        )}
                      >
                        {isSubmitting ? 'Submitting...' : activeTab === depths[depths.length - 1] ? 'Submit All Data' : 'Submit & Next Depth'}
                        {activeTab !== depths[depths.length - 1] && <ChevronRight className="ml-2 h-5 w-5" />}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.form>
      </div>
    </div>
  );
}