"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart,
  Menu,
  ChevronLeft,
  Binoculars,
  CloudHail,
  Users,
  CloudFog,
  Monitor,
  Settings,
  PencilIcon,
  Eye,
  FileBarChart,
  X,
  Leaf,
  Code2,
  BarChart2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const role = session?.user?.role;
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isMobileOpen
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
    if (!isMobileOpen && window.innerWidth < 768) {
      setIsCollapsed(false);
    }
  };

  const sidebarLinks = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      roles: ["super_admin", "observer", "station_admin"],
    },
    {
      href: "/dashboard/view-and-manage/first-card-view",
      icon: <CloudHail className="w-5 h-5" />,
      label: "First Card",
      roles: ["observer", "station_admin", "super_admin"],
    },
    {
      href: "/dashboard/view-and-manage/second-card-view",
      icon: <Binoculars className="w-5 h-5" />,
      label: "Second Card",
      roles: ["observer", "station_admin", "super_admin"],
    },
    {
      href: "/dashboard/view-and-manage/synoptic-code",
      icon: <Code2 className="w-5 h-5" />,
      label: "Synoptic Code",
      roles: ["observer", "station_admin", "super_admin"],
    },
    {
      href: "/dashboard/view-and-manage/daily-summery",
      icon: <BarChart className="w-5 h-5" />,
      label: "Daily Summary",
      roles: ["observer", "station_admin", "super_admin"],
    },
    {
      href: "/dashboard/view-and-manage/agroclimatological-data-table",
      icon: <Leaf className="w-5 h-5" />,
      label: "Agroclimatological",
      roles: ["observer", "station_admin", "super_admin"],
    },
    {
      href: "/dashboard/view-and-manage/all",
      icon: <FileBarChart className="w-5 h-5" />,
      label: "View all & Export",
      roles: ["observer", "station_admin", "super_admin"],
    },
   
    // {
    //   href: "/dashboard/user",
    //   icon: <Users className="w-5 h-5" />,
    //   label: "User Management",
    //   roles: ["super_admin", "station_admin"],
    // },
    // {
    //   href: "/dashboard/stations",
    //   icon: <CloudFog className="w-5 h-5" />,
    //   label: "Station Management",
    //   roles: ["super_admin"],
    // },
    // {
    //   href: "/dashboard/settings",
    //   icon: <Settings className="w-5 h-5" />,
    //   label: "Settings",
    //   roles: ["super_admin"],
    // },
  ];

  return (
    <>
      <div className="md:hidden fixed top-4 left-4">
        <Button
          onClick={toggleMobileSidebar}
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div
        ref={sidebarRef}
        className={cn(
          "bg-sky-700 text-white h-full transition-all duration-300 ease-in-out shrink-0",
          "fixed md:relative z-40 flex flex-col",
          "border-r border-sky-800",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full md:translate-x-0"
        )}
        style={{ height: "100vh", top: 0, left: 0 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-sky-800 z-40 bg-sky-700">
          {(!isCollapsed || isMobileOpen) && (
            <h2 className="text-lg font-bold whitespace-nowrap">BD Weather</h2>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-1 rounded-md hover:bg-sky-600 transition-colors"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-1 rounded-md hover:bg-sky-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden z-30">
          {sidebarLinks.map((link) => {
            if (!link.roles.includes(role as string)) return null;

            return (
              <div key={link.href} className="relative z-30">
                <Link href={link.href} onClick={() => setIsMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center gap-3 justify-start",
                      "px-3 py-2 rounded-md",
                      "text-white hover:bg-white hover:text-sky-800",
                      pathname === link.href && "bg-sky-600 text-white"
                    )}
                  >
                    <span
                      className={cn(
                        pathname === link.href ? "text-white" : "text-sky-200"
                      )}
                    >
                      {link.icon}
                    </span>
                    {!isCollapsed && (
                      <motion.span
                        className="whitespace-nowrap"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </Button>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9] md:hidden backdrop-blur-sm shrink-0"
          onClick={toggleMobileSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;