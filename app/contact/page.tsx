"use client";

import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ContactPage() {
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
                Contact Us
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Have questions about our weather dashboard? We're here to help.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Contact Information
                  </h2>
                  <p className="text-muted-foreground md:text-lg">
                    Reach out to us through any of the following channels:
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Email</h3>
                      <p className="text-muted-foreground">
                        info@bdweather.org
                      </p>
                      <p className="text-muted-foreground">
                        support@bdweather.org
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Phone</h3>
                      <p className="text-muted-foreground">+880 2 123 4567</p>
                      <p className="text-muted-foreground">+880 1 987 6543</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Office Location</h3>
                      <p className="text-muted-foreground">123 Weather Tower</p>
                      <p className="text-muted-foreground">Dhaka, Bangladesh</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Support Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM
                      </p>
                      <p className="text-muted-foreground">
                        Saturday: 10:00 AM - 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl font-bold">Send Us a Message</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </p>
                </div>

                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="first-name"
                        className="text-sm font-medium leading-none"
                      >
                        First name
                      </label>
                      <Input
                        id="first-name"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last-name"
                        className="text-sm font-medium leading-none"
                      >
                        Last name
                      </label>
                      <Input
                        id="last-name"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium leading-none"
                    >
                      Phone (optional)
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium leading-none"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="What is your message about?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message"
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            </div>
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
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Find answers to common questions about our weather dashboard.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl mt-12 grid gap-6">
              <motion.div
                className="rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-2">
                  How accurate is your weather data?
                </h3>
                <p className="text-muted-foreground">
                  Our weather data is sourced from multiple reliable sources
                  including the Bangladesh Meteorological Department and
                  international weather networks. We maintain rigorous quality
                  control measures to ensure accuracy, with typical forecast
                  accuracy of 85-90% for 24-hour forecasts.
                </p>
              </motion.div>

              <motion.div
                className="rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-2">
                  How often is the weather data updated?
                </h3>
                <p className="text-muted-foreground">
                  Our weather data is updated hourly for current conditions and
                  multiple times per day for forecasts. Severe weather alerts
                  are issued in real-time as they become available.
                </p>
              </motion.div>

              <motion.div
                className="rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-2">
                  Can I access historical weather data?
                </h3>
                <p className="text-muted-foreground">
                  Yes, our dashboard provides access to historical weather data
                  for all regions of Bangladesh. You can view and analyze data
                  from the past decades to identify trends and patterns.
                </p>
              </motion.div>

              <motion.div
                className="rounded-lg border bg-background p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-2">
                  Is there an API available for developers?
                </h3>
                <p className="text-muted-foreground">
                  Yes, we offer an API for developers who want to integrate our
                  weather data into their applications. Please contact our
                  support team for API documentation and access credentials.
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
                Ready to Experience Our Weather Dashboard?
              </h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Access comprehensive weather data for Bangladesh today.
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
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
