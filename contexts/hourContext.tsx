"use client";

import { MeteorologicalEntry } from "@prisma/client";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

type TimeData = {
  allowFirstCard?: boolean;
  allowSecondCard?: boolean;
  message?: string;
  time?: string;
  yesterday: {
    meteorologicalEntry: MeteorologicalEntry[] | [];
  };
};

type HourContextType = {
  selectedHour: string;
  setSelectedHour: (hour: string) => void;
  timeData: TimeData | null;
  firstCardError: string;
  secondCardError: string;
  isLoading: boolean;
  clearError: () => void;
  resetStates: () => void;
  isHourSelected: boolean;
};

const HourContext = createContext<HourContextType | undefined>(undefined);

export function HourProvider({ children }: { children: ReactNode }) {
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [firstCardError, setFirstCardError] = useState<string>("");
  const [secondCardError, setSecondCardError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const path = usePathname();

  // Reset states on pathchange
  useEffect(() => {
    setSelectedHour("");
    setTimeData(null);
    setFirstCardError("");
    setSecondCardError("");
    setIsLoading(false);
  }, [path]);

  // Call the fetch
  useEffect(() => {
    if (!selectedHour) {
      return;
    }

    // Fetching time data
    const fetchTime = async () => {
      try {
        setIsLoading(true);
        setFirstCardError("");
        setSecondCardError("");
        const response = await fetch(`/api/time-check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hour: selectedHour }),
        });

        const data = await response.json();

        if (data.error) {
          toast.error(data.message);
        }

        // Check if first card is allowed
        if (!data.allowFirstCard) {
          setFirstCardError(data.message);
        }

        // Check if second card is allowed
        if (!data.allowSecondCard) {
          setSecondCardError(data.message);
        }

        setTimeData(data);
      } catch (err) {
        setFirstCardError(err instanceof Error ? err.message : String(err));
        setSecondCardError(err instanceof Error ? err.message : String(err));
        setTimeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTime();
  }, [selectedHour]);

  const clearError = () => {
    setFirstCardError("");
    setSecondCardError("");
  };

  const resetStates = () => {
    setSelectedHour("");
    setTimeData(null);
    setFirstCardError("");
    setSecondCardError("");
    setIsLoading(false);
  };

  const value = {
    selectedHour,
    setSelectedHour,
    timeData,
    firstCardError,
    secondCardError,
    isLoading,
    clearError,
    resetStates,
    isHourSelected: selectedHour !== "",
  };

  return <HourContext.Provider value={value}>{children}</HourContext.Provider>;
}

export function useHour() {
  const context = useContext(HourContext);
  if (context === undefined) {
    throw new Error("useHour must be used within a HourProvider");
  }
  return context;
}
