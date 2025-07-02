"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CloudRain,
  Thermometer,
  Wind,
  Cloud,
  Droplets,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function HeroSection() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Sample weather data for charts
  const temperatureData = [
    { name: "Jan", temp: 18.5 },
    { name: "Feb", temp: 21.3 },
    { name: "Mar", temp: 26.7 },
    { name: "Apr", temp: 30.2 },
    { name: "May", temp: 31.8 },
    { name: "Jun", temp: 31.5 },
    { name: "Jul", temp: 30.9 },
    { name: "Aug", temp: 31.1 },
    { name: "Sep", temp: 30.7 },
    { name: "Oct", temp: 29.3 },
    { name: "Nov", temp: 25.1 },
    { name: "Dec", temp: 20.4 },
  ];

  const rainfallData = [
    { name: "Jan", rainfall: 7 },
    { name: "Feb", rainfall: 28 },
    { name: "Mar", rainfall: 58 },
    { name: "Apr", rainfall: 116 },
    { name: "May", rainfall: 267 },
    { name: "Jun", rainfall: 358 },
    { name: "Jul", rainfall: 397 },
    { name: "Aug", rainfall: 316 },
    { name: "Sep", rainfall: 300 },
    { name: "Oct", rainfall: 172 },
    { name: "Nov", rainfall: 34 },
    { name: "Dec", rainfall: 12 },
  ];

  const weeklyForecast = [
    { day: "Mon", temp: 28, rain: 40 },
    { day: "Tue", temp: 29, rain: 20 },
    { day: "Wed", temp: 30, rain: 10 },
    { day: "Thu", temp: 31, rain: 5 },
    { day: "Fri", temp: 30, rain: 15 },
    { day: "Sat", temp: 29, rain: 30 },
    { day: "Sun", temp: 28, rain: 60 },
  ];

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
      {/* Background gradient - using deeper colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 -z-10"></div>

      {/* Animated background elements with deeper colors */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-300/20 dark:bg-purple-700/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Floating weather icons with enhanced animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Cloud className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
        <motion.div
          className="absolute top-[25%] right-[15%]"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <CloudRain className="h-12 w-12 text-blue-500/40 dark:text-blue-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[20%]"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Sun className="h-14 w-14 text-amber-500/40 dark:text-amber-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[25%]"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Droplets className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center gap-2   dark:border-cyan-700 dark:bg-gray-900/60 px-3 py-1 text-sm backdrop-blur-sm"
              variants={fadeIn}
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium">Live Weather Updates</span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                className="pb-6 text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400"
                variants={fadeIn}
              >
                Bangladesh Weather Dashboard
              </motion.h1>
              <motion.p
                className="max-w-[600px] text-gray-700 dark:text-gray-300 md:text-xl"
                variants={fadeIn}
              >
                Professional weather monitoring and forecasting for Bangladesh.
                Access real-time data, forecasts, and historical trends with our
                interactive dashboard.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row"
              variants={fadeIn}
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-8 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                >
                  Explore Features
                </Button>
              </Link>
            </motion.div>

            {/* Stats with enhanced hover effects */}
            <motion.div
              className="grid grid-cols-3 gap-4 mt-8 max-w-md"
              variants={fadeIn}
            >
              <motion.div
                className="flex flex-col items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 p-3 backdrop-blur-sm shadow-sm border border-cyan-200 dark:border-cyan-800/50"
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                  64
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Districts
                </span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 p-3 backdrop-blur-sm shadow-sm border border-cyan-200 dark:border-cyan-800/50"
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                  24/7
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Monitoring
                </span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 p-3 backdrop-blur-sm shadow-sm border border-cyan-200 dark:border-cyan-800/50"
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                  95%
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Accuracy
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mx-auto w-full max-w-[500px] lg:max-w-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-cyan-200 dark:border-cyan-800/50 bg-white dark:bg-gray-800 shadow-2xl">
              {/* Enhanced animated glow effect */}
              <motion.div
                className="absolute inset-0 opacity-80 z-10"
                animate={{
                  background: [
                    "radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at 40% 70%, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at 60% 30%, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                  ],
                }}
                transition={{
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 z-10 rounded-2xl"></div>

              {/* Main chart container */}
              <div className="absolute inset-0 p-4 flex flex-col">
                {/* Temperature chart */}
                <div className="h-1/2 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={temperatureData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorTemp"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0891b2"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0891b2"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "0.5rem",
                          borderColor: "#e5e7eb",
                          fontSize: "0.875rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#0891b2"
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Rainfall chart */}
                <div className="h-1/2 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rainfallData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRain"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0369a1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0369a1"
                            stopOpacity={0.4}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "0.5rem",
                          borderColor: "#e5e7eb",
                          fontSize: "0.875rem",
                        }}
                      />
                      <Bar
                        dataKey="rainfall"
                        fill="url(#colorRain)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Enhanced floating data cards with more interactive hover effects */}
              <motion.div
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg flex items-center gap-2 z-20 border border-cyan-200 dark:border-cyan-800/50"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <Thermometer className="h-5 w-5 text-red-500" />
                <span className="font-bold">28°C</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Dhaka
                </span>
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg flex items-center gap-2 z-20 border border-cyan-200 dark:border-cyan-800/50"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <CloudRain className="h-5 w-5 text-blue-500" />
                <span className="font-bold">15mm</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Rainfall
                </span>
              </motion.div>

              <motion.div
                className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg flex items-center gap-2 z-20 border border-cyan-200 dark:border-cyan-800/50"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <Wind className="h-5 w-5 text-green-500" />
                <span className="font-bold">12NM</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Wind
                </span>
              </motion.div>

              <motion.div
                className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg flex items-center gap-2 z-20 border border-cyan-200 dark:border-cyan-800/50"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 },
                }}
              >
                <Droplets className="h-5 w-5 text-cyan-500" />
                <span className="font-bold">65%</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Humidity
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced decorative wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 -z-10">
        <svg
          className="absolute -top-16 w-full h-16 text-white dark:text-gray-900 fill-current"
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
        >
          <path d="M0 22L60 16.7C120 11 240 1.00001 360 0.700012C480 1.00001 600 11 720 16.7C840 22 960 22 1080 16.7C1200 11 1320 1.00001 1380 0.700012L1440 0.700012V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" />
        </svg>
      </div>
    </section>
  );
}
