"use client";

import { motion } from "framer-motion";
import { Users, MapPin, BarChart3 } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="relative w-full py-16  bg-gradient-to-b from-white to-cyan-50 dark:from-gray-900 dark:to-cyan-950/20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-40 left-10 w-72 h-72 rounded-full bg-cyan-200/20 dark:bg-cyan-800/10 blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 rounded-full bg-blue-200/20 dark:bg-blue-800/10 blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="inline-block rounded-lg bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 text-sm text-cyan-600 dark:text-cyan-400">
            Testimonials
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
            Trusted by Professionals Across Bangladesh
          </h2>
          <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            See what our users have to say about our weather dashboard.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            className="flex flex-col space-y-4 rounded-xl border border-cyan-100 dark:border-cyan-900/50 bg-white dark:bg-gray-800 p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">
                  Dr. Rahman
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Agricultural Scientist
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "The rainfall forecasting has been instrumental in helping farmers
              in our region plan their planting and harvesting schedules. The
              accuracy is impressive."
            </p>
            <div className="flex text-amber-400">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col space-y-4 rounded-xl border border-cyan-100 dark:border-cyan-900/50 bg-white dark:bg-gray-800 p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">
                  Fatima Begum
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Emergency Response Coordinator
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "The early warning system for cyclones has been a game-changer for
              our coastal communities. We've been able to evacuate people well
              in advance of severe weather events."
            </p>
            <div className="flex text-amber-400">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col space-y-4 rounded-xl border border-cyan-100 dark:border-cyan-900/50 bg-white dark:bg-gray-800 p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">
                  Mohammed Ali
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Research Analyst
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "The historical data analysis tools have been invaluable for our
              climate change research. We can now identify long-term trends with
              much greater precision."
            </p>
            <div className="flex text-amber-400">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-800 -z-10">
        <svg
          className="absolute -top-16 w-full h-16 text-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-800 fill-current"
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
        >
          <path d="M0 22L60 16.7C120 11 240 1.00001 360 0.700012C480 1.00001 600 11 720 16.7C840 22 960 22 1080 16.7C1200 11 1320 1.00001 1380 0.700012L1440 0.700012V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" />
        </svg>
      </div>
    </section>
  );
}
