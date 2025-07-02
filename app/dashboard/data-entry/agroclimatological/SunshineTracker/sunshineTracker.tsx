"use client";

import type React from "react";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Sun, TrendingUp, Target } from "lucide-react";

interface DailyData {
  id: string
  date: string
  hours: number[]
  total: number
  createdAt: string
  updatedAt: string
}

const timeSlots = [
  "5-6",
  "6-7",
  "7-8",
  "8-9",
  "9-10",
  "10-11",
  "11-12",
  "12-13",
  "13-14",
  "14-15",
  "15-16",
  "16-17",
  "17-18",
  "18-19",
];

export default function SunshineTracker() {
  const [dailyEntries, setDailyEntries] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentHours, setCurrentHours] = useState<number[]>(
    new Array(14).fill(0)
  );
  const [thresholdLevel, setThresholdLevel] = useState(8);

  useEffect(() => {
    const fetchSunshineData = async () => {
      try {
        const res = await fetch("/api/sunshine");
        const data: DailyData[] = await res.json();

        setDailyEntries(data);
      } catch (err) {
        console.error("Failed to load sunshine data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSunshineData();
  }, []);

  const fetchSunshineData = async () => {
    try {
      const res = await fetch("/api/sunshine");
      const data: DailyData[] = await res.json();
      setDailyEntries(data);
    } catch (err) {
      console.error("Failed to reload sunshine data:", err);
    }
  };

  const currentTotal = useMemo(() => {
    return currentHours.reduce((sum, hour) => sum + hour, 0);
  }, [currentHours]);

  const handleHourChange = (index: number, value: string) => {
    const newHours = [...currentHours];
    newHours[index] = Number.parseFloat(value) || 0;
    setCurrentHours(newHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: DailyData = {
      date: currentDate,
      hours: [...currentHours],
      total: currentTotal,
    };

    try {
      const res = await fetch("/api/sunshine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }

      // Update local state
     await fetchSunshineData()


      setCurrentHours(new Array(14).fill(0));
      alert("Sunshine data saved successfully!");
    } catch (error: any) {
      console.error("Submission error:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  const weeklyAverages = useMemo(() => {
    if (dailyEntries.length === 0) return new Array(14).fill(0);

    const totals = new Array(14).fill(0);
    dailyEntries.forEach((entry) => {
      entry.hours.forEach((hour, index) => {
        totals[index] += hour;
      });
    });

    return totals.map((total) => total / dailyEntries.length);
  }, [dailyEntries]);

  const monthlyStats = useMemo(() => {
    const totalDays = dailyEntries.length;
    const totalSunshine = dailyEntries.reduce(
      (sum, entry) => sum + entry.total,
      0
    );
    const averageDaily = totalDays > 0 ? totalSunshine / totalDays : 0;
    const daysExceedingThreshold = dailyEntries.filter(
      (entry) => entry.total > thresholdLevel
    ).length;
    const thresholdPercentage =
      totalDays > 0 ? (daysExceedingThreshold / totalDays) * 100 : 0;

    return {
      totalDays,
      totalSunshine,
      averageDaily,
      daysExceedingThreshold,
      thresholdPercentage,
    };
  }, [dailyEntries, thresholdLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {/* <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="h-8 w-8 text-orange-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Sunshine Data Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Daily sunshine duration monitoring system
          </p>
        </div> */}

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Data Input
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Daily Records
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Data Input Tab */}
          <TabsContent value="input">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg p-3">
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Daily Sunshine Data Entry
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Enter hourly sunshine duration data (5 AM - 7 PM)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Label htmlFor="date" className="text-lg font-semibold">
                      Date:
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      className="w-auto border-2 border-blue-200 focus:border-blue-500"
                      required
                    />
                    <Badge
                      variant="secondary"
                      className="ml-auto text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white"
                    >
                      Daily Total: {currentTotal.toFixed(2)} hours
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="space-y-2">
                        <Label
                          htmlFor={`hour-${index}`}
                          className="text-sm font-medium text-center block bg-gradient-to-r from-orange-400 to-yellow-400 text-white py-1 px-2 rounded-md"
                        >
                          {slot}:00
                        </Label>
                        <Input
                          id={`hour-${index}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={currentHours[index] || ""}
                          onChange={(e) =>
                            handleHourChange(index, e.target.value)
                          }
                          className="text-center border-2 border-orange-200 focus:border-orange-500"
                          placeholder="0.0"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 text-lg"
                  >
                    Save Daily Data
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Records Tab */}
          <TabsContent value="records">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg p-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Records & Weekly Averages
                </CardTitle>
                <CardDescription className="text-green-100">
                  Complete sunshine data records with statistical analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {dailyEntries.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Sun className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl">No data entries yet</p>
                    <p>Start by adding daily sunshine data</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                          <th className="border border-gray-300 p-3 text-left font-semibold">
                            Date
                          </th>
                          {timeSlots.map((slot, index) => (
                            <th
                              key={index}
                              className="border border-gray-300 p-2 text-center text-sm font-semibold min-w-[60px]"
                            >
                              {slot}
                            </th>
                          ))}
                          <th className="border border-gray-300 p-3 text-center font-semibold bg-yellow-100">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyEntries
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((entry, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className={
                                rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }
                            >
                              <td className="border border-gray-300 p-3 font-medium">
                                {new Date(entry.date).toLocaleDateString()}
                              </td>
                              {entry.hours.map((hour, colIndex) => (
                                <td
                                  key={colIndex}
                                  className={`border border-gray-300 p-2 text-center ${
                                    hour > 0.8
                                      ? "bg-green-100 text-green-800"
                                      : hour > 0.5
                                        ? "bg-yellow-100 text-yellow-800"
                                        : hour > 0
                                          ? "bg-orange-100 text-orange-800"
                                          : ""
                                  }`}
                                >
                                  {hour.toFixed(1)}
                                </td>
                              ))}
                              <td
                                className={`border border-gray-300 p-3 text-center font-bold ${
                                  entry.total > thresholdLevel
                                    ? "bg-green-200 text-green-800"
                                    : "bg-gray-100"
                                }`}
                              >
                                {entry.total.toFixed(1)}
                              </td>
                            </tr>
                          ))}

                        {/* Weekly Averages Row */}
                        <tr className="bg-gradient-to-r from-purple-200 to-blue-200 font-bold">
                          <td className="border border-gray-300 p-3">
                            <Badge className="bg-purple-600">
                              Weekly Average
                            </Badge>
                          </td>
                          {weeklyAverages.map((avg, index) => (
                            <td
                              key={index}
                              className="border border-gray-300 p-2 text-center"
                            >
                              {avg.toFixed(2)}
                            </td>
                          ))}
                          <td className="border border-gray-300 p-3 text-center">
                            {weeklyAverages
                              .reduce((sum, avg) => sum + avg, 0)
                              .toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Statistics */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg p-3">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Monthly Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">
                        Total Days
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        {monthlyStats.totalDays}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">
                        Total Sunshine
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        {monthlyStats.totalSunshine.toFixed(1)}h
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">
                        Daily Average
                      </p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {monthlyStats.averageDaily.toFixed(1)}h
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">
                        Above Threshold
                      </p>
                      <p className="text-2xl font-bold text-purple-800">
                        {monthlyStats.thresholdPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Threshold Analysis */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg p-3">
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Threshold Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold Level (hours)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.1"
                      value={thresholdLevel}
                      onChange={(e) =>
                        setThresholdLevel(
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="border-2 border-orange-200 focus:border-orange-500"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">
                      Days Exceeding Threshold
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-red-600">
                        {monthlyStats.daysExceedingThreshold}
                      </span>
                      <Badge className="bg-red-500 text-white">
                        {monthlyStats.thresholdPercentage.toFixed(1)}% of days
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Hourly Averages</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex justify-between bg-gray-50 p-2 rounded"
                        >
                          <span>{slot}:00</span>
                          <span className="font-medium">
                            {weeklyAverages[index]?.toFixed(2) || "0.00"}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
