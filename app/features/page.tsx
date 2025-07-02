"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CloudRain,
  Compass,
  Droplets,
  Gauge,
  Map,
  Thermometer,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function FeaturesPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
                Features
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Comprehensive Weather Monitoring Tools
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Explore the powerful features of our weather dashboard designed
                specifically for Bangladesh's unique climate.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Thermometer className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Temperature Monitoring</h3>
                  <p className="text-muted-foreground">
                    Real-time temperature data across Bangladesh with historical
                    comparisons and trend analysis.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      High/low temperature alerts
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Temperature heatmaps
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Historical temperature data
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CloudRain className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Rainfall Analysis</h3>
                  <p className="text-muted-foreground">
                    Detailed precipitation data with forecasts and historical
                    patterns for agricultural planning.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Rainfall intensity monitoring
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Seasonal rainfall predictions
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Flood risk assessment
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Wind className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Wind Conditions</h3>
                  <p className="text-muted-foreground">
                    Monitor wind speed and direction with interactive
                    visualizations and historical comparisons.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Wind direction visualization
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Storm warnings
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Cyclone tracking
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Humidity Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor humidity levels across different regions with
                    comfort index calculations.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Relative humidity monitoring
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Dew point calculations
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Heat index warnings
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Atmospheric Pressure</h3>
                  <p className="text-muted-foreground">
                    Track barometric pressure changes to predict weather shifts
                    and storm formations.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Pressure trend analysis
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Storm prediction
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Weather pattern forecasting
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Interactive Maps</h3>
                  <p className="text-muted-foreground">
                    Detailed interactive maps with regional weather data and
                    customizable layers.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      District-level data
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Customizable map layers
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Zoom and pan capabilities
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Seasonal Forecasts</h3>
                  <p className="text-muted-foreground">
                    Long-term seasonal forecasts to help with agricultural
                    planning and disaster preparedness.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Monsoon predictions
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Drought forecasting
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Seasonal temperature trends
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Data Analytics</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics tools for weather data interpretation and
                    trend analysis.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Customizable charts and graphs
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Data export capabilities
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      Comparative analysis tools
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-3xl text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to experience these features?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Access our comprehensive weather dashboard and start exploring
                Bangladesh's weather patterns today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
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
