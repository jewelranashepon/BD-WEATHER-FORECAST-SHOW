"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Cloud, Sun, CloudRain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const temperatureData = [
  { name: "Jan", temp: 18.5 },
  { name: "Feb", temp: 21.3 },
  { name: "Mar", temp: 26.7 },
  { name: "Apr", temp: 29.8 },
  { name: "May", temp: 30.2 },
  { name: "Jun", temp: 29.9 },
  { name: "Jul", temp: 29.5 },
  { name: "Aug", temp: 29.8 },
  { name: "Sep", temp: 29.4 },
  { name: "Oct", temp: 28.2 },
  { name: "Nov", temp: 24.5 },
  { name: "Dec", temp: 20.1 },
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

const currentWeatherData = [
  { name: "Temp", value: 28.5, unit: "°C" },
  { name: "Humidity", value: 78, unit: "%" },
  { name: "Rainfall", value: 12, unit: "mm" },
  { name: "Wind", value: 8, unit: "NM" },
];

export default function HowItWorksSection() {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section className="relative w-full py-24 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-40 right-10 w-72 h-72 rounded-full bg-blue-300/30 dark:bg-blue-700/20 blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-72 h-72 rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 blur-3xl"></div>
      </div>

      {/* Animated weather icons pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const icons = [Cloud, Sun, CloudRain, Zap];
          const Icon = icons[Math.floor(Math.random() * icons.length)];
          return (
            <motion.div
              key={i}
              className="absolute text-blue-400/20 dark:text-blue-500/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 20 - 10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
            >
              <Icon size={Math.random() * 24 + 16} />
            </motion.div>
          );
        })}
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tighter md:text-5xl/tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-400 dark:to-cyan-400">
            Advanced Weather Analytics Platform
          </h2>
          <p className="max-w-[900px] text-gray-700 dark:text-gray-300 md:text-xl/relaxed lg:text-xl/relaxed">
            Our sophisticated dashboard provides comprehensive weather insights
            for Bangladesh with precision and clarity.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-10 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Step 1 */}
          <motion.div
            className="flex flex-col items-center text-center space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            variants={item}
            whileHover={{
              y: -10,
              boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.25)",
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 shadow-inner border border-blue-200 dark:border-blue-800/50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-800/30 dark:to-cyan-800/30 text-blue-600 dark:text-blue-400 text-4xl font-bold">
                1
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Select Location
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose from 64 districts or any specific region in Bangladesh to
              access localized weather data.
            </p>

            {/* Mini map visualization */}
            <div className="w-full h-40 mt-4 relative bg-blue-50 dark:bg-blue-900/20 rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 bg-blue-200 dark:bg-blue-800/30 rounded-full"></div>
                  <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-600 rounded-full shadow-lg border-2 border-white dark:border-blue-900"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-blue-400 rounded-full shadow-lg animate-pulse delay-300"></div>
                </div>
              </div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                Interactive Bangladesh Map
              </div>
            </div>

            <motion.div
              className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 z-20"
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <ArrowRight className="h-10 w-10 text-blue-400/70 dark:text-blue-600/70" />
            </motion.div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            className="flex flex-col items-center text-center space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            variants={item}
            whileHover={{
              y: -10,
              boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.25)",
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 shadow-inner border border-blue-200 dark:border-blue-800/50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-800/30 dark:to-cyan-800/30 text-blue-600 dark:text-blue-400 text-4xl font-bold">
                2
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Analyze Data
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Explore real-time metrics, forecasts, and historical patterns
              through advanced visualizations.
            </p>

            {/* Mini weather chart */}
            <div className="w-full h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={temperatureData.slice(0, 7)}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="tempGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[15, 32]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "0.5rem",
                      borderColor: "#3b82f6",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#tempGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <motion.div
              className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 z-20"
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <ArrowRight className="h-10 w-10 text-blue-400/70 dark:text-blue-600/70" />
            </motion.div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="flex flex-col items-center text-center space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            variants={item}
            whileHover={{
              y: -10,
              boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.25)",
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 shadow-inner border border-blue-200 dark:border-blue-800/50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-800/30 dark:to-cyan-800/30 text-blue-600 dark:text-blue-400 text-4xl font-bold">
                3
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Take Action
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Leverage actionable insights for agriculture, disaster
              preparedness, and operational planning.
            </p>

            {/* Current weather metrics */}
            <div className="w-full mt-4 grid grid-cols-2 gap-3">
              {currentWeatherData.map((metric, index) => (
                <div
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30"
                >
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {metric.name}
                  </div>
                  <div className="text-xl font-bold text-blue-800 dark:text-blue-300">
                    {metric.value}
                    <span className="text-sm ml-1">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Additional data visualization section */}
        <motion.div
          className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* <div className="p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Bangladesh Climate Patterns
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                  <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                  Average Temperature (°C)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temperatureData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "0.5rem",
                          borderColor: "#3b82f6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          fontSize: "0.8rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#3b82f6" }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                  <CloudRain className="w-5 h-5 mr-2 text-blue-500" />
                  Monthly Rainfall (mm)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "0.5rem",
                          borderColor: "#3b82f6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          fontSize: "0.8rem",
                        }}
                      />
                      <Bar
                        dataKey="rainfall"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div> */}
        </motion.div>

        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl hover:shadow-blue-500/30 transition-all duration-300 px-8"
            >
              <span className="relative z-10 flex items-center">
                Explore Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Enhanced decorative wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white dark:bg-gray-900 -z-10 overflow-hidden">
        <svg
          className="absolute -top-24 w-full h-24 text-white dark:text-gray-900 fill-current"
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
        >
          <path d="M0 64L60 58.7C120 53 240 43 360 42.7C480 43 600 53 720 58.7C840 64 960 64 1080 58.7C1200 53 1320 43 1380 42.7L1440 42.7V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0V64Z" />
        </svg>
      </div>
    </section>
  );
}
