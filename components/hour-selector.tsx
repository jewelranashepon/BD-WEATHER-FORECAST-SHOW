"use client";

import { useHour } from "@/contexts/hourContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Circle, CircleCheck, Clock } from "lucide-react";
import { cn, utcToHour } from "@/lib/utils";
import { TimeInfo } from "@/lib/data-type";



const HourSelector = ({
  type,
  timeInfo,
}: {
  type: "first" | "second";
  timeInfo: TimeInfo[];
}) => {
  const {
    selectedHour,
    setSelectedHour,
    firstCardError,
    secondCardError,
    isLoading,
    clearError,
  } = useHour();

  // Function to check if a specific hour exists in timeInfo
  const hasTimeEntry = (hour: string) => {
    if(type == "second") {
      return timeInfo.some((item) => {
        const utcHour = utcToHour(item.utcTime.toString());
        return utcHour === hour && item.hasWeatherObservation;
      });
    }

    if(type == "first") {
      return timeInfo.some((item) => {
        const utcHour = utcToHour(item.utcTime.toString());
        return utcHour === hour && item.hasMeteorologicalEntry;
      });
    }
  };

  const handleHourChange = (value: string) => {
    if (!value) {
      return;
    }
    clearError();
    setSelectedHour(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg border ring-2 ring-blue-500 ring-offset-4 border-blue-500/20 mb-6 flex flex-col gap-4 shadow-lg w-full items-center justify-center min-h-[200px] max-w-lg">
      <div className="flex-col flex gap-4 justify-center items-center">
        <label className="flex items-center text-lg font-bold text-blue-500">
          <Clock className="size-5 mr-2" />
          <span>UTC HOUR</span>
        </label>
        <Select
          onValueChange={handleHourChange}
          disabled={isLoading}
          value={selectedHour}
        >
          <SelectTrigger
            className={cn(
              "text-lg font-medium py-6 px-8 shadow-xs shadow-blue-500 border border-blue-500",
              {
                "border-red-500": firstCardError || secondCardError,
              }
            )}
          >
            <SelectValue
              placeholder={isLoading ? "Loading..." : "Observing Time"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="00" className="text-lg">
              {hasTimeEntry("00") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              00&nbsp;
              <span className="text-muted-foreground text-sm">(12:00 AM)</span>
            </SelectItem>
            <SelectItem value="03" className="text-lg">
              {hasTimeEntry("03") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              03&nbsp;
              <span className="text-muted-foreground text-sm">(3:00 AM)</span>
            </SelectItem>
            <SelectItem value="06" className="text-lg">
              {hasTimeEntry("06") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              06&nbsp;
              <span className="text-muted-foreground text-sm">(6:00 AM)</span>
            </SelectItem>
            <SelectItem value="09" className="text-lg">
              {hasTimeEntry("09") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              09&nbsp;
              <span className="text-muted-foreground text-sm">(9:00 AM)</span>
            </SelectItem>
            <SelectItem value="12" className="text-lg">
              {hasTimeEntry("12") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              12&nbsp;
              <span className="text-muted-foreground text-sm">(12:00 PM)</span>
            </SelectItem>
            <SelectItem value="15" className="text-lg">
              {hasTimeEntry("15") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              15&nbsp;
              <span className="text-muted-foreground text-sm">(3:00 PM)</span>
            </SelectItem>
            <SelectItem value="18" className="text-lg">
              {hasTimeEntry("18") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              18&nbsp;
              <span className="text-muted-foreground text-sm">(6:00 PM)</span>
            </SelectItem>
            <SelectItem value="21" className="text-lg">
              {hasTimeEntry("21") ? (
                <CircleCheck className="size-5 stroke-1.5 text-blue-500" />
              ) : (
                <Circle className="size-5 stroke-1.5 text-slate-200" />
              )}
              21&nbsp;
              <span className="text-muted-foreground text-sm">(9:00 PM)</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "first" && firstCardError && (
        <p className="text-red-500 font-medium text-lg">{firstCardError}</p>
      )}
      {type === "second" && secondCardError && (
        <p className="text-red-500 font-medium text-lg">{secondCardError}</p>
      )}
    </div>
  );
};

export default HourSelector;
