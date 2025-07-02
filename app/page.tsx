"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Cloud, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Link from "next/link";

// Import components for each section
import HeroSection from "@/components/sections/hero-section";
import TrustedBySection from "@/components/sections/trusted-by-section";
import FeaturesSection from "@/components/sections/features-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import WeatherAlertsSection from "@/components/sections/weather-alerts-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import CtaSection from "@/components/sections/cta-section";
import Footer from "@/components/footer";

export default function LandingPage() {
  // Header state
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 border-b shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
              <Cloud className="h-8 w-8 text-white absolute inset-0" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
              BD Weather
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                isActive("/")
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Home
            </Link>
            <Link
              href="/features"
              className={`text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                isActive("/features")
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Features
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                isActive("/about")
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              About
            </Link>
            <Link
              href="/data-sources"
              className={`text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                isActive("/data-sources")
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Data Sources
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                isActive("/contact")
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden md:block">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-b bg-white dark:bg-gray-900">
                <nav className="container flex flex-col py-4 gap-2">
                  <Link
                    href="/"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive("/")
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/features"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive("/features")
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/about"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive("/about")
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/data-sources"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive("/data-sources")
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Data Sources
                  </Link>
                  <Link
                    href="/contact"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive("/contact")
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    href="/dashboard"
                    className="mt-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                      Access Dashboard
                    </Button>
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* All sections as components */}
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <WeatherAlertsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
