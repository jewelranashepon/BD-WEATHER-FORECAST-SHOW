"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="relative w-full py-24 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-800 text-white overflow-hidden">
      {/* Blurred Background Lights */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-32 left-10 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[140px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Unlock Smarter Weather Decisions
            </h2>
            <p className="mt-4 max-w-xl text-white/90 text-lg md:text-xl leading-relaxed">
              Access our real-time weather dashboard tailored for every district
              in Bangladesh. Stay ahead with forecasts, alerts, and insights
              that matter.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center md:justify-end"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-cyan-700 hover:bg-blue-50 hover:text-blue-700 font-semibold px-8 py-6 text-base shadow-md hover:shadow-xl transition duration-300 group"
              >
                Get Started
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
