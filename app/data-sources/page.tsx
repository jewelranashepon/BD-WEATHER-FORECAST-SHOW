"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Database,
  FileText,
  Globe,
  Satellite,
  Server,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function DataSourcesPage() {
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
                Data Sources
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Reliable Weather Information
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Learn about the sources and methodologies behind our weather
                data collection and analysis.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Our Data Collection Network
              </h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
                We integrate data from multiple reliable sources to provide the
                most accurate and comprehensive weather information for
                Bangladesh.
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
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    Bangladesh Meteorological Department
                  </h3>
                  <p className="text-muted-foreground">
                    Official weather data from government meteorological
                    stations across Bangladesh, providing baseline measurements
                    for temperature, rainfall, humidity, and wind.
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
                  <Satellite className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Satellite Imagery</h3>
                  <p className="text-muted-foreground">
                    High-resolution satellite data for cloud cover,
                    precipitation, and temperature analysis, providing
                    comprehensive coverage even in remote areas.
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
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    International Weather Networks
                  </h3>
                  <p className="text-muted-foreground">
                    Data from global weather monitoring networks for improved
                    forecast accuracy and cross-validation of local
                    measurements.
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
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Historical Archives</h3>
                  <p className="text-muted-foreground">
                    Decades of historical weather data for Bangladesh, enabling
                    trend analysis and seasonal pattern recognition for more
                    accurate forecasting.
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
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Research Partnerships</h3>
                  <p className="text-muted-foreground">
                    Collaborations with universities and research institutions
                    to incorporate the latest climate research and modeling
                    techniques into our forecasting systems.
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
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Agricultural Data</h3>
                  <p className="text-muted-foreground">
                    Integration with agricultural data sources to provide
                    context-specific weather information for farming communities
                    and agricultural planning.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
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
                  Data Processing Methodology
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  Our data processing methodology involves several steps to
                  ensure accuracy and reliability:
                </p>
                <ul className="space-y-2 text-muted-foreground md:text-lg">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      <strong>Data Collection:</strong> Gathering raw data from
                      multiple sources
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      <strong>Quality Control:</strong> Filtering and validating
                      data to remove errors
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      <strong>Integration:</strong> Combining data from
                      different sources into a unified format
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      <strong>Analysis:</strong> Applying statistical models and
                      algorithms to interpret data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      <strong>Forecasting:</strong> Generating predictions based
                      on historical patterns and current conditions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      <strong>Visualization:</strong> Presenting data in
                      intuitive and accessible formats
                    </span>
                  </li>
                </ul>
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
                  alt="Data processing visualization"
                  width={800}
                  height={600}
                  className="object-cover aspect-video"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Data Quality Assurance
              </h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
                We maintain rigorous quality control measures to ensure the
                accuracy and reliability of our weather data.
              </p>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">
                  Quality Control Measures
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Regular calibration of measurement instruments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Cross-validation between multiple data sources</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Automated error detection algorithms</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Manual review by meteorological experts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>
                      Continuous improvement based on forecast verification
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Data Transparency</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Clear documentation of data sources</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Timestamp information for all data points</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Confidence levels for forecasts and predictions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Open access to historical data archives</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>Regular publication of accuracy metrics</span>
                  </li>
                </ul>
              </div>
            </motion.div>
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
                Experience Our Data in Action
              </h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Access our weather dashboard to see how we transform raw data
                into actionable insights.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
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
