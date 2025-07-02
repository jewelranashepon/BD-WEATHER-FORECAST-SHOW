"use client";

import { motion } from "framer-motion";

export default function TrustedBySection() {
  const partners = [
    "Bangladesh Met Dept",
    "Ministry of Agriculture",
    "Dhaka University",
    "ICIMOD",
    "World Bank",
  ];

  return (
    <section className="relative w-full pb-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
            Trusted by
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Leading Institutions & Global Partners
          </h2>
          <p className="max-w-xl text-gray-500 dark:text-gray-400 text-sm md:text-base">
            We proudly collaborate with esteemed organizations to deliver
            reliable and innovative weather solutions across Bangladesh and
            beyond.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {partners.map((name, idx) => (
              <motion.div
                key={idx}
                className="px-5 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm shadow-sm border border-gray-200 dark:border-gray-700 transition-all"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(6,182,212,0.05)",
                  boxShadow:
                    "0 10px 15px -3px rgba(6,182,212,0.1), 0 4px 6px -2px rgba(6,182,212,0.05)",
                }}
                transition={{ duration: 0.25 }}
              >
                {name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
