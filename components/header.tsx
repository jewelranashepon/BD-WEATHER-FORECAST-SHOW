"use client";

import Link from "next/link";
import { Cloud, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
        isScrolled ? "bg-background/95 border-b shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">BD Weather</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/features") ? "text-primary" : "text-foreground"
            }`}
          >
            Features
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-foreground"
            }`}
          >
            About
          </Link>
          <Link
            href="/data-sources"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/data-sources") ? "text-primary" : "text-foreground"
            }`}
          >
            Data Sources
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/contact") ? "text-primary" : "text-foreground"
            }`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden md:block">
            <Button>Access Dashboard</Button>
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
            <div className="border-b bg-background">
              <nav className="container flex flex-col py-4 gap-2">
                <Link
                  href="/"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isActive("/")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/features"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isActive("/features")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/about"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isActive("/about")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/data-sources"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isActive("/data-sources")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Data Sources
                </Link>
                <Link
                  href="/contact"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isActive("/contact")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
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
                  <Button className="w-full">Access Dashboard</Button>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
