"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Thermometer, CloudRain, Wind, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  LineChart,
  RadialChart,
  DonutChart,
} from "@/components/charts";

export default function FeaturesSection() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        mass: 0.5,
      },
    },
  };

  const features = [
    {
      icon: (
        <Thermometer className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      ),
      title: "Temperature Analytics",
      description:
        "Real-time and historical temperature data with interactive visualizations.",
      chart: (
        <LineChart
          data={[
            { name: "Jan", value: 18 },
            { name: "Feb", value: 22 },
            { name: "Mar", value: 26 },
            { name: "Apr", value: 30 },
            { name: "May", value: 32 },
            { name: "Jun", value: 31 },
          ]}
          color="indigo"
          className="h-32 w-full mt-4"
        />
      ),
    },
    {
      icon: (
        <CloudRain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      ),
      title: "Rainfall Patterns",
      description:
        "Precipitation analysis with regional comparisons and forecasts.",
      chart: (
        <BarChart
          data={[
            { name: "Dhaka", value: 220 },
            { name: "Chittagong", value: 320 },
            { name: "Sylhet", value: 450 },
            { name: "Rajshahi", value: 180 },
          ]}
          color="blue"
          className="h-32 w-full mt-4"
        />
      ),
    },
    {
      icon: <Wind className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Wind Conditions",
      description: "Wind speed and direction monitoring with safety alerts.",
      chart: (
        <RadialChart
          value={65}
          maxValue={100}
          color="purple"
          label="NM"
          className="h-32 w-full mt-4"
        />
      ),
    },
    {
      icon: <Map className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Regional Insights",
      description: "Comparative weather analysis across Bangladesh regions.",
      chart: (
        <DonutChart
          data={[
            { name: "Northern", value: 25 },
            { name: "Southern", value: 35 },
            { name: "Eastern", value: 20 },
            { name: "Western", value: 20 },
          ]}
          colors={["indigo", "blue", "purple", "cyan"]}
          className="h-32 w-full mt-4"
        />
      ),
    },
  ];

  return (
    <section className="relative w-full py-16 bg-slate-50 dark:bg-gray-900 overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/20 to-transparent dark:from-indigo-900/10"></div>
      </div>

      <div className=" px-4 md:px-6  relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            Weather Intelligence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight md:text-4xl text-gray-900 dark:text-white"
          >
            Advanced Meteorological Data
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl text-gray-600 dark:text-gray-300"
          >
            Precise weather analytics and forecasting tools for informed
            decision making across Bangladesh.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              variants={item}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 20px -5px rgba(79, 70, 229, 0.1)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 p-2">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {feature.description}
              </p>
              {feature.chart}
              <Link
                href="/features"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors group"
              >
                Explore data
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Link href="/features">
            <Button
              variant="default"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors shadow-sm hover:shadow-md"
            >
              <span className="flex items-center">
                View Full Dashboard
                <ArrowRight className="ml-3 h-4 w-4" />
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
