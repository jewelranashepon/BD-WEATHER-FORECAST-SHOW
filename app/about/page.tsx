"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Cloud,
  CloudRain,
  Database,
  Globe,
  LineChart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                About Us
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Bangladesh Weather Dashboard
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Learn about our mission to provide accurate and accessible
                weather information for Bangladesh.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Our Mission
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  ICIMOD is developing an integrated information platform
                  linking weather and climate data with agriculture practices in
                  the region. The platform provides data analysis support to
                  professionals responsible for developing response strategies
                  to drought conditions.
                </p>
                <p className="text-muted-foreground md:text-lg">
                  Our mission is to provide accurate, timely, and accessible
                  weather information to help communities, farmers, and
                  decision-makers across Bangladesh prepare for and respond to
                  weather events.
                </p>
              </motion.div>
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Weather monitoring station"
                  width={800}
                  height={600}
                  className="object-cover aspect-video"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                What We Do
              </h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
                Our comprehensive weather platform serves multiple stakeholders
                across Bangladesh with accurate data and analysis.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Data Collection</h3>
                  <p className="text-muted-foreground">
                    We collect weather data from multiple reliable sources
                    including government meteorological stations, satellite
                    imagery, and international weather networks.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Analysis & Forecasting</h3>
                  <p className="text-muted-foreground">
                    Our team of meteorologists and data scientists analyze
                    weather patterns to provide accurate forecasts and trend
                    analysis for all regions of Bangladesh.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    Information Dissemination
                  </h3>
                  <p className="text-muted-foreground">
                    We make weather information accessible through our
                    interactive dashboard, providing critical data to farmers,
                    emergency services, and the general public.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CloudRain className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Disaster Preparedness</h3>
                  <p className="text-muted-foreground">
                    We provide early warnings for extreme weather events like
                    cyclones, floods, and droughts to help communities prepare
                    and minimize impact.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Community Support</h3>
                  <p className="text-muted-foreground">
                    We work with local communities, agricultural extension
                    services, and government agencies to ensure weather
                    information is actionable and beneficial.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Climate Research</h3>
                  <p className="text-muted-foreground">
                    We contribute to climate research by maintaining historical
                    weather data and analyzing long-term climate trends specific
                    to Bangladesh.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl order-2 lg:order-1"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Team of meteorologists"
                  width={800}
                  height={600}
                  className="object-cover aspect-video"
                />
              </motion.div>
              <motion.div
                className="space-y-4 order-1 lg:order-2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Our Team
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  Our team consists of experienced meteorologists, data
                  scientists, agricultural experts, and software developers
                  working together to provide the most accurate and useful
                  weather information.
                </p>
                <p className="text-muted-foreground md:text-lg">
                  We collaborate with government agencies, research
                  institutions, and international organizations to continuously
                  improve our data collection, analysis, and forecasting
                  capabilities.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-3xl text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Join Us in Our Mission
              </h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Help us make weather information more accessible and actionable
                for communities across Bangladesh.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Access Dashboard
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
